# 🧠 MindCheck — Mental Awareness Survey

A full-stack MERN mental wellness survey platform.

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### 1. Backend
```bash
cd backend
npm install
npm run dev        # starts on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:5173
```

## Features
- 12 MCQ mental wellness questions (no login required)
- Auto-advance on answer selection with Framer Motion transitions
- Personal details form before showing result
- Score-based categorization: Healthy Mindset / Mild Stress / Moderate Emotional Distress / High Mental Wellness Concern
- Animated circular score visualization
- PDF report download
- Admin dashboard (secret: `admin123`) with analytics, filtering, CSV export

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/survey | Submit survey + user details |
| GET | /api/survey/:id | Get result by ID |
| GET | /api/survey/:id/pdf | Download PDF report |
| GET | /api/admin/results | List all results (auth required) |
| GET | /api/admin/analytics | Category analytics |
| GET | /api/admin/export | CSV export |

Admin auth: send `x-admin-secret: admin123` header (change in `.env`).

## Scoring
Each answer: Never=0, Sometimes=1, Often=2, Always=3  
Max score = questions × 3 = 36

| Score % | Category |
|---------|----------|
| 0–25% | Healthy Mindset |
| 26–50% | Mild Stress |
| 51–75% | Moderate Emotional Distress |
| 76–100% | High Mental Wellness Concern |
