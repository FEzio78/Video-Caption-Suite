@echo off
setlocal

echo.
echo ============================================================
echo   Video Caption Suite
echo ============================================================
echo.

cd /d "%~dp0"

REM Check if venv exists
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found
    echo Please run install.bat first
    pause
    exit /b 1
)

REM Activate venv
call venv\Scripts\activate.bat

echo Starting server on http://localhost:8000
echo.
echo Press Ctrl+C to stop
echo.

REM Start the server
python -m uvicorn backend.api:app --host 0.0.0.0 --port 8000

pause
