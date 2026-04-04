$headers = @{ "User-Agent" = "Mozilla/5.0" }
$outDir = "C:\Users\wanme\WorkBuddy\Claw\火锅外卖H5\images"

# 尝试从可靠的公开CDN下载食材图片
$images = @{
    "guodi1.jpg" = "https://images.alphacoders.com/113/1134592.jpg"
    "guodi2.jpg" = "https://images.alphacoders.com/110/1104569.jpg"
    "meat1.jpg" = "https://images.alphacoders.com/107/1074685.jpg"
    "mushroom.jpg" = "https://images.alphacoders.com/45/45009.jpg"
    "vegetable.jpg" = "https://images.alphacoders.com/115/1154567.jpg"
    "tofu.jpg" = "https://images.alphacoders.com/55/552233.jpg"
    "noodle.jpg" = "https://images.alphacoders.com/101/1011234.jpg"
}

foreach($item in $images.GetEnumerator()) {
    try {
        $path = Join-Path $outDir $item.Key
        Invoke-WebRequest -Uri $item.Value -OutFile $path -Headers $headers -TimeoutSec 10 -UseBasicParsing
        if (Test-Path $path) {
            $size = (Get-Item $path).Length
            Write-Host "OK: $($item.Key) ($size bytes)"
        }
    } catch {
        Write-Host "Fail: $($item.Key) - $($_.Exception.Message)"
    }
}
Write-Host "Done"
