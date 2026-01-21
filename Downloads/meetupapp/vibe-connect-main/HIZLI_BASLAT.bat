@echo off
chcp 65001 >nul
echo ========================================
echo   VIBE CONNECT - HIZLI BASLAT
echo ========================================
echo.

echo [1/3] Backend kontrol ediliyor...
cd server
if not exist node_modules (
    echo Backend node_modules bulunamadi, yukleniyor...
    call npm install
)
echo.

echo [2/3] Prisma schema kontrol ediliyor...
call npm run prisma:generate
echo.

echo [3/3] Backend baslatiliyor...
echo Backend: http://localhost:5000
echo.
start "Backend Server" cmd /k "npm run dev"

timeout /t 3 >nul

echo.
echo [4/4] Frontend baslatiliyor...
cd ..
if not exist node_modules (
    echo Frontend node_modules bulunamadi, yukleniyor...
    call npm install
)
echo Frontend: http://localhost:5173 (veya 5174)
echo.
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo   BASLATILDI!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173 (veya 5174)
echo.
echo Her iki pencereyi de acik tutun!
echo.
pause
