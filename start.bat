@echo off
setlocal
cd /d %~dp0

echo ==========================================
echo Starting Recursive Understanding Engine (RUE)
echo ==========================================

:: Start Backend in a new window
echo [OK] Launching Backend...
start "RUE Backend" cmd /k "cd backend && (if exist venv\Scripts\activate (call venv\Scripts\activate)) && python -m uvicorn main:app --reload"

:: Start Frontend in a new window
echo [OK] Launching Frontend (Vite)...
start "RUE Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ------------------------------------------
echo Services are starting in separate windows.
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:5173
echo ------------------------------------------
echo.
pause
