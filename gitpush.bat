@echo off
cd /d "E:\Desktop\genshin-tracker"
echo Adding files...
git add .
echo Committing...
git commit -m "Restore tilt + holographic sheen, fix back panel covering image"
echo Pushing...
git push
echo.
echo === Done ===
pause