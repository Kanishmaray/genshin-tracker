@echo off
cd /d "E:\Desktop\genshin-tracker"
echo Adding files...
git add .
echo Committing...
git commit -m "Fix character card flip animation with proper CSS preserve-3d"
echo Pushing...
git push
echo.
echo === Done ===
pause
