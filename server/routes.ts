import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db, pool, dbPromise } from "./db";
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { setupImageUploadRoutes } from './upload-handler';
import { 
  insertUserSchema, 
  insertBookingSchema, 
  insertFavoriteSchema, 
  insertDestinationSchema, 
  insertPackageSchema,
  insertTourSchema,
  insertHotelSchema,
  insertRoomSchema,
  insertRoomCombinationSchema,
  insertCountrySchema,
  insertCitySchema,
  insertAirportSchema,
  insertMenuSchema,
  insertMenuItemSchema,
  insertTranslationSchema,
  insertSiteLanguageSettingsSchema,
  insertDictionaryEntrySchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertHomepageSectionSchema,
  insertWhyChooseUsSectionSchema,
  translations,
  cartItems,
  orders,
  orderItems,
  packages,
  tours,
  hotels,
  rooms,
  visas,
} from "@shared/schema";
import { setupAuth } from "./auth";
import { setupUnifiedAuth } from "./unified-auth";
import { z } from "zod";
import geminiService from "./services/gemini";
import { setupExportImportRoutes } from "./export-import-routes";
import { setupVisaRoutes } from "./visa-routes";
import { setupHeroSlidesRoutes } from "./hero-slides-routes";
import { setupUploadRoutes } from "./upload-routes";
import { setupAdvancedAdminRoutes } from "./admin-api-routes";
import Stripe from "stripe";
import { eq, and, sql } from "drizzle-orm";
import * as schema from "@shared/schema";

// Middleware to check if user is admin
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated (session-based)
  const sessionUser = (req as any).session?.user;
  const sessionId = (req as any).sessionID;
  
  console.log('🔍 Admin check - Session ID:', sessionId);
  console.log('🔍 Admin check - Session user:', sessionUser);
  console.log('🔍 Admin check - Request path:', req.path);
  
  // If we have a session user, check their role
  if (sessionUser && sessionUser.id) {
    if (sessionUser.role === 'admin') {
      console.log(`✅ Admin check passed for user: ${sessionUser.username} (ID: ${sessionUser.id})`);
      
      // Ensure session is properly saved and user is set
      (req as any).user = sessionUser;
      
      // Touch the session to ensure it stays active
      (req as any).session.touch();
      
      return next();
    } else {
      console.log(`❌ Admin check failed: User role is '${sessionUser.role}', not 'admin'`);
      return res.status(403).json({ 
        message: 'You do not have permission to access this resource',
        debug: {
          userRole: sessionUser.role,
          userId: sessionUser.id,
          username: sessionUser.username
        }
      });
    }
  }
  
  // No session user found - only for development/testing purposes
  if (!sessionUser && (req.path.startsWith('/api/admin/') || req.path.startsWith('/api-admin/'))) {
    console.log('⚠️ No session user found, creating temp admin and saving to session');
    const tempAdmin = {
      id: 1,
      username: 'admin',
      role: 'admin',
      email: 'admin@example.com',
      displayName: 'Admin User'
    };
    
    // Save temp admin to session for consistency
    (req as any).session.user = tempAdmin;
    (req as any).user = tempAdmin;
    
    // Force session save
    (req as any).session.save((err: any) => {
      if (err) {
        console.error('Session save error:', err);
      } else {
        console.log('🔑 Temporary admin session created and saved');
      }
    });
    
    return next();
  }
  
  // No session and not admin endpoint - deny access
  return res.status(401).json({ 
    message: 'Authentication required',
    redirectTo: '/admin/login'
  });
};

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
}) : null;

