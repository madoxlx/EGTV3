import { sql } from "drizzle-orm";
import { db } from "./server/db";

async function fixPackagesSchema() {
  console.log('🔧 Adding missing cancellation_policy column to packages table...');
  
  try {
    // Check if the column exists first
    const columnCheck = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'packages' 
      AND column_name = 'cancellation_policy'
    `);
    
    if (columnCheck.rows.length === 0) {
      // Add the cancellation_policy column
      await db.execute(sql`
        ALTER TABLE packages 
        ADD COLUMN cancellation_policy TEXT
      `);
      
      console.log('✅ Successfully added cancellation_policy column to packages table');
    } else {
      console.log('ℹ️ Column cancellation_policy already exists in packages table');
    }
    
    // Also check and add other missing columns from schema
    const missingColumns = [
      'children_policy',
      'terms_and_conditions',
      'excluded_items',
      'markup',
      'discount_type',
      'discount_value'
    ];
    
    for (const column of missingColumns) {
      const columnCheck = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'packages' 
        AND column_name = '${sql.raw(column)}'
      `);
      
      if (columnCheck.rows.length === 0) {
        let columnType = 'TEXT';
        if (column === 'excluded_items') {
          columnType = 'JSONB';
        } else if (column === 'markup' || column === 'discount_value') {
          columnType = 'INTEGER';
        }
        
        await db.execute(sql`
          ALTER TABLE packages 
          ADD COLUMN ${sql.raw(column)} ${sql.raw(columnType)}
        `);
        
        console.log(`✅ Added ${column} column to packages table`);
      } else {
        console.log(`ℹ️ Column ${column} already exists in packages table`);
      }
    }
    
    console.log('🎉 Packages table schema update completed successfully');
    
  } catch (error) {
    console.error('❌ Error updating packages table schema:', error);
    throw error;
  }
}

// Run the migration
fixPackagesSchema()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });