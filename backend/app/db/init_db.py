from sqlalchemy import inspect, text
from app.db.session import engine, Base
from app.models.job import Job
from app.models.recipient import Recipient

def init_db():
    Base.metadata.create_all(bind=engine)
    
    # Inspect existing columns and auto-add any missing ones
    inspector = inspect(engine)
    existing_columns = [col["name"] for col in inspector.get_columns("generation_jobs")]
    
    columns_to_add = [
        ("certificate_title", "VARCHAR(255)"),
        ("theme_key", "VARCHAR(100)"),
        ("border_style", "VARCHAR(100)"),
        ("signatory_name", "VARCHAR(255)"),
        ("signatory_title", "VARCHAR(255)"),
        ("logo_url", "TEXT")
    ]
    
    with engine.begin() as conn:
        for col_name, col_type in columns_to_add:
            if col_name not in existing_columns:
                try:
                    conn.execute(text(f"ALTER TABLE generation_jobs ADD COLUMN {col_name} {col_type}"))
                    print(f"Added column {col_name} to generation_jobs table.")
                except Exception as e:
                    print(f"Column {col_name} could not be added (may already exist): {e}")
