from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings

db_url = settings.SQLALCHEMY_DATABASE_URI

if "sqlite" in db_url:
    engine = create_async_engine(
        db_url,
        echo=settings.DEBUG,
        future=True,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_async_engine(
        db_url,
        echo=settings.DEBUG,
        future=True,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True,
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
