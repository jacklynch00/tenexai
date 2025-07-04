import resend
import os
import asyncio
from typing import Dict, Any
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        resend.api_key = os.getenv("RESEND_API_KEY")
        
        # Setup Jinja2 for email templates
        template_path = Path(__file__).parent.parent / "templates" / "email"
        self.env = Environment(loader=FileSystemLoader(template_path))
        
    async def send_analysis_email(
        self,
        to_email: str,
        analysis_id: int,
        analysis_data: Dict[str, Any],
        frontend_url: str = None,
        session_id: str = None
    ):
        """Send analysis results email asynchronously."""
        try:
            # Prepare template data
            template_data = {
                "analysis": analysis_data,
                "analysis_id": session_id or analysis_id,  # Use session_id if provided
                "frontend_url": frontend_url or os.getenv("FRONTEND_URL", "http://localhost:3000"),
                "current_year": datetime.now().year
            }
            
            # Render email template
            template = self.env.get_template("analysis_results.html")
            html_content = template.render(**template_data)
            
            # Send email
            params = {
                "from": os.getenv("RESEND_FROM_EMAIL", "Automate This Job <noreply@automatethisjob.com>"),
                "to": [to_email],
                "subject": "Your Job Automation Analysis Results",
                "html": html_content,
            }
            
            response = resend.Emails.send(params)
            logger.info(f"Email sent successfully to {to_email}. ID: {response.get('id')}")
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            # Don't raise - we don't want email failures to block the analysis
    
    def send_email_async(self, *args, **kwargs):
        """Fire and forget email sending."""
        asyncio.create_task(self.send_analysis_email(*args, **kwargs))