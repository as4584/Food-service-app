from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "sqlite:///./shore_eats.db"
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGIN: str = "http://localhost:19006,http://localhost:8081,http://localhost:8082,http://localhost:3000"
    PUBLIC_API_BASE_URL: str = "http://localhost:8001/api/v1"


settings = Settings()
