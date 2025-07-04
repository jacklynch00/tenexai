from typing import Dict, Any
from sqlalchemy.orm import Session
from app.database import JobAnalysis
from app.openai_service import analyze_job_description as openai_analyze
import logging

logger = logging.getLogger(__name__)

class AnalysisService:
    async def analyze_job_description(
        self, 
        job_description: str, 
        industry: str, 
        user_email: str | None,
        db: Session
    ) -> tuple[int, Dict[str, Any]]:
        """
        Analyze job description and save to database.
        Returns: (analysis_id, analysis_data)
        """
        try:
            # Analyze job description using OpenAI
            analysis_data = await openai_analyze(job_description, industry)
            
            # Save to database
            db_analysis = JobAnalysis(
                job_description=job_description,
                user_email=user_email,
                industry=industry,
                analysis_result=analysis_data
            )
            db.add(db_analysis)
            db.commit()
            db.refresh(db_analysis)
            
            return db_analysis.id, analysis_data
            
        except Exception as e:
            logger.error(f"Analysis error: {str(e)}")
            db.rollback()
            raise