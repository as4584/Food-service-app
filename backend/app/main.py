"""Shore Eats API — FastAPI application entrypoint."""
from contextlib import asynccontextmanager
from pathlib import Path

from alembic.config import Config
from alembic import command as alembic_command

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import restaurants, orders
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Migrate the database before serving."""
    alembic_path = Path(__file__).resolve().parents[1] / "alembic.ini"
    alembic_cfg = Config(str(alembic_path))
    alembic_command.upgrade(alembic_cfg, "head")
    yield


app = FastAPI(
    title="Shore Eats API",
    description="NJ shore food delivery MVP demo API",
    version="0.1.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

_allowed_origins = [o.strip() for o in settings.ALLOWED_ORIGIN.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(restaurants.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")


@app.get("/api/v1/health", tags=["health"])
def health_check():
    return {"status": "ok", "version": "0.1.0"}
