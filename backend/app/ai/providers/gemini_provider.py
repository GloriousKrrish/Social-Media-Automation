import os
import time
import httpx
from typing import Optional, List, Dict, Any
from app.ai.providers.base import BaseAIProvider
from app.ai.schemas.ai_schemas import (
    TextGenerationResponse,
    ModelInfo,
)


class GeminiProvider(BaseAIProvider):
    def __init__(self, api_key: Optional[str] = None):
        self._api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    @property
    def provider_id(self) -> str:
        return "gemini"

    @property
    def name(self) -> str:
        return "Google Gemini"

    @property
    def default_model(self) -> str:
        return "gemini-1.5-pro"

    def validate_configuration(self) -> bool:
        return bool(self._api_key and len(self._api_key.strip()) > 5)

    def list_models(self) -> List[ModelInfo]:
        return [
            ModelInfo(
                id="gemini-1.5-pro",
                name="Gemini 1.5 Pro",
                provider=self.provider_id,
                description="Google's flagship multimodal model with long context window",
                max_tokens=8192,
                supports_vision=True,
                supports_function_calling=True,
            ),
            ModelInfo(
                id="gemini-1.5-flash",
                name="Gemini 1.5 Flash",
                provider=self.provider_id,
                description="Fast, cost-efficient model for high volume tasks",
                max_tokens=4096,
                supports_vision=True,
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

        start_time = time.time()

        if not self.validate_configuration():
            latency = (time.time() - start_time) * 1000
            return TextGenerationResponse(
                text=f"[Gemini Provider Engine] (Simulated/Fallback Response for '{prompt[:40]}...'): Credentials absent or invalid. Please configure GEMINI_API_KEY.",
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
            full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self._api_key}"

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    url,
                    headers={"Content-Type": "application/json"},
                    json={
                        "contents": [{"parts": [{"text": full_prompt}]}],
                        "generationConfig": {"temperature": temperature},
                    },
                )
                response.raise_for_status()
                data = response.json()
                latency = (time.time() - start_time) * 1000

                candidates = data.get("candidates", [])
                text = candidates[0]["content"]["parts"][0]["text"] if candidates else "No response generated."
                usage = data.get("usageMetadata", {})

                return TextGenerationResponse(
                    text=text,
                    provider=self.provider_id,
                    model=model,
                    prompt_tokens=usage.get("promptTokenCount", len(prompt.split())),
                    completion_tokens=usage.get("candidatesTokenCount", len(text.split())),
                    total_tokens=usage.get("totalTokenCount", len(prompt.split()) + len(text.split())),
                    latency_ms=round(latency, 2),
                    finish_reason="stop",
                    usage_metadata={"raw_usage": usage},
                )
        except Exception as e:
            latency = (time.time() - start_time) * 1000
            return TextGenerationResponse(
                text=f"[Gemini Provider Warning]: Call failed with error: {str(e)}. Ensure key permissions & quotas are valid.",
                provider=self.provider_id,
                model=model,
                prompt_tokens=0,
                completion_tokens=0,
                total_tokens=0,
                latency_ms=round(latency, 2),
                finish_reason="error",
                usage_metadata={"error": str(e)},
            )
