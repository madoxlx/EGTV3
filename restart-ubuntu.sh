
#!/bin/bash

# Egypt Express TVL - Ubuntu Restart Script
echo "🔄 Restarting Egypt Express TVL Travel Application..."

# Restart PM2 process
pm2 restart egypt-express-tvl

echo "✅ Egypt Express TVL has been restarted successfully!"
echo ""
echo "📱 Access at: http://localhost:3000"
echo "📊 Check status: pm2 status"
echo "📋 View logs: pm2 logs egypt-express-tvl"
