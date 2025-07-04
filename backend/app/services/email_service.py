import resend
import os
import asyncio
from typing import Dict, Any
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
import logging
import base64
from io import BytesIO
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
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
        frontend_url: str = None
    ):
        """Send analysis results email asynchronously."""
        try:
            # Generate charts
            charts = await self._generate_charts(analysis_data)
            
            # Prepare template data
            template_data = {
                "analysis": analysis_data,
                "analysis_id": analysis_id,
                "frontend_url": frontend_url or os.getenv("FRONTEND_URL", "http://localhost:3000"),
                "current_year": datetime.now().year,
                "charts": charts
            }
            
            # Render email template
            template = self.env.get_template("analysis_results.html")
            html_content = template.render(**template_data)
            
            # Embed charts as inline images
            html_content_with_charts = html_content
            for chart_name, chart_data in charts.items():
                # Replace cid references with inline base64 images
                html_content_with_charts = html_content_with_charts.replace(
                    f'src="cid:{chart_name}"',
                    f'src="data:image/png;base64,{chart_data}"'
                )
            
            # Send email
            params = {
                "from": os.getenv("RESEND_FROM_EMAIL", "AI Scanner <noreply@example.com>"),
                "to": [to_email],
                "subject": "Your AI Opportunity Analysis Results",
                "html": html_content_with_charts,
            }
            
            response = resend.Emails.send(params)
            logger.info(f"Email sent successfully to {to_email}. ID: {response.get('id')}")
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            # Don't raise - we don't want email failures to block the analysis
    
    async def _generate_charts(self, analysis_data: Dict[str, Any]) -> Dict[str, str]:
        """Generate charts for email using matplotlib."""
        charts = {}
        
        try:
            # Task Savings Bar Chart
            fig, ax = plt.subplots(figsize=(10, 6))
            tasks = [task['task_name'] for task in analysis_data['task_breakdown']]
            savings = [task['estimated_annual_savings'] for task in analysis_data['task_breakdown']]
            
            bars = ax.bar(tasks, savings, color='#3B82F6')
            ax.set_ylabel('Annual Savings ($)', fontsize=12)
            ax.set_title('Annual Savings by Task', fontsize=16, fontweight='bold')
            ax.tick_params(axis='x', rotation=45)
            
            # Add value labels on bars
            for bar in bars:
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height,
                       f'${height:,.0f}',
                       ha='center', va='bottom')
            
            plt.tight_layout()
            
            # Convert to base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
            buffer.seek(0)
            charts['task_savings'] = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
            # ROI Timeline Chart
            fig, ax = plt.subplots(figsize=(10, 6))
            years = ['Year 1', 'Year 2', 'Year 3']
            roi_data = analysis_data['roi_analysis']
            savings = [
                roi_data['net_savings_year_1'],
                roi_data['annual_savings'] * 2 - roi_data['automation_implementation_cost'],
                roi_data['net_savings_year_3']
            ]
            
            line = ax.plot(years, savings, marker='o', linewidth=3, markersize=10, color='#10B981')
            ax.fill_between(years, savings, alpha=0.3, color='#10B981')
            ax.set_ylabel('Net Savings ($)', fontsize=12)
            ax.set_title('3-Year ROI Projection', fontsize=16, fontweight='bold')
            ax.grid(True, alpha=0.3)
            
            # Add value labels
            for i, (x, y) in enumerate(zip(years, savings)):
                ax.text(x, y, f'${y:,.0f}', ha='center', va='bottom', fontweight='bold')
            
            plt.tight_layout()
            
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
            buffer.seek(0)
            charts['roi_projection'] = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
        except Exception as e:
            logger.error(f"Error generating charts: {str(e)}")
        
        return charts
    
    def send_email_async(self, *args, **kwargs):
        """Fire and forget email sending."""
        asyncio.create_task(self.send_analysis_email(*args, **kwargs))