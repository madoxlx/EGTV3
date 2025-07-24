#!/usr/bin/env node

const { Client } = require('pg');

const translations = [
  // Navigation Manager Page Translations
  { key: 'admin.navigation.title', enText: 'Navigation Manager', arText: 'إدارة القوائم', category: 'admin' },
  { key: 'admin.navigation.description', enText: 'Manage your website navigation menus and menu items', arText: 'إدارة قوائم التنقل والعناصر في موقعك', category: 'admin' },
  
  // Menu Management
  { key: 'admin.navigation.menus.title', enText: 'Menus', arText: 'القوائم', category: 'admin' },
  { key: 'admin.navigation.menus.create', enText: 'Create Menu', arText: 'إنشاء قائمة', category: 'admin' },
  { key: 'admin.navigation.menus.name', enText: 'Menu Name', arText: 'اسم القائمة', category: 'admin' },
  { key: 'admin.navigation.menus.location', enText: 'Location', arText: 'الموقع', category: 'admin' },
  { key: 'admin.navigation.menus.description', enText: 'Description', arText: 'الوصف', category: 'admin' },
  { key: 'admin.navigation.menus.active', enText: 'Active', arText: 'نشط', category: 'admin' },
  { key: 'admin.navigation.menus.itemsCount', enText: 'Items', arText: 'العناصر', category: 'admin' },
  { key: 'admin.navigation.menus.noMenus', enText: 'No menus found', arText: 'لا توجد قوائم', category: 'admin' },
  { key: 'admin.navigation.menus.createFirst', enText: 'Create your first menu to get started', arText: 'قم بإنشاء القائمة الأولى للبدء', category: 'admin' },
  
  // Menu Items Management  
  { key: 'admin.navigation.items.title', enText: 'Menu Items', arText: 'عناصر القائمة', category: 'admin' },
  { key: 'admin.navigation.items.selectMenu', enText: 'Select a menu to manage its items', arText: 'اختر قائمة لإدارة عناصرها', category: 'admin' },
  { key: 'admin.navigation.items.addItem', enText: 'Add Item', arText: 'إضافة عنصر', category: 'admin' },
  { key: 'admin.navigation.items.refresh', enText: 'Refresh', arText: 'تحديث', category: 'admin' },
  { key: 'admin.navigation.items.noItems', enText: 'No menu items found', arText: 'لا توجد عناصر في القائمة', category: 'admin' },
  { key: 'admin.navigation.items.addFirst', enText: 'Add your first menu item to get started', arText: 'أضف أول عنصر في القائمة للبدء', category: 'admin' },
  
  // Form Fields
  { key: 'admin.navigation.form.title', enText: 'Title', arText: 'العنوان', category: 'admin' },
  { key: 'admin.navigation.form.titleEn', enText: 'Title (English)', arText: 'العنوان (بالإنجليزية)', category: 'admin' },
  { key: 'admin.navigation.form.titleAr', enText: 'Title (Arabic)', arText: 'العنوان (بالعربية)', category: 'admin' },
  { key: 'admin.navigation.form.url', enText: 'URL', arText: 'الرابط', category: 'admin' },
  { key: 'admin.navigation.form.icon', enText: 'Icon', arText: 'الأيقونة', category: 'admin' },
  { key: 'admin.navigation.form.type', enText: 'Type', arText: 'النوع', category: 'admin' },
  { key: 'admin.navigation.form.target', enText: 'Target', arText: 'الهدف', category: 'admin' },
  { key: 'admin.navigation.form.parent', enText: 'Parent Item', arText: 'العنصر الأب', category: 'admin' },
  { key: 'admin.navigation.form.parentSelect', enText: 'Select parent item...', arText: 'اختر العنصر الأب...', category: 'admin' },
  { key: 'admin.navigation.form.noParent', enText: 'No Parent (Top Level)', arText: 'بدون أب (المستوى الأول)', category: 'admin' },
  
  // Form Placeholders
  { key: 'admin.navigation.form.titlePlaceholder', enText: 'Enter menu item title', arText: 'أدخل عنوان العنصر', category: 'admin' },
  { key: 'admin.navigation.form.titleArPlaceholder', enText: 'أدخل العنوان بالعربية', arText: 'أدخل العنوان بالعربية', category: 'admin' },
  { key: 'admin.navigation.form.urlPlaceholder', enText: 'Enter URL (e.g., /about)', arText: 'أدخل الرابط (مثل: /about)', category: 'admin' },
  { key: 'admin.navigation.form.menuNamePlaceholder', enText: 'Enter menu name', arText: 'أدخل اسم القائمة', category: 'admin' },
  { key: 'admin.navigation.form.locationPlaceholder', enText: 'Enter location (e.g., header)', arText: 'أدخل الموقع (مثل: header)', category: 'admin' },
  { key: 'admin.navigation.form.descPlaceholder', enText: 'Enter menu description', arText: 'أدخل وصف القائمة', category: 'admin' },
  
  // Form Options
  { key: 'admin.navigation.form.type.link', enText: 'Link', arText: 'رابط', category: 'admin' },
  { key: 'admin.navigation.form.type.page', enText: 'Page', arText: 'صفحة', category: 'admin' },
  { key: 'admin.navigation.form.target.self', enText: 'Same Window', arText: 'نفس النافذة', category: 'admin' },
  { key: 'admin.navigation.form.target.blank', enText: 'New Window', arText: 'نافذة جديدة', category: 'admin' },
  
  // Actions
  { key: 'admin.navigation.actions.edit', enText: 'Edit', arText: 'تعديل', category: 'admin' },
  { key: 'admin.navigation.actions.delete', enText: 'Delete', arText: 'حذف', category: 'admin' },
  { key: 'admin.navigation.actions.save', enText: 'Save', arText: 'حفظ', category: 'admin' },
  { key: 'admin.navigation.actions.cancel', enText: 'Cancel', arText: 'إلغاء', category: 'admin' },
  { key: 'admin.navigation.actions.create', enText: 'Create', arText: 'إنشاء', category: 'admin' },
  { key: 'admin.navigation.actions.update', enText: 'Update', arText: 'تحديث', category: 'admin' },
  
  // Dialog Titles
  { key: 'admin.navigation.dialog.createMenu', enText: 'Create New Menu', arText: 'إنشاء قائمة جديدة', category: 'admin' },
  { key: 'admin.navigation.dialog.editMenu', enText: 'Edit Menu', arText: 'تعديل القائمة', category: 'admin' },
  { key: 'admin.navigation.dialog.createItem', enText: 'Create Menu Item', arText: 'إنشاء عنصر قائمة', category: 'admin' },
  { key: 'admin.navigation.dialog.editItem', enText: 'Edit Menu Item', arText: 'تعديل عنصر القائمة', category: 'admin' },
  
  // Status and Messages
  { key: 'admin.navigation.status.childOf', enText: 'Child of:', arText: 'فرع من:', category: 'admin' },
  { key: 'admin.navigation.status.hasChildren', enText: 'Has children', arText: 'له فروع', category: 'admin' },
  { key: 'admin.navigation.status.topLevel', enText: 'Top Level', arText: 'المستوى الأول', category: 'admin' },
  
  // Success Messages
  { key: 'admin.navigation.success.menuCreated', enText: 'Menu created successfully', arText: 'تم إنشاء القائمة بنجاح', category: 'admin' },
  { key: 'admin.navigation.success.menuUpdated', enText: 'Menu updated successfully', arText: 'تم تحديث القائمة بنجاح', category: 'admin' },
  { key: 'admin.navigation.success.menuDeleted', enText: 'Menu deleted successfully', arText: 'تم حذف القائمة بنجاح', category: 'admin' },
  { key: 'admin.navigation.success.itemCreated', enText: 'Menu item created successfully', arText: 'تم إنشاء عنصر القائمة بنجاح', category: 'admin' },
  { key: 'admin.navigation.success.itemUpdated', enText: 'Menu item updated successfully', arText: 'تم تحديث عنصر القائمة بنجاح', category: 'admin' },
  { key: 'admin.navigation.success.itemDeleted', enText: 'Menu item deleted successfully', arText: 'تم حذف عنصر القائمة بنجاح', category: 'admin' },
  { key: 'admin.navigation.success.itemsReordered', enText: 'Menu items reordered successfully', arText: 'تم إعادة ترتيب عناصر القائمة بنجاح', category: 'admin' },
  
  // Error Messages
  { key: 'admin.navigation.error.createMenu', enText: 'Failed to create menu', arText: 'فشل في إنشاء القائمة', category: 'admin' },
  { key: 'admin.navigation.error.updateMenu', enText: 'Failed to update menu', arText: 'فشل في تحديث القائمة', category: 'admin' },
  { key: 'admin.navigation.error.deleteMenu', enText: 'Failed to delete menu', arText: 'فشل في حذف القائمة', category: 'admin' },
  { key: 'admin.navigation.error.createItem', enText: 'Failed to create menu item', arText: 'فشل في إنشاء عنصر القائمة', category: 'admin' },
  { key: 'admin.navigation.error.updateItem', enText: 'Failed to update menu item', arText: 'فشل في تحديث عنصر القائمة', category: 'admin' },
  { key: 'admin.navigation.error.deleteItem', enText: 'Failed to delete menu item', arText: 'فشل في حذف عنصر القائمة', category: 'admin' },
  { key: 'admin.navigation.error.reorderItems', enText: 'Failed to reorder menu items', arText: 'فشل في إعادة ترتيب عناصر القائمة', category: 'admin' }
];

async function addAdminTranslations() {
  const client = new Client({
    connectionString: 'postgresql://myuser:MyStrongPass123!@20.77.106.39:5432/mydb'
  });
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');
    
    console.log('Adding NavigationManager translations...');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const translation of translations) {
      try {
        // Check if translation key already exists
        const existingResult = await client.query(
          'SELECT id FROM translations WHERE key = $1',
          [translation.key]
        );
        
        if (existingResult.rows.length > 0) {
          console.log(`⏭️  Skipping existing key: ${translation.key}`);
          skippedCount++;
          continue;
        }
        
        // Insert new translation
        await client.query(
          `INSERT INTO translations (key, en_text, ar_text, category, created_at) 
           VALUES ($1, $2, $3, $4, NOW())`,
          [translation.key, translation.enText, translation.arText, translation.category]
        );
        
        console.log(`✅ Added: ${translation.key}`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ Error adding ${translation.key}:`, error.message);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Added: ${addedCount} translations`);
    console.log(`   ⏭️  Skipped: ${skippedCount} existing translations`);
    console.log(`   📝 Total processed: ${translations.length} translations`);
    
  } catch (error) {
    console.error('❌ Error adding admin translations:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addAdminTranslations();