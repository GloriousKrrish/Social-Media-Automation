from typing import Optional
from fastapi import APIRouter, Depends, File, UploadFile, Header
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.storage import storage_service

router = APIRouter(prefix="/users", tags=["User Profile & Account"])

# In-memory store for active session user profile fallback
_user_profile_db = {
    "id": "usr-1",
    "email": "admin@socialpilot.ai",
    "full_name": "Admin User",
    "avatar_url": None,
    "is_active": True,
    "is_verified": True,
}


class UserProfileSchema(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    is_active: bool = True
    is_verified: bool = True


class UpdateProfileSchema(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


def derive_name_from_email(email: str) -> str:
    if not email or "@" not in email:
        return "User"
    handle = email.split("@")[0]
    parts = [p.capitalize() for p in handle.replace(".", " ").replace("_", " ").split()]
    return " ".join(parts) if parts else "User"


@router.get("/me", response_model=UserProfileSchema)
async def get_my_profile(
    x_user_email: Optional[str] = Header(None),
    x_user_name: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
):
    email = x_user_email or _user_profile_db["email"]
    name = x_user_name or _user_profile_db["full_name"] or derive_name_from_email(email)

    return UserProfileSchema(
        id=_user_profile_db["id"],
        email=email,
        full_name=name,
        avatar_url=_user_profile_db["avatar_url"],
        is_active=_user_profile_db["is_active"],
        is_verified=_user_profile_db["is_verified"],
    )


@router.put("/me", response_model=UserProfileSchema)
async def update_my_profile(
    payload: UpdateProfileSchema, db: AsyncSession = Depends(get_db)
):
    if payload.email:
        _user_profile_db["email"] = payload.email
    if payload.full_name:
        _user_profile_db["full_name"] = payload.full_name
    if payload.avatar_url is not None:
        _user_profile_db["avatar_url"] = payload.avatar_url

    return UserProfileSchema(
        id=_user_profile_db["id"],
        email=_user_profile_db["email"],
        full_name=_user_profile_db["full_name"],
        avatar_url=_user_profile_db["avatar_url"],
        is_active=_user_profile_db["is_active"],
        is_verified=_user_profile_db["is_verified"],
    )


@router.post("/avatar", response_model=dict)
async def upload_avatar(file: UploadFile = File(...)):
    result = await storage_service.upload_file(
        file.file, file.filename or "avatar.png", file.content_type or "image/png"
    )
    return {"url": result.url, "file_key": result.file_key}
