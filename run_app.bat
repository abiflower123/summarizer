@echo off
echo ===================================================
echo   Medical Research Search App - Automated Starter
echo ===================================================

echo.
echo [1/4] Checking environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

echo.
echo [2/4] Setting up Backend (Server)...
cd server
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
)
start "Medical App - Backend" cmd /k "node server.js"
cd ..

echo.
echo [3/4] Setting up Frontend (Client)...
cd client
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)

echo.
echo [4/4] Starting Frontend...
echo.
echo ===================================================
echo   NOTE: If the browser refuses to connect:
echo   1. Try accessing http://127.0.0.1:5173
echo   2. Check if the "Medical App - Backend" window is running without errors.
echo ===================================================
echo.

call npm run dev -- --host

pause
