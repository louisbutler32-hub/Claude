@echo off
title RICK
cd /d "%~dp0"
if not exist node_modules (
  echo Installing Rick's dependencies...
  call npm install
)
if not exist .env (
  copy .env.example .env >nul
  echo Created .env - add your ANTHROPIC_API_KEY to it, then run start.bat again.
  notepad .env
  exit /b
)
node server\index.js
pause
