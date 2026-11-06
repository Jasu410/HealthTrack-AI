import json
import uuid
from datetime import datetime, timezone

from app.database import get_connection
from app.repositories import assessment_repository, patient_repository
from app.services import patient_service
from app.validation import ValidationFailed, validate_patient_input

STATUS_ACCEPTED = "accepted"
STATUS_REJECTED = "rejected"
STATUS_DUPLICATE = "duplicate"


class AlreadyImportedError(Exception):
    pass


def import_records(records: list) -> dict:
    batch_id = uuid.uuid4().hex
    timestamp = datetime.now(timezone.utc).isoformat()
    with get_connection() as connection:
        if not assessment_repository.claim_import(connection, batch_id, timestamp):
            raise AlreadyImportedError()
        existing_rows = patient_repository.list_patients(connection, None)

    seen = {
        _duplicate_key(row["full_name"], row["email"]): (row["id"], f"patient record {row['id']}")
        for row in existing_rows
    }
    outcomes = [_process_record(number, raw, seen) for number, raw in enumerate(records, start=1)]

    with get_connection() as connection:
        for number, (raw, outcome) in enumerate(zip(records, outcomes), start=1):
            assessment_repository.insert_entry(
                connection,
                batch_id=batch_id,
                record_number=number,
                status=outcome["status"],
                patient_id=outcome["patient_id"],
                duplicate_of=outcome["duplicate_of"],
                original_values=json.dumps(raw, ensure_ascii=False),
                reasons=json.dumps(outcome["reasons"], ensure_ascii=False),
                timestamp=timestamp,
            )
    return get_results()


def get_results() -> dict:
    with get_connection() as connection:
        rows = assessment_repository.list_entries(connection)
    entries = [
        {
            "record_number": row["record_number"],
            "status": row["status"],
            "patient_id": row["patient_id"],
            "duplicate_of": row["duplicate_of"],
            "original_values": json.loads(row["original_values"]),
            "reasons": json.loads(row["reasons"]),
            "created_at": row["created_at"],
        }
        for row in rows
    ]
    return {
        "summary": {
            "total": len(entries),
            "accepted": _count(entries, STATUS_ACCEPTED),
            "rejected": _count(entries, STATUS_REJECTED),
            "duplicates": _count(entries, STATUS_DUPLICATE),
        },
        "entries": entries,
    }


def _count(entries: list[dict], status: str) -> int:
    return sum(1 for entry in entries if entry["status"] == status)


def _process_record(number: int, raw: object, seen: dict) -> dict:
    if not isinstance(raw, dict):
        return _outcome(STATUS_REJECTED, reasons=["The record is not a set of patient fields."])

    key = _duplicate_key(_text(raw.get("full_name")), _text(raw.get("email")))
    if key in seen:
        original_id, label = seen[key]
        return _outcome(
            STATUS_DUPLICATE,
            duplicate_of=original_id,
            reasons=[f"Same name and email address as {label}. Not saved again."],
        )

    try:
        validate_patient_input(raw)
    except ValidationFailed as exc:
        return _outcome(STATUS_REJECTED, reasons=list(exc.errors.values()))

    created = patient_service.create_patient(raw)
    seen[key] = (created["id"], f"record #{number}")
    return _outcome(STATUS_ACCEPTED, patient_id=created["id"])


def _outcome(
    status: str,
    patient_id: int | None = None,
    duplicate_of: int | None = None,
    reasons: list[str] | None = None,
) -> dict:
    return {
        "status": status,
        "patient_id": patient_id,
        "duplicate_of": duplicate_of,
        "reasons": reasons or [],
    }


def _text(value: object) -> str:
    return "" if value is None else str(value).strip()


def _duplicate_key(full_name: str, email: str) -> tuple[str, str]:
    return (" ".join(full_name.lower().split()), email.lower())
