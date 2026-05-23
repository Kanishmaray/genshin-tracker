@echo off
cd /d "E:\Desktop\genshin-tracker"
echo Adding files...
git add .
echo Committing...
git commit -m "Add visual enhancements: element particles, 3D card tilt, artifact breathing glow, constellation burst; fix Illuga element to Geo"
echo Pushing...
git push
echo.
echo === Done ===
pause