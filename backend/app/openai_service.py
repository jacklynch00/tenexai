from app.schemas import Industry
from app.constants import (
    get_industry_base_salary,
    get_industry_complexity_multiplier,
    get_industry_productivity_range,
    get_industry_implementation_costs,
    estimate_salary_from_extracted_data,
    JOB_LEVEL_MULTIPLIERS,
    LOCATION_MULTIPLIERS
)
from openai import AsyncOpenAI
import json
import os
import re
from typing import Dict, Any, Optional, Tuple
from dotenv import load_dotenv

load_dotenv()

def extract_job_data_prompt(job_description: str) -> str:
    return f"""
Extract the following specific information from this job description. Return ONLY a JSON object with these fields:

Job Description:
{job_description}

Extract:
{{
    "salary_range": {{
        "min": <number or null>,
        "max": <number or null>,
        "currency": "<string or null>",
        "pay_frequency": "<hourly|weekly|monthly|annually or null>",
        "annualized_min": <number or null>,
        "annualized_max": <number or null>
    }},
    "job_level": "<entry|junior|mid|senior|lead|manager|director|vp|c-level or null>",
    "experience_required": {{
        "min_years": <number or null>,
        "max_years": <number or null>
    }},
    "location": "<city, state/country or 'remote' or null>",
    "job_title": "<extracted job title>",
    "department": "<department/function or null>",
    "company_size": "<startup|small|medium|large|enterprise or null>",
    "key_responsibilities": ["<responsibility 1>", "<responsibility 2>", "..."],
    "required_skills": ["<skill 1>", "<skill 2>", "..."],
    "education_level": "<high_school|associates|bachelors|masters|phd or null>"
}}

Instructions:
- Extract only information explicitly mentioned in the job description
- Use null for any field not found in the description
- For salary, look for ranges, specific amounts, or "competitive" mentions
- IMPORTANT: For salary annualization, calculate based on job context:
  * Hourly rates: Look for full-time (40h/week) vs part-time hours, days per week
  * If hourly + full-time: multiply by 2080 hours/year (40h × 52 weeks)
  * If hourly + specific hours: use those hours × 52 weeks
  * If hourly + days/week: estimate hours/day (typically 8) × days × 52 weeks
  * Weekly rates: multiply by 52 weeks
  * Monthly rates: multiply by 12 months
  * If schedule mentions "Monday to Friday" + "8 hour shift" = 40 hours/week
- For job level, infer from title and requirements (e.g., "Senior" = senior, "Manager" = manager)
- For location, extract city/state or note if remote/hybrid is mentioned
- Be precise and don't make assumptions beyond what's written

Return ONLY the JSON object, no additional text.
"""

def create_analysis_prompt(job_description: str, industry: Industry, extracted_data: Dict[str, Any]) -> str:
    return f"""
You are an expert AI automation consultant specializing in manufacturing operations. Analyze the following job description and provide specific, actionable AI automation recommendations.

Job Description:
{job_description}

Industry: {industry}

Extracted Job Data:
{json.dumps(extracted_data, indent=2)}

Please provide a comprehensive analysis in the following JSON format. Use the extracted job data to make your recommendations more accurate and specific:

{{
    "executive_summary": {{
        "total_annual_savings": <number>,
        "automation_potential_percentage": <number 0-100>,
        "payback_period_months": <number>,
        "implementation_complexity": "<Low|Medium|High>"
    }},
    "task_breakdown": [
        {{
            "task_name": "<specific task name>",
            "description": "<detailed description of the task>",
            "automation_potential": <number 0-100>,
            "estimated_time_savings_hours_per_week": <number>,
            "estimated_annual_savings": <number>,
            "automation_approach": "<specific approach like RPA, AI-ML, etc>",
            "implementation_difficulty": "<Low|Medium|High>"
        }}
    ],
    "automation_workflow": {{
        "current_process": ["<step 1>", "<step 2>", "<step 3>"],
        "automated_process": ["<automated step 1>", "<automated step 2>", "<automated step 3>"],
        "ai_integration_points": ["<integration point 1>", "<integration point 2>"]
    }},
    "roi_analysis": {{
        "current_annual_cost": <number>,
        "automation_implementation_cost": <number>,
        "annual_savings": <number>,
        "net_savings_year_1": <number>,
        "net_savings_year_3": <number>,
        "roi_percentage": <number>
    }},
    "implementation_roadmap": [
        {{
            "phase": "<Phase name>",
            "timeline": "<timeframe>",
            "tasks": ["<task 1>", "<task 2>"],
            "estimated_savings": <number>,
            "complexity": "<Low|Medium|High>"
        }}
    ]
}}

Guidelines:
1. Focus on realistic, implementable automation opportunities
2. Consider the specific {industry} industry context and requirements
3. Calculate ROI based on time savings and implementation costs
4. IMPORTANT: Use annualized salary data from extracted_data for accurate cost calculations:
   - If annualized_min/max are available, use those for current_annual_cost
   - Factor in the actual salary when calculating time savings value
   - Consider the job level and experience when estimating automation value
5. Ensure task breakdown covers the most automatable aspects of the role
6. Implementation roadmap should be practical with clear phases
7. Be specific about automation approaches (not generic)
8. Make ROI calculations realistic based on the actual compensation level

Return ONLY the JSON response, no additional text.
"""

