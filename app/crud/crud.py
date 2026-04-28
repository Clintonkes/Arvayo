import random
import string
from datetime import datetime, date, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func, and_, or_
from app.models.models import Service, Order, AdminUser, OrderStatus
from app.schemas.schemas import (
    ServiceCreate, ServiceUpdate, OrderCreate,
    AdminUserCreate, MetricsOut, MonthlyTrend, ServiceRevenue, CustomerSummary
)
from app.utils.auth import get_password_hash


def generate_order_number() -> str:
    today = datetime.utcnow().strftime("%Y%m%d")
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ARV-{today}-{suffix}"


ALL_TIME_SLOTS = [
    "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
]

# ─── Helper: load a single order with its service ─────────────────────────────

async def _load_order(db: AsyncSession, order_id: int) -> Optional[Order]:
    result = await db.execute(
        select(Order).options(selectinload(Order.service)).where(Order.id == order_id)
    )
    return result.scalar_one_or_none()


# ─── Service CRUD ─────────────────────────────────────────────────────────────

async def get_services(db: AsyncSession, active_only: bool = True) -> list[Service]:
    q = select(Service)
    if active_only:
        q = q.where(Service.is_active == True)
    result = await db.execute(q.order_by(Service.id))
    return list(result.scalars().all())


async def get_service(db: AsyncSession, service_id: int) -> Optional[Service]:
    result = await db.execute(select(Service).where(Service.id == service_id))
    return result.scalar_one_or_none()


async def create_service(db: AsyncSession, data: ServiceCreate) -> Service:
    service = Service(**data.model_dump())
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return service


async def update_service(db: AsyncSession, service_id: int, data: ServiceUpdate) -> Optional[Service]:
    service = await get_service(db, service_id)
    if not service:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    await db.commit()
    await db.refresh(service)
    return service


async def delete_service(db: AsyncSession, service_id: int) -> bool:
    service = await get_service(db, service_id)
    if not service:
        return False
    await db.delete(service)
    await db.commit()
    return True


# ─── Order CRUD ───────────────────────────────────────────────────────────────

async def get_orders(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    status: Optional[OrderStatus] = None,
    search: Optional[str] = None,
) -> tuple[list[Order], int]:
    # Build filter conditions separately so they can be reused for the count
    conditions = []
    if status:
        conditions.append(Order.status == status)
    if search:
        term = f"%{search}%"
        conditions.append(or_(
            Order.customer_name.ilike(term),
            Order.customer_email.ilike(term),
            Order.order_number.ilike(term),
            Order.customer_phone.ilike(term),
        ))

    # Count (no joins / options needed)
    count_q = select(func.count(Order.id))
    if conditions:
        count_q = count_q.where(and_(*conditions))
    total = (await db.execute(count_q)).scalar_one()

    # Data query — use selectinload so service data is in memory before
    # the session closes; avoids the async lazy-load crash in Pydantic v2
    data_q = (
        select(Order)
        .options(selectinload(Order.service))
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    if conditions:
        data_q = data_q.where(and_(*conditions))

    orders = list((await db.execute(data_q)).scalars().all())
    return orders, total


async def get_order(db: AsyncSession, order_id: int) -> Optional[Order]:
    return await _load_order(db, order_id)


async def get_order_by_number(db: AsyncSession, order_number: str) -> Optional[Order]:
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.service))
        .where(Order.order_number == order_number)
    )
    return result.scalar_one_or_none()


async def create_order(db: AsyncSession, data: OrderCreate) -> Order:
    service = await get_service(db, data.service_id)
    if not service:
        raise ValueError(f"Service {data.service_id} not found")

    order_number = generate_order_number()
    while await get_order_by_number(db, order_number):
        order_number = generate_order_number()

    order = Order(
        order_number=order_number,
        total_price=service.price,
        **data.model_dump(),
    )
    db.add(order)
    await db.commit()
    # Reload with service via selectinload
    return await _load_order(db, order.id)  # type: ignore[return-value]


async def update_order_status(db: AsyncSession, order_id: int, status: OrderStatus) -> Optional[Order]:
    order = await _load_order(db, order_id)
    if not order:
        return None
    order.status = status
    await db.commit()
    return await _load_order(db, order_id)


async def delete_order(db: AsyncSession, order_id: int) -> bool:
    order = await _load_order(db, order_id)
    if not order:
        return False
    await db.delete(order)
    await db.commit()
    return True


