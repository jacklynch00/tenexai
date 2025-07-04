# AI Opportunity Scanner

A Manufacturing AI Opportunity Assessment Tool that analyzes job descriptions and generates detailed automation recommendations with ROI calculations.

## Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: FastAPI with Python
- **Database**: PostgreSQL with SQLAlchemy ORM
- **AI Integration**: OpenAI GPT-4 API
- **Deployment**: Railway

## Getting Started

### Quick Start with Docker

The easiest way to run the application locally is using Docker Compose:

1. **Clone and setup:**
   ```bash
   git clone <your-repo>
   cd ai-opportunity-scanner
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Start everything:**
   ```bash
   docker-compose up
   ```

This will:
- Start PostgreSQL database on port 5432
- Run database migrations automatically
- Start FastAPI backend on port 8000
- Start Next.js frontend on port 3000
- Set up hot-reloading for development

Access the application at `http://localhost:3000`

### Manual Setup (Alternative)

If you prefer to run without Docker:

#### Prerequisites

- Node.js 18+ 
- Python 3.8+
- PostgreSQL database
- OpenAI API key

#### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. Run the backend server:
   ```bash
   python main.py
   ```

The backend will be available at `http://localhost:8000`

#### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your backend URL
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## Docker Commands

- **Start services:** `docker-compose up`
- **Start in background:** `docker-compose up -d`
- **Stop services:** `docker-compose down`
- **Rebuild services:** `docker-compose up --build`
- **View logs:** `docker-compose logs [service-name]`
- **Reset database:** `docker-compose down -v && docker-compose up`

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=postgresql://user:password@host:port/dbname
CORS_ORIGINS=http://localhost:3000,https://your-frontend.railway.app
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=AI Scanner <noreply@yourdomain.com>
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Create separate services for frontend and backend
3. Set up a PostgreSQL database service
4. Configure environment variables in Railway dashboard
5. Deploy both services

The application will automatically build and deploy when you push to your repository.

## Features

- **Job Description Analysis**: Paste job descriptions and get AI-powered automation recommendations
- **Industry-Specific Insights**: Supports all GICS Level 1 industries with tailored recommendations
- **ROI Calculations**: Detailed financial analysis with 3-year projections
- **Interactive Dashboard**: Comprehensive results with charts and visualizations
- **Implementation Roadmap**: Phased approach to automation implementation
- **Tool Recommendations**: Specific AI and automation tools for each task
- **Email Delivery**: Professional HTML email reports with embedded charts sent via Resend
- **Asynchronous Processing**: Email sending doesn't block the analysis response

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/analyze` - Analyze job description and return automation recommendations

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Recharts
- **Backend**: FastAPI, SQLAlchemy, OpenAI API, PostgreSQL
- **Deployment**: Railway, Docker
- **Development**: ESLint, Prettier