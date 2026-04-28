from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/arvayo_db"

    @field_validator("database_url", mode="before")
    @classmethod
    def fix_db_url_scheme(cls, v: str) -> str:
        # Railway (and many PaaS providers) supply DATABASE_URL as
        # "postgresql://" or "postgres://" — both map to psycopg2 by default.
        # We need the asyncpg variant for SQLAlchemy async support.
        if v.startswith("postgres://"):
            v = "postgresql+asyncpg://" + v[len("postgres://"):]
        elif v.startswith("postgresql://"):
            v = "postgresql+asyncpg://" + v[len("postgresql://"):]
        return v

    secret_key: str = "change-me-in-production-use-a-long-random-string"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    smtp_host: str = "smtp.protonmail.ch"
    smtp_port: int = 587
    smtp_username: str = "arvayollc@proton.me"
    smtp_password: str = ""
    from_email: str = "arvayollc@proton.me"
    from_name: str = "Arvayo LLC"

    company_name: str = "Arvayo LLC"
    company_phone: str = "+1 (602) 583-8563"
    company_email: str = "arvayollc@proton.me"

    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
