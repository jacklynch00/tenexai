export interface AnalyzeRequest {
  job_description: string
  user_email?: string
  industry: string
  session_id?: string
}

export interface TaskBreakdown {
  task_name: string
  description: string
  automation_potential: number
  estimated_time_savings_hours_per_week: number
  estimated_annual_savings: number
  automation_approach: string
  implementation_difficulty: string
  recommended_tools: string[]
}

export interface ExecutiveSummary {
  total_annual_savings: number
  automation_potential_percentage: number
  payback_period_months: number
  implementation_complexity: string
}

export interface AutomationWorkflow {
  current_process: string[]
  automated_process: string[]
  ai_integration_points: string[]
}

export interface ROIAnalysis {
  current_annual_cost: number
  automation_implementation_cost: number
  annual_savings: number
  net_savings_year_1: number
  net_savings_year_3: number
  roi_percentage: number
}

export interface ImplementationPhase {
  phase: string
  timeline: string
  tasks: string[]
  estimated_savings: number
  complexity: string
}

export interface Analysis {
  executive_summary: ExecutiveSummary
  task_breakdown: TaskBreakdown[]
  automation_workflow: AutomationWorkflow
  roi_analysis: ROIAnalysis
  implementation_roadmap: ImplementationPhase[]
}

export interface AnalyzeResponse {
  id: number
  analysis: Analysis
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function analyzeJobDescription(data: AnalyzeRequest): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function healthCheck(): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/health`)
  
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`)
  }
  
  return response.json()
}