from typing import Optional
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.storage import storage_service

router = APIRouter(prefix="/users", tags=["User Profile & Account"])


class UserProfileSchema(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    is_active: bool = True
    is_verified: bool = True


class UpdateProfileSchema(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


@router.get("/me", response_model=UserProfileSchema)
async def get_my_profile(db: AsyncSession = Depends(get_db)):
    return UserProfileSchema(
        id="usr-1",
        email="alex.designer@socialpilot.ai",
        full_name="Alex Rivera",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        is_active=True,
        is_verified=True,
    )


@router.put("/me", response_model=UserProfileSchema)
async def update_my_profile(
    payload: UpdateProfileSchema, db: AsyncSession = Depends(get_db)
):
    return UserProfileSchema(
        id="usr-1",
        email="alex.designer@socialpilot.ai",
        full_name=payload.full_name or "Alex Rivera",
        avatar_url=payload.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        is_active=True,
        is_verified=True,
    )


@router.post("/avatar", response_model=dict)
async def upload_avatar(file: UploadFile = File(...)):
    result = await storage_service.upload_file(
        file.file, file.filename or "avatar.png", file.content_type or "image/png"
    )
    return {"url": result.url, "file_key": result.file_key}
