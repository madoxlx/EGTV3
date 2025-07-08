@echo off
echo Stopping Sahara Journeys Production Server...

REM Stop the PM2 process
pm2 stop sahara-journeys

echo.
echo Server stopped successfully!
echo To restart: pm2 start sahara-journeys
echo To permanently delete: pm2 delete sahara-journeys
echo.
pause