async def extract_job_data(job_description: str) -> Dict[str, Any]:
    """Extract structured data from job description using AI."""
    try:
        # Initialize client with only API key
        import httpx
        client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            http_client=httpx.AsyncClient(proxies=None)
        )
        
        extraction_prompt = extract_job_data_prompt(job_description)
        
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a data extraction specialist. Extract job information accurately and return only valid JSON."},
                {"role": "user", "content": extraction_prompt}
            ],
            temperature=0.1,  # Lower temperature for more consistent extraction
            max_tokens=1000
        )
        
        extracted_text = response.choices[0].message.content.strip()
        extracted_data = json.loads(extracted_text)
        
        return extracted_data
        
    except Exception as e:
        print(f"Error extracting job data: {e}")
        # Return default structure if extraction fails
        return {
            "salary_range": {"min": None, "max": None, "currency": None},
            "job_level": None,
            "experience_required": {"min_years": None, "max_years": None},
            "location": None,
            "job_title": "Unknown Position",
            "department": None,
            "company_size": None,
            "key_responsibilities": [],
            "required_skills": [],
            "education_level": None
        }

def calculate_realistic_salary(extracted_data: Dict[str, Any], industry: str) -> int:
    """Calculate realistic salary based on extracted data and industry averages."""
    
    # If salary is explicitly mentioned, use the midpoint
    salary_range = extracted_data.get("salary_range", {})
    if salary_range.get("min") and salary_range.get("max"):
        return int((salary_range["min"] + salary_range["max"]) / 2)
    elif salary_range.get("min"):
        return int(salary_range["min"] * 1.15)  # Assume range is +15% above minimum
    elif salary_range.get("max"):
        return int(salary_range["max"] * 0.85)  # Assume range is -15% below maximum
    
    # Otherwise, estimate based on other factors
    job_level = extracted_data.get("job_level", "mid")
    
    # Extract experience years
    exp_data = extracted_data.get("experience_required", {})
    experience_years = 5  # Default
    if exp_data.get("min_years") and exp_data.get("max_years"):
        experience_years = int((exp_data["min_years"] + exp_data["max_years"]) / 2)
    elif exp_data.get("min_years"):
        experience_years = exp_data["min_years"]
    
    # Extract location for cost-of-living adjustment
    location = extracted_data.get("location", "national_average")
    if location and any(city in location.lower() for city in ["san francisco", "sf", "bay area"]):
        location = "san_francisco"
    elif location and "new york" in location.lower():
        location = "new_york"
    elif location and "seattle" in location.lower():
        location = "seattle"
    elif location and "boston" in location.lower():
        location = "boston"
    elif location and "chicago" in location.lower():
        location = "chicago"
    elif location and "austin" in location.lower():
        location = "austin"
    elif location and any(term in location.lower() for term in ["remote", "work from home", "wfh"]):
        location = "remote"
    else:
        location = "national_average"
    
    return estimate_salary_from_extracted_data(
        industry=industry,
        job_level=job_level or "mid",
        experience_years=experience_years,
        location=location
    )

