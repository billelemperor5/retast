
$path = Join-Path $PSScriptRoot "style.css"
if (Test-Path $path) {
    Write-Host "Fixing CSS at $path..."
    $content = Get-Content $path -Raw
    $content = $content -replace 'input\[type=" text\\\]', 'input[type="text"]'
    $content = $content -replace 'input\[type=\\color\\\]', 'input[type="color"]'
    $content = $content -replace 'input\[type=\\\"text\\\"\]', 'input[type="text"]'
    Set-Content -Path $path -Value $content -Encoding UTF8
    Write-Host "CSS fix complete."
} else {
    Write-Host "style.css not found in the current directory."
}
