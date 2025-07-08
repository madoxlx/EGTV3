# PM2 Commands for Sahara Journeys

## Quick Start
```bash
# Start the application with PM2 on port 8080
./start-pm2.sh
```

## Manual PM2 Commands

### Start Application
```bash
pm2 start ecosystem.config.cjs
```

### Check Status
```bash
pm2 status
pm2 show sahara-journeys
```

### View Logs
```bash
pm2 logs sahara-journeys
pm2 logs sahara-journeys --lines 20
```

### Restart Application
```bash
pm2 restart sahara-journeys
```

### Stop Application
```bash
pm2 stop sahara-journeys
```

### Delete Application
```bash
pm2 delete sahara-journeys
```

### Monitor Performance
```bash
pm2 monit
```

## Configuration Details

- **Application Name**: sahara-journeys
- **Port**: 8080 (configured via PORT environment variable)
- **Interpreter**: tsx with ESM support
- **Environment**: Development/Production modes available
- **Logs**: Stored in `./logs/` directory

## Port Configuration

The application is configured to run on port 8080 through:
1. PM2 environment variable: `PORT: '8080'`
2. Server fallback: `process.env.PORT || "8080"`
3. Replit port mapping: `localPort: 8080 → externalPort: 8080`

## Access URLs

- **Local**: http://localhost:8080
- **External**: Available via Replit's external URL on port 8080