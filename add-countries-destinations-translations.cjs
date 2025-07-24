const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function addCountriesDestinationsTranslations() {
  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Countries-Cities Management translations
    const countryTranslations = [
      // Page headers and navigation
      { key: 'admin.countries_cities.title', en: 'Countries & Cities Management', ar: 'إدارة البلدان والمدن' },
      { key: 'admin.countries_cities.description', en: 'Manage geographic locations, countries, cities, and airports', ar: 'إدارة المواقع الجغرافية والبلدان والمدن والمطارات' },
      
      // Tab navigation
      { key: 'admin.countries_cities.countries', en: 'Countries', ar: 'البلدان' },
      { key: 'admin.countries_cities.cities', en: 'Cities', ar: 'المدن' },
      { key: 'admin.countries_cities.airports', en: 'Airports', ar: 'المطارات' },
      
      // Button actions
      { key: 'admin.countries_cities.add_country', en: 'Add Country', ar: 'إضافة بلد' },
      { key: 'admin.countries_cities.add_city', en: 'Add City', ar: 'إضافة مدينة' },
      { key: 'admin.countries_cities.add_airport', en: 'Add Airport', ar: 'إضافة مطار' },
      { key: 'admin.countries_cities.analytics', en: 'Analytics', ar: 'التحليلات' },
      { key: 'admin.countries_cities.ai_generate', en: 'AI Generate', ar: 'إنشاء بالذكاء الاصطناعي' },
      
      // Analytics section
      { key: 'admin.countries_cities.analytics_dashboard', en: 'Analytics Dashboard', ar: 'لوحة التحليلات' },
      { key: 'admin.countries_cities.total_countries', en: 'Countries', ar: 'البلدان' },
      { key: 'admin.countries_cities.total_cities', en: 'Cities', ar: 'المدن' },
      { key: 'admin.countries_cities.total_airports', en: 'Airports', ar: 'المطارات' },
      { key: 'admin.countries_cities.active', en: 'active', ar: 'نشط' },
      { key: 'admin.countries_cities.coverage', en: 'Coverage', ar: 'التغطية' },
      { key: 'admin.countries_cities.cities_per_country', en: 'cities/country', ar: 'مدينة/بلد' },
      
      // Search and filters
      { key: 'admin.countries_cities.search_countries', en: 'Search countries...', ar: 'البحث في البلدان...' },
      { key: 'admin.countries_cities.search_cities', en: 'Search cities...', ar: 'البحث في المدن...' },
      { key: 'admin.countries_cities.search_airports', en: 'Search airports...', ar: 'البحث في المطارات...' },
      { key: 'admin.countries_cities.filter_status', en: 'Filter by status', ar: 'تصفية حسب الحالة' },
      { key: 'admin.countries_cities.filter_country', en: 'Filter by country', ar: 'تصفية حسب البلد' },
      { key: 'admin.countries_cities.all', en: 'All', ar: 'الكل' },
      { key: 'admin.countries_cities.active_only', en: 'Active', ar: 'النشط فقط' },
      { key: 'admin.countries_cities.inactive_only', en: 'Inactive', ar: 'غير النشط فقط' },
      
      // Bulk actions
      { key: 'admin.countries_cities.selected', en: 'selected', ar: 'محددة' },
      { key: 'admin.countries_cities.actions', en: 'Actions', ar: 'الإجراءات' },
      { key: 'admin.countries_cities.activate', en: 'Activate', ar: 'تنشيط' },
      { key: 'admin.countries_cities.deactivate', en: 'Deactivate', ar: 'إلغاء التنشيط' },
      { key: 'admin.countries_cities.delete', en: 'Delete', ar: 'حذف' },
      { key: 'admin.countries_cities.apply', en: 'Apply', ar: 'تطبيق' },
      { key: 'admin.countries_cities.clear', en: 'Clear', ar: 'مسح' },
      
      // Country form fields
      { key: 'admin.countries_cities.create_country', en: 'Create New Country', ar: 'إنشاء بلد جديد' },
      { key: 'admin.countries_cities.edit_country', en: 'Edit Country', ar: 'تعديل البلد' },
      { key: 'admin.countries_cities.country_name', en: 'Country Name', ar: 'اسم البلد' },
      { key: 'admin.countries_cities.country_code', en: 'Country Code', ar: 'رمز البلد' },
      { key: 'admin.countries_cities.country_description', en: 'Description', ar: 'الوصف' },
      { key: 'admin.countries_cities.country_image', en: 'Image URL', ar: 'رابط الصورة' },
      { key: 'admin.countries_cities.country_status', en: 'Status', ar: 'الحالة' },
      
      // City form fields
      { key: 'admin.countries_cities.create_city', en: 'Create New City', ar: 'إنشاء مدينة جديدة' },
      { key: 'admin.countries_cities.edit_city', en: 'Edit City', ar: 'تعديل المدينة' },
      { key: 'admin.countries_cities.city_name', en: 'City Name', ar: 'اسم المدينة' },
      { key: 'admin.countries_cities.select_country', en: 'Select Country', ar: 'اختر البلد' },
      { key: 'admin.countries_cities.city_description', en: 'Description', ar: 'الوصف' },
      { key: 'admin.countries_cities.city_image', en: 'Image URL', ar: 'رابط الصورة' },
      { key: 'admin.countries_cities.city_status', en: 'Status', ar: 'الحالة' },
      
      // Airport form fields
      { key: 'admin.countries_cities.create_airport', en: 'Create New Airport', ar: 'إنشاء مطار جديد' },
      { key: 'admin.countries_cities.edit_airport', en: 'Edit Airport', ar: 'تعديل المطار' },
      { key: 'admin.countries_cities.airport_name', en: 'Airport Name', ar: 'اسم المطار' },
      { key: 'admin.countries_cities.airport_code', en: 'Airport Code', ar: 'رمز المطار' },
      { key: 'admin.countries_cities.select_city', en: 'Select City', ar: 'اختر المدينة' },
      { key: 'admin.countries_cities.airport_description', en: 'Description', ar: 'الوصف' },
      { key: 'admin.countries_cities.airport_image', en: 'Image URL', ar: 'رابط الصورة' },
      { key: 'admin.countries_cities.airport_status', en: 'Status', ar: 'الحالة' },
      
      // Form buttons
      { key: 'admin.countries_cities.create', en: 'Create', ar: 'إنشاء' },
      { key: 'admin.countries_cities.update', en: 'Update', ar: 'تحديث' },
      { key: 'admin.countries_cities.cancel', en: 'Cancel', ar: 'إلغاء' },
      { key: 'admin.countries_cities.save', en: 'Save', ar: 'حفظ' },
      
      // Card actions
      { key: 'admin.countries_cities.edit', en: 'Edit', ar: 'تعديل' },
      { key: 'admin.countries_cities.view', en: 'View', ar: 'عرض' },
      { key: 'admin.countries_cities.more_options', en: 'More options', ar: 'خيارات أكثر' },
      
      // Status labels
      { key: 'admin.countries_cities.status_active', en: 'Active', ar: 'نشط' },
      { key: 'admin.countries_cities.status_inactive', en: 'Inactive', ar: 'غير نشط' },
      
      // Success messages
      { key: 'admin.countries_cities.country_created', en: 'Country created successfully', ar: 'تم إنشاء البلد بنجاح' },
      { key: 'admin.countries_cities.country_updated', en: 'Country updated successfully', ar: 'تم تحديث البلد بنجاح' },
      { key: 'admin.countries_cities.country_deleted', en: 'Country deleted successfully', ar: 'تم حذف البلد بنجاح' },
      { key: 'admin.countries_cities.city_created', en: 'City created successfully', ar: 'تم إنشاء المدينة بنجاح' },
      { key: 'admin.countries_cities.city_updated', en: 'City updated successfully', ar: 'تم تحديث المدينة بنجاح' },
      { key: 'admin.countries_cities.city_deleted', en: 'City deleted successfully', ar: 'تم حذف المدينة بنجاح' },
      { key: 'admin.countries_cities.airport_created', en: 'Airport created successfully', ar: 'تم إنشاء المطار بنجاح' },
      { key: 'admin.countries_cities.airport_updated', en: 'Airport updated successfully', ar: 'تم تحديث المطار بنجاح' },
      { key: 'admin.countries_cities.airport_deleted', en: 'Airport deleted successfully', ar: 'تم حذف المطار بنجاح' },
      
      // Error messages
      { key: 'admin.countries_cities.error', en: 'Error', ar: 'خطأ' },
      { key: 'admin.countries_cities.success', en: 'Success', ar: 'نجح' },
      { key: 'admin.countries_cities.invalid_image_url', en: 'Invalid Image URL', ar: 'رابط صورة غير صحيح' },
      { key: 'admin.countries_cities.invalid_country_code', en: 'Invalid Country Code', ar: 'رمز بلد غير صحيح' },
      { key: 'admin.countries_cities.invalid_airport_code', en: 'Invalid Airport Code', ar: 'رمز مطار غير صحيح' },
      { key: 'admin.countries_cities.country_required', en: 'Country Required', ar: 'البلد مطلوب' },
      { key: 'admin.countries_cities.city_required', en: 'City Required', ar: 'المدينة مطلوبة' },
      
      // Delete confirmation
      { key: 'admin.countries_cities.delete_country_title', en: 'Delete Country', ar: 'حذف البلد' },
      { key: 'admin.countries_cities.delete_country_description', en: 'Are you sure you want to delete this country? This action cannot be undone.', ar: 'هل أنت متأكد من حذف هذا البلد؟ هذا الإجراء لا يمكن التراجع عنه.' },
      { key: 'admin.countries_cities.delete_city_title', en: 'Delete City', ar: 'حذف المدينة' },
      { key: 'admin.countries_cities.delete_city_description', en: 'Are you sure you want to delete this city? This action cannot be undone.', ar: 'هل أنت متأكد من حذف هذه المدينة؟ هذا الإجراء لا يمكن التراجع عنه.' },
      { key: 'admin.countries_cities.delete_airport_title', en: 'Delete Airport', ar: 'حذف المطار' },
      { key: 'admin.countries_cities.delete_airport_description', en: 'Are you sure you want to delete this airport? This action cannot be undone.', ar: 'هل أنت متأكد من حذف هذا المطار؟ هذا الإجراء لا يمكن التراجع عنه.' },
      
      // AI Generation
      { key: 'admin.countries_cities.ai_generation_title', en: 'AI Data Generation', ar: 'إنشاء البيانات بالذكاء الاصطناعي' },
      { key: 'admin.countries_cities.ai_generation_description', en: 'Generate cities and data for a country using AI', ar: 'إنشاء المدن والبيانات لبلد باستخدام الذكاء الاصطناعي' },
      { key: 'admin.countries_cities.enter_country_name', en: 'Enter country name', ar: 'أدخل اسم البلد' },
      { key: 'admin.countries_cities.generate', en: 'Generate', ar: 'إنشاء' },
      { key: 'admin.countries_cities.country_name_required', en: 'Country Name Required', ar: 'اسم البلد مطلوب' },
      { key: 'admin.countries_cities.enter_country_for_generation', en: 'Please enter a country name to generate cities', ar: 'يرجى إدخال اسم البلد لإنشاء المدن' },
      { key: 'admin.countries_cities.ai_generation_failed', en: 'AI Generation Failed', ar: 'فشل الإنشاء بالذكاء الاصطناعي' },
      { key: 'admin.countries_cities.ai_generation_success', en: 'AI data generated successfully', ar: 'تم إنشاء البيانات بالذكاء الاصطناعي بنجاح' },
      
      // View modes
      { key: 'admin.countries_cities.grid_view', en: 'Grid View', ar: 'عرض الشبكة' },
      { key: 'admin.countries_cities.list_view', en: 'List View', ar: 'عرض القائمة' },
      
      // Loading states
      { key: 'admin.countries_cities.loading', en: 'Loading...', ar: 'جاري التحميل...' },
      { key: 'admin.countries_cities.generating', en: 'Generating...', ar: 'جاري الإنشاء...' },
      { key: 'admin.countries_cities.uploading', en: 'Uploading...', ar: 'جاري الرفع...' },
      
      // Image upload
      { key: 'admin.countries_cities.image_upload_mode', en: 'Image Upload Mode', ar: 'وضع رفع الصورة' },
      { key: 'admin.countries_cities.url_mode', en: 'URL', ar: 'رابط' },
      { key: 'admin.countries_cities.upload_mode', en: 'Upload', ar: 'رفع' },
      { key: 'admin.countries_cities.choose_file', en: 'Choose File', ar: 'اختر ملف' },
      { key: 'admin.countries_cities.upload_failed', en: 'Upload failed', ar: 'فشل الرفع' },
      { key: 'admin.countries_cities.preview', en: 'Preview', ar: 'معاينة' },
    ];

    // Destinations Management translations
    const destinationTranslations = [
      // Page headers
      { key: 'admin.destinations.title', en: 'Destinations Management', ar: 'إدارة الوجهات' },
      { key: 'admin.destinations.description', en: 'Manage travel destinations and featured locations', ar: 'إدارة الوجهات السياحية والمواقع المميزة' },
      
      // Main actions
      { key: 'admin.destinations.add_destination', en: 'Add Destination', ar: 'إضافة وجهة' },
      { key: 'admin.destinations.search_destinations', en: 'Search destinations...', ar: 'البحث في الوجهات...' },
      { key: 'admin.destinations.export_data', en: 'Export Data', ar: 'تصدير البيانات' },
      { key: 'admin.destinations.batch_add', en: 'Batch Add', ar: 'إضافة مجمعة' },
      
      // Destination form
      { key: 'admin.destinations.create_destination', en: 'Create New Destination', ar: 'إنشاء وجهة جديدة' },
      { key: 'admin.destinations.edit_destination', en: 'Edit Destination', ar: 'تعديل الوجهة' },
      { key: 'admin.destinations.destination_name', en: 'Destination Name', ar: 'اسم الوجهة' },
      { key: 'admin.destinations.destination_country', en: 'Country', ar: 'البلد' },
      { key: 'admin.destinations.destination_city', en: 'City', ar: 'المدينة' },
      { key: 'admin.destinations.destination_description', en: 'Description', ar: 'الوصف' },
      { key: 'admin.destinations.destination_image', en: 'Image URL', ar: 'رابط الصورة' },
      { key: 'admin.destinations.featured_destination', en: 'Featured Destination', ar: 'وجهة مميزة' },
      
      // Batch form
      { key: 'admin.destinations.batch_add_destinations', en: 'Batch Add Destinations', ar: 'إضافة وجهات مجمعة' },
      { key: 'admin.destinations.select_country_city', en: 'Select Country and City', ar: 'اختر البلد والمدينة' },
      { key: 'admin.destinations.destination_names', en: 'Destination Names', ar: 'أسماء الوجهات' },
      { key: 'admin.destinations.enter_destination_names', en: 'Enter destination names (one per line)', ar: 'أدخل أسماء الوجهات (اسم واحد في كل سطر)' },
      
      // Status and filters
      { key: 'admin.destinations.featured', en: 'Featured', ar: 'مميزة' },
      { key: 'admin.destinations.not_featured', en: 'Not Featured', ar: 'غير مميزة' },
      { key: 'admin.destinations.filter_by_country', en: 'Filter by country', ar: 'تصفية حسب البلد' },
      
      // Actions
      { key: 'admin.destinations.edit', en: 'Edit', ar: 'تعديل' },
      { key: 'admin.destinations.delete', en: 'Delete', ar: 'حذف' },
      { key: 'admin.destinations.create', en: 'Create', ar: 'إنشاء' },
      { key: 'admin.destinations.update', en: 'Update', ar: 'تحديث' },
      { key: 'admin.destinations.cancel', en: 'Cancel', ar: 'إلغاء' },
      { key: 'admin.destinations.save', en: 'Save', ar: 'حفظ' },
      
      // Success messages
      { key: 'admin.destinations.destination_created', en: 'Destination created successfully', ar: 'تم إنشاء الوجهة بنجاح' },
      { key: 'admin.destinations.destination_updated', en: 'Destination updated successfully', ar: 'تم تحديث الوجهة بنجاح' },
      { key: 'admin.destinations.destination_deleted', en: 'Destination deleted successfully', ar: 'تم حذف الوجهة بنجاح' },
      { key: 'admin.destinations.destinations_created', en: 'destinations created successfully', ar: 'تم إنشاء الوجهات بنجاح' },
      
      // Error messages
      { key: 'admin.destinations.error', en: 'Error', ar: 'خطأ' },
      { key: 'admin.destinations.success', en: 'Success', ar: 'نجح' },
      { key: 'admin.destinations.failed_to_create', en: 'Failed to create destination', ar: 'فشل في إنشاء الوجهة' },
      { key: 'admin.destinations.failed_to_update', en: 'Failed to update destination', ar: 'فشل في تحديث الوجهة' },
      { key: 'admin.destinations.failed_to_delete', en: 'Failed to delete destination', ar: 'فشل في حذف الوجهة' },
      
      // Delete confirmation
      { key: 'admin.destinations.delete_destination_title', en: 'Delete Destination', ar: 'حذف الوجهة' },
      { key: 'admin.destinations.delete_destination_description', en: 'Are you sure you want to delete this destination? This action cannot be undone.', ar: 'هل أنت متأكد من حذف هذه الوجهة؟ هذا الإجراء لا يمكن التراجع عنه.' },
      
      // Loading states
      { key: 'admin.destinations.loading', en: 'Loading...', ar: 'جاري التحميل...' },
      { key: 'admin.destinations.creating', en: 'Creating...', ar: 'جاري الإنشاء...' },
      { key: 'admin.destinations.updating', en: 'Updating...', ar: 'جاري التحديث...' },
      { key: 'admin.destinations.deleting', en: 'Deleting...', ar: 'جاري الحذف...' },
      { key: 'admin.destinations.uploading', en: 'Uploading...', ar: 'جاري الرفع...' },
      
      // Image upload
      { key: 'admin.destinations.image_upload_mode', en: 'Image Upload Mode', ar: 'وضع رفع الصورة' },
      { key: 'admin.destinations.url_mode', en: 'URL', ar: 'رابط' },
      { key: 'admin.destinations.upload_mode', en: 'Upload', ar: 'رفع' },
      { key: 'admin.destinations.choose_file', en: 'Choose File', ar: 'اختر ملف' },
      { key: 'admin.destinations.upload_failed', en: 'Upload failed', ar: 'فشل الرفع' },
      { key: 'admin.destinations.preview', en: 'Preview', ar: 'معاينة' },
      
      // Empty states
      { key: 'admin.destinations.no_destinations', en: 'No destinations found', ar: 'لم يتم العثور على وجهات' },
      { key: 'admin.destinations.create_first_destination', en: 'Create your first destination', ar: 'أنشئ وجهتك الأولى' },
      
      // Validation messages
      { key: 'admin.destinations.name_required', en: 'Destination name is required', ar: 'اسم الوجهة مطلوب' },
      { key: 'admin.destinations.country_required', en: 'Country is required', ar: 'البلد مطلوب' },
      { key: 'admin.destinations.city_required', en: 'City is required', ar: 'المدينة مطلوبة' },
      { key: 'admin.destinations.invalid_image_url', en: 'Please provide a valid image URL', ar: 'يرجى تقديم رابط صورة صحيح' },
    ];

    // Combine all translations
    const allTranslations = [...countryTranslations, ...destinationTranslations];

    console.log(`Adding ${allTranslations.length} translation keys...`);

    for (const translation of allTranslations) {
      try {
        // Check if translation already exists
        const existingResult = await client.query(
          'SELECT id FROM translations WHERE key = $1',
          [translation.key]
        );

        if (existingResult.rows.length > 0) {
          // Update existing translation
          await client.query(
            'UPDATE translations SET en_text = $1, ar_text = $2, updated_at = NOW() WHERE key = $3',
            [translation.en, translation.ar, translation.key]
          );
        } else {
          // Insert new translation
          await client.query(
            'INSERT INTO translations (key, en_text, ar_text, category, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
            [translation.key, translation.en, translation.ar, 'admin']
          );
        }
      } catch (error) {
        console.error(`Error processing translation key "${translation.key}":`, error.message);
      }
    }

    console.log('✅ All translations added successfully');
    
    // Verify the additions
    const countResult = await client.query(
      'SELECT COUNT(*) FROM translations WHERE key LIKE $1 OR key LIKE $2',
      ['admin.countries_cities.%', 'admin.destinations.%']
    );
    
    console.log(`📊 Total translations for Countries-Cities & Destinations: ${countResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error adding translations:', error);
  } finally {
    await client.end();
  }
}

addCountriesDestinationsTranslations();