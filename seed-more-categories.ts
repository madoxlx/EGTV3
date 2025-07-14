/**
 * Script to add more tour categories for testing the dropdown
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function addTourCategories() {
  console.log("Adding more tour categories...");
  
  const categories = [
    {
      name: "Cultural",
      description: "Cultural and historical tours",
      active: true
    },
    {
      name: "Desert Safari",
      description: "Desert adventures and experiences",
      active: true
    },
    {
      name: "City Tours",
      description: "Urban exploration and city tours",
      active: true
    },
    {
      name: "Nature & Wildlife",
      description: "Nature and wildlife experiences",
      active: true
    }
  ];

  try {
    const client = await pool.connect();
    
    for (const category of categories) {
      try {
        const result = await client.query(
          "INSERT INTO tour_categories (name, description, active) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING RETURNING *",
          [category.name, category.description, category.active]
        );
        
        if (result.rows.length > 0) {
          console.log(`✅ Added category: ${category.name}`);
        } else {
          console.log(`⚠️  Category already exists: ${category.name}`);
        }
      } catch (error) {
        console.error(`❌ Failed to add category ${category.name}:`, error);
      }
    }
    
    // Check all categories
    const allCategories = await client.query("SELECT * FROM tour_categories ORDER BY name");
    console.log("\nAll tour categories in database:");
    allCategories.rows.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (ID: ${cat.id}, Active: ${cat.active})`);
    });
    
    client.release();
    console.log("\n✅ Tour categories seeding completed");
    
  } catch (error) {
    console.error("❌ Failed to seed tour categories:", error);
  } finally {
    await pool.end();
  }
}

addTourCategories();