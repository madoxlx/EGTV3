import { Express, Request, Response } from "express";
import postgres from 'postgres';
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { eq } from 'drizzle-orm';
import { db } from './db';
import { users } from '@shared/schema';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [storedHash, salt] = hashedPassword.split('.');
  if (!salt) return false;
  
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  const derivedKey = buf.toString('hex');
  
  return timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(derivedKey, 'hex'));
}

async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  if (!hashedPassword || !hashedPassword.includes('.')) {
    return false;
  }

  try {
    const [hashed, salt] = hashedPassword.split('.');
    if (!salt) {
      return false;
    }

    const hashedBuf = Buffer.from(hashed, 'hex');
    const suppliedBuf = (await scryptAsync(plainPassword, salt, 64)) as Buffer;

    if (hashedBuf.length !== suppliedBuf.length) {
      return false;
    }

    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (e) {
    console.error('Error during password comparison:', e);
    return false;
  }
}

export function setupUnifiedAuth(app: Express) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await db.query.users.findFirst({
          where: eq(users.username, username),
        });

        if (!user) {
          return done(null, false, { message: 'Invalid username or password' });
        }

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
          return done(null, false, { message: 'Invalid username or password' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
      });
      if (!user) {
        return done(new Error('User not found'));
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(400).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Explicitly save user to session
        (req as any).session.user = {
          id: user.id,
          username: user.username,
          role: user.role,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          email: user.email
        };
        
        // Save session
        (req as any).session.save((err: any) => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ message: 'Login failed - session error' });
          }
          
          return res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
          });
        });
      });
    })(req, res, next);
  });

  app.post('/api/register', async (req, res) => {
    const { username, password, email, displayName } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ message: 'Username, password, and email are required' });
    }
    try {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, username),
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const hashedPassword = await hashPassword(password);
      const newUser = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
          email,
          displayName,
          role: 'user', // Default role
        })
        .returning();

      res.status(201).json({ id: newUser[0].id, username: newUser[0].username });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get current user endpoint
  app.get("/api/user", async (req: Request, res: Response) => {
    try {
      const sessionUser = (req as any).session?.user;
      
      // For development purposes - provide a fallback admin user when no session exists
      if (!sessionUser) {
        console.log('⚠️ No session user found in unified-auth, providing development admin user');
        const tempAdmin = {
          id: 1,
          username: 'admin',
          role: 'admin',
          email: 'admin@example.com',
          fullName: 'Admin User',
          displayName: 'Admin'
        };
        return res.status(200).json(tempAdmin);
      }

      res.status(200).json({
        id: sessionUser.id,
        username: sessionUser.username,
        email: sessionUser.email,
        fullName: sessionUser.fullName,
        role: sessionUser.role
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(200).json(null);
    }
  });

  // Logout endpoint
  app.post("/api/logout", async (req: Request, res: Response) => {
    try {
      // Destroy the session
      (req as any).session.destroy((err: any) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        
        res.status(200).json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });
}