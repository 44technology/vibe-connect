@echo off
chcp 65001 >nul
echo ========================================
echo   TEST ET - ADIM ADIM
echo ========================================
echo.

echo ADIM 1: Node process'lerini kapat
echo.
echo Lutfen su process'leri kapat:
echo - Backend server (varsa)
echo - Frontend server (varsa)
echo - Herhangi bir node process
echo.
echo Devam etmek icin bir tusa basin...
pause
echo.

echo ADIM 2: Prisma schema duzeltiliyor...
cd server
if exist node_modules\.prisma (
    echo Prisma cache temizleniyor...
    rmdir /s /q node_modules\.prisma 2>nul
)
echo.

echo ADIM 3: Prisma generate...
call npm run prisma:generate
if errorlevel 1 (
    echo.
    echo HATA: Prisma generate basarisiz!
    echo.
    echo Cozum:
    echo 1. Tum node process'lerini kapat (Task Manager)
    echo 2. Bu scripti tekrar calistir
    echo.
    pause
    exit /b 1
)
echo Prisma generate basarili!
echo.

echo ADIM 4: Database migration kontrol...
echo.
echo YENI FIELD'LAR EKLENDI!
echo Migration yapmaniz gerekebilir:
echo.
echo   cd server
echo   npm run prisma:migrate
echo.
echo Devam etmek icin bir tusa basin...
pause
echo.

echo ADIM 5: Backend baslatiliyor...
start "Backend" cmd /k "title Backend Server && npm run dev"
timeout /t 5 >nul

echo ADIM 6: Backend saglik kontrolu...
curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo Backend henuz hazir degil, bekleniyor...
    timeout /t 3 >nul
)
echo.

cd ..
echo ADIM 7: Frontend baslatiliyor...
start "Frontend" cmd /k "title Frontend Server && npm run dev"
timeout /t 3 >nul

echo.
echo ========================================
echo   BASLATILDI!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173 (veya 5174)
echo.
echo Eger hata gorurseniz:
echo 1. Backend penceresindeki hata mesajini kontrol edin
echo 2. Frontend penceresindeki hata mesajini kontrol edin
echo 3. Database migration yapin: cd server ^&^& npm run prisma:migrate
echo.
pause
