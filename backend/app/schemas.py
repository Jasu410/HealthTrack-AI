from typing import Any

from pydantic import BaseModel

PatientFieldValue = str | int | float | None


class PatientInput(BaseModel):
    full_name: PatientFieldValue = None
    date_of_birth: PatientFieldValue = None
    email: PatientFieldValue = None
    glucose: PatientFieldValue = None
    haemoglobin: PatientFieldValue = None
    cholesterol: PatientFieldValue = None


class PatientRecord(BaseModel):
    id: int
    full_name: str
    date_of_birth: str
    email: str
    glucose: float
    haemoglobin: float
    cholesterol: float
    ai_remarks: str | None
    ai_remarks_status: str
    is_valid: bool
    created_at: str
    updated_at: str


class DashboardSummary(BaseModel):
    total_records: int
    valid_records: int
    invalid_records: int
    recent_patients: list[PatientRecord]


class HealthStatus(BaseModel):
    status: str
    ai_configured: bool


class AssessmentImportRequest(BaseModel):
    records: list[Any]


class AssessmentEntry(BaseModel):
    record_number: int
    status: str
    patient_id: int | None
    duplicate_of: int | None
    original_values: Any
    reasons: list[str]
    created_at: str


class AssessmentSummary(BaseModel):
    total: int
    accepted: int
    rejected: int
    duplicates: int


class AssessmentResults(BaseModel):
    summary: AssessmentSummary
    entries: list[AssessmentEntry]
