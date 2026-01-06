"""Weak Topic Identification Service.

Analyzes student performance data to identify weak areas and provide
targeted recommendations.
"""

import numpy as np
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.services.llm_service import get_llm_service


class TopicPerformance(BaseModel):
    """Performance data for a single topic."""
    topic_id: str
    topic_name: str
    scores: List[float] = Field(default=[])  # Scores from exams/assignments
    time_spent_minutes: Optional[float] = None
    attempt_count: int = 0
    last_attempt_score: Optional[float] = None


class WeakTopicInput(BaseModel):
    """Input for weak topic analysis."""
    student_id: str
    subject_id: str
    subject_name: str
    topics: List[TopicPerformance]
    overall_score: Optional[float] = None
    class_average: Optional[float] = None


class WeakTopic(BaseModel):
    """Identified weak topic with recommendations."""
    topic_id: str
    topic_name: str
    weakness_score: float = Field(..., ge=0, le=1, description="0=strong, 1=very weak")
    average_score: float
    improvement_priority: int = Field(..., ge=1, le=5)
    reasons: List[str] = []
    recommendations: List[str] = []
    suggested_resources: List[str] = []


class WeakTopicAnalysis(BaseModel):
    """Complete weak topic analysis result."""
    student_id: str
    subject_id: str
    subject_name: str
    weak_topics: List[WeakTopic]
    strong_topics: List[str]
    overall_assessment: str
    study_plan: List[Dict[str, Any]]


