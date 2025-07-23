import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { translations } from './shared/schema';
import { eq } from 'drizzle-orm';

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function addAdminTranslations() {
  const adminTranslations = [
    // Tours Management
    { key: 'admin.tours.title', enText: 'Tours Management', arText: 'إدارة الجولات', category: 'admin' },
    { key: 'admin.tours.create', enText: 'Create Tour', arText: 'إنشاء جولة', category: 'admin' },
    { key: 'admin.tours.edit', enText: 'Edit Tour', arText: 'تعديل جولة', category: 'admin' },
    { key: 'admin.tours.delete', enText: 'Delete Tour', arText: 'حذف جولة', category: 'admin' },
    { key: 'admin.tours.search', enText: 'Search tours...', arText: 'البحث في الجولات...', category: 'admin' },
    { key: 'admin.tours.description', enText: 'Manage tour packages and experiences', arText: 'إدارة حزم الجولات والتجارب', category: 'admin' },
    { key: 'admin.tours.total', enText: 'Total Tours', arText: 'إجمالي الجولات', category: 'admin' },
    { key: 'admin.tours.active', enText: 'Active Tours', arText: 'الجولات النشطة', category: 'admin' },
    { key: 'admin.tours.featured', enText: 'Featured Tours', arText: 'الجولات المميزة', category: 'admin' },

    // Destinations Management
    { key: 'admin.destinations.title', enText: 'Destinations Management', arText: 'إدارة الوجهات', category: 'admin' },
    { key: 'admin.destinations.create', enText: 'Create Destination', arText: 'إنشاء وجهة', category: 'admin' },
    { key: 'admin.destinations.edit', enText: 'Edit Destination', arText: 'تعديل وجهة', category: 'admin' },
    { key: 'admin.destinations.delete', enText: 'Delete Destination', arText: 'حذف وجهة', category: 'admin' },
    { key: 'admin.destinations.search', enText: 'Search destinations...', arText: 'البحث في الوجهات...', category: 'admin' },
    { key: 'admin.destinations.description', enText: 'Manage travel destinations and locations', arText: 'إدارة وجهات السفر والأماكن', category: 'admin' },
    { key: 'admin.destinations.total', enText: 'Total Destinations', arText: 'إجمالي الوجهات', category: 'admin' },
    { key: 'admin.destinations.featured', enText: 'Featured Destinations', arText: 'الوجهات المميزة', category: 'admin' },

    // Countries & Cities Management
    { key: 'admin.countries_cities.title', enText: 'Countries & Cities', arText: 'البلدان والمدن', category: 'admin' },
    { key: 'admin.countries_cities.description', enText: 'Manage countries and cities', arText: 'إدارة البلدان والمدن', category: 'admin' },
    { key: 'admin.countries.title', enText: 'Countries', arText: 'البلدان', category: 'admin' },
    { key: 'admin.countries.create', enText: 'Add Country', arText: 'إضافة بلد', category: 'admin' },
    { key: 'admin.cities.title', enText: 'Cities', arText: 'المدن', category: 'admin' },
    { key: 'admin.cities.create', enText: 'Add City', arText: 'إضافة مدينة', category: 'admin' },

    // Slider Management
    { key: 'admin.slider.title', enText: 'Slider Management', arText: 'إدارة الشريط المتحرك', category: 'admin' },
    { key: 'admin.slider.create', enText: 'Add Slide', arText: 'إضافة شريحة', category: 'admin' },
    { key: 'admin.slider.edit', enText: 'Edit Slide', arText: 'تعديل شريحة', category: 'admin' },
    { key: 'admin.slider.delete', enText: 'Delete Slide', arText: 'حذف شريحة', category: 'admin' },
    { key: 'admin.slider.description', enText: 'Manage homepage slider images and content', arText: 'إدارة صور ومحتوى الشريط المتحرك للصفحة الرئيسية', category: 'admin' },

    // Tours Categories
    { key: 'admin.tour_categories.title', enText: 'Tour Categories', arText: 'فئات الجولات', category: 'admin' },
    { key: 'admin.tour_categories.create', enText: 'Create Category', arText: 'إنشاء فئة', category: 'admin' },
    { key: 'admin.tour_categories.description', enText: 'Manage tour categories and types', arText: 'إدارة فئات وأنواع الجولات', category: 'admin' },

    // Hotels Management
    { key: 'admin.hotels.title', enText: 'Hotels Management', arText: 'إدارة الفنادق', category: 'admin' },
    { key: 'admin.hotels.create', enText: 'Create Hotel', arText: 'إنشاء فندق', category: 'admin' },
    { key: 'admin.hotels.edit', enText: 'Edit Hotel', arText: 'تعديل فندق', category: 'admin' },
    { key: 'admin.hotels.delete', enText: 'Delete Hotel', arText: 'حذف فندق', category: 'admin' },
    { key: 'admin.hotels.description', enText: 'Manage hotels and accommodations', arText: 'إدارة الفنادق وأماكن الإقامة', category: 'admin' },
    { key: 'admin.hotels.total', enText: 'Total Hotels', arText: 'إجمالي الفنادق', category: 'admin' },
    { key: 'admin.hotels.active', enText: 'Active Hotels', arText: 'الفنادق النشطة', category: 'admin' },

    // Transport Locations
    { key: 'admin.transport_locations.title', enText: 'Transport Locations', arText: 'مواقع النقل', category: 'admin' },
    { key: 'admin.transport_locations.create', enText: 'Add Location', arText: 'إضافة موقع', category: 'admin' },
    { key: 'admin.transport_locations.description', enText: 'Manage pickup and dropoff locations', arText: 'إدارة مواقع الاستلام والتسليم', category: 'admin' },

    // Transport Durations
    { key: 'admin.transport_durations.title', enText: 'Transport Durations', arText: 'مدد النقل', category: 'admin' },
    { key: 'admin.transport_durations.create', enText: 'Add Duration', arText: 'إضافة مدة', category: 'admin' },
    { key: 'admin.transport_durations.description', enText: 'Manage transport durations between locations', arText: 'إدارة مدد النقل بين المواقع', category: 'admin' },

    // Navigation Management
    { key: 'admin.navigation.title', enText: 'Navigation Management', arText: 'إدارة التنقل', category: 'admin' },
    { key: 'admin.navigation.create', enText: 'Add Menu Item', arText: 'إضافة عنصر قائمة', category: 'admin' },
    { key: 'admin.navigation.description', enText: 'Manage website navigation and menus', arText: 'إدارة تنقل الموقع والقوائم', category: 'admin' },

    // Homepage Sections
    { key: 'admin.homepage_sections.title', enText: 'Homepage Sections', arText: 'أقسام الصفحة الرئيسية', category: 'admin' },
    { key: 'admin.homepage_sections.create', enText: 'Create Section', arText: 'إنشاء قسم', category: 'admin' },
    { key: 'admin.homepage_sections.description', enText: 'Manage homepage content sections', arText: 'إدارة أقسام محتوى الصفحة الرئيسية', category: 'admin' },
    { key: 'admin.homepage_sections.choose_type', enText: 'Choose Section Type', arText: 'اختر نوع القسم', category: 'admin' },
    { key: 'admin.homepage_sections.image_captions', enText: 'Image & Captions', arText: 'الصور والتسميات التوضيحية', category: 'admin' },
    { key: 'admin.homepage_sections.why_choose_us', enText: 'Why Choose Us', arText: 'لماذا تختارنا', category: 'admin' },

    // Common admin terms
    { key: 'admin.common.name', enText: 'Name', arText: 'الاسم', category: 'admin' },
    { key: 'admin.common.description', enText: 'Description', arText: 'الوصف', category: 'admin' },
    { key: 'admin.common.status', enText: 'Status', arText: 'الحالة', category: 'admin' },
    { key: 'admin.common.active', enText: 'Active', arText: 'نشط', category: 'admin' },
    { key: 'admin.common.inactive', enText: 'Inactive', arText: 'غير نشط', category: 'admin' },
    { key: 'admin.common.featured', enText: 'Featured', arText: 'مميز', category: 'admin' },
    { key: 'admin.common.created_at', enText: 'Created At', arText: 'تاريخ الإنشاء', category: 'admin' },
    { key: 'admin.common.updated_at', enText: 'Updated At', arText: 'تاريخ التحديث', category: 'admin' },
    { key: 'admin.common.actions', enText: 'Actions', arText: 'الإجراءات', category: 'admin' },
    { key: 'admin.common.edit', enText: 'Edit', arText: 'تعديل', category: 'admin' },
    { key: 'admin.common.delete', enText: 'Delete', arText: 'حذف', category: 'admin' },
    { key: 'admin.common.save', enText: 'Save', arText: 'حفظ', category: 'admin' },
    { key: 'admin.common.cancel', enText: 'Cancel', arText: 'إلغاء', category: 'admin' },
    { key: 'admin.common.confirm', enText: 'Confirm', arText: 'تأكيد', category: 'admin' },
    { key: 'admin.common.search', enText: 'Search...', arText: 'البحث...', category: 'admin' },
    { key: 'admin.common.loading', enText: 'Loading...', arText: 'جاري التحميل...', category: 'admin' },
    { key: 'admin.common.no_data', enText: 'No data available', arText: 'لا توجد بيانات متاحة', category: 'admin' },
    { key: 'admin.common.success', enText: 'Success', arText: 'نجح', category: 'admin' },
    { key: 'admin.common.error', enText: 'Error', arText: 'خطأ', category: 'admin' },
    { key: 'admin.common.created_successfully', enText: 'Created successfully', arText: 'تم الإنشاء بنجاح', category: 'admin' },
    { key: 'admin.common.updated_successfully', enText: 'Updated successfully', arText: 'تم التحديث بنجاح', category: 'admin' },
    { key: 'admin.common.deleted_successfully', enText: 'Deleted successfully', arText: 'تم الحذف بنجاح', category: 'admin' },
  ];

  console.log(`Adding ${adminTranslations.length} admin translations...`);

  for (const translation of adminTranslations) {
    try {
      await sql`
        INSERT INTO translations (key, en_text, ar_text, category)
        VALUES (${translation.key}, ${translation.enText}, ${translation.arText}, ${translation.category})
        ON CONFLICT (key) DO UPDATE SET
          ar_text = EXCLUDED.ar_text,
          en_text = EXCLUDED.en_text,
          updated_at = CURRENT_TIMESTAMP
      `;
      console.log(`✓ Added/Updated: ${translation.key}`);
    } catch (error) {
      console.error(`✗ Error with ${translation.key}:`, error);
    }
  }

  await sql.end();
  console.log('✅ Admin translations setup completed!');
}

addAdminTranslations().catch(console.error);