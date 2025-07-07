# Sahara Journeys - Linux Setup Guide

## Prerequisites

### 1. Install Node.js 20+
```bash
# Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or using snap
sudo snap install node --classic

# Verify installation
node --version
npm --version
```

### 2. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database user
sudo -u postgres createuser --interactive
sudo -u postgres createdb sahara_journeys
```

### 3. Install Git (if not already installed)
```bash
sudo apt install git
```

## Application Setup

### 1. Clone or Download the Project
```bash
# If cloning from repository
git clone <your-repository-url>
cd sahara-journeys

# Or if you have the files locally, navigate to the project directory
cd /path/to/sahara-journeys
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:
```bash
cp .env.example .env  # if example exists
# OR create new .env file
nano .env
```

Add the following environment variables:
```env
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/sahara_journeys
PORT=8080
SESSION_SECRET=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-if-needed
```

### 4. Database Setup
```bash
# Push database schema
npm run db:push

# Or if you have migration files
npx tsx migrate.ts
```

### 5. Seed Database (Optional)
```bash
# Run any seeding scripts if available
npx tsx seed-sample-data.ts
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Access the Application

Once running, the application will be available at:
- **Development**: http://localhost:8080
- **Production**: http://localhost:8080 (or your configured port)

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 8080
sudo lsof -i :8080

# Kill process if needed
sudo kill -9 <process-id>
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check database exists
sudo -u postgres psql -l
```

#### Permission Issues
```bash
# Make sure you have write permissions in project directory
chmod -R 755 /path/to/sahara-journeys

# Install dependencies with correct permissions
npm install --unsafe-perm
```

#### Missing Dependencies
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## System Service Setup (Optional)

To run as a system service:

### 1. Create Service File
```bash
sudo nano /etc/systemd/system/sahara-journeys.service
```

### 2. Service Configuration
```ini
[Unit]
Description=Sahara Journeys Travel Application
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/sahara-journeys
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=DATABASE_URL=postgresql://username:password@localhost:5432/sahara_journeys

[Install]
WantedBy=multi-user.target
```

### 3. Enable and Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable sahara-journeys
sudo systemctl start sahara-journeys
sudo systemctl status sahara-journeys
```

## Security Considerations

### 1. Firewall Configuration
```bash
# Allow HTTP traffic
sudo ufw allow 8080/tcp

# Enable firewall
sudo ufw enable
```

### 2. SSL/HTTPS Setup (Production)
Consider using nginx as a reverse proxy with SSL:
```bash
sudo apt install nginx certbot python3-certbot-nginx

# Configure nginx (create /etc/nginx/sites-available/sahara-journeys)
sudo nano /etc/nginx/sites-available/sahara-journeys
```

## Monitoring and Logs

### View Application Logs
```bash
# If running with npm
npm run dev

# If running as service
sudo journalctl -u sahara-journeys -f

# Or check log files if configured
tail -f /var/log/sahara-journeys.log
```

### Process Monitoring
```bash
# Check if application is running
ps aux | grep node

# Monitor system resources
htop
```

## Backup and Maintenance

### Database Backup
```bash
# Create backup
pg_dump -U username sahara_journeys > backup.sql

# Restore backup
psql -U username sahara_journeys < backup.sql
```

### Update Application
```bash
# Pull latest changes (if using git)
git pull origin main

# Reinstall dependencies
npm install

# Rebuild application
npm run build

# Restart service
sudo systemctl restart sahara-journeys
```

---

For additional support, refer to the project documentation in `replit.md` or contact the development team.