from fastapi import APIRouter

from app.schemas import HealthStatus
from app.services import gemini_service

router = APIRouter(prefix="/api", tags=["system"])


@router.get("/health", response_model=HealthStatus)
def health() -> dict:
    return {"status": "ok", "ai_configured": gemini_service.is_configured()}
