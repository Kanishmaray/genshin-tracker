@echo off
cd /d "E:\Desktop\genshin-tracker"
echo Adding files...
git add .
echo Committing...
git commit -m "Deploy ElementParticles, artifact breathing glow, constellation burst, storage mainstat fields"
echo Pushing...
git push
echo.
echo === Done ===
pause
