@echo off
chcp 65001 >nul
title Pavapetti 1-Click Deployment
cls
echo ========================================================
echo        PAVAPETTI - 1-CLICK DEPLOY TO CLOUDFLARE        
echo ========================================================
echo.
echo [1/4] Saving and pushing changes to GitHub...
git add .
git commit -m "Auto-deploy: %date% %time%"
git push
echo.
echo [2/4] Building production website...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed! Please check the errors above.
    pause
    exit /b %errorlevel%
)
echo.
echo [3/4] Deploying to Cloudflare (pavapetti.com)...
call npx wrangler deploy
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Cloudflare deployment failed!
    echo If prompted to log in, please complete the browser login and run again.
    pause
    exit /b %errorlevel%
)
echo.
echo ========================================================
echo       SUCCESS! WEBSITE IS LIVE ON PAVAPETTI.COM        
echo ========================================================
echo.
pause
