"""
EduNexus ML Service - Minimal Python service for ML inference only.

This service handles:
- Score Prediction (PyTorch LSTM)
- Placement Prediction (XGBoost)

All other AI functionality (LLM, RAG, Chatbot) is handled by NestJS.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import score, placement

app = FastAPI(
    title="EduNexus ML Service",
    description="ML inference service for score and placement predictions",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(score.router, prefix="/predict", tags=["Score Prediction"])
app.include_router(placement.router, prefix="/predict", tags=["Placement Prediction"])


@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes probes."""
    return {"status": "healthy", "service": "ml-service"}


@app.get("/")
async def root():
    """Root endpoint with service info."""
    return {
        "service": "EduNexus ML Service",
        "version": "0.1.0",
        "endpoints": {
            "score_prediction": "/predict/score",
            "placement_prediction": "/predict/placement",
            "health": "/health",
            "docs": "/docs",
        },
    }
