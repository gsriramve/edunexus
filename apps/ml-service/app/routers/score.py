"""Score Prediction Router."""

from fastapi import APIRouter, HTTPException
from typing import List

from app.schemas.score import (
    ScoreInput,
    ScorePrediction,
    BatchScoreInput,
    BatchScorePrediction,
)
from app.models.score_predictor.predictor import ScorePredictor

router = APIRouter()

# Initialize predictor (lazy loading of model)
predictor = ScorePredictor()


@router.post("/score", response_model=ScorePrediction)
async def predict_score(input_data: ScoreInput) -> ScorePrediction:
    """
    Predict exam score for a student in a subject.

    Uses PyTorch LSTM model trained on historical student data.
    """
    try:
        prediction = predictor.predict(input_data)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/score/batch", response_model=BatchScorePrediction)
async def predict_score_batch(input_data: BatchScoreInput) -> BatchScorePrediction:
    """
    Batch predict exam scores for multiple students.

    More efficient for processing multiple predictions at once.
    """
    try:
        predictions = [predictor.predict(item) for item in input_data.predictions]
        return BatchScorePrediction(
            predictions=predictions,
            total_processed=len(predictions)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")
