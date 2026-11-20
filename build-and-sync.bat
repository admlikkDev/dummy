@echo off
echo [1/2] Building React Vite Project...
call npm run build

echo [2/2] Copying dist to NuSnapsClient/app-frontend...
:: Ubah path di bawah sesuai dengan lokasi folder NuSnapsClient kamu
xcopy /E /Y /I ".\dist" "C:\Users\ADAM MALIK IBRAHIM\Documents\Project\exe-projects\nusnaps\app-frontend"

echo.
echo === SELESAI! Asset React terbaru sudah ter-update ===
pause