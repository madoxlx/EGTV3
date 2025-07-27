const fs = require('fs');
const path = require('path');

// Tour translations to add
const tourTranslations = [
  // Basic tour navigation and states
  { key: 'tour.back_to_tours', enText: 'Back to Tours', arText: 'العودة إلى الجولات', context: 'navigation', category: 'tour' },
  { key: 'tour.not_found', enText: 'Tour Not Found', arText: 'الجولة غير موجودة', context: 'error', category: 'tour' },
  { key: 'tour.not_found_description', enText: 'The tour you\'re looking for doesn\'t exist or has been removed.', arText: 'الجولة التي تبحث عنها غير موجودة أو تم حذفها.', context: 'error', category: 'tour' },
  { key: 'tour.loading', enText: 'Loading tour details...', arText: 'جاري تحميل تفاصيل الجولة...', context: 'ui', category: 'tour' },
  { key: 'tour.featured', enText: 'Featured', arText: 'مميزة', context: 'label', category: 'tour' },
  
  // Tour attributes and information
  { key: 'tour.duration', enText: 'Duration', arText: 'المدة', context: 'label', category: 'tour' },
  { key: 'tour.day', enText: 'day', arText: 'يوم', context: 'unit', category: 'tour' },
  { key: 'tour.days', enText: 'days', arText: 'أيام', context: 'unit', category: 'tour' },
  { key: 'tour.hour', enText: 'hour', arText: 'ساعة', context: 'unit', category: 'tour' },
  { key: 'tour.hours', enText: 'hours', arText: 'ساعات', context: 'unit', category: 'tour' },
  { key: 'tour.group_size', enText: 'Group Size', arText: 'حجم المجموعة', context: 'label', category: 'tour' },
  { key: 'tour.max', enText: 'Max', arText: 'حد أقصى', context: 'label', category: 'tour' },
  { key: 'tour.min', enText: 'Min', arText: 'حد أدنى', context: 'label', category: 'tour' },
  { key: 'tour.rating', enText: 'Rating', arText: 'التقييم', context: 'label', category: 'tour' },
  { key: 'tour.reviews', enText: 'reviews', arText: 'مراجعة', context: 'unit', category: 'tour' },
  { key: 'tour.review', enText: 'review', arText: 'مراجعة', context: 'unit', category: 'tour' },
  { key: 'tour.location', enText: 'Location', arText: 'الموقع', context: 'label', category: 'tour' },
  { key: 'tour.departure', enText: 'Departure', arText: 'المغادرة', context: 'label', category: 'tour' },
  { key: 'tour.return', enText: 'Return', arText: 'العودة', context: 'label', category: 'tour' },
  { key: 'tour.difficulty', enText: 'Difficulty', arText: 'مستوى الصعوبة', context: 'label', category: 'tour' },
  { key: 'tour.language', enText: 'Language', arText: 'اللغة', context: 'label', category: 'tour' },
  
  // Sections and content areas
  { key: 'tour.whats_included', enText: 'What\'s Included', arText: 'ما هو مشمول', context: 'section', category: 'tour' },
  { key: 'tour.whats_not_included', enText: 'What\'s Not Included', arText: 'ما هو غير مشمول', context: 'section', category: 'tour' },
  { key: 'tour.overview', enText: 'Overview', arText: 'نظرة عامة', context: 'section', category: 'tour' },
  { key: 'tour.itinerary', enText: 'Itinerary', arText: 'خط السير', context: 'section', category: 'tour' },
  { key: 'tour.highlights', enText: 'Highlights', arText: 'أبرز المعالم', context: 'section', category: 'tour' },
  { key: 'tour.details', enText: 'Details', arText: 'التفاصيل', context: 'section', category: 'tour' },
  { key: 'tour.gallery', enText: 'Gallery', arText: 'معرض الصور', context: 'section', category: 'tour' },
  { key: 'tour.map', enText: 'Map', arText: 'الخريطة', context: 'section', category: 'tour' },
  
  // Booking and pricing
  { key: 'tour.book_this_tour', enText: 'Book This Tour', arText: 'احجز هذه الجولة', context: 'action', category: 'tour' },
  { key: 'tour.save', enText: 'Save', arText: 'توفير', context: 'label', category: 'tour' },
  { key: 'tour.per_person', enText: 'per person', arText: 'للشخص الواحد', context: 'unit', category: 'tour' },
  { key: 'tour.per_group', enText: 'per group', arText: 'للمجموعة', context: 'unit', category: 'tour' },
  { key: 'tour.book_now', enText: 'Book Now', arText: 'احجز الآن', context: 'action', category: 'tour' },
  { key: 'tour.check_availability', enText: 'Check Availability', arText: 'تحقق من التوفر', context: 'action', category: 'tour' },
  { key: 'tour.select_date', enText: 'Select Date', arText: 'اختر التاريخ', context: 'action', category: 'tour' },
  { key: 'tour.adults', enText: 'Adults', arText: 'البالغين', context: 'label', category: 'tour' },
  { key: 'tour.children', enText: 'Children', arText: 'الأطفال', context: 'label', category: 'tour' },
  { key: 'tour.infants', enText: 'Infants', arText: 'الرضع', context: 'label', category: 'tour' },
  { key: 'tour.total_price', enText: 'Total Price', arText: 'السعر الإجمالي', context: 'label', category: 'tour' },
  { key: 'tour.discount', enText: 'Discount', arText: 'خصم', context: 'label', category: 'tour' },
  { key: 'tour.original_price', enText: 'Original Price', arText: 'السعر الأصلي', context: 'label', category: 'tour' },
  
  // Actions and interactions
  { key: 'tour.add_to_favorites', enText: 'Add to Favorites', arText: 'أضف إلى المفضلة', context: 'action', category: 'tour' },
  { key: 'tour.remove_from_favorites', enText: 'Remove from Favorites', arText: 'إزالة من المفضلة', context: 'action', category: 'tour' },
  { key: 'tour.share', enText: 'Share', arText: 'مشاركة', context: 'action', category: 'tour' },
  { key: 'tour.share_tour', enText: 'Share Tour', arText: 'مشاركة الجولة', context: 'action', category: 'tour' },
  { key: 'tour.view_on_map', enText: 'View on Map', arText: 'عرض على الخريطة', context: 'action', category: 'tour' },
  { key: 'tour.ask_question', enText: 'Ask a Question', arText: 'اطرح سؤالاً', context: 'action', category: 'tour' },
  { key: 'tour.contact_guide', enText: 'Contact Guide', arText: 'اتصل بالمرشد', context: 'action', category: 'tour' },
  
  // Features and policies
  { key: 'tour.free_cancellation', enText: 'Free cancellation', arText: 'إلغاء مجاني', context: 'feature', category: 'tour' },
  { key: 'tour.available', enText: 'Available', arText: 'متاح', context: 'status', category: 'tour' },
  { key: 'tour.unavailable', enText: 'Unavailable', arText: 'غير متاح', context: 'status', category: 'tour' },
  { key: 'tour.instant_confirmation', enText: 'Instant confirmation', arText: 'تأكيد فوري', context: 'feature', category: 'tour' },
  { key: 'tour.yes', enText: 'Yes', arText: 'نعم', context: 'status', category: 'tour' },
  { key: 'tour.no', enText: 'No', arText: 'لا', context: 'status', category: 'tour' },
  { key: 'tour.mobile_voucher', enText: 'Mobile voucher', arText: 'قسيمة الجوال', context: 'feature', category: 'tour' },
  { key: 'tour.accepted', enText: 'Accepted', arText: 'مقبول', context: 'status', category: 'tour' },
  { key: 'tour.physical_voucher', enText: 'Physical voucher', arText: 'قسيمة ورقية', context: 'feature', category: 'tour' },
  { key: 'tour.pickup_included', enText: 'Pickup included', arText: 'النقل مشمول', context: 'feature', category: 'tour' },
  { key: 'tour.pickup_available', enText: 'Pickup available', arText: 'النقل متاح', context: 'feature', category: 'tour' },
  { key: 'tour.wheelchair_accessible', enText: 'Wheelchair accessible', arText: 'متاح للكراسي المتحركة', context: 'feature', category: 'tour' },
  
  // Status and availability
  { key: 'tour.sold_out', enText: 'Sold Out', arText: 'نفد المخزون', context: 'status', category: 'tour' },
  { key: 'tour.limited_availability', enText: 'Limited Availability', arText: 'توفر محدود', context: 'status', category: 'tour' },
  { key: 'tour.book_soon', enText: 'Book Soon', arText: 'احجز قريباً', context: 'status', category: 'tour' },
  { key: 'tour.fully_booked', enText: 'Fully Booked', arText: 'محجوز بالكامل', context: 'status', category: 'tour' },
  { key: 'tour.private_tour', enText: 'Private Tour', arText: 'جولة خاصة', context: 'type', category: 'tour' },
  { key: 'tour.group_tour', enText: 'Group Tour', arText: 'جولة جماعية', context: 'type', category: 'tour' },
  { key: 'tour.half_day', enText: 'Half Day', arText: 'نصف يوم', context: 'duration_type', category: 'tour' },
  { key: 'tour.full_day', enText: 'Full Day', arText: 'يوم كامل', context: 'duration_type', category: 'tour' },
  { key: 'tour.multi_day', enText: 'Multi-day', arText: 'عدة أيام', context: 'duration_type', category: 'tour' },
  
  // Difficulty levels
  { key: 'tour.easy', enText: 'Easy', arText: 'سهل', context: 'difficulty', category: 'tour' },
  { key: 'tour.moderate', enText: 'Moderate', arText: 'متوسط', context: 'difficulty', category: 'tour' },
  { key: 'tour.challenging', enText: 'Challenging', arText: 'صعب', context: 'difficulty', category: 'tour' },
  { key: 'tour.expert', enText: 'Expert', arText: 'خبير', context: 'difficulty', category: 'tour' },
  
  // Messages and notifications
  { key: 'tour.added_to_cart', enText: 'Tour added to cart', arText: 'تم إضافة الجولة إلى السلة', context: 'message', category: 'tour' },
  { key: 'tour.removed_from_cart', enText: 'Tour removed from cart', arText: 'تم إزالة الجولة من السلة', context: 'message', category: 'tour' },
  { key: 'tour.booking_confirmed', enText: 'Booking confirmed', arText: 'تم تأكيد الحجز', context: 'message', category: 'tour' },
  { key: 'tour.booking_cancelled', enText: 'Booking cancelled', arText: 'تم إلغاء الحجز', context: 'message', category: 'tour' },
  { key: 'tour.select_participants', enText: 'Please select number of participants', arText: 'يرجى اختيار عدد المشاركين', context: 'message', category: 'tour' },
  { key: 'tour.select_date_required', enText: 'Please select a date', arText: 'يرجى اختيار التاريخ', context: 'message', category: 'tour' },
  
  // Search and filter related
  { key: 'tours.title', enText: 'Tours', arText: 'الجولات', context: 'page_title', category: 'tours' },
  { key: 'tours.search_placeholder', enText: 'Search tours...', arText: 'البحث في الجولات...', context: 'search', category: 'tours' },
  { key: 'tours.filter_by_price', enText: 'Filter by Price', arText: 'تصفية حسب السعر', context: 'filter', category: 'tours' },
  { key: 'tours.filter_by_duration', enText: 'Filter by Duration', arText: 'تصفية حسب المدة', context: 'filter', category: 'tours' },
  { key: 'tours.filter_by_category', enText: 'Filter by Category', arText: 'تصفية حسب الفئة', context: 'filter', category: 'tours' },
  { key: 'tours.sort_by', enText: 'Sort by', arText: 'ترتيب حسب', context: 'sort', category: 'tours' },
  { key: 'tours.sort_price_low_high', enText: 'Price: Low to High', arText: 'السعر: من الأقل إلى الأعلى', context: 'sort', category: 'tours' },
  { key: 'tours.sort_price_high_low', enText: 'Price: High to Low', arText: 'السعر: من الأعلى إلى الأقل', context: 'sort', category: 'tours' },
  { key: 'tours.sort_duration', enText: 'Duration', arText: 'المدة', context: 'sort', category: 'tours' },
  { key: 'tours.sort_rating', enText: 'Rating', arText: 'التقييم', context: 'sort', category: 'tours' },
  { key: 'tours.sort_popularity', enText: 'Popularity', arText: 'الشعبية', context: 'sort', category: 'tours' },
  { key: 'tours.no_results', enText: 'No tours found', arText: 'لم يتم العثور على جولات', context: 'message', category: 'tours' },
  { key: 'tours.showing_results', enText: 'Showing', arText: 'عرض', context: 'results', category: 'tours' },
  { key: 'tours.of', enText: 'of', arText: 'من', context: 'results', category: 'tours' },
  { key: 'tours.results', enText: 'results', arText: 'نتيجة', context: 'results', category: 'tours' }
];

async function addTourTranslations() {
  try {
    console.log('🌍 Adding tour translations...');
    
    for (const translation of tourTranslations) {
      try {
        const response = await fetch('http://localhost:8080/api/translations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(translation),
        });
        
        if (response.ok) {
          console.log(`✅ Added: ${translation.key}`);
        } else {
          console.log(`⚠️  Skipped: ${translation.key} (might already exist)`);
        }
      } catch (error) {
        console.log(`❌ Error adding ${translation.key}:`, error.message);
      }
    }
    
    console.log('🎉 Tour translations setup complete!');
    
  } catch (error) {
    console.error('❌ Failed to add tour translations:', error);
    throw error;
  }
}

// Check if this is being run directly
if (require.main === module) {
  addTourTranslations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { addTourTranslations };