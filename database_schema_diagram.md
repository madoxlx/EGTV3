# مخطط قاعدة بيانات EgyptExpress

## نظرة عامة على قاعدة البيانات

قاعدة بيانات EgyptExpress هي نظام متكامل لإدارة خدمات السفر والسياحة، تتضمن إدارة المستخدمين، الحجوزات، الفنادق، الجولات، الباقات السياحية، والمواصلات.

---

## الجداول الرئيسية

### 1. جدول المستخدمين (users)
```sql
users {
  id: serial (PK)
  username: text (unique)
  password: text
  email: text (unique)
  displayName: text
  firstName: text
  lastName: text
  phoneNumber: text
  fullName: text
  role: text (default: "user")
  bio: text
  avatarUrl: text
  status: text (default: "active")
  
  -- بيانات السفر
  nationality: text
  dateOfBirth: timestamp
  passportNumber: text
  passportExpiry: timestamp
  emergencyContact: text
  emergencyPhone: text
  dietaryRequirements: text
  medicalConditions: text
  preferredLanguage: text (default: "en")
  
  -- تفضيلات التسويق
  emailNotifications: boolean (default: true)
  smsNotifications: boolean (default: false)
  marketingEmails: boolean (default: true)
  
  -- التحقق
  emailVerified: boolean (default: false)
  phoneVerified: boolean (default: false)
  lastLoginAt: timestamp
  
  -- حقول التدقيق
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 2. جدول الدول (countries)
```sql
countries {
  id: serial (PK)
  name: text
  code: text
  description: text
  imageUrl: text
  active: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 3. جدول المدن (cities)
```sql
cities {
  id: serial (PK)
  name: text
  countryId: integer (FK -> countries.id)
  description: text
  imageUrl: text
  active: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 4. جدول المطارات (airports)
```sql
airports {
  id: serial (PK)
  name: text
  cityId: integer (FK -> cities.id)
  code: text (IATA code)
  description: text
  imageUrl: text
  active: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 5. جدول الوجهات (destinations)
```sql
destinations {
  id: serial (PK)
  name: text
  country: text
  countryId: integer (FK -> countries.id)
  cityId: integer (FK -> cities.id)
  description: text
  imageUrl: text
  featured: boolean (default: false)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

---

## جداول الخدمات السياحية

### 6. جدول الباقات السياحية (packages)
```sql
packages {
  id: serial (PK)
  title: text
  description: text
  shortDescription: text
  price: integer
  discountedPrice: integer
  currency: text (default: "EGP")
  imageUrl: text
  galleryUrls: json
  duration: integer
  rating: integer
  reviewCount: integer (default: 0)
  destinationId: integer (FK -> destinations.id)
  countryId: integer (FK -> countries.id)
  cityId: integer (FK -> cities.id)
  categoryId: integer (FK -> packageCategories.id)
  featured: boolean (default: false)
  type: text
  inclusions: json
  slug: text (unique)
  
  -- حقول معقدة لإدارة الباقات
  route: text
  idealFor: json
  tourSelection: json
  includedFeatures: json
  optionalExcursions: json
  excludedFeatures: json
  itinerary: json
  whatToPack: json
  travelRoute: json
  accommodationHighlights: json
  transportationDetails: json
  pricingMode: text (default: "per_booking")
  
  -- حقول التواريخ
  startDate: timestamp
  endDate: timestamp
  
  -- عدد المسافرين
  adultCount: integer (default: 2)
  childrenCount: integer (default: 0)
  infantCount: integer (default: 0)
  
  -- بيانات إضافية
  maxGroupSize: integer (default: 15)
  language: text (default: "english")
  bestTimeToVisit: text
  
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 7. جدول الجولات السياحية (tours)
```sql
tours {
  id: serial (PK)
  name: text
  description: text
  imageUrl: text
  galleryUrls: json
  destinationId: integer (FK -> destinations.id)
  tripType: text
  duration: integer
  date: timestamp
  numPassengers: integer
  price: integer
  discountedPrice: integer
  currency: text (default: "EGP")
  included: json
  excluded: json
  itinerary: text
  maxGroupSize: integer
  featured: boolean (default: false)
  rating: doublePrecision
  reviewCount: integer (default: 0)
  status: text (default: "active")
  
  -- النسخة العربية
  nameAr: text
  descriptionAr: text
  itineraryAr: text
  includedAr: json
  excludedAr: json
  hasArabicVersion: boolean (default: false)
  
  categoryId: integer (FK -> tourCategories.id)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 8. جدول الفنادق (hotels)
```sql
hotels {
  id: serial (PK)
  name: text
  description: text
  shortDescription: text
  destinationId: integer (FK -> destinations.id)
  countryId: integer (FK -> countries.id)
  cityId: integer (FK -> cities.id)
  categoryId: integer (FK -> hotelCategories.id)
  address: text
  city: text
  country: text
  postalCode: text
  phone: text
  email: text
  website: text
  imageUrl: text
  galleryUrls: json
  stars: integer
  amenities: json
  checkInTime: text (default: "15:00")
  checkOutTime: text (default: "11:00")
  longitude: doublePrecision
  latitude: doublePrecision
  featured: boolean (default: false)
  rating: doublePrecision
  reviewCount: integer (default: 0)
  guestRating: doublePrecision
  
  -- الحجز والتوفر
  minStay: integer (default: 1)
  maxStay: integer
  bookingLeadTime: integer (default: 0)
  cancellationPolicy: text
  
  -- الخدمات والمرافق
  parkingAvailable: boolean (default: false)
  airportTransferAvailable: boolean (default: false)
  carRentalAvailable: boolean (default: false)
  shuttleAvailable: boolean (default: false)
  wifiAvailable: boolean (default: true)
  petFriendly: boolean (default: false)
  accessibleFacilities: boolean (default: false)
  
  -- التسعير
  basePrice: integer
  currency: text (default: "EGP")
  taxIncluded: boolean (default: false)
  serviceChargeIncluded: boolean (default: false)
  
  -- معلومات إضافية
  languages: json (default: ["en"])
  establishedYear: integer
  lastRenovatedYear: integer
  totalRooms: integer
  totalFloors: integer
  status: text (default: "active")
  verificationStatus: text (default: "pending")
  
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 9. جدول الغرف (rooms)
```sql
rooms {
  id: serial (PK)
  name: text
  description: text
  hotelId: integer (FK -> hotels.id)
  type: text
  maxOccupancy: integer
  maxAdults: integer
  maxChildren: integer (default: 0)
  maxInfants: integer (default: 0)
  price: integer
  discountedPrice: integer
  currency: text (default: "EGP")
  imageUrl: text
  size: text
  bedType: text
  amenities: json
  view: text
  available: boolean (default: true)
  status: text (default: "active")
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 10. جدول تركيبات الغرف (room_combinations)
```sql
room_combinations {
  id: serial (PK)
  roomId: integer (FK -> rooms.id)
  adultsCount: integer
  childrenCount: integer (default: 0)
  infantsCount: integer (default: 0)
  description: text
  isDefault: boolean (default: false)
  active: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

---

## جداول الحجز والطلبات

### 11. جدول الحجوزات (bookings)
```sql
bookings {
  id: serial (PK)
  bookingReference: text (unique)
  userId: integer (FK -> users.id)
  packageId: integer (FK -> packages.id)
  tourId: integer (FK -> tours.id)
  hotelId: integer (FK -> hotels.id)
  bookingDate: timestamp
  travelDate: timestamp
  returnDate: timestamp
  numberOfTravelers: integer
  adultCount: integer
  childCount: integer (default: 0)
  infantCount: integer (default: 0)
  totalPrice: integer
  basePrice: integer
  taxAmount: integer (default: 0)
  discountAmount: integer (default: 0)
  currency: text (default: "EGP")
  status: text (default: "pending")
  paymentStatus: text (default: "pending")
  paymentMethod: text
  paymentReference: text
  specialRequests: text
  notes: text
  confirmedAt: timestamp
  cancelledAt: timestamp
  cancellationReason: text
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 12. جدول عناصر السلة (cart_items)
```sql
cart_items {
  id: serial (PK)
  userId: integer (FK -> users.id)
  itemType: text
  itemId: integer
  itemName: text
  quantity: integer (default: 1)
  adults: integer (default: 1)
  children: integer (default: 0)
  infants: integer (default: 0)
  checkInDate: timestamp
  checkOutDate: timestamp
  travelDate: timestamp
  configuration: json
  unitPrice: integer
  discountedPrice: integer
  totalPrice: integer
  notes: text
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 13. جدول الطلبات (orders)
```sql
orders {
  id: serial (PK)
  userId: integer (FK -> users.id)
  orderNumber: text (unique)
  status: text (default: "pending")
  totalAmount: integer
  currency: text (default: "USD")
  paymentStatus: text (default: "pending")
  paymentMethod: text
  paymentIntentId: text
  customerEmail: text
  customerPhone: text
  customerName: text
  billingAddress: json
  specialRequests: text
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 14. جدول عناصر الطلبات (order_items)
```sql
order_items {
  id: serial (PK)
  orderId: integer (FK -> orders.id)
  itemType: text
  itemId: integer
  itemName: text
  quantity: integer (default: 1)
  adults: integer (default: 1)
  children: integer (default: 0)
  infants: integer (default: 0)
  checkInDate: timestamp
  checkOutDate: timestamp
  travelDate: timestamp
  configuration: json
  unitPrice: integer
  discountedPrice: integer
  totalPrice: integer
  notes: text
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

---

## جداول التصنيفات

### 15. جدول تصنيفات الجولات (tour_categories)
```sql
tour_categories {
  id: serial (PK)
  name: text (unique)
  description: text
  active: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 16. جدول تصنيفات الفنادق (hotel_categories)
```sql
hotel_categories {
  id: serial (PK)
  name: text (unique)
  description: text
  active: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 17. جدول تصنيفات الغرف (room_categories)
```sql
room_categories {
  id: serial (PK)
  name: text (unique)
  description: text
  active: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 18. جدول تصنيفات الباقات (package_categories)
```sql
package_categories {
  id: serial (PK)
  name: text (unique)
  description: text
  active: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

---

## جداول العلاقات (Junction Tables)

### 19. جدول علاقة الجولات بالتصنيفات (tour_to_category)
```sql
tour_to_category {
  tourId: integer (FK -> tours.id)
  categoryId: integer (FK -> tour_categories.id)
  PRIMARY KEY (tourId, categoryId)
}
```

### 20. جدول علاقة الفنادق بالتصنيفات (hotel_to_category)
```sql
hotel_to_category {
  hotelId: integer (FK -> hotels.id)
  categoryId: integer (FK -> hotel_categories.id)
  PRIMARY KEY (hotelId, categoryId)
}
```

### 21. جدول علاقة الباقات بالتصنيفات (package_to_category)
```sql
package_to_category {
  packageId: integer (FK -> packages.id)
  categoryId: integer (FK -> package_categories.id)
  PRIMARY KEY (packageId, categoryId)
}
```

### 22. جدول المفضلة (favorites)
```sql
favorites {
  userId: integer (FK -> users.id)
  destinationId: integer (FK -> destinations.id)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
  PRIMARY KEY (userId, destinationId)
}
```

---

## جداول المواصلات

### 23. جدول مواقع المواصلات (transport_locations)
```sql
transport_locations {
  id: serial (PK)
  name: text
  city: text
  country: text
  locationType: text
  description: text
  imageUrl: text
  popular: boolean (default: false)
  latitude: doublePrecision
  longitude: doublePrecision
  status: text (default: "active")
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 24. جدول مدة المواصلات (transport_durations)
```sql
transport_durations {
  id: serial (PK)
  name: text
  hours: integer
  description: text
  status: text (default: "active")
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 25. جدول أنواع المواصلات (transport_types)
```sql
transport_types {
  id: serial (PK)
  name: text
  description: text
  imageUrl: text
  passengerCapacity: integer
  baggageCapacity: integer
  defaultFeatures: json
  status: text (default: "active")
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 26. جدول المواصلات (transportation)
```sql
transportation {
  id: serial (PK)
  name: text
  description: text
  typeId: integer (FK -> transport_types.id)
  destinationId: integer (FK -> destinations.id)
  fromLocationId: integer (FK -> transport_locations.id)
  toLocationId: integer (FK -> transport_locations.id)
  durationId: integer (FK -> transport_durations.id)
  passengerCapacity: integer
  baggageCapacity: integer
  price: integer
  discountedPrice: integer
  imageUrl: text
  galleryUrls: json
  features: json
  withDriver: boolean (default: true)
  available: boolean (default: true)
  pickupIncluded: boolean (default: true)
  featured: boolean (default: false)
  rating: doublePrecision
  reviewCount: integer (default: 0)
  status: text (default: "active")
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

---

## جداول النظام والواجهة

### 27. جدول الشرائح الرئيسية (hero_slides)
```sql
hero_slides {
  id: serial (PK)
  title: text
  subtitle: text
  description: text
  imageUrl: text
  buttonText: text
  buttonLink: text
  secondaryButtonText: text
  secondaryButtonLink: text
  order: integer (default: 0)
  active: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 28. جدول القوائم (menus)
```sql
menus {
  id: serial (PK)
  name: text (unique)
  location: text
  description: text
  active: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 29. جدول عناصر القوائم (menu_items)
```sql
menu_items {
  id: serial (PK)
  menuId: integer (FK -> menus.id)
  parentId: integer (FK -> menu_items.id)
  title: text
  url: text
  icon: text
  iconType: text (default: "fas")
  itemType: text (default: "link")
  order: integer
  target: text (default: "_self")
  active: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

---

## جداول الترجمة واللغات

### 30. جدول الترجمات (translations)
```sql
translations {
  id: serial (PK)
  key: text (unique)
  enText: text
  arText: text
  context: text
  category: text
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 31. جدول إعدادات لغة الموقع (site_language_settings)
```sql
site_language_settings {
  id: serial (PK)
  defaultLanguage: text (default: "en")
  availableLanguages: json (default: ["en", "ar"])
  rtlLanguages: json (default: ["ar"])
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 32. جدول مدخلات القاموس (dictionary_entries)
```sql
dictionary_entries {
  id: serial (PK)
  word: text
  englishDefinition: text
  arabicTranslation: text
  partOfSpeech: text
  context: text
  example: text
  notes: text
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

---

## جداول التأشيرات والجنسيات

### 33. جدول الجنسيات (nationalities)
```sql
nationalities {
  id: serial (PK)
  name: text (unique)
  code: text (unique)
  description: text
  active: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 34. جدول التأشيرات (visas)
```sql
visas {
  id: serial (PK)
  name: text (unique)
  description: text
  processingTime: text
  validity: text
  requirements: json
  fees: json
  active: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
}
```

### 35. جدول متطلبات التأشيرات حسب الجنسية (nationality_visa_requirements)
```sql
nationality_visa_requirements {
  nationalityId: integer (FK -> nationalities.id)
  visaId: integer (FK -> visas.id)
  requirement: text
  notes: text
  active: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: integer (FK -> users.id)
  updatedBy: integer (FK -> users.id)
  PRIMARY KEY (nationalityId, visaId)
}
```

---

## العلاقات بين الجداول

### العلاقات الرئيسية:

1. **الدول ← المدن**: علاقة واحد لكثير
2. **المدن ← المطارات**: علاقة واحد لكثير
3. **الدول ← الوجهات**: علاقة واحد لكثير
4. **المدن ← الوجهات**: علاقة واحد لكثير
5. **الوجهات ← الباقات**: علاقة واحد لكثير
6. **الوجهات ← الجولات**: علاقة واحد لكثير
7. **الوجهات ← الفنادق**: علاقة واحد لكثير
8. **الفنادق ← الغرف**: علاقة واحد لكثير
9. **الغرف ← تركيبات الغرف**: علاقة واحد لكثير
10. **المستخدمين ← الحجوزات**: علاقة واحد لكثير
11. **المستخدمين ← الطلبات**: علاقة واحد لكثير
12. **المستخدمين ← عناصر السلة**: علاقة واحد لكثير

### علاقات التصنيفات:

1. **تصنيفات الجولات ← الجولات**: علاقة كثير لكثير عبر `tour_to_category`
2. **تصنيفات الفنادق ← الفنادق**: علاقة كثير لكثير عبر `hotel_to_category`
3. **تصنيفات الباقات ← الباقات**: علاقة كثير لكثير عبر `package_to_category`

### علاقات المواصلات:

1. **أنواع المواصلات ← المواصلات**: علاقة واحد لكثير
2. **مواقع المواصلات ← المواصلات**: علاقة واحد لكثير (من وإلى)
3. **مدة المواصلات ← المواصلات**: علاقة واحد لكثير

### علاقات النظام:

1. **القوائم ← عناصر القوائم**: علاقة واحد لكثير
2. **عناصر القوائم ← عناصر القوائم**: علاقة ذاتية (parent-child)
3. **المستخدمين ← جميع الجداول**: علاقة تدقيق (createdBy, updatedBy)

---

## ملاحظات مهمة

1. **التدقيق**: جميع الجداول تحتوي على حقول `createdAt`, `updatedAt`, `createdBy`, `updatedBy` للتتبع
2. **الحالة النشطة**: معظم الجداول تحتوي على حقل `active` أو `status` للتحكم في الحالة
3. **الترجمة**: النظام يدعم اللغتين العربية والإنجليزية مع جداول ترجمة مخصصة
4. **المرونة**: استخدام JSON fields للبيانات المرنة مثل المرافق والخصائص
5. **الأمان**: جميع كلمات المرور مشفرة، والتحقق من البريد الإلكتروني والهاتف متاح
6. **التصنيف**: نظام تصنيف مرن للجولات والفنادق والباقات
7. **الحجز**: نظام حجز متكامل مع سلة مشتريات وطلبات
8. **المواصلات**: نظام مواصلات شامل مع أنواع مختلفة ومواقع متعددة
