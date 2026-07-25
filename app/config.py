from urllib.parse import urlparse, urlunparse
from pydantic_settings import BaseSettings
from pydantic import field_validator, model_validator


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/arvayo_db"
    database_ssl: bool = False

    @field_validator("database_url", mode="before")
    @classmethod
    def fix_db_url_scheme(cls, v: str) -> str:
        # Render, Railway, and many PaaS providers supply DATABASE_URL as
        # "postgresql://" or "postgres://" — both map to psycopg2 by default.
        # We need the asyncpg variant for SQLAlchemy async support.
        if v.startswith("postgres://"):
            v = "postgresql+asyncpg://" + v[len("postgres://"):]
        elif v.startswith("postgresql://"):
            v = "postgresql+asyncpg://" + v[len("postgresql://"):]

        # asyncpg doesn't accept query parameters (sslmode, channel_binding,
        # etc.) via the URL. Strip them all; SSL is handled via connect_args.
        parsed = urlparse(v)
        if parsed.query:
            v = urlunparse(parsed._replace(query=""))
        return v

    @model_validator(mode="after")
    def _fix_ssl(self) -> "Settings":
        # If the original DATABASE_URL contained sslmode=require, enable SSL
        # for asyncpg (which uses connect_args, not URL params).
        import os
        raw = os.environ.get("DATABASE_URL", "")
        if "sslmode=require" in raw or "sslmode=verify-full" in raw:
            self.database_ssl = True
        return self

    secret_key: str = "change-me-in-production-use-a-long-random-string"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    # Resend email API
    resend_api_key: str = ""
    resend_from_email: str = "onboarding@resend.dev"
    resend_from_name: str = "Arvayo LLC"

    company_name: str = "Arvayo LLC"
    company_phone: str = "+1 (602) 583-8563"
    company_email: str = "arvayollc@proton.me"

    frontend_url: str = "http://localhost:5173"
    app_url: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
