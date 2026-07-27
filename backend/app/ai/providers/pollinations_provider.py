import os
import urllib.parse
import random
from typing import Optional, List, Dict, Any
from app.ai.providers.base import BaseAIProvider
from app.ai.schemas.ai_schemas import (
    TextGenerationResponse,
    ImageGenerationResponse,
    ModelInfo,
)


class PollinationsProvider(BaseAIProvider):
    def __init__(self, api_key: Optional[str] = None):
        self._api_key = api_key or os.getenv("POLLINATIONS_API_KEY")

    @property
    def provider_id(self) -> str:
        return "pollinations"

    @property
    def name(self) -> str:
        return "Pollinations AI"

    @property
    def default_model(self) -> str:
        return "flux"

    def validate_configuration(self) -> bool:
        # Zero API key required for Pollinations image generation
        return True

    def list_models(self) -> List[ModelInfo]:
        return [
            ModelInfo(
                id="flux",
                name="Flux Image Model",
                provider=self.provider_id,
                description="High resolution, realistic image synthesis engine",
                max_tokens=2048,
            ),
            ModelInfo(
                id="turbo",
                name="Turbo Fast Generation",
                provider=self.provider_id,
                description="Ultra-fast image generation model",
                max_tokens=1024,
            ),
        ]

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        options: Optional[Dict[str, Any]] = None,
    ) -> TextGenerationResponse:
        return TextGenerationResponse(
            text=f"[Pollinations Provider]: Pollinations specializes in high-quality image generation. Image prompt generated for '{prompt[:30]}...'.",
            provider=self.provider_id,
            model=self.default_model,
        )

    def generate_image(
        self,
        prompt: str,
        options: Optional[Dict[str, Any]] = None,
    ) -> ImageGenerationResponse:
        options = options or {}
        width = options.get("width", 1080)
        height = options.get("height", 1080)
        seed = options.get("seed", random.randint(100000, 999999))
        model = options.get("model", self.default_model)
        style = options.get("style", "photorealistic")

        enhanced_prompt = f"{prompt}, {style}, 8k resolution, professional lighting, clean aesthetic"
        encoded_prompt = urllib.parse.quote(enhanced_prompt)

        # Standard clean Pollinations URL (no extra key query parameter required)
        query_params = f"width={width}&height={height}&seed={seed}&model={model}&nologo=true"
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?{query_params}"

        return ImageGenerationResponse(
            status="success",
            message="Image generated successfully via Pollinations AI Engine.",
            image_url=image_url,
        )
