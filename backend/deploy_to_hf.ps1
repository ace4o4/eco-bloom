# Deploy to Hugging Face Spaces Script
# Fix: Ensure we are in the script's directory so relative paths work
if ($PSScriptRoot) { Set-Location $PSScriptRoot }

$SPACE_URL = "https://huggingface.co/spaces/ace4o4/eco-bloom"
$TEMP_DIR = "hf_deploy_temp"

Write-Host "Starting Deployment to $SPACE_URL..." -ForegroundColor Cyan

# 1. Check Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed or not in PATH."
    exit 1
}

# 2. Clone the Space
if (Test-Path $TEMP_DIR) {
    Remove-Item -Recurse -Force $TEMP_DIR
}
Write-Host "Cloning Space..."
git clone $SPACE_URL $TEMP_DIR

if (-not (Test-Path $TEMP_DIR)) {
    Write-Error "Failed to clone repository. Check your internet or permissions."
    exit 1
}

# 3. Copy Files
Write-Host "COPYING files to deployment folder..."
Copy-Item "Dockerfile" -Destination $TEMP_DIR
Copy-Item "app.py" -Destination $TEMP_DIR
Copy-Item "requirements.txt" -Destination $TEMP_DIR
Copy-Item ".dockerignore" -Destination $TEMP_DIR
Copy-Item "README.md" -Destination $TEMP_DIR
if (Test-Path "utils") {
    Copy-Item -Recurse "utils" -Destination $TEMP_DIR
}

# 4. Push to Hugging Face
Set-Location $TEMP_DIR
Write-Host "GIT: Adding and Committing..."
git config user.name "Deployment Bot"
git config user.email "deploy@eco-bloom.ai"
git add .
git commit -m "Deploying latest backend version"

Write-Host "PUSHING to Hugging Face... (You may be prompted for password/token)" -ForegroundColor Yellow
git push

if ($?) {
    Write-Host "DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "Visit your Space here: $SPACE_URL"
}
else {
    Write-Error "Failed to push to Hugging Face."
}

# 5. Cleanup
Set-Location ..
Remove-Item -Recurse -Force $TEMP_DIR
Write-Host "Cleanup done."
