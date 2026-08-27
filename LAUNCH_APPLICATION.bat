@echo off
title Launching Tutor Management System...
echo =========================================================
echo 🚀 Starting Tutor Management System (CSE327)
echo =========================================================
echo.
echo 1. Seeding Database...
call cd backend
call npm run seed
call cd ..

echo.
echo 2. Launching Servers...
start "TMS Backend Server" cmd /k "cd backend && node server.js"
start "TMS Frontend Client" cmd /k "cd frontend && npm run dev"

echo.
echo 3. Opening Web Browser...
timeout /t 3 >nul
start http://127.0.0.1:3000

echo.
echo ✅ TMS is now running at http://127.0.0.1:3000! Keep server windows open during demo.
pause
