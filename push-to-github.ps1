# Genshin Build Tracker - Push to GitHub
# Run with: powershell -ExecutionPolicy Bypass -File ".\push-to-github.ps1"

$ErrorActionPreference = "Stop"
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectDir

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Genshin Build Tracker - GitHub Push" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Directory: $projectDir" -ForegroundColor Gray
Write-Host ""

# Step 1: Clean up any broken .git folder
if (Test-Path ".git") {
    Write-Host "[1/6] Removing existing .git folder..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".git"
    Write-Host "      Done." -ForegroundColor Green
} else {
    Write-Host "[1/6] No existing .git folder, skipping cleanup." -ForegroundColor Gray
}

# Step 2: Check git
Write-Host ""
Write-Host "[2/6] Checking git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "      $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: git not found. Please install Git from https://git-scm.com" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 3: Check gh CLI
Write-Host ""
Write-Host "[3/6] Checking GitHub CLI..." -ForegroundColor Yellow
try {
    $ghVersion = gh --version 2>&1 | Select-Object -First 1
    Write-Host "      $ghVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: GitHub CLI (gh) not found." -ForegroundColor Red
    Write-Host "Install from https://cli.github.com then run: gh auth login" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 4: Init git
Write-Host ""
Write-Host "[4/6] Initializing git repository..." -ForegroundColor Yellow
git init -b main
git config user.email "kanishmaray@gmail.com"
git config user.name "Kanishma"
git add .
git commit -m "Initial commit: Genshin Build Tracker

- Full React + Vite + Tailwind app
- Dark fantasy immersive UI with element-themed character pages
- Dashboard: build progress chart, team readiness, talent calendar, artifact health
- Character pages: build checklists, notes, todo lists with scheduling
- localStorage persistence + Supabase-ready schema
- GitHub Actions deploy workflow for GitHub Pages"
Write-Host "      Committed!" -ForegroundColor Green

# Step 5: Create repo and push
Write-Host ""
Write-Host "[5/6] Creating GitHub repo and pushing..." -ForegroundColor Yellow
try {
    gh repo create kanishmaray/genshin-tracker --public --source=. --remote=origin --push
    Write-Host "      Pushed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Repo may already exist, trying direct push..." -ForegroundColor Yellow
    git remote remove origin 2>$null
    git remote add origin https://github.com/kanishmaray/genshin-tracker.git
    git push -u origin main
}

# Step 6: Enable GitHub Pages via gh
Write-Host ""
Write-Host "[6/6] Setting up GitHub Pages..." -ForegroundColor Yellow
try {
    gh api repos/kanishmaray/genshin-tracker/pages --method POST --field source='{"branch":"gh-pages","path":"/"}' 2>$null
    Write-Host "      Pages enabled (may take a minute to activate)." -ForegroundColor Green
} catch {
    Write-Host "      Pages setup skipped - enable manually: Settings > Pages > Source: GitHub Actions" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SUCCESS!" -ForegroundColor Green
Write-Host ""
Write-Host "  Repo:   https://github.com/kanishmaray/genshin-tracker" -ForegroundColor White
Write-Host "  Pages:  https://kanishmaray.github.io/genshin-tracker" -ForegroundColor White
Write-Host ""
Write-Host "  Next step: Go to repo Settings > Pages > Source: GitHub Actions" -ForegroundColor Yellow
Write-Host "  It will auto-deploy on every push to main!" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to close"
