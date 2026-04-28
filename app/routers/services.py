from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.schemas import ServiceOut, AvailabilityOut
from app.crud.crud import get_services, get_service, get_available_slots
from datetime import date

router = APIRouter(prefix="/api/services", tags=["Services"])


@router.get("", response_model=list[ServiceOut])
async def list_services(db: AsyncSession = Depends(get_db)):
    return await get_services(db, active_only=True)


@router.get("/availability/{target_date}", response_model=AvailabilityOut)
async def check_availability(target_date: date, db: AsyncSession = Depends(get_db)):
    slots = await get_available_slots(db, target_date)
    return AvailabilityOut(date=target_date, available_slots=slots)


@router.get("/{service_id}", response_model=ServiceOut)
async def get_service_detail(service_id: int, db: AsyncSession = Depends(get_db)):
    service = await get_service(db, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service
