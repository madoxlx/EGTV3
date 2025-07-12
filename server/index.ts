import express, { type Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { dbPromise } from "./db";
import session from "express-session";
import passport from "passport";
import { setupAdmin } from "./admin-setup";
import { setupUnifiedAuth } from "./unified-auth";
import { setupHeroSlidesRoutes } from "./hero-slides-routes";
import { setupUploadRoutes } from "./upload-routes";
import MemoryStoreFactory from "memorystore";

// Load environment variables first
dotenv.config();

// Set DATABASE_URL if not present in environment
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://egsite:Pass2020@74.179.85.9:5432/egsite_db?sslmode=disable";
  console.log("🔗 Using fallback DATABASE_URL");
}

const app = express();

// Middleware
app.use(
  cors({
    credentials: true,
    origin: true,
  }),
); // استخدام cors with credentials
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: false, limit: "25mb" }));

// Session configuration with memory store for development
const MemoryStore = MemoryStoreFactory(session);

app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the public directory
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

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
        logLine += ` :: ${jsonString.length > 200 ? jsonString.substring(0, 197) + "..." : jsonString}`;
      }

      if (logLine.length > 150) {
        // Increase limit to accommodate JSON
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
    console.log("⏳ Waiting for database initialization...");
    let dbInitialized = false;

    try {
      const dbResult = await Promise.race([
        dbPromise,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Database connection timeout")),
            10000,
          ),
        ),
      ]);
      dbInitialized = !!dbResult;
    } catch (error: any) {
      console.warn(
        "⚠️ Database connection failed, continuing with basic functionality:",
        error?.message || "Unknown error",
      );
      dbInitialized = false;
    }

    if (dbInitialized) {
      console.log("✅ Database initialized.");
    } else {
      console.log(
        "📦 Using fallback storage due to database connection issues.",
      );
    }

    // Setup admin users after database is initialized
    try {
      await setupAdmin();
      console.log("✅ Admin setup completed");
    } catch (error) {
      console.error("❌ Admin setup failed:", error);
    }

    // Setup authentication and hero slides routes
    try {
      setupUnifiedAuth(app);
      console.log("✅ Unified auth setup completed");
    } catch (error) {
      console.error("❌ Unified auth setup failed:", error);
    }

    try {
      setupHeroSlidesRoutes(app);
      console.log("✅ Hero slides routes setup completed");
    } catch (error) {
      console.error("❌ Hero slides routes setup failed:", error);
    }

    // Setup upload routes and static file serving first
    try {
      setupUploadRoutes(app);

      // Serve static files from public directory
      app.use(
        "/uploads",
        express.static(path.join(process.cwd(), "public/uploads")),
      );

      console.log("✅ Upload routes and static serving setup completed");
    } catch (error) {
      console.error("❌ Upload routes setup failed:", error);
    }

    // Add missing API endpoints before route registration
    const { storage } = await import("./storage");

    // Translations API
    app.get("/api/translations", async (req, res) => {
      try {
        const language = req.query.language as string;
        const translations = await storage.listTranslations(language);
        res.json(translations);
      } catch (error) {
        console.error("Error fetching translations:", error);
        res.status(500).json({ message: "Failed to fetch translations" });
      }
    });

    // Tour Categories API
    app.get("/api/tour-categories", async (req, res) => {
      try {
        const active = req.query.active === "true" ? true : undefined;
        const categories = await storage.listTourCategories(active);
        res.json(categories);
      } catch (error) {
        console.error("Error fetching tour categories:", error);
        res.status(500).json({ message: "Failed to fetch tour categories" });
      }
    });

    // Site language settings API
    app.get("/api/translations/settings", async (req, res) => {
      try {
        const settings = await storage.getSiteLanguageSettings();
        if (!settings || settings.length === 0) {
          return res.json({
            defaultLanguage: "en",
            availableLanguages: ["en", "ar"],
            rtlLanguages: ["ar"],
          });
        }
        res.json(settings[0]);
      } catch (error) {
        console.error("Error fetching language settings:", error);
        res.status(500).json({ message: "Failed to fetch language settings" });
      }
    });

    // Hotel Features API endpoints
    app.get("/api/admin/hotel-facilities", async (req, res) => {
      try {
        const facilities = await storage.listHotelFacilities();
        res.json(facilities);
      } catch (error) {
        console.error("Error fetching hotel facilities:", error);
        res.status(500).json({ message: "Failed to fetch hotel facilities" });
      }
    });

    app.get("/api/admin/hotel-highlights", async (req, res) => {
      try {
        const highlights = await storage.listHotelHighlights();
        res.json(highlights);
      } catch (error) {
        console.error("Error fetching hotel highlights:", error);
        res.status(500).json({ message: "Failed to fetch hotel highlights" });
      }
    });

    app.get("/api/admin/cleanliness-features", async (req, res) => {
      try {
        const features = await storage.listCleanlinessFeatures();
        res.json(features);
      } catch (error) {
        console.error("Error fetching cleanliness features:", error);
        res
          .status(500)
          .json({ message: "Failed to fetch cleanliness features" });
      }
    });

    // Register API routes BEFORE frontend setup
    let server: any;
    try {
      server = await registerRoutes(app);
      console.log("✅ API routes registered successfully");

      if (!server) {
        throw new Error(
          "Server creation failed - no server returned from registerRoutes",
        );
      }
    } catch (error) {
      console.error("❌ Route registration failed:", error);
      throw error;
    }

    // Serve the admin test page
    app.get("/admin-test", (req, res) => {
      res.sendFile(
        path.join(process.cwd(), "client", "public", "admin-test.html"),
      );
    });

    // Run first-time setup and seeding in background after server starts
    // Don't await this to prevent blocking server startup
    (async () => {
      try {
        const { initializeDatabase } = await import("./init-database");
        await initializeDatabase();
      } catch (error) {
        console.error(
          "Failed to run initial database setup and seeding:",
          error,
        );
      }
    })();

    // Add API route debugging middleware BEFORE error handler
    app.use("/api/*", (req, res, next) => {
      console.log(`📍 API Route Hit: ${req.method} ${req.path}`);
      next();
    });

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      // Consider logging the error here instead of throwing to prevent crashing
      console.error("Error:", err);
    });

    // Cart endpoints are handled in routes.ts - no duplicate needed here

    // Setup frontend serving AFTER all API routes are registered
    // This prevents Vite's catch-all from intercepting API requests
    if (app.get("env") === "development") {
      await setupVite(app, server);
      console.log("✅ Vite development setup completed");
    } else {
      serveStatic(app);
      console.log("✅ Static file serving setup completed");
    }

    // ALWAYS serve the app on port 8080
    // this serves both the API and the client.
    // Using port 8080 as discussed previously
    const port = parseInt(process.env.PORT || "8080"); // Use PORT environment variable, fallback to 8080

    await new Promise<void>((resolve, reject) => {
      server.listen(port, "0.0.0.0", (err?: Error) => {
        if (err) {
          console.error(`❌ Failed to start server on port ${port}:`, err);
          reject(err);
        } else {
          log(`✅ Server serving on port ${port}`);
          console.log(`🌍 Application available at http://localhost:${port}`);
          resolve();
        }
      });
    });
  } catch (error) {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  }
})();
