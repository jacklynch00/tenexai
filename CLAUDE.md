# AI Opportunity Scanner - Project Specification

## Project Overview

The AI Opportunity Scanner is a Manufacturing AI Opportunity Assessment Tool that analyzes company job descriptions and generates detailed automation recommendations with ROI calculations. This tool demonstrates the value proposition that Tenex provides to enterprise clients by automating the initial assessment phase of AI consulting.

**Target Audience:** Mid-market manufacturing companies (1,000-5,000 employees) who need to identify where AI can improve their operations and understand the specific ROI of AI investments.

**Value Proposition:** "Paste your job description → Get a custom AI automation roadmap with specific dollar savings"

## Technical Architecture

### Stack
- **Frontend:** Next.js 14+ with TypeScript, ShadCN UI components
- **Backend:** Python FastAPI with async/await
- **Database:** PostgreSQL with SQLAlchemy ORM
- **AI Integration:** OpenAI GPT-4 API
- **Deployment:** Railway (separate frontend/backend services)
- **Styling:** Tailwind CSS (included with ShadCN)

### Services Architecture
```
Frontend (Next.js) → Backend API (FastAPI) → PostgreSQL Database
                  ↓
              OpenAI API
```

## Core Features

### 1. Job Description Analysis Flow
1. **Input Stage:** User pastes job description text into textarea
2. **Email Capture:** Optional email collection before analysis
3. **Analysis Stage:** AI processes job description and generates recommendations
4. **Results Dashboard:** Interactive visualization of automation opportunities and ROI

### 2. AI Analysis Engine
- Custom OpenAI prompts for extracting automatable tasks
- Industry-specific automation recommendations
- ROI calculations based on salary and time savings
- Implementation difficulty assessment

### 3. Results Dashboard
- Executive summary with key metrics
- Task breakdown with automation potential
- Visual automation workflow diagrams
- ROI charts and financial projections
- Industry-specific insights

## Database Schema

```sql
-- Job Analyses Table
CREATE TABLE job_analyses (
    id SERIAL PRIMARY KEY,
    job_description TEXT NOT NULL,
    user_email VARCHAR(255),
    industry VARCHAR(100) NOT NULL,
    analysis_result JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_job_analyses_industry ON job_analyses(industry);
CREATE INDEX idx_job_analyses_created_at ON job_analyses(created_at);
CREATE INDEX idx_job_analyses_email ON job_analyses(user_email) WHERE user_email IS NOT NULL;
```

## API Specifications

### Backend Endpoints

#### POST /api/analyze
Analyze job description and return automation recommendations.

**Request Body:**
```json
{
  "job_description": "string (required)",
  "user_email": "string (optional)",
  "industry": "string (required, one of GICS L1 industries)"
}
```

**Response:**
```json
{
  "id": "integer",
  "analysis": {
    "executive_summary": {
      "total_annual_savings": "number",
      "automation_potential_percentage": "number",
      "payback_period_months": "number",
      "implementation_complexity": "string (Low|Medium|High)"
    },
    "task_breakdown": [
      {
        "task_name": "string",
        "description": "string",
        "automation_potential": "number (0-100)",
        "estimated_time_savings_hours_per_week": "number",
        "estimated_annual_savings": "number",
        "automation_approach": "string",
        "implementation_difficulty": "string (Low|Medium|High)",
        "recommended_tools": ["string"]
      }
    ],
    "automation_workflow": {
      "current_process": ["string"],
      "automated_process": ["string"],
      "ai_integration_points": ["string"]
    },
    "roi_analysis": {
      "current_annual_cost": "number",
      "automation_implementation_cost": "number",
      "annual_savings": "number",
      "net_savings_year_1": "number",
      "net_savings_year_3": "number",
      "roi_percentage": "number"
    },
    "implementation_roadmap": [
      {
        "phase": "string",
        "timeline": "string",
        "tasks": ["string"],
        "estimated_savings": "number",
        "complexity": "string"
      }
    ]
  }
}
```

#### GET /api/health
Health check endpoint for deployment monitoring.

## Frontend Specifications

### User Interface Flow

1. **Landing Page**
   - Hero section explaining the value proposition
   - Job description textarea input
   - Industry selection dropdown (GICS L1 industries)
   - "Analyze Job Description" button

2. **Email Capture Modal** (Optional)
   - Appears after clicking analyze
   - Email input field
   - "Continue" and "Skip" options
   - Privacy notice

