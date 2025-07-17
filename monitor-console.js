#!/usr/bin/env node
/**
 * Console Flow Monitor for Travel Platform
 * Monitors server logs, database health, and system status in real-time
 */

import { spawn } from 'child_process';
import { Pool } from 'pg';
import { config } from 'dotenv';
import fs from 'fs';

config();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class ConsoleFlowMonitor {
  constructor() {
    this.db = new Pool({ connectionString: process.env.DATABASE_URL });
    this.lastLogPosition = 0;
    this.serverPid = null;
    this.alertCount = 0;
    this.statusChecks = {
      server: { status: 'unknown', lastCheck: null },
      database: { status: 'unknown', lastCheck: null },
      memory: { status: 'unknown', lastCheck: null }
    };
  }

  log(level, message, data = '') {
    const timestamp = new Date().toLocaleTimeString();
    const levelColors = {
      INFO: colors.blue,
      WARN: colors.yellow,
      ERROR: colors.red,
      SUCCESS: colors.green,
      ALERT: colors.magenta
    };
    
    console.log(`${levelColors[level]}[${timestamp}] ${level}:${colors.reset} ${message} ${data}`);
  }

  async checkDatabaseHealth() {
    try {
      const result = await this.db.query(`
        SELECT 
          'active_connections' as metric,
          COUNT(*) as value
        FROM pg_stat_activity 
        WHERE state = 'active'
        UNION ALL
        SELECT 
          'total_connections' as metric,
          COUNT(*) as value
        FROM pg_stat_activity
        UNION ALL
        SELECT 
          'users_count' as metric,
          COUNT(*) as value
        FROM users
        UNION ALL
        SELECT 
          'packages_count' as metric,
          COUNT(*) as value
        FROM packages
      `);

      const metrics = {};
      result.rows.forEach(row => {
        metrics[row.metric] = parseInt(row.value);
      });

      this.statusChecks.database = { 
        status: 'healthy', 
        lastCheck: new Date(),
        metrics
      };

      // Alert on high connection count
      if (metrics.active_connections > 10) {
        this.log('WARN', 'High database connection count:', metrics.active_connections);
      }

      return metrics;
    } catch (error) {
      this.statusChecks.database = { 
        status: 'error', 
        lastCheck: new Date(),
        error: error.message
      };
      this.log('ERROR', 'Database health check failed:', error.message);
      return null;
    }
  }

  async checkServerStatus() {
    try {
      // Check if server process is running
      const { exec } = await import('child_process');
      exec('ps aux | grep "server/index.ts" | grep -v grep', (error, stdout) => {
        if (stdout.trim()) {
          const lines = stdout.trim().split('\n');
          this.statusChecks.server = {
            status: 'running',
            lastCheck: new Date(),
            processCount: lines.length
          };
          
          if (lines.length > 3) {
            this.log('WARN', 'Multiple server processes detected:', lines.length);
          }
        } else {
          this.statusChecks.server = {
            status: 'stopped',
            lastCheck: new Date()
          };
          this.log('ERROR', 'Server process not found!');
        }
      });
    } catch (error) {
      this.log('ERROR', 'Server status check failed:', error.message);
    }
  }

  monitorServerLogs() {
    if (!fs.existsSync('server.log')) {
      this.log('WARN', 'Server log file not found');
      return;
    }

    const tail = spawn('tail', ['-f', 'server.log'], { stdio: ['ignore', 'pipe', 'pipe'] });
    
    tail.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        this.analyzeLogLine(line);
      });
    });

    tail.stderr.on('data', (data) => {
      this.log('ERROR', 'Server log error:', data.toString());
    });

    tail.on('close', (code) => {
      this.log('WARN', 'Log monitoring stopped with code:', code);
    });
  }

  analyzeLogLine(line) {
    const timestamp = new Date().toLocaleTimeString();
    
    // Detect different types of issues
    const patterns = {
      error: [/error/i, /failed/i, /exception/i, /stack trace/i],
      warning: [/warn/i, /deprecated/i, /timeout/i],
      success: [/✅/i, /success/i, /completed/i],
      database: [/database/i, /postgres/i, /sql/i],
      api: [/api/i, /route/i, /endpoint/i],
      auth: [/auth/i, /login/i, /password/i, /session/i]
    };

    // Check for errors
    if (patterns.error.some(regex => regex.test(line))) {
      this.alertCount++;
      this.log('ALERT', `🚨 Error detected #${this.alertCount}:`, line.trim());
      
      // Check for specific critical errors
      if (line.includes('EADDRINUSE')) {
        this.log('ERROR', 'Port already in use - possible duplicate server instance');
      } else if (line.includes('ECONNREFUSED')) {
        this.log('ERROR', 'Database connection refused - check database status');
      } else if (line.includes('column') && line.includes('does not exist')) {
        this.log('ERROR', 'Database schema mismatch detected');
      }
      return;
    }

    // Check for warnings
    if (patterns.warning.some(regex => regex.test(line))) {
      this.log('WARN', 'Warning detected:', line.trim());
      return;
    }

    // Log successful operations (filtered)
    if (patterns.success.some(regex => regex.test(line))) {
      if (line.includes('Database') || line.includes('Server')) {
        this.log('SUCCESS', line.trim());
      }
      return;
    }

    // Log important system events
    if (line.includes('listening') || line.includes('port') || line.includes('started')) {
      this.log('INFO', 'Server event:', line.trim());
    }
  }

  async monitorMemoryUsage() {
    const { exec } = await import('child_process');
    
    setInterval(() => {
      exec('ps aux | grep "server/index.ts" | grep -v grep', (error, stdout) => {
        if (stdout) {
          const lines = stdout.trim().split('\n');
          let totalMemory = 0;
          
          lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const memPercent = parseFloat(parts[3]);
            const memKB = parseInt(parts[5]);
            totalMemory += memKB;
          });

          const memoryMB = Math.round(totalMemory / 1024);
          
          this.statusChecks.memory = {
            status: memoryMB > 500 ? 'high' : 'normal',
            lastCheck: new Date(),
            usageMB: memoryMB
          };

          if (memoryMB > 1000) {
            this.log('WARN', `High memory usage: ${memoryMB}MB`);
          }
        }
      });
    }, 30000); // Check every 30 seconds
  }

  displayStatus() {
    console.clear();
    this.log('INFO', '🔍 Travel Platform Console Flow Monitor');
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    
    // Display current status
    Object.entries(this.statusChecks).forEach(([component, status]) => {
      const statusColor = status.status === 'healthy' || status.status === 'running' ? colors.green : 
                         status.status === 'error' || status.status === 'stopped' ? colors.red : colors.yellow;
      
      console.log(`${statusColor}${component.toUpperCase()}:${colors.reset} ${status.status} ${status.lastCheck ? `(${status.lastCheck.toLocaleTimeString()})` : ''}`);
      
      if (status.metrics) {
        Object.entries(status.metrics).forEach(([metric, value]) => {
          console.log(`  ${metric}: ${value}`);
        });
      }
      
      if (status.error) {
        console.log(`  ${colors.red}Error: ${status.error}${colors.reset}`);
      }
    });

    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.magenta}Alerts detected: ${this.alertCount}${colors.reset}`);
    console.log(`${colors.blue}Last update: ${new Date().toLocaleTimeString()}${colors.reset}`);
    console.log('\n🔄 Monitoring logs in real-time...\n');
  }

  async start() {
    this.log('INFO', '🚀 Starting Console Flow Monitor...');
    
    // Initial status display
    this.displayStatus();
    
    // Start monitoring
    this.monitorServerLogs();
    this.monitorMemoryUsage();
    
    // Periodic health checks
    setInterval(async () => {
      await this.checkDatabaseHealth();
      await this.checkServerStatus();
      this.displayStatus();
    }, 10000); // Update every 10 seconds

    // Initial health check
    await this.checkDatabaseHealth();
    await this.checkServerStatus();
    
    this.log('SUCCESS', 'Monitor started successfully');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.log('INFO', 'Shutting down monitor...');
      this.db.end();
      process.exit(0);
    });
  }
}

// Start monitoring
const monitor = new ConsoleFlowMonitor();
monitor.start().catch(error => {
  console.error('Monitor failed to start:', error);
  process.exit(1);
});