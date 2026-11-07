import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DATABASE_PATH = ROOT_DIR / "backend" / "data" / "healthtrack.db"

load_dotenv(ROOT_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    database_path: Path
    gemini_api_key: str | None
    gemini_model: str
    cors_origins: list[str]


@lru_cache
def get_settings() -> Settings:
    origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    api_key = os.getenv("GEMINI_API_KEY", "").strip() or None
    return Settings(
        database_path=Path(os.getenv("DATABASE_PATH", str(DEFAULT_DATABASE_PATH))),
        gemini_api_key=api_key,
        gemini_model=os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
        cors_origins=[origin.strip() for origin in origins.split(",") if origin.strip()],
    )
