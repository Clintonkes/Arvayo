from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.schemas import (
    Token, AdminUserOut, ServiceCreate, ServiceUpdate, ServiceOut,
    OrderOut, OrderStatusUpdate, MetricsOut, OrdersPage, CustomerSummary
)
from app.crud.crud import (
    get_admin_user_by_email, get_orders, get_order, update_order_status,
    delete_order, get_services, get_service, create_service, update_service,
    delete_service, get_metrics, get_customers
)
from app.utils.auth import verify_password, create_access_token, get_current_admin
from app.models.models import AdminUser, OrderStatus
import csv
import io

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ─── Auth ─────────────────────────────────────────────────────────────────────

@router.post("/auth/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    user = await get_admin_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user.email})
    return Token(access_token=token, token_type="bearer")


@router.get("/auth/me", response_model=AdminUserOut)
async def get_me(current_user: AdminUser = Depends(get_current_admin)):
    return AdminUserOut.model_validate(current_user)


# ─── Metrics ─────────────────────────────────────────────────────────────────

@router.get("/metrics", response_model=MetricsOut)
async def dashboard_metrics(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    return await get_metrics(db)


# ─── Orders ───────────────────────────────────────────────────────────────────

@router.get("/orders", response_model=OrdersPage)
async def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[OrderStatus] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    orders, total = await get_orders(db, skip=skip, limit=limit, status=status, search=search)
    return OrdersPage(
        items=[OrderOut.model_validate(o) for o in orders],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/orders/{order_id}", response_model=OrderOut)
async def get_order_detail(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    order = await get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderOut.model_validate(order)


@router.patch("/orders/{order_id}/status", response_model=OrderOut)
async def update_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    order = await update_order_status(db, order_id, data.status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderOut.model_validate(order)


@router.delete("/orders/{order_id}", status_code=204)
async def remove_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    if not await delete_order(db, order_id):
        raise HTTPException(status_code=404, detail="Order not found")


# ─── Customers ────────────────────────────────────────────────────────────────

@router.get("/customers", response_model=list[CustomerSummary])
async def list_customers(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    return await get_customers(db)


# ─── Services ─────────────────────────────────────────────────────────────────

@router.get("/services", response_model=list[ServiceOut])
async def admin_list_services(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    return await get_services(db, active_only=False)


@router.post("/services", response_model=ServiceOut, status_code=201)
async def admin_create_service(
    data: ServiceCreate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    return await create_service(db, data)


@router.put("/services/{service_id}", response_model=ServiceOut)
async def admin_update_service(
    service_id: int,
    data: ServiceUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    service = await update_service(db, service_id, data)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.delete("/services/{service_id}", status_code=204)
async def admin_delete_service(
    service_id: int,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    if not await delete_service(db, service_id):
        raise HTTPException(status_code=404, detail="Service not found")


# ─── Reports ─────────────────────────────────────────────────────────────────

@router.get("/reports/export")
async def export_orders_csv(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    orders, _ = await get_orders(db, skip=0, limit=10000)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Order Number", "Status", "Customer Name", "Email", "Phone",
        "Service", "Scheduled Date", "Scheduled Time",
        "Address", "City", "State", "ZIP",
        "Bedrooms", "Bathrooms", "Pets", "Total Price", "Created At"
    ])
    for o in orders:
        writer.writerow([
            o.order_number, o.status.value, o.customer_name, o.customer_email,
            o.customer_phone, o.service.name if o.service else "",
            str(o.scheduled_date), o.scheduled_time,
            o.address, o.city, o.state, o.zip_code,
            o.num_bedrooms, o.num_bathrooms, o.has_pets,
            float(o.total_price), str(o.created_at)
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=arvayo_orders.csv"}
    )
