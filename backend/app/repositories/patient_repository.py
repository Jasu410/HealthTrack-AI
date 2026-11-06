import sqlite3

from app.validation import ValidatedPatient

PATIENT_COLUMNS = (
    "id, full_name, date_of_birth, email, glucose, haemoglobin, cholesterol, "
    "ai_remarks, ai_remarks_status, created_at, updated_at"
)


def _escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def list_patients(connection: sqlite3.Connection, search: str | None) -> list[sqlite3.Row]:
    if search:
        pattern = f"%{_escape_like(search)}%"
        return connection.execute(
            f"SELECT {PATIENT_COLUMNS} FROM patients "
            "WHERE full_name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' "
            "ORDER BY created_at DESC, id DESC",
            (pattern, pattern),
        ).fetchall()
    return connection.execute(
        f"SELECT {PATIENT_COLUMNS} FROM patients ORDER BY created_at DESC, id DESC"
    ).fetchall()


def get_patient(connection: sqlite3.Connection, patient_id: int) -> sqlite3.Row | None:
    return connection.execute(
        f"SELECT {PATIENT_COLUMNS} FROM patients WHERE id = ?", (patient_id,)
    ).fetchone()


def insert_patient(
    connection: sqlite3.Connection,
    patient: ValidatedPatient,
    remarks: str | None,
    remarks_status: str,
    timestamp: str,
) -> int:
    cursor = connection.execute(
        "INSERT INTO patients (full_name, date_of_birth, email, glucose, haemoglobin, cholesterol, "
        "ai_remarks, ai_remarks_status, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            patient.full_name,
            patient.date_of_birth.isoformat(),
            patient.email,
            patient.glucose,
            patient.haemoglobin,
            patient.cholesterol,
            remarks,
            remarks_status,
            timestamp,
            timestamp,
        ),
    )
    return int(cursor.lastrowid)


def update_patient(
    connection: sqlite3.Connection,
    patient_id: int,
    patient: ValidatedPatient,
    remarks: str | None,
    remarks_status: str,
    timestamp: str,
) -> bool:
    cursor = connection.execute(
        "UPDATE patients SET full_name = ?, date_of_birth = ?, email = ?, glucose = ?, "
        "haemoglobin = ?, cholesterol = ?, ai_remarks = ?, ai_remarks_status = ?, updated_at = ? "
        "WHERE id = ?",
        (
            patient.full_name,
            patient.date_of_birth.isoformat(),
            patient.email,
            patient.glucose,
            patient.haemoglobin,
            patient.cholesterol,
            remarks,
            remarks_status,
            timestamp,
            patient_id,
        ),
    )
    return cursor.rowcount > 0


def delete_patient(connection: sqlite3.Connection, patient_id: int) -> bool:
    cursor = connection.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
    return cursor.rowcount > 0
