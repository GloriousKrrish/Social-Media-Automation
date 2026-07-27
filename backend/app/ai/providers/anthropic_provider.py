import os
import time
import httpx
from typing import Optional, List, Dict, Any
from app.ai.providers.base import BaseAIProvider
from app.ai.schemas.ai_schemas import (
    TextGenerationResponse,
    ModelInfo,
)


class AnthropicProvider(BaseAIProvider):
    def __init__(self, api_key: Optional[str] = None):
        self._api_key = api_key or os.getenv("ANTHROPIC_API_KEY")

    @property
    def provider_id(self) -> str:
        return "anthropic"

    @property
    def name(self) -> str:
        return "Anthropic Claude"

    @property
    def default_model(self) -> str:
        return "claude-3-5-sonnet-20241022"

    def validate_configuration(self) -> bool:
        return bool(self._api_key and len(self._api_key.strip()) > 5)

    def list_models(self) -> List[ModelInfo]:
        return [
            ModelInfo(
                id="claude-3-5-sonnet-20241022",
                name="Claude 3.5 Sonnet",
                provider=self.provider_id,
                description="Anthropic's most intelligent model for complex reasoning and nuance",
                max_tokens=4096,
                supports_vision=True,
            ),
            ModelInfo(
                id="claude-3-haiku-20240307",
                name="Claude 3 Haiku",
                provider=self.provider_id,
                description="Fast and light model for near-instant responses",
                max_tokens=4096,
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
                text=f"[Anthropic Provider Engine] (Simulated/Fallback Response for '{prompt[:40]}...'): Credentials absent or invalid. Please configure ANTHROPIC_API_KEY.",
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
            headers = {
                "x-api-key": self._api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            }

            payload = {
                "model": model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": [{"role": "user", "content": prompt}],
            }
            if system_prompt:
                payload["system"] = system_prompt

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                latency = (time.time() - start_time) * 1000

                content_block = data.get("content", [{}])[0]
                text = content_block.get("text", "")
                usage = data.get("usage", {})

                return TextGenerationResponse(
                    text=text,
                    provider=self.provider_id,
                    model=model,
                    prompt_tokens=usage.get("input_tokens", 0),
                    completion_tokens=usage.get("output_tokens", 0),
                    total_tokens=usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
                    latency_ms=round(latency, 2),
                    finish_reason="stop",
                    usage_metadata={"raw_usage": usage},
                )
        except Exception as e:
            latency = (time.time() - start_time) * 1000
            return TextGenerationResponse(
                text=f"[Anthropic Provider Warning]: Call failed with error: {str(e)}. Ensure key permissions & quotas are valid.",
                provider=self.provider_id,
                model=model,
                prompt_tokens=0,
                completion_tokens=0,
                total_tokens=0,
                latency_ms=round(latency, 2),
                finish_reason="error",
                usage_metadata={"error": str(e)},
            )
