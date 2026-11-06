import math
import re
from dataclasses import dataclass
from datetime import date, datetime

DISPLAY_DATE_FORMAT = "%d/%m/%Y"
DATE_PATTERN = re.compile(r"^\d{2}[/.]\d{2}[/.]\d{4}$")
EMAIL_PATTERN = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$")
EARLIEST_ALLOWED_YEAR = 1900
MAX_NAME_LENGTH = 120
MAX_EMAIL_LENGTH = 254


class ValidationFailed(Exception):
    def __init__(self, errors: dict[str, str]) -> None:
        super().__init__("Patient data failed validation.")
        self.errors = errors


@dataclass(frozen=True)
class ValidatedPatient:
    full_name: str
    date_of_birth: date
    email: str
    glucose: float
    haemoglobin: float
    cholesterol: float


def validate_patient_input(data: dict, today: date | None = None) -> ValidatedPatient:
    today = today or date.today()
    errors: dict[str, str] = {}

    full_name = _clean_text(data.get("full_name"))
    if not full_name:
        errors["full_name"] = "Full name is required."
    elif len(full_name) > MAX_NAME_LENGTH:
        errors["full_name"] = f"Full name must be {MAX_NAME_LENGTH} characters or fewer."

    date_of_birth, dob_error = _parse_date_of_birth(data.get("date_of_birth"), today)
    if dob_error:
        errors["date_of_birth"] = dob_error

    email = _clean_text(data.get("email"))
    if not email:
        errors["email"] = "Email address is required."
    elif len(email) > MAX_EMAIL_LENGTH or not EMAIL_PATTERN.match(email):
        errors["email"] = "Enter a valid email address, for example name@example.com."

    glucose = _parse_blood_value(data.get("glucose"), "Glucose", errors, "glucose")
    haemoglobin = _parse_blood_value(data.get("haemoglobin"), "Haemoglobin", errors, "haemoglobin")
    cholesterol = _parse_blood_value(data.get("cholesterol"), "Cholesterol", errors, "cholesterol")

    if errors:
        raise ValidationFailed(errors)

    return ValidatedPatient(
        full_name=full_name,
        date_of_birth=date_of_birth,
        email=email,
        glucose=glucose,
        haemoglobin=haemoglobin,
        cholesterol=cholesterol,
    )


def _clean_text(value: object) -> str:
    if value is None:
        return ""
    return str(value).strip()


def _parse_date_of_birth(value: object, today: date) -> tuple[date | None, str | None]:
    text = _clean_text(value)
    if not text:
        return None, "Date of birth is required."
    if not DATE_PATTERN.match(text):
        return None, "Date of birth must use the DD/MM/YYYY or DD.MM.YYYY format, for example 31/12/1990."
    try:
        parsed = datetime.strptime(text.replace(".", "/"), DISPLAY_DATE_FORMAT).date()
    except ValueError:
        return None, "This is not a real calendar date. Check the day and month."
    if parsed.year < EARLIEST_ALLOWED_YEAR:
        return None, f"Date of birth cannot be before {EARLIEST_ALLOWED_YEAR}."
    if parsed > today:
        return None, "Date of birth cannot be in the future."
    return parsed, None


def _parse_blood_value(value: object, label: str, errors: dict[str, str], field: str) -> float:
    if isinstance(value, bool):
        errors[field] = f"{label} must be a number."
        return 0.0
    if isinstance(value, (int, float)):
        number = float(value)
    else:
        text = _clean_text(value)
        if not text:
            errors[field] = f"{label} is required."
            return 0.0
        try:
            number = float(text)
        except ValueError:
            errors[field] = f"{label} must be a number, for example 5.4."
            return 0.0
    if not math.isfinite(number):
        errors[field] = f"{label} must be a finite number."
        return 0.0
    if number <= 0:
        errors[field] = f"{label} must be greater than zero."
        return 0.0
    return number
