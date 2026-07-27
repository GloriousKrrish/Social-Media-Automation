from typing import Dict
from app.ai.schemas.ai_schemas import PromptTemplateSchema

DEFAULT_PROMPT_TEMPLATES: Dict[str, PromptTemplateSchema] = {
    "brand_post_creator": PromptTemplateSchema(
        id="brand_post_creator",
        name="Brand Social Post Creator",
        category="social_media",
        description="Creates tailored social media copy for specific brand tone and audience",
        system_prompt="You are an expert social media manager writing for {brand_name}. Tone: {tone}. Target Audience: {target_audience}.",
        user_prompt_template="Write a engaging post about {topic}. Key points to include: {key_points}. Desired call to action: {call_to_action}.",
        variables=["brand_name", "tone", "target_audience", "topic", "key_points", "call_to_action"],
        version="1.0.0",
    ),
    "content_repurposer": PromptTemplateSchema(
        id="content_repurposer",
        name="Content Repurposer Template",
        category="content_ops",
        description="Adapts long-form content into concise platform updates",
        system_prompt="You are a digital content strategist specializing in multi-channel adaptation.",
        user_prompt_template="Adapt the following content for {target_platform}:\n\n{source_text}\n\nMaintain language: {language}.",
        variables=["target_platform", "source_text", "language"],
        version="1.0.0",
    ),
    "headline_generator": PromptTemplateSchema(
        id="headline_generator",
        name="High-Conversion Headline Generator",
        category="copywriting",
        description="Generates catchy headlines based on audience and product context",
        system_prompt="You are a world-class copywriter specializing in magnetic headlines.",
        user_prompt_template="Generate 5 high-converting headlines for product '{product_name}'. Main benefit: {primary_benefit}.",
        variables=["product_name", "primary_benefit"],
        version="1.0.0",
    ),
}
