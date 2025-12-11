@echo off
set "PATH=%~dp0MinGit\cmd;%PATH%"

echo Adding files...
git add .

echo Committing...
git commit -m "Feat: Add Google Authentication and Route Protection"

echo Pushing...
git push -u origin main

echo Done!