class WeakTopicService:
    """Service for identifying and analyzing weak topics."""

    def __init__(self):
        """Initialize the service."""
        self.llm = get_llm_service()

    async def analyze(self, input_data: WeakTopicInput) -> WeakTopicAnalysis:
        """Analyze student performance to identify weak topics.

        Args:
            input_data: Student topic performance data

        Returns:
            Comprehensive weak topic analysis
        """
        weak_topics = []
        strong_topics = []

        for topic in input_data.topics:
            # Calculate topic metrics
            metrics = self._calculate_topic_metrics(topic, input_data.class_average)

            if metrics["weakness_score"] > 0.4:  # Threshold for weak topic
                weak_topic = WeakTopic(
                    topic_id=topic.topic_id,
                    topic_name=topic.topic_name,
                    weakness_score=metrics["weakness_score"],
                    average_score=metrics["average_score"],
                    improvement_priority=metrics["priority"],
                    reasons=metrics["reasons"],
                    recommendations=self._generate_recommendations(topic, metrics),
                    suggested_resources=self._suggest_resources(topic.topic_name),
                )
                weak_topics.append(weak_topic)
            elif metrics["average_score"] >= 75:
                strong_topics.append(topic.topic_name)

        # Sort by priority
        weak_topics.sort(key=lambda x: x.improvement_priority)

        # Generate study plan
        study_plan = self._generate_study_plan(weak_topics)

        # Generate overall assessment
        overall_assessment = self._generate_assessment(
            input_data, weak_topics, strong_topics
        )

        return WeakTopicAnalysis(
            student_id=input_data.student_id,
            subject_id=input_data.subject_id,
            subject_name=input_data.subject_name,
            weak_topics=weak_topics,
            strong_topics=strong_topics,
            overall_assessment=overall_assessment,
            study_plan=study_plan,
        )

    def _calculate_topic_metrics(
        self, topic: TopicPerformance, class_average: Optional[float]
    ) -> Dict[str, Any]:
        """Calculate weakness metrics for a topic."""
        reasons = []

        # Average score
        avg_score = np.mean(topic.scores) if topic.scores else 0
        if avg_score == 0:
            avg_score = topic.last_attempt_score or 0

        # Weakness score calculation (0-1, higher = weaker)
        weakness_score = 1 - (avg_score / 100)

        # Check for declining trend
        if len(topic.scores) >= 3:
            recent = topic.scores[-3:]
            if recent[-1] < recent[0]:
                weakness_score += 0.1
                reasons.append("Declining performance trend")

        # Compare to class average
        if class_average and avg_score < class_average - 10:
            weakness_score += 0.1
            reasons.append(f"Below class average by {class_average - avg_score:.1f}%")

        # Low attempt count
        if topic.attempt_count < 2:
            weakness_score += 0.05
            reasons.append("Insufficient practice attempts")

        # Time spent analysis
        if topic.time_spent_minutes and topic.time_spent_minutes < 30:
            reasons.append("Low study time invested")

        # Clamp weakness score
        weakness_score = max(0, min(1, weakness_score))

        # Calculate priority (1=highest, 5=lowest)
        if weakness_score > 0.7:
            priority = 1
        elif weakness_score > 0.55:
            priority = 2
        elif weakness_score > 0.45:
            priority = 3
        elif weakness_score > 0.35:
            priority = 4
        else:
            priority = 5

        if not reasons:
            reasons.append(f"Average score: {avg_score:.1f}%")

        return {
            "average_score": round(avg_score, 1),
            "weakness_score": round(weakness_score, 2),
            "priority": priority,
            "reasons": reasons,
        }

    def _generate_recommendations(
        self, topic: TopicPerformance, metrics: Dict[str, Any]
    ) -> List[str]:
        """Generate improvement recommendations for a topic."""
        recommendations = []

        avg_score = metrics["average_score"]

        if avg_score < 40:
            recommendations.append("Review fundamental concepts from lecture notes")
            recommendations.append("Watch video explanations for core concepts")
            recommendations.append("Seek help from instructor or peers")
        elif avg_score < 60:
            recommendations.append("Practice more solved examples")
            recommendations.append("Attempt medium-difficulty problems")
            recommendations.append("Create summary notes for quick revision")
        else:
            recommendations.append("Focus on advanced problem-solving")
            recommendations.append("Attempt previous year questions")
            recommendations.append("Try timed practice tests")

        if topic.attempt_count < 3:
            recommendations.append("Take more practice quizzes on this topic")

        return recommendations[:4]

    def _suggest_resources(self, topic_name: str) -> List[str]:
        """Suggest learning resources for a topic."""
        # In production, this would fetch from a database of resources
        return [
            f"Video: Introduction to {topic_name}",
            f"Practice Set: {topic_name} Problems",
            f"Study Notes: {topic_name} Key Concepts",
            "Previous Year Questions",
        ]

    def _generate_study_plan(self, weak_topics: List[WeakTopic]) -> List[Dict[str, Any]]:
        """Generate a prioritized study plan."""
        study_plan = []

        for i, topic in enumerate(weak_topics[:5]):  # Top 5 weak topics
            hours = 2 if topic.improvement_priority <= 2 else 1
            study_plan.append({
                "week": (i // 2) + 1,
                "topic": topic.topic_name,
                "hours_recommended": hours,
                "activities": [
                    "Review concepts",
                    "Practice problems",
                    "Take assessment quiz",
                ],
                "milestone": f"Improve {topic.topic_name} score by 15%",
            })

        return study_plan

    def _generate_assessment(
        self,
        input_data: WeakTopicInput,
        weak_topics: List[WeakTopic],
        strong_topics: List[str],
    ) -> str:
        """Generate overall assessment text."""
        total_topics = len(input_data.topics)
        weak_count = len(weak_topics)
        strong_count = len(strong_topics)

        if weak_count == 0:
            return f"Excellent performance in {input_data.subject_name}! All topics show good understanding."
        elif weak_count <= 2:
            return f"Good overall performance in {input_data.subject_name}. Focus on improving {', '.join(t.topic_name for t in weak_topics)} for better results."
        elif weak_count <= total_topics // 2:
            return f"Moderate performance in {input_data.subject_name}. Need targeted improvement in {weak_count} topics. Strong areas: {', '.join(strong_topics[:3])}."
        else:
            return f"Significant improvement needed in {input_data.subject_name}. Recommend reviewing fundamentals and consistent practice across topics."


# Singleton instance
_weak_topic_service: Optional[WeakTopicService] = None


def get_weak_topic_service() -> WeakTopicService:
    """Get singleton service instance."""
    global _weak_topic_service
    if _weak_topic_service is None:
        _weak_topic_service = WeakTopicService()
    return _weak_topic_service
