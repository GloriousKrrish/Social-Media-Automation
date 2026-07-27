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

# =========================================================
# STRICT MULTI-TIER GEMINI MODEL FALLBACK STRATEGY
# Priority 1 (Primary):   Gemini 3.5 Flash
# Priority 2 (Secondary): Gemini 2.5 Flash
# Priority 3 (Tertiary):  Gemini 1.5 Flash (original model)
# =========================================================
TIER_1_MODEL = "gemini-3.5-flash"       # Primary — latest generation
TIER_2_MODEL = "gemini-2.5-flash"       # Secondary fallback
TIER_3_MODEL = "gemini-1.5-flash"       # Tertiary fallback — original model

FALLBACK_CHAIN = [TIER_1_MODEL, TIER_2_MODEL, TIER_3_MODEL]


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
        return TIER_1_MODEL

    def validate_configuration(self) -> bool:
        return bool(self._api_key and len(self._api_key.strip()) > 5)

    def list_models(self) -> List[ModelInfo]:
        return [
            ModelInfo(
                id="gemini-3.5-flash",
                name="Gemini 3.5 Flash — Primary (Tier 1)",
                provider=self.provider_id,
                description="Latest generation frontier model for coding, agentic loops, and content generation",
                max_tokens=8192,
                supports_vision=True,
                supports_function_calling=True,
            ),
            ModelInfo(
                id="gemini-2.5-flash",
                name="Gemini 2.5 Flash — Secondary Fallback (Tier 2)",
                provider=self.provider_id,
                description="Previous-generation model with strong reasoning capabilities",
                max_tokens=8192,
                supports_vision=True,
                supports_function_calling=True,
            ),
            ModelInfo(
                id="gemini-1.5-flash",
                name="Gemini 1.5 Flash — Original Fallback (Tier 3)",
                provider=self.provider_id,
                description="Original reliable model for high-volume tasks",
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
        """Execute a single Gemini API call for one model tier."""
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
        temperature = options.get("temperature", 0.7)

        start_time = time.time()

        if not self.validate_configuration():
            latency = (time.time() - start_time) * 1000
            return TextGenerationResponse(
                text=f"[Gemini Fallback Engine] API key absent or invalid. Please configure GEMINI_API_KEY in backend/.env",
                provider=self.provider_id,
                model=TIER_1_MODEL,
                prompt_tokens=len(prompt.split()),
                completion_tokens=25,
                total_tokens=len(prompt.split()) + 25,
                latency_ms=round(latency, 2),
                finish_reason="simulated",
                usage_metadata={"simulated": True, "reason": "missing_api_key"},
            )

        # ─── STRICT FALLBACK CASCADE: 3.5 → 2.5 → 1.5 ───
        tier_failures = []

        for tier_index, target_model in enumerate(FALLBACK_CHAIN, start=1):
            try:
                logger.info(
                    f"⚡ [Gemini Router] Tier {tier_index} → {target_model}"
                )
                result = await self._execute_single_model_call(
                    target_model, prompt, system_prompt, temperature
                )

                latency = (time.time() - start_time) * 1000
                text = result["text"]
                usage = result["usage"]

                logger.info(
                    f"✅ [Gemini Router] Tier {tier_index} ({target_model}) succeeded in {latency:.0f}ms"
                )

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
                        "tier_used": f"Tier {tier_index} — {target_model}",
                        "fallback_attempts": tier_failures,
                    },
                )
            except Exception as e:
                err_msg = f"Tier {tier_index} ({target_model}): {str(e)}"
                logger.warning(f"⚠️ [Gemini Fallback] {err_msg}")
                tier_failures.append(err_msg)

        # All 3 tiers exhausted
        latency = (time.time() - start_time) * 1000
        logger.error(
            f"❌ [Gemini Router] All tiers failed: {tier_failures}"
        )
        return TextGenerationResponse(
            text=f"[Gemini Multi-Tier Fallback] All model tiers exhausted ({' → '.join(FALLBACK_CHAIN)}). Errors: {'; '.join(tier_failures)}",
            provider=self.provider_id,
            model=TIER_1_MODEL,
            prompt_tokens=0,
            completion_tokens=0,
            total_tokens=0,
            latency_ms=round(latency, 2),
            finish_reason="error",
            usage_metadata={"tier_failures": tier_failures},
        )
