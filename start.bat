@echo off
title AI Visibility Dashboard
echo.
echo ==========================================
echo   AI VISIBILITY DASHBOARD
echo ==========================================
echo.

REM Kill existing processes
echo Cleaning up old processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Start backend
echo Starting backend...
start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak >nul

REM Start frontend
echo Starting frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================
echo   DONE!
echo ==========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Wait 10 seconds, then open: http://localhost:5173
echo.
pause

