import logging

import httpx

from app.config import get_settings
from app.validation import ValidatedPatient

logger = logging.getLogger(__name__)

GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
REQUEST_TIMEOUT_SECONDS = 20.0
MAX_REMARKS_LENGTH = 2000
DISCLAIMER = (
    "This is general information only and is not a medical diagnosis. "
    "Please discuss these results with a qualified healthcare professional."
)

PROMPT_TEMPLATE = """You are writing general, educational information about blood test results.
Rules:
- Do not diagnose any condition and do not say the patient has or may have a disease.
- Do not recommend medication or doses.
- Describe in plain language whether each value is typically within, below or above commonly cited adult reference ranges.
- Encourage the patient to discuss the results with a clinician.
- Keep the answer to at most 4 short sentences.

Blood test values:
- Glucose: {glucose} mmol/L
- Haemoglobin: {haemoglobin} g/dL
- Total cholesterol: {cholesterol} mmol/L
"""


class AIRemarksError(Exception):
    pass


def is_configured() -> bool:
    return get_settings().gemini_api_key is not None


def generate_remarks(patient: ValidatedPatient) -> str:
    settings = get_settings()
    if settings.gemini_api_key is None:
        raise AIRemarksError("AI remarks are not configured on the server.")

    prompt = PROMPT_TEMPLATE.format(
        glucose=patient.glucose,
        haemoglobin=patient.haemoglobin,
        cholesterol=patient.cholesterol,
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 400},
    }
    try:
        response = httpx.post(
            GEMINI_ENDPOINT.format(model=settings.gemini_model),
            headers={"x-goog-api-key": settings.gemini_api_key},
            json=payload,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
    except httpx.HTTPError as exc:
        logger.warning("Gemini request failed: %s", exc.__class__.__name__)
        raise AIRemarksError("The AI service could not be reached.") from exc

    if response.status_code != 200:
        logger.warning("Gemini returned HTTP %s", response.status_code)
        raise AIRemarksError(f"The AI service returned an error (HTTP {response.status_code}).")

    try:
        text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        raise AIRemarksError("The AI service returned an unexpected response.") from exc

    text = str(text).strip()
    if not text:
        raise AIRemarksError("The AI service returned an empty response.")
    return f"{text[:MAX_REMARKS_LENGTH]}\n\n{DISCLAIMER}"
