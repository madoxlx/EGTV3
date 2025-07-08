@echo off
echo Starting Sahara Journeys Production Server...

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Install PM2 globally if not installed
where pm2 >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing PM2...
    npm install -g pm2
)

REM Push database schema
echo Setting up database...
npm run db:push

REM Start the application with PM2
echo Starting server with PM2...
pm2 start npm --name "sahara-journeys" -- run start

REM Save PM2 configuration
pm2 save

echo.
echo ====================================
echo Sahara Journeys is now running!
echo Access at: http://localhost:3000
echo ====================================
echo.
echo Commands:
echo - View status: pm2 status
echo - View logs: pm2 logs sahara-journeys
echo - Restart: pm2 restart sahara-journeys
echo - Stop: pm2 stop sahara-journeys
echo.
pause