#!/bin/bash

# Sahara Journeys - Linux Startup Script
echo "🌍 Starting Sahara Journeys Travel Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    echo "Run: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if npm modules are installed
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
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/sahara_journeys
PORT=8080
SESSION_SECRET=your-secret-key-change-this-in-production
# GEMINI_API_KEY=your-gemini-api-key-for-ai-features
EOL
    echo "📝 Sample .env file created. Please update DATABASE_URL and other settings as needed."
fi

# Check database connection (optional)
echo "🔍 Checking environment setup..."

# Create uploads directory if it doesn't exist
mkdir -p public/uploads

# Set permissions
chmod +x start-linux.sh

echo "🚀 Starting development server..."
echo "📱 Access the application at: http://localhost:8080"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the application
npm run dev