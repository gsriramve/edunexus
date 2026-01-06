"""API Routers for ML Service."""

from app.routers import (
    score,
    placement,
    weak_topics,
    content,
    resume,
    chatbot,
    analytics,
)

__all__ = [
    "score",
    "placement",
    "weak_topics",
    "content",
    "resume",
    "chatbot",
    "analytics",
]
