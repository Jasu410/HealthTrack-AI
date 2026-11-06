import sqlite3

ENTRY_COLUMNS = (
    "record_number, status, patient_id, duplicate_of, original_values, reasons, created_at"
)


def claim_import(connection: sqlite3.Connection, batch_id: str, timestamp: str) -> bool:
    cursor = connection.execute(
        "INSERT OR IGNORE INTO assessment_imports (id, batch_id, imported_at) VALUES (1, ?, ?)",
        (batch_id, timestamp),
    )
    return cursor.rowcount == 1


def insert_entry(
    connection: sqlite3.Connection,
    batch_id: str,
    record_number: int,
    status: str,
    patient_id: int | None,
    duplicate_of: int | None,
    original_values: str,
    reasons: str,
    timestamp: str,
) -> None:
    connection.execute(
        "INSERT INTO assessment_entries (batch_id, record_number, status, patient_id, duplicate_of, "
        "original_values, reasons, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (batch_id, record_number, status, patient_id, duplicate_of, original_values, reasons, timestamp),
    )


def list_entries(connection: sqlite3.Connection) -> list[sqlite3.Row]:
    return connection.execute(
        f"SELECT {ENTRY_COLUMNS} FROM assessment_entries ORDER BY record_number ASC, id ASC"
    ).fetchall()
