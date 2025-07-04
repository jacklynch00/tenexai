from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

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

app = FastAPI(title="AI Opportunity Scanner API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
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

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy", 
        "message": "AI Opportunity Scanner API is running",
        "database_available": DATABASE_AVAILABLE,
        "openai_available": OPENAI_AVAILABLE,
        "environment": {
            "openai_api_key": "set" if os.getenv("OPENAI_API_KEY") else "missing",
            "database_url": "set" if os.getenv("DATABASE_URL") else "missing",
            "cors_origins": os.getenv("CORS_ORIGINS", "not_set")
        }
    }

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