#!/usr/bin/env node

// Direct server starter - bypasses Vite entirely for testing
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Set DATABASE_URL if not present
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_ZN9Ylt3AoQRJ@ep-dawn-voice-a8bd2yi7-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";
  console.log('🔗 Using fallback DATABASE_URL');
}

const app = express();
const PORT = process.env.PORT || 8080;

// Basic middleware
app.use(cors({
  credentials: true,
  origin: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic API route for testing
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Test database connection route
app.get('/api/db-test', async (req, res) => {
  try {
    // Import database connection
    const { dbPromise } = await import('./server/db.js');
    const db = await dbPromise;
    
    // Simple query to test connection
    const result = await db.execute('SELECT NOW() as current_time');
    res.json({ 
      status: 'Database connected successfully',
      timestamp: result.rows[0]?.current_time || 'Unknown'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: 'Database connection failed',
      error: error.message 
    });
  }
});

// Catch-all route for frontend
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sahara Journeys - Server Running</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c5530; margin-bottom: 20px; }
        .status { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .api-link { background: #f0f8ff; padding: 10px; border-radius: 5px; margin: 10px 0; }
        a { color: #1e40af; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌍 Sahara Journeys</h1>
        <div class="status">
          ✅ Server is running successfully on port ${PORT}
        </div>
        <p>The backend server is operational. This is a simplified version running without the full Vite development environment.</p>
        
        <h3>API Endpoints:</h3>
        <div class="api-link">
          <strong>Test API:</strong> <a href="/api/test" target="_blank">/api/test</a>
        </div>
        <div class="api-link">
          <strong>Database Test:</strong> <a href="/api/db-test" target="_blank">/api/db-test</a>
        </div>
        
        <p><strong>Note:</strong> To run the full application with React frontend, you'll need to resolve the Vite configuration issue related to Node.js compatibility.</p>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('🌍 Sahara Journeys Server Started');
  console.log(`📱 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
  console.log('🛑 Press Ctrl+C to stop');
});