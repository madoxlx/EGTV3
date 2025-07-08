
#!/bin/bash

# Sahara Journeys - Ubuntu Production Startup Script
echo "🌍 Starting Sahara Journeys Travel Application on Ubuntu..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node --version)"
    echo "Installing latest Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "✅ Node.js $(node --version) detected"

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    sudo npm install -g pm2
fi

echo "✅ PM2 installed"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Check for cross-env specifically (common missing dependency)
if ! npm list cross-env > /dev/null 2>&1; then
    echo "📦 Installing missing cross-env package..."
    npm install cross-env
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating sample .env file..."
    cat > .env << EOL
NODE_ENV=production
DATABASE_URL=postgresql://postgres:password@localhost:5432/sahara_journeys
PORT=3000
SESSION_SECRET=your-secret-key-change-this-in-production
# GOOGLE_AI_API_KEY=your-google-ai-key-for-ai-features
EOL
    echo "📝 Sample .env file created. Please update DATABASE_URL and other settings as needed."
fi

echo "🔍 Checking environment setup..."

# Create uploads directory if it doesn't exist
mkdir -p public/uploads

# Set proper permissions
chmod +x start-ubuntu.sh
chmod 755 public/uploads

# Build the application
echo "🔨 Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Setup database schema
echo "🗄️  Setting up database..."
npm run db:push
if [ $? -ne 0 ]; then
    echo "⚠️  Database setup failed, but continuing..."
fi

# Stop any existing PM2 process
pm2 stop sahara-journeys 2>/dev/null || true
pm2 delete sahara-journeys 2>/dev/null || true

# Start the application with PM2
echo "🚀 Starting server with PM2..."
pm2 start npm --name "sahara-journeys" -- run start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
sudo pm2 startup systemd -u $USER --hp $HOME

echo ""
echo "===================================="
echo "🎉 Sahara Journeys is now running!"
echo "===================================="
echo ""
echo "📱 Access URLs:"
echo "   Local: http://localhost:3000"
echo "   Network: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "🔧 Management Commands:"
echo "   View status: pm2 status"
echo "   View logs: pm2 logs sahara-journeys"
echo "   Restart: pm2 restart sahara-journeys"
echo "   Stop: pm2 stop sahara-journeys"
echo "   Monitor: pm2 monit"
echo ""
echo "🛑 To stop completely: pm2 stop sahara-journeys && pm2 delete sahara-journeys"
echo ""