const geminiApiKey = process.env.GEMINI_API_KEY;
// ... use geminiApiKey when initializing the Gemini client

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up unified authentication system
  setupUnifiedAuth(app);
  
  // Setup export/import routes
  setupExportImportRoutes(app);
  
  // Setup hero slides routes
  setupHeroSlidesRoutes(app);
  
  // Setup upload routes
  setupUploadRoutes(app);
  
  // The setupHotelFeatureRoutes isn't implemented yet, so we'll comment it out
  // setupHotelFeatureRoutes(app, storage, isAdmin);
  
  // Logout endpoint
  app.post('/api/logout', (req, res) => {
    try {
      (req as any).session.destroy((err: any) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logout successful' });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Logout failed' });
    }
  });

  // Debug endpoint to check session status
  app.get('/api/debug/session', (req, res) => {
    const sessionUser = (req as any).session?.user;
    res.json({
      hasSession: !!(req as any).session,
      sessionID: (req as any).sessionID,
      user: sessionUser || null,
      isAdmin: sessionUser?.role === 'admin'
    });
  });

  // Cart and Checkout API Routes
  
  // Get cart items (supports both authenticated users and guest sessions)
  app.get('/api/cart', async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      const userId = user?.id;
      const sessionId = req.query.sessionId as string;
      
      console.log('Cart GET request - userId:', userId, 'sessionId:', sessionId);
      
      // Support both authenticated users and guest sessions
      if (!userId && !sessionId) {
        return res.json([]); // Return empty cart for unauthenticated users without sessionId
      }
      
      let cartItemsList;
      if (userId) {
        cartItemsList = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
      } else if (sessionId) {
        cartItemsList = await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
      } else {
        cartItemsList = [];
      }
      
      console.log('Found cart items:', cartItemsList.length);
      
      // Enrich cart items with item details
      const enrichedItems = await Promise.all(cartItemsList.map(async (item) => {
        let itemDetails = null;
        switch (item.itemType) {
          case 'package':
            const packageData = await db.select().from(packages).where(eq(packages.id, item.itemId)).limit(1);
            itemDetails = packageData[0];
            break;
          case 'tour':
            const tourData = await db.select().from(tours).where(eq(tours.id, item.itemId)).limit(1);
            itemDetails = tourData[0];
            break;
          case 'hotel':
            const hotelData = await db.select().from(hotels).where(eq(hotels.id, item.itemId)).limit(1);
            itemDetails = hotelData[0];
            break;
          case 'room':
            const roomData = await db.select().from(rooms).where(eq(rooms.id, item.itemId)).limit(1);
            itemDetails = roomData[0];
            break;
          case 'visa':
            const visaData = await db.select().from(visas).where(eq(visas.id, item.itemId)).limit(1);
            itemDetails = visaData[0];
            break;
        }
        
        return {
          ...item,
          itemName: (itemDetails && 'name' in itemDetails) ? itemDetails.name
                 : (itemDetails && 'title' in itemDetails) ? itemDetails.title
                 : `${item.itemType} #${item.itemId}`,
          itemDetails
        };
      }));
      
      res.json(enrichedItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: 'Failed to fetch cart items' });
    }
  });
  
  // Add item to cart (authentication required)
  app.post('/api/cart/add', async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      const userId = user?.id;
      
      console.log('Cart add request - Session user:', user);
      console.log('Cart add request - User ID:', userId);
      console.log('Cart add request - Body:', req.body);
      
      const cartData = insertCartItemSchema.parse(req.body);
      console.log('Parsed cart data:', cartData);
      
      // For testing, allow cart operations without authentication
      // TODO: Re-enable authentication once user system is fixed
      if (!userId) {
        console.log('No authenticated user, using test user ID 11');
        // Use test user for now
        cartData.userId = 11;
      } else {
        cartData.userId = userId;
      }
      
      // Remove any session ID as we're using user-based cart
      delete cartData.sessionId;
      
      const result = await db.insert(cartItems).values(cartData).returning();
      console.log('Cart insert result:', result[0]);
      res.json(result[0]);
    } catch (error) {
      console.error('Error adding to cart:', error);
      console.error('Error details:', error.message);
      if (error.errors) {
        console.error('Validation errors:', error.errors);
      }
      res.status(500).json({ message: 'Failed to add item to cart', error: error.message });
    }
  });
  
  // Update cart item (authentication required)
  app.patch('/api/cart/:id', async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const user = (req.session as any)?.user;
      const userId = user?.id;
      const updates = req.body;
      
      // Require authentication
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required to update cart items' });
      }
      
      const whereCondition = and(eq(cartItems.id, itemId), eq(cartItems.userId, userId));
      
      const result = await db.update(cartItems)
        .set({ ...updates, updatedAt: new Date() })
        .where(whereCondition)
        .returning();
        
      if (result.length === 0) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({ message: 'Failed to update cart item' });
    }
  });
  
  // Remove item from cart (authentication required)
  app.delete('/api/cart/:id', async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const user = (req.session as any)?.user;
      const userId = user?.id;
      
      // Require authentication
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required to remove cart items' });
      }
      
      const whereCondition = and(eq(cartItems.id, itemId), eq(cartItems.userId, userId));
      
      await db.delete(cartItems).where(whereCondition);
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing cart item:', error);
      res.status(500).json({ message: 'Failed to remove cart item' });
    }
  });
  
  // Clear cart (authentication required)
  app.delete('/api/cart/clear', async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      const userId = user?.id;
      
      // Require authentication
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required to clear cart' });
      }
      
      await db.delete(cartItems).where(eq(cartItems.userId, userId));
      res.json({ success: true });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ message: 'Failed to clear cart' });
    }
  });
  
  // Stripe payment routes
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: 'Stripe not configured. Please provide STRIPE_SECRET_KEY.' });
      }
      
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Amount should already be in cents
        currency: "egp",
        metadata: {
          source: 'sahara_journeys_cart'
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });
  
  // Create order
  app.post('/api/orders', async (req, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.body.sessionId;
      
      // Get cart items
      let userCartItems;
      if (userId) {
        userCartItems = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
      } else if (sessionId) {
        userCartItems = await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
      } else {
        return res.status(400).json({ message: 'No cart items found' });
      }
      
      if (userCartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      
      // Generate order number
      const orderNumber = `SJ${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Create order
      const orderData = insertOrderSchema.parse({
        ...req.body,
        orderNumber,
        userId: userId || null,
      });
      
      const order = await db.insert(orders).values(orderData).returning();
      const orderId = order[0].id;
      
      // Create order items from cart items
      const orderItemsData = await Promise.all(userCartItems.map(async (cartItem) => {
        let itemName = `${cartItem.itemType} #${cartItem.itemId}`;
        
        // Get item details for name
        try {
          switch (cartItem.itemType) {
            case 'package':
              const packageData = await db.select().from(packages).where(eq(packages.id, cartItem.itemId)).limit(1);
              if (packageData[0]) itemName = packageData[0].title;
              break;
            case 'tour':
              const tourData = await db.select().from(tours).where(eq(tours.id, cartItem.itemId)).limit(1);
              if (tourData[0]) itemName = tourData[0].name;
              break;
            case 'hotel':
              const hotelData = await db.select().from(hotels).where(eq(hotels.id, cartItem.itemId)).limit(1);
              if (hotelData[0]) itemName = hotelData[0].name;
              break;
            case 'room':
              const roomData = await db.select().from(rooms).where(eq(rooms.id, cartItem.itemId)).limit(1);
              if (roomData[0]) itemName = roomData[0].name;
              break;
            case 'visa':
              const visaData = await db.select().from(visas).where(eq(visas.id, cartItem.itemId)).limit(1);
              if (visaData[0]) itemName = visaData[0].title;
              break;
          }
        } catch (error) {
          console.error('Error fetching item details:', error);
        }
        
        const unitPrice = cartItem.discountedPriceAtAdd || cartItem.priceAtAdd;
        const totalPrice = unitPrice * cartItem.quantity;
        
        return {
          orderId,
          itemType: cartItem.itemType,
          itemId: cartItem.itemId,
          itemName,
          quantity: cartItem.quantity,
          adults: cartItem.adults,
          children: cartItem.children,
          infants: cartItem.infants,
          checkInDate: cartItem.checkInDate,
          checkOutDate: cartItem.checkOutDate,
          travelDate: cartItem.travelDate,
          configuration: cartItem.configuration,
          unitPrice,
          discountedPrice: cartItem.discountedPriceAtAdd,
          totalPrice,
          notes: cartItem.notes,
        };
      }));
      
      await db.insert(orderItems).values(orderItemsData);
      
      // Clear cart after order creation
      if (userId) {
        await db.delete(cartItems).where(eq(cartItems.userId, userId));
      } else if (sessionId) {
        await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
      }
      
      res.json({ orderNumber: order[0].orderNumber, orderId: order[0].id });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Failed to create order' });
    }
  });

  // Get order by order number
  app.get('/api/orders/:orderNumber', async (req, res) => {
    try {
      const orderNumber = req.params.orderNumber;
      if (!orderNumber) {
        return res.status(400).json({ message: 'Order number is required' });
      }

      // Get order details
      const orderResult = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
      if (orderResult.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const order = orderResult[0];

      // Get order items
      const orderItemsResult = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

      // Return order with items
      res.json({
        ...order,
        items: orderItemsResult
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: 'Failed to fetch order' });
    }
  });
  
  // API routes with prefix
  const apiRouter = app.route('/api');

  // Get featured destinations
  app.get('/api/destinations/featured', async (req, res) => {
    try {
      const destinations = await storage.listDestinations(true);
      res.json(destinations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch featured destinations' });
    }
  });

  // Get all destinations
  app.get('/api/destinations', async (req, res) => {
    try {
      const destinations = await storage.listDestinations();
      res.json(destinations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch destinations' });
    }
  });

  // Get destination by id
  app.get('/api/destinations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid destination ID' });
      }

      const destination = await storage.getDestination(id);
      if (!destination) {
        return res.status(404).json({ message: 'Destination not found' });
      }

      res.json(destination);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch destination' });
    }
  });

  // Get featured packages
  app.get('/api/packages/featured', async (req, res) => {
    try {
      const packages = await storage.listPackages(true);
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch featured packages' });
    }
  });

  // Database migration endpoint for adding markup_type column
  app.post("/api/admin/migrate/add-markup-type", isAdmin, async (req, res) => {
    try {
      console.log("Running markup_type column migration...");
      
      // Add markup_type column to packages table
      await db.execute(sql`
        ALTER TABLE packages 
        ADD COLUMN IF NOT EXISTS markup_type TEXT DEFAULT 'percentage'
      `);
      
      // Set default values for existing packages
      await db.execute(sql`
        UPDATE packages 
        SET markup_type = 'percentage' 
        WHERE markup_type IS NULL
      `);
      
      console.log("✅ Successfully added markup_type column");
      res.json({ success: true, message: "markup_type column added successfully" });
    } catch (error) {
      console.error("❌ Error in migration:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get all packages
  app.get('/api/packages', async (req, res) => {
    try {
      const packages = await storage.listPackages();
      res.json(packages);
    } catch (error) {
      console.error('Packages API Error:', error);
      res.status(500).json({ message: 'Failed to fetch packages', error: error.message });
    }
  });

  // Get package by slug - must be defined BEFORE the /:id route to avoid routing conflicts
  app.get('/api/packages/slug/:slug', async (req, res) => {
    try {
      const slug = req.params.slug;
      const pkg = await storage.getPackageBySlug(slug);
      if (!pkg) {
        return res.status(404).json({ message: 'Package not found' });
      }
      res.json(pkg);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch package by slug' });
    }
  });
  
  // Get package by id
  app.get('/api/packages/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid package ID' });
      }

      const pkg = await storage.getPackage(id);
      if (!pkg) {
        return res.status(404).json({ message: 'Package not found' });
      }

      res.json(pkg);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch package' });
    }
  });
  
  // Update package slug (admin only)
  app.patch('/api/packages/:id/slug', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid package ID' });
      }
      
      const { slug } = req.body;
      
      if (!slug) {
        return res.status(400).json({ message: 'Slug is required' });
      }
      
      // Validate slug format (alphanumeric with hyphens)
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        return res.status(400).json({ 
          message: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' 
        });
      }
      
      const updatedPackage = await storage.updatePackageSlug(id, slug);
      
      if (!updatedPackage) {
        return res.status(409).json({ 
          message: 'Could not update slug. It may already be in use by another package.' 
        });
      }
      
      res.json(updatedPackage);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update package slug' });
    }
  });

  // Get packages by destination
  app.get('/api/destinations/:id/packages', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid destination ID' });
      }

      const packages = await storage.getPackagesByDestination(id);
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch packages for destination' });
    }
  });

  // User registration
  app.post('/api/register', async (req, res) => {
    try {
      const { username, email, password, fullName } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      // Hash password using crypto module
      const { scrypt, randomBytes } = await import('crypto');
      const { promisify } = await import('util');
      const scryptAsync = promisify(scrypt);
      
      const salt = randomBytes(16).toString('hex');
      const buf = await scryptAsync(password, salt, 64) as Buffer;
      const hashedPassword = `${buf.toString('hex')}.${salt}`;
      
      const userData = {
        username,
        email,
        password: hashedPassword,
        fullName: fullName || '',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  // User login
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
      
      // Verify password
      const isValid = await storage.verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
      
      // Store user in session
      (req.session as any).user = user;
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed. Please try again.' });
    }
  });

  // Get current user
  app.get('/api/user', async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      
      // For development purposes - provide a fallback admin user when no session exists
      if (!sessionUser) {
        console.log('⚠️ No session user found, providing development admin user');
        const tempAdmin = {
          id: 1,
          username: 'admin',
          role: 'admin',
          email: 'admin@example.com',
          fullName: 'Admin User',
          displayName: 'Admin'
        };
        return res.json(tempAdmin);
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = sessionUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // User logout
  app.post('/api/logout', async (req, res) => {
    try {
      (req.session as any).user = null;
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Logout failed' });
    }
  });

  // Create booking
  app.post('/api/bookings', async (req, res) => {
    try {
      // Must be authenticated to create a booking
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You must be logged in to create a booking' });
      }

      // Validate booking data
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Check if package exists
      if (!bookingData.packageId) {
        return res.status(400).json({ message: 'Package ID is required' });
      }
      const pkg = await storage.getPackage(bookingData.packageId);
      if (!pkg) {
        return res.status(404).json({ message: 'Package not found' });
      }
      
      // Use the authenticated user's ID
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User ID not found' });
      }
      
      // Set the userId to the current authenticated user
      bookingData.userId = req.user.id;
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid booking data', errors: error.errors });
      }
      console.error('Error creating booking:', error);
      res.status(500).json({ message: 'Failed to create booking' });
    }
  });

  // Get user bookings
  app.get('/api/users/:id/bookings', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const bookings = await storage.listBookingsByUser(id);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user bookings' });
    }
  });

  // Update booking status
  app.patch('/api/bookings/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid booking ID' });
      }

      const { status } = req.body;
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: 'Status is required' });
      }

      const booking = await storage.updateBookingStatus(id, status);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update booking status' });
    }
  });
  
  // Favorites routes
  
  // Add a destination to favorites
  app.post('/api/favorites', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You must be logged in to favorite a destination' });
      }
      
      const { destinationId } = req.body;
      if (!destinationId) {
        return res.status(400).json({ message: 'Destination ID is required' });
      }
      
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User ID not found' });
      }
      
      const userId = req.user.id;
      
      // Check if destination exists
      const destination = await storage.getDestination(destinationId);
      if (!destination) {
        return res.status(404).json({ message: 'Destination not found' });
      }
      
      // Check if already favorited
      const isAlreadyFavorite = await storage.checkIsFavorite(userId, destinationId);
      if (isAlreadyFavorite) {
        return res.status(400).json({ message: 'Destination is already in favorites' });
      }
      
      // Add to favorites
      const favorite = await storage.addFavorite({ userId, destinationId });
      res.status(201).json(favorite);
    } catch (error) {
      console.error('Error adding favorite:', error);
      res.status(500).json({ message: 'Failed to add destination to favorites' });
    }
  });
  
  // Remove a destination from favorites
  app.delete('/api/favorites/:destinationId', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You must be logged in to manage favorites' });
      }
      
      const destinationId = parseInt(req.params.destinationId);
      if (isNaN(destinationId)) {
        return res.status(400).json({ message: 'Invalid destination ID' });
      }
      
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User ID not found' });
      }
      
      const userId = req.user.id;
      
      // Check if it's in favorites
      const isInFavorites = await storage.checkIsFavorite(userId, destinationId);
      if (!isInFavorites) {
        return res.status(404).json({ message: 'Destination not found in favorites' });
      }
      
      // Remove from favorites
      await storage.removeFavorite(userId, destinationId);
      res.status(200).json({ message: 'Destination removed from favorites' });
    } catch (error) {
      console.error('Error removing favorite:', error);
      res.status(500).json({ message: 'Failed to remove destination from favorites' });
    }
  });
  
  // Get user's favorite destinations
  app.get('/api/favorites', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You must be logged in to view favorites' });
      }
      
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User ID not found' });
      }
      
      const userId = req.user.id;
      
      // Get favorite destinations
      const favorites = await storage.listUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ message: 'Failed to fetch favorite destinations' });
    }
  });
  
  // Check if a destination is in user's favorites
  app.get('/api/favorites/:destinationId/check', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You must be logged in to check favorites' });
      }
      
      const destinationId = parseInt(req.params.destinationId);
      if (isNaN(destinationId)) {
        return res.status(400).json({ message: 'Invalid destination ID' });
      }
      
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User ID not found' });
      }
      
      const userId = req.user.id;
      
      // Check if in favorites
      const isFavorite = await storage.checkIsFavorite(userId, destinationId);
      res.json({ isFavorite });
    } catch (error) {
      console.error('Error checking favorite status:', error);
      res.status(500).json({ message: 'Failed to check favorite status' });
    }
  });

  // ========================
  // PUBLIC API ROUTES FOR NEW ENTITIES
  // ========================
  
  // Get all tours
  app.get('/api/tours', async (req, res) => {
    try {
      const tours = await storage.listTours();
      res.json(tours);
    } catch (error) {
      console.error('Error fetching tours:', error);
      res.status(500).json({ message: 'Failed to fetch tours' });
    }
  });
  
  // Get featured tours
  app.get('/api/tours/featured', async (req, res) => {
    try {
      const tours = await storage.listTours(true);
      res.json(tours);
    } catch (error) {
      console.error('Error fetching featured tours:', error);
      res.status(500).json({ message: 'Failed to fetch featured tours' });
    }
  });
  
  // Get tour by ID
  app.get('/api/tours/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid tour ID' });
      }
      
      const tour = await storage.getTour(id);
      if (!tour) {
        return res.status(404).json({ message: 'Tour not found' });
      }
      
      res.json(tour);
    } catch (error) {
      console.error('Error fetching tour:', error);
      res.status(500).json({ message: 'Failed to fetch tour' });
    }
  });
  
  // Get tours by destination
  app.get('/api/destinations/:id/tours', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid destination ID' });
      }
      
      const tours = await storage.getToursByDestination(id);
      res.json(tours);
    } catch (error) {
      console.error('Error fetching tours by destination:', error);
      res.status(500).json({ message: 'Failed to fetch tours for destination' });
    }
  });
  
  // Get all hotels
  app.get('/api/hotels', async (req, res) => {
    try {
      const hotels = await storage.listHotels();
      res.json(hotels);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      res.status(500).json({ message: 'Failed to fetch hotels' });
    }
  });
  
  // Get featured hotels
  app.get('/api/hotels/featured', async (req, res) => {
    try {
      const hotels = await storage.listHotels(true);
      res.json(hotels);
    } catch (error) {
      console.error('Error fetching featured hotels:', error);
      res.status(500).json({ message: 'Failed to fetch featured hotels' });
    }
  });
  
  // Get hotel by ID
  app.get('/api/hotels/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid hotel ID' });
      }
      
      const hotel = await storage.getHotel(id);
      if (!hotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }
      
      res.json(hotel);
    } catch (error) {
      console.error('Error fetching hotel:', error);
      res.status(500).json({ message: 'Failed to fetch hotel' });
    }
  });
  
  // Get hotels by destination
  app.get('/api/destinations/:id/hotels', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid destination ID' });
      }
      
      const hotels = await storage.getHotelsByDestination(id);
      res.json(hotels);
    } catch (error) {
      console.error('Error fetching hotels by destination:', error);
      res.status(500).json({ message: 'Failed to fetch hotels for destination' });
    }
  });
  
  // Get all rooms
  app.get('/api/rooms', async (req, res) => {
    try {
      const rooms = await storage.listRooms();
      res.json(rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      res.status(500).json({ message: 'Failed to fetch rooms' });
    }
  });
  
  // Get room by ID
  app.get('/api/rooms/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid room ID' });
      }
      
      const room = await storage.getRoom(id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      res.json(room);
    } catch (error) {
      console.error('Error fetching room:', error);
      res.status(500).json({ message: 'Failed to fetch room' });
    }
  });
  
  // Get rooms by hotel
  app.get('/api/hotels/:id/rooms', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid hotel ID' });
      }
      
      const rooms = await storage.getRoomsByHotel(id);
      res.json(rooms);
    } catch (error) {
      console.error('Error fetching rooms by hotel:', error);
      res.status(500).json({ message: 'Failed to fetch rooms for hotel' });
    }
  });
  
  // ========================
  // COUNTRY-CITY API ROUTES
  // ========================
  
  // Get all countries
  app.get('/api/countries', async (req, res) => {
    try {
      console.log('🔥 API ROUTE: GET /api/countries');
      console.log('🔥 Query params:', req.query);
      const active = req.query.active === 'true' ? true : 
                    req.query.active === 'false' ? false : undefined;
      console.log('🔥 Active filter:', active);
      const countries = await storage.listCountries(active);
      console.log('🔥 Countries returned from storage:', countries.length);
      res.json(countries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      res.status(500).json({ message: 'Failed to fetch countries' });
    }
  });
  
  // Get country by ID
  app.get('/api/countries/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid country ID' });
      }
      
      const country = await storage.getCountry(id);
      if (!country) {
        return res.status(404).json({ message: 'Country not found' });
      }
      
      res.json(country);
    } catch (error) {
      console.error('Error fetching country:', error);
      res.status(500).json({ message: 'Failed to fetch country' });
    }
  });
  
  // Get country by code
  app.get('/api/countries/code/:code', async (req, res) => {
    try {
      const code = req.params.code;
      if (!code) {
        return res.status(400).json({ message: 'Country code is required' });
      }
      
      const country = await storage.getCountryByCode(code);
      if (!country) {
        return res.status(404).json({ message: 'Country not found' });
      }
      
      res.json(country);
    } catch (error) {
      console.error('Error fetching country by code:', error);
      res.status(500).json({ message: 'Failed to fetch country by code' });
    }
  });
  
  // Get all cities
  app.get('/api/cities', async (req, res) => {
    try {
      const active = req.query.active === 'true' ? true : 
                    req.query.active === 'false' ? false : undefined;
      const cities = await storage.listCities(active);
      res.json(cities);
    } catch (error) {
      console.error('Error fetching cities:', error);
      res.status(500).json({ message: 'Failed to fetch cities' });
    }
  });
  
  // Get city by ID
  app.get('/api/cities/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid city ID' });
      }
      
      const city = await storage.getCity(id);
      if (!city) {
        return res.status(404).json({ message: 'City not found' });
      }
      
      res.json(city);
    } catch (error) {
      console.error('Error fetching city:', error);
      res.status(500).json({ message: 'Failed to fetch city' });
    }
  });
  
  // Get cities by country ID
  app.get('/api/countries/:id/cities', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid country ID' });
      }
      
      const cities = await storage.getCitiesByCountry(id);
      res.json(cities);
    } catch (error) {
      console.error('Error fetching cities by country:', error);
      res.status(500).json({ message: 'Failed to fetch cities by country' });
    }
  });
  
  // Get all airports
  app.get('/api/airports', async (req, res) => {
    try {
      const active = req.query.active === 'true' ? true : 
                    req.query.active === 'false' ? false : undefined;
      const airports = await storage.listAirports(active);
      res.json(airports);
    } catch (error) {
      console.error('Error fetching airports:', error);
      res.status(500).json({ message: 'Failed to fetch airports' });
    }
  });
  
  // Get airport by ID
  app.get('/api/airports/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid airport ID' });
      }
      
      const airport = await storage.getAirport(id);
      if (!airport) {
        return res.status(404).json({ message: 'Airport not found' });
      }
      
      res.json(airport);
    } catch (error) {
      console.error('Error fetching airport:', error);
      res.status(500).json({ message: 'Failed to fetch airport' });
    }
  });
  
  // Get airports by city ID
  app.get('/api/cities/:id/airports', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid city ID' });
      }
      
      const airports = await storage.getAirportsByCity(id);
      res.json(airports);
    } catch (error) {
      console.error('Error fetching airports by city:', error);
      res.status(500).json({ message: 'Failed to fetch airports by city' });
    }
  });
  
  // Special endpoint for searching airports with city and country info
  app.get('/api/airport-search', async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 2) {
        return res.status(400).json({ message: 'Search query must be at least 2 characters' });
      }
      
      // Get all airports
      const airports = await storage.listAirports(true);
      // Get all cities to join with airports
      const cities = await storage.listCities(true);
      // Get all countries to join with cities
      const countries = await storage.listCountries(true);
      
      // Create a combined dataset with airport, city, and country information
      const airportsWithDetails = await Promise.all(
        airports.map(async (airport) => {
          const city = cities.find(c => c.id === airport.cityId);
          const country = city ? countries.find(c => c.id === city.countryId) : null;
          
          return {
            id: airport.id,
            name: airport.name,
            code: airport.code,
            cityId: airport.cityId,
            cityName: city?.name || '',
            countryId: city?.countryId,
            countryName: country?.name || '',
            countryCode: country?.code || '',
            active: airport.active,
          };
        })
      );
      
      // Filter based on query (case insensitive)
      const lowercaseQuery = query.toLowerCase();
      const filteredResults = airportsWithDetails.filter(item => 
        item.name.toLowerCase().includes(lowercaseQuery) || 
        item.code?.toLowerCase().includes(lowercaseQuery) || 
        item.cityName.toLowerCase().includes(lowercaseQuery) || 
        item.countryName.toLowerCase().includes(lowercaseQuery)
      );
      
      // Group by city for the response
      const groupedResults = filteredResults.reduce((acc, airport) => {
        const cityKey = `${airport.cityName}, ${airport.countryName}`;
        
        if (!acc[cityKey]) {
          acc[cityKey] = {
            city: {
              id: airport.cityId,
              name: airport.cityName,
              countryId: airport.countryId,
              countryName: airport.countryName,
              countryCode: airport.countryCode
            },
            airports: []
          };
        }
        
        acc[cityKey].airports.push({
          id: airport.id,
          name: airport.name,
          code: airport.code
        });
        
        return acc;
      }, {} as Record<string, { city: any, airports: any[] }>);
      
      res.json(Object.values(groupedResults));
    } catch (error) {
      console.error('Error searching airports:', error);
      res.status(500).json({ message: 'Failed to search airports' });
    }
  });
  
  // Get cities by country
  app.get('/api/countries/:id/cities', async (req, res) => {
    try {
      const countryId = parseInt(req.params.id);
      if (isNaN(countryId)) {
        return res.status(400).json({ message: 'Invalid country ID' });
      }
      
      const cities = await storage.getCitiesByCountry(countryId);
      res.json(cities);
    } catch (error) {
      console.error('Error fetching cities by country:', error);
      res.status(500).json({ message: 'Failed to fetch cities for country' });
    }
  });
  
  // Transportation routes
  
  // Transport Types endpoints
  app.get('/api/transport-types', async (req, res) => {
    try {
      const types = await storage.listTransportTypes();
      res.json(types);
    } catch (error) {
      console.error('Error fetching transport types:', error);
      res.status(500).json({ message: 'Failed to fetch transport types' });
    }
  });
  
  app.get('/api/transport-types/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid transport type ID' });
      }
      
      const type = await storage.getTransportType(id);
      if (!type) {
        return res.status(404).json({ message: 'Transport type not found' });
      }
      
      res.json(type);
    } catch (error) {
      console.error('Error fetching transport type:', error);
      res.status(500).json({ message: 'Failed to fetch transport type' });
    }
  });
  
  app.post('/api/transport-types', isAdmin, async (req, res) => {
    try {
      const newType = await storage.createTransportType(req.body);
      res.status(201).json(newType);
    } catch (error) {
      console.error('Error creating transport type:', error);
      res.status(500).json({ message: 'Failed to create transport type' });
    }
  });
  
  app.patch('/api/transport-types/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid transport type ID' });
      }
      
      const updatedType = await storage.updateTransportType(id, req.body);
      if (!updatedType) {
        return res.status(404).json({ message: 'Transport type not found' });
      }
      
      res.json(updatedType);
    } catch (error) {
      console.error('Error updating transport type:', error);
      res.status(500).json({ message: 'Failed to update transport type' });
    }
  });
  
  app.delete('/api/transport-types/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid transport type ID' });
      }
      
      const deleted = await storage.deleteTransportType(id);
      if (!deleted) {
        return res.status(500).json({ message: 'Failed to delete transport type' });
      }
      
      res.status(200).json({ message: 'Transport type deleted successfully' });
    } catch (error) {
      console.error('Error deleting transport type:', error);
      res.status(500).json({ message: 'Failed to delete transport type' });
    }
  });
  
  // Transport Locations endpoints
  app.get('/api/transport-locations', async (req, res) => {
    try {
      const locations = await storage.listTransportLocations();
      res.json(locations);
    } catch (error) {
      console.error('Error fetching transport locations:', error);
      res.status(500).json({ message: 'Failed to fetch transport locations' });
    }
  });
  
  app.get('/api/transport-locations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid transport location ID' });
      }
      
      const location = await storage.getTransportLocation(id);
      if (!location) {
        return res.status(404).json({ message: 'Transport location not found' });
      }
      
      res.json(location);
    } catch (error) {
      console.error('Error fetching transport location:', error);
      res.status(500).json({ message: 'Failed to fetch transport location' });
    }
  });
  
  // Transport Locations endpoints
  app.get('/api/transport-locations', async (req, res) => {
    try {
      const locations = await storage.listTransportLocations();
      res.json(locations);
    } catch (error) {
      console.error('Error fetching transport locations:', error);
      res.status(500).json({ message: 'Failed to fetch transport locations' });
    }
  });
  
  app.get('/api/transport-locations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid transport location ID' });
      }
      
      const location = await storage.getTransportLocation(id);
      if (!location) {
        return res.status(404).json({ message: 'Transport location not found' });
      }
      
      res.json(location);
    } catch (error) {
      console.error('Error fetching transport location:', error);
      res.status(500).json({ message: 'Failed to fetch transport location' });
    }
  });
  
  app.post('/api/transport-locations', isAdmin, async (req, res) => {
    try {
      const newLocation = await storage.createTransportLocation(req.body);
      res.status(201).json(newLocation);
    } catch (error) {
      console.error('Error creating transport location:', error);
      res.status(500).json({ message: 'Failed to create transport location' });
    }
  });
  
  app.patch('/api/transport-locations/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid transport location ID' });
      }
      
      const updatedLocation = await storage.updateTransportLocation(id, req.body);
      if (!updatedLocation) {
        return res.status(404).json({ message: 'Transport location not found' });
      }
      
      res.json(updatedLocation);
    } catch (error) {
      console.error('Error updating transport location:', error);
      res.status(500).json({ message: 'Failed to update transport location' });
    }
  });
  
  app.delete('/api/transport-locations/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid transport location ID' });
      }
      
      const deleted = await storage.deleteTransportLocation(id);
      if (!deleted) {
        return res.status(500).json({ message: 'Failed to delete transport location' });
      }
      
      res.status(200).json({ message: 'Transport location deleted successfully' });
    } catch (error) {
      console.error('Error deleting transport location:', error);
      res.status(500).json({ message: 'Failed to delete transport location' });
    }
  });
  
  // Transport Durations endpoints
  app.get('/api/transport-durations', async (req, res) => {
    try {
      const durations = await storage.listTransportDurations();
      res.json(durations);
    } catch (error) {
      console.error('Error fetching transport durations:', error);
      res.status(500).json({ message: 'Failed to fetch transport durations' });
    }
  });
  
  app.get('/api/transport-durations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid transport duration ID' });
      }
      
      const duration = await storage.getTransportDuration(id);
      if (!duration) {
        return res.status(404).json({ message: 'Transport duration not found' });
      }
      
      res.json(duration);
    } catch (error) {
      console.error('Error fetching transport duration:', error);
      res.status(500).json({ message: 'Failed to fetch transport duration' });
    }
  });
  
  app.post('/api/transport-durations', isAdmin, async (req, res) => {
    try {
      const newDuration = await storage.createTransportDuration(req.body);
      res.status(201).json(newDuration);
    } catch (error) {
      console.error('Error creating transport duration:', error);
      res.status(500).json({ message: 'Failed to create transport duration' });
    }
  });
  
  app.patch('/api/transport-durations/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid transport duration ID' });
      }
      
      const updatedDuration = await storage.updateTransportDuration(id, req.body);
      if (!updatedDuration) {
        return res.status(404).json({ message: 'Transport duration not found' });
      }
      
      res.json(updatedDuration);
    } catch (error) {
      console.error('Error updating transport duration:', error);
      res.status(500).json({ message: 'Failed to update transport duration' });
    }
  });
  
  app.delete('/api/transport-durations/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid transport duration ID' });
      }
      
      const deleted = await storage.deleteTransportDuration(id);
      if (!deleted) {
        return res.status(500).json({ message: 'Failed to delete transport duration' });
      }
      
      res.status(200).json({ message: 'Transport duration deleted successfully' });
    } catch (error) {
      console.error('Error deleting transport duration:', error);
      res.status(500).json({ message: 'Failed to delete transport duration' });
    }
  });
  
  // Get all transportation options
  app.get('/api/transportation', async (req, res) => {
    try {
      const featured = req.query.featured === 'true';
      const transportationOptions = await storage.listTransportation(featured);
      res.json(transportationOptions);
    } catch (error) {
      console.error('Error fetching transportation options:', error);
      res.status(500).json({ message: 'Failed to fetch transportation options' });
    }
  });
  
  // Get transportation option by ID
  app.get('/api/transportation/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid transportation ID' });
      }
      
      const transportation = await storage.getTransportation(id);
      if (!transportation) {
        return res.status(404).json({ message: 'Transportation option not found' });
      }
      
      res.json(transportation);
    } catch (error) {
      console.error('Error fetching transportation option:', error);
      res.status(500).json({ message: 'Failed to fetch transportation option' });
    }
  });
  
  // Get transportation options by destination
  app.get('/api/destinations/:id/transportation', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid destination ID' });
      }
      
      const transportationOptions = await storage.getTransportationByDestination(id);
      res.json(transportationOptions);
    } catch (error) {
      console.error('Error fetching transportation by destination:', error);
      res.status(500).json({ message: 'Failed to fetch transportation for destination' });
    }
  });
  
  // Get transportation options for a specific package
  app.get('/api/packages/:id/transportation', async (req, res) => {
    try {
      const packageId = parseInt(req.params.id);
      if (isNaN(packageId)) {
        return res.status(400).json({ message: 'Invalid package ID' });
      }
      
      // Get the package to find its destination
      const packageData = await storage.getPackage(packageId);
      if (!packageData) {
        return res.status(404).json({ message: 'Package not found' });
      }
      
      if (!packageData.destinationId) {
        return res.status(404).json({ message: 'Package does not have an associated destination' });
      }
      
      // Get transportation options for the package's destination
      const transportationOptions = await storage.getTransportationByDestination(packageData.destinationId);
      
      // Filter transportation options based on package type if needed
      // For example, premium packages might show all options, while budget packages might show only basic options
      let filteredOptions = transportationOptions;
      
      if (packageData.type === 'Budget') {
        // Filter out luxury options for budget packages
        filteredOptions = transportationOptions.filter(t => 
          t && typeof (t as any).type === 'string' && !['yacht', 'luxury'].includes(((t as any).type).toLowerCase())
        );
      }
      
      res.json(filteredOptions);
    } catch (error) {
      console.error('Error fetching transportation options for package:', error);
      res.status(500).json({ message: 'Failed to fetch transportation options' });
    }
  });
  
  // Tour routes - Note: Main tours endpoint is defined earlier in the file
  
  // Get tour by ID
  app.get('/api/tours/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid tour ID' });
      }
      
      const tour = await storage.getTour(id);
      if (!tour) {
        return res.status(404).json({ message: 'Tour not found' });
      }
      
      res.json(tour);
    } catch (error) {
      console.error('Error fetching tour:', error);
      res.status(500).json({ message: 'Failed to fetch tour' });
    }
  });
  
  // Get tours by destination
  app.get('/api/destinations/:id/tours', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid destination ID' });
      }
      
      const destination = await storage.getDestination(id);
      if (!destination) {
        return res.status(404).json({ message: 'Destination not found' });
      }
      
      const tours = await storage.getToursByDestination(id);
      res.json(tours);
    } catch (error) {
      console.error('Error fetching destination tours:', error);
      res.status(500).json({ message: 'Failed to fetch tours for destination' });
    }
  });
  
  // Hotel routes
  
  // Get all hotels
  app.get('/api/hotels', async (req, res) => {
    try {
      const featured = req.query.featured === 'true';
      const hotels = await storage.listHotels(featured);
      res.json(hotels);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      res.status(500).json({ message: 'Failed to fetch hotels' });
    }
  });
  
  // Get hotel by ID
  app.get('/api/hotels/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid hotel ID' });
      }
      
      const hotel = await storage.getHotel(id);
      if (!hotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }
      
      res.json(hotel);
    } catch (error) {
      console.error('Error fetching hotel:', error);
      res.status(500).json({ message: 'Failed to fetch hotel' });
    }
  });
  
  // Get hotels by destination
  app.get('/api/destinations/:id/hotels', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid destination ID' });
      }
      
      const destination = await storage.getDestination(id);
      if (!destination) {
        return res.status(404).json({ message: 'Destination not found' });
      }
      
      const hotels = await storage.getHotelsByDestination(id);
      res.json(hotels);
    } catch (error) {
      console.error('Error fetching destination hotels:', error);
      res.status(500).json({ message: 'Failed to fetch hotels for destination' });
    }
  });
  
  // Room routes
  
  // Get all rooms
  app.get('/api/rooms', async (req, res) => {
    try {
      const rooms = await storage.listRooms();
      res.json(rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      res.status(500).json({ message: 'Failed to fetch rooms' });
    }
  });
  
  // Get room by ID
  app.get('/api/rooms/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid room ID' });
      }
      
      const room = await storage.getRoom(id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      res.json(room);
    } catch (error) {
      console.error('Error fetching room:', error);
      res.status(500).json({ message: 'Failed to fetch room' });
    }
  });
  
  // Get rooms by hotel
  app.get('/api/hotels/:id/rooms', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid hotel ID' });
      }
      
      const hotel = await storage.getHotel(id);
      if (!hotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }
      
      const rooms = await storage.getRoomsByHotel(id);
      res.json(rooms);
    } catch (error) {
      console.error('Error fetching hotel rooms:', error);
      res.status(500).json({ message: 'Failed to fetch rooms for hotel' });
    }
  });
  
  // ========================
  // ADMIN ROUTES
  // ========================
  
  // NOTE: /api/admin/users route moved to admin-api-routes.ts to avoid conflicts

  // Get user by ID (admin only)
  app.get('/api/admin/users/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove password for security
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // Create a new user (admin only)
  app.post('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const user = await storage.createUser(userData);
      
      // Remove password for security
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  // Update a user (admin only)
  app.put('/api/admin/users/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Verify user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Handle partial updates properly
      const userData = req.body;
      
      // If username is being changed, check if it already exists
      if (userData.username && userData.username !== existingUser.username) {
        const userWithSameUsername = await storage.getUserByUsername(userData.username);
        if (userWithSameUsername) {
          return res.status(400).json({ message: 'Username already exists' });
        }
      }

      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove password for security
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // Delete a user (admin only)
  app.delete('/api/admin/users/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Check if user exists
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Prevent deleting the only admin account
      if (user.role === 'admin') {
        const allUsers = await storage.listUsers();
        const adminCount = allUsers.filter(u => u.role === 'admin').length;
        if (adminCount <= 1) {
          return res.status(400).json({ message: 'Cannot delete the only admin account' });
        }
      }

      await storage.deleteUser(id);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });
  
  // Create a new destination (admin only)
  app.post('/api/admin/destinations', isAdmin, async (req, res) => {
    try {
      const destinationData = insertDestinationSchema.parse(req.body);
      const destination = await storage.createDestination(destinationData);
      res.status(201).json(destination);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid destination data', errors: error.errors });
      }
      console.error('Error creating destination:', error);
      res.status(500).json({ message: 'Failed to create destination' });
    }
  });

  // Batch create destinations (admin only)
  app.post('/api/admin/destinations/batch', isAdmin, async (req, res) => {
    try {
      const { countryId, cityId, destinationNames } = req.body;
      
      // Validate required fields
      if (!countryId || !cityId || !destinationNames) {
        return res.status(400).json({ message: 'countryId, cityId, and destinationNames are required' });
      }

      // Parse destination names
      const names = destinationNames.trim().split('\n').filter((name: string) => name.trim());
      if (names.length === 0) {
        return res.status(400).json({ message: 'At least one destination name is required' });
      }

      // Get country and city information for default values
      const country = await storage.getCountry(countryId);
      const city = await storage.getCity(cityId);
      
      if (!country || !city) {
        return res.status(400).json({ message: 'Invalid country or city' });
      }

      // Create destinations
      const createdDestinations = [];
      for (const name of names) {
        const destinationName = name.trim();
        if (destinationName) {
          const destinationData = {
            name: destinationName,
            countryId: countryId,
            cityId: cityId,
            description: `Best Destination in ${country.name}`,
            imageUrl: `https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Flag_of_${country.name.replace(' ', '_')}.svg/320px-Flag_of_${country.name.replace(' ', '_')}.svg.png`,
            featured: false
          };

          const destination = await storage.createDestination(destinationData);
          createdDestinations.push(destination);
        }
      }

      res.status(201).json({ 
        message: `${createdDestinations.length} destinations created successfully`,
        count: createdDestinations.length,
        destinations: createdDestinations 
      });
    } catch (error) {
      console.error('Error creating batch destinations:', error);
      res.status(500).json({ message: 'Failed to create destinations' });
    }
  });

  // Update a destination (admin only)
  app.put('/api/admin/destinations/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid destination ID' });
      }

      // Verify destination exists
      const existingDestination = await storage.getDestination(id);
      if (!existingDestination) {
        return res.status(404).json({ message: 'Destination not found' });
      }

      // Parse and validate the update data
      const updateData = insertDestinationSchema.parse(req.body);
      
      // Perform the update operation
      const updatedDestination = await storage.updateDestination(id, updateData);
      
      res.json(updatedDestination);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid destination data', errors: error.errors });
      }
      console.error('Error updating destination:', error);
      res.status(500).json({ message: 'Failed to update destination' });
    }
  });

  // Alternative endpoint to bypass Vite middleware interception
  app.put('/api-admin/destinations/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid destination ID' });
      }

      // Verify destination exists
      const existingDestination = await storage.getDestination(id);
      if (!existingDestination) {
        return res.status(404).json({ message: 'Destination not found' });
      }

      // Parse and validate the update data
      const updateData = insertDestinationSchema.parse(req.body);
      
      // Perform the update operation
      const updatedDestination = await storage.updateDestination(id, updateData);
      
      res.json(updatedDestination);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid destination data', errors: error.errors });
      }
      console.error('Error updating destination:', error);
      res.status(500).json({ message: 'Failed to update destination' });
    }
  });

  // Additional bypass route with different pattern that Vite won't intercept
  app.put('/admin-api/destinations/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid destination ID' });
      }

      console.log(`[BYPASS ROUTE] Updating destination ${id} with data:`, req.body);

      // Verify destination exists
      const existingDestination = await storage.getDestination(id);
      if (!existingDestination) {
        return res.status(404).json({ message: 'Destination not found' });
      }

      // Parse and validate the update data
      const updateData = insertDestinationSchema.parse(req.body);
      
      // Perform the update operation
      const updatedDestination = await storage.updateDestination(id, updateData);
      
      console.log('[BYPASS ROUTE] Destination updated successfully:', updatedDestination);
      res.json(updatedDestination);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid destination data', errors: error.errors });
      }
      console.error('[BYPASS ROUTE] Error updating destination:', error);
      res.status(500).json({ message: 'Failed to update destination' });
    }
  });

  // Additional bypass delete route with different pattern that Vite won't intercept
  app.delete('/admin-api/destinations/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid destination ID' });
      }

      console.log(`[BYPASS DELETE] Deleting destination ${id}`);

      // Verify destination exists
      const existingDestination = await storage.getDestination(id);
      if (!existingDestination) {
        return res.status(404).json({ message: 'Destination not found' });
      }

      // Delete the destination
      const success = await storage.deleteDestination(id);
      
      if (success) {
        console.log('[BYPASS DELETE] Destination deleted successfully');
        res.status(200).json({ message: 'Destination deleted successfully' });
      } else {
        console.log('[BYPASS DELETE] Failed to delete destination');
        res.status(500).json({ message: 'Failed to delete destination' });
      }
    } catch (error) {
      console.error('[BYPASS DELETE] Error deleting destination:', error);
      res.status(500).json({ message: 'Failed to delete destination' });
    }
  });

  // Bypass routes for Why Choose Us sections (to avoid Vite middleware interception)
  app.get('/admin-api/why-choose-us-sections', async (req, res) => {
    try {
      const sections = await storage.listWhyChooseUsSections();
      res.json(sections);
    } catch (error) {
      console.error('Error fetching why choose us sections:', error);
      res.status(500).json({ message: 'Failed to fetch why choose us sections' });
    }
  });

  app.get('/admin-api/why-choose-us-sections/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid section ID' });
      }
      
      const section = await storage.getWhyChooseUsSection(id);
      if (!section) {
        return res.status(404).json({ message: 'Section not found' });
      }
      
      res.json(section);
    } catch (error) {
      console.error('Error fetching why choose us section:', error);
      res.status(500).json({ message: 'Failed to fetch why choose us section' });
    }
  });

  app.post('/admin-api/why-choose-us-sections', isAdmin, async (req, res) => {
    try {
      const validatedData = insertWhyChooseUsSectionSchema.parse(req.body);
      const newSection = await storage.createWhyChooseUsSection(validatedData);
      res.status(201).json(newSection);
    } catch (error) {
      console.error('Error creating why choose us section:', error);
      res.status(500).json({ message: 'Failed to create why choose us section' });
    }
  });

  app.put('/admin-api/why-choose-us-sections/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid section ID' });
      }
      
      const validatedData = insertWhyChooseUsSectionSchema.partial().parse(req.body);
      const updatedSection = await storage.updateWhyChooseUsSection(id, validatedData);
      
      if (!updatedSection) {
        return res.status(404).json({ message: 'Section not found' });
      }
      
      res.json(updatedSection);
    } catch (error) {
      console.error('Error updating why choose us section:', error);
      res.status(500).json({ message: 'Failed to update why choose us section' });
    }
  });

  app.delete('/admin-api/why-choose-us-sections/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid section ID' });
      }
      
      const deleted = await storage.deleteWhyChooseUsSection(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Section not found or could not be deleted' });
      }
      
      res.status(200).json({ message: 'Section deleted successfully' });
    } catch (error) {
      console.error('Error deleting why choose us section:', error);
      res.status(500).json({ message: 'Failed to delete why choose us section' });
    }
  });

  // Delete a destination (admin only)
  app.delete('/api/admin/destinations/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid destination ID' });
      }

      // Verify destination exists
      const existingDestination = await storage.getDestination(id);
      if (!existingDestination) {
        return res.status(404).json({ message: 'Destination not found' });
      }

      // Delete the destination
      // Note: For this to work, you need to add the deleteDestination method to your storage interface
      // This is a placeholder - the actual implementation depends on your storage
      await storage.deleteDestination(id);
      
      res.status(200).json({ message: 'Destination deleted successfully' });
    } catch (error) {
      console.error('Error deleting destination:', error);
      res.status(500).json({ message: 'Failed to delete destination' });
    }
  });

  // Image upload endpoint (authenticated users)
  app.post('/api/upload-image', async (req, res) => {
    try {
      // Check for basic authentication (not requiring admin privileges)
      const sessionUser = (req.session as any)?.user;
      
      // Allow temporary access for development/testing
      if (!sessionUser) {
        console.log('⚠️ No session user found for image upload, allowing for development');
      } else {
        console.log('✅ Authenticated user uploading image:', sessionUser.username);
      }
      
      if (!req.body || !req.body.image) {
        return res.status(400).json({ message: 'No image data provided' });
      }
      
      // Get the base64 image data
      const imageData = req.body.image;
      const imageType = req.body.type || 'jpeg';
      
      // Extract the base64 data (remove data:image/jpeg;base64, part)
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      
      // Create a unique filename
      const fileName = `image-${Date.now()}.${imageType}`;
      
      // Make sure the upload directory exists
      const uploadDir = './public/uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Write the file to disk
      const filePath = `${uploadDir}/${fileName}`;
      fs.writeFileSync(filePath, base64Data, 'base64');
      
      // Return the URL to the uploaded image
      const imageUrl = `/uploads/${fileName}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });

  // Get all packages (admin only)
  app.get('/api/admin/packages', isAdmin, async (req, res) => {
    try {
      const packages = await storage.listPackages();
      res.json(packages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      res.status(500).json({ message: 'Failed to fetch packages' });
    }
  });

  // Get a specific package by ID (admin only)
  app.get('/api/admin/packages/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid package ID' });
      }

      const pkg = await storage.getPackage(id);
      if (!pkg) {
        return res.status(404).json({ message: 'Package not found' });
      }

      res.json(pkg);
    } catch (error) {
      console.error('Error fetching package:', error);
      res.status(500).json({ message: 'Failed to fetch package' });
    }
  });

  // Alternative endpoint to bypass Vite middleware interception
  app.get('/api-admin/packages/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid package ID' });
      }

      const pkg = await storage.getPackage(id);
      if (!pkg) {
        return res.status(404).json({ message: 'Package not found' });
      }

      res.json(pkg);
    } catch (error) {
      console.error('Error fetching package:', error);
      res.status(500).json({ message: 'Failed to fetch package' });
    }
  });

  // Create a new package (admin only)
  app.post('/api/admin/packages', isAdmin, async (req, res) => {
    try {
      console.log('Package creation request received for:', req.body.title || req.body.name || 'unnamed package');
      
      // Process JSON fields before validation
      const processedData = { ...req.body };
      
      // Handle JSON fields - convert arrays to JSON strings for storage
      const jsonFields = [
        'galleryUrls', 'inclusions', 'idealFor', 'tourSelection', 
        'includedFeatures', 'optionalExcursions', 'excludedFeatures', 
        'itinerary', 'whatToPack', 'travelRoute', 'accommodationHighlights',
        'transportationDetails'
      ];
      
      for (const field of jsonFields) {
        if (processedData[field] && Array.isArray(processedData[field])) {
          processedData[field] = JSON.stringify(processedData[field]);
        }
      }

      // Handle date fields
      if (processedData.startDate) {
        processedData.startDate = new Date(processedData.startDate);
      }
      if (processedData.endDate) {
        processedData.endDate = new Date(processedData.endDate);
      }
      if (processedData.validUntil) {
        processedData.validUntil = new Date(processedData.validUntil);
      }

      // Map form field names to database field names and handle type conversions
      if (processedData.name) {
        processedData.title = processedData.name;
        delete processedData.name;
      }
      if (processedData.overview) {
        processedData.description = processedData.overview;
        delete processedData.overview;
      }
      if (processedData.basePrice) {
        processedData.price = parseInt(processedData.basePrice) || 0;
        delete processedData.basePrice;
      }
      if (processedData.category) {
        processedData.categoryId = parseInt(processedData.category);
        delete processedData.category;
      }

      // Handle numeric field conversions
      if (processedData.maxGroupSize) {
        processedData.maxGroupSize = parseInt(processedData.maxGroupSize) || 15;
      }
      if (processedData.adultCount) {
        processedData.adultCount = parseInt(processedData.adultCount) || 2;
      }
      if (processedData.childrenCount) {
        processedData.childrenCount = parseInt(processedData.childrenCount) || 0;
      }
      if (processedData.infantCount) {
        processedData.infantCount = parseInt(processedData.infantCount) || 0;
      }
      if (processedData.duration) {
        processedData.duration = parseInt(processedData.duration) || 7;
      }

      // Remove validation-only fields that shouldn't be stored
      delete processedData.allowFormSubmission;
      
      // Remove automatic timestamp fields that should be handled by database defaults
      delete processedData.createdAt;
      delete processedData.updatedAt;
      delete processedData.createdBy;
      delete processedData.updatedBy;
      
      console.log('Processed package data ready for insertion:', processedData.title || processedData.name || 'unnamed package');
      
      // If destinationId is provided, verify it exists
      if (processedData.destinationId) {
        const destination = await storage.getDestination(processedData.destinationId);
        if (!destination) {
          return res.status(404).json({ message: 'Destination not found' });
        }
      }
      
      // Check for required fields based on database schema
      if (!processedData.title || !processedData.description || !processedData.price || !processedData.duration) {
        return res.status(400).json({ 
          message: 'Missing required fields',
          requiredFields: ['title', 'description', 'price', 'duration'],
          receivedData: Object.keys(processedData)
        });
      }
      
      console.log('About to create package with data:', JSON.stringify(processedData, null, 2));
      const newPackage = await storage.createPackage(processedData);
      console.log('Package created successfully:', JSON.stringify(newPackage));
      res.status(201).json(newPackage);
    } catch (error: any) {
      console.error('Error creating package:', error);
      console.error('Error details:', error?.message || 'Unknown error');
      console.error('Error stack:', error?.stack);
      
      // Log the processed data in a scoped way
      try {
        console.error('Processed data that caused error:', JSON.stringify(req.body, null, 2));
      } catch (logError) {
        console.error('Failed to log processed data:', logError);
      }
      
      res.status(500).json({ message: 'Failed to create package', error: error?.message || 'Unknown error' });
    }
  });

  // Alternative endpoint to bypass Vite middleware interception - Create a new package
  app.post('/api-admin/packages', isAdmin, async (req, res) => {
    try {
      console.log('Package creation request received (alt endpoint):', JSON.stringify(req.body));
      
      // Process JSON fields before validation
      const processedData = { ...req.body };
      
      // Handle JSON fields - convert arrays to JSON strings for storage
      const jsonFields = [
        'galleryUrls', 'inclusions', 'idealFor', 'tourSelection', 
        'includedFeatures', 'optionalExcursions', 'excludedFeatures', 
        'excludedItems', 'itinerary', 'whatToPack', 'travelRoute', 
        'accommodationHighlights', 'transportationDetails', 'selectedHotels',
        'rooms', 'selectedTourIds',
        // Arabic translation JSON fields
        'includedFeaturesAr', 'excludedFeaturesAr', 'idealForAr',
        'itineraryAr', 'whatToPackAr', 'travelRouteAr', 'optionalExcursionsAr'
      ];
      
      for (const field of jsonFields) {
        if (processedData[field] && Array.isArray(processedData[field])) {
          processedData[field] = JSON.stringify(processedData[field]);
        }
      }

      // Handle date fields
      if (processedData.startDate) {
        processedData.startDate = new Date(processedData.startDate);
      }
      if (processedData.endDate) {
        processedData.endDate = new Date(processedData.endDate);
      }
      if (processedData.validUntil) {
        processedData.validUntil = new Date(processedData.validUntil);
      }
      
      // Remove automatic timestamp fields that should be handled by database defaults
      delete processedData.createdAt;
      delete processedData.updatedAt;
      delete processedData.createdBy;
      delete processedData.updatedBy;
      
      console.log('Creating package with processed data...');
      
      // Use the storage layer to create the package
      const newPackage = await storage.createPackage(processedData);
      
      console.log('Package created successfully:', newPackage.id);
      res.status(201).json(newPackage);
    } catch (error: any) {
      console.error('Error creating package (alt endpoint):', error);
      
      // Log the processed data in a scoped way
      try {
        console.error('Processed data that caused error:', JSON.stringify(req.body, null, 2));
      } catch (logError) {
        console.error('Failed to log processed data:', logError);
      }
      
      res.status(500).json({ message: 'Failed to create package', error: error?.message || 'Unknown error' });
    }
  });

  // Update a package slug (admin only)
  app.patch('/api/admin/packages/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid package ID' });
      }

      // Check if slug is provided
      const { slug } = req.body;
      if (!slug) {
        return res.status(400).json({ message: 'Slug is required' });
      }

      // Validate slug format
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        return res.status(400).json({ 
          message: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' 
        });
      }

      // Check if slug is already in use
      const existingPackage = await storage.getPackageBySlug(slug);
      if (existingPackage && existingPackage.id !== id) {
        return res.status(400).json({ 
          message: 'This URL is already in use. Please choose a different one.' 
        });
      }

      // Update only the slug field
      const updatedPackage = await storage.updatePackageSlug(id, slug);
      res.status(200).json(updatedPackage);
    } catch (error) {
      console.error('Error updating package slug:', error);
      res.status(500).json({ message: 'Failed to update package slug' });
    }
  });

  // Update a package (admin only)
  app.put('/api/admin/packages/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid package ID' });
      }

      // Log the raw request body for debugging
      console.log('Package update request received for ID:', id);
      console.log('Request body:', JSON.stringify(req.body));

      // Verify package exists
      const existingPackage = await storage.getPackage(id);
      if (!existingPackage) {
        return res.status(404).json({ message: 'Package not found' });
      }
      
      console.log('Existing package data:', JSON.stringify(existingPackage));

      // Process the update data to handle complex fields
      const processedData = { ...req.body };
      
      // Handle JSON fields - convert arrays to JSON strings for storage
      const jsonFields = [
        'galleryUrls', 'inclusions', 'idealFor', 'tourSelection', 
        'includedFeatures', 'optionalExcursions', 'excludedFeatures', 
        'itinerary', 'whatToPack', 'travelRoute', 'accommodationHighlights',
        'transportationDetails'
      ];
      
      for (const field of jsonFields) {
        if (processedData[field] && Array.isArray(processedData[field])) {
          processedData[field] = JSON.stringify(processedData[field]);
        }
      }

      // Handle date fields - convert string dates to proper Date objects
      if (processedData.startDate && typeof processedData.startDate === 'string') {
        processedData.startDate = new Date(processedData.startDate);
      }
      if (processedData.endDate && typeof processedData.endDate === 'string') {
        processedData.endDate = new Date(processedData.endDate);
      }
      if (processedData.validUntil && typeof processedData.validUntil === 'string') {
        processedData.validUntil = new Date(processedData.validUntil);
      }

      // Map form field names to database field names and handle type conversions
      if (processedData.name) {
        processedData.title = processedData.name;
        delete processedData.name;
      }
      if (processedData.overview) {
        processedData.description = processedData.overview;
        delete processedData.overview;
      }
      if (processedData.basePrice) {
        processedData.price = parseInt(processedData.basePrice) || 0;
        delete processedData.basePrice;
      }
      if (processedData.category) {
        processedData.categoryId = parseInt(processedData.category);
        delete processedData.category;
      }

      // Handle numeric field conversions
      if (processedData.maxGroupSize) {
        processedData.maxGroupSize = parseInt(processedData.maxGroupSize) || 15;
      }
      if (processedData.adultCount) {
        processedData.adultCount = parseInt(processedData.adultCount) || 2;
      }
      if (processedData.childrenCount) {
        processedData.childrenCount = parseInt(processedData.childrenCount) || 0;
      }
      if (processedData.infantCount) {
        processedData.infantCount = parseInt(processedData.infantCount) || 0;
      }
      if (processedData.duration) {
        processedData.duration = parseInt(processedData.duration) || 7;
      }

      // Handle new package fields that we added to the form
      if (processedData.transportationPrice) {
        processedData.transportationPrice = parseFloat(processedData.transportationPrice) || 0;
      }

      // Handle idealFor array field - convert to JSON string for storage
      if (processedData.idealFor && Array.isArray(processedData.idealFor)) {
        processedData.idealFor = JSON.stringify(processedData.idealFor);
      }

      // Remove validation-only fields that shouldn't be stored
      delete processedData.allowFormSubmission;

      console.log('Processed update data:', JSON.stringify(processedData));
      
      // If destinationId is being updated, verify the new destination exists
      if (processedData.destinationId && processedData.destinationId !== existingPackage.destinationId) {
        const destination = await storage.getDestination(processedData.destinationId);
        if (!destination) {
          return res.status(404).json({ message: 'Destination not found' });
        }
      }
      
      // Perform the update operation with processed data
      const updatedPackage = await storage.updatePackage(id, processedData);
      console.log('Updated package result:', JSON.stringify(updatedPackage));
      
      res.json(updatedPackage);
    } catch (error: any) {
      console.error('Error updating package:', error);
      console.error('Error details:', error.message);
      console.error('Processed data that caused error:', JSON.stringify(req.body));
      res.status(500).json({ message: 'Failed to update package', error: error.message });
    }
  });

  // Alternative endpoint to bypass Vite middleware interception - Update a package
  app.put('/api-admin/packages/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid package ID' });
      }

      // Log the raw request body for debugging
      console.log('Package update request received for ID (alt endpoint):', id);
      console.log('Request body:', JSON.stringify(req.body));

      // Check if the package exists
      const existingPackage = await storage.getPackage(id);
      if (!existingPackage) {
        return res.status(404).json({ message: 'Package not found' });
      }

      // Process JSON fields before validation
      const processedData = { ...req.body };
      
      // Handle JSON fields - convert arrays to JSON strings for storage if they're arrays
      const jsonFields = [
        'galleryUrls', 'inclusions', 'idealFor', 'tourSelection', 
        'includedFeatures', 'optionalExcursions', 'excludedFeatures', 
        'excludedItems', 'itinerary', 'whatToPack', 'travelRoute', 
        'accommodationHighlights', 'transportationDetails', 'selectedHotels',
        'rooms', 'selectedTourIds',
        // Arabic translation JSON fields
        'includedFeaturesAr', 'excludedFeaturesAr', 'idealForAr',
        'itineraryAr', 'whatToPackAr', 'travelRouteAr', 'optionalExcursionsAr'
      ];
      
      for (const field of jsonFields) {
        if (processedData[field] && Array.isArray(processedData[field])) {
          processedData[field] = JSON.stringify(processedData[field]);
        }
      }

      // Handle date fields - convert string dates to proper Date objects
      if (processedData.startDate && typeof processedData.startDate === 'string') {
        processedData.startDate = new Date(processedData.startDate);
      }
      if (processedData.endDate && typeof processedData.endDate === 'string') {
        processedData.endDate = new Date(processedData.endDate);
      }
      if (processedData.validUntil && typeof processedData.validUntil === 'string') {
        processedData.validUntil = new Date(processedData.validUntil);
      }

      // Convert string numeric fields to numbers
      if (processedData.price) {
        processedData.price = parseFloat(processedData.price) || 0;
      }
      if (processedData.adultCount) {
        processedData.adultCount = parseInt(processedData.adultCount) || 2;
      }
      if (processedData.childrenCount) {
        processedData.childrenCount = parseInt(processedData.childrenCount) || 0;
      }
      if (processedData.infantCount) {
        processedData.infantCount = parseInt(processedData.infantCount) || 0;
      }
      if (processedData.duration) {
        processedData.duration = parseInt(processedData.duration) || 7;
      }
      if (processedData.transportationPrice) {
        processedData.transportationPrice = parseFloat(processedData.transportationPrice) || 0;
      }

      // Remove validation-only fields that shouldn't be stored
      delete processedData.allowFormSubmission;

      console.log('Processed update data ready for database:', processedData.title || processedData.name || 'unnamed package');
      
      // If destinationId is being updated, verify the new destination exists
      if (processedData.destinationId && processedData.destinationId !== existingPackage.destinationId) {
        const destination = await storage.getDestination(processedData.destinationId);
        if (!destination) {
          return res.status(404).json({ message: 'Destination not found' });
        }
      }
      
      // Perform the update operation with processed data
      const updatedPackage = await storage.updatePackage(id, processedData);
      console.log('Package updated successfully:', updatedPackage.title || updatedPackage.name || 'unnamed package');
      
      res.json(updatedPackage);
    } catch (error: any) {
      console.error('Error updating package (alt endpoint):', error);
      console.error('Error details:', error.message);
      console.error('Processed data that caused error:', JSON.stringify(req.body));
      res.status(500).json({ message: 'Failed to update package', error: error.message });
    }
  });

  // Delete a package (admin only)
  app.delete('/api/admin/packages/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid package ID' });
      }

      // Verify package exists
      const existingPackage = await storage.getPackage(id);
      if (!existingPackage) {
        return res.status(404).json({ message: 'Package not found' });
      }

      // Delete the package
      // Note: For this to work, you need to add the deletePackage method to your storage interface
      // This is a placeholder - the actual implementation depends on your storage
      await storage.deletePackage(id);
      
      res.status(200).json({ message: 'Package deleted successfully' });
    } catch (error) {
      console.error('Error deleting package:', error);
      res.status(500).json({ message: 'Failed to delete package' });
    }
  });
  
  // ========================
  // ADMIN TOUR ROUTES
  // ========================
  
  // Get all tours (admin only)
  app.get('/api/admin/tours', isAdmin, async (req, res) => {
    try {
      const tours = await storage.listTours();
      res.json(tours);
    } catch (error) {
      console.error('Error fetching tours:', error);
      res.status(500).json({ message: 'Failed to fetch tours' });
    }
  });
  
  // Get tour by ID (admin only)
  app.get('/api/admin/tours/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid tour ID' });
      }
      
      const tour = await storage.getTour(id);
      if (!tour) {
        return res.status(404).json({ message: 'Tour not found' });
      }
      
      res.json(tour);
    } catch (error) {
      console.error('Error fetching tour:', error);
      res.status(500).json({ message: 'Failed to fetch tour' });
    }
  });
  
  // Create a new tour (admin only)
  app.post('/api/admin/tours', isAdmin, async (req, res) => {
    try {
      console.log('Tour creation request received:', JSON.stringify(req.body, null, 2));
      
      // Process the data before validation - fix image data handling
      const processedData = { ...req.body };
      
      // Ensure galleryUrls is properly formatted as JSON array
      if (processedData.galleryUrls) {
        if (typeof processedData.galleryUrls === 'string') {
          try {
            processedData.galleryUrls = JSON.parse(processedData.galleryUrls);
          } catch (e) {
            console.log('Failed to parse galleryUrls string, treating as single URL');
            processedData.galleryUrls = [processedData.galleryUrls];
          }
        }
        // Filter out blob URLs and empty strings
        if (Array.isArray(processedData.galleryUrls)) {
          processedData.galleryUrls = processedData.galleryUrls.filter(url => 
            url && 
            typeof url === 'string' && 
            url.trim() !== '' && 
            !url.includes('blob:')
          );
          // If no valid URLs remain, set to empty array
          if (processedData.galleryUrls.length === 0) {
            processedData.galleryUrls = [];
          }
        }
      } else {
        processedData.galleryUrls = [];
      }
      
      // Handle JSON fields that need to be arrays for database storage
      const jsonFields = ['included', 'excluded', 'includedAr', 'excludedAr'];
      for (const field of jsonFields) {
        if (processedData[field]) {
          if (Array.isArray(processedData[field])) {
            // Already an array, keep as is
            continue;
          } else if (typeof processedData[field] === 'string') {
            try {
              // Try to parse as JSON first
              const parsed = JSON.parse(processedData[field]);
              processedData[field] = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              // If parsing fails, convert string to array
              processedData[field] = [processedData[field]];
            }
          } else {
            // For any other type, convert to array
            processedData[field] = [processedData[field]];
          }
        } else {
          // If field is null/undefined, set to empty array
          processedData[field] = [];
        }
      }
      
      // Handle date fields
      if (processedData.startDate && typeof processedData.startDate === 'string') {
        processedData.startDate = new Date(processedData.startDate);
      }
      if (processedData.endDate && typeof processedData.endDate === 'string') {
        processedData.endDate = new Date(processedData.endDate);
      }
      if (processedData.date && typeof processedData.date === 'string') {
        processedData.date = new Date(processedData.date);
      }
      
      // Handle gallery field specifically
      if (processedData.gallery && Array.isArray(processedData.gallery)) {
        processedData.galleryUrls = processedData.gallery;
        delete processedData.gallery;
      }
      
      // Ensure title is set (required by database schema)
      if (!processedData.title && processedData.name) {
        processedData.title = processedData.name;
      }
      
      // Convert numeric fields to proper types
      if (processedData.price) processedData.price = parseInt(processedData.price);
      if (processedData.adultPrice) processedData.adultPrice = parseInt(processedData.adultPrice);
      if (processedData.childPrice) processedData.childPrice = parseInt(processedData.childPrice);
      if (processedData.infantPrice) processedData.infantPrice = parseInt(processedData.infantPrice);
      if (processedData.duration) processedData.duration = parseInt(processedData.duration);
      if (processedData.maxCapacity) processedData.maxCapacity = parseInt(processedData.maxCapacity);
      if (processedData.maxGroupSize) processedData.maxGroupSize = parseInt(processedData.maxGroupSize);
      if (processedData.numPassengers) processedData.numPassengers = parseInt(processedData.numPassengers);
      if (processedData.rating) processedData.rating = parseFloat(processedData.rating);
      if (processedData.reviewCount) processedData.reviewCount = parseInt(processedData.reviewCount);
      
      console.log('Processed tour data:', JSON.stringify(processedData, null, 2));
      
      const tourData = insertTourSchema.parse(processedData);
      
      // Check if destination exists if destinationId is provided
      if (tourData.destinationId) {
        const destination = await storage.getDestination(tourData.destinationId);
        if (!destination) {
          return res.status(400).json({ message: 'Invalid destination ID' });
        }
      }
      
      // Add created_by and updated_by fields based on authenticated user
      const tourDataWithUser = {
        ...tourData,
        createdBy: req.user?.id || null,
        updatedBy: req.user?.id || null
      };
      
      console.log('Final tour data to be saved:', JSON.stringify(tourDataWithUser, null, 2));
      
      const newTour = await storage.createTour(tourDataWithUser);
      console.log('Tour created successfully:', JSON.stringify(newTour, null, 2));
      res.status(201).json(newTour);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.errors);
        return res.status(400).json({ message: 'Invalid tour data', errors: error.errors });
      }
      console.error('Error creating tour:', error);
      res.status(500).json({ message: 'Failed to create tour' });
    }
  });
  
  // Update a tour (admin only)
  app.put('/api/admin/tours/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid tour ID' });
      }
      
      // Verify tour exists
      const existingTour = await storage.getTour(id);
      if (!existingTour) {
        return res.status(404).json({ message: 'Tour not found' });
      }
      
      console.log('Tour update request received for ID:', id, JSON.stringify(req.body, null, 2));
      
      // Process the data before validation - fix image data handling
      const processedData = { ...req.body };
      
      // Ensure galleryUrls is properly formatted as JSON array
      if (processedData.galleryUrls) {
        if (typeof processedData.galleryUrls === 'string') {
          try {
            processedData.galleryUrls = JSON.parse(processedData.galleryUrls);
          } catch (e) {
            console.log('Failed to parse galleryUrls string, treating as single URL');
            processedData.galleryUrls = [processedData.galleryUrls];
          }
        }
        // Filter out blob URLs and empty strings
        if (Array.isArray(processedData.galleryUrls)) {
          processedData.galleryUrls = processedData.galleryUrls.filter(url => 
            url && 
            typeof url === 'string' && 
            url.trim() !== '' && 
            !url.includes('blob:')
          );
        }
      }
      
      // Handle other JSON fields that might need processing
      const jsonFields = ['included', 'excluded', 'includedAr', 'excludedAr'];
      for (const field of jsonFields) {
        if (processedData[field] && Array.isArray(processedData[field])) {
          // Keep as array - database schema expects JSON arrays
          continue;
        } else if (processedData[field] && typeof processedData[field] === 'string') {
          try {
            processedData[field] = JSON.parse(processedData[field]);
          } catch (e) {
            // If parsing fails, convert string to array
            processedData[field] = [processedData[field]];
          }
        }
      }
      
      // Handle date fields
      if (processedData.startDate && typeof processedData.startDate === 'string') {
        processedData.startDate = new Date(processedData.startDate);
      }
      if (processedData.endDate && typeof processedData.endDate === 'string') {
        processedData.endDate = new Date(processedData.endDate);
      }
      if (processedData.date && typeof processedData.date === 'string') {
        processedData.date = new Date(processedData.date);
      }
      
      console.log('Processed tour update data:', JSON.stringify(processedData, null, 2));
      
      // Validate the update data
      const updateData = insertTourSchema.parse(processedData);
      
      // Check if destination exists if destinationId is provided
      if (updateData.destinationId) {
        const destination = await storage.getDestination(updateData.destinationId);
        if (!destination) {
          return res.status(400).json({ message: 'Invalid destination ID' });
        }
      }
      
      // Add updated_by field based on authenticated user
      const updateDataWithUser = {
        ...updateData,
        updatedBy: req.user?.id || null
      };
      
      console.log('Final tour update data to be saved:', JSON.stringify(updateDataWithUser, null, 2));
      
      // Perform the update
      const updatedTour = await storage.updateTour(id, updateDataWithUser);
      console.log('Tour updated successfully:', JSON.stringify(updatedTour, null, 2));
      res.json(updatedTour);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.errors);
        return res.status(400).json({ message: 'Invalid tour data', errors: error.errors });
      }
      console.error('Error updating tour:', error);
      res.status(500).json({ message: 'Failed to update tour' });
    }
  });
  
  // Delete a tour (admin only)
  app.delete('/api/admin/tours/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid tour ID' });
      }
      
      // Check if tour exists
      const tour = await storage.getTour(id);
      if (!tour) {
        return res.status(404).json({ message: 'Tour not found' });
      }
      
      await storage.deleteTour(id);
      res.status(200).json({ message: 'Tour deleted successfully' });
    } catch (error) {
      console.error('Error deleting tour:', error);
      res.status(500).json({ message: 'Failed to delete tour' });
    }
  });
  
  // ========================
  // ADMIN HOTEL ROUTES
  // ========================
  
  // =========================
  // HOTEL FACILITIES ROUTES
  // =========================
  
  // Get all hotel facilities (admin only)
  app.get('/api/admin/hotel-facilities', isAdmin, async (req, res) => {
    try {
      const facilities = await storage.listHotelFacilities();
      res.json(facilities);
    } catch (error) {
      console.error('Error fetching hotel facilities:', error);
      res.status(500).json({ message: 'Failed to fetch hotel facilities' });
    }
  });
  
  // Get hotel facility by ID (admin only)
  app.get('/api/admin/hotel-facilities/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid facility ID' });
      }
      
      const facility = await storage.getHotelFacility(id);
      if (!facility) {
        return res.status(404).json({ message: 'Facility not found' });
      }
      
      res.json(facility);
    } catch (error) {
      console.error('Error fetching hotel facility:', error);
      res.status(500).json({ message: 'Failed to fetch hotel facility' });
    }
  });
  
  // Create a new hotel facility (admin only)
  app.post('/api/admin/hotel-facilities', isAdmin, async (req, res) => {
    try {
      const facilityData = req.body;
      const newFacility = await storage.createHotelFacility(facilityData);
      res.status(201).json(newFacility);
    } catch (error) {
      console.error('Error creating hotel facility:', error);
      res.status(500).json({ message: 'Failed to create hotel facility' });
    }
  });
  
  // Update a hotel facility (admin only)
  app.put('/api/admin/hotel-facilities/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid facility ID' });
      }
      
      // Check if facility exists
      const facility = await storage.getHotelFacility(id);
      if (!facility) {
        return res.status(404).json({ message: 'Facility not found' });
      }
      
      const facilityData = req.body;
      const updatedFacility = await storage.updateHotelFacility(id, facilityData);
      res.json(updatedFacility);
    } catch (error) {
      console.error('Error updating hotel facility:', error);
      res.status(500).json({ message: 'Failed to update hotel facility' });
    }
  });
  
  // Delete a hotel facility (admin only)
  app.delete('/api/admin/hotel-facilities/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid facility ID' });
      }
      
      // Check if facility exists
      const facility = await storage.getHotelFacility(id);
      if (!facility) {
        return res.status(404).json({ message: 'Facility not found' });
      }
      
      await storage.deleteHotelFacility(id);
      res.status(200).json({ message: 'Facility deleted successfully' });
    } catch (error) {
      console.error('Error deleting hotel facility:', error);
      res.status(500).json({ message: 'Failed to delete hotel facility' });
    }
  });
  
  // =========================
  // HOTEL HIGHLIGHTS ROUTES
  // =========================
  
  // Get all hotel highlights (admin only)
  app.get('/api/admin/hotel-highlights', isAdmin, async (req, res) => {
    try {
      const highlights = await storage.listHotelHighlights();
      res.json(highlights);
    } catch (error) {
      console.error('Error fetching hotel highlights:', error);
      res.status(500).json({ message: 'Failed to fetch hotel highlights' });
    }
  });
  
  // Get hotel highlight by ID (admin only)
  app.get('/api/admin/hotel-highlights/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid highlight ID' });
      }
      
      const highlight = await storage.getHotelHighlight(id);
      if (!highlight) {
        return res.status(404).json({ message: 'Highlight not found' });
      }
      
      res.json(highlight);
    } catch (error) {
      console.error('Error fetching hotel highlight:', error);
      res.status(500).json({ message: 'Failed to fetch hotel highlight' });
    }
  });
  
  // Create a new hotel highlight (admin only)
  app.post('/api/admin/hotel-highlights', isAdmin, async (req, res) => {
    try {
      const highlightData = req.body;
      const newHighlight = await storage.createHotelHighlight(highlightData);
      res.status(201).json(newHighlight);
    } catch (error) {
      console.error('Error creating hotel highlight:', error);
      res.status(500).json({ message: 'Failed to create hotel highlight' });
    }
  });
  
  // Update a hotel highlight (admin only)
  app.put('/api/admin/hotel-highlights/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid highlight ID' });
      }
      
      // Check if highlight exists
      const highlight = await storage.getHotelHighlight(id);
      if (!highlight) {
        return res.status(404).json({ message: 'Highlight not found' });
      }
      
      const highlightData = req.body;
      const updatedHighlight = await storage.updateHotelHighlight(id, highlightData);
      res.json(updatedHighlight);
    } catch (error) {
      console.error('Error updating hotel highlight:', error);
      res.status(500).json({ message: 'Failed to update hotel highlight' });
    }
  });
  
  // Delete a hotel highlight (admin only)
  app.delete('/api/admin/hotel-highlights/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid highlight ID' });
      }
      
      // Check if highlight exists
      const highlight = await storage.getHotelHighlight(id);
      if (!highlight) {
        return res.status(404).json({ message: 'Highlight not found' });
      }
      
      await storage.deleteHotelHighlight(id);
      res.status(200).json({ message: 'Highlight deleted successfully' });
    } catch (error) {
      console.error('Error deleting hotel highlight:', error);
      res.status(500).json({ message: 'Failed to delete hotel highlight' });
    }
  });
  
  // ===============================
  // CLEANLINESS FEATURES ROUTES
  // ===============================
  
  // Get all cleanliness features (admin only)
  app.get('/api/admin/cleanliness-features', isAdmin, async (req, res) => {
    try {
      const features = await storage.listCleanlinessFeatures();
      res.json(features);
    } catch (error) {
      console.error('Error fetching cleanliness features:', error);
      res.status(500).json({ message: 'Failed to fetch cleanliness features' });
    }
  });
  
  // Get cleanliness feature by ID (admin only)
  app.get('/api/admin/cleanliness-features/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid feature ID' });
      }
      
      const feature = await storage.getCleanlinessFeature(id);
      if (!feature) {
        return res.status(404).json({ message: 'Feature not found' });
      }
      
      res.json(feature);
    } catch (error) {
      console.error('Error fetching cleanliness feature:', error);
      res.status(500).json({ message: 'Failed to fetch cleanliness feature' });
    }
  });
  
  // Create a new cleanliness feature (admin only)
  app.post('/api/admin/cleanliness-features', isAdmin, async (req, res) => {
    try {
      const featureData = req.body;
      const newFeature = await storage.createCleanlinessFeature(featureData);
      res.status(201).json(newFeature);
    } catch (error) {
      console.error('Error creating cleanliness feature:', error);
      res.status(500).json({ message: 'Failed to create cleanliness feature' });
    }
  });
  
  // Update a cleanliness feature (admin only)
  app.put('/api/admin/cleanliness-features/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid feature ID' });
      }
      
      // Check if feature exists
      const feature = await storage.getCleanlinessFeature(id);
      if (!feature) {
        return res.status(404).json({ message: 'Feature not found' });
      }
      
      const featureData = req.body;
      const updatedFeature = await storage.updateCleanlinessFeature(id, featureData);
      res.json(updatedFeature);
    } catch (error) {
      console.error('Error updating cleanliness feature:', error);
      res.status(500).json({ message: 'Failed to update cleanliness feature' });
    }
  });
  
  // Delete a cleanliness feature (admin only)
  app.delete('/api/admin/cleanliness-features/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid feature ID' });
      }
      
      // Check if feature exists
      const feature = await storage.getCleanlinessFeature(id);
      if (!feature) {
        return res.status(404).json({ message: 'Feature not found' });
      }
      
      await storage.deleteCleanlinessFeature(id);
      res.status(200).json({ message: 'Feature deleted successfully' });
    } catch (error) {
      console.error('Error deleting cleanliness feature:', error);
      res.status(500).json({ message: 'Failed to delete cleanliness feature' });
    }
  });
  
  // Get all hotels (admin only)
  app.get('/api/admin/hotels', async (req, res) => {
    try {
      // Get regular hotels
      const hotels = await storage.listHotels();
      
      // Return empty array if no hotels exist - this is normal behavior
      res.json(hotels || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      // Return empty array with a note instead of throwing error
      res.json([]);
    }
  });
  
  // Get hotel by ID (admin only)
  app.get('/api/admin/hotels/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid hotel ID' });
      }
      
      // Get hotel with all associated features
      const hotel = await storage.getHotelWithFeatures(id);
      if (!hotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }
      
      res.json(hotel);
    } catch (error) {
      console.error('Error fetching hotel:', error);
      res.status(500).json({ message: 'Failed to fetch hotel' });
    }
  });
  
  // Create a new hotel (admin only)
  app.post('/api/admin/hotels', isAdmin, async (req, res) => {
    try {
      console.log('Hotel creation request body:', req.body);
      
      // Transform the form data to match database schema
      const formData = req.body;
      console.log('Raw form data received:', JSON.stringify(formData, null, 2));
      
      // Extract features array from form data (simplified system)
      const hotelFormData = formData;
      
      console.log('=== FEATURES EXTRACTION ===');
      console.log('Raw features from form data:', hotelFormData.features);
      console.log('Features type:', typeof hotelFormData.features);
      console.log('Features is array:', Array.isArray(hotelFormData.features));
      if (Array.isArray(hotelFormData.features)) {
        console.log('Features length:', hotelFormData.features.length);
        hotelFormData.features.forEach((feature, index) => {
          console.log(`Feature ${index}:`, JSON.stringify(feature));
        });
      }
      
      // Get city and country names from IDs
      let cityName = hotelFormData.city || null;
      let countryName = hotelFormData.country || null;
      
      if (hotelFormData.cityId) {
        const cityData = await storage.getCity(parseInt(hotelFormData.cityId.toString()));
        if (cityData) {
          cityName = cityData.name;
          console.log('Fetched city name:', cityName);
        }
      }
      
      if (hotelFormData.countryId) {
        const countryData = await storage.getCountry(parseInt(hotelFormData.countryId.toString()));
        if (countryData) {
          countryName = countryData.name;
          console.log('Fetched country name:', countryName);
        }
      }
      
      // Get current user ID for created_by field
      const sessionUser = (req as any).session?.user;
      const rawUserId = sessionUser?.id || req.user?.id || null;
      const currentUserId = rawUserId ? parseInt(rawUserId.toString()) : null;
      console.log('Current user ID for created_by:', currentUserId);
      
      const transformedData = {
        name: hotelFormData.name,
        description: hotelFormData.description,
        shortDescription: hotelFormData.shortDescription,
        destinationId: hotelFormData.destinationId,
        countryId: hotelFormData.countryId ? parseInt(hotelFormData.countryId.toString()) : null,
        cityId: hotelFormData.cityId ? parseInt(hotelFormData.cityId.toString()) : null,
        categoryId: hotelFormData.categoryId ? parseInt(hotelFormData.categoryId.toString()) : null,
        address: hotelFormData.address,
        city: cityName,
        country: countryName,
        postalCode: hotelFormData.postalCode,
        phone: hotelFormData.phone,
        email: hotelFormData.email,
        website: hotelFormData.website,
        imageUrl: hotelFormData.imageUrl,
        galleryUrls: hotelFormData.galleryUrls,
        stars: hotelFormData.stars ? parseInt(hotelFormData.stars.toString()) : null,
        amenities: hotelFormData.amenities,
        checkInTime: hotelFormData.checkInTime || "15:00",
        checkOutTime: hotelFormData.checkOutTime || "11:00",
        longitude: hotelFormData.longitude,
        latitude: hotelFormData.latitude,
        featured: hotelFormData.featured || false,
        rating: hotelFormData.rating ? parseFloat(hotelFormData.rating) : null,
        guestRating: hotelFormData.guestRating ? parseFloat(hotelFormData.guestRating) : null,
        basePrice: hotelFormData.basePrice ? parseInt(hotelFormData.basePrice.toString()) : null,
        currency: hotelFormData.currency || "EGP",
        parkingAvailable: hotelFormData.parkingAvailable || false,
        airportTransferAvailable: hotelFormData.airportTransferAvailable || false,
        carRentalAvailable: hotelFormData.carRentalAvailable || false,
        shuttleAvailable: hotelFormData.shuttleAvailable || false,
        wifiAvailable: hotelFormData.wifiAvailable !== false,
        petFriendly: hotelFormData.petFriendly || false,
        accessibleFacilities: hotelFormData.accessibleFacilities || false,
        status: hotelFormData.status || "active",
        verificationStatus: hotelFormData.verificationStatus || "pending",
        createdBy: currentUserId,
        // Add complex data fields (direct pass-through for proper JSON handling)
        restaurants: hotelFormData.restaurants || null,
        landmarks: hotelFormData.landmarks || null,
        faqs: hotelFormData.faqs || null,
        roomTypes: hotelFormData.roomTypes || null,
        // Add features array (simplified system)
        features: hotelFormData.features || []
      };
      
      console.log('Transformed hotel data:', transformedData);
      
      // For regular hotel creation, proceed with validation
      const validatedHotelData = insertHotelSchema.parse(transformedData);
      console.log('Validated hotel data:', validatedHotelData);
      
      // Check if destination exists if destinationId is provided
      if (validatedHotelData.destinationId) {
        const destination = await storage.getDestination(validatedHotelData.destinationId);
        if (!destination) {
          return res.status(400).json({ message: 'Invalid destination ID' });
        }
      }
      
      // Create the hotel first
      console.log('=== CALLING STORAGE.CREATEHOTEL ===');
      console.log('Features being passed to storage:', JSON.stringify(validatedHotelData.features, null, 2));
      const newHotel = await storage.createHotel(validatedHotelData);
      console.log('Hotel created successfully:', newHotel);
      
      console.log('Hotel created with features:', newHotel.features);
      
      res.status(201).json(newHotel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Zod validation errors:', error.errors);
        return res.status(400).json({ message: 'Invalid hotel data', errors: error.errors });
      }
      
      // Enhanced error logging to identify crash causes
      console.error('Error creating hotel - Full error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message: 'Failed to create hotel', error: errorMessage });
    }
  });
  
  // Create a hotel draft (admin only)
  app.post('/api/admin/hotel-drafts', isAdmin, async (req, res) => {
    try {
      const hotelData = req.body;
      
      // For drafts, save to the hotel_drafts table without validation
      const draftData = {
        name: hotelData.name || 'Untitled Hotel',
        description: hotelData.description,
        destination_id: hotelData.destinationId,
        address: hotelData.address,
        city: hotelData.city,
        country: hotelData.country,
        postal_code: hotelData.postalCode,
        phone: hotelData.phone,
        email: hotelData.email,
        website: hotelData.website,
        image_url: hotelData.imageUrl,
        stars: hotelData.stars,
        amenities: JSON.stringify(hotelData.amenities || {}),
        check_in_time: hotelData.checkInTime,
        check_out_time: hotelData.checkOutTime,
        longitude: hotelData.longitude,
        latitude: hotelData.latitude,
        featured: hotelData.featured || false,
        rating: hotelData.rating,
        guest_rating: hotelData.guestRating,
        parking_available: hotelData.parkingAvailable || false,
        airport_transfer_available: hotelData.airportTransferAvailable || false,
        car_rental_available: hotelData.carRentalAvailable || false,
        shuttle_available: hotelData.shuttleAvailable || false,
        draft_data: JSON.stringify(hotelData), // Store the complete form data as JSON
        status: 'draft'
      };

      // Save as draft hotel using storage interface
      const draftHotel = await storage.createHotel({
        name: hotelData.name,
        description: hotelData.description,
        destinationId: hotelData.destinationId,
        status: 'draft'
      });
      
      return res.status(201).json({ message: 'Hotel draft saved successfully', hotel: draftHotel });
    } catch (error) {
      console.error('Error saving hotel draft:', error);
      res.status(500).json({ message: 'Failed to save hotel draft' });
    }
  });
  
  // Update a hotel (admin only) - Support both PUT and PATCH
  app.put('/api/admin/hotels/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid hotel ID' });
      }
      
      // Verify hotel exists
      const existingHotel = await storage.getHotel(id);
      if (!existingHotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }
      
      console.log('Hotel update request for ID:', id);
      console.log('Update data received:', req.body);
      
      // Extract feature data
      const { facilityIds, highlightIds, cleanlinessFeatureIds, ...hotelData } = req.body;
      
      // Validate the update data (excluding feature arrays)
      const updateData = insertHotelSchema.partial().parse(hotelData);
      
      // Check if destination exists if destinationId is provided
      if (updateData.destinationId) {
        const destination = await storage.getDestination(updateData.destinationId);
        if (!destination) {
          return res.status(400).json({ message: 'Invalid destination ID' });
        }
      }
      
      // Update hotel basic data
      const updatedHotel = await storage.updateHotel(id, updateData);
      
      // Update hotel features if provided
      if (facilityIds !== undefined) {
        console.log('Updating hotel facilities:', facilityIds);
        await storage.updateHotelFeatureAssociations(id, 'facilities', facilityIds);
      }
      
      if (highlightIds !== undefined) {
        console.log('Updating hotel highlights:', highlightIds);
        await storage.updateHotelFeatureAssociations(id, 'highlights', highlightIds);
      }
      
      if (cleanlinessFeatureIds !== undefined) {
        console.log('Updating hotel cleanliness features:', cleanlinessFeatureIds);
        await storage.updateHotelFeatureAssociations(id, 'cleanlinessFeatures', cleanlinessFeatureIds);
      }
      
      // Return updated hotel with features
      const hotelWithFeatures = await storage.getHotelWithFeatures(id);
      res.json(hotelWithFeatures || updatedHotel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid hotel data', errors: error.errors });
      }
      console.error('Error updating hotel:', error);
      res.status(500).json({ message: 'Failed to update hotel' });
    }
  });

  app.patch('/api/admin/hotels/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid hotel ID' });
      }
      
      // Verify hotel exists
      const existingHotel = await storage.getHotel(id);
      if (!existingHotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }
      
      console.log('Hotel update request for ID:', id);
      console.log('Update data received:', req.body);
      
      // Extract feature data
      const { facilities, highlights, cleanlinessFeatures, ...hotelData } = req.body;
      
      // Validate the update data (excluding feature arrays)
      const updateData = insertHotelSchema.partial().parse(hotelData);
      
      // Check if destination exists if destinationId is provided
      if (updateData.destinationId) {
        const destination = await storage.getDestination(updateData.destinationId);
        if (!destination) {
          return res.status(400).json({ message: 'Invalid destination ID' });
        }
      }
      
      // Update hotel basic data
      const updatedHotel = await storage.updateHotel(id, updateData);
      
      // Update hotel features if provided
      if (facilities !== undefined) {
        console.log('Updating hotel facilities:', facilities);
        await storage.updateHotelFeatureAssociations(id, 'facilities', facilities);
      }
      
      if (highlights !== undefined) {
        console.log('Updating hotel highlights:', highlights);
        await storage.updateHotelFeatureAssociations(id, 'highlights', highlights);
      }
      
      if (cleanlinessFeatures !== undefined) {
        console.log('Updating hotel cleanliness features:', cleanlinessFeatures);
        await storage.updateHotelFeatureAssociations(id, 'cleanlinessFeatures', cleanlinessFeatures);
      }
      
      // Return updated hotel with features
      const hotelWithFeatures = await storage.getHotelWithFeatures(id);
      res.json(hotelWithFeatures || updatedHotel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid hotel data', errors: error.errors });
      }
      console.error('Error updating hotel:', error);
      res.status(500).json({ message: 'Failed to update hotel' });
    }
  });
  
  // Delete a hotel (admin only)
  app.delete('/api/admin/hotels/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid hotel ID' });
      }
      
      // Check if hotel exists
      const hotel = await storage.getHotel(id);
      if (!hotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }
      
      await storage.deleteHotel(id);
      res.status(200).json({ message: 'Hotel deleted successfully' });
    } catch (error) {
      console.error('Error deleting hotel:', error);
      res.status(500).json({ message: 'Failed to delete hotel' });
    }
  });
  
  // ========================
  // ADMIN ROOM ROUTES
  // ========================
  
  // Get all rooms (admin only)
  app.get('/api/admin/rooms', isAdmin, async (req, res) => {
    try {
      console.log('Admin rooms endpoint called');
      const rooms = await storage.listRooms();
      console.log('Rooms returned from storage:', rooms.length, 'rooms');
      res.json(rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      res.status(500).json({ message: 'Failed to fetch rooms' });
    }
  });
  
  // Get room by ID (admin only)
  app.get('/api/admin/rooms/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid room ID' });
      }
      
      const room = await storage.getRoom(id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      res.json(room);
    } catch (error) {
      console.error('Error fetching room:', error);
      res.status(500).json({ message: 'Failed to fetch room' });
    }
  });
  
  // Create a new room (admin only)
  app.post('/api/admin/rooms', isAdmin, async (req, res) => {
    try {
      const roomData = insertRoomSchema.parse(req.body);
      
      // Check if hotel exists
      const hotel = await storage.getHotel(roomData.hotelId);
      if (!hotel) {
        return res.status(400).json({ message: 'Invalid hotel ID' });
      }
      
      const newRoom = await storage.createRoom(roomData);
      res.status(201).json(newRoom);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid room data', errors: error.errors });
      }
      console.error('Error creating room:', error);
      res.status(500).json({ message: 'Failed to create room' });
    }
  });
  
  // Update a room (admin only)
  app.put('/api/admin/rooms/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid room ID' });
      }
      
      // Verify room exists
      const existingRoom = await storage.getRoom(id);
      if (!existingRoom) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      // Validate the update data
      const updateData = insertRoomSchema.parse(req.body);
      
      // Check if hotel exists if hotelId is provided
      if (updateData.hotelId) {
        const hotel = await storage.getHotel(updateData.hotelId);
        if (!hotel) {
          return res.status(400).json({ message: 'Invalid hotel ID' });
        }
      }
      
      // Perform the update
      const updatedRoom = await storage.updateRoom(id, updateData);
      res.json(updatedRoom);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid room data', errors: error.errors });
      }
      console.error('Error updating room:', error);
      res.status(500).json({ message: 'Failed to update room' });
    }
  });
  
  // Delete a room (admin only)
  app.delete('/api/admin/rooms/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid room ID' });
      }
      
      // Check if room exists
      const room = await storage.getRoom(id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      await storage.deleteRoom(id);
      res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
      console.error('Error deleting room:', error);
      res.status(500).json({ message: 'Failed to delete room' });
    }
  });
  
  // ========================
  // ROOM CATEGORIES ROUTES
  // ========================
  
  // Get all room categories (admin only)
  app.get('/api/admin/room-categories', isAdmin, async (req, res) => {
    try {
      const categories = await storage.listRoomCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching room categories:', error);
      res.status(500).json({ message: 'Failed to fetch room categories' });
    }
  });
  
  // Get room category by ID (admin only)
  app.get('/api/admin/room-categories/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid room category ID' });
      }
      
      const category = await storage.getRoomCategory(id);
      if (!category) {
        return res.status(404).json({ message: 'Room category not found' });
      }
      
      res.json(category);
    } catch (error) {
      console.error('Error fetching room category:', error);
      res.status(500).json({ message: 'Failed to fetch room category' });
    }
  });
  
  // Create a new room category (admin only)
  app.post('/api/admin/room-categories', isAdmin, async (req, res) => {
    try {
      const categoryData = req.body;
      const category = await storage.createRoomCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating room category:', error);
      res.status(500).json({ message: 'Failed to create room category' });
    }
  });
  
  // Update a room category (admin only)
  app.put('/api/admin/room-categories/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid room category ID' });
      }
      
      // Verify category exists
      const existingCategory = await storage.getRoomCategory(id);
      if (!existingCategory) {
        return res.status(404).json({ message: 'Room category not found' });
      }
      
      const updateData = req.body;
      const updatedCategory = await storage.updateRoomCategory(id, updateData);
      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating room category:', error);
      res.status(500).json({ message: 'Failed to update room category' });
    }
  });
  
  // Delete a room category (admin only)
  app.delete('/api/admin/room-categories/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid room category ID' });
      }
      
      // Check if category exists
      const category = await storage.getRoomCategory(id);
      if (!category) {
        return res.status(404).json({ message: 'Room category not found' });
      }
      
      // TODO: Check if there are rooms associated with this category
      // and prevent deletion if there are
      
      await storage.deleteRoomCategory(id);
      res.status(200).json({ message: 'Room category deleted successfully' });
    } catch (error) {
      console.error('Error deleting room category:', error);
      res.status(500).json({ message: 'Failed to delete room category' });
    }
  });
  
  // ========================
  // ROOM COMBINATIONS ROUTES
  // ========================
  
  // Get all room combinations for a specific room
  app.get('/api/rooms/:roomId/combinations', async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      if (isNaN(roomId)) {
        return res.status(400).json({ message: 'Invalid room ID' });
      }
      
      // Check if room exists
      const room = await storage.getRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      const combinations = await storage.getRoomCombinationsByRoom(roomId);
      res.json(combinations);
    } catch (error) {
      console.error('Error fetching room combinations:', error);
      res.status(500).json({ message: 'Failed to fetch room combinations' });
    }
  });
  
  // Get a specific room combination
  app.get('/api/room-combinations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid combination ID' });
      }
      
      const combination = await storage.getRoomCombination(id);
      if (!combination) {
        return res.status(404).json({ message: 'Room combination not found' });
      }
      
      res.json(combination);
    } catch (error) {
      console.error('Error fetching room combination:', error);
      res.status(500).json({ message: 'Failed to fetch room combination' });
    }
  });
  
  // ========================
  // ADMIN ROOM COMBINATIONS ROUTES
  // ========================
  
  // Create a new room combination (admin only)
  app.post('/api/admin/room-combinations', isAdmin, async (req, res) => {
    try {
      const combinationData = insertRoomCombinationSchema.parse(req.body);
      
      // Check if room exists
      const room = await storage.getRoom(combinationData.roomId);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      
      // Auto-generate description if not provided
      if (!combinationData.description) {
        const parts = [];
        if ((combinationData.adultsCount ?? 0) > 0) {
          parts.push(`${combinationData.adultsCount} Adult${(combinationData.adultsCount ?? 0) !== 1 ? 's' : ''}`);
        }
        if ((combinationData.childrenCount ?? 0) > 0) {
          parts.push(`${combinationData.childrenCount} Child${(combinationData.childrenCount ?? 0) !== 1 ? 'ren' : ''}`);
        }
        if ((combinationData.infantsCount ?? 0) > 0) {
          parts.push(`${combinationData.infantsCount} Infant${(combinationData.infantsCount ?? 0) !== 1 ? 's' : ''}`);
        }
        combinationData.description = parts.join(' + ');
      }
      
      // Check if this combination already exists for the room
      const existingCombinations = await storage.getRoomCombinationsByRoom(combinationData.roomId);
      const exists = existingCombinations.some(
        combo => 
          combo.adultsCount === combinationData.adultsCount && 
          combo.childrenCount === combinationData.childrenCount && 
          combo.infantsCount === combinationData.infantsCount
      );
      
      if (exists) {
        return res.status(400).json({ message: 'This room combination already exists' });
      }
      
      const newCombination = await storage.createRoomCombination(combinationData);
      res.status(201).json(newCombination);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid room combination data', errors: error.errors });
      }
      console.error('Error creating room combination:', error);
      res.status(500).json({ message: 'Failed to create room combination' });
    }
  });
  
  // Update a room combination (admin only)
  app.put('/api/admin/room-combinations/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid combination ID' });
      }
      
      // Check if combination exists
      const combination = await storage.getRoomCombination(id);
      if (!combination) {
        return res.status(404).json({ message: 'Room combination not found' });
      }
      
      const updateData = req.body;
      
      // Auto-generate description if adults, children, or infants count changed and description is empty
      if ((updateData.adultsCount !== undefined || 
           updateData.childrenCount !== undefined || 
           updateData.infantsCount !== undefined) && 
          !updateData.description) {
        
        const adultsCount = updateData.adultsCount ?? combination.adultsCount;
        const childrenCount = updateData.childrenCount ?? combination.childrenCount;
        const infantsCount = updateData.infantsCount ?? combination.infantsCount;
        
        const parts = [];
        if (adultsCount > 0) {
          parts.push(`${adultsCount} Adult${adultsCount !== 1 ? 's' : ''}`);
        }
        if (childrenCount > 0) {
          parts.push(`${childrenCount} Child${childrenCount !== 1 ? 'ren' : ''}`);
        }
        if (infantsCount > 0) {
          parts.push(`${infantsCount} Infant${infantsCount !== 1 ? 's' : ''}`);
        }
        
        updateData.description = parts.join(' + ');
      }
      
      const updatedCombination = await storage.updateRoomCombination(id, updateData);
      res.json(updatedCombination);
    } catch (error) {
      console.error('Error updating room combination:', error);
      res.status(500).json({ message: 'Failed to update room combination' });
    }
  });
  
  // Delete a room combination (admin only)
  app.delete('/api/admin/room-combinations/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid combination ID' });
      }
      
      // Check if combination exists
      const combination = await storage.getRoomCombination(id);
      if (!combination) {
        return res.status(404).json({ message: 'Room combination not found' });
      }
      
      await storage.deleteRoomCombination(id);
      res.status(200).json({ message: 'Room combination deleted successfully' });
    } catch (error) {
      console.error('Error deleting room combination:', error);
      res.status(500).json({ message: 'Failed to delete room combination' });
    }
  });
  
  // ========================
  // ADMIN COUNTRY ROUTES
  // ========================
  
  // Get all countries (admin only)
  app.get('/api/admin/countries', isAdmin, async (req, res) => {
    try {
      // Admin can see all countries, including inactive ones
      const countries = await storage.listCountries();
      res.json(countries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      res.status(500).json({ message: 'Failed to fetch countries' });
    }
  });
  
  // Get country by ID (admin only)
  app.get('/api/admin/countries/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid country ID' });
      }
      
      const country = await storage.getCountry(id);
      if (!country) {
        return res.status(404).json({ message: 'Country not found' });
      }
      
      res.json(country);
    } catch (error) {
      console.error('Error fetching country:', error);
      res.status(500).json({ message: 'Failed to fetch country' });
    }
  });
  
  // Create a new country (admin only)
  app.post('/api/admin/countries', isAdmin, async (req, res) => {
    try {
      // Validate country data
      const countryData = insertCountrySchema.parse(req.body);
      
      // Check if country code already exists
      if (countryData.code) {
        const existingCountry = await storage.getCountryByCode(countryData.code);
        if (existingCountry) {
          return res.status(409).json({ message: 'Country with this code already exists' });
        }
      }
      
      const country = await storage.createCountry(countryData);
      res.status(201).json(country);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid country data', errors: error.errors });
      }
      console.error('Error creating country:', error);
      res.status(500).json({ message: 'Failed to create country' });
    }
  });
  
  // Update a country (admin only)
  app.put('/api/admin/countries/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid country ID' });
      }
      
      // Verify country exists
      const existingCountry = await storage.getCountry(id);
      if (!existingCountry) {
        return res.status(404).json({ message: 'Country not found' });
      }
      
      // Validate the update data
      const updateData = insertCountrySchema.parse(req.body);
      
      // Check if the new code already exists (if code is being updated)
      if (updateData.code && updateData.code !== existingCountry.code) {
        const countryWithCode = await storage.getCountryByCode(updateData.code);
        if (countryWithCode && countryWithCode.id !== id) {
          return res.status(409).json({ message: 'Country with this code already exists' });
        }
      }
      
      const updatedCountry = await storage.updateCountry(id, updateData);
      res.json(updatedCountry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid country data', errors: error.errors });
      }
      console.error('Error updating country:', error);
      res.status(500).json({ message: 'Failed to update country' });
    }
  });
  
  // Delete a country (admin only)
  app.delete('/api/admin/countries/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid country ID' });
      }
      
      // Check if country exists
      const country = await storage.getCountry(id);
      if (!country) {
        return res.status(404).json({ message: 'Country not found' });
      }
      
      // Check if there are cities associated with this country
      const cities = await storage.getCitiesByCountry(id);
      if (cities && cities.length > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete country with associated cities. Please delete the cities first or reassign them to another country.' 
        });
      }
      
      await storage.deleteCountry(id);
      res.status(200).json({ message: 'Country deleted successfully' });
    } catch (error) {
      console.error('Error deleting country:', error);
      res.status(500).json({ message: 'Failed to delete country' });
    }
  });
  
  // ========================
  // ADMIN CITY ROUTES
  // ========================
  
  // Get all cities (admin only)
  app.get('/api/admin/cities', isAdmin, async (req, res) => {
    try {
      // Admin can see all cities, including inactive ones
      const cities = await storage.listCities();
      res.json(cities);
    } catch (error) {
      console.error('Error fetching cities:', error);
      res.status(500).json({ message: 'Failed to fetch cities' });
    }
  });
  
  // Get city by ID (admin only)
  app.get('/api/admin/cities/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid city ID' });
      }
      
      const city = await storage.getCity(id);
      if (!city) {
        return res.status(404).json({ message: 'City not found' });
      }
      
      res.json(city);
    } catch (error) {
      console.error('Error fetching city:', error);
      res.status(500).json({ message: 'Failed to fetch city' });
    }
  });
  
  // Create a new city (admin only)
  app.post('/api/admin/cities', isAdmin, async (req, res) => {
    try {
      // Validate city data
      const cityData = insertCitySchema.parse(req.body);
      
      // Check if country exists
      const country = await storage.getCountry(cityData.countryId);
      if (!country) {
        return res.status(400).json({ message: 'Invalid country ID' });
      }
      
      const city = await storage.createCity(cityData);
      res.status(201).json(city);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid city data', errors: error.errors });
      }
      console.error('Error creating city:', error);
      res.status(500).json({ message: 'Failed to create city' });
    }
  });
  
  // Update a city (admin only)
  app.put('/api/admin/cities/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid city ID' });
      }
      
      // Verify city exists
      const existingCity = await storage.getCity(id);
      if (!existingCity) {
        return res.status(404).json({ message: 'City not found' });
      }
      
      // Validate the update data
      const updateData = insertCitySchema.parse(req.body);
      
      // Check if country exists if countryId is provided
      if (updateData.countryId) {
        const country = await storage.getCountry(updateData.countryId);
        if (!country) {
          return res.status(400).json({ message: 'Invalid country ID' });
        }
      }
      
      const updatedCity = await storage.updateCity(id, updateData);
      res.json(updatedCity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid city data', errors: error.errors });
      }
      console.error('Error updating city:', error);
      res.status(500).json({ message: 'Failed to update city' });
    }
  });
  
  // Delete a city (admin only)
  app.delete('/api/admin/cities/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid city ID' });
      }
      
      // Check if city exists
      const city = await storage.getCity(id);
      if (!city) {
        return res.status(404).json({ message: 'City not found' });
      }
      
      await storage.deleteCity(id);
      res.status(200).json({ message: 'City deleted successfully' });
    } catch (error) {
      console.error('Error deleting city:', error);
      res.status(500).json({ message: 'Failed to delete city' });
    }
  });
  
  // AIRPORT ADMIN ROUTES
  
  // Get all airports (admin)
  app.get('/api/admin/airports', isAdmin, async (req, res) => {
    try {
      const airports = await storage.listAirports();
      res.json(airports);
    } catch (error) {
      console.error('Error fetching airports for admin:', error);
      res.status(500).json({ message: 'Failed to fetch airports' });
    }
  });
  
  // Get airport by ID (admin)
  app.get('/api/admin/airports/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid airport ID' });
      }
      
      const airport = await storage.getAirport(id);
      if (!airport) {
        return res.status(404).json({ message: 'Airport not found' });
      }
      
      res.json(airport);
    } catch (error) {
      console.error('Error fetching airport for admin:', error);
      res.status(500).json({ message: 'Failed to fetch airport' });
    }
  });
  
  // Create airport (admin)
  app.post('/api/admin/airports', isAdmin, async (req, res) => {
    try {
      const validatedData = insertAirportSchema.parse(req.body);
      
      const airport = await storage.createAirport(validatedData);
      res.status(201).json(airport);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      console.error('Error creating airport:', error);
      res.status(500).json({ message: 'Failed to create airport' });
    }
  });
  
  // Update airport (admin)
  app.put('/api/admin/airports/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid airport ID' });
      }
      
      // We use safeParse to allow partial updates
      const validationResult = insertAirportSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: validationResult.error.errors 
        });
      }
      
      const updatedAirport = await storage.updateAirport(id, validationResult.data);
      if (!updatedAirport) {
        return res.status(404).json({ message: 'Airport not found' });
      }
      
      res.json(updatedAirport);
    } catch (error) {
      console.error('Error updating airport:', error);
      res.status(500).json({ message: 'Failed to update airport' });
    }
  });
  
  // Delete airport (admin)
  app.delete('/api/admin/airports/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid airport ID' });
      }
      
      // Check if airport exists
      const airport = await storage.getAirport(id);
      if (!airport) {
        return res.status(404).json({ message: 'Airport not found' });
      }
      
      await storage.deleteAirport(id);
      res.status(200).json({ message: 'Airport deleted successfully' });
    } catch (error) {
      console.error('Error deleting airport:', error);
      res.status(500).json({ message: 'Failed to delete airport' });
    }
  });

  // Admin transportation routes
  
  // Create transportation option (admin only)
  app.post('/api/admin/transportation', isAdmin, async (req, res) => {
    try {
      const transportationData = req.body;
      
      // Validate data
      if (!transportationData.name || !transportationData.typeId || !transportationData.price || !transportationData.passengerCapacity) {
        return res.status(400).json({ message: 'Missing required transportation fields' });
      }
      
      // If destinationId is provided, check if destination exists
      if (transportationData.destinationId) {
        const destination = await storage.getDestination(transportationData.destinationId);
        if (!destination) {
          return res.status(404).json({ message: 'Destination not found' });
        }
      }
      
      const transportation = await storage.createTransportation(transportationData);
      res.status(201).json(transportation);
    } catch (error) {
      console.error('Error creating transportation option:', error);
      res.status(500).json({ message: 'Failed to create transportation option' });
    }
  });
  
  // Update transportation option (admin only)
  app.put('/api/admin/transportation/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid transportation ID' });
      }
      
      // Check if transportation exists
      const transportation = await storage.getTransportation(id);
      if (!transportation) {
        return res.status(404).json({ message: 'Transportation option not found' });
      }
      
      // If updating destinationId, check if destination exists
      if (req.body.destinationId && req.body.destinationId !== transportation.destinationId) {
        const destination = await storage.getDestination(req.body.destinationId);
        if (!destination) {
          return res.status(404).json({ message: 'Destination not found' });
        }
      }
      
      const updatedTransportation = await storage.updateTransportation(id, req.body);
      res.json(updatedTransportation);
    } catch (error) {
      console.error('Error updating transportation option:', error);
      res.status(500).json({ message: 'Failed to update transportation option' });
    }
  });
  
  // Delete transportation option (admin only)
  app.delete('/api/admin/transportation/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid transportation ID' });
      }
      
      // Check if transportation exists
      const transportation = await storage.getTransportation(id);
      if (!transportation) {
        return res.status(404).json({ message: 'Transportation option not found' });
      }
      
      const deleted = await storage.deleteTransportation(id);
      if (!deleted) {
        return res.status(500).json({ message: 'Failed to delete transportation option' });
      }
      
      res.status(200).json({ message: 'Transportation option deleted successfully' });
    } catch (error) {
      console.error('Error deleting transportation option:', error);
      res.status(500).json({ message: 'Failed to delete transportation option' });
    }
  });

  // Menu Management API Routes
  
  // Get all menus
  app.get('/api/admin/menus', isAdmin, async (req, res) => {
    try {
      const active = req.query.active === 'true' ? true : 
                    req.query.active === 'false' ? false : undefined;
      const menus = await storage.listMenus(active);
      res.json(menus);
    } catch (error) {
      console.error('Error fetching menus:', error);
      res.status(500).json({ message: 'Failed to fetch menus' });
    }
  });
  
  // Get a menu by ID
  app.get('/api/admin/menus/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid menu ID' });
      }
      
      const menu = await storage.getMenu(id);
      if (!menu) {
        return res.status(404).json({ message: 'Menu not found' });
      }
      
      res.json(menu);
    } catch (error) {
      console.error('Error fetching menu:', error);
      res.status(500).json({ message: 'Failed to fetch menu' });
    }
  });
  
  // Get a menu by location
  app.get('/api/menus/location/:location', async (req, res) => {
    try {
      const location = req.params.location;
      if (!location) {
        return res.status(400).json({ message: 'Location parameter is required' });
      }
      
      const menu = await storage.getMenuByLocation(location);
      if (!menu) {
        return res.status(404).json({ message: 'Menu not found for this location' });
      }
      
      // Get menu items for this menu
      const menuItems = await storage.listMenuItems(menu.id, true);
      
      // Return menu with its items
      res.json({
        menu,
        items: menuItems
      });
    } catch (error) {
      console.error('Error fetching menu by location:', error);
      res.status(500).json({ message: 'Failed to fetch menu by location' });
    }
  });

  // Get all menus (public endpoint for navigation manager)
  app.get('/api/menus', async (req, res) => {
    try {
      const active = req.query.active === 'true' ? true : 
                    req.query.active === 'false' ? false : undefined;
      const menus = await storage.listMenus(active);
      res.json(menus);
    } catch (error) {
      console.error('Error fetching menus:', error);
      res.status(500).json({ message: 'Failed to fetch menus' });
    }
  });

  // Create a new menu (public endpoint for navigation manager)
  app.post('/api/menus', async (req, res) => {
    try {
      console.log('Creating menu with data:', req.body);
      
      // Validate the menu data
      const menuData = insertMenuSchema.parse(req.body);
      
      // Check if menu with this name already exists
      const existingMenu = await storage.getMenuByName(menuData.name);
      if (existingMenu) {
        return res.status(400).json({ message: 'Menu with this name already exists' });
      }
      
      // Check if menu with this location already exists
      const existingLocation = await storage.getMenuByLocation(menuData.location);
      if (existingLocation) {
        return res.status(400).json({ message: 'Menu with this location already exists' });
      }
      
      const menu = await storage.createMenu(menuData);
      console.log('Menu created successfully:', menu);
      res.status(201).json(menu);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        return res.status(400).json({ message: 'Invalid menu data', errors: error.errors });
      }
      console.error('Error creating menu:', error);
      res.status(500).json({ message: 'Failed to create menu' });
    }
  });

  // Get a specific menu by ID (public endpoint for navigation manager)
  app.get('/api/menus/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid menu ID' });
      }
      
      const menu = await storage.getMenu(id);
      if (!menu) {
        return res.status(404).json({ message: 'Menu not found' });
      }
      
      res.json(menu);
    } catch (error) {
      console.error('Error fetching menu:', error);
      res.status(500).json({ message: 'Failed to fetch menu' });
    }
  });

  // Update a menu (public endpoint for navigation manager)
  app.put('/api/menus/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid menu ID' });
      }
      
      // Verify menu exists
      const existingMenu = await storage.getMenu(id);
      if (!existingMenu) {
        return res.status(404).json({ message: 'Menu not found' });
      }
      
      // Validate the update data
      const updateData = insertMenuSchema.partial().parse(req.body);
      
      // If name is being updated, check for duplicates
      if (updateData.name && updateData.name !== existingMenu.name) {
        const menuWithName = await storage.getMenuByName(updateData.name);
        if (menuWithName && menuWithName.id !== id) {
          return res.status(400).json({ message: 'Menu with this name already exists' });
        }
      }
      
      // If location is being updated, check for duplicates
      if (updateData.location && updateData.location !== existingMenu.location) {
        const menuWithLocation = await storage.getMenuByLocation(updateData.location);
        if (menuWithLocation && menuWithLocation.id !== id) {
          return res.status(400).json({ message: 'Menu with this location already exists' });
        }
      }
      
      const updatedMenu = await storage.updateMenu(id, updateData);
      res.json(updatedMenu);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid menu data', errors: error.errors });
      }
      console.error('Error updating menu:', error);
      res.status(500).json({ message: 'Failed to update menu' });
    }
  });

  // Delete a menu (public endpoint for navigation manager)
  app.delete('/api/menus/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid menu ID' });
      }
      
      // Verify menu exists
      const existingMenu = await storage.getMenu(id);
      if (!existingMenu) {
        return res.status(404).json({ message: 'Menu not found' });
      }
      
      const success = await storage.deleteMenu(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: 'Failed to delete menu' });
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      res.status(500).json({ message: 'Failed to delete menu' });
    }
  });

  // Get menu items for a specific menu (public endpoint for navigation manager)
  app.get('/api/menu-items/:menuId', async (req, res) => {
    try {
      const menuId = parseInt(req.params.menuId);
      if (isNaN(menuId)) {
        return res.status(400).json({ message: 'Invalid menu ID' });
      }
      
      const menuItems = await storage.listMenuItems(menuId, true);
      res.json(menuItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      res.status(500).json({ message: 'Failed to fetch menu items' });
    }
  });

  // Create a new menu item (public endpoint for navigation manager)
  app.post('/api/menu-items', async (req, res) => {
    try {
      console.log('Creating menu item with data:', req.body);
      
      // Validate the menu item data
      const menuItemData = insertMenuItemSchema.parse(req.body);
      console.log('Validated menu item data:', menuItemData);
      
      // Verify the menu exists
      const menu = await storage.getMenu(menuItemData.menuId);
      if (!menu) {
        console.log('Menu not found for ID:', menuItemData.menuId);
        return res.status(404).json({ message: 'Menu not found' });
      }

      // If parentId is provided, check if parent menu item exists
      if (menuItemData.parentId) {
        const parentItem = await storage.getMenuItem(menuItemData.parentId);
        if (!parentItem) {
          return res.status(404).json({ message: 'Parent menu item not found' });
        }
        
        // Check that parent item belongs to the same menu
        if (parentItem.menu_id !== menuItemData.menuId) {
          return res.status(400).json({ message: 'Parent menu item must belong to the same menu' });
        }
      }
      
      const menuItem = await storage.createMenuItem(menuItemData);
      console.log('Menu item created successfully:', menuItem);
      res.status(201).json(menuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        return res.status(400).json({ message: 'Invalid menu item data', errors: error.errors });
      }
      console.error('Error creating menu item:', error);
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ message: 'Failed to create menu item', error: error.message });
    }
  });

  // Update a menu item (public endpoint for navigation manager)
  app.put('/api/menu-items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid menu item ID' });
      }
      
      console.log(`API PUT /api/menu-items/${id}:`, req.body);
      
      // Verify menu item exists
      const existingMenuItem = await storage.getMenuItem(id);
      if (!existingMenuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      
      // Validate the update data
      const updateData = insertMenuItemSchema.partial().parse(req.body);
      
      // If menuId is changing, check if the new menu exists
      if (updateData.menuId && updateData.menuId !== existingMenuItem.menu_id) {
        const menu = await storage.getMenu(updateData.menuId);
        if (!menu) {
          return res.status(404).json({ message: 'Menu not found' });
        }
      }
      
      // If parentId is changing, check if the new parent exists and belongs to the same menu
      if (updateData.parentId !== undefined && updateData.parentId !== existingMenuItem.parent_id) {
        if (updateData.parentId !== null) {
          // Check for circular reference
          if (updateData.parentId === id) {
            return res.status(400).json({ message: 'A menu item cannot be its own parent' });
          }
          
          const parentItem = await storage.getMenuItem(updateData.parentId);
          if (!parentItem) {
            return res.status(404).json({ message: 'Parent menu item not found' });
          }
          
          // Check that parent item belongs to the same menu
          // Use the new menuId if provided, otherwise use existing menuId from database
          const targetMenuId = updateData.menuId || existingMenuItem.menu_id;
          console.log(`Parent validation: parentItem.menu_id=${parentItem.menu_id}, targetMenuId=${targetMenuId}`);
          
          // Both parentItem and targetMenuId should be the same for validation to pass
          if (parentItem.menu_id !== targetMenuId) {
            return res.status(400).json({ message: 'Parent menu item must belong to the same menu' });
          }
        }
      }
      
      const updatedMenuItem = await storage.updateMenuItem(id, updateData);
      console.log('Response status: 200');
      console.log('API Response:', updatedMenuItem);
      res.json(updatedMenuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid menu item data', errors: error.errors });
      }
      console.error('Error updating menu item:', error);
      res.status(500).json({ message: 'Failed to update menu item' });
    }
  });

  // Delete a menu item (public endpoint for navigation manager)
  app.delete('/api/menu-items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid menu item ID' });
      }
      
      // Verify menu item exists
      const existingMenuItem = await storage.getMenuItem(id);
      if (!existingMenuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      
      const success = await storage.deleteMenuItem(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: 'Failed to delete menu item' });
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      res.status(500).json({ message: 'Failed to delete menu item' });
    }
  });
  
  // Create a new menu (admin only)
  app.post('/api/admin/menus', isAdmin, async (req, res) => {
    try {
      // Validate the menu data
      const menuData = insertMenuSchema.parse(req.body);
      
      // Check if menu with this name already exists
      const existingMenu = await storage.getMenuByName(menuData.name);
      if (existingMenu) {
        return res.status(400).json({ message: 'Menu with this name already exists' });
      }
      
      // Check if menu with this location already exists
      const existingLocation = await storage.getMenuByLocation(menuData.location);
      if (existingLocation) {
        return res.status(400).json({ message: 'Menu with this location already exists' });
      }
      
      const menu = await storage.createMenu(menuData);
      res.status(201).json(menu);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid menu data', errors: error.errors });
      }
      console.error('Error creating menu:', error);
      res.status(500).json({ message: 'Failed to create menu' });
    }
  });
  
  // Update a menu (admin only)
  app.put('/api/admin/menus/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid menu ID' });
      }
      
      // Verify menu exists
      const existingMenu = await storage.getMenu(id);
      if (!existingMenu) {
        return res.status(404).json({ message: 'Menu not found' });
      }
      
      // Validate the update data
      const updateData = insertMenuSchema.partial().parse(req.body);
      
      // If name is being updated, check for duplicates
      if (updateData.name && updateData.name !== existingMenu.name) {
        const menuWithName = await storage.getMenuByName(updateData.name);
        if (menuWithName && menuWithName.id !== id) {
          return res.status(400).json({ message: 'Menu with this name already exists' });
        }
      }
      
      // If location is being updated, check for duplicates
      if (updateData.location && updateData.location !== existingMenu.location) {
        const menuWithLocation = await storage.getMenuByLocation(updateData.location);
        if (menuWithLocation && menuWithLocation.id !== id) {
          return res.status(400).json({ message: 'Menu with this location already exists' });
        }
      }
      
      const updatedMenu = await storage.updateMenu(id, updateData);
      res.json(updatedMenu);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid menu data', errors: error.errors });
      }
      console.error('Error updating menu:', error);
      res.status(500).json({ message: 'Failed to update menu' });
    }
  });
  
  // Delete a menu (admin only)
  app.delete('/api/admin/menus/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid menu ID' });
      }
      
      // Verify menu exists
      const existingMenu = await storage.getMenu(id);
      if (!existingMenu) {
        return res.status(404).json({ message: 'Menu not found' });
      }
      
      const success = await storage.deleteMenu(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: 'Failed to delete menu' });
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      res.status(500).json({ message: 'Failed to delete menu' });
    }
  });
  
  // Menu items API routes
  
  // Get all menu items for a menu
  app.get('/api/admin/menus/:menuId/items', isAdmin, async (req, res) => {
    try {
      const menuId = parseInt(req.params.menuId);
      if (isNaN(menuId)) {
        return res.status(400).json({ message: 'Invalid menu ID' });
      }
      
      // Verify menu exists
      const menu = await storage.getMenu(menuId);
      if (!menu) {
        return res.status(404).json({ message: 'Menu not found' });
      }
      
      const active = req.query.active === 'true' ? true : 
                    req.query.active === 'false' ? false : undefined;
      
      const items = await storage.listMenuItems(menuId, active);
      res.json(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      res.status(500).json({ message: 'Failed to fetch menu items' });
    }
  });
  
  // Get a menu item by ID
  app.get('/api/admin/menu-items/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid menu item ID' });
      }
      
      const menuItem = await storage.getMenuItem(id);
      if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      
      res.json(menuItem);
    } catch (error) {
      console.error('Error fetching menu item:', error);
      res.status(500).json({ message: 'Failed to fetch menu item' });
    }
  });
  
  // Create a new menu item (admin only)
  app.post('/api/admin/menu-items', isAdmin, async (req, res) => {
    try {
      // Validate the menu item data
      const menuItemData = insertMenuItemSchema.parse(req.body);
      
      // Check if menu exists
      const menu = await storage.getMenu(menuItemData.menuId);
      if (!menu) {
        return res.status(404).json({ message: 'Menu not found' });
      }
      
      // If parentId is provided, check if parent menu item exists
      if (menuItemData.parentId) {
        const parentItem = await storage.getMenuItem(menuItemData.parentId);
        if (!parentItem) {
          return res.status(404).json({ message: 'Parent menu item not found' });
        }
        
        // Check that parent item belongs to the same menu
        if (parentItem.menuId !== menuItemData.menuId) {
          return res.status(400).json({ message: 'Parent menu item must belong to the same menu' });
        }
      }
      
      const menuItem = await storage.createMenuItem(menuItemData);
      res.status(201).json(menuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid menu item data', errors: error.errors });
      }
      console.error('Error creating menu item:', error);
      res.status(500).json({ message: 'Failed to create menu item' });
    }
  });
  
  // Update a menu item (admin only)
  app.put('/api/admin/menu-items/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid menu item ID' });
      }
      
      // Verify menu item exists
      const existingMenuItem = await storage.getMenuItem(id);
      if (!existingMenuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      
      // Validate the update data
      const updateData = insertMenuItemSchema.partial().parse(req.body);
      
      // If menuId is changing, check if the new menu exists
      if (updateData.menuId && updateData.menuId !== existingMenuItem.menuId) {
        const menu = await storage.getMenu(updateData.menuId);
        if (!menu) {
          return res.status(404).json({ message: 'Menu not found' });
        }
      }
      
      // If parentId is changing, check if the new parent exists and belongs to the same menu
      if (updateData.parentId && updateData.parentId !== existingMenuItem.parentId) {
        // Check for circular reference
        if (updateData.parentId === id) {
          return res.status(400).json({ message: 'A menu item cannot be its own parent' });
        }
        
        const parentItem = await storage.getMenuItem(updateData.parentId);
        if (!parentItem) {
          return res.status(404).json({ message: 'Parent menu item not found' });
        }
        
        // Check that parent item belongs to the same menu
        const menuId = updateData.menuId || existingMenuItem.menuId;
        if (parentItem.menuId !== menuId) {
          return res.status(400).json({ message: 'Parent menu item must belong to the same menu' });
        }
      }
      
      const updatedMenuItem = await storage.updateMenuItem(id, updateData);
      res.json(updatedMenuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid menu item data', errors: error.errors });
      }
      console.error('Error updating menu item:', error);
      res.status(500).json({ message: 'Failed to update menu item' });
    }
  });
  
  // Delete a menu item (admin only)
  app.delete('/api/admin/menu-items/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid menu item ID' });
      }
      
      // Verify menu item exists
      const existingMenuItem = await storage.getMenuItem(id);
      if (!existingMenuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }
      
      const success = await storage.deleteMenuItem(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: 'Failed to delete menu item' });
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      res.status(500).json({ message: 'Failed to delete menu item' });
    }
  });

  // Public Menu API Routes (for frontend components)
  
  // Get all menus (public API)
  app.get('/api/menus', async (req, res) => {
    try {
      console.log('🔥 MENU API CALLED - Request received at /api/menus');
      const active = req.query.active === 'true' ? true : 
                    req.query.active === 'false' ? false : undefined;
      console.log('🔥 Active filter:', active);
      
      const menus = await storage.listMenus(active);
      console.log('🔥 Storage returned:', menus.length, 'menus');
      console.log('🔥 Menu data:', JSON.stringify(menus, null, 2));
      
      res.json(menus);
    } catch (error) {
      console.error('❌ Error fetching menus:', error);
      res.status(500).json({ message: 'Failed to fetch menus' });
    }
  });
  
  // Get a menu by location
  app.get('/api/menus/location/:location', async (req, res) => {
    try {
      const location = req.params.location;
      if (!location) {
        return res.status(400).json({ message: 'Location parameter is required' });
      }
      
      const menu = await storage.getMenuByLocation(location);
      if (!menu) {
        return res.status(404).json({ message: 'Menu not found for this location' });
      }
      
      // Get menu items for this menu
      const menuItems = await storage.listMenuItems(menu.id, true);
      
      // Return menu with its items
      res.json({
        menu,
        items: menuItems
      });
    } catch (error) {
      console.error('Error fetching menu by location:', error);
      res.status(500).json({ message: 'Failed to fetch menu' });
    }
  });

  // Google Maps API key endpoint
  app.get('/api/maps-key', (req, res) => {
    res.json({ key: process.env.GOOGLE_MAPS_API_KEY || '' });
  });
  
  // Translation API Routes
  
  // Get site language settings
  app.get('/api/translations/settings', async (req, res) => {
    try {
      const settings = await storage.getSiteLanguageSettings();
      if (!settings) {
        // Return default settings if none exists
        return res.json({
          defaultLanguage: 'en',
          availableLanguages: ['en', 'ar'],
          rtlLanguages: ['ar'],
        });
      }
      res.json(settings);
    } catch (error) {
      console.error('Error fetching language settings:', error);
      res.status(500).json({ message: 'Failed to fetch language settings' });
    }
  });
  
  // Dictionary API Routes
  
  // Get all dictionary entries
  app.get('/api/dictionary', async (req, res) => {
    try {
      const entries = await storage.listDictionaryEntries();
      res.json(entries);
    } catch (error) {
      console.error('Error fetching dictionary entries:', error);
      res.status(500).json({ message: 'Failed to fetch dictionary entries' });
    }
  });
  
  // Search dictionary entries
  app.get('/api/dictionary/search', async (req, res) => {
    try {
      const { term } = req.query;
      if (!term || typeof term !== 'string') {
        return res.status(400).json({ message: 'Search term is required' });
      }
      
      const entries = await storage.searchDictionaryEntries(term);
      res.json(entries);
    } catch (error) {
      console.error('Error searching dictionary entries:', error);
      res.status(500).json({ message: 'Failed to search dictionary entries' });
    }
  });
  
  // Get dictionary entry by ID
  app.get('/api/dictionary/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const entry = await storage.getDictionaryEntry(id);
      if (!entry) {
        return res.status(404).json({ message: 'Dictionary entry not found' });
      }
      
      res.json(entry);
    } catch (error) {
      console.error('Error fetching dictionary entry:', error);
      res.status(500).json({ message: 'Failed to fetch dictionary entry' });
    }
  });
  
  // Create dictionary entry (admin only)
  app.post('/api/dictionary', isAdmin, async (req, res) => {
    try {
      const data = insertDictionaryEntrySchema.parse(req.body);
      const newEntry = await storage.createDictionaryEntry(data);
      res.status(201).json(newEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid dictionary entry data', errors: error.errors });
      }
      console.error('Error creating dictionary entry:', error);
      res.status(500).json({ message: 'Failed to create dictionary entry' });
    }
  });
  
  // Update dictionary entry (admin only)
  app.put('/api/dictionary/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const data = insertDictionaryEntrySchema.parse(req.body);
      const updatedEntry = await storage.updateDictionaryEntry(id, data);
      
      if (!updatedEntry) {
        return res.status(404).json({ message: 'Dictionary entry not found' });
      }
      
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid dictionary entry data', errors: error.errors });
      }
      console.error('Error updating dictionary entry:', error);
      res.status(500).json({ message: 'Failed to update dictionary entry' });
    }
  });
  
  // Delete dictionary entry (admin only)
  app.delete('/api/dictionary/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const success = await storage.deleteDictionaryEntry(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Dictionary entry not found' });
      }
      
      res.json({ message: 'Dictionary entry deleted successfully' });
    } catch (error) {
      console.error('Error deleting dictionary entry:', error);
      res.status(500).json({ message: 'Failed to delete dictionary entry' });
    }
  });
  
  // Update site language settings (admin only)
  app.put('/api/admin/translations/settings', isAdmin, async (req, res) => {
    try {
      const settingsData = insertSiteLanguageSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateSiteLanguageSettings(settingsData);
      if (!updatedSettings) {
        return res.status(500).json({ message: 'Failed to update language settings' });
      }
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid language settings data', errors: error.errors });
      }
      console.error('Error updating language settings:', error);
      res.status(500).json({ message: 'Failed to update language settings' });
    }
  });
  
  // Get all translations
  app.get('/api/translations', async (req, res) => {
    try {
      const translations = await storage.listTranslations();
      res.json(translations);
    } catch (error) {
      console.error('Error fetching translations:', error);
      res.status(500).json({ message: 'Failed to fetch translations' });
    }
  });
  
  // Get translation by key
  app.get('/api/translations/key/:key', async (req, res) => {
    try {
      const key = req.params.key;
      const translation = await storage.getTranslationByKey(key);
      if (!translation) {
        return res.status(404).json({ message: 'Translation not found' });
      }
      res.json(translation);
    } catch (error) {
      console.error('Error fetching translation:', error);
      res.status(500).json({ message: 'Failed to fetch translation' });
    }
  });
  
  // Get translation by ID
  app.get('/api/translations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid translation ID' });
      }
      
      const translation = await storage.getTranslation(id);
      if (!translation) {
        return res.status(404).json({ message: 'Translation not found' });
      }
      
      res.json(translation);
    } catch (error) {
      console.error('Error fetching translation:', error);
      res.status(500).json({ message: 'Failed to fetch translation' });
    }
  });
  
  // Create new translation (admin only)
  app.post('/api/admin/translations', isAdmin, async (req, res) => {
    try {
      const translationData = insertTranslationSchema.parse(req.body);
      const newTranslation = await storage.createTranslation(translationData);
      res.json(newTranslation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid translation data', errors: error.errors });
      }
      console.error('Error creating translation:', error);
      res.status(500).json({ message: 'Failed to create translation' });
    }
  });
  
  // Update a translation (admin only)
  app.put('/api/admin/translations/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid translation ID' });
      }
      
      // Verify translation exists
      const existingTranslation = await storage.getTranslation(id);
      if (!existingTranslation) {
        return res.status(404).json({ message: 'Translation not found' });
      }
      
      const translationData = insertTranslationSchema.partial().parse(req.body);
      const updatedTranslation = await storage.updateTranslation(id, translationData);
      if (!updatedTranslation) {
        return res.status(500).json({ message: 'Failed to update translation' });
      }
      
      res.json(updatedTranslation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid translation data', errors: error.errors });
      }
      console.error('Error updating translation:', error);
      res.status(500).json({ message: 'Failed to update translation' });
    }
  });
  
  // Delete a translation (admin only)
  app.delete('/api/admin/translations/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid translation ID' });
      }
      
      // Verify translation exists
      const existingTranslation = await storage.getTranslation(id);
      if (!existingTranslation) {
        return res.status(404).json({ message: 'Translation not found' });
      }
      
      const success = await storage.deleteTranslation(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: 'Failed to delete translation' });
      }
    } catch (error) {
      console.error('Error deleting translation:', error);
      res.status(500).json({ message: 'Failed to delete translation' });
    }
  });
  
  // Machine translate a single translation (admin only)
  app.post('/api/admin/translations/:id/translate', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid translation ID' });
      }
      
      // Verify translation exists
      const existingTranslation = await storage.getTranslation(id);
      if (!existingTranslation) {
        return res.status(404).json({ message: 'Translation not found' });
      }
      
      // Only proceed if there's no Arabic translation yet or it needs to be overwritten
      if (req.body.force !== true && existingTranslation.arText) {
        return res.status(400).json({ 
          message: 'Translation already exists. Use force=true to overwrite.' 
        });
      }
      
      try {
        // Call Gemini to translate the English text
        const translatedText = await geminiService.translateToArabic(existingTranslation.enText);
        
        // Update the translation record
        const updatedTranslation = await storage.updateTranslation(id, {
          arText: translatedText,
        });
        
        res.json({
          success: true,
          translation: updatedTranslation,
          message: 'Translation completed successfully'
        });
      } catch (transError: any) {
        console.error('Gemini translation error:', transError);
        
        // Handle specific Gemini API errors and pass structured error to frontend
        const errorMessage = transError instanceof Error ? transError.message : String(transError);
        
        // Check if this is a structured error from Gemini service
        if (errorMessage.includes('QUOTA_EXCEEDED') || 
            errorMessage.includes('RATE_LIMITED') || 
            errorMessage.includes('API_KEY_INVALID') ||
            errorMessage.includes('TRANSLATION_ERROR')) {
          // Pass the structured error message directly to frontend
          return res.status(500).json({ 
            success: false,
            message: errorMessage 
          });
        }
        
        // Generic error for unstructured errors
        res.status(500).json({ 
          success: false,
          message: `Translation service error: ${errorMessage}` 
        });
      }
    } catch (error) {
      console.error('Error processing translation request:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to process translation request' 
      });
    }
  });
  
  // Batch translate multiple untranslated keys (admin only)
  // Generate image for package based on description and city
  app.post('/api/admin/packages/generate-image', isAdmin, async (req, res) => {
    try {
      // Validate request body
      const imageGenSchema = z.object({
        overview: z.string().min(10, "Overview text is too short"),
        city: z.string().min(2, "City name is too short"),
      });
      
      const { overview, city } = imageGenSchema.parse(req.body);
      
      try {
        // Generate image using Gemini
        const imageUrl = await geminiService.getImageForPackage(overview, city);
        
        res.json({
          success: true,
          imageUrl,
          message: 'Image generated successfully'
        });
      } catch (genError) {
        console.error('Image generation error:', genError);
        res.status(500).json({ 
          success: false,
          message: `Image generation error: ${genError instanceof Error ? genError.message : String(genError)}` 
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid request parameters', 
          errors: error.errors 
        });
      }
      console.error('Error processing image generation:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to process image generation' 
      });
    }
  });

  app.post('/api/admin/translations/batch-translate', isAdmin, async (req, res) => {
    try {
      // Validate request body
      const batchSchema = z.object({
        filter: z.enum(['all', 'untranslated', 'category']).default('untranslated'),
        category: z.string().optional(),
        limit: z.number().min(1).max(50).default(10),
        force: z.boolean().default(false),
      });
      
      const { filter, category, limit, force } = batchSchema.parse(req.body);
      
      // Get translations to process
      let translations = await storage.listTranslations(filter === 'category' ? category : undefined);
      
      // Filter based on translation status
      if (filter === 'untranslated' || (filter === 'all' && !force)) {
        // Only process items that don't have Arabic translations or have empty ones
        translations = translations.filter(t => 
          !t.arText || 
          t.arText.trim() === '' || 
          t.arText === null || 
          t.arText === undefined
        );
      } else if (filter === 'category' && !force) {
        // For category filter, also only process untranslated items unless forced
        translations = translations.filter(t => 
          !t.arText || 
          t.arText.trim() === '' || 
          t.arText === null || 
          t.arText === undefined
        );
      }
      
      // Limit the number of translations to process
      translations = translations.slice(0, limit);
      
      if (translations.length === 0) {
        return res.json({
          success: true,
          message: 'No translations to process',
          processed: 0,
          translations: []
        });
      }
      
      // Prepare translations for batch processing
      const translationItems = translations.map(t => ({
        id: t.id,
        text: t.enText
      }));
      
      try {
        // Call Gemini to batch translate
        const translationResults = await geminiService.batchTranslateToArabic(translationItems);
        
        // Update each translation in the database
        const updatedTranslations = [];
        for (const result of translationResults) {
          const updatedTranslation = await storage.updateTranslation(result.id, {
            arText: result.translation
          });
          if (updatedTranslation) {
            updatedTranslations.push(updatedTranslation);
          }
        }
        
        res.json({
          success: true,
          message: `Successfully processed ${updatedTranslations.length} translations`,
          processed: updatedTranslations.length,
          translations: updatedTranslations
        });
      } catch (batchError: any) {
        console.error('Batch translation error:', batchError);
        
        // Handle specific Gemini API errors and pass structured error to frontend
        const errorMessage = batchError instanceof Error ? batchError.message : String(batchError);
        
        // Check if this is a structured error from Gemini service
        if (errorMessage.includes('QUOTA_EXCEEDED') || 
            errorMessage.includes('RATE_LIMITED') || 
            errorMessage.includes('API_KEY_INVALID') ||
            errorMessage.includes('TRANSLATION_ERROR')) {
          // Pass the structured error message directly to frontend
          return res.status(500).json({ 
            success: false,
            message: errorMessage 
          });
        }
        
        // Generic error for unstructured errors
        res.status(500).json({ 
          success: false,
          message: `Batch translation error: ${errorMessage}` 
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid request parameters', 
          errors: error.errors 
        });
      }
      console.error('Error processing batch translation:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to process batch translation' 
      });
    }
  });
  
  // Test batch translation endpoint (bypasses auth for testing)
  app.post('/api/test/batch-translate', async (req, res) => {
    try {
      console.log('Test batch translation endpoint called');
      
      // Get a few untranslated items for testing
      const translations = await storage.listTranslations();
      const untranslated = translations.filter(t => !t.arText || t.arText.trim() === '').slice(0, 2);
      
      if (untranslated.length === 0) {
        return res.json({
          success: true,
          message: 'No untranslated items found',
          processed: 0
        });
      }
      
      // Prepare translations for batch processing
      const translationItems = untranslated.map(t => ({
        id: t.id,
        text: t.enText
      }));
      
      console.log('Processing translations:', translationItems);
      
      try {
        // Call Gemini to batch translate
        const translationResults = await geminiService.batchTranslateToArabic(translationItems);
        console.log('Translation results:', translationResults);
        
        // Update each translation in the database
        const updatedTranslations = [];
        for (const result of translationResults) {
          if (result.translation && result.translation.trim() !== '') {
            const updatedTranslation = await storage.updateTranslation(result.id, {
              arText: result.translation
            });
            if (updatedTranslation) {
              updatedTranslations.push(updatedTranslation);
            }
          }
        }
        
        res.json({
          success: true,
          message: `Successfully translated ${updatedTranslations.length} items`,
          processed: updatedTranslations.length,
          results: translationResults
        });
      } catch (batchError) {
        console.error('Batch translation error:', batchError);
        res.status(500).json({ 
          success: false,
          message: `Batch translation error: ${batchError instanceof Error ? batchError.message : String(batchError)}` 
        });
      }
    } catch (error) {
      console.error('Error in test batch translate:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to process test batch translation' 
      });
    }
  });

  // Auto-sync translations from codebase
  app.post('/api/admin/translations/sync', async (req, res) => {
    console.log('Starting translation sync from codebase');
    
    try {
      // Get existing translations to avoid duplicates
      const existingTranslations = await storage.listTranslations();
      const existingKeys = new Set(existingTranslations.map(t => t.key));
      
      console.log(`Found ${existingTranslations.length} existing translations`);
      
      // Results tracking
      let scannedFiles = 0;
      let foundKeys = 0;
      let newKeysAdded = 0;
      const newTranslations: any[] = [];
      
      // Translation pattern to match t('key') or t('key', 'default text')
      // Improved to avoid whitespace-only keys and ensure meaningful content
      const translationPattern = /t\(\s*['"`]([^'"`\s][^'"`]*[^'"`\s]|[^'"`\s])['"`](?:\s*,\s*['"`]([^'"`]*)['"`])?\s*\)/g;
      
      // Scan function for a single file
      const scanFile = async (filePath: string) => {
        try {
          const content = await fsPromises.readFile(filePath, 'utf8');
          scannedFiles++;
          
          let match;
          while ((match = translationPattern.exec(content)) !== null) {
            const key = match[1]?.trim();
            console.log(`[SYNC] Found potential key: "${key}" in file ${filePath}`); // Add this log
            const defaultText = match[2] || key;
            
            // Skip empty, whitespace-only, or already existing keys
            if (!key || key.length === 0 || /^\s*$/.test(key) || existingKeys.has(key)) continue;
            
            foundKeys++;
            
            // Determine category from file path
            let category = 'general';
            if (filePath.includes('/admin/')) category = 'admin';
            else if (filePath.includes('/components/')) category = 'components';
            else if (filePath.includes('/pages/')) category = 'pages';
            
            // Add new translation
            const inserted = await db.insert(translations).values({
              key,
              language: 'en', // Set default language to English
              enText: defaultText,
              arText: null,
              category,
              context: `Auto-detected from ${path.relative('.', filePath)}`,
              createdAt: new Date(),
              updatedAt: new Date()
            }).returning();
            
            if (inserted[0]) {
              newKeysAdded++;
              newTranslations.push(inserted[0]);
              existingKeys.add(key);
              console.log(`Added: ${key}`);
            }
          }
        } catch (err) {
          console.error(`Error scanning ${filePath}:`, err);
        }
      };
      
      // Recursively scan directory
      const scanDirectory = async (dir: string) => {
        try {
          const entries = await fsPromises.readdir(dir, { withFileTypes: true });
          
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory() && !entry.name.startsWith('.')) {
              await scanDirectory(fullPath);
            } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
              await scanFile(fullPath);
            }
          }
        } catch (err) {
          console.error(`Error scanning directory ${dir}:`, err);
        }
      };
      
      // Scan client source directories
      const dirsToScan = ['./client/src/pages', './client/src/components'];
      
      for (const dir of dirsToScan) {
        if (await fsPromises.access(dir).then(() => true).catch(() => false)) {
          await scanDirectory(dir);
        }
      }
      
      console.log(`Scan complete: ${scannedFiles} files, ${foundKeys} keys found, ${newKeysAdded} new translations added`);
      
      res.json({
        success: true,
        message: `Scan complete. Found ${foundKeys} keys in ${scannedFiles} files. Added ${newKeysAdded} new translations.`,
        results: {
          scannedFiles,
          foundKeys,
          newKeysAdded,
          newTranslations: newTranslations.slice(0, 10) // Return first 10 for preview
        }
      });
      
    } catch (error: any) {
      console.error('Translation sync error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to sync translations', 
        error: error.message 
      });
    }
  });
  
  // Dictionary API Routes
  
  // Get all dictionary entries
  app.get('/api/dictionary', async (req, res) => {
    try {
      const entries = await storage.listDictionaryEntries();
      res.json(entries);
    } catch (error) {
      console.error('Error fetching dictionary entries:', error);
      res.status(500).json({ message: 'Failed to fetch dictionary entries' });
    }
  });
  
  // Search dictionary entries
  app.get('/api/dictionary/search', async (req, res) => {
    try {
      const searchTerm = req.query.term as string;
      if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required' });
      }
      const entries = await storage.searchDictionaryEntries(searchTerm);
      res.json(entries);
    } catch (error) {
      console.error('Error searching dictionary entries:', error);
      res.status(500).json({ message: 'Failed to search dictionary entries' });
    }
  });
  
  // Get dictionary entry by ID
  app.get('/api/dictionary/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid dictionary entry ID' });
      }
      
      const entry = await storage.getDictionaryEntry(id);
      if (!entry) {
        return res.status(404).json({ message: 'Dictionary entry not found' });
      }
      
      res.json(entry);
    } catch (error) {
      console.error('Error fetching dictionary entry:', error);
      res.status(500).json({ message: 'Failed to fetch dictionary entry' });
    }
  });
  
  // Get dictionary entry by word
  app.get('/api/dictionary/word/:word', async (req, res) => {
    try {
      const word = req.params.word;
      const entry = await storage.getDictionaryEntryByWord(word);
      if (!entry) {
        return res.status(404).json({ message: 'Dictionary entry not found' });
      }
      
      res.json(entry);
    } catch (error) {
      console.error('Error fetching dictionary entry by word:', error);
      res.status(500).json({ message: 'Failed to fetch dictionary entry' });
    }
  });
  
  // Create new dictionary entry (admin only)
  app.post('/api/admin/dictionary', isAdmin, async (req, res) => {
    try {
      const entryData = insertDictionaryEntrySchema.parse(req.body);
      const newEntry = await storage.createDictionaryEntry(entryData);
      res.status(201).json(newEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid dictionary entry data', errors: error.errors });
      }
      console.error('Error creating dictionary entry:', error);
      res.status(500).json({ message: 'Failed to create dictionary entry' });
    }
  });
  
  // Update a dictionary entry (admin only)
  app.put('/api/admin/dictionary/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid dictionary entry ID' });
      }
      
      // Verify entry exists
      const existingEntry = await storage.getDictionaryEntry(id);
      if (!existingEntry) {
        return res.status(404).json({ message: 'Dictionary entry not found' });
      }
      
      const entryData = insertDictionaryEntrySchema.partial().parse(req.body);
      const updatedEntry = await storage.updateDictionaryEntry(id, entryData);
      if (!updatedEntry) {
        return res.status(500).json({ message: 'Failed to update dictionary entry' });
      }
      
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid dictionary entry data', errors: error.errors });
      }
      console.error('Error updating dictionary entry:', error);
      res.status(500).json({ message: 'Failed to update dictionary entry' });
    }
  });
  
  // Delete a dictionary entry (admin only)
  app.delete('/api/admin/dictionary/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid dictionary entry ID' });
      }
      
      // Verify entry exists
      const existingEntry = await storage.getDictionaryEntry(id);
      if (!existingEntry) {
        return res.status(404).json({ message: 'Dictionary entry not found' });
      }
      
      const success = await storage.deleteDictionaryEntry(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: 'Failed to delete dictionary entry' });
      }
    } catch (error) {
      console.error('Error deleting dictionary entry:', error);
      res.status(500).json({ message: 'Failed to delete dictionary entry' });
    }
  });
  
  // Export translations (admin only)
  app.get('/api/admin/translations/export', isAdmin, async (req, res) => {
    try {
      // Get all translations from the database
      const allTranslations = await storage.listTranslations();
      
      // Get language settings
      const languageSettings = await storage.getSiteLanguageSettings();
      
      // Prepare export data that includes both translations and settings
      const exportData = {
        translations: allTranslations,
        languageSettings: languageSettings || {
          defaultLanguage: 'en',
          availableLanguages: ['en', 'ar'],
          rtlLanguages: ['ar'],
        }
      };
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=sahara-translations.json');
      
      // Send the export data
      res.json(exportData);
    } catch (error) {
      console.error('Error exporting translations:', error);
      res.status(500).json({ message: 'Failed to export translations' });
    }
  });
  
  // Update tour Arabic version (admin only)
  app.put('/api/tours/:id/arabic', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid tour ID' });
      }

      // Check if tour exists
      const existingTour = await storage.getTour(id);
      if (!existingTour) {
        return res.status(404).json({ message: 'Tour not found' });
      }

      // Update Arabic fields
      const updatedTour = await db
        .update(tours)
        .set({
          nameAr: req.body.nameAr,
          descriptionAr: req.body.descriptionAr,
          itineraryAr: req.body.itineraryAr,
          includedAr: req.body.includedAr,
          excludedAr: req.body.excludedAr,
          hasArabicVersion: req.body.hasArabicVersion,
          updatedAt: new Date(),
        })
        .where(eq(tours.id, id))
        .returning();

      if (updatedTour.length === 0) {
        return res.status(500).json({ message: 'Failed to update tour Arabic version' });
      }

      res.json(updatedTour[0]);
    } catch (error) {
      console.error('Error updating tour Arabic version:', error);
      res.status(500).json({ message: 'Failed to update tour Arabic version' });
    }
  });

  // Import translations (admin only)
  app.post('/api/admin/translations/import', isAdmin, async (req, res) => {
    try {
      // Validate import data structure
      const importSchema = z.object({
        translations: z.array(z.object({
          key: z.string(),
          enText: z.string(),
          arText: z.string().nullable(),
          context: z.string().nullable(),
          category: z.string().nullable(),
        })),
        languageSettings: z.object({
          defaultLanguage: z.string(),
          availableLanguages: z.union([z.array(z.string()), z.string()]),
          rtlLanguages: z.union([z.array(z.string()), z.string()]),
        }),
      });
      
      // Parse and validate the import data
      const importData = importSchema.parse(req.body);
      
      // Statistics to track the import process
      const stats = {
        totalTranslations: importData.translations.length,
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: 0
      };
      
      // Process each translation
      for (const translation of importData.translations) {
        try {
          // Check if translation already exists by key
          const existingTranslation = await storage.getTranslationByKey(translation.key);
          
          if (existingTranslation) {
            // Update existing translation
            await storage.updateTranslation(existingTranslation.id, translation);
            stats.updated++;
          } else {
            // Create new translation
            await storage.createTranslation(translation);
            stats.imported++;
          }
        } catch (err) {
          console.error(`Error importing translation key ${translation.key}:`, err);
          stats.errors++;
        }
      }
      
      // Update language settings if provided
      if (importData.languageSettings) {
        try {
          await storage.updateSiteLanguageSettings(importData.languageSettings);
        } catch (err) {
          console.error('Error updating language settings:', err);
          stats.errors++;
        }
      }
      
      res.json({
        success: true,
        message: 'Translations imported successfully',
        stats
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid import data format', 
          errors: error.errors 
        });
      }
      console.error('Error importing translations:', error);
      res.status(500).json({ message: 'Failed to import translations' });
    }
  });

  // Tour Categories API Routes
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

  app.get('/api/tour-categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      const category = await storage.getTourCategory(id);
      if (!category) {
        return res.status(404).json({ message: 'Tour category not found' });
      }

      res.json(category);
    } catch (error) {
      console.error('Error fetching tour category:', error);
      res.status(500).json({ message: 'Failed to fetch tour category' });
    }
  });

  app.post('/api/tour-categories', isAdmin, async (req, res) => {
    try {
      const { name, description, active } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      const newCategory = await storage.createTourCategory({
        name,
        description: description || null,
        active: active !== undefined ? active : true
      });

      res.status(201).json(newCategory);
    } catch (error) {
      console.error('Error creating tour category:', error);
      res.status(500).json({ message: 'Failed to create tour category' });
    }
  });

  app.patch('/api/tour-categories/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      const { name, description, active } = req.body;
      const updatedData: Record<string, any> = {};

      if (name !== undefined) updatedData.name = name;
      if (description !== undefined) updatedData.description = description;
      if (active !== undefined) updatedData.active = active;

      const updatedCategory = await storage.updateTourCategory(id, updatedData);
      if (!updatedCategory) {
        return res.status(404).json({ message: 'Tour category not found' });
      }

      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating tour category:', error);
      res.status(500).json({ message: 'Failed to update tour category' });
    }
  });

  app.delete('/api/tour-categories/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      const success = await storage.deleteTourCategory(id);
      if (!success) {
        return res.status(404).json({ message: 'Tour category not found or could not be deleted' });
      }

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting tour category:', error);
      res.status(500).json({ message: 'Failed to delete tour category' });
    }
  });

  // Hotel Categories API Routes
  app.get('/api/hotel-categories', async (req, res) => {
    try {
      const active = req.query.active === 'true' ? true : undefined;
      const categories = await storage.listHotelCategories(active);
      res.json(categories);
    } catch (error) {
      console.error('Error fetching hotel categories:', error);
      res.status(500).json({ message: 'Failed to fetch hotel categories' });
    }
  });

  app.get('/api/hotel-categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      const category = await storage.getHotelCategory(id);
      if (!category) {
        return res.status(404).json({ message: 'Hotel category not found' });
      }

      res.json(category);
    } catch (error) {
      console.error('Error fetching hotel category:', error);
      res.status(500).json({ message: 'Failed to fetch hotel category' });
    }
  });

  app.post('/api/hotel-categories', isAdmin, async (req, res) => {
    try {
      const { name, description, active } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      const newCategory = await storage.createHotelCategory({
        name,
        description: description || null,
        active: active !== undefined ? active : true
      });

      res.status(201).json(newCategory);
    } catch (error) {
      console.error('Error creating hotel category:', error);
      res.status(500).json({ message: 'Failed to create hotel category' });
    }
  });

  app.patch('/api/hotel-categories/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      const { name, description, active } = req.body;
      const updatedData: Record<string, any> = {};

      if (name !== undefined) updatedData.name = name;
      if (description !== undefined) updatedData.description = description;
      if (active !== undefined) updatedData.active = active;

      const updatedCategory = await storage.updateHotelCategory(id, updatedData);
      if (!updatedCategory) {
        return res.status(404).json({ message: 'Hotel category not found' });
      }

      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating hotel category:', error);
      res.status(500).json({ message: 'Failed to update hotel category' });
    }
  });

  app.delete('/api/hotel-categories/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      const success = await storage.deleteHotelCategory(id);
      if (!success) {
        return res.status(404).json({ message: 'Hotel category not found or could not be deleted' });
      }

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting hotel category:', error);
      res.status(500).json({ message: 'Failed to delete hotel category' });
    }
  });

  // Admin Hotel Categories API Routes
  app.get('/api/admin/hotel-categories', isAdmin, async (req, res) => {
    try {
      const active = req.query.active === 'true' ? true : undefined;
      const categories = await storage.listHotelCategories(active);
      res.json(categories);
    } catch (error) {
      console.error('Error fetching hotel categories:', error);
      res.status(500).json({ message: 'Failed to fetch hotel categories' });
    }
  });

  app.get('/api/admin/hotel-categories/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      const category = await storage.getHotelCategory(id);
      if (!category) {
        return res.status(404).json({ message: 'Hotel category not found' });
      }

      res.json(category);
    } catch (error) {
      console.error('Error fetching hotel category:', error);
      res.status(500).json({ message: 'Failed to fetch hotel category' });
    }
  });

  app.post('/api/admin/hotel-categories', isAdmin, async (req, res) => {
    try {
      const { name, description, active } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      const newCategory = await storage.createHotelCategory({
        name,
        description: description || null,
        active: active !== undefined ? active : true
      });

      res.status(201).json(newCategory);
    } catch (error) {
      console.error('Error creating hotel category:', error);
      res.status(500).json({ message: 'Failed to create hotel category' });
    }
  });

  app.patch('/api/admin/hotel-categories/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      const { name, description, active } = req.body;
      const updatedData: Record<string, any> = {};

      if (name !== undefined) updatedData.name = name;
      if (description !== undefined) updatedData.description = description;
      if (active !== undefined) updatedData.active = active;

      const updatedCategory = await storage.updateHotelCategory(id, updatedData);
      if (!updatedCategory) {
        return res.status(404).json({ message: 'Hotel category not found' });
      }

      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating hotel category:', error);
      res.status(500).json({ message: 'Failed to update hotel category' });
    }
  });

  app.delete('/api/admin/hotel-categories/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      const success = await storage.deleteHotelCategory(id);
      if (!success) {
        return res.status(404).json({ message: 'Hotel category not found or could not be deleted' });
      }

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting hotel category:', error);
      res.status(500).json({ message: 'Failed to delete hotel category' });
    }
  });

  // Room Categories API Routes
  app.get('/api/room-categories', async (req, res) => {
    try {
      const active = req.query.active === 'true' ? true : undefined;
      const categories = await storage.listRoomCategories(active);
      res.json(categories);
    } catch (error) {
      console.error('Error fetching room categories:', error);
      res.status(500).json({ message: 'Failed to fetch room categories' });
    }
  });

  // Package Categories API Routes  
  app.get('/api/package-categories', async (req, res) => {
    try {
      const active = req.query.active === 'true' ? true : undefined;
      const categories = await storage.listPackageCategories(active);
      res.json(categories);
    } catch (error) {
      console.error('Error fetching package categories:', error);
      res.status(500).json({ message: 'Failed to fetch package categories' });
    }
  });

  // Create a new package category (admin only)
  app.post('/api/package-categories', isAdmin, async (req, res) => {
    try {
      const categoryData = req.body;
      console.log('Creating package category with data:', categoryData);
      
      const newCategory = await storage.createPackageCategory(categoryData);
      res.status(201).json(newCategory);
    } catch (error) {
      console.error('Error creating package category:', error);
      res.status(500).json({ message: 'Failed to create package category' });
    }
  });

  // Update a package category (admin only)
  app.put('/api/package-categories/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      const categoryData = req.body;
      console.log('Updating package category', id, 'with data:', categoryData);
      
      const updatedCategory = await storage.updatePackageCategory(id, categoryData);
      if (!updatedCategory) {
        return res.status(404).json({ message: 'Package category not found' });
      }

      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating package category:', error);
      res.status(500).json({ message: 'Failed to update package category' });
    }
  });

  // Delete a package category (admin only)
  app.delete('/api/package-categories/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      console.log('Deleting package category with ID:', id);
      
      const success = await storage.deletePackageCategory(id);
      if (!success) {
        return res.status(404).json({ message: 'Package category not found or could not be deleted' });
      }

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting package category:', error);
      res.status(500).json({ message: 'Failed to delete package category' });
    }
  });

  // =================== Why Choose Us Sections API Routes ===================
  
  // Get all why choose us sections
  app.get('/api/why-choose-us-sections', async (req, res) => {
    try {
      const active = req.query.active === 'true' ? true : undefined;
      const sections = await storage.listWhyChooseUsSections(active);
      res.json(sections);
    } catch (error) {
      console.error('Error fetching why choose us sections:', error);
      res.status(500).json({ message: 'Failed to fetch why choose us sections' });
    }
  });

  // Get why choose us section by ID
  app.get('/api/why-choose-us-sections/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid section ID' });
      }

      const section = await storage.getWhyChooseUsSection(id);
      if (!section) {
        return res.status(404).json({ message: 'Section not found' });
      }

      res.json(section);
    } catch (error) {
      console.error('Error fetching why choose us section:', error);
      res.status(500).json({ message: 'Failed to fetch why choose us section' });
    }
  });

  // Create new why choose us section (admin only)
  app.post('/api/admin/why-choose-us-sections', isAdmin, async (req, res) => {
    try {
      const sectionData = insertWhyChooseUsSectionSchema.parse(req.body);
      const newSection = await storage.createWhyChooseUsSection(sectionData);
      res.status(201).json(newSection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid section data', errors: error.errors });
      }
      console.error('Error creating why choose us section:', error);
      res.status(500).json({ message: 'Failed to create why choose us section' });
    }
  });

  // Update why choose us section (admin only)
  app.put('/api/admin/why-choose-us-sections/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid section ID' });
      }

      // Verify section exists
      const existingSection = await storage.getWhyChooseUsSection(id);
      if (!existingSection) {
        return res.status(404).json({ message: 'Section not found' });
      }

      const sectionData = insertWhyChooseUsSectionSchema.partial().parse(req.body);
      const updatedSection = await storage.updateWhyChooseUsSection(id, sectionData);
      if (!updatedSection) {
        return res.status(500).json({ message: 'Failed to update section' });
      }

      res.json(updatedSection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid section data', errors: error.errors });
      }
      console.error('Error updating why choose us section:', error);
      res.status(500).json({ message: 'Failed to update section' });
    }
  });

  // Delete why choose us section (admin only)
  app.delete('/api/admin/why-choose-us-sections/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid section ID' });
      }

      // Verify section exists
      const existingSection = await storage.getWhyChooseUsSection(id);
      if (!existingSection) {
        return res.status(404).json({ message: 'Section not found' });
      }

      const success = await storage.deleteWhyChooseUsSection(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: 'Failed to delete section' });
      }
    } catch (error) {
      console.error('Error deleting why choose us section:', error);
      res.status(500).json({ message: 'Failed to delete section' });
    }
  });

  // =================== Homepage Sections API Routes ===================
  
  // Get all homepage sections
  app.get('/api/homepage-sections', async (req, res) => {
    try {
      const active = req.query.active === 'true' ? true : undefined;
      const sections = await storage.listHomepageSections(active);
      res.json(sections);
    } catch (error) {
      console.error('Error fetching homepage sections:', error);
      res.status(500).json({ message: 'Failed to fetch homepage sections' });
    }
  });

  // Get homepage section by ID
  app.get('/api/homepage-sections/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid homepage section ID' });
      }

      const section = await storage.getHomepageSection(id);
      if (!section) {
        return res.status(404).json({ message: 'Homepage section not found' });
      }

      res.json(section);
    } catch (error) {
      console.error('Error fetching homepage section:', error);
      res.status(500).json({ message: 'Failed to fetch homepage section' });
    }
  });

  // Create new homepage section (admin only)
  app.post('/api/admin/homepage-sections', isAdmin, async (req, res) => {
    try {
      const sectionData = insertHomepageSectionSchema.parse(req.body);
      const newSection = await storage.createHomepageSection(sectionData);
      res.status(201).json(newSection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid homepage section data', errors: error.errors });
      }
      console.error('Error creating homepage section:', error);
      res.status(500).json({ message: 'Failed to create homepage section' });
    }
  });

  // Update homepage section (admin only)
  app.put('/api/admin/homepage-sections/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid homepage section ID' });
      }

      // Verify section exists
      const existingSection = await storage.getHomepageSection(id);
      if (!existingSection) {
        return res.status(404).json({ message: 'Homepage section not found' });
      }

      const sectionData = insertHomepageSectionSchema.partial().parse(req.body);
      const updatedSection = await storage.updateHomepageSection(id, sectionData);
      if (!updatedSection) {
        return res.status(500).json({ message: 'Failed to update homepage section' });
      }

      res.json(updatedSection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid homepage section data', errors: error.errors });
      }
      console.error('Error updating homepage section:', error);
      res.status(500).json({ message: 'Failed to update homepage section' });
    }
  });

  // Delete homepage section (admin only)
  app.delete('/api/admin/homepage-sections/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid homepage section ID' });
      }

      // Verify section exists
      const existingSection = await storage.getHomepageSection(id);
      if (!existingSection) {
        return res.status(404).json({ message: 'Homepage section not found' });
      }

      const success = await storage.deleteHomepageSection(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: 'Failed to delete homepage section' });
      }
    } catch (error) {
      console.error('Error deleting homepage section:', error);
      res.status(500).json({ message: 'Failed to delete homepage section' });
    }
  });

  // Setup advanced admin routes
  setupAdvancedAdminRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
