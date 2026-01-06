"""Chatbot Router."""

from fastapi import APIRouter, HTTPException
from typing import List

from app.services.chatbot_service import (
    ChatbotService,
    ChatInput,
    ChatResponse,
    get_chatbot_service,
)

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(input_data: ChatInput) -> ChatResponse:
    """
    Process a chat message and generate a response.

    Handles student queries about academics, administration,
    career, and general support topics.
    """
    try:
        service = get_chatbot_service()
        result = await service.chat(input_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")


@router.get("/chat/suggestions", response_model=List[str])
async def get_suggestions(partial_message: str) -> List[str]:
    """
    Get autocomplete suggestions for a partial message.

    Returns common queries that match the partial input.
    """
    try:
        service = get_chatbot_service()
        result = await service.get_suggestions(partial_message)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get suggestions: {str(e)}")
