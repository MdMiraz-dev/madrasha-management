@echo off
title Madrasha Management System - Server Launcher
color 0A
chcp 65001 >nul
cls

echo ==========================================================
echo        মাদ্রাসা ম্যানেজমেন্ট সফটওয়্যার চালু হচ্ছে...
echo ==========================================================
echo.

cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [বিজ্ঞপ্তি] প্রয়োজনীয় প্যাকেজ ইনস্টল করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
    call npm install
    if %errorlevel% neq 0 (
        echo [ভুল] প্যাকেজ ইনস্টল করতে সমস্যা হয়েছে। ইন্টারনেট কানেকশন চেক করুন।
        pause
        exit /b
    )
)

:: Get Local IPv4 Address dynamically
set "LOCAL_IP=localhost"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address" /c:"IPv4 ঠিকানা"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        if not "%%b"=="" (
            echo %%b | findstr /r "^10\. ^192\.168\. ^172\." >nul
            if not errorlevel 1 (
                set "LOCAL_IP=%%b"
            )
        )
    )
)

:: Check if port 3000 is already active
netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [OK] সার্ভার ইতিমধ্যে ব্যাকগ্রাউন্ডে সচল আছে!
    goto show_urls
)

echo [1/2] কম্পিউটার ও মোবাইলের জন্য সার্ভার শুরু করা হচ্ছে...
start "Taleem ERP Dev Server" cmd /k npm run dev

echo [2/2] সার্ভার পুরোপুরি প্রস্তুত হতে কয়েক সেকেন্ড অপেক্ষা করুন...
timeout /t 5 /nobreak >nul

:show_urls
echo.
echo ==========================================================
echo   সফটওয়্যার সফলভাবে চালু হয়েছে!
echo.
echo   💻 কম্পিউটার থেকে চালাতে ওপেন করুন:
echo      http://localhost:3000
echo.
if not "%LOCAL_IP%"=="localhost" (
    echo   📱 মোবাইল ফোন থেকে চালাতে (একই ওয়াইফাই/হটস্পট):
    echo      http://%LOCAL_IP%:3000
) else (
    echo   📱 মোবাইল থেকে চালাতে একই ওয়াইফাইয়ে আপনার লোকাল আইপি ব্যবহার করুন:
    echo      http://10.13.108.14:3000
)
echo ==========================================================
echo.
start http://localhost:3000
echo [টিপস] সফটওয়্যারটি ব্যবহার করার সময় সার্ভার উইন্ডোটি মিনিমাইজ করে রাখুন।
pause
