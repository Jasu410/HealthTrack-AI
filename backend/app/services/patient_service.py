import logging
from datetime import date, datetime, timezone

from app.database import get_connection
from app.repositories import patient_repository
from app.services.gemini_service import AIRemarksError, generate_remarks
from app.validation import DISPLAY_DATE_FORMAT, ValidatedPatient, ValidationFailed, validate_patient_input

logger = logging.getLogger(__name__)

RECENT_PATIENT_LIMIT = 5
VALIDITY_FILTERS = ("all", "valid", "invalid")


class NotFoundError(Exception):
    pass


def list_patients(search: str | None, validity: str) -> list[dict]:
    with get_connection() as connection:
        rows = patient_repository.list_patients(connection, search.strip() if search else None)
    records = [_to_record(row) for row in rows]
    if validity == "valid":
        return [record for record in records if record["is_valid"]]
    if validity == "invalid":
        return [record for record in records if not record["is_valid"]]
    return records


def get_patient(patient_id: int) -> dict:
    with get_connection() as connection:
        row = patient_repository.get_patient(connection, patient_id)
    if row is None:
        raise NotFoundError(patient_id)
    return _to_record(row)


def create_patient(data: dict) -> dict:
    patient = validate_patient_input(data)
    remarks, remarks_status = _generate_remarks_or_mark_unavailable(patient)
    timestamp = _now()
    with get_connection() as connection:
        new_id = patient_repository.insert_patient(connection, patient, remarks, remarks_status, timestamp)
        row = patient_repository.get_patient(connection, new_id)
    return _to_record(row)


def update_patient(patient_id: int, data: dict) -> dict:
    with get_connection() as connection:
        existing = patient_repository.get_patient(connection, patient_id)
    if existing is None:
        raise NotFoundError(patient_id)

    patient = validate_patient_input(data)
    if _blood_values_changed(existing, patient):
        remarks, remarks_status = _generate_remarks_or_mark_unavailable(patient)
    else:
        remarks, remarks_status = existing["ai_remarks"], existing["ai_remarks_status"]

    with get_connection() as connection:
        patient_repository.update_patient(connection, patient_id, patient, remarks, remarks_status, _now())
        row = patient_repository.get_patient(connection, patient_id)
    return _to_record(row)


def delete_patient(patient_id: int) -> None:
    with get_connection() as connection:
        deleted = patient_repository.delete_patient(connection, patient_id)
    if not deleted:
        raise NotFoundError(patient_id)


def dashboard_summary() -> dict:
    records = list_patients(search=None, validity="all")
    valid_count = sum(1 for record in records if record["is_valid"])
    return {
        "total_records": len(records),
        "valid_records": valid_count,
        "invalid_records": len(records) - valid_count,
        "recent_patients": records[:RECENT_PATIENT_LIMIT],
    }


def _generate_remarks_or_mark_unavailable(patient: ValidatedPatient) -> tuple[str | None, str]:
    try:
        return generate_remarks(patient), "generated"
    except AIRemarksError as exc:
        logger.warning("AI remarks unavailable: %s", exc)
        return None, "unavailable"


def _blood_values_changed(row, patient: ValidatedPatient) -> bool:
    return (
        row["glucose"] != patient.glucose
        or row["haemoglobin"] != patient.haemoglobin
        or row["cholesterol"] != patient.cholesterol
    )


def _is_valid(row) -> bool:
    stored_input = {
        "full_name": row["full_name"],
        "date_of_birth": _display_date(row["date_of_birth"]),
        "email": row["email"],
        "glucose": row["glucose"],
        "haemoglobin": row["haemoglobin"],
        "cholesterol": row["cholesterol"],
    }
    try:
        validate_patient_input(stored_input)
    except ValidationFailed:
        return False
    return True


def _display_date(iso_date: str) -> str:
    return date.fromisoformat(iso_date).strftime(DISPLAY_DATE_FORMAT)


def _to_record(row) -> dict:
    return {
        "id": row["id"],
        "full_name": row["full_name"],
        "date_of_birth": _display_date(row["date_of_birth"]),
        "email": row["email"],
        "glucose": row["glucose"],
        "haemoglobin": row["haemoglobin"],
        "cholesterol": row["cholesterol"],
        "ai_remarks": row["ai_remarks"],
        "ai_remarks_status": row["ai_remarks_status"],
        "is_valid": _is_valid(row),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
