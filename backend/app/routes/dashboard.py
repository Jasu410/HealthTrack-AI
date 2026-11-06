from fastapi import APIRouter

from app.schemas import DashboardSummary
from app.services import patient_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary() -> dict:
    return patient_service.dashboard_summary()
