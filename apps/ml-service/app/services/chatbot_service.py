"""AI Chatbot Service for Student Support.

Provides intelligent responses to student queries about:
- Academic topics
- College procedures
- Career guidance
- General support
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime

from app.services.llm_service import get_llm_service


class ChatCategory(str, Enum):
    """Categories of chat queries."""
    ACADEMIC = "academic"
    ADMINISTRATIVE = "administrative"
    CAREER = "career"
    TECHNICAL = "technical"
    GENERAL = "general"


class ChatMessage(BaseModel):
    """A chat message."""
    role: str = Field(..., description="'user' or 'assistant'")
    content: str
    timestamp: Optional[str] = None
    category: Optional[ChatCategory] = None


class ChatInput(BaseModel):
    """Input for chat."""
    message: str
    student_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    """Chat response."""
    response: str
    category: ChatCategory
    confidence: float = Field(..., ge=0, le=1)
    suggested_actions: List[str] = []
    related_resources: List[Dict[str, str]] = []
    escalate_to_human: bool = False


class FAQItem(BaseModel):
    """A frequently asked question."""
    question: str
    answer: str
    category: ChatCategory
    keywords: List[str] = []


class ChatbotService:
    """AI-powered chatbot for student support."""

    def __init__(self):
        """Initialize the chatbot service."""
        self.llm = get_llm_service()
        self._faq_database = self._load_faq_database()

    def _load_faq_database(self) -> List[FAQItem]:
        """Load FAQ database for quick responses."""
        return [
            FAQItem(
                question="How do I pay my fees?",
                answer="You can pay your fees through the Student Portal > Fees section. We accept UPI, credit/debit cards, and net banking via Razorpay.",
                category=ChatCategory.ADMINISTRATIVE,
                keywords=["fee", "payment", "pay", "dues"],
            ),
            FAQItem(
                question="How do I check my attendance?",
                answer="Your attendance can be viewed in the Student Portal under the Attendance section. You can see subject-wise and overall attendance percentages.",
                category=ChatCategory.ACADEMIC,
                keywords=["attendance", "absent", "present"],
            ),
            FAQItem(
                question="How do I apply for leave?",
                answer="To apply for leave, go to Student Portal > Attendance > Apply Leave. Fill in the dates and reason, then submit for approval.",
                category=ChatCategory.ADMINISTRATIVE,
                keywords=["leave", "absence", "holiday"],
            ),
            FAQItem(
                question="When are the exams?",
                answer="Exam schedules are posted in the Student Portal > Exams section. You can view upcoming exams, seating arrangements, and download hall tickets.",
                category=ChatCategory.ACADEMIC,
                keywords=["exam", "test", "schedule", "date"],
            ),
            FAQItem(
                question="How do I access study materials?",
                answer="Study materials uploaded by teachers are available in Student Portal > Academics > Materials. You can download PDFs, view videos, and access other resources.",
                category=ChatCategory.ACADEMIC,
                keywords=["material", "notes", "pdf", "study", "download"],
            ),
            FAQItem(
                question="How do I check placement updates?",
                answer="Visit the Career Hub section for placement announcements, company visits, and application tracking. Enable notifications to stay updated.",
                category=ChatCategory.CAREER,
                keywords=["placement", "job", "company", "career", "interview"],
            ),
            FAQItem(
                question="How do I update my profile?",
                answer="Go to Student Portal > Profile to update your personal information, contact details, and documents. Keep your profile updated for placements.",
                category=ChatCategory.ADMINISTRATIVE,
                keywords=["profile", "update", "edit", "information", "details"],
            ),
            FAQItem(
                question="How do I contact my teacher?",
                answer="You can message your teachers through the Communication section in your portal. Select the teacher and send your query.",
                category=ChatCategory.GENERAL,
                keywords=["teacher", "faculty", "contact", "message", "doubt"],
            ),
        ]

    async def chat(self, input_data: ChatInput) -> ChatResponse:
        """Process a chat message and generate response.

        Args:
            input_data: Chat input with message and context

        Returns:
            Chat response with suggestions
        """
        message = input_data.message.lower()

        # First, check FAQ database for quick matches
        faq_response = self._check_faq(message)
        if faq_response:
            return faq_response

        # Classify the query
        category = self._classify_query(message)

        # Generate response using LLM
        response = await self._generate_response(input_data, category)

        # Extract suggested actions
        suggested_actions = self._get_suggested_actions(category, message)

        # Get related resources
        resources = self._get_related_resources(category)

        # Determine if human escalation is needed
        escalate = self._should_escalate(message, category)

        return ChatResponse(
            response=response,
            category=category,
            confidence=0.85 if not escalate else 0.5,
            suggested_actions=suggested_actions,
            related_resources=resources,
            escalate_to_human=escalate,
        )

    def _check_faq(self, message: str) -> Optional[ChatResponse]:
        """Check if message matches a FAQ."""
        message_words = set(message.split())

        best_match = None
        best_score = 0

        for faq in self._faq_database:
            # Calculate keyword match score
            keyword_matches = sum(1 for kw in faq.keywords if kw in message)
            score = keyword_matches / len(faq.keywords) if faq.keywords else 0

            if score > best_score and score >= 0.5:
                best_score = score
                best_match = faq

        if best_match:
            return ChatResponse(
                response=best_match.answer,
                category=best_match.category,
                confidence=min(0.95, best_score + 0.3),
                suggested_actions=self._get_suggested_actions(best_match.category, message),
                related_resources=self._get_related_resources(best_match.category),
                escalate_to_human=False,
            )

        return None

    def _classify_query(self, message: str) -> ChatCategory:
        """Classify the query into a category."""
        # Keyword-based classification
        academic_keywords = ["exam", "marks", "grade", "subject", "syllabus", "attendance", "assignment", "lecture"]
        admin_keywords = ["fee", "payment", "certificate", "document", "leave", "transfer", "admission"]
        career_keywords = ["job", "placement", "company", "interview", "resume", "internship", "career"]
        technical_keywords = ["error", "login", "password", "app", "website", "portal", "bug", "not working"]

        message_lower = message.lower()

        if any(kw in message_lower for kw in academic_keywords):
            return ChatCategory.ACADEMIC
        elif any(kw in message_lower for kw in admin_keywords):
            return ChatCategory.ADMINISTRATIVE
        elif any(kw in message_lower for kw in career_keywords):
            return ChatCategory.CAREER
        elif any(kw in message_lower for kw in technical_keywords):
            return ChatCategory.TECHNICAL

        return ChatCategory.GENERAL

    async def _generate_response(
        self, input_data: ChatInput, category: ChatCategory
    ) -> str:
        """Generate response using LLM."""
        system_prompts = {
            ChatCategory.ACADEMIC: "You are a helpful academic advisor for engineering college students. Provide clear, accurate information about academic matters.",
            ChatCategory.ADMINISTRATIVE: "You are a helpful administrative assistant for a college. Guide students through administrative procedures clearly.",
            ChatCategory.CAREER: "You are a career counselor helping engineering students with placement preparation and career guidance.",
            ChatCategory.TECHNICAL: "You are a technical support assistant. Help users with portal/app issues clearly and suggest solutions.",
            ChatCategory.GENERAL: "You are a friendly student support assistant. Help students with general queries about college life.",
        }

        system_prompt = system_prompts.get(category, system_prompts[ChatCategory.GENERAL])

        # Build context from history
        context = ""
        if input_data.history:
            context = "Previous conversation:\n"
            for msg in input_data.history[-5:]:  # Last 5 messages
                context += f"{msg.role}: {msg.content}\n"

        prompt = f"""{context}

