@echo off
setlocal enabledelayedexpansion
title Git Download - SRI_MAHAGANAPATHY
cd /d "%~dp0"

echo ===================================================
echo        SRI MAHAGANAPATHY - GITHUB DOWNLOADER
echo ===================================================
echo.

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in PATH!
    echo Please install Git from https://git-scm.com/
    goto finish
)

:: Check if repository is initialized
if not exist ".git" (
    echo [INFO] Initializing Git repository...
    git init
    git branch -M main
    git remote add origin https://github.com/rohithparamasivam1125-gif/SRI_MAHAGANAPATHY.git
)

echo [INFO] Fetching and pulling latest changes from GitHub...
echo.

git pull origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo     [SUCCESS] Downloaded / Updated successfully!
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo     [ERROR] Failed to pull changes from GitHub.
    echo     Make sure remote exists and there are no conflicts.
    echo ===================================================
)

:finish
echo.
pause
