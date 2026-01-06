"""Placement Prediction Router."""

from fastapi import APIRouter, HTTPException

from app.schemas.placement import (
    PlacementInput,
    PlacementPrediction,
    BatchPlacementInput,
    BatchPlacementPrediction,
)
from app.models.placement_predictor.predictor import PlacementPredictor

router = APIRouter()

# Initialize predictor (lazy loading of model)
predictor = PlacementPredictor()


@router.post("/placement", response_model=PlacementPrediction)
async def predict_placement(input_data: PlacementInput) -> PlacementPrediction:
    """
    Predict placement probability and salary band for a student.

    Uses XGBoost ensemble model trained on historical placement data.
    """
    try:
        prediction = predictor.predict(input_data)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/placement/batch", response_model=BatchPlacementPrediction)
async def predict_placement_batch(
    input_data: BatchPlacementInput
) -> BatchPlacementPrediction:
    """
    Batch predict placement for multiple students.

    Useful for generating batch-level analytics.
    """
    try:
        predictions = [predictor.predict(item) for item in input_data.predictions]
        return BatchPlacementPrediction(
            predictions=predictions,
            total_processed=len(predictions)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")
