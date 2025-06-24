import express, { type Request, Response, NextFunction } from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { dbPromise } from './db';
import session from 'express-session';
import passport from 'passport';
import { setupAdmin } from './admin-setup';
import { setupUnifiedAuth } from './unified-auth';
import { setupHeroSlidesRoutes } from './hero-slides-routes';
import { setupUploadRoutes } from './upload-routes';

// Load environment variables first
dotenv.config();

// Set DATABASE_URL if not present in environment
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_ZN9Ylt3AoQRJ@ep-dawn-voice-a8bd2yi7-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";
}

const app = express();

// Middleware
app.use(cors({
  credentials: true,
  origin: true
})); // استخدام cors with credentials
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: false, limit: '25mb' }));

// Session setup with proper configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'sahara-journeys-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Set to true in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // Protect against CSRF
  },
  name: 'sahara.sid', // Custom session name
  rolling: true, // Extend session on each request
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the public directory
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        // Limit the size of the logged JSON response
        const jsonString = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${jsonString.length > 200 ? jsonString.substring(0, 197) + '...' : jsonString}`;
      }

      if (logLine.length > 150) { // Increase limit to accommodate JSON
        logLine = logLine.slice(0, 147) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Try to initialize database, but continue with fallback if it fails
    console.log('⏳ Waiting for database initialization...');
    let dbInitialized = false;
    
    try {
      dbInitialized = await dbPromise;
    } catch (error: any) {
      console.warn('⚠️ Database connection failed, continuing with basic functionality:', error?.message || 'Unknown error');
      dbInitialized = false;
    }

    if (dbInitialized) {
      console.log('✅ Database initialized.');
    } else {
      console.log('📦 Using fallback storage due to database connection issues.');
    }

    // Setup admin users after database is initialized
    try {
      await setupAdmin();
      console.log('✅ Admin setup completed');
    } catch (error) {
      console.error('❌ Admin setup failed:', error);
    }

    // Setup authentication and hero slides routes
    try {
      setupUnifiedAuth(app);
      console.log('✅ Unified auth setup completed');
    } catch (error) {
      console.error('❌ Unified auth setup failed:', error);
    }

    try {
      setupHeroSlidesRoutes(app);
      console.log('✅ Hero slides routes setup completed');
    } catch (error) {
      console.error('❌ Hero slides routes setup failed:', error);
    }

    // Setup upload routes and static file serving first
    try {
      setupUploadRoutes(app);
      
      // Serve static files from public directory
      app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));
      
      console.log('✅ Upload routes and static serving setup completed');
    } catch (error) {
      console.error('❌ Upload routes setup failed:', error);
    }

    // Add missing API endpoints before route registration
    const { storage } = await import("./storage");

    // Translations API
    app.get('/api/translations', async (req, res) => {
      try {
        const language = req.query.language as string;
        const translations = await storage.listTranslations(language);
        res.json(translations);
      } catch (error) {
        console.error('Error fetching translations:', error);
        res.status(500).json({ message: 'Failed to fetch translations' });
      }
    });

    // Tour Categories API
    app.get('/api/tour-categories', async (req, res) => {
      try {
        const active = req.query.active === 'true' ? true : undefined;
        const categories = await storage.listTourCategories(active);
        res.json(categories);
      } catch (error) {
        console.error('Error fetching tour categories:', error);
        res.status(500).json({ message: 'Failed to fetch tour categories' });
      }
    });

    // Menu by location API
    app.get('/api/menus/location/:location', async (req, res) => {
      try {
        const location = req.params.location;
        if (!location) {
          return res.status(400).json({ message: 'Location parameter is required' });
        }
        const menu = await storage.getMenuByLocation(location);
        if (!menu) {
          return res.status(404).json({ message: 'Menu not found for location' });
        }
        res.json(menu);
      } catch (error) {
        console.error('Error fetching menu by location:', error);
        res.status(500).json({ message: 'Failed to fetch menu by location' });
      }
    });

    // Site language settings API  
    app.get('/api/translations/settings', async (req, res) => {
      try {
        const settings = await storage.getSiteLanguageSettings();
        if (!settings || settings.length === 0) {
          return res.json({
            defaultLanguage: 'en',
            availableLanguages: ['en', 'ar'],
            rtlLanguages: ['ar'],
          });
        }
        res.json(settings[0]);
      } catch (error) {
        console.error('Error fetching language settings:', error);
        res.status(500).json({ message: 'Failed to fetch language settings' });
      }
    });

    // Start the server and register other routes
    let server: any;
    try {
      server = await registerRoutes(app);
      console.log('✅ Routes registered successfully');
    } catch (error) {
      console.error('❌ Route registration failed:', error);
      throw error;
    }

    // Serve the admin test page
    app.get('/admin-test', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'client', 'public', 'admin-test.html'));
    });

    // Run first-time setup and seeding in background after server starts
    // Don't await this to prevent blocking server startup
    (async () => {
      try {
        const { initializeDatabase } = await import('./init-database');
        await initializeDatabase();
      } catch (error) {
        console.error('Failed to run initial database setup and seeding:', error);
      }
    })();

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      // Consider logging the error here instead of throwing to prevent crashing
      console.error('Error:', err);
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn\'t interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 8080
    // this serves both the API and the client.
    // Using port 8080 as discussed previously
    const port = parseInt(process.env.PORT || "8080"); // Use PORT environment variable, fallback to 8080
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
})();
