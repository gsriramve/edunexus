"""Placement Prediction Model using XGBoost.

This module contains the placement prediction logic. In production, this will:
1. Load a trained XGBoost ensemble model
2. Process input features
3. Return placement probability and salary band predictions

For now, this is a placeholder implementation.
"""

import numpy as np
from typing import List, Optional

from app.schemas.placement import (
    PlacementInput,
    PlacementPrediction,
    SalaryBand,
    Branch,
)


class PlacementPredictor:
    """Placement prediction using XGBoost ensemble model."""

    def __init__(self, model_path: Optional[str] = None):
        """Initialize the predictor.

        Args:
            model_path: Path to the trained model weights (.pkl file)
        """
        self.model = None
        self.model_path = model_path
        self._load_model()

    def _load_model(self):
        """Load the trained model.

        TODO: Implement actual model loading when model is trained.
        """
        # Placeholder - will load actual XGBoost model in production
        pass

    def predict(self, input_data: PlacementInput) -> PlacementPrediction:
        """Generate placement prediction for a student.

        Args:
            input_data: Input features for prediction

        Returns:
            PlacementPrediction with probability, salary band, and insights
        """
        # Placeholder prediction logic
        # In production, this will use the actual trained model

        # Calculate base probability from CGPA
        cgpa_factor = input_data.cgpa / 10.0

        # Penalize for backlogs
        backlog_penalty = min(0.3, input_data.backlogs * 0.1)

        # Skill scores factor
        skill_factor = self._calculate_skill_factor(input_data)

        # Experience factor
        exp_factor = self._calculate_experience_factor(input_data)

        # Branch factor (some branches have higher placement rates)
        branch_factor = self._get_branch_factor(input_data.branch)

        # Calculate probability
        probability = (
            0.3 * cgpa_factor
            + 0.25 * skill_factor
            + 0.2 * exp_factor
            + 0.15 * branch_factor
            - backlog_penalty
            + 0.1  # Base probability
        )

        # Clamp to valid range
        probability = max(0.05, min(0.95, probability))

        # Determine salary band based on probability and skills
        salary_band, salary_min, salary_max = self._determine_salary_band(
            probability, input_data
        )

        # Get skill gaps
        skill_gaps = self._identify_skill_gaps(input_data)

        # Generate recommendations
        recommendations = self._generate_recommendations(input_data, probability)

        # Get matching companies (placeholder)
        top_companies = self._get_matching_companies(input_data, probability)

        return PlacementPrediction(
            student_id=input_data.student_id,
            placement_probability=round(probability, 2),
            salary_band=salary_band,
            expected_salary_min=salary_min,
            expected_salary_max=salary_max,
            top_companies=top_companies,
            skill_gaps=skill_gaps,
            recommendations=recommendations,
        )

    def _calculate_skill_factor(self, input_data: PlacementInput) -> float:
        """Calculate skill factor from coding, aptitude, and communication scores."""
        scores = []
        if input_data.coding_score is not None:
            scores.append(input_data.coding_score)
        if input_data.aptitude_score is not None:
            scores.append(input_data.aptitude_score)
        if input_data.communication_score is not None:
            scores.append(input_data.communication_score)

        if not scores:
            return 0.5  # Default if no scores

        return np.mean(scores) / 100.0

    def _calculate_experience_factor(self, input_data: PlacementInput) -> float:
        """Calculate experience factor from internships, projects, certifications."""
        factor = 0.5  # Base

        # Internships (max 0.3 contribution)
        factor += min(0.3, input_data.internship_count * 0.1)

        # Projects (max 0.15 contribution)
        factor += min(0.15, input_data.project_count * 0.03)

        # Certifications (max 0.05 contribution)
        factor += min(0.05, input_data.certification_count * 0.01)

        return min(1.0, factor)

    def _get_branch_factor(self, branch: Branch) -> float:
        """Get placement factor based on branch."""
        branch_factors = {
            Branch.CSE: 0.9,
            Branch.IT: 0.85,
            Branch.ECE: 0.75,
            Branch.EEE: 0.70,
            Branch.MECH: 0.65,
            Branch.CIVIL: 0.60,
            Branch.OTHER: 0.65,
        }
        return branch_factors.get(branch, 0.65)

    def _determine_salary_band(
        self, probability: float, input_data: PlacementInput
    ) -> tuple[SalaryBand, float, float]:
        """Determine salary band based on probability and profile."""
        # High probability + good CGPA + CSE/IT = higher salary
        score = probability * 0.5 + (input_data.cgpa / 10) * 0.5

        if input_data.branch in [Branch.CSE, Branch.IT]:
            score *= 1.2

        if input_data.coding_score and input_data.coding_score > 80:
            score *= 1.1

        if score > 0.9:
            return SalaryBand.ABOVE_20, 20.0, 50.0
        elif score > 0.8:
            return SalaryBand.LPA_12_20, 12.0, 20.0
        elif score > 0.65:
            return SalaryBand.LPA_8_12, 8.0, 12.0
        elif score > 0.5:
            return SalaryBand.LPA_5_8, 5.0, 8.0
        elif score > 0.35:
            return SalaryBand.LPA_3_5, 3.0, 5.0
        else:
            return SalaryBand.BELOW_3, 2.0, 3.0

    def _identify_skill_gaps(self, input_data: PlacementInput) -> List[str]:
        """Identify skill gaps based on input data."""
        gaps = []

        if input_data.coding_score is None or input_data.coding_score < 60:
            gaps.append("Programming & DSA")

        if input_data.aptitude_score is None or input_data.aptitude_score < 60:
            gaps.append("Aptitude (Quantitative & Logical)")

        if input_data.communication_score is None or input_data.communication_score < 60:
            gaps.append("Communication Skills")

        if input_data.internship_count == 0:
            gaps.append("Industry Experience")

        # Check for common in-demand skills
        common_skills = {"python", "java", "sql", "aws", "git", "docker"}
        student_skills = set(s.lower() for s in input_data.skills)

        missing_basics = common_skills - student_skills
        if missing_basics:
            gaps.append(f"Technical Skills: {', '.join(list(missing_basics)[:3])}")

        return gaps[:5]  # Return top 5 gaps

    def _generate_recommendations(
        self, input_data: PlacementInput, probability: float
    ) -> List[str]:
        """Generate personalized recommendations."""
        recommendations = []

        if input_data.cgpa < 7.0:
            recommendations.append("Focus on improving CGPA above 7.0")

        if input_data.backlogs > 0:
            recommendations.append("Clear pending backlogs")

        if input_data.internship_count == 0:
            recommendations.append("Complete at least one internship")

        if input_data.coding_score is None or input_data.coding_score < 70:
            recommendations.append("Practice coding daily on platforms like LeetCode")

        if input_data.certification_count == 0:
            recommendations.append("Get certified in relevant technologies")

        if probability < 0.5:
            recommendations.append("Join placement preparation programs")

        return recommendations[:4]  # Return top 4 recommendations

    def _get_matching_companies(
        self, input_data: PlacementInput, probability: float
    ) -> List[str]:
        """Get matching companies based on profile.

        TODO: Replace with actual company matching from database.
        """
        # Placeholder company lists
        if probability > 0.8 and input_data.cgpa > 8:
            return ["Google", "Microsoft", "Amazon", "Flipkart", "Adobe"]
        elif probability > 0.6:
            return ["TCS", "Infosys", "Wipro", "Cognizant", "Accenture"]
        else:
            return ["TCS", "Infosys", "Wipro", "HCL", "Tech Mahindra"]
