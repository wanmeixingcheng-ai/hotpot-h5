$ErrorActionPreference = 'Continue'
cd "C:\Users\wanme\WorkBuddy\Claw\火锅外卖H5"
Write-Host "Current directory: $(Get-Location)"
Write-Host "Files:"
Get-ChildItem | Select-Object Name

Write-Host "`nStarting server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\wanme\WorkBuddy\Claw\火锅外卖H5'; python -m http.server 8080" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host "`nTest accessing index.html:"
try {
    $r = Invoke-WebRequest "http://localhost:8080/index.html" -TimeoutSec 5 -UseBasicParsing
    Write-Host "OK! Size: $($r.Content.Length) bytes"
} catch {
    Write-Host "Failed: $($_.Exception.Message)"
}
