param(
  [Parameter(Mandatory=$true)]
  [string]$Id
)

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

$ready = $false

try {
  $res = Invoke-WebRequest "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
  if ($res.StatusCode -ge 200 -and $res.StatusCode -lt 500) {
    $ready = $true
  }
} catch {}

if (-not $ready) {
  Write-Host "DEV_SERVER_STARTING" -ForegroundColor Yellow

  $cmd = "cd `"$root`"; npm run dev -- -H localhost -p 3000"
  Start-Process powershell -ArgumentList '-NoExit','-Command',$cmd

  for ($i = 1; $i -le 45; $i++) {
    Start-Sleep -Seconds 1

    try {
      $res = Invoke-WebRequest "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
      if ($res.StatusCode -ge 200 -and $res.StatusCode -lt 500) {
        $ready = $true
        break
      }
    } catch {}

    Write-Host "WAITING_DEV_SERVER $i / 45"
  }
}

if ($ready) {
  Write-Host "LOCAL_SERVER_READY" -ForegroundColor Green
  $t = Get-Date -Format yyyyMMddHHmmss
  Start-Process "http://localhost:3000/quiz?mode=dev-question&id=$Id&v=local&t=$t"
} else {
  Write-Host "LOCAL_SERVER_NOT_READY" -ForegroundColor Red
  exit 1
}