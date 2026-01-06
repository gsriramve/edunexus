"""Pydantic schemas for Score Prediction API."""

from pydantic import BaseModel, Field
from typing import List, Optional


class ScoreInput(BaseModel):
    """Input features for score prediction."""

    student_id: str = Field(..., description="Unique student identifier")
    subject_id: str = Field(..., description="Subject identifier")

    # Historical scores (last 5 exams)
    past_scores: List[float] = Field(
        ...,
        min_length=1,
        max_length=10,
        description="Historical exam scores (0-100)"
    )

    # Attendance percentage
    attendance_percentage: float = Field(
        ...,
        ge=0,
        le=100,
        description="Attendance percentage (0-100)"
    )

    # Assignment scores
    assignment_scores: List[float] = Field(
        default=[],
        description="Assignment scores (0-100)"
    )

    # Study hours per week
    study_hours: Optional[float] = Field(
        default=None,
        ge=0,
        description="Self-reported study hours per week"
    )

    # Practice test scores
    practice_scores: List[float] = Field(
        default=[],
        description="Practice/mock test scores (0-100)"
    )


class ScorePrediction(BaseModel):
    """Output for score prediction."""

    student_id: str
    subject_id: str
    predicted_score: float = Field(..., ge=0, le=100)
    confidence: float = Field(..., ge=0, le=1)

    # Additional insights
    weak_topics: List[str] = Field(default=[])
    improvement_suggestions: List[str] = Field(default=[])

    class Config:
        json_schema_extra = {
            "example": {
                "student_id": "STU001",
                "subject_id": "CS301",
                "predicted_score": 78.5,
                "confidence": 0.85,
                "weak_topics": ["Recursion", "Dynamic Programming"],
                "improvement_suggestions": [
                    "Focus on practice problems for recursion",
                    "Review lecture notes on DP"
                ]
            }
        }


class BatchScoreInput(BaseModel):
    """Input for batch score predictions."""

    predictions: List[ScoreInput]


class BatchScorePrediction(BaseModel):
    """Output for batch score predictions."""

    predictions: List[ScorePrediction]
    total_processed: int
