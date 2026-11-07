# HealthTrack AI 🏥

An AI-powered healthcare management application that helps manage patient records, validate health data, and generate AI-assisted health remarks.

## 🌐 Live Demo

[HealthTrack AI](https://healthtrack-ai-gilt.vercel.app/)

## 🚀 Features

- **Patient Management:** Register, view, search, edit and delete patient records.
- **AI Health Remarks:** Generate general health observations using Google Gemini.
- **Data Validation:** Validate patient health records and identify invalid entries.
- **Dashboard:** View patient statistics, including total, valid and invalid records.
- **Assessment Management:** Import records and review accepted, rejected and duplicate entries.
- **REST API:** Backend APIs built with FastAPI.

## 🛠️ Technologies Used

**Frontend**
- React
- TypeScript
- Vite

**Backend**
- Python
- FastAPI
- REST API

**Database and AI**
- SQLite
- Google Gemini API

**Deployment**
- Vercel – Frontend
- Render – Backend
- GitHub – Version control

## 🏗️ Project Structure

```text
HealthTrack-AI/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   └── services/
│   └── requirements.txt
├── frontend/
├── .env.example
└── README.md
```

## ⚙️ Environment Variables

Backend:
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `DATABASE_PATH`
- `CORS_ORIGINS`

Frontend:
- `VITE_API_BASE_URL`

Keep API keys private. Never commit your actual `.env` file.

## 🔗 API Documentation

[View HealthTrack AI API Documentation](https://healthtrack-ai-backend.onrender.com/docs)

## ⚠️ Disclaimer

AI-generated remarks are for general informational purposes only. They are not medical diagnoses or a substitute for professional healthcare advice.

## 👩‍💻 Developer

**Shaik Jasmine**

Computer Science Engineering Graduate

[GitHub](https://github.com/Jasu410) · [LinkedIn](https://www.linkedin.com/in/jasminesk41) · [Portfolio](https://jasmine-portfolio-b2yn.vercel.app/)
