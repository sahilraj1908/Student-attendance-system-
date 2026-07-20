@echo off
cd /d "%~dp0"
REM Uses npm.cmd so this works even when PowerShell blocks npm.ps1 (execution policy).
npm.cmd run dev
