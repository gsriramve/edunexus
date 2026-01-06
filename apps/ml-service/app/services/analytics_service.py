"""Predictive Analytics Service.

Provides analytics and predictions for:
- Student performance trends
- Batch-level analytics
- Placement predictions at scale
- AICTE report generation
"""

import numpy as np
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, date
from enum import Enum

from app.models.score_predictor.predictor import ScorePredictor
from app.models.placement_predictor.predictor import PlacementPredictor
from app.schemas.score import ScoreInput
from app.schemas.placement import PlacementInput, Branch


class TrendDirection(str, Enum):
    """Trend direction."""
    UP = "up"
    DOWN = "down"
    STABLE = "stable"


class RiskLevel(str, Enum):
    """Student risk level."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class StudentAnalytics(BaseModel):
    """Analytics for a single student."""
    student_id: str
    predicted_score: Optional[float] = None
    placement_probability: Optional[float] = None
    attendance_trend: TrendDirection = TrendDirection.STABLE
    performance_trend: TrendDirection = TrendDirection.STABLE
    risk_level: RiskLevel = RiskLevel.LOW
    risk_factors: List[str] = []
    recommendations: List[str] = []


class BatchAnalytics(BaseModel):
    """Analytics for a batch of students."""
    batch_id: str
    total_students: int
    average_cgpa: float
    placement_eligible_count: int
    placement_eligible_percentage: float
    predicted_placement_rate: float
    at_risk_count: int
    performance_distribution: Dict[str, int]
    placement_predictions: Dict[str, int]  # Salary band distribution
    top_performers: List[str]
    at_risk_students: List[str]


class DepartmentAnalytics(BaseModel):
    """Analytics for a department."""
    department_id: str
    department_name: str
    total_students: int
    average_cgpa: float
    attendance_percentage: float
    placement_rate: float
    predicted_placement_rate: float
    subject_performance: List[Dict[str, Any]]
    faculty_workload: Dict[str, float]
    trends: Dict[str, TrendDirection]


class AICTEReportData(BaseModel):
    """Data for AICTE report generation."""
    institution_name: str
    academic_year: str
    total_intake: int
    total_enrolled: int
    faculty_count: int
    faculty_student_ratio: float
    placement_statistics: Dict[str, Any]
    pass_percentage: float
    average_salary_lpa: float
    highest_salary_lpa: float
    companies_visited: int
    students_placed: int


class AnalyticsService:
    """Service for predictive analytics."""

    def __init__(self):
        """Initialize analytics service."""
        self.score_predictor = ScorePredictor()
        self.placement_predictor = PlacementPredictor()

    async def analyze_student(
        self,
        student_id: str,
        academic_data: Dict[str, Any],
        attendance_data: List[float],
        score_history: List[float],
    ) -> StudentAnalytics:
        """Analyze a single student's performance.

        Args:
            student_id: Student identifier
            academic_data: CGPA, branch, etc.
            attendance_data: Monthly attendance percentages
            score_history: Recent exam scores

        Returns:
            Student analytics with predictions
        """
        risk_factors = []
        recommendations = []

        # Analyze attendance trend
        attendance_trend = self._calculate_trend(attendance_data)
        if attendance_trend == TrendDirection.DOWN:
            risk_factors.append("Declining attendance")
            recommendations.append("Improve attendance to at least 75%")

        # Analyze performance trend
        performance_trend = self._calculate_trend(score_history)
        if performance_trend == TrendDirection.DOWN:
            risk_factors.append("Declining academic performance")
            recommendations.append("Focus on weak subjects and seek help")

        # Check current attendance
        current_attendance = attendance_data[-1] if attendance_data else 0
        if current_attendance < 75:
            risk_factors.append(f"Low attendance: {current_attendance:.1f}%")

        # Check CGPA
        cgpa = academic_data.get("cgpa", 0)
        if cgpa < 6.0:
            risk_factors.append(f"Low CGPA: {cgpa}")
            recommendations.append("Focus on improving grades")

        # Calculate risk level
        risk_level = self._calculate_risk_level(risk_factors, cgpa, current_attendance)

        # Predict score if enough data
        predicted_score = None
        if score_history:
            try:
                score_input = ScoreInput(
                    student_id=student_id,
                    subject_id="overall",
                    past_scores=score_history[-5:],
                    attendance_percentage=current_attendance,
                    assignment_scores=[],
                    practice_scores=[],
                )
                prediction = self.score_predictor.predict(score_input)
                predicted_score = prediction.predicted_score
            except Exception:
                pass

        # Predict placement probability
        placement_probability = None
        branch = academic_data.get("branch", "OTHER")
        try:
            placement_input = PlacementInput(
                student_id=student_id,
                cgpa=cgpa,
                branch=Branch(branch) if branch in [b.value for b in Branch] else Branch.OTHER,
                backlogs=academic_data.get("backlogs", 0),
                skills=academic_data.get("skills", []),
                internship_count=academic_data.get("internships", 0),
                project_count=academic_data.get("projects", 0),
                certification_count=academic_data.get("certifications", 0),
            )
            placement_pred = self.placement_predictor.predict(placement_input)
            placement_probability = placement_pred.placement_probability
        except Exception:
            pass

        # Add placement recommendations
        if placement_probability and placement_probability < 0.5:
            recommendations.append("Focus on skill development and certifications")
            recommendations.append("Complete at least one internship")

        return StudentAnalytics(
            student_id=student_id,
            predicted_score=predicted_score,
            placement_probability=placement_probability,
            attendance_trend=attendance_trend,
            performance_trend=performance_trend,
            risk_level=risk_level,
            risk_factors=risk_factors,
            recommendations=recommendations[:5],
        )

    async def analyze_batch(
        self,
        batch_id: str,
        students_data: List[Dict[str, Any]],
    ) -> BatchAnalytics:
        """Analyze a batch of students.

        Args:
            batch_id: Batch identifier
            students_data: List of student data dictionaries

        Returns:
            Batch-level analytics
        """
        total_students = len(students_data)
        if total_students == 0:
            return BatchAnalytics(
                batch_id=batch_id,
                total_students=0,
                average_cgpa=0,
                placement_eligible_count=0,
                placement_eligible_percentage=0,
                predicted_placement_rate=0,
                at_risk_count=0,
                performance_distribution={},
                placement_predictions={},
                top_performers=[],
                at_risk_students=[],
            )

        # Calculate metrics
        cgpas = [s.get("cgpa", 0) for s in students_data]
        average_cgpa = np.mean(cgpas)

        # Placement eligibility (CGPA >= 6.0, no active backlogs)
        eligible = [
            s for s in students_data
            if s.get("cgpa", 0) >= 6.0 and s.get("backlogs", 0) == 0
        ]
        placement_eligible_count = len(eligible)
        placement_eligible_percentage = (placement_eligible_count / total_students) * 100

        # Performance distribution
        performance_distribution = {
            "excellent": len([c for c in cgpas if c >= 9.0]),
            "good": len([c for c in cgpas if 8.0 <= c < 9.0]),
            "average": len([c for c in cgpas if 6.0 <= c < 8.0]),
            "below_average": len([c for c in cgpas if c < 6.0]),
        }

        # Predict placement for each student
        placement_predictions = {
            "Above 20 LPA": 0,
            "12-20 LPA": 0,
            "8-12 LPA": 0,
            "5-8 LPA": 0,
            "3-5 LPA": 0,
            "Below 3 LPA": 0,
        }

        at_risk_students = []
        top_performers = []
        placed_count = 0

        for student in students_data:
            try:
                branch = student.get("branch", "OTHER")
                placement_input = PlacementInput(
                    student_id=student.get("id", ""),
                    cgpa=student.get("cgpa", 0),
                    branch=Branch(branch) if branch in [b.value for b in Branch] else Branch.OTHER,
                    backlogs=student.get("backlogs", 0),
                    skills=student.get("skills", []),
                    internship_count=student.get("internships", 0),
                    project_count=student.get("projects", 0),
                    certification_count=student.get("certifications", 0),
                )
                pred = self.placement_predictor.predict(placement_input)

                # Count by salary band
                band = pred.salary_band.value
                if band in placement_predictions:
                    placement_predictions[band] += 1

                # Count as placed if probability > 0.5
                if pred.placement_probability > 0.5:
                    placed_count += 1

                # Identify top performers (high probability, high salary)
                if pred.placement_probability > 0.8 and student.get("cgpa", 0) >= 8.0:
                    top_performers.append(student.get("id", ""))

                # Identify at-risk students
                if pred.placement_probability < 0.3 or student.get("cgpa", 0) < 6.0:
                    at_risk_students.append(student.get("id", ""))

            except Exception:
                pass

        predicted_placement_rate = (placed_count / total_students) * 100 if total_students > 0 else 0

        return BatchAnalytics(
            batch_id=batch_id,
            total_students=total_students,
            average_cgpa=round(average_cgpa, 2),
            placement_eligible_count=placement_eligible_count,
            placement_eligible_percentage=round(placement_eligible_percentage, 1),
            predicted_placement_rate=round(predicted_placement_rate, 1),
            at_risk_count=len(at_risk_students),
            performance_distribution=performance_distribution,
            placement_predictions=placement_predictions,
            top_performers=top_performers[:10],
            at_risk_students=at_risk_students[:10],
        )

    async def generate_aicte_report(
        self,
        institution_data: Dict[str, Any],
        placement_data: Dict[str, Any],
        academic_year: str,
    ) -> AICTEReportData:
        """Generate AICTE report data.

        Args:
            institution_data: Institution details
            placement_data: Placement statistics
            academic_year: Academic year string

        Returns:
            AICTE report data
        """
        total_intake = institution_data.get("total_intake", 0)
        total_enrolled = institution_data.get("total_enrolled", 0)
        faculty_count = institution_data.get("faculty_count", 0)

        faculty_student_ratio = (
            total_enrolled / faculty_count if faculty_count > 0 else 0
        )

        # Placement stats
        students_placed = placement_data.get("placed_count", 0)
        total_eligible = placement_data.get("eligible_count", total_enrolled)
        placement_rate = (
            (students_placed / total_eligible) * 100 if total_eligible > 0 else 0
        )

        placement_statistics = {
            "total_eligible": total_eligible,
            "students_placed": students_placed,
            "placement_percentage": round(placement_rate, 1),
            "companies_participated": placement_data.get("companies", 0),
            "offers_made": placement_data.get("offers", students_placed),
            "branch_wise_placement": placement_data.get("branch_wise", {}),
        }

        return AICTEReportData(
            institution_name=institution_data.get("name", ""),
            academic_year=academic_year,
            total_intake=total_intake,
            total_enrolled=total_enrolled,
            faculty_count=faculty_count,
            faculty_student_ratio=round(faculty_student_ratio, 1),
            placement_statistics=placement_statistics,
            pass_percentage=placement_data.get("pass_percentage", 0),
            average_salary_lpa=placement_data.get("average_salary", 0),
            highest_salary_lpa=placement_data.get("highest_salary", 0),
            companies_visited=placement_data.get("companies", 0),
            students_placed=students_placed,
        )

    def _calculate_trend(self, data: List[float]) -> TrendDirection:
        """Calculate trend from a list of values."""
        if len(data) < 3:
            return TrendDirection.STABLE

        # Simple linear regression slope
        x = np.arange(len(data))
        y = np.array(data)
        slope = np.polyfit(x, y, 1)[0]

        if slope > 2:
            return TrendDirection.UP
        elif slope < -2:
            return TrendDirection.DOWN
        return TrendDirection.STABLE

    def _calculate_risk_level(
        self,
        risk_factors: List[str],
        cgpa: float,
        attendance: float,
    ) -> RiskLevel:
        """Calculate overall risk level."""
        risk_score = len(risk_factors)

        if cgpa < 5.0:
            risk_score += 2
        elif cgpa < 6.0:
            risk_score += 1

        if attendance < 60:
            risk_score += 2
        elif attendance < 75:
            risk_score += 1

        if risk_score >= 4:
            return RiskLevel.HIGH
        elif risk_score >= 2:
            return RiskLevel.MEDIUM
        return RiskLevel.LOW


# Singleton instance
_analytics_service: Optional[AnalyticsService] = None


def get_analytics_service() -> AnalyticsService:
    """Get singleton service instance."""
    global _analytics_service
    if _analytics_service is None:
        _analytics_service = AnalyticsService()
    return _analytics_service
