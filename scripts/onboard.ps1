param(
  [switch]$SkipBunInstall
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "HaritaDocs guided onboarding"
Write-Host "This script keeps setup simple: install bun, install dependencies, collect env values, apply migration, seed, and launch." -ForegroundColor Cyan

$bun = Get-Command bun -ErrorAction SilentlyContinue
if (-not $bun) {
  if ($SkipBunInstall) {
    throw "Bun is not installed. Re-run without -SkipBunInstall or install bun manually first."
  }

  $answer = Read-Host "Bun is missing. Install it automatically now? (Y/n)"
  if ([string]::IsNullOrWhiteSpace($answer) -or $answer.ToLower() -in @("y", "yes")) {
    powershell -c "irm bun.sh/install.ps1 | iex"
    $bunPath = Join-Path $HOME ".bun\bin"
    if (Test-Path $bunPath) {
      $env:Path = "$bunPath;$env:Path"
    }
  } else {
    throw "Cannot continue without bun."
  }
}

Set-Location $RepoRoot
& bun run onboard
