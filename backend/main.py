from fastapi import FastAPI, Response, status, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import os
import json
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import with error handling
try:
    from app.database import get_db, engine, Base
    DATABASE_AVAILABLE = engine is not None
except Exception as e:
    print(f"Database import failed: {e}")
    DATABASE_AVAILABLE = False

try:
    from app.schemas import Analysis, AnalyzeRequest, AnalyzeResponse
    from app.services.analysis_service import AnalysisService
    from app.services.email_service import EmailService
    SERVICES_AVAILABLE = True
    
    # Initialize services
    analysis_service = AnalysisService()
    email_service = EmailService()
except Exception as e:
    print(f"Services import failed: {e}")
    SERVICES_AVAILABLE = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting AI Opportunity Scanner API...")
    
    # Create tables if database is available
    if DATABASE_AVAILABLE:
        try:
            Base.metadata.create_all(bind=engine)
            print("Database tables created successfully")
        except Exception as e:
            print(f"Failed to create database tables: {e}")
    
    yield
    
    # Shutdown
    print("Shutting down AI Opportunity Scanner API...")

app = FastAPI(title="AI Opportunity Scanner API", version="1.0.0", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def simple_health_check():
    return "OK"

@app.get("/")
async def root():
    return {"message": "AI Opportunity Scanner API", "status": "running"}

@app.get("/api/health")
async def health_check():
    data = {
        "status": "healthy", 
        "message": "AI Opportunity Scanner API is running",
    }
    return Response(
        content=json.dumps(data),
        status_code=status.HTTP_200_OK,
        media_type="application/json"
    )

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_job_description_endpoint(
    request: AnalyzeRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    try:
        # Validate job description length
        if len(request.job_description.strip()) < 50:
            raise HTTPException(status_code=400, detail="Job description must be at least 50 characters long")
        
        # Use analysis service to analyze and save
        analysis_id, analysis_data = await analysis_service.analyze_job_description(
            job_description=request.job_description,
            industry=request.industry,
            user_email=request.user_email,
            db=db
        )
        
        # Send email asynchronously if email provided
        if request.user_email:
            background_tasks.add_task(
                email_service.send_analysis_email,
                to_email=request.user_email,
                analysis_id=analysis_id,
                analysis_data=analysis_data,
                frontend_url=os.getenv("FRONTEND_URL", "http://localhost:3000"),
                session_id=request.session_id
            )
            logger.info(f"Email task queued for {request.user_email}")
        
        # Convert analysis_data to Analysis model
        analysis = Analysis(**analysis_data)
        
        return AnalyzeResponse(
            id=analysis_id,
            analysis=analysis
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during analysis")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)