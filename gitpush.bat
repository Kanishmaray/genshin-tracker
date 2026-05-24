@echo off
cd /d "E:\Desktop\genshin-tracker"
echo Adding files...
git add .
echo Committing...
git commit -m "Fix CharacterCard crash: correct useGameData destructuring"
echo Pushing...
git push
echo.
echo === Done ===
pause
