#!/bin/bash

echo "🔄 Upgrading Node.js to version 20..."

# Remove old Node.js
echo "Removing old Node.js version..."
sudo apt-get remove -y nodejs npm

# Add NodeSource repository for Node.js 20
echo "Adding NodeSource repository for Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js 20
echo "Installing Node.js 20..."
sudo apt-get install -y nodejs

# Verify installation
echo "Verifying installation..."
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Check if versions are correct
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
    echo "✅ Node.js 20+ installed successfully!"
    echo "🔧 You can now run: npm install && npm run dev"
else
    echo "❌ Node.js upgrade failed. Current version: $(node --version)"
    echo "Please try manual installation or contact your system administrator."
fi