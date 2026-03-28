param(
  [switch]$KillPort
)

$ErrorActionPreference = "Continue"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  foreach ($dir in @(
      "C:\Program Files\nodejs",
      "C:\Program Files (x86)\nodejs"
    )) {
    if (Test-Path "$dir\npm.cmd") {
      $env:Path = "$dir;$env:Path"
      break
    }
  }
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm을 찾을 수 없습니다. Node.js를 설치한 뒤 터미널을 닫았다가 다시 여세요: https://nodejs.org" -ForegroundColor Red
  exit 127
}

Set-Location $PSScriptRoot

if ($KillPort) {
  Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object {
      Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Starting Next.js (frontend)…" -ForegroundColor Cyan
npm run dev --prefix frontend
