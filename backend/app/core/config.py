import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Bulk Certificate Generator"
    API_V1_STR: str = "/api/v1"
    
    # Database Configuration - defaults to local sqlite for easiest local testing
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cert_db.db")
    
    # Local Storage Configuration
    LOCAL_STORAGE_DIR: str = os.getenv("LOCAL_STORAGE_DIR", "storage/certificates")
    
    # App Settings
    MAX_BATCH_SIZE: int = 1000
    WORKER_CONCURRENCY: int = 5
    
    class Config:
        env_file = ".env"

settings = Settings()

