$filePath = 'C:\Users\Denis\Downloads\ZipWebCLS\src\api\v1\auth.routes.js'
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
$oldLine = "    if (!process.env.SETUP_SECRET || !crypto.timingSafeEqual(Buffer.from(secret || ''), Buffer.from(process.env.SETUP_SECRET || ''))) {"
Write-Host "Searching for old line..."
if ($content.Contains($oldLine)) { Write-Host "FOUND" } else { Write-Host "NOT FOUND" }