3. **Loading State**
   - Progress indicator
   - Estimated analysis time
   - Background information about the analysis process

4. **Results Dashboard**
   - Executive Summary card
   - Task Breakdown table with interactive elements
   - Automation Workflow visualization
   - ROI Charts (bar chart, line chart for projections)
   - Implementation Roadmap timeline
   - Email delivery confirmation (if email provided)

### ShadCN UI Components to Use

- `Card` and `CardHeader/CardContent` for layout sections
- `Button` for actions
- `Input` and `Textarea` for form fields
- `Select` for industry dropdown
- `Table` for task breakdown
- `Chart` components for ROI visualizations
- `Badge` for complexity indicators
- `Progress` for loading states
- `Dialog` for email capture modal
- `Tabs` for organizing dashboard sections

### Styling Guidelines

- Use ShadCN's default theme with professional color scheme
- Implement responsive design (mobile-first)
- Use consistent spacing and typography
- Add hover states and smooth transitions
- Include loading skeletons for better UX

## AI Integration Specifications

### OpenAI Prompt Strategy

Create a comprehensive system prompt that:
1. Defines the AI's role as a manufacturing automation consultant
2. Specifies the exact JSON output format required
3. Includes industry-specific context and benchmarks
4. Provides examples of good analysis outputs
5. Emphasizes practical, actionable recommendations

### Industry Benchmarks (Hardcoded)

For ROI calculations, use these baseline assumptions:
- Average manufacturing salary: $65,000/year
- AI implementation cost: $15,000-$50,000 depending on complexity
- Productivity improvement: 15-40% for automated tasks
- Implementation timeline: 3-12 months

Industry-specific multipliers:
- Energy: 1.3x (higher wages, complex processes)
- Information Technology: 1.2x (tech-savvy, faster adoption)
- Industrials: 1.0x (baseline)
- Healthcare: 1.1x (regulatory considerations)
- Others: 1.0x (baseline)

## Development Guidelines

### Code Quality Standards
- Use TypeScript for all frontend code
- Follow Python PEP 8 standards for backend
- Implement proper error handling and validation
- Write production-ready code from the start
- Use proper logging for debugging and monitoring

### Environment Variables
```
# Backend
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://user:password@host:port/dbname
CORS_ORIGINS=http://localhost:3000,https://your-frontend.railway.app

# Frontend
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Error Handling
- Implement comprehensive error boundaries in React
- Use proper HTTP status codes in FastAPI
- Provide user-friendly error messages
- Log errors for debugging without exposing sensitive data

### Performance Considerations
- Implement request timeouts for OpenAI API calls
- Use database connection pooling
- Optimize images and assets
- Implement proper caching strategies

## Deployment Configuration

### Railway Setup
1. **Backend Service (FastAPI)**
   - Python runtime
   - Install dependencies from requirements.txt
   - Set up environment variables
   - Configure health check endpoint

2. **Frontend Service (Next.js)**
   - Node.js runtime
   - Build static assets
   - Set up environment variables
   - Configure domain routing

3. **Database Service**
   - PostgreSQL instance
   - Automated backups
   - Connection pooling
   - Performance monitoring

### Requirements Files

**requirements.txt (Backend):**
```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
openai==1.3.8
pydantic==2.5.0
python-dotenv==1.0.0
alembic==1.12.1
```

**package.json (Frontend):**
```json
{
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@types/node": "20.0.0",
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "typescript": "5.0.0",
    "tailwindcss": "3.3.0",
    "lucide-react": "0.290.0",
    "recharts": "2.8.0"
  }
}
```

## Security Considerations

- Validate all user inputs before processing
- Sanitize job description text before sending to OpenAI
- Implement rate limiting for API endpoints
- Use environment variables for sensitive configuration
- Don't log sensitive user data
- Implement proper CORS configuration

## Success Metrics

The application should demonstrate:
1. **Functionality:** Successfully analyze job descriptions and provide meaningful recommendations
2. **Performance:** Complete analysis in under 30 seconds
3. **User Experience:** Intuitive interface with clear value proposition
4. **Data Quality:** Accurate ROI calculations and practical automation suggestions
5. **Professional Presentation:** Production-ready UI/UX that impresses enterprise users

## Additional Notes

- Focus on building a minimum viable product first, then iterate
- Prioritize code quality and maintainability over feature completeness
- Ensure the application showcases understanding of manufacturing industry needs
- Design with scalability in mind for future enhancements
- Document all assumptions and business logic for future developers