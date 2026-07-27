import os
import time
import logging
import httpx
from typing import Optional, List, Dict, Any
from app.ai.providers.base import BaseAIProvider
from app.ai.schemas.ai_schemas import (
    TextGenerationResponse,
    ModelInfo,
)

logger = logging.getLogger(__name__)

# Strict Multi-Tier Gemini Model Fallback Strategy
PRIMARY_MODEL = "gemini-2.0-flash"
SECONDARY_MODELS = ["gemini-2.0-pro-exp", "gemini-1.5-pro"]
TERTIARY_MODEL = "gemini-1.5-flash"


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
        return PRIMARY_MODEL

    def validate_configuration(self) -> bool:
        return bool(self._api_key and len(self._api_key.strip()) > 5)

    def list_models(self) -> List[ModelInfo]:
        return [
            ModelInfo(
                id="gemini-2.0-flash",
                name="Gemini 2.0 / 3.5 Flash (Primary Tier 1)",
                provider=self.provider_id,
                description="Ultra-fast primary model for code completions, chat, and generation",
                max_tokens=8192,
                supports_vision=True,
                supports_function_calling=True,
            ),
            ModelInfo(
                id="gemini-2.0-pro-exp",
                name="Gemini 2.0 Pro Experimental (Secondary Tier 2)",
                provider=self.provider_id,
                description="High-reasoning secondary fallback model",
                max_tokens=8192,
                supports_vision=True,
                supports_function_calling=True,
            ),
            ModelInfo(
                id="gemini-1.5-pro",
                name="Gemini 1.5 Pro (Secondary Standard)",
                provider=self.provider_id,
                description="Flagship multimodal long-context pro model",
                max_tokens=8192,
                supports_vision=True,
                supports_function_calling=True,
            ),
            ModelInfo(
                id="gemini-1.5-flash",
                name="Gemini 1.5 Flash (Tertiary Tier 3)",
                provider=self.provider_id,
                description="Reliable tertiary fallback model for high volume tasks",
                max_tokens=4096,
                supports_vision=True,
            ),
        ]

    async def _execute_single_model_call(
        self,
        model_name: str,
        prompt: str,
        system_prompt: Optional[str],
        temperature: float,
    ) -> Dict[str, Any]:
        """Helper to send HTTP POST request to Google Gemini API for a given model tier."""
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self._api_key}"

        async with httpx.AsyncClient(timeout=25.0) as client:
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

            candidates = data.get("candidates", [])
            text = candidates[0]["content"]["parts"][0]["text"] if candidates else "No content generated."
            usage = data.get("usageMetadata", {})

            return {
                "text": text,
                "usage": usage,
                "model": model_name,
            }

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        options: Optional[Dict[str, Any]] = None,
    ) -> TextGenerationResponse:
        options = options or {}
        requested_model = options.get("model") or PRIMARY_MODEL
        temperature = options.get("temperature", 0.7)

        start_time = time.time()

        if not self.validate_configuration():
            latency = (time.time() - start_time) * 1000
            return TextGenerationResponse(
                text=f"[Gemini Fallback Engine] (Simulated Output for '{prompt[:35]}...'): Key absent or invalid. Please configure GEMINI_API_KEY.",
                provider=self.provider_id,
                model=requested_model,
                prompt_tokens=len(prompt.split()),
                completion_tokens=25,
                total_tokens=len(prompt.split()) + 25,
                latency_ms=round(latency, 2),
                finish_reason="simulated",
                usage_metadata={"simulated": True, "reason": "missing_api_key"},
            )

        # Multi-Tier Fallback Cascade Order
        tier_fallback_queue = [requested_model]
        for sec in SECONDARY_MODELS:
            if sec not in tier_fallback_queue:
                tier_fallback_queue.append(sec)
        if TERTIARY_MODEL not in tier_fallback_queue:
            tier_fallback_queue.append(TERTIARY_MODEL)

        tier_failures = []

        for tier_index, target_model in enumerate(tier_fallback_queue, start=1):
            try:
                logger.info(f"⚡ [Gemini Provider Router] Attempting Tier {tier_index} model: '{target_model}'")
                result = await self._execute_single_model_call(
                    target_model, prompt, system_prompt, temperature
                )

                latency = (time.time() - start_time) * 1000
                text = result["text"]
                usage = result["usage"]

                return TextGenerationResponse(
                    text=text,
                    provider=self.provider_id,
                    model=target_model,
                    prompt_tokens=usage.get("promptTokenCount", len(prompt.split())),
                    completion_tokens=usage.get("candidatesTokenCount", len(text.split())),
                    total_tokens=usage.get("totalTokenCount", len(prompt.split()) + len(text.split())),
                    latency_ms=round(latency, 2),
                    finish_reason="stop",
                    usage_metadata={
                        "raw_usage": usage,
                        "tier_used": f"Tier {tier_index} ({target_model})",
                        "fallback_attempts": tier_failures,
                    },
                )
            except Exception as e:
                err_msg = f"Tier {tier_index} ({target_model}) failed: {str(e)}"
                logger.warning(f"⚠️ [Gemini Fallback Cascade] {err_msg}")
                tier_failures.append(err_msg)

        # All 3 tiers failed
        latency = (time.time() - start_time) * 1000
        return TextGenerationResponse(
            text=f"[Gemini Multi-Tier Fallback Warning]: All model tiers ({', '.join(tier_fallback_queue)}) failed. Last error: {tier_failures[-1] if tier_failures else 'Unknown error'}",
            provider=self.provider_id,
            model=requested_model,
            prompt_tokens=0,
            completion_tokens=0,
            total_tokens=0,
            latency_ms=round(latency, 2),
            finish_reason="error",
            usage_metadata={"tier_failures": tier_failures},
        )