async def analyze_job_description(job_description: str, industry: str) -> Dict[str, Any]:
    try:
        # First, extract structured data from the job description
        extracted_data = await extract_job_data(job_description)
        print("Extracted job data:", json.dumps(extracted_data, indent=2))
        
        # Calculate realistic salary based on extracted data
        realistic_salary = calculate_realistic_salary(extracted_data, industry)
        print(f"Calculated realistic salary: ${realistic_salary:,}")
        
        # Create analysis prompt with extracted data
        prompt = create_analysis_prompt(job_description, industry, extracted_data)
        
        # Initialize client with only API key
        import httpx
        client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            http_client=httpx.AsyncClient(proxies=None)
        )
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert AI automation consultant. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        analysis_text = response.choices[0].message.content.strip()
        print("AI Analysis:", analysis_text)
        
        # Parse JSON response
        analysis = json.loads(analysis_text)
        
        # Use industry-specific data for calculations
        complexity_multiplier = get_industry_complexity_multiplier(industry)
        productivity_range = get_industry_productivity_range(industry)
        implementation_costs = get_industry_implementation_costs(industry)
        
        # Update ROI analysis with realistic salary and industry-specific costs
        roi = analysis["roi_analysis"]
        roi["current_annual_cost"] = realistic_salary
        
        # Use industry-specific implementation costs
        min_cost, max_cost = implementation_costs
        implementation_cost = int(min_cost + (max_cost - min_cost) * complexity_multiplier * 0.5)
        roi["automation_implementation_cost"] = implementation_cost
        
        # Recalculate savings based on realistic data
        # Annual savings = realistic_salary * average productivity improvement for industry
        avg_productivity = sum(productivity_range) / 2
        annual_savings = int(realistic_salary * avg_productivity)
        
        roi["annual_savings"] = annual_savings
        roi["net_savings_year_1"] = annual_savings - implementation_cost
        roi["net_savings_year_3"] = (annual_savings * 3) - implementation_cost
        roi["roi_percentage"] = int(((annual_savings - implementation_cost) / implementation_cost) * 100) if implementation_cost > 0 else 0
        
        # Update executive summary with recalculated values
        analysis["executive_summary"]["total_annual_savings"] = annual_savings
        
        # Update task breakdown with proportional savings
        total_task_savings = sum(task["estimated_annual_savings"] for task in analysis["task_breakdown"])
        if total_task_savings > 0:
            for task in analysis["task_breakdown"]:
                # Proportionally distribute the realistic annual savings across tasks
                task_proportion = task["estimated_annual_savings"] / total_task_savings
                task["estimated_annual_savings"] = int(annual_savings * task_proportion)
        
        # Update implementation roadmap with realistic costs
        total_roadmap_savings = sum(phase["estimated_savings"] for phase in analysis["implementation_roadmap"])
        if total_roadmap_savings > 0:
            for phase in analysis["implementation_roadmap"]:
                # Proportionally distribute savings across phases
                phase_proportion = phase["estimated_savings"] / total_roadmap_savings
                phase["estimated_savings"] = int(annual_savings * phase_proportion)
        
        # Add extracted data to the response for transparency
        analysis["extracted_job_data"] = extracted_data
        
        return analysis
        
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        # Fallback to basic analysis if JSON parsing fails
        return create_fallback_analysis(job_description, industry)
    except Exception as e:
        print(f"Analysis error: {e}")
        # Fallback for any other errors
        return create_fallback_analysis(job_description, industry)

def create_fallback_analysis(job_description: str, industry: str) -> Dict[str, Any]:
    """Create a basic analysis when OpenAI analysis fails"""
    print("Creating fallback analysis")
    # Use industry-specific data for fallback
    base_salary = get_industry_base_salary(industry)
    complexity_multiplier = get_industry_complexity_multiplier(industry)
    productivity_range = get_industry_productivity_range(industry)
    implementation_costs = get_industry_implementation_costs(industry)
    
    # Calculate fallback values
    avg_productivity = sum(productivity_range) / 2
    annual_savings = int(base_salary * avg_productivity)
    min_cost, max_cost = implementation_costs
    implementation_cost = int(min_cost + (max_cost - min_cost) * complexity_multiplier * 0.5)
    
    return {
        "executive_summary": {
            "total_annual_savings": annual_savings,
            "automation_potential_percentage": 50,
            "payback_period_months": 12,
            "implementation_complexity": "Medium"
        },
        "task_breakdown": [
            {
                "task_name": "Administrative Tasks",
                "description": "Routine administrative and data processing tasks",
                "automation_potential": 70,
                "estimated_time_savings_hours_per_week": 15,
                "estimated_annual_savings": int(annual_savings * 0.6),
                "automation_approach": "RPA with AI assistance",
                "implementation_difficulty": "Medium"
            },
            {
                "task_name": "Reporting and Analytics",
                "description": "Data compilation and basic reporting tasks",
                "automation_potential": 80,
                "estimated_time_savings_hours_per_week": 10,
                "estimated_annual_savings": int(annual_savings * 0.4),
                "automation_approach": "Automated reporting with AI insights",
                "implementation_difficulty": "Low"
            }
        ],
        "automation_workflow": {
            "current_process": [
                "Manual data collection",
                "Manual data entry and processing",
                "Manual report generation",
                "Manual review and validation"
            ],
            "automated_process": [
                "Automated data collection",
                "AI-powered data processing",
                "Automated report generation",
                "Exception-based human review"
            ],
            "ai_integration_points": [
                "Data validation and cleaning",
                "Pattern recognition and insights",
                "Automated quality control"
            ]
        },
        "roi_analysis": {
            "current_annual_cost": base_salary,
            "automation_implementation_cost": implementation_cost,
            "annual_savings": annual_savings,
            "net_savings_year_1": annual_savings - implementation_cost,
            "net_savings_year_3": annual_savings * 3 - implementation_cost,
            "roi_percentage": int((annual_savings - implementation_cost) / implementation_cost * 100) if implementation_cost > 0 else 0
        },
        "implementation_roadmap": [
            {
                "phase": "Phase 1: Quick Wins",
                "timeline": "1-3 months",
                "tasks": [
                    "Implement basic RPA for repetitive tasks",
                    "Setup automated reporting"
                ],
                "estimated_savings": int(annual_savings * 0.3),
                "complexity": "Low"
            },
            {
                "phase": "Phase 2: Core Automation",
                "timeline": "3-6 months",
                "tasks": [
                    "Deploy AI-powered data processing",
                    "Integrate systems for seamless workflow"
                ],
                "estimated_savings": int(annual_savings * 0.7),
                "complexity": "Medium"
            }
        ]
    }