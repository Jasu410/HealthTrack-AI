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
        patient\_repository.py       SQL for patient create, read, update, delete
        assessment\_repository.py    SQL for the assessment validation log
      services/
        patient\_service.py          Validation, AI remarks, record mapping
        assessment\_service.py       Assessment import: accept, reject, flag duplicates
        gemini\_service.py           Calls the Gemini API from the server
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

### 1\. Backend environment

Copy `.env.example` to `.env` in the project root and set `GEMINI\_API\_KEY`. Without a key the API still works and AI remarks are saved as unavailable.

### 2\. Run the backend

Requires Python 3.10 or newer.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000

Interactive API documentation: http://localhost:8000/docs

### 3\. Run the frontend

Requires Node.js 18 or newer. In a second terminal:

```bash
cd frontend
cp .env.example .env             # Windows: copy .env.example .env
npm install
npm run dev
```

Open http://localhost:5173. The frontend reads its API address from `VITE\_API\_BASE\_URL` (default `http://localhost:8000`). The backend allows the frontend origin through `CORS\_ORIGINS` (default `http://localhost:5173`).

### 4\. Build the frontend

```bash
cd frontend
npm run build
```

## 

* \## Assessment records
* 
* The application imports patient assessment records from a JSON file containing:
* \- Full name
* \- Date of birth
* \- Email
* \- Glucose
* \- Haemoglobin
* \- Cholesterol
* 
* Supported date formats: DD/MM/YYYY and DD.MM.YYYY.
* 
* The import process:
* \- Saves valid records to the patient database.
* \- Rejects invalid records and records the validation reasons.
* \- Identifies duplicate records and prevents duplicate insertion.
* \- Preserves original assessment values in the assessment log.

\## Testing completed



The following features were tested:



\- Patient creation, editing, viewing and deletion.

\- Input validation for dates, email and blood values.

\- SQLite database persistence.

\- Assessment import with accepted, rejected and duplicate records.

\- Gemini AI-generated educational health remarks.

\- Dashboard display of patient records and statistics.



AI-generated remarks provide general educational information only and are not medical diagnoses.

