@echo off
cd /d "E:\Desktop\genshin-tracker"
echo Adding files...
git add .
echo Committing...
git commit -m "Flip card first, then tilt + holographic on back face"
echo Pushing...
git push
echo.
echo === Done ===
pause