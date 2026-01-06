"""Resume Builder Router."""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from app.services.resume_builder import (
    ResumeBuilderService,
    ResumeInput,
    GeneratedResume,
    get_resume_builder,
)

router = APIRouter()


@router.post("/resume", response_model=GeneratedResume)
async def generate_resume(input_data: ResumeInput) -> GeneratedResume:
    """
    Generate a professional resume.

    Creates an ATS-optimized resume with multiple formats (HTML, plain text).
    Includes suggestions for improvement and ATS compatibility score.
    """
    try:
        service = get_resume_builder()
        result = await service.generate_resume(input_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume generation failed: {str(e)}")


@router.post("/resume/improve", response_model=Dict[str, Any])
async def improve_resume_content(
    content: str,
    content_type: str = "experience",
) -> Dict[str, Any]:
    """
    Improve a specific resume section using AI.

    Takes existing content and returns an improved version with
    action verbs, metrics, and ATS-friendly keywords.
    """
    try:
        service = get_resume_builder()
        result = await service.improve_content(content, content_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content improvement failed: {str(e)}")
