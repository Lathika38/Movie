# 🎬 MovieOS — One OS. Every Story. Smarter Cinema.

MovieOS is an **AI-powered Cinema Operating System** connecting Directors, Producers, Actors, Music Directors, and Studio Admins into one unified production platform with real-time database persistence, Gemini AI agents, OpenWeather production risk radar, and live Wikipedia intelligence.

---

## 🌟 Key Highlights & Features

- **Role-Based Workspaces**: Tailored suites for **Director**, **Producer**, **Actor**, **Music Director**, and **Studio Admin**.
- **Appearance & Theme Selector**: Toggle between **Light**, **Dark**, and **System** themes across all pages and workspaces.
- **100% Fully Responsive Layout**: Mobile-first fluid design supporting phones (320px+), tablets (768px+), and desktops (1024px+).
- **Producer AI Assistant & CRUD**: Auto-generates and aligns shooting schedules, department budgets, and general ledger purchase orders. All call sheets, expenses, and department allocations are **100% editable and deletable**.
- **Real-Time Data Engine**: Zero hardcoded mock data. Dynamic AI screenplay breakdown, casting recommendations with live Wikipedia API portraits and summaries, and OpenWeather live weather risk alerts.

---

## 🚀 Quick Start Guide

### Option A: One-Click Launch (Windows)

1. Double-click `run_backend.bat` to launch the **FastAPI Backend** (`http://localhost:8000`).
2. Double-click `run_frontend.bat` to launch the **React Vite Frontend** (`http://localhost:5173`).

---

### Option B: Manual Terminal Execution

#### 1. Backend Setup & Run (FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation available at: `http://localhost:8000/docs`

#### 2. Frontend Setup & Run (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open in browser at: `http://localhost:5173`

---

## 📦 Pushing to GitHub (Requirements & Instructions)

### 1. Requirements Files Provided in Repository
- **`.gitignore`**: Excludes secret API keys (`.env`), `node_modules/`, `dist/`, `__pycache__/`, `venv/`, and temporary databases.
- **`backend/requirements.txt`**: Lists all Python dependencies (`fastapi`, `uvicorn`, `pydantic`, `google-generativeai`, `httpx`, etc.).
- **`frontend/package.json`**: Lists all Node.js dependencies (`react`, `vite`, `tailwindcss`, `lucide-react`, `recharts`, etc.).
- **`.env.example`**: Template environment file for configuration setup without exposing secret credentials.

### 2. Steps to Push Project to GitHub

1. Copy `.env.example` to `.env` and fill in your API credentials:
   ```bash
   cp .env.example .env
   ```

2. Initialize Git Repository and Stage Files:
   ```bash
   git init
   git add .
   ```

3. Commit Your Changes:
   ```bash
   git commit -m "Initial commit: MovieOS Cinema Operating System with AI Workspaces & Responsive Theme Support"
   ```

4. Link and Push to your GitHub Repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
   git push -u origin main
   ```

---

## 🎭 Role-Based Workspaces & Features

| Role | Workspace Route | Key Capabilities |
| :--- | :--- | :--- |
| **Director** | `/director` | Screenplay breakdown with Gemini AI, scene studio, casting dispatch, score approvals |
| **Producer** | `/producer` | Budget vs spent breakdown, call sheets, departments, editable/deletable ledger expenses |
| **Actor** | `/actor` | Inbound casting offers inbox, Stanislavski AI subtext coach, filmography |
| **Music Director** | `/music-director` | Waveform cue library, character leitmotif builder, AI score composer |
| **Studio Admin** | `/admin` | Production telemetry, talent directory, RBAC security manager |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, React Router v7, Tailwind CSS v4, Lucide React, Recharts, Vite 8
- **Backend**: Python 3.11, FastAPI, Pydantic v2, Uvicorn
- **AI & External APIs**: Google Gemini 1.5 Pro, OpenWeather API, Wikipedia REST API

