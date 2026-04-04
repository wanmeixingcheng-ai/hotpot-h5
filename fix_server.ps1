$ErrorActionPreference = 'Continue'

# Get the H5 directory path
$basePath = "C:\Users\wanme\WorkBuddy\Claw"
$h5Path = $null

# Find the directory with index.html
Get-ChildItem $basePath -Directory | ForEach-Object {
    $testPath = Join-Path $_.FullName "index.html"
    if (Test-Path $testPath) {
        $h5Path = $_.FullName
    }
}

if ($h5Path) {
    Write-Host "Found H5 directory: $h5Path"
    
    # Kill old servers
    Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    
    # Start new server from correct directory
    Set-Location $h5Path
    Write-Host "Changed to: $(Get-Location)"
    Write-Host "Files in directory:"
    Get-ChildItem | Select-Object Name, Length
    
    # Start server
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$h5Path'; python -m http.server 8080" -WindowStyle Normal
    Start-Sleep -Seconds 3
    
    # Test
    try {
        $r = Invoke-WebRequest "http://localhost:8080/index.html" -TimeoutSec 5 -UseBasicParsing
        Write-Host "SUCCESS! index.html size: $($r.Content.Length) bytes"
    } catch {
        Write-Host "Test failed: $($_.Exception.Message)"
    }
} else {
    Write-Host "ERROR: Could not find directory with index.html"
    Get-ChildItem $basePath -Directory | ForEach-Object {
        Write-Host "  $($_.Name)"
    }
}
