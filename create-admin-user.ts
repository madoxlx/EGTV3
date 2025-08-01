import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  const databaseUrl = process.env.DATABASE_URL;
  const client = postgres(databaseUrl);
  const db = drizzle(client);

  const username = 'eetadmin';
  const password = 'admin@eet';
  const email = 'admin@egyptexpresstvl.com';
  const fullName = 'ahmed dev';

  try {
    // Check if admin user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    const hashedPassword = await hashPassword(password);

    if (existingUser.length > 0) {
      // Update existing user
      await db
        .update(users)
        .set({
          password: hashedPassword, // Store hashed password in password field
          passwordHash: hashedPassword, // Store hashed password in passwordHash field
          email: email,
          fullName: fullName,
          role: 'admin'
        })
        .where(eq(users.username, username));
      
      console.log('Admin user updated successfully');
    } else {
      // Create new user
      await db.insert(users).values({
        username: username,
        password: hashedPassword, // Store hashed password in password field
        passwordHash: hashedPassword, // Store hashed password in passwordHash field
        email: email,
        fullName: fullName,
        role: 'admin'
      });
      
      console.log('Admin user created successfully');
    }

    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(`Email: ${email}`);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.end();
  }
}

createAdminUser();