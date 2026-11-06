# HealthTrack AI - Patient Health Management System

HealthTrack AI stores patient records and blood test results in a SQLite database, validates them, and asks the Gemini API for general informational remarks. The backend is Python FastAPI; the frontend is React and TypeScript.

## Project structure

```
healthtrack-ai/
  backend/
    app/
      main.py                       FastAPI app, CORS, error handlers, startup
      config.py                     Reads environment variables (.env) into settings
      database.py                   SQLite schema (patients, assessment log), connections
      validation.py                 Patient input rules (dates, email, blood values)
      schemas.py                    Request and response shapes for the API
      repositories/
        patient_repository.py       SQL for patient create, read, update, delete
        assessment_repository.py    SQL for the assessment validation log
      services/
        patient_service.py          Validation, AI remarks, record mapping
        assessment_service.py       Assessment import: accept, reject, flag duplicates
        gemini_service.py           Calls the Gemini API from the server
      routes/
        patients.py                 /api/patients endpoints
        dashboard.py                /api/dashboard/summary endpoint
        assessment.py               /api/assessment endpoints
        system.py                   /api/health endpoint
    data/                           SQLite database file is created here
    requirements.txt                Python dependencies
  frontend/
    src/
      components/                   Pages (dashboard, patients, register, assessment), modals, UI parts
      lib/api.ts                    All calls to the backend API
      types/patient.ts              Shared data types
    .env.example                    Frontend API address setting
  .env.example                      Backend environment variables
  README.md
```

## Setup

### 1. Backend environment

Copy `.env.example` to `.env` in the project root and set `GEMINI_API_KEY`. Without a key the API still works and AI remarks are saved as unavailable.

### 2. Run the backend

Requires Python 3.10 or newer.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000 · Interactive docs: http://localhost:8000/docs

### 3. Run the frontend

Requires Node.js 18 or newer. In a second terminal:

```bash
cd frontend
cp .env.example .env             # Windows: copy .env.example .env
npm install
npm run dev
```

Open http://localhost:5173. The frontend reads its API address from `VITE_API_BASE_URL` (default `http://localhost:8000`). The backend allows the frontend origin through `CORS_ORIGINS` (default `http://localhost:5173`).

### 4. Build the frontend

```bash
cd frontend
npm run build
```

## Assessment records

The assessment import accepts a JSON file containing a list of patient records with the fields `full_name`, `date_of_birth` (DD/MM/YYYY), `email`, `glucose`, `haemoglobin` and `cholesterol`. The import runs once:

- Valid records are saved to patient records.
- Invalid records are kept in the assessment log with their original values and reasons.
- A record with the same name and email as an existing record is flagged as a duplicate and is not saved twice.

## Manual testing still required

- Start both servers and confirm the dashboard counts load from the backend.
- Add a patient with valid data and confirm AI remarks appear (requires a Gemini key).
- Add a patient with invalid data (bad date, future date, bad email, non-numeric values) and confirm the messages appear and the typed values remain.
- Search and filter the records table; confirm view, edit and delete work and persist after a page reload.
- Import the assessment file and confirm accepted, rejected and duplicate records display correctly.
- Check the layout on a phone-width screen and a desktop screen.
