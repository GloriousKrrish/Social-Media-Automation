from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ModelInfo(BaseModel):
    id: str
    name: str
    provider: str
    description: Optional[str] = None
    max_tokens: int = 4096
    supports_vision: bool = False
    supports_function_calling: bool = False


class UsageEstimate(BaseModel):
    estimated_prompt_tokens: int
    estimated_cost_usd: float = 0.0


class ProviderStatus(BaseModel):
    provider_id: str
    name: str
    is_available: bool
    is_configured: bool
    default_model: str
    supported_models: List[ModelInfo]
    error_message: Optional[str] = None


class TextGenerationRequest(BaseModel):
    prompt: str = Field(..., description="User prompt or template name")
    template_variables: Optional[Dict[str, Any]] = None
    system_prompt: Optional[str] = None
    provider: Optional[str] = Field(None, description="Requested provider (e.g. openai, gemini, anthropic)")
    model: Optional[str] = None
    temperature: Optional[float] = Field(0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(1000, ge=1, le=8192)
    workspace_id: Optional[str] = None


class TextGenerationResponse(BaseModel):
    text: str
    provider: str
    model: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    latency_ms: float = 0.0
    finish_reason: str = "stop"
    usage_metadata: Dict[str, Any] = Field(default_factory=dict)


class ImageGenerationResponse(BaseModel):
    status: str = "deferred"
    message: str = "Image generation is deferred in Phase 5.1 per platform specification."
    image_url: Optional[str] = None


class PromptTemplateSchema(BaseModel):
    id: str
    name: str
    category: str
    description: str
    system_prompt: str
    user_prompt_template: str
    variables: List[str]
    version: str = "1.0.0"


class PromptRenderRequest(BaseModel):
    template_id: str
    variables: Dict[str, Any] = Field(default_factory=dict)


class PromptRenderResponse(BaseModel):
    template_id: str
    system_prompt: str
    rendered_prompt: str
    variables_used: Dict[str, Any]


class WorkspaceAISettingsBase(BaseModel):
    preferred_provider: str = "openai"
    preferred_model: str = "gpt-4o"
    default_language: str = "English"
    writing_tone: str = "Professional"
    creativity: float = 0.7
    target_audience: str = "General Business"
    brand_voice: str = "Empathetic & Authoritative"
    response_length: str = "Medium"


class WorkspaceAISettingsCreate(WorkspaceAISettingsBase):
    pass


class WorkspaceAISettingsUpdate(BaseModel):
    preferred_provider: Optional[str] = None
    preferred_model: Optional[str] = None
    default_language: Optional[str] = None
    writing_tone: Optional[str] = None
    creativity: Optional[float] = None
    target_audience: Optional[str] = None
    brand_voice: Optional[str] = None
    response_length: Optional[str] = None


class WorkspaceAISettingsResponse(WorkspaceAISettingsBase):
    id: str
    workspace_id: str
    created_at: str
    updated_at: str


class AIHistoryRecordResponse(BaseModel):
    id: str
    workspace_id: Optional[str]
    prompt: str
    response: str
    provider: str
    model: str
    status: str
    latency_ms: float
    usage_metadata: Dict[str, Any]
    created_at: str


class AIUsageStatResponse(BaseModel):
    total_requests: int
    successful_generations: int
    failed_generations: int
    average_latency_ms: float
    total_tokens_used: int
    provider_distribution: Dict[str, int]
