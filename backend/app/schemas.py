from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class Industry(str, Enum):
    ENERGY = "Energy"
    MATERIALS = "Materials"
    INDUSTRIALS = "Industrials"
    CONSUMER_DISCRETIONARY = "Consumer Discretionary"
    CONSUMER_STAPLES = "Consumer Staples"
    HEALTH_CARE = "Health Care"
    FINANCIALS = "Financials"
    INFORMATION_TECHNOLOGY = "Information Technology"
    COMMUNICATION_SERVICES = "Communication Services"
    UTILITIES = "Utilities"
    REAL_ESTATE = "Real Estate"

class AnalyzeRequest(BaseModel):
    job_description: str
    user_email: Optional[str] = None
    industry: Industry
    session_id: Optional[str] = None

class TaskBreakdown(BaseModel):
    task_name: str
    description: str
    automation_potential: float
    estimated_time_savings_hours_per_week: float
    estimated_annual_savings: float
    automation_approach: str
    implementation_difficulty: str

class ExecutiveSummary(BaseModel):
    total_annual_savings: float
    automation_potential_percentage: float
    payback_period_months: float
    implementation_complexity: str

class AutomationWorkflow(BaseModel):
    current_process: List[str]
    automated_process: List[str]
    ai_integration_points: List[str]

class ROIAnalysis(BaseModel):
    current_annual_cost: float
    automation_implementation_cost: float
    annual_savings: float
    net_savings_year_1: float
    net_savings_year_3: float
    roi_percentage: float

class ImplementationPhase(BaseModel):
    phase: str
    timeline: str
    tasks: List[str]
    estimated_savings: float
    complexity: str

class Analysis(BaseModel):
    executive_summary: ExecutiveSummary
    task_breakdown: List[TaskBreakdown]
    automation_workflow: AutomationWorkflow
    roi_analysis: ROIAnalysis
    implementation_roadmap: List[ImplementationPhase]

class AnalyzeResponse(BaseModel):
    id: int
    analysis: Analysis