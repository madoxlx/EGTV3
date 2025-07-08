
#!/bin/bash

# Sahara Journeys - Ubuntu Restart Script
echo "🔄 Restarting Sahara Journeys Travel Application..."

# Restart PM2 process
pm2 restart sahara-journeys

echo "✅ Sahara Journeys has been restarted successfully!"
echo ""
echo "📱 Access at: http://localhost:3000"
echo "📊 Check status: pm2 status"
echo "📋 View logs: pm2 logs sahara-journeys"
