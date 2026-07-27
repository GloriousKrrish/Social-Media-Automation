import re
import logging
from typing import Dict, Any, List, Optional
from app.ai.prompts.templates import DEFAULT_PROMPT_TEMPLATES
from app.ai.schemas.ai_schemas import (
    PromptTemplateSchema,
    PromptRenderRequest,
    PromptRenderResponse,
)

logger = logging.getLogger(__name__)


class PromptEngine:
    """
    Enterprise Prompt Engine.
    Handles prompt templates, variable validation, rendering, versioning, and pre-processing.
    Ensures zero hardcoded prompt string leaks in UI or controllers.
    """

    def __init__(self):
        self._templates: Dict[str, PromptTemplateSchema] = dict(DEFAULT_PROMPT_TEMPLATES)

    def register_template(self, template: PromptTemplateSchema) -> None:
        """Register or update a prompt template definition."""
        self._templates[template.id] = template
        logger.info(f"Registered Prompt Template: '{template.name}' ({template.id}) - v{template.version}")

    def list_templates(self) -> List[PromptTemplateSchema]:
        """List all registered prompt templates."""
        return list(self._templates.values())

    def get_template(self, template_id: str) -> Optional[PromptTemplateSchema]:
        """Get template by ID."""
        return self._templates.get(template_id)

    def render(self, request: PromptRenderRequest) -> PromptRenderResponse:
        """
        Validate and render prompt template with supplied variables.
        """
        template = self.get_template(request.template_id)
        if not template:
            raise ValueError(f"Prompt template '{request.template_id}' not found.")

        variables = request.variables or {}
        
        # Check missing variables
        missing_vars = [v for v in template.variables if v not in variables or variables[v] is None]
        rendered_user_prompt = template.user_prompt_template
        rendered_system_prompt = template.system_prompt

        # Replace variables
        for var_name, value in variables.items():
            placeholder = "{" + var_name + "}"
            rendered_user_prompt = rendered_user_prompt.replace(placeholder, str(value))
            rendered_system_prompt = rendered_system_prompt.replace(placeholder, str(value))

        # Fill any remaining unfilled placeholders with empty string or placeholder indicator
        if missing_vars:
            logger.warning(f"Template '{template.id}' rendered with missing variables: {missing_vars}")

        return PromptRenderResponse(
            template_id=template.id,
            system_prompt=rendered_system_prompt,
            rendered_prompt=rendered_user_prompt,
            variables_used=variables,
        )


# Singleton instance
prompt_engine = PromptEngine()
