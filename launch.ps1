param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$winterRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$winterUrl = 'http://127.0.0.1:47827'
try {
    $winterReady = $false
    try {
        $winterResponse = Invoke-WebRequest -UseBasicParsing -Uri "$winterUrl/health" -TimeoutSec 2
        if ($winterResponse.Content -eq 'winter-arc-local-v1') { $winterReady = $true }
        else { throw 'Port 47827 is used by another application.' }
    } catch { }
    if (-not $winterReady) {
        $winterNode = (Get-Command node.exe -ErrorAction Stop).Source
        Start-Process -FilePath $winterNode -ArgumentList ('"' + (Join-Path $winterRoot 'server.cjs') + '"') -WorkingDirectory $winterRoot -WindowStyle Hidden
        for ($winterTry = 0; $winterTry -lt 20; $winterTry++) {
            Start-Sleep -Milliseconds 250
            try {
                $winterResponse = Invoke-WebRequest -UseBasicParsing -Uri "$winterUrl/health" -TimeoutSec 1
                if ($winterResponse.Content -eq 'winter-arc-local-v1') { $winterReady = $true; break }
            } catch { }
        }
    }
    if (-not $winterReady) { throw 'Could not start Winter Arc. Port 47827 may be occupied. See README.md for troubleshooting.' }
    if (-not $NoBrowser) { Start-Process $winterUrl }
    Write-Output 'Winter Arc is ready at http://127.0.0.1:47827'
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host 'Winter Arc needs Node.js. It was present when this app was created. See README.md.'
    Read-Host 'Press Enter to close'
}
