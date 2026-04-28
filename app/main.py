import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.database import engine
from app.models.models import Base
from app.routers import services, orders, admin
from app.config import settings
from app.utils.seed import auto_seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await auto_seed()   # no-op after first run; idempotent
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


@app.get("/health")
async def health():
    return {"status": "healthy"}


# ── Serve React SPA ──────────────────────────────────────────────────────────
# Static assets (JS/CSS bundles) are mounted at /assets so they resolve fast.
# A catch-all GET route then returns index.html for every other path so that
# React Router handles /admin, /book, /booking-success/*, etc. client-side.
# API routes registered above always take priority over the catch-all because
# FastAPI matches routes in registration order.
_DIST = os.path.join(os.path.dirname(__file__), "..", "dist")
_DIST_ASSETS = os.path.join(_DIST, "assets")

if os.path.isdir(_DIST_ASSETS):
    app.mount("/assets", StaticFiles(directory=_DIST_ASSETS), name="assets")


@app.get("/{full_path:path}", include_in_schema=False)
async def spa_catch_all(full_path: str):
    # Serve actual files that exist (favicon.ico, robots.txt, etc.)
    candidate = os.path.join(_DIST, full_path)
    if os.path.isfile(candidate):
        return FileResponse(candidate)
    # Fall back to index.html for all SPA routes
    index = os.path.join(_DIST, "index.html")
    if os.path.isfile(index):
        return FileResponse(index)
    # No built frontend (local dev without a build)
    return {"company": settings.company_name, "status": "online", "docs": "/docs"}
