@echo off
echo ===================================================
echo   VoiceBridge AI - Building Production Bundle
echo ===================================================
call npm.cmd --prefix client run build
echo.
echo Production build finished! The frontend is compiled into client\dist.
echo To run the full-stack app in production mode, run: start.bat
pause
