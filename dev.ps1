# One-command dev startup: checks for the WSL-vs-native port conflict that
# repeatedly breaks "Can't reach the server" for this project, then launches
# both servers natively in their own visible windows so their logs stay on
# screen for live debugging.

$ErrorActionPreference = "SilentlyContinue"
$root = $PSScriptRoot

Write-Host "=== Dev environment check ===" -ForegroundColor Cyan

# 1. Warn if a server is already running inside WSL — it will bind the port
#    inside the WSL network namespace and the browser (native Windows) will
#    get a connection-refused / "Can't reach the server" error even though
#    the WSL terminal looks fine.
$wslHit = wsl.exe -d Ubuntu -e bash -c "ss -tlnp 2>/dev/null | grep -E ':8000|:5173'" 2>$null
if ($wslHit) {
    Write-Host "WARNING: found a server already running inside WSL on port 8000/5173:" -ForegroundColor Yellow
    Write-Host $wslHit -ForegroundColor Yellow
    Write-Host "This project must run natively (this script), not from a WSL terminal — WSL breaks both backend connectivity and live-reload." -ForegroundColor Yellow
    Write-Host "Kill it with: wsl.exe -d Ubuntu -e bash -c `"kill -9 <pid>`"" -ForegroundColor Yellow
    Write-Host ""
}

function Get-PortOwner($port) {
    Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
}

# 2. Backend
$backendConn = Get-PortOwner 8000
if ($backendConn) {
    Write-Host "Port 8000 already in use natively (PID $($backendConn.OwningProcess)) — leaving backend as-is." -ForegroundColor Yellow
} else {
    $venvPython = Join-Path $root "backend\.venv-win\Scripts\python.exe"
    if (-not (Test-Path $venvPython)) {
        Write-Host "backend\.venv-win not found. Create it first:" -ForegroundColor Red
        Write-Host "  cd backend; C:\Python313\python.exe -m venv .venv-win; .\.venv-win\Scripts\python.exe -m pip install -r requirements\base.txt" -ForegroundColor Red
    } else {
        Write-Host "Starting backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; & '$venvPython' manage.py runserver 8000"
    }
}

# 3. Frontend
$frontendConn = Get-PortOwner 5173
if ($frontendConn) {
    Write-Host "Port 5173 already in use natively (PID $($frontendConn.OwningProcess)) — leaving frontend as-is." -ForegroundColor Yellow
} else {
    Write-Host "Starting frontend on http://127.0.0.1:5173 ..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"
}

Write-Host ""
Write-Host "Backend and frontend logs are in their own windows — watch those for request/port errors." -ForegroundColor Cyan
Write-Host "Open http://127.0.0.1:5173/ once both windows report ready." -ForegroundColor Cyan

$global:LASTEXITCODE = 0
