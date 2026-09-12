# Launch Script for AegisX SOC Backend
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting AegisX SOC Autonomous Multi-Agent Backend     " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

$env:PYTHONPATH = "."
uv run --with fastapi,uvicorn[standard],pydantic,websockets python -m uvicorn backend.app:app --host 0.0.0.0 --port 8000
