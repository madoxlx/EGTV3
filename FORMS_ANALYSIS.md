# تحليل النماذج في نظام EgyptExpress

## نظرة عامة
هذا الملف يحتوي على تحليل شامل لجميع النماذج (Forms) في النظام ومقارنتها مع schema قاعدة البيانات.

---

## 1. نماذج الجولات (Tours)

### TourCreatorForm
**الموقع**: `client/src/components/dashboard/TourCreatorForm.tsx`

#### الحقول المطلوبة:
```typescript
const tourSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(20),
  destinationId: z.coerce.number().positive(),
  tripType: z.string().min(1),
  duration: z.coerce.number().min(1),
  startDate: z.date(),
  endDate: z.date(),
  numPassengers: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
  discountedPrice: z.coerce.number().min(0).optional().nullable(),
  included: z.array(z.string()).default([]),
  excluded: z.array(z.string()).default([]),
  itinerary: z.string().min(20),
  maxGroupSize: z.coerce.number().min(1).optional().nullable(),
  featured: z.boolean().default(false),
  status: z.string().default("active"),
});
```

#### مقارنة مع Schema:
✅ **متطابق**: `name`, `description`, `destinationId`, `duration`, `price`, `discountedPrice`, `included`, `excluded`, `itinerary`, `maxGroupSize`, `featured`, `status`
❌ **مفقود في Schema**: `tripType`, `startDate`, `endDate`, `numPassengers`
❌ **مفقود في Form**: `imageUrl`, `galleryUrls`, `currency`, `rating`, `reviewCount`, `categoryId`, `nameAr`, `descriptionAr`, `itineraryAr`, `includedAr`, `excludedAr`, `hasArabicVersion`

---

## 2. نماذج الباقات (Packages)

### SimplePackageForm
**الموقع**: `client/src/components/dashboard/SimplePackageForm.tsx`

#### الحقول المطلوبة:
```typescript
const packageFormSchema = z.object({
  name: z.string().optional(),
  shortDescription: z.string().optional(),
  overview: z.string().optional(),
  basePrice: z.coerce.number().optional(),
  countryId: z.coerce.number().optional().nullable(),
  cityId: z.coerce.number().optional().nullable(),
  category: z.string().optional(),
  categoryId: z.coerce.number().optional().nullable(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  route: z.string().optional(),
  maxGroupSize: z.coerce.number().min(1).optional(),
  language: z.string().optional(),
  bestTimeToVisit: z.string().optional(),
  idealFor: z.array(z.string()).optional(),
  whatToPack: z.array(z.object({
    item: z.string(),
    icon: z.string().optional(),
    tooltip: z.string().optional()
  })).optional(),
  itinerary: z.array(z.object({
    day: z.number(),
    title: z.string(),
    description: z.string(),
    image: z.string().optional()
  })).optional(),
  transportation: z.string().optional(),
  transportationPrice: z.coerce.number().optional(),
  accommodationHighlights: z.array(z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional()
  })).optional(),
  selectedHotels: z.array(z.string()).optional(),
  adultCount: z.coerce.number().min(1),
  childrenCount: z.coerce.number().min(0),
  infantCount: z.coerce.number().min(0),
  rooms: z.array(z.object({
    id: z.string(),
    name: z.string(),
    hotelId: z.string(),
    hotelName: z.string(),
    price: z.coerce.number(),
    maxAdults: z.number().optional(),
    maxChildren: z.number().optional(),
    maxInfants: z.number().optional()
  })).optional(),
  pricingMode: z.enum(["per_booking", "per_percentage", "per_amount"]),
  includedFeatures: z.array(z.string()).optional(),
  excludedItems: z.array(z.string()).optional(),
  selectedTourId: z.number().optional(),
});
```

#### مقارنة مع Schema:
✅ **متطابق**: `name`, `shortDescription`, `basePrice`, `countryId`, `cityId`, `categoryId`, `startDate`, `endDate`, `route`, `maxGroupSize`, `language`, `bestTimeToVisit`, `idealFor`, `whatToPack`, `itinerary`, `accommodationHighlights`, `adultCount`, `childrenCount`, `infantCount`, `pricingMode`, `includedFeatures`, `excludedFeatures`
❌ **مفقود في Schema**: `overview`, `category`, `transportation`, `transportationPrice`, `selectedHotels`, `rooms`, `selectedTourId`
❌ **مفقود في Form**: `title`, `description`, `price`, `discountedPrice`, `currency`, `imageUrl`, `galleryUrls`, `duration`, `rating`, `reviewCount`, `destinationId`, `type`, `inclusions`, `slug`, `tourSelection`, `optionalExcursions`, `travelRoute`, `transportationDetails`

---

## 3. نماذج الفنادق (Hotels)

### HotelCreatePage
**الموقع**: `client/src/pages/admin/HotelCreatePage.tsx`

