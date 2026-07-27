from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.ai.services.provider_manager import provider_manager
from app.ai.services.prompt_engine import prompt_engine
from app.ai.services.ai_generation_service import AIGenerationService
from app.ai.services.workspace_ai_service import WorkspaceAIService
from app.ai.services.ai_history_service import AIHistoryService
from app.ai.services.usage_tracking_service import UsageTrackingService
from app.ai.schemas.ai_schemas import (
    ProviderStatus,
    ModelInfo,
    TextGenerationRequest,
    RegenerateRequest,
    TextGenerationResponse,
    PromptTemplateSchema,
    PromptRenderRequest,
    PromptRenderResponse,
    WorkspaceAISettingsResponse,
    WorkspaceAISettingsUpdate,
    AIHistoryRecordResponse,
    AIUsageStatResponse,
)

router = APIRouter(prefix="/ai", tags=["AI Platform & Generation Engine"])


@router.get("/providers", response_model=List[ProviderStatus])
async def list_providers():
    """List status and capabilities of all registered AI providers."""
    return provider_manager.list_providers()


@router.get("/models", response_model=List[ModelInfo])
async def list_models():
    """List supported AI models across all registered providers."""
    models: List[ModelInfo] = []
    for provider_status in provider_manager.list_providers():
        models.extend(provider_status.supported_models)
    return models


@router.get("/prompts", response_model=List[PromptTemplateSchema])
@router.get("/templates", response_model=List[PromptTemplateSchema])
async def list_templates():
    """List all registered reusable prompt templates."""
    return prompt_engine.list_templates()


@router.post("/prompts/render", response_model=PromptRenderResponse)
async def render_prompt(request: PromptRenderRequest):
    """Render a prompt template with provided variables."""
    try:
        return prompt_engine.render(request)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/generate", response_model=TextGenerationResponse)
async def generate_content(
    request: TextGenerationRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Execute AI text generation through AI Generation Service, Prompt Engine, and Provider Manager.
    Automatically applies workspace AI settings, saves history, and tracks usage metrics.
    """
    return await AIGenerationService.generate_content(db, request)


@router.post("/regenerate", response_model=TextGenerationResponse)
async def regenerate_content(
    request: RegenerateRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Regenerate content with updated parameters or higher temperature.
    """
    return await AIGenerationService.regenerate_content(db, request)


@router.post("/generate-image")
async def generate_image(payload: dict):
    """
    Generate high-resolution AI image via Pollinations AI Engine.
    """
    prompt = payload.get("prompt", "")
    style = payload.get("style", "photorealistic")
    aspect_ratio = payload.get("aspectRatio", "1:1")

    width = 1024
    height = 1024
    if aspect_ratio == "16:9":
        width, height = 1280, 720
    elif aspect_ratio == "9:16":
        width, height = 720, 1280
    elif aspect_ratio == "4:5":
        width, height = 800, 1000
    elif aspect_ratio == "2:1":
        width, height = 1200, 600

    img_response = provider_manager.generate_image(prompt, {
        "style": style,
        "width": width,
        "height": height,
    })

    return {
        "success": img_response.status == "success",
        "imageUrl": img_response.image_url,
        "status": img_response.status,
        "message": img_response.message,
    }



@router.get("/workspaces/{workspace_id}/settings", response_model=WorkspaceAISettingsResponse)
async def get_workspace_ai_settings(
    workspace_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve workspace AI preferences."""
    return await WorkspaceAIService.get_settings(db, workspace_id)


@router.put("/workspaces/{workspace_id}/settings", response_model=WorkspaceAISettingsResponse)
async def update_workspace_ai_settings(
    workspace_id: str,
    updates: WorkspaceAISettingsUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update workspace AI preferences."""
    return await WorkspaceAIService.update_settings(db, workspace_id, updates)


@router.get("/history", response_model=List[AIHistoryRecordResponse])
async def get_ai_history(
    workspace_id: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve AI execution history records."""
    return await AIHistoryService.get_workspace_history(db, workspace_id, limit)


@router.get("/usage", response_model=AIUsageStatResponse)
async def get_ai_usage_stats(
    workspace_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve AI provider usage statistics and distribution analytics."""
    return await UsageTrackingService.get_usage_summary(db, workspace_id)
