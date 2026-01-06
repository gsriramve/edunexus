"""Pydantic schemas for ML Service API."""

from app.schemas.score import (
    ScoreInput,
    ScorePrediction,
    BatchScoreInput,
    BatchScorePrediction,
)
from app.schemas.placement import (
    PlacementInput,
    PlacementPrediction,
    BatchPlacementInput,
    BatchPlacementPrediction,
    Branch,
    SalaryBand,
)

__all__ = [
    "ScoreInput",
    "ScorePrediction",
    "BatchScoreInput",
    "BatchScorePrediction",
    "PlacementInput",
    "PlacementPrediction",
    "BatchPlacementInput",
    "BatchPlacementPrediction",
    "Branch",
    "SalaryBand",
]