Student query: {input_data.message}

Provide a helpful, concise response. If you're unsure, suggest the student contact the relevant department."""

        try:
            response = await self.llm.generate_text(prompt, system_prompt, max_tokens=300)
            return response
        except Exception:
            return self._get_fallback_response(category)

    def _get_fallback_response(self, category: ChatCategory) -> str:
        """Get fallback response when LLM is unavailable."""
        fallbacks = {
            ChatCategory.ACADEMIC: "For academic queries, please check your Student Portal or contact your class teacher. You can also visit the Academic Office during working hours.",
            ChatCategory.ADMINISTRATIVE: "For administrative matters, please visit the Administration Office or raise a request through the Student Portal.",
            ChatCategory.CAREER: "For career and placement queries, please contact the Training & Placement Cell or visit the Career Hub in your portal.",
            ChatCategory.TECHNICAL: "For technical issues, please try logging out and back in. If the problem persists, contact IT Support at support@college.edu.",
            ChatCategory.GENERAL: "I'm here to help! Please provide more details about your query, or you can contact the Student Help Desk for assistance.",
        }
        return fallbacks.get(category, fallbacks[ChatCategory.GENERAL])

    def _get_suggested_actions(self, category: ChatCategory, message: str) -> List[str]:
        """Get suggested actions based on category."""
        actions = {
            ChatCategory.ACADEMIC: [
                "View your attendance",
                "Check exam schedule",
                "Download study materials",
            ],
            ChatCategory.ADMINISTRATIVE: [
                "Pay fees online",
                "Apply for certificate",
                "Update profile",
            ],
            ChatCategory.CAREER: [
                "Update your resume",
                "Check placement drives",
                "Take skill assessment",
            ],
            ChatCategory.TECHNICAL: [
                "Reset password",
                "Clear browser cache",
                "Contact IT support",
            ],
            ChatCategory.GENERAL: [
                "Explore student portal",
                "View announcements",
                "Contact support",
            ],
        }
        return actions.get(category, actions[ChatCategory.GENERAL])

    def _get_related_resources(self, category: ChatCategory) -> List[Dict[str, str]]:
        """Get related resources for the category."""
        resources = {
            ChatCategory.ACADEMIC: [
                {"title": "Student Handbook", "url": "/resources/handbook"},
                {"title": "Academic Calendar", "url": "/calendar"},
            ],
            ChatCategory.ADMINISTRATIVE: [
                {"title": "Fee Structure", "url": "/fees"},
                {"title": "Forms & Downloads", "url": "/forms"},
            ],
            ChatCategory.CAREER: [
                {"title": "Placement Brochure", "url": "/placements/brochure"},
                {"title": "Career Resources", "url": "/career-hub"},
            ],
            ChatCategory.TECHNICAL: [
                {"title": "Portal Guide", "url": "/help/portal"},
                {"title": "FAQs", "url": "/help/faq"},
            ],
            ChatCategory.GENERAL: [
                {"title": "Help Center", "url": "/help"},
                {"title": "Contact Us", "url": "/contact"},
            ],
        }
        return resources.get(category, resources[ChatCategory.GENERAL])

    def _should_escalate(self, message: str, category: ChatCategory) -> bool:
        """Determine if the query should be escalated to human support."""
        # Escalation keywords
        escalation_keywords = [
            "urgent", "emergency", "complaint", "harassment", "refund",
            "wrong", "mistake", "serious", "legal", "grievance"
        ]

        message_lower = message.lower()

        # Check for escalation keywords
        if any(kw in message_lower for kw in escalation_keywords):
            return True

        # Long messages might need human attention
        if len(message.split()) > 50:
            return True

        return False

    async def get_suggestions(self, partial_message: str) -> List[str]:
        """Get autocomplete suggestions for partial message.

        Args:
            partial_message: Partial user message

        Returns:
            List of suggested completions
        """
        common_queries = [
            "How do I pay my fees?",
            "How do I check my attendance?",
            "When are the exams?",
            "How do I apply for leave?",
            "How do I check my results?",
            "How do I update my profile?",
            "How do I register for placements?",
            "How do I contact my teacher?",
            "How do I access study materials?",
            "How do I apply for hostel?",
        ]

        partial_lower = partial_message.lower()
        suggestions = [q for q in common_queries if partial_lower in q.lower()]

        return suggestions[:5]


# Singleton instance
_chatbot_service: Optional[ChatbotService] = None


def get_chatbot_service() -> ChatbotService:
    """Get singleton service instance."""
    global _chatbot_service
    if _chatbot_service is None:
        _chatbot_service = ChatbotService()
    return _chatbot_service
