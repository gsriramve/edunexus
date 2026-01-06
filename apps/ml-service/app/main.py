"""
EduNexus ML Service - AI/ML Service for Educational Analytics.

This service handles:
- Score Prediction (PyTorch LSTM)
- Placement Prediction (XGBoost)
- Weak Topic Identification
- Content Generation (Sample Papers, Mock Tests)
- AI Resume Builder
- AI Chatbot for Support
- Predictive Analytics
- AICTE Report Generation
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    score,
    placement,
    weak_topics,
    content,
    resume,
    chatbot,
    analytics,
)
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title="EduNexus ML Service",
    description="""
    AI/ML Service for EduNexus - Engineering College Management Platform.

    ## Features

    - **Score Prediction**: Predict exam scores using historical data
    - **Placement Prediction**: Predict placement probability and salary bands
    - **Weak Topic Identification**: Identify areas needing improvement
    - **Content Generation**: Generate sample papers and mock tests
    - **Resume Builder**: AI-powered professional resume generation
    - **Chatbot**: Intelligent student support chatbot
    - **Analytics**: Predictive analytics for students and batches
    - **AICTE Reports**: Auto-generate regulatory reports
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    score.router,
    prefix="/predict",
    tags=["Score Prediction"]
)
app.include_router(
    placement.router,
    prefix="/predict",
    tags=["Placement Prediction"]
)
app.include_router(
    weak_topics.router,
    prefix="/analyze",
    tags=["Weak Topic Identification"]
)
app.include_router(
    content.router,
    prefix="/generate",
    tags=["Content Generation"]
)
app.include_router(
    resume.router,
    prefix="/generate",
    tags=["Resume Builder"]
)
app.include_router(
    chatbot.router,
    prefix="/support",
    tags=["AI Chatbot"]
)
app.include_router(
    analytics.router,
    prefix="/analytics",
    tags=["Predictive Analytics"]
)


@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes probes."""
    return {
        "status": "healthy",
        "service": "ml-service",
        "version": "1.0.0",
    }


@app.get("/")
async def root():
    """Root endpoint with service info."""
    return {
        "service": "EduNexus ML Service",
        "version": "1.0.0",
        "description": "AI/ML Service for Educational Analytics",
        "endpoints": {
            "predictions": {
                "score": "/predict/score",
                "placement": "/predict/placement",
            },
            "analysis": {
                "weak_topics": "/analyze/weak-topics",
            },
            "generation": {
                "question_paper": "/generate/question-paper",
                "mock_test": "/generate/mock-test",
                "practice_questions": "/generate/practice-questions",
                "resume": "/generate/resume",
            },
            "support": {
                "chat": "/support/chat",
                "suggestions": "/support/chat/suggestions",
            },
            "analytics": {
                "student": "/analytics/student",
                "batch": "/analytics/batch",
                "aicte_report": "/analytics/aicte-report",
            },
            "system": {
                "health": "/health",
                "docs": "/docs",
            },
        },
    }
