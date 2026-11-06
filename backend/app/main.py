from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database import init_db
from app.routes import assessment, dashboard, patients, system
from app.services.patient_service import NotFoundError
from app.validation import ValidationFailed


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="HealthTrack AI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
)

app.include_router(system.router)
app.include_router(patients.router)
app.include_router(dashboard.router)
app.include_router(assessment.router)


@app.exception_handler(ValidationFailed)
async def handle_validation_failed(_: Request, exc: ValidationFailed) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"message": "Please correct the highlighted fields.", "errors": exc.errors},
    )


@app.exception_handler(NotFoundError)
async def handle_not_found(_: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"message": f"Patient record {exc.args[0]} was not found."})
