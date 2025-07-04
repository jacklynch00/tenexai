from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

from app.database import JobAnalysis, get_db
from app.openai_service import analyze_job_description
from app.schemas import Analysis, AnalyzeRequest, AnalyzeResponse

load_dotenv()

app = FastAPI(title="AI Opportunity Scanner API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "AI Opportunity Scanner API is running"}

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_job_description_endpoint(request: AnalyzeRequest, db: Session = Depends(get_db)):
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