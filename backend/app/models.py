from typing import Literal
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    thread_id: str
    message: str
    location: str | None = None
    budget_remaining: float | None = None


class ChatResponse(BaseModel):
    reply: str
    mode: Literal["live", "configuration_required"]
    proposed_changes: list[dict] = Field(default_factory=list)


class NearbyRequest(BaseModel):
    location: str
    keywords: str = "餐厅"
    radius: int = Field(default=2000, ge=100, le=50000)

