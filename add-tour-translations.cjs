const fs = require('fs');
const path = require('path');

// Tour translations to add
const tourTranslations = [
  { key: 'tour.back_to_tours', enText: 'Back to Tours', arText: 'العودة إلى الجولات', context: 'navigation', category: 'tour' },
  { key: 'tour.not_found', enText: 'Tour Not Found', arText: 'الجولة غير موجودة', context: 'error', category: 'tour' },
  { key: 'tour.not_found_description', enText: 'The tour you\'re looking for doesn\'t exist or has been removed.', arText: 'الجولة التي تبحث عنها غير موجودة أو تم حذفها.', context: 'error', category: 'tour' },
  { key: 'tour.loading', enText: 'Loading tour details...', arText: 'جاري تحميل تفاصيل الجولة...', context: 'ui', category: 'tour' },
  { key: 'tour.featured', enText: 'Featured', arText: 'مميزة', context: 'label', category: 'tour' },
  { key: 'tour.duration', enText: 'Duration', arText: 'المدة', context: 'label', category: 'tour' },
  { key: 'tour.day', enText: 'day', arText: 'يوم', context: 'unit', category: 'tour' },
  { key: 'tour.days', enText: 'days', arText: 'أيام', context: 'unit', category: 'tour' },
  { key: 'tour.group_size', enText: 'Group Size', arText: 'حجم المجموعة', context: 'label', category: 'tour' },
  { key: 'tour.max', enText: 'Max', arText: 'حد أقصى', context: 'label', category: 'tour' },
  { key: 'tour.rating', enText: 'Rating', arText: 'التقييم', context: 'label', category: 'tour' },
  { key: 'tour.reviews', enText: 'reviews', arText: 'مراجعة', context: 'unit', category: 'tour' },
  { key: 'tour.whats_included', enText: 'What\'s Included', arText: 'ما هو مشمول', context: 'section', category: 'tour' },
  { key: 'tour.whats_not_included', enText: 'What\'s Not Included', arText: 'ما هو غير مشمول', context: 'section', category: 'tour' },
  { key: 'tour.book_this_tour', enText: 'Book This Tour', arText: 'احجز هذه الجولة', context: 'action', category: 'tour' },
  { key: 'tour.save', enText: 'Save', arText: 'توفير', context: 'label', category: 'tour' },
  { key: 'tour.per_person', enText: 'per person', arText: 'للشخص الواحد', context: 'unit', category: 'tour' },
  { key: 'tour.book_now', enText: 'Book Now', arText: 'احجز الآن', context: 'action', category: 'tour' },
  { key: 'tour.add_to_favorites', enText: 'Add to Favorites', arText: 'أضف إلى المفضلة', context: 'action', category: 'tour' },
  { key: 'tour.free_cancellation', enText: 'Free cancellation', arText: 'إلغاء مجاني', context: 'feature', category: 'tour' },
  { key: 'tour.available', enText: 'Available', arText: 'متاح', context: 'status', category: 'tour' },
  { key: 'tour.instant_confirmation', enText: 'Instant confirmation', arText: 'تأكيد فوري', context: 'feature', category: 'tour' },
  { key: 'tour.yes', enText: 'Yes', arText: 'نعم', context: 'status', category: 'tour' },
  { key: 'tour.mobile_voucher', enText: 'Mobile voucher', arText: 'قسيمة الجوال', context: 'feature', category: 'tour' },
  { key: 'tour.accepted', enText: 'Accepted', arText: 'مقبول', context: 'status', category: 'tour' }
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