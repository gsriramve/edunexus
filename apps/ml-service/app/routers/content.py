"""Content Generation Router - Sample Papers & Mock Tests."""

from fastapi import APIRouter, HTTPException
from typing import List

from app.services.content_generator import (
    ContentGeneratorService,
    QuestionPaperConfig,
    QuestionPaper,
    MockTestConfig,
    MockTest,
    Question,
    QuestionType,
    DifficultyLevel,
    get_content_generator,
)

router = APIRouter()


@router.post("/question-paper", response_model=QuestionPaper)
async def generate_question_paper(config: QuestionPaperConfig) -> QuestionPaper:
    """
    Generate a complete question paper for a subject.

    Creates a paper with multiple sections and question types,
    distributed across difficulty levels.
    """
    try:
        service = get_content_generator()
        result = await service.generate_question_paper(config)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Paper generation failed: {str(e)}")


@router.post("/mock-test", response_model=MockTest)
async def generate_mock_test(config: MockTestConfig) -> MockTest:
    """
    Generate an adaptive mock test.

    Creates a timed test with questions adapted to student level.
    Difficulty adjusts based on the student_level parameter.
    """
    try:
        service = get_content_generator()
        result = await service.generate_mock_test(config)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mock test generation failed: {str(e)}")


@router.post("/practice-questions", response_model=List[Question])
async def generate_practice_questions(
    subject: str,
    topic: str,
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM,
    count: int = 10,
    question_type: QuestionType = QuestionType.MCQ,
) -> List[Question]:
    """
    Generate practice questions for a specific topic.

    Creates questions for targeted practice on weak areas.
    """
    try:
        service = get_content_generator()
        result = await service.generate_practice_questions(
            subject, topic, difficulty, count, question_type
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")
