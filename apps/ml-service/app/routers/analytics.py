"""Analytics Router."""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

from app.services.analytics_service import (
    AnalyticsService,
    StudentAnalytics,
    BatchAnalytics,
    AICTEReportData,
    get_analytics_service,
)
from pydantic import BaseModel


class StudentAnalyticsInput(BaseModel):
    """Input for student analytics."""
    student_id: str
    academic_data: Dict[str, Any]
    attendance_data: List[float]
    score_history: List[float]


class BatchAnalyticsInput(BaseModel):
    """Input for batch analytics."""
    batch_id: str
    students_data: List[Dict[str, Any]]


class AICTEReportInput(BaseModel):
    """Input for AICTE report."""
    institution_data: Dict[str, Any]
    placement_data: Dict[str, Any]
    academic_year: str


router = APIRouter()


@router.post("/student", response_model=StudentAnalytics)
async def analyze_student(input_data: StudentAnalyticsInput) -> StudentAnalytics:
    """
    Analyze a single student's performance.

    Provides predictions, trends, risk assessment, and recommendations.
    """
    try:
        service = get_analytics_service()
        result = await service.analyze_student(
            input_data.student_id,
            input_data.academic_data,
            input_data.attendance_data,
            input_data.score_history,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Student analysis failed: {str(e)}")


@router.post("/batch", response_model=BatchAnalytics)
async def analyze_batch(input_data: BatchAnalyticsInput) -> BatchAnalytics:
    """
    Analyze a batch of students.

    Provides aggregate statistics, placement predictions,
    and identifies top performers and at-risk students.
    """
    try:
        service = get_analytics_service()
        result = await service.analyze_batch(
            input_data.batch_id,
            input_data.students_data,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")


@router.post("/aicte-report", response_model=AICTEReportData)
async def generate_aicte_report(input_data: AICTEReportInput) -> AICTEReportData:
    """
    Generate AICTE report data.

    Compiles statistics in AICTE format for regulatory submissions.
    """
    try:
        service = get_analytics_service()
        result = await service.generate_aicte_report(
            input_data.institution_data,
            input_data.placement_data,
            input_data.academic_year,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AICTE report generation failed: {str(e)}")
