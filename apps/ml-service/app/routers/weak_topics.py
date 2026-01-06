"""Weak Topic Identification Router."""

from fastapi import APIRouter, HTTPException

from app.services.weak_topic_service import (
    WeakTopicService,
    WeakTopicInput,
    WeakTopicAnalysis,
    get_weak_topic_service,
)

router = APIRouter()


@router.post("/weak-topics", response_model=WeakTopicAnalysis)
async def identify_weak_topics(input_data: WeakTopicInput) -> WeakTopicAnalysis:
    """
    Identify weak topics for a student in a subject.

    Analyzes performance data to find areas that need improvement,
    generates recommendations, and creates a study plan.
    """
    try:
        service = get_weak_topic_service()
        result = await service.analyze(input_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
