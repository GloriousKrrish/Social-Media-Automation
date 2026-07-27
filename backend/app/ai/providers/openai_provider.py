import os
import time
import httpx
from typing import Optional, List, Dict, Any
from app.ai.providers.base import BaseAIProvider
from app.ai.schemas.ai_schemas import (
    TextGenerationResponse,
    ModelInfo,
)


class OpenAIProvider(BaseAIProvider):
    def __init__(self, api_key: Optional[str] = None):
        self._api_key = api_key or os.getenv("OPENAI_API_KEY")

    @property
    def provider_id(self) -> str:
        return "openai"

    @property
    def name(self) -> str:
        return "OpenAI"

    @property
    def default_model(self) -> str:
        return "gpt-4o"

    def validate_configuration(self) -> bool:
        return bool(self._api_key and len(self._api_key.strip()) > 5)

    def list_models(self) -> List[ModelInfo]:
        return [
            ModelInfo(
                id="gpt-4o",
                name="GPT-4o",
                provider=self.provider_id,
                description="High-intelligence flagship model for complex tasks",
                max_tokens=4096,
                supports_vision=True,
                supports_function_calling=True,
            ),
            ModelInfo(
                id="gpt-4o-mini",
                name="GPT-4o Mini",
                provider=self.provider_id,
                description="Affordable, lightweight model for fast generation",
                max_tokens=4096,
                supports_vision=True,
                supports_function_calling=True,
            ),
            ModelInfo(
                id="gpt-3.5-turbo",
                name="GPT-3.5 Turbo",
                provider=self.provider_id,
                description="Legacy fast execution model",
                max_tokens=2048,
            ),
        ]

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        options: Optional[Dict[str, Any]] = None,
    ) -> TextGenerationResponse:
        options = options or {}
        model = options.get("model") or self.default_model
        temperature = options.get("temperature", 0.7)
        max_tokens = options.get("max_tokens", 1000)

        start_time = time.time()

        if not self.validate_configuration():
            latency = (time.time() - start_time) * 1000
            return TextGenerationResponse(
                text=f"[OpenAI Provider Engine] (Simulated/Fallback Response for '{prompt[:40]}...'): Credentials absent or invalid. Please configure OPENAI_API_KEY.",
                provider=self.provider_id,
                model=model,
                prompt_tokens=len(prompt.split()),
                completion_tokens=25,
                total_tokens=len(prompt.split()) + 25,
                latency_ms=round(latency, 2),
                finish_reason="simulated",
                usage_metadata={"simulated": True, "reason": "missing_api_key"},
            )

        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self._api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                    },
                )
                response.raise_for_status()
                data = response.json()
                latency = (time.time() - start_time) * 1000

                choice = data["choices"][0]
                usage = data.get("usage", {})

                return TextGenerationResponse(
                    text=choice["message"]["content"],
                    provider=self.provider_id,
                    model=model,
                    prompt_tokens=usage.get("prompt_tokens", 0),
                    completion_tokens=usage.get("completion_tokens", 0),
                    total_tokens=usage.get("total_tokens", 0),
                    latency_ms=round(latency, 2),
                    finish_reason=choice.get("finish_reason", "stop"),
                    usage_metadata={"raw_usage": usage},
                )
        except Exception as e:
            latency = (time.time() - start_time) * 1000
            return TextGenerationResponse(
                text=f"[OpenAI Provider Warning]: Call failed with error: {str(e)}. Ensure key permissions & quotas are valid.",
                provider=self.provider_id,
                model=model,
                prompt_tokens=0,
                completion_tokens=0,
                total_tokens=0,
                latency_ms=round(latency, 2),
                finish_reason="error",
                usage_metadata={"error": str(e)},
            )