# ─── Admin CRUD ───────────────────────────────────────────────────────────────

async def get_admin_user_by_email(db: AsyncSession, email: str) -> Optional[AdminUser]:
    result = await db.execute(select(AdminUser).where(AdminUser.email == email))
    return result.scalar_one_or_none()


async def create_admin_user(db: AsyncSession, data: AdminUserCreate) -> AdminUser:
    user = AdminUser(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


# ─── Customer aggregation ──────────────────────────────────────────────────────

async def get_customers(db: AsyncSession) -> list[CustomerSummary]:
    result = await db.execute(
        select(
            Order.customer_name,
            Order.customer_email,
            Order.customer_phone,
            func.count(Order.id).label("total_orders"),
            func.coalesce(func.sum(Order.total_price), 0).label("total_spent"),
            func.max(Order.created_at).label("last_order"),
        )
        .group_by(Order.customer_email, Order.customer_name, Order.customer_phone)
        .order_by(func.max(Order.created_at).desc())
    )
    return [
        CustomerSummary(
            customer_name=row.customer_name,
            customer_email=row.customer_email,
            customer_phone=row.customer_phone,
            total_orders=row.total_orders,
            total_spent=float(row.total_spent),
            last_order=row.last_order,
        )
        for row in result.all()
    ]


# ─── Metrics ──────────────────────────────────────────────────────────────────

async def get_metrics(db: AsyncSession) -> MetricsOut:
    today = date.today()
    first_of_month = today.replace(day=1)

    today_bookings = (await db.execute(
        select(func.count(Order.id)).where(Order.scheduled_date == today)
    )).scalar_one() or 0

    monthly_revenue = float((await db.execute(
        select(func.coalesce(func.sum(Order.total_price), 0)).where(
            and_(
                Order.created_at >= datetime.combine(first_of_month, datetime.min.time()),
                Order.status.in_([OrderStatus.completed, OrderStatus.confirmed])
            )
        )
    )).scalar_one() or 0)

    pending_jobs = (await db.execute(
        select(func.count(Order.id)).where(Order.status == OrderStatus.pending)
    )).scalar_one() or 0

    total_orders = (await db.execute(select(func.count(Order.id)))).scalar_one() or 0

    monthly_trend = []
    for i in range(5, -1, -1):
        month_date = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        next_month = (month_date.replace(day=28) + timedelta(days=4)).replace(day=1)
        month_start = datetime.combine(month_date, datetime.min.time())
        month_end = datetime.combine(next_month, datetime.min.time())

        bookings_r = (await db.execute(
            select(func.count(Order.id)).where(
                and_(Order.created_at >= month_start, Order.created_at < month_end)
            )
        )).scalar_one() or 0

        revenue_r = float((await db.execute(
            select(func.coalesce(func.sum(Order.total_price), 0)).where(
                and_(
                    Order.created_at >= month_start,
                    Order.created_at < month_end,
                    Order.status.in_([OrderStatus.completed, OrderStatus.confirmed])
                )
            )
        )).scalar_one() or 0)

        monthly_trend.append(MonthlyTrend(
            month=month_date.strftime("%b %Y"),
            bookings=bookings_r,
            revenue=revenue_r,
        ))

    svc_result = await db.execute(
        select(
            Service.name,
            func.coalesce(func.sum(Order.total_price), 0).label("revenue"),
            func.count(Order.id).label("bookings"),
        )
        .join(Order, Order.service_id == Service.id, isouter=True)
        .group_by(Service.name)
        .order_by(func.sum(Order.total_price).desc().nullslast())
    )
    revenue_by_service = [
        ServiceRevenue(service=row.name, revenue=float(row.revenue), bookings=row.bookings)
        for row in svc_result.all()
    ]

    return MetricsOut(
        today_bookings=today_bookings,
        monthly_revenue=monthly_revenue,
        pending_jobs=pending_jobs,
        total_orders=total_orders,
        monthly_trend=monthly_trend,
        revenue_by_service=revenue_by_service,
    )


async def get_available_slots(db: AsyncSession, target_date: date) -> list[str]:
    result = await db.execute(
        select(Order.scheduled_time).where(
            and_(
                Order.scheduled_date == target_date,
                Order.status.notin_([OrderStatus.cancelled])
            )
        )
    )
    booked = {row[0] for row in result.all()}
    return [slot for slot in ALL_TIME_SLOTS if slot not in booked]
