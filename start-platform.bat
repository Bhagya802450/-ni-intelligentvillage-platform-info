@echo off
echo =========================================================================
echo    HP-ASN & SUADR Platform Launcher (Himachal Pradesh Agriculture Network)
echo =========================================================================
echo.

echo Starting Backend API Gateway Server on port 5000...
start "HP-ASN Backend Server (Port 5000)" cmd /k "cd backend && npm start"

timeout /t 2 /nobreak >nul

echo Starting Frontend UI Dev Server on port 5173...
start "HP-ASN Frontend Web (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo All services launched!
echo Access the Web Portal at: http://localhost:5173
echo Access the API Gateway at: http://localhost:5000/api/health
echo =========================================================================
