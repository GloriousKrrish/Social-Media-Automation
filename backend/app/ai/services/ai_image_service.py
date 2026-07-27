import time
import urllib.parse
import random
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, delete

from app.ai.models.ai_models import AIImageRecord, WorkspaceBrandKit
from app.ai.schemas.ai_schemas import (
    ImageGenerationRequest,
    ImageGenerationResponse,
    AIImageRecordResponse,
)
from app.ai.services.provider_manager import provider_manager
from app.ai.services.usage_tracking_service import UsageTrackingService


STYLE_PROMPT_MAP = {
    "photorealistic": "photorealistic, 8k resolution, ultra-detailed photography, natural cinematic lighting, clean sharp focus",
    "modern": "modern tech poster design, sleek minimalist vector art, vibrant gradients, clean typography",
    "corporate": "professional corporate aesthetic, enterprise executive style, modern office environment, polished presentation",
    "luxury": "luxury high-end premium design, elegant gold accents, deep dark background, sophisticated aesthetic",
    "minimal": "minimalist design, clean empty space, simple geometric forms, muted color palette",
    "flat_illustration": "flat 2D vector illustration, modern digital art, clean lines, vibrant flat colors",
    "watercolor": "artistic watercolor painting, soft pigment blurs, expressive brush strokes, gentle paper texture",
    "anime": "anime art style, vibrant studio anime illustration, expressive lighting, detailed cel shading",
    "3d_render": "octane 3D render, clay motion 3D illustration, soft studio ambient occlusion, volumetric lighting",
    "cyberpunk": "cyberpunk neon aesthetic, futuristic city night, glowing cyan and magenta lights, high tech dark style",
    "vintage": "vintage retro 70s poster aesthetic, grainy film texture, warm nostalgic tones, classic typography",
    "cartoon": "playful 3D cartoon style, cute character design, smooth lighting, vibrant cheerful colors",
}


class AIImageService:
    @staticmethod
    async def generate_image(
        db: AsyncSession, request: ImageGenerationRequest
    ) -> ImageGenerationResponse:
        start_time = time.time()
        workspace_id = request.workspace_id or "default"

        # 1. Fetch workspace brand kit (if configured) to enhance prompt
        brand_info = ""
        result = await db.execute(
            select(WorkspaceBrandKit).where(WorkspaceBrandKit.workspace_id == workspace_id)
        )
        brand_kit = result.scalars().first()
        if brand_kit and brand_kit.brand_name:
            brand_info = f" [Brand Identity: {brand_kit.brand_name}, Style: {brand_kit.preferred_visual_style}]"

        # 2. Append style preset
        style_instruction = STYLE_PROMPT_MAP.get(request.style or "photorealistic", STYLE_PROMPT_MAP["photorealistic"])
        rendered_prompt = f"{request.prompt}{brand_info}, {style_instruction}"

        # 3. Calculate width/height based on aspect ratio
        width = request.width or 1080
        height = request.height or 1080
        aspect_ratio = request.aspect_ratio or "1:1"

        if aspect_ratio == "16:9":
            width, height = 1200, 628
        elif aspect_ratio == "9:16":
            width, height = 1080, 1920
        elif aspect_ratio == "4:5":
            width, height = 1080, 1350
        elif aspect_ratio == "2:1":
            width, height = 1200, 600

        # 4. Invoke Provider Manager
        img_res = provider_manager.generate_image(
            request.prompt,
            options={
                "style": request.style,
                "width": width,
                "height": height,
                "rendered_prompt": rendered_prompt,
            },
        )

        latency_ms = round((time.time() - start_time) * 1000, 2)
        image_url = img_res.image_url or f"https://image.pollinations.ai/prompt/{urllib.parse.quote(rendered_prompt)}?width={width}&height={height}&nologo=true"

        # 5. Record to AIImageRecord
        record = AIImageRecord(
            workspace_id=workspace_id,
            prompt=request.prompt,
            rendered_prompt=rendered_prompt,
            provider="pollinations",
            style=request.style or "photorealistic",
            aspect_ratio=aspect_ratio,
            width=width,
            height=height,
            image_url=image_url,
            status="success",
            latency_ms=latency_ms,
        )
        db.add(record)
        await db.commit()
        await db.refresh(record)

        # 6. Update usage tracking
        await UsageTrackingService.record_usage(
            db,
            workspace_id=workspace_id,
            provider="pollinations",
            model="flux",
            latency_ms=latency_ms,
            tokens_used=1024,
            success=True,
        )

        return ImageGenerationResponse(
            status="success",
            message="Image generated and saved successfully.",
            image_url=image_url,
            rendered_prompt=rendered_prompt,
            provider="pollinations",
            style=request.style or "photorealistic",
            aspect_ratio=aspect_ratio,
            width=width,
            height=height,
            latency_ms=latency_ms,
            record_id=record.id,
        )

    @staticmethod
    async def get_images(
        db: AsyncSession,
        workspace_id: Optional[str] = None,
        style: Optional[str] = None,
        provider: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
    ) -> List[AIImageRecordResponse]:
        query = select(AIImageRecord)
        if workspace_id:
            query = query.where(AIImageRecord.workspace_id == workspace_id)
        if style:
            query = query.where(AIImageRecord.style == style)
        if provider:
            query = query.where(AIImageRecord.provider == provider)
        if search:
            query = query.where(AIImageRecord.prompt.ilike(f"%{search}%"))

        query = query.order_by(desc(AIImageRecord.created_at)).limit(limit)
        result = await db.execute(query)
        records = result.scalars().all()

        return [
            AIImageRecordResponse(
                id=r.id,
                workspace_id=r.workspace_id,
                prompt=r.prompt,
                rendered_prompt=r.rendered_prompt,
                provider=r.provider,
                style=r.style,
                aspect_ratio=r.aspect_ratio,
                width=r.width,
                height=r.height,
                image_url=r.image_url,
                status=r.status,
                latency_ms=r.latency_ms,
                created_at=str(r.created_at),
            )
            for r in records
        ]

    @staticmethod
    async def get_image_by_id(db: AsyncSession, image_id: str) -> Optional[AIImageRecordResponse]:
        result = await db.execute(select(AIImageRecord).where(AIImageRecord.id == image_id))
        r = result.scalars().first()
        if not r:
            return None
        return AIImageRecordResponse(
            id=r.id,
            workspace_id=r.workspace_id,
            prompt=r.prompt,
            rendered_prompt=r.rendered_prompt,
            provider=r.provider,
            style=r.style,
            aspect_ratio=r.aspect_ratio,
            width=r.width,
            height=r.height,
            image_url=r.image_url,
            status=r.status,
            latency_ms=r.latency_ms,
            created_at=str(r.created_at),
        )

    @staticmethod
    async def delete_image(db: AsyncSession, image_id: str) -> bool:
        result = await db.execute(delete(AIImageRecord).where(AIImageRecord.id == image_id))
        await db.commit()
        return result.rowcount > 0

    @staticmethod
    async def regenerate_image(db: AsyncSession, image_id: str) -> ImageGenerationResponse:
        record_res = await db.execute(select(AIImageRecord).where(AIImageRecord.id == image_id))
        record = record_res.scalars().first()
        if not record:
            raise ValueError(f"Image record with ID '{image_id}' not found.")

        req = ImageGenerationRequest(
            prompt=record.prompt,
            style=record.style,
            aspect_ratio=record.aspect_ratio,
            width=record.width,
            height=record.height,
            workspace_id=record.workspace_id,
        )
        return await AIImageService.generate_image(db, req)
