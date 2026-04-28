from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.schemas import OrderCreate, OrderOut
from app.crud.crud import create_order, get_order_by_number
from app.utils.email import send_booking_confirmation

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("", response_model=OrderOut, status_code=201)
async def create_booking(
    data: OrderCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    try:
        order = await create_order(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    background_tasks.add_task(send_booking_confirmation, order)
    return order


@router.get("/{order_number}", response_model=OrderOut)
async def get_order_status(order_number: str, db: AsyncSession = Depends(get_db)):
    order = await get_order_by_number(db, order_number)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
