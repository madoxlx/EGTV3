
#!/bin/bash

# Sahara Journeys - Ubuntu Stop Script
echo "🛑 Stopping Sahara Journeys Travel Application..."

# Stop PM2 process
pm2 stop sahara-journeys

# Delete PM2 process
pm2 delete sahara-journeys

# Save PM2 configuration
pm2 save

echo "✅ Sahara Journeys has been stopped successfully!"
echo ""
echo "To start again, run: ./start-ubuntu.sh"
