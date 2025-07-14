import { Pool } from 'pg';
import { db } from './server/db';
import { menus, menuItems } from './shared/schema';
import { eq } from 'drizzle-orm';

async function createHeaderMenu() {
  try {
    console.log('Testing database connection...');
    
    // Check if header menu exists
    const headerMenu = await db.select().from(menus).where(eq(menus.location, 'header'));
    console.log('Header menu found:', headerMenu);
    
    if (headerMenu.length === 0) {
      console.log('Creating header menu...');
      const [newMenu] = await db.insert(menus).values({
        name: 'Header Navigation',
        location: 'header',
        active: true
      }).returning();
      
      console.log('Created header menu:', newMenu);
      
      // Add some menu items
      const menuItemsData = [
        { menuId: newMenu.id, text: 'Home', url: '/', order: 1, active: true },
        { menuId: newMenu.id, text: 'Tours', url: '/tours', order: 2, active: true },
        { menuId: newMenu.id, text: 'Packages', url: '/packages', order: 3, active: true },
        { menuId: newMenu.id, text: 'About', url: '/about', order: 4, active: true },
        { menuId: newMenu.id, text: 'Contact', url: '/contact', order: 5, active: true }
      ];
      
      await db.insert(menuItems).values(menuItemsData);
      console.log('Added menu items');
    }
    
    // Test the API query
    const menuWithItems = await db.select().from(menus)
      .leftJoin(menuItems, eq(menus.id, menuItems.menuId))
      .where(eq(menus.location, 'header'));
    
    console.log('Menu with items:', menuWithItems);
    
    console.log('✅ Header menu setup complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createHeaderMenu();