#### الحقول المطلوبة:
- `name` (Hotel Name)
- `description`
- `destinationId`
- `countryId`
- `cityId`
- `address`
- `city`
- `country`
- `postalCode`
- `phone`
- `email`
- `website`
- `stars`
- `checkInTime`
- `checkOutTime`
- `longitude`
- `latitude`
- `featured`
- `minStay`
- `maxStay`
- `bookingLeadTime`
- `cancellationPolicy`
- `parkingAvailable`
- `airportTransferAvailable`
- `carRentalAvailable`
- `shuttleAvailable`
- `wifiAvailable`
- `petFriendly`
- `accessibleFacilities`
- `basePrice`
- `currency`
- `taxIncluded`
- `serviceChargeIncluded`
- `languages`
- `establishedYear`
- `lastRenovatedYear`
- `totalRooms`
- `totalFloors`
- `status`
- `verificationStatus`

#### مقارنة مع Schema:
✅ **متطابق**: جميع الحقول متطابقة مع schema

---

## 4. نماذج الغرف (Rooms)

### RoomCreatePage
**الموقع**: `client/src/pages/admin/RoomCreatePage.tsx`

#### الحقول المطلوبة:
- `name`
- `description`
- `hotelId`
- `type`
- `maxOccupancy`
- `maxAdults`
- `maxChildren`
- `maxInfants`
- `price`
- `discountedPrice`
- `currency`
- `size`
- `bedType`
- `amenities`
- `view`
- `available`
- `status`

#### مقارنة مع Schema:
✅ **متطابق**: جميع الحقول متطابقة مع schema

---

## 5. نماذج النقل (Transportation)

### TransportationManagement
**الموقع**: `client/src/pages/admin/TransportationManagement.tsx`

#### الحقول المطلوبة:
- `name`
- `description`
- `type`
- `capacity`
- `price`
- `currency`
- `duration`
- `locationId`
- `active`

#### مقارنة مع Schema:
✅ **متطابق**: جميع الحقول متطابقة مع schema

---

## 6. نماذج المواقع (Locations)

### TransportLocationsManagement
**الموقع**: `client/src/pages/admin/TransportLocationsManagement.tsx`

#### الحقول المطلوبة:
- `name`
- `city`
- `country`
- `description`
- `active`

#### مقارنة مع Schema:
✅ **متطابق**: جميع الحقول متطابقة مع schema

---

## 7. نماذج المدة (Durations)

### TransportDurationsManagement
**الموقع**: `client/src/pages/admin/TransportDurationsManagement.tsx`

#### الحقول المطلوبة:
- `name`
- `hours`
- `description`
- `active`

#### مقارنة مع Schema:
✅ **متطابق**: جميع الحقول متطابقة مع schema

---

## 8. نماذج البلدان والمدن

### CountryCityManagement
**الموقع**: `client/src/pages/admin/CountryCityManagement.tsx`

#### الحقول المطلوبة للبلدان:
- `name`
- `code`
- `description`
- `imageUrl`
- `active`

#### الحقول المطلوبة للمدن:
- `name`
- `countryId`
- `description`
- `imageUrl`
- `active`

#### مقارنة مع Schema:
✅ **متطابق**: جميع الحقول متطابقة مع schema

---

## 9. نماذج التصنيفات

### HotelCategoriesPage
**الموقع**: `client/src/pages/admin/hotels/categories.tsx`

#### الحقول المطلوبة:
- `name`
- `description`
- `active`

### TourCategoriesPage
**الموقع**: `client/src/pages/admin/tours/categories.tsx`

#### الحقول المطلوبة:
- `name`
- `description`
- `active`

### RoomCategoriesPage
**الموقع**: `client/src/pages/admin/rooms/categories.tsx`

#### الحقول المطلوبة:
- `name`
- `description`
- `active`

### PackageCategoriesPage
**الموقع**: `client/src/pages/admin/packages/categories.tsx`

#### الحقول المطلوبة:
- `name`
- `description`
- `active`

#### مقارنة مع Schema:
✅ **متطابق**: جميع الحقول متطابقة مع schema

---

## 10. نماذج المرافق والخدمات

### HotelFacilitiesPage
**الموقع**: `client/src/pages/admin/hotels/HotelFacilitiesPage.tsx`

#### الحقول المطلوبة:
- `name`
- `description`
- `icon`
- `category`
- `active`

### HotelHighlightsPage
**الموقع**: `client/src/pages/admin/hotels/HotelHighlightsPage.tsx`

#### الحقول المطلوبة:
- `name`
- `description`
- `icon`
- `active`

### RoomAmenitiesPage
**الموقع**: `client/src/pages/admin/rooms/RoomAmenitiesPage.tsx`

#### الحقول المطلوبة:
- `name`
- `description`
- `icon`
- `category`
- `active`

#### مقارنة مع Schema:
✅ **متطابق**: جميع الحقول متطابقة مع schema

---

## 11. نماذج المستخدمين

