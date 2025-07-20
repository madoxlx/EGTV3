#!/usr/bin/env tsx

import { Pool } from "pg";

const databaseUrl = "postgresql://myuser:MyStrongPass123!@20.77.106.39:5432/mydb";

console.log("🛒 Adding missing cart tables to database...");

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false,
  connectionTimeoutMillis: 30000,
  max: 20,
});

async function addCartTables() {
  try {
    console.log("🔨 Creating cart_items table...");
    
    // Create cart_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        session_id VARCHAR(255),
        package_id INTEGER,
        tour_id INTEGER,
        hotel_id INTEGER,
        item_type VARCHAR(50) NOT NULL DEFAULT 'package',
        quantity INTEGER NOT NULL DEFAULT 1,
        price DOUBLE PRECISION NOT NULL DEFAULT 0,
        total_price DOUBLE PRECISION NOT NULL DEFAULT 0,
        selected_options JSONB DEFAULT '{}',
        special_requests TEXT,
        travel_date TIMESTAMP,
        number_of_travelers INTEGER DEFAULT 1,
        room_preferences JSONB DEFAULT '{}',
        meal_preferences JSONB DEFAULT '{}',
        notes TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        -- Foreign key constraints
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
        
        -- Ensure either user_id or session_id is provided
        CONSTRAINT cart_items_user_or_session_check 
          CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
      );
    `);
    console.log("✅ cart_items table created successfully");

    console.log("🔨 Creating orders table...");
    
    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        session_id VARCHAR(255),
        order_number VARCHAR(100) NOT NULL UNIQUE,
        total_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_reference VARCHAR(255),
        billing_address JSONB DEFAULT '{}',
        shipping_address JSONB DEFAULT '{}',
        customer_info JSONB DEFAULT '{}',
        special_instructions TEXT,
        order_date TIMESTAMP NOT NULL DEFAULT NOW(),
        payment_date TIMESTAMP,
        completion_date TIMESTAMP,
        cancellation_date TIMESTAMP,
        cancellation_reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        -- Foreign key constraints  
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        
        -- Ensure either user_id or session_id is provided
        CONSTRAINT orders_user_or_session_check 
          CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
      );
    `);
    console.log("✅ orders table created successfully");

    console.log("🔨 Creating order_items table...");
    
    // Create order_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        package_id INTEGER,
        tour_id INTEGER,
        hotel_id INTEGER,
        item_type VARCHAR(50) NOT NULL DEFAULT 'package',
        item_name VARCHAR(255) NOT NULL,
        item_description TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price DOUBLE PRECISION NOT NULL DEFAULT 0,
        total_price DOUBLE PRECISION NOT NULL DEFAULT 0,
        selected_options JSONB DEFAULT '{}',
        travel_date TIMESTAMP,
        number_of_travelers INTEGER DEFAULT 1,
        room_preferences JSONB DEFAULT '{}',
        meal_preferences JSONB DEFAULT '{}',
        special_requests TEXT,
        status VARCHAR(50) DEFAULT 'confirmed',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        -- Foreign key constraints
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
      );
    `);
    console.log("✅ order_items table created successfully");

    // Create indexes for better performance
    console.log("🔨 Creating indexes for better performance...");
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
      CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
      CREATE INDEX IF NOT EXISTS idx_cart_items_package_id ON cart_items(package_id);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id);
      CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    `);
    console.log("✅ Performance indexes created successfully");

    // Test the tables
    console.log("🧪 Testing cart tables...");
    
    const cartTest = await pool.query('SELECT COUNT(*) FROM cart_items');
    console.log(`✅ cart_items table test passed - ${cartTest.rows[0].count} items`);
    
    const ordersTest = await pool.query('SELECT COUNT(*) FROM orders');
    console.log(`✅ orders table test passed - ${ordersTest.rows[0].count} orders`);
    
    const orderItemsTest = await pool.query('SELECT COUNT(*) FROM order_items');
    console.log(`✅ order_items table test passed - ${orderItemsTest.rows[0].count} items`);

    console.log("🎉 Cart tables setup completed successfully!");

  } catch (error) {
    console.error("❌ Error setting up cart tables:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

addCartTables().catch(console.error);