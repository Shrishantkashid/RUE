@echo off
setlocal
cd /d %~dp0

echo ==========================================
echo Setting up Recursive Understanding Engine (RUE)
echo ==========================================

:: Detect Python command
set PYTHON_CMD=python
python --version >nul 2>&1
if errorlevel 1 (
    set PYTHON_CMD=py
    py --version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Python not found! Please install Python and add it to your PATH.
        pause
        exit /b 1
    )
)

:: Setup Backend
echo [1/2] Setting up Backend (Python using %PYTHON_CMD%)...
cd backend
if not exist venv (
    echo Creating virtual environment...
    %PYTHON_CMD% -m venv venv
)
echo Activating virtual environment and installing dependencies...
call venv\Scripts\activate
python -m pip install -r requirements.txt
cd ..

:: Setup Frontend
echo [2/2] Setting up Frontend (Node)...
cd frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    npm install
) else (
    echo Frontend node_modules already exists.
)
cd ..

echo.
echo ------------------------------------------
echo Setup complete. Run start.bat to start the application.
echo ------------------------------------------
echo.
pause
