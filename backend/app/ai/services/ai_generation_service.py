import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.services.provider_manager import provider_manager
from app.ai.services.prompt_engine import prompt_engine
from app.ai.services.workspace_ai_service import WorkspaceAIService
from app.ai.services.ai_history_service import AIHistoryService
from app.ai.schemas.ai_schemas import (
    TextGenerationRequest,
    TextGenerationResponse,
    PromptRenderRequest,
    RegenerateRequest,
)

logger = logging.getLogger(__name__)


class AIGenerationService:
    """
    Enterprise AI Content Generation Engine Service.
    Orchestrates validation, workspace settings injection, Prompt Engine rendering,
    Provider Manager execution, history recording, and usage tracking.
    """

    @staticmethod
    async def generate_content(
        db: AsyncSession,
        request: TextGenerationRequest,
    ) -> TextGenerationResponse:
        workspace_id = request.workspace_id or "default"

        # 1. Automatically load workspace AI settings
        ws_settings = await WorkspaceAIService.get_settings(db, workspace_id)

        # Merge defaults if not specified in request
        provider_id = request.provider or ws_settings.preferred_provider
        model_id = request.model or ws_settings.preferred_model
        temperature = request.temperature if request.temperature is not None else ws_settings.creativity
        generation_type = request.generation_type or "general"

        # 2. Build template variables incorporating workspace settings & user inputs
        variables = {
            "brand_name": "SocialPilot Brand",
            "tone": ws_settings.writing_tone,
            "target_audience": ws_settings.target_audience,
            "language": ws_settings.default_language,
            "brand_voice": ws_settings.brand_voice,
            "response_length": ws_settings.response_length,
            "topic": request.prompt,
            "context": request.context_input or "N/A",
            "call_to_action": "Click to learn more",
        }
        if request.template_variables:
            variables.update(request.template_variables)

        # 3. Render prompt through Prompt Engine if matching template exists
        actual_prompt = request.prompt
        actual_system_prompt = request.system_prompt
        rendered_prompt_str = request.prompt

        if generation_type in [t.id for t in prompt_engine.list_templates()]:
            rendered = prompt_engine.render(
                PromptRenderRequest(template_id=generation_type, variables=variables)
            )
            actual_prompt = rendered.rendered_prompt
            actual_system_prompt = actual_system_prompt or rendered.system_prompt
            rendered_prompt_str = rendered.rendered_prompt

        # Append workspace parameters to system prompt
        system_instructions = (
            f"{actual_system_prompt or 'You are an enterprise AI copywriter.'}\n"
            f"Writing Tone: {ws_settings.writing_tone}. Target Audience: {ws_settings.target_audience}. "
            f"Brand Voice: {ws_settings.brand_voice}. Output Language: {ws_settings.default_language}. "
            f"Desired Length: {ws_settings.response_length}."
        )

        # 4. Invoke Provider Manager
        execution_req = TextGenerationRequest(
            prompt=actual_prompt,
            system_prompt=system_instructions,
            provider=provider_id,
            model=model_id,
            temperature=temperature,
            max_tokens=request.max_tokens or 1000,
            workspace_id=workspace_id,
            generation_type=generation_type,
        )

        response = await provider_manager.generate_text(execution_req)
        response.generation_type = generation_type
        response.rendered_prompt = rendered_prompt_str

        # 5. Record execution history & usage tracking
        try:
            await AIHistoryService.record_generation(
                db=db,
                prompt=request.prompt,
                response=response,
                workspace_id=workspace_id,
            )
        except Exception as err:
            logger.warning(f"Failed to write AI history log: {err}")

        return response

    @staticmethod
    async def regenerate_content(
        db: AsyncSession,
        request: RegenerateRequest,
    ) -> TextGenerationResponse:
        gen_req = TextGenerationRequest(
            prompt=request.prompt or "Regenerate previous content with enhanced creativity",
            generation_type=request.generation_type or "general",
            context_input=request.context_input,
            provider=request.provider,
            model=request.model,
            temperature=request.temperature or 0.8,
            workspace_id=request.workspace_id or "default",
        )
        return await AIGenerationService.generate_content(db, gen_req)
