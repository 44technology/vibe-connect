@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   PRISMA STUDIO - VERITABANI GORUNTULEME
echo ========================================
echo.
echo Prisma Studio baslatiliyor...
echo Tarayicida http://localhost:5555 adresinde acilacak
echo.
echo Kapatmak icin: Ctrl+C
echo.

cd server
if not exist node_modules (
    echo node_modules bulunamadi! Once npm install calistirin.
    pause
    exit /b 1
)

call npm run prisma:studio

pause
