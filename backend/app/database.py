import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager

from app.config import get_settings

SCHEMA = """
CREATE TABLE IF NOT EXISTS patients (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name         TEXT    NOT NULL,
    date_of_birth     TEXT    NOT NULL,
    email             TEXT    NOT NULL,
    glucose           REAL    NOT NULL,
    haemoglobin       REAL    NOT NULL,
    cholesterol       REAL    NOT NULL,
    ai_remarks        TEXT,
    ai_remarks_status TEXT    NOT NULL CHECK (ai_remarks_status IN ('generated', 'unavailable')),
    created_at        TEXT    NOT NULL,
    updated_at        TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients (created_at DESC);
CREATE TABLE IF NOT EXISTS assessment_imports (
    id          INTEGER PRIMARY KEY CHECK (id = 1),
    batch_id    TEXT    NOT NULL,
    imported_at TEXT    NOT NULL
);
CREATE TABLE IF NOT EXISTS assessment_entries (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id        TEXT    NOT NULL,
    record_number   INTEGER NOT NULL,
    status          TEXT    NOT NULL CHECK (status IN ('accepted', 'rejected', 'duplicate')),
    patient_id      INTEGER,
    duplicate_of    INTEGER,
    original_values TEXT    NOT NULL,
    reasons         TEXT    NOT NULL,
    created_at      TEXT    NOT NULL
);
"""


def init_db() -> None:
    database_path = get_settings().database_path
    database_path.parent.mkdir(parents=True, exist_ok=True)
    with get_connection() as connection:
        connection.executescript(SCHEMA)


@contextmanager
def get_connection() -> Iterator[sqlite3.Connection]:
    connection = sqlite3.connect(get_settings().database_path)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
