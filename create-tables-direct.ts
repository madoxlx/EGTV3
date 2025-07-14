import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./shared/schema";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  '"postgresql://egsite:Pass2020@74.179.85.9:5432/egsite_db?sslmode=require"';

async function createTables() {
  console.log("Creating database tables...");

  try {
    const client = postgres(DATABASE_URL, {
      ssl: DATABASE_URL.includes("localhost") ? false : "require",
    });

    // Create users table first (required for authentication)
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        role VARCHAR(50) DEFAULT 'user',
        display_name VARCHAR(255),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        profile_image VARCHAR(255),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create menus table
    await client`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create menu_items table
    await client`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url VARCHAR(255) NOT NULL,
        menu_id INTEGER REFERENCES menus(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
        order_index INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        target VARCHAR(50),
        icon VARCHAR(100),
        css_class VARCHAR(255),
        item_type VARCHAR(50) DEFAULT 'link',
        section VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log("Tables created successfully");

    // Now create footer menu
    await client`
      INSERT INTO menus (name, location, description, active, created_at, updated_at) 
      VALUES ('Footer Menu', 'footer', 'Main footer menu links', true, NOW(), NOW()) 
      ON CONFLICT (location) DO NOTHING;
    `;

    const footerMenu = await client`
      SELECT id FROM menus WHERE location = 'footer' LIMIT 1;
    `;

    if (footerMenu.length > 0) {
      const menuId = footerMenu[0].id;

      // Check if menu items exist
      const existingItems = await client`
        SELECT id FROM menu_items WHERE menu_id = ${menuId} LIMIT 1;
      `;

      if (existingItems.length === 0) {
        console.log("Creating footer menu items...");

        await client`
          INSERT INTO menu_items (title, url, menu_id, order_index, active, created_at, updated_at) VALUES
          ('Home', '/', ${menuId}, 0, true, NOW(), NOW()),
          ('Destinations', '/destinations', ${menuId}, 1, true, NOW(), NOW()),
          ('Packages', '/packages', ${menuId}, 2, true, NOW(), NOW()),
          ('About Us', '/about', ${menuId}, 3, true, NOW(), NOW()),
          ('Contact', '/contact', ${menuId}, 4, true, NOW(), NOW());
        `;

        console.log("Footer menu items created");
      }
    }

    // Create admin user if not exists
    const existingAdmin = await client`
      SELECT id FROM users WHERE username = 'admin' LIMIT 1;
    `;

    if (existingAdmin.length === 0) {
      console.log("Creating admin user...");
      await client`
        INSERT INTO users (username, password, email, role, display_name) VALUES
        ('admin', '$scrypt$N=32768,r=8,p=1$lQOdhSfdNNxKfpNUbKCzVA$aEpGOvs3hXSBtEGlrFKzQKIrqBRmJhAqwuXTBBt8hGg', 'admin@saharajourneys.com', 'admin', 'Administrator');
      `;
      console.log("Admin user created successfully!");
    }

    await client.end();
    console.log("Database setup complete");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
}

createTables();
