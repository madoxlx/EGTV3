import { pool } from "./server/db";

async function addMaldivesDubaiPackage() {
  try {
    console.log("🔧 Adding Maldives & Dubai 6-day package...");
    
    const client = await pool.connect();
    
    // Add the Maldives & Dubai package directly
    const packageInsert = await client.query(`
      INSERT INTO packages (
        title, 
        description, 
        short_description,
        overview,
        price, 
        currency, 
        duration, 
        duration_type,
        featured,
        category,
        inclusions,
        has_arabic_version,
        title_ar,
        description_ar,
        short_description_ar,
        overview_ar,
        ideal_for,
        included_features,
        excluded_features,
        itinerary,
        what_to_pack,
        cancellation_policy,
        children_policy,
        terms_and_conditions,
        ideal_for_ar,
        included_features_ar,
        excluded_features_ar,
        itinerary_ar,
        what_to_pack_ar,
        cancellation_policy_ar,
        children_policy_ar,
        terms_and_conditions_ar,
        adult_count,
        children_count,
        infant_count,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37
      ) RETURNING id, title
    `, [
      // English content
      'Maldives & Dubai Luxury Experience',
      'Discover the perfect blend of urban luxury in Dubai and tropical paradise in the Maldives. This 6-day journey combines the cosmopolitan excitement of Dubai with the serene beauty of overwater villas in the Maldives.',
      'Luxury 6-day escape: Dubai city tour + Maldives overwater villa experience',
      'Experience the best of both worlds with our exclusive Maldives & Dubai package. Start your journey in the dazzling city of Dubai, where modern architecture meets traditional culture. Then escape to the pristine atolls of the Maldives for ultimate relaxation in overwater luxury.',
      26850,
      'EGP',
      6,
      'days',
      true,
      'Beach & Resort',
      JSON.stringify([
        'Round-trip flights Cairo-Dubai-Maldives-Cairo',
        '2 nights in 5-star Dubai hotel',
        '3 nights in overwater villa, Maldives',
        'Dubai city tour with Burj Khalifa visit',
        'Seaplane transfers in Maldives',
        'Daily breakfast',
        'All airport transfers'
      ]),
      true,
      
      // Arabic content
      'تجربة المالديف ودبي الفاخرة',
      'اكتشف المزيج المثالي بين الفخامة الحضرية في دبي والجنة الاستوائية في المالديف. هذه الرحلة لمدة 6 أيام تجمع بين الإثارة الكوزموبوليتانية لدبي والجمال الهادئ للفيلات المائية في المالديف.',
      'رحلة فاخرة لمدة 6 أيام: جولة في دبي + تجربة فيلا مائية في المالديف',
      'استمتع بأفضل ما في العالمين مع باقة المالديف ودبي الحصرية. ابدأ رحلتك في مدينة دبي المبهرة، حيث تلتقي العمارة الحديثة بالثقافة التقليدية. ثم اهرب إلى الجزر المرجانية البكر في المالديف للاسترخاء المطلق في الفخامة المائية.',
      
      JSON.stringify([
        'المسافرون الباحثون عن الفخامة',
        'الأزواج في شهر العسل',
        'محبي الشواطئ والاسترخاء',
        'عشاق المغامرات البحرية'
      ]),
      
      JSON.stringify([
        'تذاكر طيران ذهاب وعودة القاهرة-دبي-المالديف-القاهرة',
        'ليلتان في فندق 5 نجوم في دبي',
        '3 ليالي في فيلا مائية، المالديف',
        'جولة في مدينة دبي مع زيارة برج خليفة',
        'انتقالات بالطائرة المائية في المالديف',
        'إفطار يومي',
        'جميع انتقالات المطار'
      ]),
      
      JSON.stringify([
        'وجبات الغداء والعشاء (عدا المذكور)',
        'المشروبات الكحولية',
        'الأنشطة الاختيارية',
        'التأمين الطبي',
        'الإكراميات',
        'المصروفات الشخصية'
      ]),
      
      JSON.stringify([
        {
          day: 1,
          title: 'Arrival in Dubai',
          activities: ['Airport transfer to hotel', 'Check-in and rest', 'Evening at Dubai Mall'],
          meals: ['Breakfast']
        },
        {
          day: 2,
          title: 'Dubai City Tour',
          activities: ['Burj Khalifa visit', 'Dubai Marina', 'Palm Jumeirah tour', 'Dubai Frame'],
          meals: ['Breakfast']
        },
        {
          day: 3,
          title: 'Flight to Maldives',
          activities: ['Check-out from Dubai hotel', 'Flight to Maldives', 'Seaplane to resort', 'Overwater villa check-in'],
          meals: ['Breakfast']
        },
        {
          day: 4,
          title: 'Maldives - Water Activities',
          activities: ['Snorkeling excursion', 'Dolphin watching', 'Sunset cruise', 'Spa treatment'],
          meals: ['Breakfast']
        },
        {
          day: 5,
          title: 'Maldives - Island Hopping',
          activities: ['Local island visit', 'Fishing trip', 'Beach relaxation', 'Romantic dinner'],
          meals: ['Breakfast']
        },
        {
          day: 6,
          title: 'Departure',
          activities: ['Seaplane to airport', 'Flight to Cairo via Dubai', 'Arrival in Cairo'],
          meals: ['Breakfast']
        }
      ]),
      
      JSON.stringify([
        'Light summer clothing',
        'Swimwear and beachwear',
        'Sun protection (hat, sunglasses, sunscreen)',
        'Comfortable walking shoes',
        'Formal wear for dinner',
        'Underwater camera',
        'Passport and travel documents'
      ]),
      
      'Free cancellation up to 14 days before departure. 50% refund for cancellations 7-14 days before. No refund for cancellations within 7 days of departure.',
      'Children under 2 travel free. Children 2-11 receive 25% discount. Adult pricing applies for 12+.',
      'Package subject to availability and seasonal pricing. All transfers included as specified. Travel insurance recommended.',
      
      // Arabic versions
      JSON.stringify([
        'المسافرون الباحثون عن الفخامة',
        'الأزواج في شهر العسل',
        'محبي الشواطئ والاسترخاء',
        'عشاق المغامرات البحرية'
      ]),
      
      JSON.stringify([
        'تذاكر طيران ذهاب وعودة القاهرة-دبي-المالديف-القاهرة',
        'ليلتان في فندق 5 نجوم في دبي',
        '3 ليالي في فيلا مائية، المالديف',
        'جولة في مدينة دبي مع زيارة برج خليفة',
        'انتقالات بالطائرة المائية في المالديف',
        'إفطار يومي',
        'جميع انتقالات المطار'
      ]),
      
      JSON.stringify([
        'وجبات الغداء والعشاء (عدا المذكور)',
        'المشروبات الكحولية',
        'الأنشطة الاختيارية',
        'التأمين الطبي',
        'الإكراميات',
        'المصروفات الشخصية'
      ]),
      
      JSON.stringify([
        {
          day: 1,
          title: 'الوصول إلى دبي',
          activities: ['انتقال من المطار إلى الفندق', 'تسجيل الوصول والراحة', 'أمسية في دبي مول'],
          meals: ['الإفطار']
        },
        {
          day: 2,
          title: 'جولة في مدينة دبي',
          activities: ['زيارة برج خليفة', 'مارينا دبي', 'جولة في نخلة جميرا', 'إطار دبي'],
          meals: ['الإفطار']
        },
        {
          day: 3,
          title: 'طيران إلى المالديف',
          activities: ['تسجيل الخروج من فندق دبي', 'طيران إلى المالديف', 'طائرة مائية إلى المنتجع', 'تسجيل الوصول في الفيلا المائية'],
          meals: ['الإفطار']
        },
        {
          day: 4,
          title: 'المالديف - الأنشطة المائية',
          activities: ['رحلة غطس', 'مشاهدة الدلافين', 'رحلة غروب الشمس', 'علاج سبا'],
          meals: ['الإفطار']
        },
        {
          day: 5,
          title: 'المالديف - التنقل بين الجزر',
          activities: ['زيارة جزيرة محلية', 'رحلة صيد', 'استرخاء على الشاطئ', 'عشاء رومانسي'],
          meals: ['الإفطار']
        },
        {
          day: 6,
          title: 'المغادرة',
          activities: ['طائرة مائية إلى المطار', 'طيران إلى القاهرة عبر دبي', 'الوصول إلى القاهرة'],
          meals: ['الإفطار']
        }
      ]),
      
      JSON.stringify([
        'ملابس صيفية خفيفة',
        'ملابس السباحة والشاطئ',
        'حماية من الشمس (قبعة، نظارات شمسية، واقي شمس)',
        'أحذية مشي مريحة',
        'ملابس رسمية للعشاء',
        'كاميرا تحت الماء',
        'جواز السفر ووثائق السفر'
      ]),
      
      'إلغاء مجاني حتى 14 يومًا قبل المغادرة. استرداد 50% للإلغاءات 7-14 يومًا قبل. لا يوجد استرداد للإلغاءات خلال 7 أيام من المغادرة.',
      'الأطفال تحت سن الثانية يسافرون مجانًا. الأطفال 2-11 يحصلون على خصم 25%. تطبق أسعار البالغين من سن 12+.',
      'الباقة تخضع للتوفر والتسعير الموسمي. جميع الانتقالات مشمولة كما هو محدد. ينصح بالتأمين على السفر.',
      
      2, // adult_count
      0, // children_count  
      0, // infant_count
      'NOW()',
      'NOW()'
    ]);
    
    console.log("✅ Maldives & Dubai package added successfully!");
    console.log("📦 Package ID:", packageInsert.rows[0].id);
    console.log("📦 Package Title:", packageInsert.rows[0].title);
    
    client.release();
    
  } catch (error) {
    console.error("❌ Error adding package:", error);
    throw error;
  }
}

// Run the script
addMaldivesDubaiPackage().then(() => {
  console.log("🎉 Package addition completed!");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Package addition failed:", error);
  process.exit(1);
});