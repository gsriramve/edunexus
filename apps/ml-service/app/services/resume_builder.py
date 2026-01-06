"""AI-Powered Resume Builder Service.

Generates professional resumes for students based on their profile,
skills, and career goals.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum
from datetime import date

from app.services.llm_service import get_llm_service


class ResumeTemplate(str, Enum):
    """Available resume templates."""
    MODERN = "modern"
    CLASSIC = "classic"
    MINIMAL = "minimal"
    TECH = "tech"
    CREATIVE = "creative"


class Education(BaseModel):
    """Education entry."""
    degree: str
    institution: str
    location: str
    start_year: int
    end_year: Optional[int] = None
    cgpa: Optional[float] = None
    percentage: Optional[float] = None
    highlights: List[str] = []


class Experience(BaseModel):
    """Work/internship experience entry."""
    title: str
    company: str
    location: str
    start_date: str  # "Mon YYYY" format
    end_date: Optional[str] = None  # "Mon YYYY" or "Present"
    description: str
    achievements: List[str] = []
    technologies: List[str] = []


class Project(BaseModel):
    """Project entry."""
    name: str
    description: str
    technologies: List[str] = []
    url: Optional[str] = None
    highlights: List[str] = []


class Certification(BaseModel):
    """Certification entry."""
    name: str
    issuer: str
    date: Optional[str] = None
    credential_id: Optional[str] = None
    url: Optional[str] = None


class ResumeInput(BaseModel):
    """Input data for resume generation."""
    # Personal Info
    full_name: str
    email: str
    phone: str
    location: str
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None

    # Career
    target_role: str
    career_objective: Optional[str] = None

    # Content
    education: List[Education]
    experience: List[Experience] = []
    projects: List[Project] = []
    skills: List[str] = []
    certifications: List[Certification] = []
    achievements: List[str] = []
    languages: List[str] = []

    # Preferences
    template: ResumeTemplate = ResumeTemplate.MODERN
    include_photo: bool = False


class ResumeSection(BaseModel):
    """A section of the resume."""
    title: str
    content: str
    order: int


class GeneratedResume(BaseModel):
    """Generated resume output."""
    resume_id: str
    full_name: str
    sections: List[ResumeSection]
    summary: str
    ats_score: int = Field(..., ge=0, le=100, description="ATS compatibility score")
    suggestions: List[str]
    keywords: List[str]
    html_content: str
    plain_text: str


class ResumeBuilderService:
    """Service for AI-powered resume generation."""

    def __init__(self):
        """Initialize the service."""
        self.llm = get_llm_service()

    async def generate_resume(self, input_data: ResumeInput) -> GeneratedResume:
        """Generate a professional resume.

        Args:
            input_data: Resume input data

        Returns:
            Generated resume with multiple formats
        """
        # Generate professional summary
        summary = await self._generate_summary(input_data)

        # Generate sections
        sections = []

        # Contact section
        sections.append(ResumeSection(
            title="Contact",
            content=self._format_contact(input_data),
            order=1,
        ))

        # Summary/Objective
        sections.append(ResumeSection(
            title="Professional Summary",
            content=summary,
            order=2,
        ))

        # Education
        sections.append(ResumeSection(
            title="Education",
            content=self._format_education(input_data.education),
            order=3,
        ))

        # Experience (if any)
        if input_data.experience:
            sections.append(ResumeSection(
                title="Experience",
                content=self._format_experience(input_data.experience),
                order=4,
            ))

        # Projects
        if input_data.projects:
            sections.append(ResumeSection(
                title="Projects",
                content=self._format_projects(input_data.projects),
                order=5,
            ))

        # Skills
        sections.append(ResumeSection(
            title="Technical Skills",
            content=self._format_skills(input_data.skills),
            order=6,
        ))

        # Certifications
        if input_data.certifications:
            sections.append(ResumeSection(
                title="Certifications",
                content=self._format_certifications(input_data.certifications),
                order=7,
            ))

        # Achievements
        if input_data.achievements:
            sections.append(ResumeSection(
                title="Achievements",
                content=self._format_achievements(input_data.achievements),
                order=8,
            ))

        # Calculate ATS score and suggestions
        ats_score, suggestions = self._analyze_resume(input_data)

        # Extract keywords
        keywords = self._extract_keywords(input_data)

        # Generate HTML and plain text
        html_content = self._generate_html(sections, input_data.template)
        plain_text = self._generate_plain_text(sections)

        import random
        resume_id = f"resume_{input_data.full_name.lower().replace(' ', '_')}_{random.randint(1000, 9999)}"

        return GeneratedResume(
            resume_id=resume_id,
            full_name=input_data.full_name,
            sections=sections,
            summary=summary,
            ats_score=ats_score,
            suggestions=suggestions,
            keywords=keywords,
            html_content=html_content,
            plain_text=plain_text,
        )

    async def improve_content(
        self,
        content: str,
        content_type: str = "experience",
    ) -> Dict[str, Any]:
        """Improve a specific content section using AI.

        Args:
            content: Original content to improve
            content_type: Type of content (experience, project, summary)

        Returns:
            Improved content with suggestions
        """
        system_prompt = """You are an expert resume writer. Improve the given content to be:
        - Action-oriented (start with strong verbs)
        - Quantified with metrics where possible
        - Concise but impactful
        - ATS-friendly with relevant keywords"""

        prompt = f"""Improve this {content_type} description for a resume:

        Original: {content}

        Provide:
        1. An improved version
        2. Key improvements made
        3. Suggested metrics to add if available"""

        response = await self.llm.generate_text(prompt, system_prompt)

        return {
            "original": content,
            "improved": response,
            "content_type": content_type,
        }

    async def _generate_summary(self, input_data: ResumeInput) -> str:
        """Generate a professional summary."""
        if input_data.career_objective:
            return input_data.career_objective

        # Create context for LLM
        skills_str = ", ".join(input_data.skills[:10])
        exp_years = len(input_data.experience)

        # Try LLM generation
        try:
            system_prompt = "You are an expert resume writer. Write concise, impactful professional summaries."
            prompt = f"""Write a 2-3 sentence professional summary for:
            - Target Role: {input_data.target_role}
            - Key Skills: {skills_str}
            - Experience: {exp_years} roles/internships
            - Education: {input_data.education[0].degree if input_data.education else 'Engineering'}

            Make it professional, specific, and ATS-friendly."""

            return await self.llm.generate_text(prompt, system_prompt, max_tokens=150)
        except Exception:
            pass

        # Fallback template
        return f"Motivated {input_data.education[0].degree if input_data.education else 'Engineering'} " \
               f"graduate seeking {input_data.target_role} position. Proficient in {skills_str}. " \
               f"Passionate about building impactful solutions and continuous learning."

    def _format_contact(self, input_data: ResumeInput) -> str:
        """Format contact information."""
        lines = [
            input_data.full_name,
            f"{input_data.email} | {input_data.phone}",
            input_data.location,
        ]
        if input_data.linkedin:
            lines.append(f"LinkedIn: {input_data.linkedin}")
        if input_data.github:
            lines.append(f"GitHub: {input_data.github}")
        return "\n".join(lines)

    def _format_education(self, education: List[Education]) -> str:
        """Format education section."""
        lines = []
        for edu in education:
            end = edu.end_year or "Present"
            line = f"{edu.degree} - {edu.institution}, {edu.location} ({edu.start_year}-{end})"
            if edu.cgpa:
                line += f" | CGPA: {edu.cgpa}"
            elif edu.percentage:
                line += f" | {edu.percentage}%"
            lines.append(line)
            for highlight in edu.highlights:
                lines.append(f"  • {highlight}")
        return "\n".join(lines)

    def _format_experience(self, experience: List[Experience]) -> str:
        """Format experience section."""
        lines = []
        for exp in experience:
            end = exp.end_date or "Present"
            lines.append(f"{exp.title} - {exp.company}, {exp.location}")
            lines.append(f"{exp.start_date} - {end}")
            lines.append(exp.description)
            for achievement in exp.achievements:
                lines.append(f"  • {achievement}")
            if exp.technologies:
                lines.append(f"  Technologies: {', '.join(exp.technologies)}")
            lines.append("")
        return "\n".join(lines)

    def _format_projects(self, projects: List[Project]) -> str:
        """Format projects section."""
        lines = []
        for proj in projects:
            lines.append(f"{proj.name}")
            lines.append(proj.description)
            if proj.technologies:
                lines.append(f"  Technologies: {', '.join(proj.technologies)}")
            for highlight in proj.highlights:
                lines.append(f"  • {highlight}")
            if proj.url:
                lines.append(f"  Link: {proj.url}")
            lines.append("")
        return "\n".join(lines)

    def _format_skills(self, skills: List[str]) -> str:
        """Format skills section."""
        # Group by category if possible
        return " | ".join(skills)

    def _format_certifications(self, certifications: List[Certification]) -> str:
        """Format certifications section."""
        lines = []
        for cert in certifications:
            line = f"{cert.name} - {cert.issuer}"
            if cert.date:
                line += f" ({cert.date})"
            lines.append(line)
        return "\n".join(lines)

    def _format_achievements(self, achievements: List[str]) -> str:
        """Format achievements section."""
        return "\n".join(f"• {a}" for a in achievements)

    def _analyze_resume(self, input_data: ResumeInput) -> tuple[int, List[str]]:
        """Analyze resume and calculate ATS score."""
        score = 50  # Base score
        suggestions = []

        # Check for summary/objective
        if input_data.career_objective:
            score += 10
        else:
            suggestions.append("Add a professional summary to highlight your strengths")

        # Check skills count
        if len(input_data.skills) >= 8:
            score += 10
        else:
            suggestions.append("Add more relevant technical skills (aim for 8-12)")

        # Check experience
        if len(input_data.experience) >= 1:
            score += 10
        else:
            suggestions.append("Add internship or work experience if available")

        # Check projects
        if len(input_data.projects) >= 2:
            score += 10
        else:
            suggestions.append("Include 2-3 relevant projects with descriptions")

        # Check certifications
        if input_data.certifications:
            score += 5
        else:
            suggestions.append("Consider adding relevant certifications")

        # Check LinkedIn
        if input_data.linkedin:
            score += 5
        else:
            suggestions.append("Add your LinkedIn profile URL")

        # Check GitHub (for tech roles)
        if "developer" in input_data.target_role.lower() or "engineer" in input_data.target_role.lower():
            if input_data.github:
                score += 5
            else:
                suggestions.append("Add your GitHub profile for technical roles")

        return min(score, 100), suggestions[:5]

    def _extract_keywords(self, input_data: ResumeInput) -> List[str]:
        """Extract relevant keywords for ATS."""
        keywords = set()

        # Skills are keywords
        keywords.update(input_data.skills)

        # Extract from experience
        for exp in input_data.experience:
            keywords.update(exp.technologies)

        # Extract from projects
        for proj in input_data.projects:
            keywords.update(proj.technologies)

        # Add role-specific keywords
        role_keywords = {
            "developer": ["Programming", "Software Development", "Agile", "Git"],
            "engineer": ["Engineering", "Problem Solving", "Technical"],
            "analyst": ["Analysis", "Data", "Reporting", "Excel"],
        }
        for role, kws in role_keywords.items():
            if role in input_data.target_role.lower():
                keywords.update(kws)

        return list(keywords)[:20]

    def _generate_html(self, sections: List[ResumeSection], template: ResumeTemplate) -> str:
        """Generate HTML version of resume."""
        css = self._get_template_css(template)

        html_sections = []
        for section in sorted(sections, key=lambda x: x.order):
            html_sections.append(f"""
            <div class="section">
                <h2>{section.title}</h2>
                <div class="content">{section.content.replace(chr(10), '<br>')}</div>
            </div>
            """)

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Resume</title>
            <style>{css}</style>
        </head>
        <body>
            <div class="resume">
                {''.join(html_sections)}
            </div>
        </body>
        </html>
        """

    def _get_template_css(self, template: ResumeTemplate) -> str:
        """Get CSS for the selected template."""
        base_css = """
        body { font-family: Arial, sans-serif; margin: 40px; }
        .resume { max-width: 800px; margin: 0 auto; }
        .section { margin-bottom: 20px; }
        h2 { color: #333; border-bottom: 2px solid #333; padding-bottom: 5px; }
        .content { margin-top: 10px; white-space: pre-line; }
        """
        return base_css

    def _generate_plain_text(self, sections: List[ResumeSection]) -> str:
        """Generate plain text version of resume."""
        lines = []
        for section in sorted(sections, key=lambda x: x.order):
            lines.append(f"{'='*40}")
            lines.append(section.title.upper())
            lines.append(f"{'='*40}")
            lines.append(section.content)
            lines.append("")
        return "\n".join(lines)


# Singleton instance
_resume_builder: Optional[ResumeBuilderService] = None


def get_resume_builder() -> ResumeBuilderService:
    """Get singleton service instance."""
    global _resume_builder
    if _resume_builder is None:
        _resume_builder = ResumeBuilderService()
    return _resume_builder
