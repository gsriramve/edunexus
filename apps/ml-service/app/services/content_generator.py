"""Content Generation Service for Sample Papers and Mock Tests.

Generates AI-powered educational content including:
- Sample question papers
- Mock tests with adaptive difficulty
- Practice questions
- Explanations and solutions
"""

import json
import random
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum

from app.services.llm_service import get_llm_service


class QuestionType(str, Enum):
    """Types of questions."""
    MCQ = "mcq"
    SHORT_ANSWER = "short_answer"
    LONG_ANSWER = "long_answer"
    NUMERICAL = "numerical"
    TRUE_FALSE = "true_false"
    FILL_BLANK = "fill_blank"


class DifficultyLevel(str, Enum):
    """Question difficulty levels."""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    MIXED = "mixed"


class Question(BaseModel):
    """A generated question."""
    id: str
    question_text: str
    question_type: QuestionType
    difficulty: DifficultyLevel
    marks: int
    options: Optional[List[str]] = None  # For MCQ
    correct_answer: str
    explanation: str
    topic: str
    bloom_level: str = "Application"  # Bloom's taxonomy level


class QuestionPaperConfig(BaseModel):
    """Configuration for generating a question paper."""
    subject: str
    topics: List[str]
    total_marks: int = 100
    duration_minutes: int = 180
    difficulty_distribution: Dict[str, float] = Field(
        default={"easy": 0.3, "medium": 0.5, "hard": 0.2}
    )
    question_types: List[QuestionType] = Field(
        default=[QuestionType.MCQ, QuestionType.SHORT_ANSWER, QuestionType.LONG_ANSWER]
    )
    include_solutions: bool = True


class QuestionPaper(BaseModel):
    """Generated question paper."""
    paper_id: str
    title: str
    subject: str
    total_marks: int
    duration_minutes: int
    sections: List[Dict[str, Any]]
    questions: List[Question]
    answer_key: Optional[List[Dict[str, str]]] = None
    instructions: List[str]


class MockTestConfig(BaseModel):
    """Configuration for a mock test."""
    subject: str
    topics: List[str]
    student_level: DifficultyLevel = DifficultyLevel.MEDIUM  # Current student level
    question_count: int = 30
    time_limit_minutes: int = 60
    adaptive: bool = True  # Adjust difficulty based on performance


class MockTest(BaseModel):
    """Generated mock test."""
    test_id: str
    title: str
    subject: str
    questions: List[Question]
    time_limit_minutes: int
    passing_score: int
    adaptive: bool


