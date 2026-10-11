import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Bulk Certificate Generator"
    API_V1_STR: str = "/api/v1"
    
    # Database Configuration - defaults to local sqlite for easiest local testing
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cert_db.db")
    
    # Local Storage Configuration
    LOCAL_STORAGE_DIR: str = os.getenv("LOCAL_STORAGE_DIR", "storage/certificates")
    
    # App Settings (allows generating up to 1,000,000 / 10 lakhs certificates in a batch)
    MAX_BATCH_SIZE: int = 1000000
    WORKER_CONCURRENCY: int = 5
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

