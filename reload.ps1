$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    "Referer" = "https://image.baidu.com/"
}

$baseDir = "C:\Users\wanme\WorkBuddy\Claw"
$h5Dir = $baseDir + "\火锅外卖H5"
$imgDir = $h5Dir + "\images"

Write-Host "Base: $baseDir"
Write-Host "H5: $h5Dir"
Write-Host "Images: $imgDir"

# 确保目录存在
if (!(Test-Path $imgDir)) {
    New-Item -ItemType Directory -Path $imgDir -Force
    Write-Host "Created images directory"
}

# 图片URL
$images = @{
    "guodi.jpg" = "https://qcloud.dpfile.com/pc/wvcc3LIaP8mNZtvTjxCGQ1XodBl6M-n7VaQRjbYzEb5tf5OGAsnbF-AFIAJjozRl.jpg"
    "meat.jpg" = "https://qcloud.dpfile.com/pc/9LQLXAsYRUBKEbmuqOMhaAIFljuWdR18nAgM-xIZ9F0SOKdENvCT5IYH0G2v-PZo.jpg"
    "tofu.jpg" = "https://qcloud.dpfile.com/pc/9H1068phG5hQO8yddUJQ9f7L97VgHPgFo0SFPNlNSgRpZx3r7oUAILhtTEl9N8t1.jpg"
    "veggie.jpg" = "https://qcloud.dpfile.com/pc/HjbJFstCliWgyebq6clRWhsHsQrOAwMAAGLb4_V5zSakrh6wEqHMs-S-jZtB4tIrY0q73sB2DyQcgmKUxZFQtw.jpg"
    "sauce.jpg" = "https://qcloud.dpfile.com/pc/TMUkox2GVTpcTutZ00L7tvInFhNAs75pFNDUrgm65MEQm2AFI5GVZbGpXdLByIYv.jpg"
    "noodle.jpg" = "https://qcloud.dpfile.com/pc/-qCpuzR-N6T7DNFYhBS9rpcdnDWGd6DNjO-cuaAIhiIfc-dMJkD_5syX1fNWrwV8.jpg"
}

foreach($item in $images.GetEnumerator()) {
    $path = Join-Path $imgDir $item.Key
    Write-Host "Downloading $($item.Key)..."
    try {
        $resp = Invoke-WebRequest -Uri $item.Value -Headers $headers -TimeoutSec 20 -UseBasicParsing
        [System.IO.File]::WriteAllBytes($path, $resp.Content)
        $kb = [math]::Round($resp.Content.Length / 1KB)
        Write-Host "  -> OK ($kb KB) -> $path"
    } catch {
        Write-Host "  -> FAILED: $($_.Exception.Message.Substring(0,80))"
    }
}

Write-Host "`nVerifying files:"
Get-ChildItem $imgDir | ForEach-Object { Write-Host "  $($_.Name) - $([math]::Round($_.Length/1KB)) KB" }
