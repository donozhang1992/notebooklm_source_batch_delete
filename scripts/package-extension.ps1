param(
  [string]$Version = "0.1.0"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$releaseDir = Join-Path $root "release"
$packageDir = Join-Path $releaseDir "package"
$zipPath = Join-Path $releaseDir "notebooklm-source-bulk-delete-$Version.zip"

New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null
if (Test-Path $packageDir) {
  Remove-Item -LiteralPath $packageDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $packageDir | Out-Null

Copy-Item -LiteralPath (Join-Path $root "extension\manifest.json") -Destination $packageDir
Copy-Item -LiteralPath (Join-Path $root "extension\content.css") -Destination $packageDir
Copy-Item -LiteralPath (Join-Path $root "extension\dist") -Destination $packageDir -Recurse
Copy-Item -LiteralPath (Join-Path $root "extension\assets") -Destination $packageDir -Recurse

if (Test-Path $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -Path (Join-Path $packageDir "*") -DestinationPath $zipPath -Force
Write-Host "Created $zipPath"
