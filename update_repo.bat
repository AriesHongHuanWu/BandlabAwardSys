@echo off
set "GIT_CMD=%~dp0MinGit\cmd\git.exe"
"%GIT_CMD%" add .
"%GIT_CMD%" commit -m "Auto update: %date% %time%"
"%GIT_CMD%" push origin main
