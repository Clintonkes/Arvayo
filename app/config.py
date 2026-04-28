from pydantic_settings import BaseSettings
from pydantic import EmailStr


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/arvayo_db"

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
