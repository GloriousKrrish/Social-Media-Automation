from typing import Generic, TypeVar, Type, Optional, List, Any
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.mixins import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def get_by_id(self, id: Any) -> Optional[ModelType]:
        query = select(self.model).where(self.model.id == id)
        if hasattr(self.model, "is_deleted"):
            query = query.where(self.model.is_deleted == False)
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        query = select(self.model)
        if hasattr(self.model, "is_deleted"):
            query = query.where(self.model.is_deleted == False)
        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def create(self, **kwargs) -> ModelType:
        db_obj = self.model(**kwargs)
        self.session.add(db_obj)
        await self.session.flush()
        await self.session.refresh(db_obj)
        return db_obj

    async def update(self, db_obj: ModelType, **kwargs) -> ModelType:
        for field, value in kwargs.items():
            if hasattr(db_obj, field) and value is not None:
                setattr(db_obj, field, value)
        self.session.add(db_obj)
        await self.session.flush()
        await self.session.refresh(db_obj)
        return db_obj

    async def soft_delete(self, id: Any) -> bool:
        if hasattr(self.model, "is_deleted"):
            query = (
                update(self.model)
                .where(self.model.id == id)
                .values(is_deleted=True, deleted_at=func.now())
            )
            result = await self.session.execute(query)
            return result.rowcount > 0
        return False
