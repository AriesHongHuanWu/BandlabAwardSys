@echo off
set "PATH=%~dp0MinGit\cmd;%PATH%"

echo Configuring Git...
git config user.email "bot@bandlab-award-sys.com"
git config user.name "BandLab Bot"

echo Initializing Git...
git init

echo Adding files...
git add .

echo Committing...
git commit -m "Initial commit"

echo Setting up remote...
git remote remove origin 2>NUL
git remote add origin https://github.com/AriesHongHuanWu/BandlabAwardSys.git

echo Pushing to main...
git branch -M main
git push -u origin main

echo Done!
