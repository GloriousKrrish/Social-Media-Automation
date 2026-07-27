from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.ai.services.provider_manager import provider_manager
from app.ai.services.prompt_engine import prompt_engine
from app.ai.services.workspace_ai_service import WorkspaceAIService
from app.ai.services.ai_history_service import AIHistoryService
from app.ai.services.usage_tracking_service import UsageTrackingService
from app.ai.schemas.ai_schemas import (
    ProviderStatus,
    TextGenerationRequest,
    TextGenerationResponse,
    PromptTemplateSchema,
    PromptRenderRequest,
    PromptRenderResponse,
    WorkspaceAISettingsResponse,
    WorkspaceAISettingsUpdate,
    AIHistoryRecordResponse,
    AIUsageStatResponse,
)

router = APIRouter(prefix="/ai", tags=["AI Platform Foundation"])


@router.get("/providers", response_model=List[ProviderStatus])
async def list_providers():
    """List status and capabilities of all registered AI providers."""
    return provider_manager.list_providers()


@router.get("/prompts", response_model=List[PromptTemplateSchema])
async def list_prompts():
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
async def generate_text(
    request: TextGenerationRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Execute AI text generation through Provider Manager and Prompt Engine.
    Logs execution history and records usage stats automatically.
    """
    # Pre-process prompt through Prompt Engine if template is referenced
    actual_prompt = request.prompt
    actual_system_prompt = request.system_prompt

    if request.prompt in [t.id for t in prompt_engine.list_templates()]:
        rendered = prompt_engine.render(
            PromptRenderRequest(
                template_id=request.prompt,
                variables=request.template_variables or {},
            )
        )
        actual_prompt = rendered.rendered_prompt
        actual_system_prompt = actual_system_prompt or rendered.system_prompt

    # Execute generation through Provider Manager
    generation_request = TextGenerationRequest(
        prompt=actual_prompt,
        system_prompt=actual_system_prompt,
        provider=request.provider,
        model=request.model,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
        workspace_id=request.workspace_id,
    )

    response = await provider_manager.generate_text(generation_request)

    # Record AI history log
    try:
        await AIHistoryService.record_generation(
            db=db,
            prompt=actual_prompt,
            response=response,
            workspace_id=request.workspace_id,
        )
    except Exception:
        pass  # Non-blocking failure for history logging

    return response


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
