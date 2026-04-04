$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    "Referer" = "https://image.baidu.com/"
}
$outDir = "C:\Users\wanme\WorkBuddy\Claw\火锅外卖H5\images"

# 确保目录存在
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force }

# 图片URL列表
$images = @{
    "guodi.jpg" = "https://qcloud.dpfile.com/pc/wvcc3LIaP8mNZtvTjxCGQ1XodBl6M-n7VaQRjbYzEb5tf5OGAsnbF-AFIAJjozRl.jpg"
    "meat.jpg" = "https://qcloud.dpfile.com/pc/9LQLXAsYRUBKEbmuqOMhaAIFljuWdR18nAgM-xIZ9F0SOKdENvCT5IYH0G2v-PZo.jpg"
    "tofu.jpg" = "https://qcloud.dpfile.com/pc/9H1068phG5hQO8yddUJQ9f7L97VgHPgFo0SFPNlNSgRpZx3r7oUAILhtTEl9N8t1.jpg"
    "veggie.jpg" = "https://qcloud.dpfile.com/pc/HjbJFstCliWgyebq6clRWhsHsQrOAwMAAGLb4_V5zSakrh6wEqHMs-S-jZtB4tIrY0q73sB2DyQcgmKUxZFQtw.jpg"
    "sauce.jpg" = "https://qcloud.dpfile.com/pc/TMUkox2GVTpcTutZ00L7tvInFhNAs75pFNDUrgm65MEQm2AFI5GVZbGpXdLByIYv.jpg"
    "noodle.jpg" = "https://qcloud.dpfile.com/pc/-qCpuzR-N6T7DNFYhBS9rpcdnDWGd6DNjO-cuaAIhiIfc-dMJkD_5syX1fNWrwV8.jpg"
}

Write-Host "Downloading images to: $outDir"
Write-Host "-----------------------------------"

foreach($item in $images.GetEnumerator()) {
    $path = Join-Path $outDir $item.Key
    try {
        $resp = Invoke-WebRequest -Uri $item.Value -Headers $headers -TimeoutSec 15 -UseBasicParsing
        if ($resp.StatusCode -eq 200 -and $resp.Content.Length -gt 10000) {
            [System.IO.File]::WriteAllBytes($path, $resp.Content)
            $sizeKB = [math]::Round($resp.Content.Length / 1KB)
            Write-Host "[OK] $($item.Key) - $sizeKB KB"
        } else {
            Write-Host "[SMALL] $($item.Key) - $($resp.Content.Length) bytes"
        }
    } catch {
        Write-Host "[FAIL] $($item.Key) - $($_.Exception.Message.Substring(0, 60))"
    }
}

Write-Host "-----------------------------------"
Write-Host "Files in directory:"
Get-ChildItem $outDir | ForEach-Object { Write-Host "  $($_.Name) - $([math]::Round($_.Length/1KB)) KB" }
