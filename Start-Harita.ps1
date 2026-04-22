param(
  [switch]$SkipBunInstall
)

$ErrorActionPreference = "Stop"
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$OnboardScript = Join-Path $ScriptRoot "scripts\onboard.ps1"

if (-not (Test-Path $OnboardScript)) {
  throw "Could not find scripts\onboard.ps1 next to Start-Harita.ps1."
}

& $OnboardScript @PSBoundParameters
