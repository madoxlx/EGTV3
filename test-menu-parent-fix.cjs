const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  connectionString: 'postgresql://egsite:Pass2020@74.179.85.9:5432/egsite_db?sslmode=disable',
});

async function testMenuParentFix() {
  console.log('🔍 Testing menu parent relationship fix...');
  
  try {
    // Test 1: Get existing menu items
    console.log('\n📋 Current menu items:');
    const existingItems = await pool.query('SELECT id, menu_id, parent_id, title FROM menu_items WHERE menu_id = 1 ORDER BY id');
    console.table(existingItems.rows);
    
    // Test 2: Create a new menu item with parent_id
    console.log('\n➕ Creating new menu item with parent_id = 4 (Home)...');
    const newItemResult = await pool.query(
      'INSERT INTO menu_items (menu_id, parent_id, title, url, icon, order_position, active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [1, 4, 'Home Sub-Item', '/home/sub', 'home', 10, true]
    );
    console.log('✅ Created menu item:', newItemResult.rows[0]);
    
    // Test 3: Verify parent-child relationship
    console.log('\n🔗 Verifying parent-child relationship:');
    const childItems = await pool.query('SELECT id, menu_id, parent_id, title FROM menu_items WHERE parent_id = 4');
    console.table(childItems.rows);
    
    // Test 4: Update an existing item to have a parent
    console.log('\n🔄 Updating existing item (id=5, About) to have parent_id = 4...');
    const updateResult = await pool.query(
      'UPDATE menu_items SET parent_id = $1 WHERE id = $2 RETURNING *',
      [4, 5]
    );
    console.log('✅ Updated menu item:', updateResult.rows[0]);
    
    // Test 5: Final verification
    console.log('\n📊 Final menu structure:');
    const finalItems = await pool.query(`
      SELECT 
        mi.id,
        mi.menu_id,
        mi.parent_id,
        mi.title,
        parent.title as parent_title
      FROM menu_items mi
      LEFT JOIN menu_items parent ON mi.parent_id = parent.id
      WHERE mi.menu_id = 1
      ORDER BY mi.parent_id NULLS FIRST, mi.id
    `);
    console.table(finalItems.rows);
    
    console.log('\n✅ Menu parent relationship fix test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing menu parent fix:', error);
  } finally {
    await pool.end();
  }
}

testMenuParentFix();