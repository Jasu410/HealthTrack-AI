from fastapi import APIRouter, Query, Response, status

from app.schemas import PatientInput, PatientRecord
from app.services import patient_service
from app.services.patient_service import VALIDITY_FILTERS

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.get("", response_model=list[PatientRecord])
def list_patients(
    search: str | None = Query(default=None, max_length=120),
    validity: str = Query(default="all"),
) -> list[dict]:
    if validity not in VALIDITY_FILTERS:
        validity = "all"
    return patient_service.list_patients(search, validity)


@router.get("/{patient_id}", response_model=PatientRecord)
def get_patient(patient_id: int) -> dict:
    return patient_service.get_patient(patient_id)


@router.post("", response_model=PatientRecord, status_code=status.HTTP_201_CREATED)
def create_patient(payload: PatientInput) -> dict:
    return patient_service.create_patient(payload.model_dump())


@router.put("/{patient_id}", response_model=PatientRecord)
def update_patient(patient_id: int, payload: PatientInput) -> dict:
    return patient_service.update_patient(patient_id, payload.model_dump())


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_patient(patient_id: int) -> Response:
    patient_service.delete_patient(patient_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
