"""
Industry-specific constants and averages for AI automation analysis.
Data based on industry salary surveys, automation complexity studies, and implementation costs.
"""

from typing import Tuple

from app.schemas import Industry

# Industry average salaries (annual USD)
INDUSTRY_AVERAGE_SALARIES = {
    Industry.ENERGY: 85000,
    Industry.MATERIALS: 68000,
    Industry.INDUSTRIALS: 65000,
    Industry.CONSUMER_DISCRETIONARY: 62000,
    Industry.CONSUMER_STAPLES: 60000,
    Industry.HEALTH_CARE: 75000,
    Industry.FINANCIALS: 78000,
    Industry.INFORMATION_TECHNOLOGY: 95000,
    Industry.COMMUNICATION_SERVICES: 82000,
    Industry.UTILITIES: 72000,
    Industry.REAL_ESTATE: 65000
}

# Industry automation complexity multipliers (affects implementation cost and timeline)
INDUSTRY_COMPLEXITY_MULTIPLIERS = {
    Industry.ENERGY: 1.4,  # High safety/regulatory requirements
    Industry.MATERIALS: 1.2,  # Complex manufacturing processes
    Industry.INDUSTRIALS: 1.0,  # Baseline
    Industry.CONSUMER_DISCRETIONARY: 0.9,  # More standardized processes
    Industry.CONSUMER_STAPLES: 0.8,  # Highly standardized
    Industry.HEALTH_CARE: 1.5,  # Strict regulatory compliance
    Industry.FINANCIALS: 1.3,  # Security and compliance heavy
    Industry.INFORMATION_TECHNOLOGY: 0.7,  # Tech-forward, easier adoption
    Industry.COMMUNICATION_SERVICES: 1.0,  # Baseline
    Industry.UTILITIES: 1.2,  # Critical infrastructure considerations
    Industry.REAL_ESTATE: 0.9   # Straightforward processes
}

# Industry productivity improvement potential (range of automation effectiveness)
INDUSTRY_PRODUCTIVITY_RANGES = {
    Industry.ENERGY: (0.15, 0.35),  # Conservative due to safety
    Industry.MATERIALS: (0.20, 0.45),
    Industry.INDUSTRIALS: (0.25, 0.50),  # High automation potential
    Industry.CONSUMER_DISCRETIONARY: (0.20, 0.40),
    Industry.CONSUMER_STAPLES: (0.30, 0.55),  # Highly repetitive processes
    Industry.HEALTH_CARE: (0.15, 0.30),  # Conservative due to regulations
    Industry.FINANCIALS: (0.25, 0.45),
    Industry.INFORMATION_TECHNOLOGY: (0.35, 0.60),  # Highest automation potential
    Industry.COMMUNICATION_SERVICES: (0.20, 0.40),
    Industry.UTILITIES: (0.20, 0.35),
    Industry.REAL_ESTATE: (0.25, 0.45)
}

# Base implementation cost ranges by industry (USD)
INDUSTRY_IMPLEMENTATION_COSTS = {
    Industry.ENERGY: (25000, 75000),  # Higher due to safety requirements
    Industry.MATERIALS: (20000, 60000),
    Industry.INDUSTRIALS: (15000, 50000),  # Baseline
    Industry.CONSUMER_DISCRETIONARY: (12000, 40000),
    Industry.CONSUMER_STAPLES: (10000, 35000),  # Economies of scale
    Industry.HEALTH_CARE: (30000, 80000),  # Compliance costs
    Industry.FINANCIALS: (25000, 70000),  # Security requirements
    Industry.INFORMATION_TECHNOLOGY: (8000, 30000),  # Lower due to existing tech
    Industry.COMMUNICATION_SERVICES: (15000, 45000),
    Industry.UTILITIES: (20000, 60000),
    Industry.REAL_ESTATE: (12000, 40000)
}

# Common job levels and their typical salary multipliers
JOB_LEVEL_MULTIPLIERS = {
    "entry": 0.7,
    "junior": 0.8,
    "mid": 1.0,
    "senior": 1.3,
    "lead": 1.5,
    "manager": 1.7,
    "director": 2.2,
    "vp": 3.0,
    "c-level": 4.0
}

# Experience level indicators (years)
EXPERIENCE_LEVELS = {
    "entry": (0, 2),
    "junior": (1, 3),
    "mid": (3, 7),
    "senior": (7, 12),
    "lead": (8, 15),
    "manager": (10, 20),
    "director": (15, 25),
    "vp": (20, 30),
    "c-level": (20, 40)
}

# Location cost-of-living multipliers (major regions)
LOCATION_MULTIPLIERS = {
    "san_francisco": 1.8,
    "new_york": 1.6,
    "seattle": 1.4,
    "boston": 1.3,
    "chicago": 1.1,
    "austin": 1.1,
    "denver": 1.0,
    "atlanta": 0.9,
    "phoenix": 0.9,
    "dallas": 0.9,
    "remote": 1.0,
    "national_average": 1.0
}

def get_industry_base_salary(industry: Industry) -> int:
    """Get base salary for industry."""
    return INDUSTRY_AVERAGE_SALARIES.get(industry, 65000)

def get_industry_complexity_multiplier(industry: Industry) -> float:
    """Get complexity multiplier for industry."""
    return INDUSTRY_COMPLEXITY_MULTIPLIERS.get(industry, 1.0)

def get_industry_productivity_range(industry: Industry) -> Tuple[float, float]:
    """Get productivity improvement range for industry."""
    return INDUSTRY_PRODUCTIVITY_RANGES.get(industry, (0.15, 0.40))

def get_industry_implementation_costs(industry: Industry) -> Tuple[int, int]:
    """Get implementation cost range for industry."""
    return INDUSTRY_IMPLEMENTATION_COSTS.get(industry, (15000, 50000))

def estimate_salary_from_extracted_data(
    industry: Industry,
    job_level: str = "mid",
    experience_years: int = 5,
    location: str = "national_average",
    specified_salary: int = None
) -> int:
    """
    Estimate salary based on extracted job description data.
    
    Args:
        industry: Industry category
        job_level: Job level (entry, junior, mid, senior, etc.)
        experience_years: Years of experience required
        location: Geographic location
        specified_salary: Salary if explicitly mentioned in job description
    
    Returns:
        Estimated annual salary in USD
    """
    if specified_salary:
        return specified_salary
    
    # Start with industry base
    base_salary = get_industry_base_salary(industry)
    
    # Apply job level multiplier
    level_multiplier = JOB_LEVEL_MULTIPLIERS.get(job_level.lower(), 1.0)
    
    # Apply location multiplier
    location_multiplier = LOCATION_MULTIPLIERS.get(location.lower().replace(" ", "_"), 1.0)
    
    # Experience adjustment (additional 2% per year above/below mid-level)
    experience_adjustment = 1.0
    if experience_years > 5:
        experience_adjustment = 1.0 + (experience_years - 5) * 0.02
    elif experience_years < 5:
        experience_adjustment = 1.0 - (5 - experience_years) * 0.015
    
    final_salary = int(base_salary * level_multiplier * location_multiplier * experience_adjustment)
    
    return final_salary