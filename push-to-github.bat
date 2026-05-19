@echo off
setlocal EnableDelayedExpansion
title Genshin Tracker - Push to GitHub

cd /d "%~dp0"
echo.
echo ============================================
echo   Genshin Build Tracker - GitHub Push
echo ============================================
echo.
echo Working directory: %CD%
echo.

:: Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: git is not installed or not in PATH.
    echo Please install Git from https://git-scm.com
    pause
    exit /b 1
)

:: Check if gh CLI is available
gh --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: GitHub CLI (gh) is not found.
    echo Please install it from https://cli.github.com
    echo Then run: gh auth login
    pause
    exit /b 1
)

echo [1/5] Initializing git repository...
git init -b main
if errorlevel 1 (
    echo Git init failed. Checking if already initialized...
    git status >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Could not initialize git repository.
        pause
        exit /b 1
    )
)

echo.
echo [2/5] Configuring git...
git config user.email "kanishmaray@gmail.com"
git config user.name "Kanishma"

echo.
echo [3/5] Staging all files...
git add .
echo Files staged successfully.

echo.
echo [4/5] Creating initial commit...
git commit -m "Initial commit: Genshin Build Tracker

- Full React + Vite + Tailwind app
- Dark fantasy immersive UI with element-themed character pages
- Dashboard: build progress chart, team readiness, talent calendar, artifact health
- Character pages: build checklists, notes, todo lists with scheduling
- localStorage persistence + Supabase-ready schema
- GitHub Actions deploy workflow for GitHub Pages"

if errorlevel 1 (
    echo Commit failed - possibly already committed. Continuing...
)

echo.
echo [5/5] Creating GitHub repo and pushing...
gh repo create kanishmaray/genshin-tracker --public --source=. --remote=origin --push
if errorlevel 1 (
    echo.
    echo Repo may already exist. Trying to push to existing repo...
    git remote remove origin 2>nul
    git remote add origin https://github.com/kanishmaray/genshin-tracker.git
    git push -u origin main
)

echo.
echo ============================================
if errorlevel 1 (
    echo   Something went wrong. Check output above.
) else (
    echo   SUCCESS! Your tracker is on GitHub.
    echo.
    echo   Repo: https://github.com/kanishmaray/genshin-tracker
    echo   Pages will be live at:
    echo   https://kanishmaray.github.io/genshin-tracker
    echo.
    echo   Next: Go to repo Settings -> Pages -> Source: GitHub Actions
    echo   It will auto-deploy on every push!
)
echo ============================================
echo.
pause
