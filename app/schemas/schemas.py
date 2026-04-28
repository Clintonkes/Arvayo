from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from app.models.models import OrderStatus


# ─── Service schemas ──────────────────────────────────────────────────────────

class ServiceBase(BaseModel):
    name: str
    description: str
    short_description: Optional[str] = None
    price: Decimal
    duration_minutes: int = 120
    icon: str = "sparkles"
    features: Optional[str] = None  # JSON string


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[Decimal] = None
    duration_minutes: Optional[int] = None
    icon: Optional[str] = None
    features: Optional[str] = None
    is_active: Optional[bool] = None


class ServiceOut(ServiceBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Order schemas ────────────────────────────────────────────────────────────

class OrderCreate(BaseModel):
    service_id: int
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    address: str
    city: str
    state: str
    zip_code: str
    property_sqft: Optional[int] = None
    num_bedrooms: int = 1
    num_bathrooms: int = 1
    has_pets: bool = False
    scheduled_date: date
    scheduled_time: str
    special_instructions: Optional[str] = None

    @field_validator("customer_phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        digits = "".join(filter(str.isdigit, v))
        if len(digits) < 10:
            raise ValueError("Phone number must have at least 10 digits")
        return v

    @field_validator("scheduled_date")
    @classmethod
    def validate_future_date(cls, v: date) -> date:
        from datetime import date as date_type
        if v < date_type.today():
            raise ValueError("Scheduled date must be in the future")
        return v


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderOut(BaseModel):
    id: int
    order_number: str
    service_id: int
    service: Optional[ServiceOut] = None
    customer_name: str
    customer_email: str
    customer_phone: str
    address: str
    city: str
    state: str
    zip_code: str
    property_sqft: Optional[int] = None
    num_bedrooms: int
    num_bathrooms: int
    has_pets: bool
    scheduled_date: date
    scheduled_time: str
    status: OrderStatus
    total_price: Decimal
    special_instructions: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Admin schemas ────────────────────────────────────────────────────────────

class AdminUserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class AdminUserOut(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# ─── Analytics schemas ─────────────────────────────────────────────────────────

class MonthlyTrend(BaseModel):
    month: str
    bookings: int
    revenue: float


class ServiceRevenue(BaseModel):
    service: str
    revenue: float
    bookings: int


class MetricsOut(BaseModel):
    today_bookings: int
    monthly_revenue: float
    pending_jobs: int
    total_orders: int
    monthly_trend: list[MonthlyTrend]
    revenue_by_service: list[ServiceRevenue]


class AvailabilityOut(BaseModel):
    date: date
    available_slots: list[str]
