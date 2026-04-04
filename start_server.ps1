# Kill old server
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Start new server
$ErrorActionPreference = 'Continue'
$h5Dir = "C:\Users\wanme\WorkBuddy\Claw\火锅外卖H5"
Set-Location $h5Dir
Write-Host "Starting server in: $h5Dir"
Write-Host "Current files:"
Get-ChildItem | Select-Object Name

# Start Python HTTP server
Start-Process python -ArgumentList "-m", "http.server", "8080" -WindowStyle Hidden
Start-Sleep -Seconds 3

# Test
try {
    $r = Invoke-WebRequest "http://localhost:8080/images/guodi.jpg" -TimeoutSec 5 -UseBasicParsing
    Write-Host "Server OK! guodi.jpg size: $($r.Content.Length) bytes"
} catch {
    Write-Host "Test failed: $($_.Exception.Message)"
}
