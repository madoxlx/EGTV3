import express, { type Request, Response, NextFunction } from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import path from "path";
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';
import MemoryStoreFactory from 'memorystore';

// Node.js 18 compatible __dirname
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

// Session configuration
const MemoryStore = MemoryStoreFactory(session);

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  store: new MemoryStore({
    checkPeriod: 86400000
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Import and setup all the original server functionality
async function setupServer() {
  try {
    console.log('⏳ Waiting for database initialization...');
    
    // Initialize database
    const { dbPromise } = await import('./server/db.js');
    await dbPromise;
    console.log('Database connection established successfully');
    console.log('✅ Database initialized.');

    // Setup admin users
    console.log('🔐 Setting up admin users...');
    const { setupAdmin } = await import('./server/admin-setup.js');
    await setupAdmin();
    console.log('✅ Admin setup completed');

    // Setup authentication
    const { setupUnifiedAuth } = await import('./server/unified-auth.js');
    await setupUnifiedAuth();
    console.log('✅ Unified auth setup completed');

    // Setup hero slides routes
    const { setupHeroSlidesRoutes } = await import('./server/hero-slides-routes.js');
    setupHeroSlidesRoutes(app);
    console.log('✅ Hero slides routes setup completed');

    // Setup upload routes
    console.log('🔧 Setting up upload routes...');
    const { setupUploadRoutes } = await import('./server/upload-routes.js');
    setupUploadRoutes(app);
    console.log('✅ Upload routes and static serving setup completed');

    // Register all API routes
    console.log('🔧 Setting up API routes...');
    const { registerRoutes } = await import('./server/routes.js');
    registerRoutes(app);
    console.log('✅ API routes registered successfully');

    // Setup a simple static file server for the React app
    console.log('🔧 Setting up client serving...');
    
    // Serve the React app's index.html for all non-API routes
    app.get('*', (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
        return next();
      }
      
      // Try to serve the built React app
      const clientIndexPath = path.join(__dirname, 'dist/public/index.html');
      
      // Check if built app exists
      import('fs').then(fs => {
        if (fs.existsSync(clientIndexPath)) {
          res.sendFile(clientIndexPath);
        } else {
          // Serve a development placeholder that loads the React app via Vite dev server
          res.send(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Sahara Journeys</title>
                <style>
                  body { 
                    font-family: system-ui, -apple-system, sans-serif; 
                    margin: 0; 
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                  .container {
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    text-align: center;
                    max-width: 600px;
                  }
                  h1 { color: #2c5530; margin-bottom: 20px; }
                  .status { background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 20px 0; }
                  .note { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; }
                  .button {
                    display: inline-block;
                    background: #007bff;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    margin: 10px;
                    transition: background 0.3s;
                  }
                  .button:hover { background: #0056b3; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>🌍 Sahara Journeys</h1>
                  <div class="status">
                    ✅ Backend API Server Running Successfully
                  </div>
                  <p>The server is operational with all APIs working. To access the full React frontend:</p>
                  
                  <div class="note">
                    <strong>For Development:</strong><br>
                    Run <code>npm run build</code> to build the React app, then restart this server.
                  </div>
                  
                  <div>
                    <a href="/api/test" class="button">Test API</a>
                    <a href="/api/packages" class="button">View Packages</a>
                    <a href="/api/hero-slides/active" class="button">Hero Slides</a>
                  </div>
                  
                  <p><small>Server running on Node.js ${process.version}</small></p>
                </div>
              </body>
            </html>
          `);
        }
      }).catch(() => {
        res.status(500).send('Error loading application');
      });
    });

    console.log('✅ Client serving setup completed');

  } catch (error) {
    console.error('❌ Server setup error:', error);
    throw error;
  }
}

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
  try {
    await setupServer();
    console.log('🌍 Application available at http://localhost:' + PORT);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
});