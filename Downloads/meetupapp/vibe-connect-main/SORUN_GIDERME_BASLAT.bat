@echo off
chcp 65001 >nul
echo ========================================
echo   SORUN GIDERME VE BASLAT
echo ========================================
echo.

echo [1/5] Node process'leri kontrol ediliyor...
tasklist | findstr node.exe
echo.

echo [2/5] Prisma client temizleniyor...
cd server
if exist node_modules\.prisma rmdir /s /q node_modules\.prisma
echo.

echo [3/5] Prisma generate calistiriliyor...
call npm run prisma:generate
if errorlevel 1 (
    echo HATA: Prisma generate basarisiz!
    echo Lutfen node process'lerini kapatip tekrar deneyin.
    pause
    exit /b 1
)
echo.

echo [4/5] Database migration kontrol ediliyor...
echo NOT: Eger yeni field'lar eklendiyse migration gerekebilir
echo Migration icin: cd server ^&^& npm run prisma:migrate
echo.

echo [5/5] Backend baslatiliyor...
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 >nul

cd ..
echo.
echo [6/6] Frontend baslatiliyor...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo   BASLATILDI!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173 (veya 5174)
echo.
echo Eger hata alirsaniz:
echo 1. Her iki pencereyi de kapat
echo 2. Bu scripti tekrar calistir
echo.
pause
