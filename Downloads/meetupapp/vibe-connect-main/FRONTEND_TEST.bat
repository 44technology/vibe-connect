@echo off
chcp 65001 >nul
echo ========================================
echo   FRONTEND TEST VE BASLAT
echo ========================================
echo.

echo [1/4] Klasor kontrol...
cd /d "%~dp0"
echo Klasor: %CD%
echo.

echo [2/4] Dosya kontrol...
if not exist package.json (
    echo HATA: package.json bulunamadi!
    pause
    exit /b 1
)
echo ✓ package.json bulundu
echo.

if not exist node_modules (
    echo [3/4] node_modules yok, yukleniyor...
    call npm install
    if errorlevel 1 (
        echo HATA: npm install basarisiz!
        pause
        exit /b 1
    )
) else (
    echo [3/4] node_modules mevcut
)
echo.

echo [4/4] Frontend baslatiliyor...
echo.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo.
echo CTRL+C ile durdurabilirsiniz
echo.
call npm run dev
