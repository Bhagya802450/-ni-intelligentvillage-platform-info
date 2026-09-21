Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "   HP-ASN & SUADR Platform Launcher (Himachal Pradesh Agriculture)" -ForegroundColor Cyan
Write-Host "=========================================================================" -ForegroundColor Green

Write-Host "Starting Backend API Gateway on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot/backend'; npm start"

Start-Sleep -Seconds 2

Write-Host "Starting Frontend Client UI on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot/frontend'; npm run dev"

Write-Host "`nAll platform services launched!" -ForegroundColor Green
Write-Host "Frontend Portal: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend Gateway Health: http://localhost:5000/api/health" -ForegroundColor Cyan
