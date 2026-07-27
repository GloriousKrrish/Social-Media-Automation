from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from app.ai.schemas.ai_schemas import (
    TextGenerationResponse,
    ImageGenerationResponse,
    ModelInfo,
    UsageEstimate,
    ProviderStatus,
)


class BaseAIProvider(ABC):
    """
    Enterprise Base Interface for all AI Providers.
    No application component should bypass this contract or consume provider SDKs directly.
    """

    @property
    @abstractmethod
    def provider_id(self) -> str:
        """Unique key identifying the provider (e.g., 'openai', 'gemini', 'anthropic')."""
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        """Human readable name of the AI provider."""
        pass

    @property
    @abstractmethod
    def default_model(self) -> str:
        """Default model for this provider."""
        pass

    @abstractmethod
    def validate_configuration(self) -> bool:
        """Check if provider credentials and secrets are configured and valid."""
        pass

    @abstractmethod
    def list_models(self) -> List[ModelInfo]:
        """Return available models for this provider."""
        pass

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        options: Optional[Dict[str, Any]] = None,
    ) -> TextGenerationResponse:
        """Generate text from a prompt."""
        pass

    def generate_image(
        self,
        prompt: str,
        options: Optional[Dict[str, Any]] = None,
    ) -> ImageGenerationResponse:
        """
        Image generation contract stub.
        Deferred in Phase 5.1 per architectural non-negotiable rules.
        """
        return ImageGenerationResponse(
            status="deferred",
            message="Image generation is deferred in Phase 5.1 per platform specification."
        )

    def estimate_usage(self, prompt: str) -> UsageEstimate:
        """Estimate token count and cost prior to execution."""
        estimated_tokens = max(1, len(prompt.split()) * 2)
        return UsageEstimate(
            estimated_prompt_tokens=estimated_tokens,
            estimated_cost_usd=round(estimated_tokens * 0.000002, 6),
        )

    def get_status(self) -> ProviderStatus:
        """Get explicit provider health and config status."""
        is_conf = self.validate_configuration()
        health_state = "CONNECTED" if is_conf else "UNCONFIGURED"
        return ProviderStatus(
            provider_id=self.provider_id,
            name=self.name,
            is_available=is_conf,
            is_configured=is_conf,
            health_state=health_state,
            default_model=self.default_model,
            supported_models=self.list_models(),
            error_message=None if is_conf else f"{self.name} API key is missing or invalid.",
        )