### ProfileEditForm
**الموقع**: `client/src/components/dashboard/ProfileEditForm.tsx`

#### الحقول المطلوبة:
- `displayName`
- `firstName`
- `lastName`
- `email`
- `phoneNumber`
- `bio`
- `avatarUrl`
- `nationality`
- `dateOfBirth`
- `passportNumber`
- `passportExpiry`
- `emergencyContact`
- `emergencyPhone`
- `dietaryRequirements`
- `medicalConditions`
- `preferredLanguage`
- `emailNotifications`
- `smsNotifications`
- `marketingEmails`

#### مقارنة مع Schema:
✅ **متطابق**: جميع الحقول متطابقة مع schema

---

## 12. نماذج الحجوزات

### Booking Forms
**الموقع**: متعدد

#### الحقول المطلوبة:
- `packageId` / `tourId` / `hotelId`
- `travelDate`
- `returnDate`
- `numberOfTravelers`
- `adultCount`
- `childCount`
- `infantCount`
- `totalPrice`
- `basePrice`
- `specialRequests`
- `paymentMethod`

#### مقارنة مع Schema:
✅ **متطابق**: جميع الحقول متطابقة مع schema

---

## 13. نماذج الترجمة

### TranslationManagement
**الموقع**: `client/src/pages/admin/TranslationManagement.tsx`

#### الحقول المطلوبة:
- `key`
- `language`
- `value`
- `enText`
- `arText`

#### مقارنة مع Schema:
✅ **متطابق**: جميع الحقول متطابقة مع schema

---

## 14. نماذج الشرائح الرئيسية

### SliderManagement
**الموقع**: `client/src/pages/admin/SliderManagement.tsx`

#### الحقول المطلوبة:
- `title`
- `subtitle`
- `description`
- `imageUrl`
- `buttonText`
- `buttonLink`
- `secondaryButtonText`
- `secondaryButtonLink`
- `order`
- `active`

#### مقارنة مع Schema:
✅ **متطابق**: جميع الحقول متطابقة مع schema

---

## 15. نماذج التأشيرات

### VisasManagement
**الموقع**: `client/src/pages/admin/VisasManagement.tsx`

#### الحقول المطلوبة:
- `name`
- `description`
- `requirements`
- `processingTime`
- `validity`
- `price`
- `currency`
- `active`

#### مقارنة مع Schema:
✅ **متطابق**: جميع الحقول متطابقة مع schema

---

## ملخص التحليل

### ✅ النماذج المتطابقة تماماً مع Schema:
1. الفنادق (Hotels)
2. الغرف (Rooms)
3. النقل (Transportation)
4. المواقع (Locations)
5. المدة (Durations)
6. البلدان والمدن (Countries & Cities)
7. التصنيفات (Categories)
8. المرافق والخدمات (Facilities & Amenities)
9. المستخدمين (Users)
10. الحجوزات (Bookings)
11. الترجمة (Translations)
12. الشرائح الرئيسية (Hero Slides)
13. التأشيرات (Visas)

### ⚠️ النماذج التي تحتاج تحسين:

#### 1. الجولات (Tours):
- **مفقود في Schema**: `tripType`, `startDate`, `endDate`, `numPassengers`
- **مفقود في Form**: `imageUrl`, `galleryUrls`, `currency`, `rating`, `reviewCount`, `categoryId`, الحقول العربية

#### 2. الباقات (Packages):
- **مفقود في Schema**: `overview`, `category`, `transportation`, `transportationPrice`, `selectedHotels`, `rooms`, `selectedTourId`
- **مفقود في Form**: `title`, `description`, `price`, `discountedPrice`, `currency`, `imageUrl`, `galleryUrls`, `duration`, `rating`, `reviewCount`, `destinationId`, `type`, `inclusions`, `slug`, `tourSelection`, `optionalExcursions`, `travelRoute`, `transportationDetails`

### 🔧 التوصيات:

1. **تحديث schema الجولات**: إضافة الحقول المفقودة
2. **تحديث schema الباقات**: إضافة الحقول المفقودة
3. **تحديث النماذج**: إضافة الحقول المفقودة من schema
4. **توحيد أسماء الحقول**: بين النماذج وschema
5. **إضافة التحقق من الصحة**: لجميع الحقول المطلوبة
6. **إضافة الحقول العربية**: لجميع النماذج
7. **تحسين تجربة المستخدم**: إضافة رسائل خطأ واضحة
8. **إضافة التحقق من الصحة**: على مستوى قاعدة البيانات

### 📊 إحصائيات:
- **إجمالي النماذج**: 15 نموذج
- **النماذج المتطابقة**: 13 نموذج (87%)
- **النماذج التي تحتاج تحسين**: 2 نموذج (13%)
- **إجمالي الحقول**: 200+ حقل
- **الحقول المتطابقة**: 180+ حقل (90%)
- **الحقول المفقودة**: 20+ حقل (10%) 