class ContentGeneratorService:
    """Service for generating educational content."""

    def __init__(self):
        """Initialize the service."""
        self.llm = get_llm_service()
        # Question bank for fallback/faster generation
        self._question_bank: Dict[str, List[Question]] = {}

    async def generate_question_paper(
        self, config: QuestionPaperConfig
    ) -> QuestionPaper:
        """Generate a complete question paper.

        Args:
            config: Paper configuration

        Returns:
            Generated question paper
        """
        questions = []
        sections = []

        # Calculate marks per section/type
        marks_per_type = self._distribute_marks(config)

        # Generate questions for each type
        for qtype, marks in marks_per_type.items():
            section_questions = await self._generate_questions_for_type(
                config.subject,
                config.topics,
                qtype,
                marks,
                config.difficulty_distribution,
            )
            questions.extend(section_questions)
            sections.append({
                "name": f"Section: {qtype.value.replace('_', ' ').title()}",
                "question_type": qtype.value,
                "marks": marks,
                "question_count": len(section_questions),
            })

        # Generate answer key
        answer_key = None
        if config.include_solutions:
            answer_key = [
                {"question_id": q.id, "answer": q.correct_answer}
                for q in questions
            ]

        paper_id = f"paper_{config.subject.lower().replace(' ', '_')}_{random.randint(1000, 9999)}"

        return QuestionPaper(
            paper_id=paper_id,
            title=f"{config.subject} - Sample Question Paper",
            subject=config.subject,
            total_marks=config.total_marks,
            duration_minutes=config.duration_minutes,
            sections=sections,
            questions=questions,
            answer_key=answer_key,
            instructions=self._generate_instructions(config),
        )

    async def generate_mock_test(self, config: MockTestConfig) -> MockTest:
        """Generate an adaptive mock test.

        Args:
            config: Mock test configuration

        Returns:
            Generated mock test
        """
        questions = []

        # Determine difficulty distribution based on student level
        if config.adaptive:
            difficulty_dist = self._get_adaptive_distribution(config.student_level)
        else:
            difficulty_dist = {"easy": 0.33, "medium": 0.34, "hard": 0.33}

        # Generate questions
        questions_per_difficulty = {
            "easy": int(config.question_count * difficulty_dist["easy"]),
            "medium": int(config.question_count * difficulty_dist["medium"]),
            "hard": int(config.question_count * difficulty_dist["hard"]),
        }

        for difficulty, count in questions_per_difficulty.items():
            if count > 0:
                qs = await self._generate_mcq_questions(
                    config.subject,
                    config.topics,
                    DifficultyLevel(difficulty),
                    count,
                )
                questions.extend(qs)

        # Shuffle questions
        random.shuffle(questions)

        # Assign sequential IDs
        for i, q in enumerate(questions, 1):
            q.id = f"q{i}"

        test_id = f"mock_{config.subject.lower().replace(' ', '_')}_{random.randint(1000, 9999)}"

        return MockTest(
            test_id=test_id,
            title=f"{config.subject} - Mock Test",
            subject=config.subject,
            questions=questions,
            time_limit_minutes=config.time_limit_minutes,
            passing_score=int(len(questions) * 0.4),  # 40% passing
            adaptive=config.adaptive,
        )

    async def generate_practice_questions(
        self,
        subject: str,
        topic: str,
        difficulty: DifficultyLevel,
        count: int = 10,
        question_type: QuestionType = QuestionType.MCQ,
    ) -> List[Question]:
        """Generate practice questions for a specific topic.

        Args:
            subject: Subject name
            topic: Specific topic
            difficulty: Difficulty level
            count: Number of questions
            question_type: Type of questions

        Returns:
            List of generated questions
        """
        if question_type == QuestionType.MCQ:
            return await self._generate_mcq_questions(
                subject, [topic], difficulty, count
            )
        else:
            return await self._generate_descriptive_questions(
                subject, topic, difficulty, count, question_type
            )

    async def _generate_questions_for_type(
        self,
        subject: str,
        topics: List[str],
        qtype: QuestionType,
        total_marks: int,
        difficulty_dist: Dict[str, float],
    ) -> List[Question]:
        """Generate questions for a specific type."""
        questions = []

        # Marks per question based on type
        marks_per_q = {
            QuestionType.MCQ: 1,
            QuestionType.TRUE_FALSE: 1,
            QuestionType.FILL_BLANK: 1,
            QuestionType.SHORT_ANSWER: 3,
            QuestionType.NUMERICAL: 4,
            QuestionType.LONG_ANSWER: 10,
        }

        marks = marks_per_q.get(qtype, 2)
        count = total_marks // marks

        # Distribute across difficulties
        for diff, ratio in difficulty_dist.items():
            diff_count = int(count * ratio)
            if diff_count > 0:
                if qtype == QuestionType.MCQ:
                    qs = await self._generate_mcq_questions(
                        subject, topics, DifficultyLevel(diff), diff_count
                    )
                else:
                    qs = await self._generate_descriptive_questions(
                        subject, random.choice(topics), DifficultyLevel(diff),
                        diff_count, qtype
                    )
                questions.extend(qs)

        return questions

    async def _generate_mcq_questions(
        self,
        subject: str,
        topics: List[str],
        difficulty: DifficultyLevel,
        count: int,
    ) -> List[Question]:
        """Generate MCQ questions using LLM."""
        # Try LLM generation first
        try:
            llm_questions = await self.llm.generate_questions(
                subject=subject,
                topic=", ".join(topics),
                difficulty=difficulty.value,
                count=count,
                question_type="mcq",
            )

            questions = []
            for i, q in enumerate(llm_questions):
                if isinstance(q, dict):
                    questions.append(Question(
                        id=f"mcq_{i+1}",
                        question_text=q.get("question", f"Question {i+1}"),
                        question_type=QuestionType.MCQ,
                        difficulty=difficulty,
                        marks=q.get("marks", 1),
                        options=q.get("options", ["A", "B", "C", "D"]),
                        correct_answer=q.get("answer", "A"),
                        explanation=q.get("explanation", ""),
                        topic=random.choice(topics),
                    ))

            if questions:
                return questions[:count]
        except Exception:
            pass

        # Fallback to template-based generation
        return self._generate_template_mcqs(subject, topics, difficulty, count)

    def _generate_template_mcqs(
        self,
        subject: str,
        topics: List[str],
        difficulty: DifficultyLevel,
        count: int,
    ) -> List[Question]:
        """Generate template-based MCQ questions."""
        questions = []
        templates = [
            "Which of the following is correct about {topic}?",
            "What is the primary characteristic of {topic}?",
            "In the context of {topic}, which statement is true?",
            "Which option best describes {topic}?",
            "What is the main purpose of {topic} in {subject}?",
        ]

        for i in range(count):
            topic = random.choice(topics)
            template = random.choice(templates)

            questions.append(Question(
                id=f"mcq_{i+1}",
                question_text=template.format(topic=topic, subject=subject),
                question_type=QuestionType.MCQ,
                difficulty=difficulty,
                marks=1,
                options=["Option A", "Option B", "Option C", "Option D"],
                correct_answer="A",
                explanation=f"This is related to {topic} concepts.",
                topic=topic,
            ))

        return questions

    async def _generate_descriptive_questions(
        self,
        subject: str,
        topic: str,
        difficulty: DifficultyLevel,
        count: int,
        qtype: QuestionType,
    ) -> List[Question]:
        """Generate descriptive (non-MCQ) questions."""
        questions = []
        marks = {
            QuestionType.SHORT_ANSWER: 3,
            QuestionType.LONG_ANSWER: 10,
            QuestionType.NUMERICAL: 4,
        }.get(qtype, 5)

        templates = {
            QuestionType.SHORT_ANSWER: [
                "Briefly explain {topic}.",
                "Define {topic} and list its key features.",
                "What are the applications of {topic}?",
            ],
            QuestionType.LONG_ANSWER: [
                "Explain {topic} in detail with examples.",
                "Discuss the importance of {topic} in {subject}.",
                "Compare and contrast different aspects of {topic}.",
            ],
            QuestionType.NUMERICAL: [
                "Calculate the result for the following {topic} problem.",
                "Solve the following numerical problem related to {topic}.",
            ],
        }

        for i in range(count):
            template = random.choice(templates.get(qtype, templates[QuestionType.SHORT_ANSWER]))

            questions.append(Question(
                id=f"{qtype.value}_{i+1}",
                question_text=template.format(topic=topic, subject=subject),
                question_type=qtype,
                difficulty=difficulty,
                marks=marks,
                correct_answer=f"Reference answer for {topic}",
                explanation=f"Answer should cover key concepts of {topic}.",
                topic=topic,
            ))

        return questions

    def _distribute_marks(self, config: QuestionPaperConfig) -> Dict[QuestionType, int]:
        """Distribute total marks across question types."""
        type_count = len(config.question_types)
        base_marks = config.total_marks // type_count

        distribution = {}
        for qtype in config.question_types:
            distribution[qtype] = base_marks

        # Handle remainder
        remainder = config.total_marks - (base_marks * type_count)
        if config.question_types and remainder > 0:
            distribution[config.question_types[-1]] += remainder

        return distribution

    def _get_adaptive_distribution(
        self, student_level: DifficultyLevel
    ) -> Dict[str, float]:
        """Get difficulty distribution based on student level."""
        distributions = {
            DifficultyLevel.EASY: {"easy": 0.5, "medium": 0.4, "hard": 0.1},
            DifficultyLevel.MEDIUM: {"easy": 0.3, "medium": 0.5, "hard": 0.2},
            DifficultyLevel.HARD: {"easy": 0.2, "medium": 0.4, "hard": 0.4},
            DifficultyLevel.MIXED: {"easy": 0.33, "medium": 0.34, "hard": 0.33},
        }
        return distributions.get(student_level, distributions[DifficultyLevel.MEDIUM])

    def _generate_instructions(self, config: QuestionPaperConfig) -> List[str]:
        """Generate paper instructions."""
        return [
            f"Total Marks: {config.total_marks}",
            f"Duration: {config.duration_minutes} minutes",
            "Answer all questions.",
            "Read each question carefully before answering.",
            "For MCQs, choose the most appropriate option.",
            "For descriptive questions, write clear and concise answers.",
            "Rough work can be done on the last page.",
        ]


# Singleton instance
_content_generator: Optional[ContentGeneratorService] = None


def get_content_generator() -> ContentGeneratorService:
    """Get singleton service instance."""
    global _content_generator
    if _content_generator is None:
        _content_generator = ContentGeneratorService()
    return _content_generator
