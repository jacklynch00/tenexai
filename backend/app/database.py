from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Only create engine if DATABASE_URL is provided
if DATABASE_URL:
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        print(f"Database connected successfully")
    except Exception as e:
        print(f"Database connection failed: {e}")
        engine = None
        SessionLocal = None
else:
    print("No DATABASE_URL provided")
    engine = None
    SessionLocal = None

Base = declarative_base()

class JobAnalysis(Base):
    __tablename__ = "job_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    job_description = Column(Text, nullable=False)
    user_email = Column(String(255), nullable=True)
    industry = Column(String(100), nullable=False)
    analysis_result = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Tables will be created by the entrypoint script
# Base.metadata.create_all(bind=engine)

def get_db():
    if SessionLocal is None:
        raise Exception("Database not configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()