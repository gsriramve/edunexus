"""LLM Service for OpenAI and Anthropic Claude integration."""

import json
from typing import Optional, List, Dict, Any
from openai import OpenAI
from anthropic import Anthropic

from app.config import get_settings


class LLMService:
    """Unified service for LLM interactions."""

    def __init__(self):
        """Initialize LLM clients."""
        self.settings = get_settings()
        self._openai_client: Optional[OpenAI] = None
        self._anthropic_client: Optional[Anthropic] = None

    @property
    def openai_client(self) -> Optional[OpenAI]:
        """Lazy initialization of OpenAI client."""
        if self._openai_client is None and self.settings.openai_api_key:
            self._openai_client = OpenAI(api_key=self.settings.openai_api_key)
        return self._openai_client

    @property
    def anthropic_client(self) -> Optional[Anthropic]:
        """Lazy initialization of Anthropic client."""
        if self._anthropic_client is None and self.settings.anthropic_api_key:
            self._anthropic_client = Anthropic(api_key=self.settings.anthropic_api_key)
        return self._anthropic_client

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        provider: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> str:
        """Generate text using the configured LLM.

        Args:
            prompt: User prompt/query
            system_prompt: Optional system prompt for context
            provider: Override default provider (openai/anthropic)
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate

        Returns:
            Generated text response
        """
        provider = provider or self.settings.default_llm_provider

        if provider == "openai" and self.openai_client:
            return await self._generate_openai(
                prompt, system_prompt, temperature, max_tokens
            )
        elif provider == "anthropic" and self.anthropic_client:
            return await self._generate_anthropic(
                prompt, system_prompt, temperature, max_tokens
            )
        else:
            # Fallback to mock response for development
            return self._generate_mock(prompt, system_prompt)

    async def _generate_openai(
        self,
        prompt: str,
        system_prompt: Optional[str],
        temperature: float,
        max_tokens: int,
    ) -> str:
        """Generate text using OpenAI."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = self.openai_client.chat.completions.create(
            model=self.settings.openai_model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content

    async def _generate_anthropic(
        self,
        prompt: str,
        system_prompt: Optional[str],
        temperature: float,
        max_tokens: int,
    ) -> str:
        """Generate text using Anthropic Claude."""
        response = self.anthropic_client.messages.create(
            model=self.settings.anthropic_model,
            max_tokens=max_tokens,
            system=system_prompt or "You are a helpful educational assistant.",
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text

    def _generate_mock(self, prompt: str, system_prompt: Optional[str]) -> str:
        """Generate mock response for development/testing."""
        # This is used when no API keys are configured
        return f"[Mock LLM Response] Processed prompt about: {prompt[:100]}..."

    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        provider: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generate structured JSON response.

        Args:
            prompt: Prompt that should result in JSON output
            system_prompt: System prompt (should mention JSON output format)

        Returns:
            Parsed JSON dictionary
        """
        json_system = (system_prompt or "") + "\nRespond only with valid JSON."
        response = await self.generate_text(prompt, json_system, provider)

        # Extract JSON from response
        try:
            # Try to find JSON in the response
            start = response.find("{")
            end = response.rfind("}") + 1
            if start != -1 and end > start:
                return json.loads(response[start:end])
            # Try array format
            start = response.find("[")
            end = response.rfind("]") + 1
            if start != -1 and end > start:
                return {"items": json.loads(response[start:end])}
        except json.JSONDecodeError:
            pass

        return {"raw_response": response}

    async def generate_questions(
        self,
        subject: str,
        topic: str,
        difficulty: str,
        count: int = 5,
        question_type: str = "mcq",
    ) -> List[Dict[str, Any]]:
        """Generate exam questions for a topic.

        Args:
            subject: Subject name
            topic: Specific topic
            difficulty: easy/medium/hard
            count: Number of questions
            question_type: mcq/short/long/numerical

        Returns:
            List of question dictionaries
        """
        system_prompt = """You are an expert educational content creator for engineering colleges in India.
        Generate high-quality exam questions that test understanding and application.
        Format each question as a JSON object with: question, options (for MCQ), answer, explanation, marks.
        Return as a JSON array."""

        prompt = f"""Generate {count} {question_type.upper()} questions for:
        Subject: {subject}
        Topic: {topic}
        Difficulty: {difficulty}

        For MCQ: Include 4 options (A, B, C, D) with one correct answer.
        Include brief explanations for the answers.
        Assign appropriate marks (1-5 based on complexity)."""

        result = await self.generate_json(prompt, system_prompt)
        return result.get("items", result.get("questions", []))


# Singleton instance
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """Get singleton LLM service instance."""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
