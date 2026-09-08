@echo off
echo ========================================================
echo  MovieOS - Starting FastAPI Backend Server
echo ========================================================
cd /d "%~dp0backend"
set PYTHONPATH=.
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir . --reload-dir . --host 0.0.0.0 --port 8000 --reload
pause
