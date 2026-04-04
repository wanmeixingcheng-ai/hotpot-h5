$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    "Referer" = "https://image.baidu.com/"
}
$outDir = "C:\Users\wanme\WorkBuddy\Claw\火锅外卖H5\images"

$images = @{
    "guodi1.jpg" = "https://qcloud.dpfile.com/pc/wvcc3LIaP8mNZtvTjxCGQ1XodBl6M-n7VaQRjbYzEb5tf5OGAsnbF-AFIAJjozRl.jpg"
    "guodi2.jpg" = "https://qcloud.dpfile.com/pc/qVeVUbYZehMZMDCXcQVeMuVOY1zdow3YfnWftcbaCaapA0NbR3o9Zg6sbnk1iUqR.jpg"
    "guodi3.jpg" = "https://qcloud.dpfile.com/pc/WVaGWTe3J5fjBWvc0yWTlgkGZd14lUjztv0ZGE7gnXStwMej_kqvFXOgGTqlhws1Y0q73sB2DyQcgmKUxZFQtw.jpg"
    "meat1.jpg" = "https://qcloud.dpfile.com/pc/9LQLXAsYRUBKEbmuqOMhaAIFljuWdR18nAgM-xIZ9F0SOKdENvCT5IYH0G2v-PZo.jpg"
    "meat2.jpg" = "https://qcloud.dpfile.com/pc/GHZ38vNm_iSbQWEZLivmmNS2ouyjEGDaksQ4jLi8GokuclZKFe3DWF0_YvlhKe8mY0q73sB2DyQcgmKUxZFQtw.jpg"
    "tofu1.jpg" = "https://qcloud.dpfile.com/pc/9H1068phG5hQO8yddUJQ9f7L97VgHPgFo0SFPNlNSgRpZx3r7oUAILhtTEl9N8t1.jpg"
    "mushroom.jpg" = "https://qcloud.dpfile.com/pc/LKTCNIW7eesyVOdTZmHBPEA7qo0DVcap2TpTMojgkCJ4gxtGZg6XJdggxf0qvmtL.jpg"
    "vegetable.jpg" = "https://qcloud.dpfile.com/pc/HjbJFstCliWgyebq6clRWhsHsQrOAwMAAGLb4_V5zSakrh6wEqHMs-S-jZtB4tIrY0q73sB2DyQcgmKUxZFQtw.jpg"
    "noodle1.jpg" = "https://qcloud.dpfile.com/pc/-qCpuzR-N6T7DNFYhBS9rpcdnDWGd6DNjO-cuaAIhiIfc-dMJkD_5syX1fNWrwV8.jpg"
    "sauce1.jpg" = "https://qcloud.dpfile.com/pc/TMUkox2GVTpcTutZ00L7tvInFhNAs75pFNDUrgm65MEQm2AFI5GVZbGpXdLByIYv.jpg"
}

foreach($item in $images.GetEnumerator()) {
    try {
        $path = Join-Path $outDir $item.Key
        $resp = Invoke-WebRequest -Uri $item.Value -Headers $headers -TimeoutSec 15 -UseBasicParsing
        if ($resp.StatusCode -eq 200 -and $resp.Content.Length -gt 5000) {
            [System.IO.File]::WriteAllBytes($path, $resp.Content)
            $size = (Get-Item $path).Length / 1KB
            Write-Host "OK: $($item.Key) ($([math]::Round($size))KB)"
        } else {
            Write-Host "Small/Empty: $($item.Key) - $($resp.Content.Length) bytes"
        }
    } catch {
        Write-Host "Fail: $($item.Key) - $($_.Exception.Message.Substring(0, [math]::Min(50, $_.Exception.Message.Length)))"
    }
}
Write-Host "`nDownload complete!"
