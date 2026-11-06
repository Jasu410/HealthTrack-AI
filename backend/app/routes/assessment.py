from fastapi import APIRouter, HTTPException, status

from app.schemas import AssessmentImportRequest, AssessmentResults
from app.services import assessment_service
from app.services.assessment_service import AlreadyImportedError

router = APIRouter(prefix="/api/assessment", tags=["assessment"])


@router.get("/results", response_model=AssessmentResults)
def get_results() -> dict:
    return assessment_service.get_results()


@router.post("/import", response_model=AssessmentResults, status_code=status.HTTP_201_CREATED)
def import_records(payload: AssessmentImportRequest) -> dict:
    if not payload.records:
        raise HTTPException(status_code=400, detail="Provide at least one record to import.")
    try:
        return assessment_service.import_records(payload.records)
    except AlreadyImportedError:
        raise HTTPException(
            status_code=409,
            detail="Assessment records have already been imported. Results are kept unchanged.",
        )
