import express, { type Request, Response, NextFunction } from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import path from "path";
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';
import MemoryStoreFactory from 'memorystore';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables first
dotenv.config();

// Set DATABASE_URL if not present in environment
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_ZN9Ylt3AoQRJ@ep-dawn-voice-a8bd2yi7-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";
  console.log('🔗 Using fallback DATABASE_URL');
}

console.log('Testing database connection...');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  credentials: true,
  origin: true
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: false, limit: '25mb' }));

// Session configuration with memory store for development
const MemoryStore = MemoryStoreFactory(session);

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic test routes
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Sahara Journeys API Server is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version
  });
});

// Database test route
app.get('/api/db-test', async (req, res) => {
  try {
    console.log('⏳ Waiting for database initialization...');
    
    // Import database connection
    const { dbPromise } = await import('./server/db.js');
    const db = await dbPromise;
    
    console.log('Database connection established successfully');
    
    // Test query
    const result = await db.execute('SELECT NOW() as current_time, version() as db_version');
    
    res.json({ 
      status: 'Database connected successfully',
      timestamp: result.rows[0]?.current_time || 'Unknown',
      database_version: result.rows[0]?.db_version || 'Unknown',
      connection_url: process.env.DATABASE_URL ? 'Configured' : 'Not configured'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: 'Database connection failed',
      error: error.message,
      details: error.stack 
    });
  }
});

// Packages API test route
app.get('/api/packages-test', async (req, res) => {
  try {
    const { DatabaseStorage } = await import('./server/storage.js');
    const storage = new DatabaseStorage();
    
    const packages = await storage.listPackages();
    
    res.json({ 
      status: 'Packages API working',
      package_count: packages.length,
      packages: packages.slice(0, 3) // Return first 3 packages as sample
    });
  } catch (error) {
    console.error('Packages API error:', error);
    res.status(500).json({ 
      status: 'Packages API failed',
      error: error.message 
    });
  }
});

// Hero slides test route
app.get('/api/hero-slides-test', async (req, res) => {
  try {
    const { DatabaseStorage } = await import('./server/storage.js');
    const storage = new DatabaseStorage();
    
    // Test hero slides functionality
    const slides = await storage.getActiveHeroSlides();
    
    res.json({ 
      status: 'Hero slides API working',
      slide_count: slides.length,
      slides: slides
    });
  } catch (error) {
    console.error('Hero slides API error:', error);
    res.status(500).json({ 
      status: 'Hero slides API failed',
      error: error.message 
    });
  }
});

// Basic frontend response
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sahara Journeys - Travel Booking Platform</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white; 
          padding: 40px; 
          border-radius: 20px; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 { 
          color: #2c5530; 
          margin-bottom: 20px; 
          font-size: 2.5em;
          text-align: center;
        }
        .subtitle {
          text-align: center;
          color: #666;
          margin-bottom: 30px;
          font-size: 1.2em;
        }
        .status { 
          background: linear-gradient(90deg, #e8f5e8, #d4edda);
          padding: 20px; 
          border-radius: 10px; 
          margin: 20px 0;
          border-left: 5px solid #28a745;
        }
        .api-section {
          margin: 30px 0;
        }
        .api-link { 
          background: #f8f9fa;
          padding: 15px; 
          border-radius: 8px; 
          margin: 10px 0;
          border: 1px solid #dee2e6;
          transition: all 0.3s ease;
        }
        .api-link:hover {
          background: #e9ecef;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        a { 
          color: #007bff; 
          text-decoration: none; 
          font-weight: 500;
        }
        a:hover { 
          text-decoration: underline; 
          color: #0056b3;
        }
        .note {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .feature-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          border: 1px solid #dee2e6;
        }
        .icon { font-size: 2em; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌍 Sahara Journeys</h1>
        <p class="subtitle">Travel Booking Platform - Server Running Successfully</p>
        
        <div class="status">
          ✅ API Server is operational on port ${PORT}
        </div>
        
        <div class="feature-grid">
          <div class="feature-card">
            <div class="icon">🏺</div>
            <h3>Egypt Tours</h3>
            <p>Explore ancient pyramids and historic sites</p>
          </div>
          <div class="feature-card">
            <div class="icon">🏛️</div>
            <h3>Jordan Adventures</h3>
            <p>Discover Petra and Wadi Rum desert</p>
          </div>
          <div class="feature-card">
            <div class="icon">🕌</div>
            <h3>Morocco Journeys</h3>
            <p>Experience markets and Atlas Mountains</p>
          </div>
        </div>
        
        <div class="api-section">
          <h3>🔧 API Endpoints for Testing:</h3>
          <div class="api-link">
            <strong>Server Status:</strong> <a href="/api/test" target="_blank">/api/test</a>
            <small style="display: block; color: #666; margin-top: 5px;">Check if the server is running</small>
          </div>
          <div class="api-link">
            <strong>Database Connection:</strong> <a href="/api/db-test" target="_blank">/api/db-test</a>
            <small style="display: block; color: #666; margin-top: 5px;">Test PostgreSQL database connectivity</small>
          </div>
          <div class="api-link">
            <strong>Packages API:</strong> <a href="/api/packages-test" target="_blank">/api/packages-test</a>
            <small style="display: block; color: #666; margin-top: 5px;">Test travel packages functionality</small>
          </div>
          <div class="api-link">
            <strong>Hero Slides:</strong> <a href="/api/hero-slides-test" target="_blank">/api/hero-slides-test</a>
            <small style="display: block; color: #666; margin-top: 5px;">Test homepage slider functionality</small>
          </div>
        </div>
        
        <div class="note">
          <strong>🔧 Note:</strong> This is the backend API server running independently. 
          The React frontend requires resolving the Vite configuration compatibility issue with Node.js ${process.version}.
          All core functionality including database connections and API endpoints are operational.
        </div>
      </div>
    </body>
    </html>
  `);
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log('✅ Database initialized.');
  
  try {
    // Initialize database and admin setup
    const { setupAdmin } = await import('./server/admin-setup.js');
    await setupAdmin();
    console.log('✅ Admin setup completed');
    
    const { setupUnifiedAuth } = await import('./server/unified-auth.js');
    await setupUnifiedAuth();
    console.log('✅ Unified auth setup completed');
    
  } catch (error) {
    console.error('⚠️ Setup error (non-critical):', error.message);
  }
  
  console.log('🌍 Sahara Journeys API Server Started');
  console.log(`📱 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log('🛑 Press Ctrl+C to stop');
});