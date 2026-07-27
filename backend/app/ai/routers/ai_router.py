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
from app.ai.services.ai_image_service import AIImageService
from app.ai.services.brand_kit_service import BrandKitService
from app.ai.schemas.ai_schemas import (
    ProviderStatus,
    ModelInfo,
    TextGenerationRequest,
    RegenerateRequest,
    TextGenerationResponse,
    ImageGenerationRequest,
    ImageGenerationResponse,
    AIImageRecordResponse,
    WorkspaceBrandKitResponse,
    WorkspaceBrandKitUpdate,
    PromptTemplateSchema,
    PromptRenderRequest,
    PromptRenderResponse,
    WorkspaceAISettingsResponse,
    WorkspaceAISettingsUpdate,
    AIHistoryRecordResponse,
    AIUsageStatResponse,
)

router = APIRouter(prefix="/ai", tags=["AI Platform & Creative Studio Engine"])


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


# --- Phase 5.3 Image Studio & Brand Kit Endpoints ---

@router.post("/generate-image", response_model=ImageGenerationResponse)
async def generate_image(
    request: ImageGenerationRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Generate high-resolution AI image via Pollinations Engine with style presets & brand kit integration.
    """
    return await AIImageService.generate_image(db, request)


@router.get("/images", response_model=List[AIImageRecordResponse])
async def get_image_gallery(
    workspace_id: Optional[str] = None,
    style: Optional[str] = None,
    provider: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve generated image gallery records with optional search and style filters.
    """
    return await AIImageService.get_images(db, workspace_id, style, provider, search, limit)


@router.get("/images/{image_id}", response_model=AIImageRecordResponse)
async def get_image_by_id(
    image_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve single image history record by ID."""
    image_rec = await AIImageService.get_image_by_id(db, image_id)
    if not image_rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Image with ID '{image_id}' not found.")
    return image_rec


@router.delete("/images/{image_id}")
async def delete_image(
    image_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete an image record from gallery history."""
    deleted = await AIImageService.delete_image(db, image_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Image with ID '{image_id}' not found.")
    return {"success": True, "message": f"Image record '{image_id}' deleted successfully."}


@router.post("/images/{image_id}/regenerate", response_model=ImageGenerationResponse)
async def regenerate_image(
    image_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Regenerate a variation of an existing image in history."""
    try:
        return await AIImageService.regenerate_image(db, image_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/brand-kit/{workspace_id}", response_model=WorkspaceBrandKitResponse)
async def get_workspace_brand_kit(
    workspace_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve workspace visual brand kit parameters."""
    return await BrandKitService.get_brand_kit(db, workspace_id)


@router.put("/brand-kit/{workspace_id}", response_model=WorkspaceBrandKitResponse)
async def update_workspace_brand_kit(
    workspace_id: str,
    updates: WorkspaceBrandKitUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update workspace visual brand kit parameters."""
    return await BrandKitService.update_brand_kit(db, workspace_id, updates)


# --- Workspace AI Settings & Usage Endpoints ---

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
    """Retrieve aggregate usage, latency, and token statistics."""
    return await UsageTrackingService.get_usage_stats(db, workspace_id)
