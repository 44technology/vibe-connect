@echo off
echo ====================================
echo ULIKME - Frontend ve Backend
echo ====================================
echo.

cd /d %~dp0

echo Frontend ve Backend birlikte baslatiliyor...
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo NOT: Bu pencereyi kapatmayin!
echo.

start "Backend" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul
start "Frontend" cmd /k "npm run dev"

echo.
echo Her iki sunucu da baslatildi!
echo Pencereleri kontrol edin.
echo.
pause
