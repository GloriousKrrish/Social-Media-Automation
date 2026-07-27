from typing import Optional
from sqlalchemy import String, Text, Float, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.mixins import Base, UUIDPrimaryKeyMixin, TimestampMixin


class WorkspaceAISetting(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "workspace_ai_settings"

    workspace_id: Mapped[str] = mapped_column(String(36), unique=True, index=True, nullable=False)
    preferred_provider: Mapped[str] = mapped_column(String(50), default="openai", nullable=False)
    preferred_model: Mapped[str] = mapped_column(String(100), default="gpt-4o", nullable=False)
    default_language: Mapped[str] = mapped_column(String(50), default="English", nullable=False)
    writing_tone: Mapped[str] = mapped_column(String(50), default="Professional", nullable=False)
    creativity: Mapped[float] = mapped_column(Float, default=0.7, nullable=False)
    target_audience: Mapped[str] = mapped_column(String(100), default="General Business", nullable=False)
    brand_voice: Mapped[str] = mapped_column(String(255), default="Empathetic & Authoritative", nullable=False)
    response_length: Mapped[str] = mapped_column(String(50), default="Medium", nullable=False)


class AIHistoryRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "ai_history_records"

    workspace_id: Mapped[Optional[str]] = mapped_column(String(36), index=True, nullable=True)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    response: Mapped[str] = mapped_column(Text, nullable=False)
    provider: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="success", nullable=False)
    latency_ms: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    usage_metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)


class AIUsageStat(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "ai_usage_stats"

    workspace_id: Mapped[Optional[str]] = mapped_column(String(36), index=True, nullable=True)
    provider: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    request_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    successful_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    failed_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_latency_ms: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
