"""Pydantic schemas for Placement Prediction API."""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class Branch(str, Enum):
    """Engineering branches."""
    CSE = "CSE"
    ECE = "ECE"
    EEE = "EEE"
    MECH = "MECH"
    CIVIL = "CIVIL"
    IT = "IT"
    OTHER = "OTHER"


class PlacementInput(BaseModel):
    """Input features for placement prediction."""

    student_id: str = Field(..., description="Unique student identifier")

    # Academic performance
    cgpa: float = Field(..., ge=0, le=10, description="Cumulative GPA")
    branch: Branch = Field(..., description="Engineering branch")
    backlogs: int = Field(default=0, ge=0, description="Number of backlogs")

    # Skills (normalized scores 0-100)
    coding_score: Optional[float] = Field(default=None, ge=0, le=100)
    aptitude_score: Optional[float] = Field(default=None, ge=0, le=100)
    communication_score: Optional[float] = Field(default=None, ge=0, le=100)

    # Experience
    internship_count: int = Field(default=0, ge=0)
    project_count: int = Field(default=0, ge=0)
    certification_count: int = Field(default=0, ge=0)

    # Extra-curricular
    extracurricular_score: Optional[float] = Field(
        default=None,
        ge=0,
        le=100,
        description="Overall extra-curricular participation score"
    )

    # Technical skills (list of skill names)
    skills: List[str] = Field(default=[])


class SalaryBand(str, Enum):
    """Salary band categories."""
    BELOW_3 = "Below 3 LPA"
    LPA_3_5 = "3-5 LPA"
    LPA_5_8 = "5-8 LPA"
    LPA_8_12 = "8-12 LPA"
    LPA_12_20 = "12-20 LPA"
    ABOVE_20 = "Above 20 LPA"


class PlacementPrediction(BaseModel):
    """Output for placement prediction."""

    student_id: str
    placement_probability: float = Field(..., ge=0, le=1)
    salary_band: SalaryBand
    expected_salary_min: float = Field(..., description="Min expected salary in LPA")
    expected_salary_max: float = Field(..., description="Max expected salary in LPA")

    # Top matching companies (would be populated from company database)
    top_companies: List[str] = Field(default=[])

    # Skill gaps
    skill_gaps: List[str] = Field(default=[])

    # Recommendations
    recommendations: List[str] = Field(default=[])

    class Config:
        json_schema_extra = {
            "example": {
                "student_id": "STU001",
                "placement_probability": 0.82,
                "salary_band": "8-12 LPA",
                "expected_salary_min": 8.0,
                "expected_salary_max": 12.0,
                "top_companies": ["TCS", "Infosys", "Wipro", "Cognizant"],
                "skill_gaps": ["System Design", "Cloud Computing"],
                "recommendations": [
                    "Complete AWS certification",
                    "Practice system design problems"
                ]
            }
        }


class BatchPlacementInput(BaseModel):
    """Input for batch placement predictions."""

    predictions: List[PlacementInput]


class BatchPlacementPrediction(BaseModel):
    """Output for batch placement predictions."""

    predictions: List[PlacementPrediction]
    total_processed: int
