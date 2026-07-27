import logging
from typing import Dict, List, Optional
from app.ai.providers.base import BaseAIProvider
from app.ai.providers.openai_provider import OpenAIProvider
from app.ai.providers.gemini_provider import GeminiProvider
from app.ai.providers.anthropic_provider import AnthropicProvider
from app.ai.providers.pollinations_provider import PollinationsProvider
from app.ai.schemas.ai_schemas import (
    ProviderStatus,
    TextGenerationResponse,
    TextGenerationRequest,
    ImageGenerationResponse,
)

logger = logging.getLogger(__name__)


class AIProviderManager:
    """
    Central Manager for enterprise AI providers.
    Manages registration, configuration validation, provider selection, and fallback routing.
    """

    def __init__(self):
        self._providers: Dict[str, BaseAIProvider] = {}
        self._register_default_providers()

    def _register_default_providers(self):
        """Initialize standard platform providers."""
        self.register_provider(OpenAIProvider())
        self.register_provider(GeminiProvider())
        self.register_provider(AnthropicProvider())
        self.register_provider(PollinationsProvider())

    def generate_image(self, prompt: str, options: Optional[Dict] = None) -> ImageGenerationResponse:
        """Generate AI image via registered image provider (Pollinations)."""
        pollination_p = self._providers.get("pollinations")
        if pollination_p:
            return pollination_p.generate_image(prompt, options)
        # Fallback to base stub
        default_p = self.get_provider()
        return default_p.generate_image(prompt, options)


    def register_provider(self, provider: BaseAIProvider) -> None:
        """Register or override an AI provider."""
        self._providers[provider.provider_id] = provider
        logger.info(f"Registered AI Provider: {provider.name} ({provider.provider_id})")

    def get_provider(self, provider_id: Optional[str] = None) -> BaseAIProvider:
        """
        Get requested provider or fallback to first configured provider, or default 'openai'.
        """
        if provider_id and provider_id in self._providers:
            return self._providers[provider_id]

        # Search for first configured provider
        for pid, p in self._providers.items():
            if p.validate_configuration():
                return p

        # Default fallback
        return self._providers.get("openai", list(self._providers.values())[0])

    def list_providers() -> List[ProviderStatus]:
        """List health and configuration status of all registered providers."""
        return [p.get_status() for p in self._providers.values()]

    async def generate_text(self, request: TextGenerationRequest) -> TextGenerationResponse:
        """
        Execute text generation with fail-safe error handling and fallback logic.
        """
        target_provider = self.get_provider(request.provider)
        options = {
            "model": request.model or target_provider.default_model,
            "temperature": request.temperature or 0.7,
            "max_tokens": request.max_tokens or 1000,
        }

        try:
            response = await target_provider.generate_text(
                prompt=request.prompt,
                system_prompt=request.system_prompt,
                options=options,
            )
            return response
        except Exception as err:
            logger.error(f"Execution error on provider '{target_provider.provider_id}': {err}")
            # Try fallback provider if primary failed
            for pid, fallback_p in self._providers.items():
                if pid != target_provider.provider_id:
                    try:
                        logger.info(f"Attempting fallback to provider '{pid}'")
                        return await fallback_p.generate_text(
                            prompt=request.prompt,
                            system_prompt=request.system_prompt,
                            options=options,
                        )
                    except Exception as fallback_err:
                        logger.warning(f"Fallback provider '{pid}' failed: {fallback_err}")

            # If all fail, return clean non-crashing response
            return TextGenerationResponse(
                text=f"[AI Platform Service Error]: All provider executions failed. Details: {str(err)}",
                provider=target_provider.provider_id,
                model=options["model"],
                latency_ms=0.0,
                finish_reason="error",
                usage_metadata={"error": str(err)},
            )


# Singleton instance
provider_manager = AIProviderManager()
