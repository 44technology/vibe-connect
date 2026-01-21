@echo off
echo ========================================
echo ULIKME App Baslatiliyor...
echo ========================================
echo.

echo [1/3] Backend baslatiliyor...
start "Backend Server" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/3] Frontend baslatiliyor...
start "Frontend Server" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo ✅ Her iki server baslatildi!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Kapatmak icin pencereyi kapatin.
echo ========================================
pause
