from typing import Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.core.exceptions import DuplicateEntityException, UnauthorizedException
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserRegister, UserLogin, Token
from app.db.models import User


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)

    async def register(self, payload: UserRegister) -> User:
        existing = await self.user_repo.get_by_email(payload.email)
        if existing:
            raise DuplicateEntityException("User", "email", payload.email)

        hashed_pw = get_password_hash(payload.password)
        user = await self.user_repo.create(
            email=payload.email.lower(),
            hashed_password=hashed_pw,
            full_name=payload.full_name,
            is_active=True,
            is_verified=False,
        )
        return user

    async def login(self, payload: UserLogin) -> Tuple[User, Token]:
        user = await self.user_repo.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password.")

        if not user.is_active:
            raise UnauthorizedException("Account is disabled.")

        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)

        token = Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=3600,
        )
        return user, token
