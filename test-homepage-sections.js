// Test script to verify homepage sections functionality
import fs from 'fs';
import path from 'path';

console.log('Testing Homepage Sections Implementation...\n');

// 1. Check if all necessary files exist
const requiredFiles = [
  'shared/schema.ts',
  'server/storage.ts', 
  'server/routes.ts',
  'client/src/components/homepage/DynamicHomepageSection.tsx',
  'client/src/pages/admin/HomepageSectionsManagement.tsx',
  'client/src/pages/Home.tsx'
];

console.log('1. Checking required files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`✗ ${file} missing`);
  }
});

// 2. Check if database schema includes homepage sections
console.log('\n2. Checking database schema:');
try {
  const schemaContent = fs.readFileSync('shared/schema.ts', 'utf8');
  if (schemaContent.includes('homepageSections')) {
    console.log('✓ Homepage sections table defined in schema');
  } else {
    console.log('✗ Homepage sections table missing from schema');
  }
  
  if (schemaContent.includes('insertHomepageSectionSchema')) {
    console.log('✓ Insert schema defined');
  } else {
    console.log('✗ Insert schema missing');
  }
} catch (error) {
  console.log('✗ Error reading schema file:', error.message);
}

// 3. Check if storage interface includes homepage sections methods
console.log('\n3. Checking storage interface:');
try {
  const storageContent = fs.readFileSync('server/storage.ts', 'utf8');
  const requiredMethods = [
    'getHomepageSection',
    'listHomepageSections', 
    'createHomepageSection',
    'updateHomepageSection',
    'deleteHomepageSection'
  ];
  
  requiredMethods.forEach(method => {
    if (storageContent.includes(method)) {
      console.log(`✓ ${method} method exists`);
    } else {
      console.log(`✗ ${method} method missing`);
    }
  });
} catch (error) {
  console.log('✗ Error reading storage file:', error.message);
}

// 4. Check if API routes exist
console.log('\n4. Checking API routes:');
try {
  const routesContent = fs.readFileSync('server/routes.ts', 'utf8');
  const requiredRoutes = [
    '/api/homepage-sections',
    '/api/admin/homepage-sections'
  ];
  
  requiredRoutes.forEach(route => {
    if (routesContent.includes(route)) {
      console.log(`✓ ${route} route exists`);
    } else {
      console.log(`✗ ${route} route missing`);
    }
  });
} catch (error) {
  console.log('✗ Error reading routes file:', error.message);
}

// 5. Check if admin route is registered
console.log('\n5. Checking admin route registration:');
try {
  const appContent = fs.readFileSync('client/src/App.tsx', 'utf8');
  if (appContent.includes('HomepageSectionsManagement')) {
    console.log('✓ Admin component imported');
  } else {
    console.log('✗ Admin component not imported');
  }
  
  if (appContent.includes('/admin/homepage-sections')) {
    console.log('✓ Admin route registered');
  } else {
    console.log('✗ Admin route not registered');
  }
} catch (error) {
  console.log('✗ Error reading App.tsx file:', error.message);
}

// 6. Check if sidebar includes homepage sections link
console.log('\n6. Checking admin sidebar:');
try {
  const sidebarContent = fs.readFileSync('client/src/components/dashboard/Sidebar.tsx', 'utf8');
  if (sidebarContent.includes('homepageSections')) {
    console.log('✓ Sidebar link exists');
  } else {
    console.log('✗ Sidebar link missing');
  }
} catch (error) {
  console.log('✗ Error reading sidebar file:', error.message);
}

// 7. Check if Home page integrates dynamic sections
console.log('\n7. Checking Home page integration:');
try {
  const homeContent = fs.readFileSync('client/src/pages/Home.tsx', 'utf8');
  if (homeContent.includes('DynamicHomepageSection')) {
    console.log('✓ Dynamic sections component imported');
  } else {
    console.log('✗ Dynamic sections component not imported');
  }
  
  if (homeContent.includes('/api/homepage-sections')) {
    console.log('✓ API call for sections exists');
  } else {
    console.log('✗ API call for sections missing');
  }
} catch (error) {
  console.log('✗ Error reading Home.tsx file:', error.message);
}

console.log('\n✅ Homepage Sections Implementation Test Complete!');
console.log('\nNext steps:');
console.log('1. Start the development server');
console.log('2. Visit /admin/homepage-sections to create content');
console.log('3. Visit / to see dynamic sections on homepage');
console.log('4. Test the full CRUD functionality');