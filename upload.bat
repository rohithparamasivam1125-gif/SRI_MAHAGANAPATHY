@echo off
setlocal enabledelayedexpansion
title Git Upload - SRI_MAHAGANAPATHY
cd /d "%~dp0"

echo ===================================================
echo         SRI MAHAGANAPATHY - GITHUB UPLOADER
echo ===================================================
echo.

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in PATH!
    echo Please install Git from https://git-scm.com/
    goto finish
)

:: Check Git User Configuration
git config user.name >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Setting default Git username and email...
    git config user.name "rohithparamasivam1125-gif"
    git config user.email "rohithparamasivam1125@gmail.com"
)

:: Check if repository is initialized
if not exist ".git" (
    echo [INFO] Initializing Git repository...
    git init
    git branch -M main
    git remote add origin https://github.com/rohithparamasivam1125-gif/SRI_MAHAGANAPATHY.git
    echo [SUCCESS] Git initialized and remote added.
    echo.
) else (
    :: Verify remote origin
    git remote get-url origin >nul 2>nul
    if %errorlevel% neq 0 (
        git remote add origin https://github.com/rohithparamasivam1125-gif/SRI_MAHAGANAPATHY.git
    )
)

:: Prompt for commit message
echo.
set /p "commit_msg=Enter commit message (Press Enter for 'Auto Update - %DATE% %TIME%'): "
if "%commit_msg%"=="" (
    set "commit_msg=Auto Update - %DATE% %TIME%"
)

echo.
echo [1/3] Adding files to staging...
git add .

echo.
echo [2/3] Committing changes...
git commit -m "%commit_msg%"

:: Make sure branch is main
git branch -M main

echo.
echo [3/3] Uploading (Pushing) to GitHub (main branch)...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo      [SUCCESS] Uploaded successfully to GitHub!
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo      [ERROR] Push failed. 
    echo      If prompted for GitHub Login, please sign in.
    echo ===================================================
)

:finish
echo.
pause
