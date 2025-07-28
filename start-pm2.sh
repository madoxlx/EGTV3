#!/bin/bash
# PM2 startup script for Sahara Journeys on port 8080

echo "🚀 Starting Sahara Journeys with PM2 on port 8080..."

# Stop any existing PM2 processes
pm2 delete sahara-journeys 2>/dev/null || true

# Start the application with PM2
pm2 start ecosystem.config.cjs

# Show status
pm2 status

echo "✅ Application started with PM2"
echo "📊 View logs: pm2 logs sahara-journeys"
echo "🔄 Restart: pm2 restart sahara-journeys"
echo "⛔ Stop: pm2 stop sahara-journeys"
echo "🌍 Application available at http://localhost:8080"