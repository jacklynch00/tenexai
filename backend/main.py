from fastapi import FastAPI, Response, status, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import os
import json

load_dotenv()

# Import with error handling
try:
    from app.database import JobAnalysis, get_db, engine, Base
    DATABASE_AVAILABLE = engine is not None
except Exception as e:
    print(f"Database import failed: {e}")
    DATABASE_AVAILABLE = False

try:
    from app.openai_service import analyze_job_description
    from app.schemas import Analysis, AnalyzeRequest, AnalyzeResponse
    OPENAI_AVAILABLE = True
except Exception as e:
    print(f"OpenAI service import failed: {e}")
    OPENAI_AVAILABLE = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting AI Opportunity Scanner API...")
    print(f"Database available: {DATABASE_AVAILABLE}")
    print(f"OpenAI available: {OPENAI_AVAILABLE}")
    print(f"Environment variables:")
    print(f"  OPENAI_API_KEY: {'Set' if os.getenv('OPENAI_API_KEY') else 'Missing'}")
    print(f"  DATABASE_URL: {'Set' if os.getenv('DATABASE_URL') else 'Missing'}")
    print(f"  CORS_ORIGINS: {os.getenv('CORS_ORIGINS', 'Not set')}")
    
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
async def analyze_job_description_endpoint(request: AnalyzeRequest, db: Session = Depends(get_db)):
    if not DATABASE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database not available")
    
    if not OPENAI_AVAILABLE:
        raise HTTPException(status_code=503, detail="OpenAI service not available")
    
    try:
        
        # Validate job description length
        if len(request.job_description.strip()) < 50:
            raise HTTPException(status_code=400, detail="Job description must be at least 50 characters long")
        
        # Analyze job description using OpenAI
        analysis_data = await analyze_job_description(request.job_description, request.industry)
        
        # Save to database
        db_analysis = JobAnalysis(
            job_description=request.job_description,
            user_email=request.user_email,
            industry=request.industry,
            analysis_result=analysis_data
        )
        db.add(db_analysis)
        db.commit()
        db.refresh(db_analysis)
        
        # Convert analysis_data to Analysis model
        analysis = Analysis(**analysis_data)
        
        return AnalyzeResponse(
            id=db_analysis.id,
            analysis=analysis
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error during analysis")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)