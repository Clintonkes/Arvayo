from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models.models import Base
from app.routers import services, orders, admin
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (for development; use alembic for production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Arvayo LLC – Cleaning Services API",
    description="Backend API for Arvayo LLC professional cleaning services booking platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(services.router)
app.include_router(orders.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    return {
        "company": settings.company_name,
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
