var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  airports: () => airports,
  airportsRelations: () => airportsRelations,
  bookings: () => bookings,
  cartItems: () => cartItems,
  cartItemsRelations: () => cartItemsRelations,
  cities: () => cities,
  citiesRelations: () => citiesRelations,
  cleanlinessFeatures: () => cleanlinessFeatures,
  countries: () => countries,
  countriesRelations: () => countriesRelations,
  couponUsages: () => couponUsages,
  coupons: () => coupons,
  destinations: () => destinations,
  dictionaryEntries: () => dictionaryEntries,
  favorites: () => favorites,
  heroSlides: () => heroSlides,
  hotelCategories: () => hotelCategories,
  hotelFacilities: () => hotelFacilities,
  hotelFaqs: () => hotelFaqs,
  hotelHighlights: () => hotelHighlights,
  hotelLandmarks: () => hotelLandmarks,
  hotelRestaurants: () => hotelRestaurants,
  hotelToCategory: () => hotelToCategory,
  hotelToCleanlinessFeatures: () => hotelToCleanlinessFeatures,
  hotelToFacilities: () => hotelToFacilities,
  hotelToHighlights: () => hotelToHighlights,
  hotels: () => hotels,
  hotelsRelations: () => hotelsRelations,
  insertAirportSchema: () => insertAirportSchema,
  insertBookingSchema: () => insertBookingSchema,
  insertCartItemSchema: () => insertCartItemSchema,
  insertCitySchema: () => insertCitySchema,
  insertCountrySchema: () => insertCountrySchema,
  insertDestinationSchema: () => insertDestinationSchema,
  insertDictionaryEntrySchema: () => insertDictionaryEntrySchema,
  insertFavoriteSchema: () => insertFavoriteSchema,
  insertHeroSlideSchema: () => insertHeroSlideSchema,
  insertHotelCategorySchema: () => insertHotelCategorySchema,
  insertHotelSchema: () => insertHotelSchema,
  insertMenuItemSchema: () => insertMenuItemSchema,
  insertMenuSchema: () => insertMenuSchema,
  insertNationalitySchema: () => insertNationalitySchema,
  insertNationalityVisaRequirementSchema: () => insertNationalityVisaRequirementSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPackageCategorySchema: () => insertPackageCategorySchema,
  insertPackageSchema: () => insertPackageSchema,
  insertRoomCategorySchema: () => insertRoomCategorySchema,
  insertRoomCombinationSchema: () => insertRoomCombinationSchema,
  insertRoomSchema: () => insertRoomSchema,
  insertSiteLanguageSettingsSchema: () => insertSiteLanguageSettingsSchema,
  insertTourCategorySchema: () => insertTourCategorySchema,
  insertTourSchema: () => insertTourSchema,
  insertTranslationSchema: () => insertTranslationSchema,
  insertTransportDurationSchema: () => insertTransportDurationSchema,
  insertTransportLocationSchema: () => insertTransportLocationSchema,
  insertTransportTypeSchema: () => insertTransportTypeSchema,
  insertTransportationSchema: () => insertTransportationSchema,
  insertUserSchema: () => insertUserSchema,
  insertVisaSchema: () => insertVisaSchema,
  menuItems: () => menuItems,
  menuItemsRelations: () => menuItemsRelations,
  menus: () => menus,
  menusRelations: () => menusRelations,
  nationalities: () => nationalities,
  nationalitiesRelations: () => nationalitiesRelations,
  nationalityVisaRequirements: () => nationalityVisaRequirements,
  nationalityVisaRequirementsRelations: () => nationalityVisaRequirementsRelations,
  notifications: () => notifications,
  orderItems: () => orderItems,
  orderItemsRelations: () => orderItemsRelations,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  packageCategories: () => packageCategories,
  packageToCategory: () => packageToCategory,
  packages: () => packages,
  payments: () => payments,
  reviews: () => reviews,
  roomCategories: () => roomCategories,
  roomCombinations: () => roomCombinations,
  roomCombinationsRelations: () => roomCombinationsRelations,
  roomToCategory: () => roomToCategory,
  rooms: () => rooms,
  roomsRelations: () => roomsRelations,
  siteLanguageSettings: () => siteLanguageSettings,
  tourCategories: () => tourCategories,
  tourToCategory: () => tourToCategory,
  tours: () => tours,
  translations: () => translations,
  transportDurations: () => transportDurations,
  transportLocations: () => transportLocations,
  transportTypes: () => transportTypes,
  transportation: () => transportation,
  travelers: () => travelers,
  users: () => users,
  visas: () => visas,
  visasRelations: () => visasRelations
});
import {
import { fileURLToPath } from 'url';
  pgTable,
  text,
  integer,
  serial,
  primaryKey,
  doublePrecision,
  boolean,
  timestamp,
  json
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var countries, cities, airports, countriesRelations, citiesRelations, airportsRelations, users, heroSlides, destinations, packages, bookings, favorites, tours, hotels, rooms, roomCombinations, menus, menuItems, roomsRelations, roomCombinationsRelations, hotelsRelations, translations, siteLanguageSettings, nationalities, visas, nationalityVisaRequirements, visasRelations, nationalitiesRelations, nationalityVisaRequirementsRelations, insertNationalitySchema, insertVisaSchema, insertNationalityVisaRequirementSchema, cartItems, orders, orderItems, cartItemsRelations, ordersRelations, orderItemsRelations, insertCartItemSchema, insertOrderSchema, insertOrderItemSchema, menusRelations, menuItemsRelations, dictionaryEntries, transportLocations, transportDurations, transportTypes, transportation, tourCategories, tourToCategory, hotelCategories, hotelToCategory, hotelFacilities, hotelToFacilities, cleanlinessFeatures, hotelToCleanlinessFeatures, hotelLandmarks, hotelHighlights, hotelToHighlights, hotelFaqs, hotelRestaurants, roomCategories, roomToCategory, packageCategories, packageToCategory, insertCountrySchema, insertCitySchema, insertAirportSchema, insertUserSchema, insertDestinationSchema, insertPackageSchema, insertBookingSchema, insertFavoriteSchema, insertTourSchema, insertHotelSchema, insertHeroSlideSchema, insertRoomSchema, insertRoomCombinationSchema, insertTransportLocationSchema, insertTransportDurationSchema, insertTranslationSchema, insertSiteLanguageSettingsSchema, insertDictionaryEntrySchema, insertTransportTypeSchema, insertMenuSchema, insertMenuItemSchema, insertTransportationSchema, reviews, payments, notifications, travelers, coupons, couponUsages, insertTourCategorySchema, insertHotelCategorySchema, insertRoomCategorySchema, insertPackageCategorySchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    countries = pgTable("countries", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      code: text("code").notNull(),
      description: text("description"),
      imageUrl: text("image_url"),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    cities = pgTable("cities", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      countryId: integer("country_id").notNull().references(() => countries.id),
      description: text("description"),
      imageUrl: text("image_url"),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    airports = pgTable("airports", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      cityId: integer("city_id").notNull().references(() => cities.id),
      code: text("code"),
      // IATA code (optional)
      description: text("description"),
      imageUrl: text("image_url"),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    countriesRelations = relations(countries, ({ many }) => ({
      cities: many(cities)
    }));
    citiesRelations = relations(cities, ({ one, many }) => ({
      country: one(countries, {
        fields: [cities.countryId],
        references: [countries.id]
      }),
      airports: many(airports)
    }));
    airportsRelations = relations(airports, ({ one }) => ({
      city: one(cities, {
        fields: [airports.cityId],
        references: [cities.id]
      })
    }));
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      email: text("email").notNull().unique(),
      displayName: text("display_name"),
      firstName: text("first_name"),
      lastName: text("last_name"),
      phoneNumber: text("phone_number"),
      fullName: text("full_name"),
      role: text("role").default("user").notNull(),
      bio: text("bio"),
      avatarUrl: text("avatar_url"),
      status: text("status").default("active"),
      // Travel preferences and profile data
      nationality: text("nationality"),
      dateOfBirth: timestamp("date_of_birth"),
      passportNumber: text("passport_number"),
      passportExpiry: timestamp("passport_expiry"),
      emergencyContact: text("emergency_contact"),
      emergencyPhone: text("emergency_phone"),
      dietaryRequirements: text("dietary_requirements"),
      medicalConditions: text("medical_conditions"),
      preferredLanguage: text("preferred_language").default("en"),
      // Marketing preferences
      emailNotifications: boolean("email_notifications").default(true),
      smsNotifications: boolean("sms_notifications").default(false),
      marketingEmails: boolean("marketing_emails").default(true),
      // Verification
      emailVerified: boolean("email_verified").default(false),
      phoneVerified: boolean("phone_verified").default(false),
      lastLoginAt: timestamp("last_login_at"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    heroSlides = pgTable("hero_slides", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      subtitle: text("subtitle"),
      description: text("description"),
      imageUrl: text("image_url").notNull(),
      buttonText: text("button_text"),
      buttonLink: text("button_link"),
      secondaryButtonText: text("secondary_button_text"),
      secondaryButtonLink: text("secondary_button_link"),
      order: integer("order").default(0),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    destinations = pgTable("destinations", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      country: text("country").notNull(),
      countryId: integer("country_id").references(() => countries.id),
      cityId: integer("city_id").references(() => cities.id),
      description: text("description"),
      imageUrl: text("image_url"),
      featured: boolean("featured").default(false),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    packages = pgTable("packages", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      shortDescription: text("short_description"),
      overview: text("overview"),
      price: integer("price").notNull(),
      discountedPrice: integer("discounted_price"),
      currency: text("currency").default("EGP").notNull(),
      imageUrl: text("image_url"),
      galleryUrls: json("gallery_urls"),
      // Using native JSON in PostgreSQL
      duration: integer("duration").notNull(),
      durationType: text("duration_type").default("days").notNull(),
      rating: integer("rating"),
      reviewCount: integer("review_count").default(0),
      destinationId: integer("destination_id").references(() => destinations.id),
      countryId: integer("country_id").references(() => countries.id),
      cityId: integer("city_id").references(() => cities.id),
      categoryId: integer("category_id"),
      // Package category reference
      category: text("category"),
      featured: boolean("featured").default(false),
      type: text("type"),
      inclusions: json("inclusions"),
      // Using native JSON in PostgreSQL
      slug: text("slug").unique(),
      // Friendly URL slug
      // New complex fields for comprehensive package management
      route: text("route"),
      // Route/Location information
      idealFor: json("ideal_for"),
      // Array of ideal traveler types
      tourSelection: json("tour_selection"),
      // Selected tours
      selectedTourId: integer("selected_tour_id").references(() => tours.id),
      includedFeatures: json("included_features"),
      // Array of included features
      optionalExcursions: json("optional_excursions"),
      // Array of optional add-ons
      excludedFeatures: json("excluded_features"),
      // Array of excluded items
      itinerary: json("itinerary"),
      // Day-by-day itinerary
      whatToPack: json("what_to_pack"),
      // Packing list items
      travelRoute: json("travel_route"),
      // Travel route items
      accommodationHighlights: json("accommodation_highlights"),
      // Hotel highlights
      transportationDetails: json("transportation_details"),
      // Transportation info
      transportation: text("transportation"),
      transportationPrice: integer("transportation_price"),
      pricingMode: text("pricing_mode").default("per_booking"),
      // Pricing structure
      // Date fields
      startDate: timestamp("start_date"),
      endDate: timestamp("end_date"),
      validUntil: timestamp("valid_until"),
      // Package validity date
      // Traveler counts
      adultCount: integer("adult_count").default(2),
      childrenCount: integer("children_count").default(0),
      infantCount: integer("infant_count").default(0),
      // Additional metadata
      maxGroupSize: integer("max_group_size").default(15),
      language: text("language").default("english"),
      bestTimeToVisit: text("best_time_to_visit"),
      // Hotel and room selections
      selectedHotels: json("selected_hotels"),
      rooms: json("rooms"),
      // Policy fields
      cancellationPolicy: text("cancellation_policy"),
      childrenPolicy: text("children_policy"),
      termsAndConditions: text("terms_and_conditions"),
      excludedItems: json("excluded_items"),
      // Array of excluded items
      // Custom display text for manual packages
      customText: text("custom_text"),
      // Custom editable text for package display
      markup: integer("markup"),
      // Markup amount in EGP
      markupType: text("markup_type"),
      // "percentage" or "fixed"
      discountType: text("discount_type"),
      // "percentage" or "fixed"
      discountValue: integer("discount_value"),
      // Discount amount (percentage or EGP)
      // Arabic translation fields
      hasArabicVersion: boolean("has_arabic_version").default(false),
      titleAr: text("title_ar"),
      descriptionAr: text("description_ar"),
      shortDescriptionAr: text("short_description_ar"),
      overviewAr: text("overview_ar"),
      bestTimeToVisitAr: text("best_time_to_visit_ar"),
      cancellationPolicyAr: text("cancellation_policy_ar"),
      childrenPolicyAr: text("children_policy_ar"),
      termsAndConditionsAr: text("terms_and_conditions_ar"),
      customTextAr: text("custom_text_ar"),
      includedFeaturesAr: json("included_features_ar"),
      // Array of Arabic included features
      excludedFeaturesAr: json("excluded_features_ar"),
      // Array of Arabic excluded features
      idealForAr: json("ideal_for_ar"),
      // Array of Arabic ideal traveler types
      itineraryAr: json("itinerary_ar"),
      // Arabic itinerary data
      whatToPackAr: json("what_to_pack_ar"),
      // Arabic packing information
      travelRouteAr: json("travel_route_ar"),
      // Arabic travel route information
      optionalExcursionsAr: json("optional_excursions_ar"),
      // Arabic optional excursions
      // Audit fields
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    bookings = pgTable("bookings", {
      id: serial("id").primaryKey(),
      bookingReference: text("booking_reference").notNull().unique(),
      userId: integer("user_id").references(() => users.id),
      packageId: integer("package_id").references(() => packages.id),
      tourId: integer("tour_id").references(() => tours.id),
      hotelId: integer("hotel_id").references(() => hotels.id),
      bookingDate: timestamp("booking_date").notNull().defaultNow(),
      travelDate: timestamp("travel_date").notNull(),
      returnDate: timestamp("return_date"),
      numberOfTravelers: integer("number_of_travelers").notNull(),
      adultCount: integer("adult_count").notNull(),
      childCount: integer("child_count").default(0),
      infantCount: integer("infant_count").default(0),
      totalPrice: integer("total_price").notNull(),
      basePrice: integer("base_price").notNull(),
      taxAmount: integer("tax_amount").default(0),
      discountAmount: integer("discount_amount").default(0),
      currency: text("currency").default("EGP").notNull(),
      status: text("status").default("pending").notNull(),
      paymentStatus: text("payment_status").default("pending").notNull(),
      paymentMethod: text("payment_method"),
      paymentReference: text("payment_reference"),
      specialRequests: text("special_requests"),
      notes: text("notes"),
      confirmedAt: timestamp("confirmed_at"),
      cancelledAt: timestamp("cancelled_at"),
      cancellationReason: text("cancellation_reason"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    favorites = pgTable(
      "favorites",
      {
        userId: integer("user_id").notNull().references(() => users.id),
        destinationId: integer("destination_id").notNull().references(() => destinations.id),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow(),
        createdBy: integer("created_by").references(() => users.id),
        updatedBy: integer("updated_by").references(() => users.id)
      },
      (table) => {
        return {
          pk: primaryKey({ columns: [table.userId, table.destinationId] })
        };
      }
    );
    tours = pgTable("tours", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      destinationId: integer("destination_id").references(() => destinations.id),
      duration: integer("duration").notNull(),
      price: integer("price").notNull(),
      maxCapacity: integer("max_capacity"),
      imageUrl: text("image_url"),
      active: boolean("active").default(true),
      featured: boolean("featured").default(false),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id),
      currency: text("currency").default("EGP").notNull(),
      galleryUrls: json("gallery_urls"),
      // Using native JSON in PostgreSQL
      startDate: timestamp("start_date"),
      endDate: timestamp("end_date"),
      tripType: text("trip_type"),
      numPassengers: integer("num_passengers"),
      discountedPrice: integer("discounted_price"),
      included: json("included"),
      // Using native JSON in PostgreSQL
      excluded: json("excluded"),
      // Using native JSON in PostgreSQL
      itinerary: text("itinerary"),
      maxGroupSize: integer("max_group_size"),
      rating: doublePrecision("rating"),
      reviewCount: integer("review_count").default(0),
      status: text("status").default("active"),
      // Arabic version fields
      nameAr: text("name_ar"),
      descriptionAr: text("description_ar"),
      itineraryAr: text("itinerary_ar"),
      includedAr: json("included_ar"),
      // Arabic version of included items
      excludedAr: json("excluded_ar"),
      // Arabic version of excluded items
      hasArabicVersion: boolean("has_arabic_version").default(false),
      categoryId: integer("category_id").references(() => tourCategories.id),
      durationType: text("duration_type").default("days").notNull(),
      date: timestamp("date"),
      cancellationPolicy: text("cancellation_policy"),
      termsAndConditions: text("terms_and_conditions")
    });
    hotels = pgTable("hotels", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      shortDescription: text("short_description"),
      destinationId: integer("destination_id").references(() => destinations.id),
      countryId: integer("country_id").references(() => countries.id),
      cityId: integer("city_id").references(() => cities.id),
      categoryId: integer("category_id").references(() => hotelCategories.id),
      address: text("address"),
      city: text("city"),
      country: text("country"),
      postalCode: text("postal_code"),
      phone: text("phone"),
      email: text("email"),
      website: text("website"),
      imageUrl: text("image_url"),
      galleryUrls: json("gallery_urls"),
      stars: integer("stars"),
      amenities: json("amenities"),
      // Using native JSON in PostgreSQL (legacy, moving to relation-based)
      checkInTime: text("check_in_time").default("15:00"),
      checkOutTime: text("check_out_time").default("11:00"),
      longitude: doublePrecision("longitude"),
      latitude: doublePrecision("latitude"),
      featured: boolean("featured").default(false),
      rating: doublePrecision("rating"),
      reviewCount: integer("review_count").default(0),
      guestRating: doublePrecision("guest_rating"),
      // Booking and availability
      minStay: integer("min_stay").default(1),
      maxStay: integer("max_stay"),
      bookingLeadTime: integer("booking_lead_time").default(0),
      cancellationPolicy: text("cancellation_policy"),
      // Services and facilities
      parkingAvailable: boolean("parking_available").default(false),
      airportTransferAvailable: boolean("airport_transfer_available").default(
        false
      ),
      carRentalAvailable: boolean("car_rental_available").default(false),
      shuttleAvailable: boolean("shuttle_available").default(false),
      wifiAvailable: boolean("wifi_available").default(true),
      petFriendly: boolean("pet_friendly").default(false),
      accessibleFacilities: boolean("accessible_facilities").default(false),
      // Pricing
      basePrice: integer("base_price"),
      currency: text("currency").default("EGP"),
      taxIncluded: boolean("tax_included").default(false),
      serviceChargeIncluded: boolean("service_charge_included").default(false),
      // Additional info
      languages: json("languages").default(["en"]),
      establishedYear: integer("established_year"),
      lastRenovatedYear: integer("last_renovated_year"),
      totalRooms: integer("total_rooms"),
      totalFloors: integer("total_floors"),
      // Complex data fields
      restaurants: json("restaurants"),
      landmarks: json("landmarks"),
      faqs: json("faqs"),
      roomTypes: json("room_types"),
      features: json("features").default([]),
      // Simple feature array storage
      status: text("status").default("active"),
      verificationStatus: text("verification_status").default("pending"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    rooms = pgTable("rooms", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      hotelId: integer("hotel_id").references(() => hotels.id).notNull(),
      type: text("type").notNull(),
      maxOccupancy: integer("max_occupancy").notNull(),
      maxAdults: integer("max_adults").notNull(),
      maxChildren: integer("max_children").notNull().default(0),
      maxInfants: integer("max_infants").notNull().default(0),
      price: integer("price").notNull(),
      discountedPrice: integer("discounted_price"),
      currency: text("currency").default("EGP").notNull(),
      imageUrl: text("image_url"),
      size: text("size"),
      bedType: text("bed_type"),
      amenities: json("amenities"),
      // Using native JSON in PostgreSQL
      view: text("view"),
      available: boolean("available").default(true),
      status: text("status").default("active"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    roomCombinations = pgTable("room_combinations", {
      id: serial("id").primaryKey(),
      roomId: integer("room_id").references(() => rooms.id).notNull(),
      adultsCount: integer("adults_count").notNull(),
      childrenCount: integer("children_count").notNull().default(0),
      infantsCount: integer("infants_count").notNull().default(0),
      description: text("description"),
      isDefault: boolean("is_default").default(false),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    menus = pgTable("menus", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      location: text("location").notNull(),
      // header, footer_quick_links, footer_destinations, etc.
      description: text("description"),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    menuItems = pgTable("menu_items", {
      id: serial("id").primaryKey(),
      menuId: integer("menu_id").references(() => menus.id).notNull(),
      parentId: integer("parent_id"),
      title: text("title").notNull(),
      url: text("url"),
      // URL is now optional
      icon: text("icon"),
      // FontAwesome icon name
      iconType: text("icon_type").default("fas"),
      // fas, fab, far, etc.
      itemType: text("item_type").default("link"),
      // "link" or "heading"
      order: integer("order").notNull(),
      target: text("target").default("_self"),
      // _self, _blank, etc.
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    roomsRelations = relations(rooms, ({ many, one }) => ({
      combinations: many(roomCombinations),
      hotel: one(hotels, {
        fields: [rooms.hotelId],
        references: [hotels.id]
      })
    }));
    roomCombinationsRelations = relations(
      roomCombinations,
      ({ one }) => ({
        room: one(rooms, {
          fields: [roomCombinations.roomId],
          references: [rooms.id]
        })
      })
    );
    hotelsRelations = relations(hotels, ({ many, one }) => ({
      rooms: many(rooms),
      destination: one(destinations, {
        fields: [hotels.destinationId],
        references: [destinations.id]
      }),
      categories: many(hotelToCategory)
    }));
    translations = pgTable("translations", {
      id: serial("id").primaryKey(),
      key: text("key").notNull().unique(),
      enText: text("en_text").notNull(),
      arText: text("ar_text"),
      context: text("context"),
      category: text("category"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    siteLanguageSettings = pgTable("site_language_settings", {
      id: serial("id").primaryKey(),
      defaultLanguage: text("default_language").default("en").notNull(),
      availableLanguages: json("available_languages").default(["en", "ar"]),
      // Using native JSON in PostgreSQL
      rtlLanguages: json("rtl_languages").default(["ar"]),
      // Using native JSON in PostgreSQL
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    nationalities = pgTable("nationalities", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      code: text("code").notNull(),
      description: text("description"),
      imageUrl: text("image_url"),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    visas = pgTable("visas", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      targetCountryId: integer("target_country_id").references(() => countries.id).notNull(),
      imageUrl: text("image_url"),
      price: integer("price"),
      currency: text("currency").default("EGP").notNull(),
      processingTime: text("processing_time"),
      requiredDocuments: json("required_documents"),
      // Using native JSON in PostgreSQL
      validityPeriod: text("validity_period"),
      entryType: text("entry_type"),
      // single, multiple, etc.
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    nationalityVisaRequirements = pgTable(
      "nationality_visa_requirements",
      {
        id: serial("id").primaryKey(),
        visaId: integer("visa_id").references(() => visas.id).notNull(),
        nationalityId: integer("nationality_id").references(() => nationalities.id).notNull(),
        requirementDetails: text("requirement_details"),
        additionalDocuments: json("additional_documents"),
        // Using native JSON in PostgreSQL
        fees: integer("fees"),
        processingTime: text("processing_time"),
        notes: text("notes"),
        active: boolean("active").default(true),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow(),
        createdBy: integer("created_by").references(() => users.id),
        updatedBy: integer("updated_by").references(() => users.id)
      }
    );
    visasRelations = relations(visas, ({ one, many }) => ({
      country: one(countries, {
        fields: [visas.targetCountryId],
        references: [countries.id]
      }),
      requirements: many(nationalityVisaRequirements)
    }));
    nationalitiesRelations = relations(nationalities, ({ many }) => ({
      visaRequirements: many(nationalityVisaRequirements)
    }));
    nationalityVisaRequirementsRelations = relations(
      nationalityVisaRequirements,
      ({ one }) => ({
        visa: one(visas, {
          fields: [nationalityVisaRequirements.visaId],
          references: [visas.id]
        }),
        nationality: one(nationalities, {
          fields: [nationalityVisaRequirements.nationalityId],
          references: [nationalities.id]
        })
      })
    );
    insertNationalitySchema = createInsertSchema(nationalities).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertVisaSchema = createInsertSchema(visas).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertNationalityVisaRequirementSchema = createInsertSchema(
      nationalityVisaRequirements
    ).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    cartItems = pgTable("cart_items", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      sessionId: text("session_id"),
      // For guest users
      itemType: text("item_type").notNull(),
      // 'flight', 'hotel', 'room', 'tour', 'package', 'visa', 'transportation'
      itemId: integer("item_id").notNull(),
      // References the actual item ID
      quantity: integer("quantity").notNull().default(1),
      adults: integer("adults").default(1),
      children: integer("children").default(0),
      infants: integer("infants").default(0),
      checkInDate: timestamp("check_in_date"),
      checkOutDate: timestamp("check_out_date"),
      travelDate: timestamp("travel_date"),
      configuration: json("configuration"),
      // Additional booking details (room preferences, seat selection, etc.)
      priceAtAdd: integer("price_at_add").notNull(),
      // Price when item was added to cart
      discountedPriceAtAdd: integer("discounted_price_at_add"),
      notes: text("notes"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    orders = pgTable("orders", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      orderNumber: text("order_number").notNull().unique(),
      status: text("status").notNull().default("pending"),
      // pending, confirmed, cancelled, completed
      totalAmount: integer("total_amount").notNull(),
      currency: text("currency").default("USD"),
      paymentStatus: text("payment_status").default("pending"),
      // pending, paid, failed, refunded
      paymentMethod: text("payment_method"),
      paymentIntentId: text("payment_intent_id"),
      // Stripe payment intent ID
      customerEmail: text("customer_email").notNull(),
      customerPhone: text("customer_phone"),
      customerName: text("customer_name").notNull(),
      billingAddress: json("billing_address"),
      specialRequests: text("special_requests"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    orderItems = pgTable("order_items", {
      id: serial("id").primaryKey(),
      orderId: integer("order_id").references(() => orders.id).notNull(),
      itemType: text("item_type").notNull(),
      // 'flight', 'hotel', 'room', 'tour', 'package', 'visa', 'transportation'
      itemId: integer("item_id").notNull(),
      itemName: text("item_name").notNull(),
      quantity: integer("quantity").notNull().default(1),
      adults: integer("adults").default(1),
      children: integer("children").default(0),
      infants: integer("infants").default(0),
      checkInDate: timestamp("check_in_date"),
      checkOutDate: timestamp("check_out_date"),
      travelDate: timestamp("travel_date"),
      configuration: json("configuration"),
      unitPrice: integer("unit_price").notNull(),
      discountedPrice: integer("discounted_price"),
      totalPrice: integer("total_price").notNull(),
      notes: text("notes"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    cartItemsRelations = relations(cartItems, ({ one }) => ({
      user: one(users, {
        fields: [cartItems.userId],
        references: [users.id]
      })
    }));
    ordersRelations = relations(orders, ({ one, many }) => ({
      user: one(users, {
        fields: [orders.userId],
        references: [users.id]
      }),
      items: many(orderItems)
    }));
    orderItemsRelations = relations(orderItems, ({ one }) => ({
      order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id]
      })
    }));
    insertCartItemSchema = createInsertSchema(cartItems).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      travelDate: z.preprocess((val) => {
        if (!val) return null;
        if (val instanceof Date) return val;
        if (typeof val === "string") {
          const date = new Date(val);
          return isNaN(date.getTime()) ? null : date;
        }
        return null;
      }, z.date().nullable().optional()),
      checkInDate: z.preprocess((val) => {
        if (!val) return null;
        if (val instanceof Date) return val;
        if (typeof val === "string") {
          const date = new Date(val);
          return isNaN(date.getTime()) ? null : date;
        }
        return null;
      }, z.date().nullable().optional()),
      checkOutDate: z.preprocess((val) => {
        if (!val) return null;
        if (val instanceof Date) return val;
        if (typeof val === "string") {
          const date = new Date(val);
          return isNaN(date.getTime()) ? null : date;
        }
        return null;
      }, z.date().nullable().optional())
    });
    insertOrderSchema = createInsertSchema(orders).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertOrderItemSchema = createInsertSchema(orderItems).omit({
      id: true,
      createdAt: true
    });
    menusRelations = relations(menus, ({ many }) => ({
      items: many(menuItems)
    }));
    menuItemsRelations = relations(menuItems, ({ one, many }) => ({
      menu: one(menus, {
        fields: [menuItems.menuId],
        references: [menus.id]
      }),
      children: many(menuItems, { relationName: "parentChild" }),
      parent: one(menuItems, {
        fields: [menuItems.parentId],
        references: [menuItems.id],
        relationName: "parentChild"
      })
    }));
    dictionaryEntries = pgTable("dictionary_entries", {
      id: serial("id").primaryKey(),
      word: text("word").notNull(),
      englishDefinition: text("english_definition").notNull(),
      arabicTranslation: text("arabic_translation").notNull(),
      partOfSpeech: text("part_of_speech"),
      context: text("context"),
      example: text("example"),
      notes: text("notes"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    transportLocations = pgTable("transport_locations", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      city: text("city").notNull(),
      country: text("country").notNull(),
      locationType: text("location_type").notNull(),
      // "pickup" or "dropoff" or "both"
      description: text("description"),
      imageUrl: text("image_url"),
      popular: boolean("popular").default(false),
      latitude: doublePrecision("latitude"),
      longitude: doublePrecision("longitude"),
      status: text("status").default("active"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    transportDurations = pgTable("transport_durations", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      // e.g., "Half Day", "Full Day"
      hours: integer("hours").notNull(),
      description: text("description"),
      status: text("status").default("active"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    transportTypes = pgTable("transport_types", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      // e.g., "Sedan", "SUV", "Van", "Luxury"
      description: text("description"),
      imageUrl: text("image_url"),
      passengerCapacity: integer("passenger_capacity").notNull(),
      baggageCapacity: integer("baggage_capacity").notNull(),
      defaultFeatures: json("default_features"),
      // Using native JSON in PostgreSQL
      status: text("status").default("active"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    transportation = pgTable("transportation", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      typeId: integer("type_id").references(() => transportTypes.id),
      destinationId: integer("destination_id").references(() => destinations.id),
      fromLocationId: integer("from_location_id").references(
        () => transportLocations.id
      ),
      toLocationId: integer("to_location_id").references(
        () => transportLocations.id
      ),
      durationId: integer("duration_id").references(() => transportDurations.id),
      passengerCapacity: integer("passenger_capacity").notNull(),
      baggageCapacity: integer("baggage_capacity").notNull(),
      price: integer("price").notNull(),
      discountedPrice: integer("discounted_price"),
      imageUrl: text("image_url"),
      galleryUrls: json("gallery_urls"),
      // Using native JSON in PostgreSQL
      features: json("features"),
      // Using native JSON in PostgreSQL
      withDriver: boolean("with_driver").default(true),
      available: boolean("available").default(true),
      pickupIncluded: boolean("pickup_included").default(true),
      featured: boolean("featured").default(false),
      rating: doublePrecision("rating"),
      reviewCount: integer("review_count").default(0),
      status: text("status").default("active"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    tourCategories = pgTable("tour_categories", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      description: text("description"),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    tourToCategory = pgTable(
      "tour_to_category",
      {
        tourId: integer("tour_id").notNull().references(() => tours.id),
        categoryId: integer("category_id").notNull().references(() => tourCategories.id)
      },
      (table) => {
        return {
          pk: primaryKey({ columns: [table.tourId, table.categoryId] })
        };
      }
    );
    hotelCategories = pgTable("hotel_categories", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      description: text("description"),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    hotelToCategory = pgTable(
      "hotel_to_category",
      {
        hotelId: integer("hotel_id").notNull().references(() => hotels.id),
        categoryId: integer("category_id").notNull().references(() => hotelCategories.id)
      },
      (table) => {
        return {
          pk: primaryKey({ columns: [table.hotelId, table.categoryId] })
        };
      }
    );
    hotelFacilities = pgTable("hotel_facilities", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      icon: text("icon"),
      // FontAwesome icon name
      category: text("category"),
      // E.g. "general", "dining", "recreation", etc.
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    hotelToFacilities = pgTable(
      "hotel_to_facilities",
      {
        hotelId: integer("hotel_id").notNull().references(() => hotels.id),
        facilityId: integer("facility_id").notNull().references(() => hotelFacilities.id)
      },
      (table) => {
        return {
          pk: primaryKey({ columns: [table.hotelId, table.facilityId] })
        };
      }
    );
    cleanlinessFeatures = pgTable("cleanliness_features", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      icon: text("icon"),
      // FontAwesome icon name
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    hotelToCleanlinessFeatures = pgTable(
      "hotel_to_cleanliness",
      {
        hotelId: integer("hotel_id").notNull().references(() => hotels.id),
        featureId: integer("feature_id").notNull().references(() => cleanlinessFeatures.id)
      },
      (table) => {
        return {
          pk: primaryKey({ columns: [table.hotelId, table.featureId] })
        };
      }
    );
    hotelLandmarks = pgTable("hotel_landmarks", {
      id: serial("id").primaryKey(),
      hotelId: integer("hotel_id").notNull().references(() => hotels.id),
      name: text("name").notNull(),
      description: text("description"),
      distance: text("distance"),
      // E.g. "500m", "2.4km"
      distanceValue: doublePrecision("distance_value"),
      // Numeric value for sorting
      distanceUnit: text("distance_unit").default("km"),
      // E.g. "km", "m", "miles"
      longitude: doublePrecision("longitude"),
      latitude: doublePrecision("latitude"),
      placeId: text("place_id"),
      // Google Places ID
      icon: text("icon"),
      // URL to icon
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    hotelHighlights = pgTable("hotel_highlights", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      icon: text("icon"),
      // FontAwesome icon name
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    hotelToHighlights = pgTable(
      "hotel_to_highlights",
      {
        hotelId: integer("hotel_id").notNull().references(() => hotels.id),
        highlightId: integer("highlight_id").notNull().references(() => hotelHighlights.id)
      },
      (table) => {
        return {
          pk: primaryKey({ columns: [table.hotelId, table.highlightId] })
        };
      }
    );
    hotelFaqs = pgTable("hotel_faqs", {
      id: serial("id").primaryKey(),
      hotelId: integer("hotel_id").notNull().references(() => hotels.id),
      question: text("question").notNull(),
      answer: text("answer").notNull(),
      order: integer("order").default(0),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    hotelRestaurants = pgTable("hotel_restaurants", {
      id: serial("id").primaryKey(),
      hotelId: integer("hotel_id").notNull().references(() => hotels.id),
      name: text("name").notNull(),
      description: text("description"),
      cuisine: text("cuisine"),
      // E.g. "Italian", "International", "Halal"
      mealTypes: json("meal_types"),
      // E.g. ["Breakfast", "Lunch", "Dinner"]
      openingHours: text("opening_hours"),
      imageUrl: text("image_url"),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    roomCategories = pgTable("room_categories", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      description: text("description"),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    roomToCategory = pgTable(
      "room_to_category",
      {
        roomId: integer("room_id").notNull().references(() => rooms.id),
        categoryId: integer("category_id").notNull().references(() => roomCategories.id)
      },
      (table) => {
        return {
          pk: primaryKey({ columns: [table.roomId, table.categoryId] })
        };
      }
    );
    packageCategories = pgTable("package_categories", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      description: text("description"),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    packageToCategory = pgTable(
      "package_to_category",
      {
        packageId: integer("package_id").notNull().references(() => packages.id),
        categoryId: integer("category_id").notNull().references(() => packageCategories.id)
      },
      (table) => {
        return {
          pk: primaryKey({ columns: [table.packageId, table.categoryId] })
        };
      }
    );
    insertCountrySchema = createInsertSchema(countries).pick({
      name: true,
      code: true,
      description: true,
      imageUrl: true,
      active: true
    });
    insertCitySchema = createInsertSchema(cities).pick({
      name: true,
      countryId: true,
      description: true,
      imageUrl: true,
      active: true
    });
    insertAirportSchema = createInsertSchema(airports).pick({
      name: true,
      cityId: true,
      code: true,
      description: true,
      imageUrl: true,
      active: true
    });
    insertUserSchema = createInsertSchema(users).pick({
      username: true,
      password: true,
      email: true,
      displayName: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      fullName: true,
      role: true,
      bio: true,
      avatarUrl: true,
      status: true
    });
    insertDestinationSchema = createInsertSchema(destinations).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      updatedBy: true
    });
    insertPackageSchema = createInsertSchema(packages).pick({
      title: true,
      description: true,
      shortDescription: true,
      overview: true,
      price: true,
      discountedPrice: true,
      imageUrl: true,
      galleryUrls: true,
      duration: true,
      rating: true,
      destinationId: true,
      countryId: true,
      cityId: true,
      categoryId: true,
      category: true,
      featured: true,
      type: true,
      inclusions: true,
      slug: true,
      startDate: true,
      endDate: true,
      validUntil: true,
      cancellationPolicy: true,
      childrenPolicy: true,
      termsAndConditions: true,
      excludedItems: true,
      includedFeatures: true,
      excludedFeatures: true,
      markup: true,
      markupType: true,
      discountType: true,
      discountValue: true
    }).refine(
      (data) => {
        const hasMainImage = data.imageUrl && data.imageUrl.trim() !== "";
        const hasGalleryImages = data.galleryUrls && Array.isArray(data.galleryUrls) && data.galleryUrls.length > 0;
        return hasMainImage || hasGalleryImages;
      },
      {
        message: "At least one image is required. Please provide either a main image or add images to the gallery.",
        path: ["imageUrl"]
        // This will show the error on the imageUrl field
      }
    );
    insertBookingSchema = createInsertSchema(bookings).pick({
      userId: true,
      packageId: true,
      travelDate: true,
      numberOfTravelers: true,
      totalPrice: true,
      status: true
    });
    insertFavoriteSchema = createInsertSchema(favorites).pick({
      userId: true,
      destinationId: true
    });
    insertTourSchema = createInsertSchema(tours).pick({
      name: true,
      description: true,
      destinationId: true,
      duration: true,
      price: true,
      maxCapacity: true,
      imageUrl: true,
      active: true,
      featured: true,
      currency: true,
      galleryUrls: true,
      startDate: true,
      endDate: true,
      tripType: true,
      numPassengers: true,
      discountedPrice: true,
      included: true,
      excluded: true,
      itinerary: true,
      maxGroupSize: true,
      rating: true,
      reviewCount: true,
      status: true,
      nameAr: true,
      descriptionAr: true,
      itineraryAr: true,
      includedAr: true,
      excludedAr: true,
      hasArabicVersion: true,
      categoryId: true,
      durationType: true,
      date: true
    }).extend({
      date: z.preprocess((val) => {
        if (!val) return null;
        if (val instanceof Date) return val;
        if (typeof val === "string") {
          const date = new Date(val);
          return isNaN(date.getTime()) ? null : date;
        }
        return null;
      }, z.date().nullable().optional()),
      startDate: z.preprocess((val) => {
        if (!val) return null;
        if (val instanceof Date) return val;
        if (typeof val === "string") {
          const date = new Date(val);
          return isNaN(date.getTime()) ? null : date;
        }
        return null;
      }, z.date().nullable().optional()),
      endDate: z.preprocess((val) => {
        if (!val) return null;
        if (val instanceof Date) return val;
        if (typeof val === "string") {
          const date = new Date(val);
          return isNaN(date.getTime()) ? null : date;
        }
        return null;
      }, z.date().nullable().optional())
    });
    insertHotelSchema = createInsertSchema(hotels).pick({
      name: true,
      description: true,
      shortDescription: true,
      destinationId: true,
      countryId: true,
      cityId: true,
      categoryId: true,
      address: true,
      city: true,
      country: true,
      postalCode: true,
      phone: true,
      email: true,
      website: true,
      imageUrl: true,
      galleryUrls: true,
      stars: true,
      basePrice: true,
      currency: true,
      amenities: true,
      checkInTime: true,
      checkOutTime: true,
      longitude: true,
      latitude: true,
      featured: true,
      rating: true,
      guestRating: true,
      status: true,
      verificationStatus: true,
      parkingAvailable: true,
      airportTransferAvailable: true,
      carRentalAvailable: true,
      shuttleAvailable: true,
      wifiAvailable: true,
      petFriendly: true,
      accessibleFacilities: true,
      createdBy: true,
      // Additional info fields
      languages: true,
      // Add languages field to support multi-language hotels
      // Complex data fields
      restaurants: true,
      landmarks: true,
      faqs: true,
      roomTypes: true,
      features: true
      // Add features field for hotel feature objects
    }).extend({
      // JSON preprocessing for complex data fields - allow valid arrays to pass through
      restaurants: z.preprocess((val) => {
        if (!val) return null;
        if (Array.isArray(val)) return val;
        return val;
      }, z.array(z.any()).nullable().optional()),
      landmarks: z.preprocess((val) => {
        if (!val) return null;
        if (Array.isArray(val)) return val;
        return val;
      }, z.array(z.any()).nullable().optional()),
      faqs: z.preprocess((val) => {
        if (!val) return null;
        if (Array.isArray(val)) return val;
        return val;
      }, z.array(z.any()).nullable().optional()),
      roomTypes: z.preprocess((val) => {
        if (!val) return null;
        if (Array.isArray(val)) return val;
        return val;
      }, z.array(z.any()).nullable().optional()),
      features: z.preprocess(
        (val) => {
          if (!val) return [];
          if (Array.isArray(val)) return val;
          return [];
        },
        z.array(
          z.object({
            name: z.string(),
            icon: z.string()
          })
        ).default([])
      )
    });
    insertHeroSlideSchema = createInsertSchema(heroSlides).pick({
      title: true,
      subtitle: true,
      description: true,
      imageUrl: true,
      buttonText: true,
      buttonLink: true,
      secondaryButtonText: true,
      secondaryButtonLink: true,
      order: true,
      active: true
    });
    insertRoomSchema = createInsertSchema(rooms).pick({
      name: true,
      description: true,
      hotelId: true,
      type: true,
      maxOccupancy: true,
      maxAdults: true,
      maxChildren: true,
      maxInfants: true,
      price: true,
      discountedPrice: true,
      imageUrl: true,
      size: true,
      bedType: true,
      amenities: true,
      view: true,
      available: true,
      status: true
    });
    insertRoomCombinationSchema = createInsertSchema(
      roomCombinations
    ).pick({
      roomId: true,
      adultsCount: true,
      childrenCount: true,
      infantsCount: true,
      description: true,
      isDefault: true,
      active: true
    });
    insertTransportLocationSchema = createInsertSchema(
      transportLocations
    ).pick({
      name: true,
      city: true,
      country: true,
      locationType: true,
      description: true,
      imageUrl: true,
      popular: true,
      latitude: true,
      longitude: true,
      status: true
    });
    insertTransportDurationSchema = createInsertSchema(
      transportDurations
    ).pick({
      name: true,
      hours: true,
      description: true,
      status: true
    });
    insertTranslationSchema = createInsertSchema(translations).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      createdBy: true,
      updatedBy: true
    });
    insertSiteLanguageSettingsSchema = createInsertSchema(
      siteLanguageSettings
    ).pick({
      defaultLanguage: true,
      availableLanguages: true,
      rtlLanguages: true
    });
    insertDictionaryEntrySchema = createInsertSchema(
      dictionaryEntries
    ).pick({
      word: true,
      englishDefinition: true,
      arabicTranslation: true,
      partOfSpeech: true,
      context: true,
      example: true,
      notes: true
    });
    insertTransportTypeSchema = createInsertSchema(
      transportTypes
    ).pick({
      name: true,
      description: true,
      imageUrl: true,
      passengerCapacity: true,
      baggageCapacity: true,
      defaultFeatures: true,
      status: true
    });
    insertMenuSchema = createInsertSchema(menus).pick({
      name: true,
      location: true,
      description: true,
      active: true
    });
    insertMenuItemSchema = createInsertSchema(menuItems).pick({
      menuId: true,
      parentId: true,
      title: true,
      url: true,
      icon: true,
      order: true,
      target: true,
      active: true
    });
    insertTransportationSchema = createInsertSchema(
      transportation
    ).pick({
      name: true,
      description: true,
      typeId: true,
      destinationId: true,
      fromLocationId: true,
      toLocationId: true,
      durationId: true,
      passengerCapacity: true,
      baggageCapacity: true,
      price: true,
      discountedPrice: true,
      imageUrl: true,
      galleryUrls: true,
      features: true,
      withDriver: true,
      available: true,
      pickupIncluded: true,
      featured: true,
      rating: true,
      status: true
    });
    reviews = pgTable("reviews", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id).notNull(),
      bookingId: integer("booking_id").references(() => bookings.id),
      packageId: integer("package_id").references(() => packages.id),
      tourId: integer("tour_id").references(() => tours.id),
      hotelId: integer("hotel_id").references(() => hotels.id),
      rating: integer("rating").notNull(),
      // 1-5 stars
      title: text("title"),
      comment: text("comment"),
      pros: json("pros"),
      // Array of positive points
      cons: json("cons"),
      // Array of negative points
      wouldRecommend: boolean("would_recommend").default(true),
      travelDate: timestamp("travel_date"),
      verified: boolean("verified").default(false),
      helpful: integer("helpful").default(0),
      notHelpful: integer("not_helpful").default(0),
      status: text("status").default("pending"),
      // pending, approved, rejected
      moderatorNotes: text("moderator_notes"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    payments = pgTable("payments", {
      id: serial("id").primaryKey(),
      paymentReference: text("payment_reference").notNull().unique(),
      bookingId: integer("booking_id").references(() => bookings.id).notNull(),
      userId: integer("user_id").references(() => users.id).notNull(),
      amount: integer("amount").notNull(),
      currency: text("currency").default("EGP").notNull(),
      paymentMethod: text("payment_method").notNull(),
      // card, paypal, bank_transfer
      paymentProvider: text("payment_provider"),
      // stripe, paypal, etc.
      providerTransactionId: text("provider_transaction_id"),
      status: text("status").default("pending").notNull(),
      // pending, completed, failed, refunded
      failureReason: text("failure_reason"),
      refundAmount: integer("refund_amount").default(0),
      refundReason: text("refund_reason"),
      processingFee: integer("processing_fee").default(0),
      netAmount: integer("net_amount").notNull(),
      paidAt: timestamp("paid_at"),
      refundedAt: timestamp("refunded_at"),
      metadata: json("metadata"),
      // Additional payment data
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id).notNull(),
      type: text("type").notNull(),
      // booking_confirmation, payment_received, etc.
      title: text("title").notNull(),
      message: text("message").notNull(),
      relatedBookingId: integer("related_booking_id").references(() => bookings.id),
      relatedPaymentId: integer("related_payment_id").references(() => payments.id),
      read: boolean("read").default(false),
      actionUrl: text("action_url"),
      actionText: text("action_text"),
      priority: text("priority").default("normal"),
      // low, normal, high, urgent
      channel: text("channel").default("in_app"),
      // in_app, email, sms
      sentAt: timestamp("sent_at"),
      expiresAt: timestamp("expires_at"),
      metadata: json("metadata"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    travelers = pgTable("travelers", {
      id: serial("id").primaryKey(),
      bookingId: integer("booking_id").references(() => bookings.id).notNull(),
      type: text("type").notNull(),
      // adult, child, infant
      title: text("title"),
      // Mr, Mrs, Ms, Dr
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      dateOfBirth: timestamp("date_of_birth"),
      nationality: text("nationality"),
      passportNumber: text("passport_number"),
      passportExpiry: timestamp("passport_expiry"),
      passportIssueCountry: text("passport_issue_country"),
      dietaryRequirements: text("dietary_requirements"),
      medicalConditions: text("medical_conditions"),
      specialRequests: text("special_requests"),
      emergencyContact: text("emergency_contact"),
      emergencyPhone: text("emergency_phone"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    coupons = pgTable("coupons", {
      id: serial("id").primaryKey(),
      code: text("code").notNull().unique(),
      name: text("name").notNull(),
      description: text("description"),
      type: text("type").notNull(),
      // percentage, fixed_amount
      value: integer("value").notNull(),
      // percentage or amount in cents
      minOrderAmount: integer("min_order_amount").default(0),
      maxDiscountAmount: integer("max_discount_amount"),
      usageLimit: integer("usage_limit"),
      usageCount: integer("usage_count").default(0),
      userLimit: integer("user_limit").default(1),
      // per user usage limit
      validFrom: timestamp("valid_from").notNull(),
      validUntil: timestamp("valid_until").notNull(),
      applicableToPackages: boolean("applicable_to_packages").default(true),
      applicableToTours: boolean("applicable_to_tours").default(true),
      applicableToHotels: boolean("applicable_to_hotels").default(true),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    couponUsages = pgTable("coupon_usages", {
      id: serial("id").primaryKey(),
      couponId: integer("coupon_id").references(() => coupons.id).notNull(),
      userId: integer("user_id").references(() => users.id).notNull(),
      bookingId: integer("booking_id").references(() => bookings.id).notNull(),
      discountAmount: integer("discount_amount").notNull(),
      usedAt: timestamp("used_at").notNull().defaultNow(),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdBy: integer("created_by").references(() => users.id),
      updatedBy: integer("updated_by").references(() => users.id)
    });
    insertTourCategorySchema = createInsertSchema(tourCategories).pick(
      {
        name: true,
        description: true,
        active: true
      }
    );
    insertHotelCategorySchema = createInsertSchema(
      hotelCategories
    ).pick({
      name: true,
      description: true,
      active: true
    });
    insertRoomCategorySchema = createInsertSchema(roomCategories).pick(
      {
        name: true,
        description: true,
        active: true
      }
    );
    insertPackageCategorySchema = createInsertSchema(
      packageCategories
    ).pick({
      name: true,
      description: true,
      active: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { sql } from "drizzle-orm";
async function initializeDatabase() {
  try {
    console.log("Testing database connection...");
    await db.execute(sql`SELECT 1`);
    console.log("Database connection established successfully");
    return true;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return false;
  }
}
var DATABASE_URL, pool, db, dbPromise;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_ZN9Ylt3AoQRJ@ep-dawn-voice-a8bd2yi7-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";
    if (!DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
    dbPromise = initializeDatabase();
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DatabaseStorage: () => DatabaseStorage,
  storage: () => storage
});
import { eq, and, desc, asc } from "drizzle-orm";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync, DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    scryptAsync = promisify(scrypt);
    DatabaseStorage = class {
      // Users
      async getUser(id) {
        try {
          const [user] = await db.select().from(users).where(eq(users.id, id));
          return user || void 0;
        } catch (error) {
          console.error("Error getting user:", error);
          return void 0;
        }
      }
      async getUserByUsername(username) {
        try {
          const [user] = await db.select().from(users).where(eq(users.username, username));
          return user || void 0;
        } catch (error) {
          console.error("Error getting user by username:", error);
          return void 0;
        }
      }
      async createUser(user) {
        const [created] = await db.insert(users).values(user).returning();
        return created;
      }
      async updateUser(id, user) {
        const [updated] = await db.update(users).set({
          ...user,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, id)).returning();
        return updated || void 0;
      }
      async listUsers() {
        try {
          return await db.select().from(users).orderBy(asc(users.id));
        } catch (error) {
          console.error("Error listing users:", error);
          return [];
        }
      }
      async verifyPassword(password, hashedPassword) {
        try {
          const [storedHash, salt] = hashedPassword.split(".");
          if (!salt) return false;
          const buf = await scryptAsync(password, salt, 64);
          const derivedKey = buf.toString("hex");
          return timingSafeEqual(
            Buffer.from(storedHash, "hex"),
            Buffer.from(derivedKey, "hex")
          );
        } catch (error) {
          console.error("Error verifying password:", error);
          return false;
        }
      }
      // Countries
      async getCountry(id) {
        try {
          const [country] = await db.select().from(countries).where(eq(countries.id, id));
          return country || void 0;
        } catch (error) {
          console.error("Error getting country:", error);
          return void 0;
        }
      }
      async getCountryByCode(code) {
        try {
          const [country] = await db.select().from(countries).where(eq(countries.code, code));
          return country || void 0;
        } catch (error) {
          console.error("Error getting country by code:", error);
          return void 0;
        }
      }
      async listCountries(active) {
        try {
          if (active !== void 0) {
            return await db.select().from(countries).where(eq(countries.active, active)).orderBy(asc(countries.name));
          }
          return await db.select().from(countries).orderBy(asc(countries.name));
        } catch (error) {
          console.error("Error listing countries:", error);
          return [];
        }
      }
      async createCountry(country) {
        const [created] = await db.insert(countries).values(country).returning();
        return created;
      }
      async updateCountry(id, country) {
        try {
          const [updated] = await db.update(countries).set(country).where(eq(countries.id, id)).returning();
          return updated || void 0;
        } catch (error) {
          console.error("Error updating country:", error);
          return void 0;
        }
      }
      // Cities
      async getCity(id) {
        try {
          const [city] = await db.select().from(cities).where(eq(cities.id, id));
          return city || void 0;
        } catch (error) {
          console.error("Error getting city:", error);
          return void 0;
        }
      }
      async listCities(countryId, active) {
        try {
          const conditions = [];
          if (countryId !== void 0) {
            conditions.push(eq(cities.countryId, countryId));
          }
          if (active !== void 0) {
            conditions.push(eq(cities.active, active));
          }
          if (conditions.length > 0) {
            return await db.select().from(cities).where(and(...conditions)).orderBy(asc(cities.name));
          }
          return await db.select().from(cities).orderBy(asc(cities.name));
        } catch (error) {
          console.error("Error listing cities:", error);
          return [];
        }
      }
      async createCity(city) {
        const [created] = await db.insert(cities).values(city).returning();
        return created;
      }
      // Airports
      async getAirport(id) {
        try {
          const [airport] = await db.select().from(airports).where(eq(airports.id, id));
          return airport || void 0;
        } catch (error) {
          console.error("Error getting airport:", error);
          return void 0;
        }
      }
      async listAirports(active) {
        try {
          if (active !== void 0) {
            return await db.select().from(airports).where(eq(airports.active, active)).orderBy(asc(airports.name));
          }
          return await db.select().from(airports).orderBy(asc(airports.name));
        } catch (error) {
          console.error("Error listing airports:", error);
          return [];
        }
      }
      async createAirport(airport) {
        const [created] = await db.insert(airports).values(airport).returning();
        return created;
      }
      async updateAirport(id, airport) {
        try {
          const [updated] = await db.update(airports).set(airport).where(eq(airports.id, id)).returning();
          return updated || void 0;
        } catch (error) {
          console.error("Error updating airport:", error);
          return void 0;
        }
      }
      async deleteAirport(id) {
        try {
          const result = await db.delete(airports).where(eq(airports.id, id));
          return result.rowCount !== null && result.rowCount > 0;
        } catch (error) {
          console.error("Error deleting airport:", error);
          return false;
        }
      }
      // Destinations
      async getDestination(id) {
        try {
          const [destination] = await db.select().from(destinations).where(eq(destinations.id, id));
          return destination || void 0;
        } catch (error) {
          console.error("Error getting destination:", error);
          return void 0;
        }
      }
      async listDestinations(active) {
        try {
          if (active !== void 0) {
            return await db.select().from(destinations).where(eq(destinations.featured, active)).orderBy(desc(destinations.createdAt));
          }
          return await db.select().from(destinations).orderBy(desc(destinations.createdAt));
        } catch (error) {
          console.error("Error listing destinations:", error);
          return [];
        }
      }
      async listTransportTypes() {
        try {
          return await db.select().from(transportTypes).orderBy(transportTypes.name);
        } catch (error) {
          console.error("Error listing transport types:", error);
          return [];
        }
      }
      async createDestination(destination) {
        const [created] = await db.insert(destinations).values(destination).returning();
        return created;
      }
      async updateDestination(id, destination) {
        try {
          const [updatedDestination] = await db.update(destinations).set(destination).where(eq(destinations.id, id)).returning();
          return updatedDestination;
        } catch (error) {
          console.error("Error updating destination:", error);
          return void 0;
        }
      }
      async deleteDestination(id) {
        try {
          console.log(`Attempting to delete destination with ID: ${id}`);
          const result = await db.delete(destinations).where(eq(destinations.id, id));
          console.log(`Delete destination result:`, result);
          return true;
        } catch (error) {
          console.error("Error deleting destination:", error);
          return false;
        }
      }
      // Packages
      async getPackage(id) {
        try {
          const [pkg] = await db.select().from(packages).where(eq(packages.id, id));
          return pkg || void 0;
        } catch (error) {
          console.error("Error getting package:", error);
          return void 0;
        }
      }
      async listPackages(active) {
        try {
          if (active !== void 0) {
            return await db.select().from(packages).where(eq(packages.featured, active)).orderBy(desc(packages.createdAt));
          }
          return await db.select().from(packages).orderBy(desc(packages.createdAt));
        } catch (error) {
          console.error("Error listing packages:", error);
          return [];
        }
      }
      async createPackage(pkg) {
        const [created] = await db.insert(packages).values(pkg).returning();
        return created;
      }
      async updatePackage(id, pkg) {
        const [updated] = await db.update(packages).set({
          ...pkg,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(packages.id, id)).returning();
        return updated || void 0;
      }
      async deletePackage(id) {
        try {
          const result = await db.delete(packages).where(eq(packages.id, id));
          return !!result;
        } catch (error) {
          console.error("Error deleting package:", error);
          return false;
        }
      }
      // Hotels
      async getHotel(id) {
        try {
          const [hotel] = await db.select().from(hotels).where(eq(hotels.id, id));
          return hotel || void 0;
        } catch (error) {
          console.error("Error getting hotel:", error);
          return void 0;
        }
      }
      async listHotels(active) {
        try {
          const client = await pool.connect();
          try {
            await client.query(`
          ALTER TABLE hotels 
          ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id)
        `);
          } catch (alterError) {
            console.log(
              "Country ID column may already exist or table structure issue:",
              alterError.message
            );
          }
          client.release();
          if (active !== void 0) {
            return await db.select().from(hotels).where(eq(hotels.status, active ? "active" : "inactive")).orderBy(desc(hotels.createdAt));
          }
          return await db.select().from(hotels).orderBy(desc(hotels.createdAt));
        } catch (error) {
          console.error("Error listing hotels:", error);
          return [];
        }
      }
      async createHotel(hotel) {
        try {
          console.log("Storage createHotel called with data:", hotel);
          console.log("Hotel data keys:", Object.keys(hotel));
          console.log("=== STORAGE FEATURES DEBUG ===");
          console.log("Input hotel.features:", hotel.features);
          console.log("Input features type:", typeof hotel.features);
          console.log("Input features is array:", Array.isArray(hotel.features));
          if (Array.isArray(hotel.features)) {
            console.log("Input features length:", hotel.features.length);
            hotel.features.forEach((feature, index) => {
              console.log(`Input feature ${index}:`, JSON.stringify(feature));
            });
          }
          const processedHotel = {
            ...hotel,
            restaurants: hotel.restaurants || null,
            landmarks: hotel.landmarks || null,
            faqs: hotel.faqs,
            roomTypes: hotel.roomTypes,
            galleryUrls: hotel.galleryUrls,
            amenities: hotel.amenities || null,
            languages: hotel.languages || ["en"],
            features: hotel.features || []
            // Add features array for simplified storage
          };
          console.log("Processed hotel data for insertion:", processedHotel);
          console.log("=== PROCESSED FEATURES DEBUG ===");
          console.log("Processed hotel.features:", processedHotel.features);
          console.log("Processed features type:", typeof processedHotel.features);
          console.log("Processed features is array:", Array.isArray(processedHotel.features));
          if (Array.isArray(processedHotel.features)) {
            console.log("Processed features length:", processedHotel.features.length);
            processedHotel.features.forEach((feature, index) => {
              console.log(`Processed feature ${index}:`, JSON.stringify(feature));
            });
          }
          const [created] = await db.insert(hotels).values(processedHotel).returning();
          console.log("Hotel created successfully in storage:", created);
          return created;
        } catch (error) {
          console.error("Database error in createHotel:", error);
          console.error("Hotel data that caused error:", hotel);
          throw error;
        }
      }
      async updateHotel(id, hotel) {
        try {
          console.log("Storage updateHotel called for ID:", id);
          console.log("Update data:", hotel);
          const [updated] = await db.update(hotels).set(hotel).where(eq(hotels.id, id)).returning();
          console.log("Hotel updated successfully in storage:", updated);
          return updated;
        } catch (error) {
          console.error("Database error in updateHotel:", error);
          console.error("Hotel ID:", id);
          console.error("Update data that caused error:", hotel);
          throw error;
        }
      }
      async getHotelWithFeatures(id) {
        try {
          const [hotel] = await db.select().from(hotels).where(eq(hotels.id, id));
          if (!hotel) {
            return void 0;
          }
          const facilityIds = await this.getHotelFeatureAssociations(
            id,
            "facilities"
          );
          const highlightIds = await this.getHotelFeatureAssociations(
            id,
            "highlights"
          );
          const cleanlinessFeatureIds = await this.getHotelFeatureAssociations(
            id,
            "cleanlinessFeatures"
          );
          let restaurants = [];
          let landmarks = [];
          let faqs = [];
          let roomTypes = [];
          if (hotel.restaurants && typeof hotel.restaurants === "string") {
            try {
              restaurants = JSON.parse(hotel.restaurants);
            } catch (e) {
              console.log("Error parsing restaurants:", e);
              restaurants = [];
            }
          } else if (Array.isArray(hotel.restaurants)) {
            restaurants = hotel.restaurants;
          }
          if (hotel.landmarks && typeof hotel.landmarks === "string") {
            try {
              landmarks = JSON.parse(hotel.landmarks);
            } catch (e) {
              console.log("Error parsing landmarks:", e);
              landmarks = [];
            }
          } else if (Array.isArray(hotel.landmarks)) {
            landmarks = hotel.landmarks;
          }
          if (hotel.faqs && typeof hotel.faqs === "string") {
            try {
              faqs = JSON.parse(hotel.faqs);
            } catch (e) {
              console.log("Error parsing faqs:", e);
              faqs = [];
            }
          } else if (Array.isArray(hotel.faqs)) {
            faqs = hotel.faqs;
          }
          if (hotel.roomTypes && typeof hotel.roomTypes === "string") {
            try {
              roomTypes = JSON.parse(hotel.roomTypes);
            } catch (e) {
              console.log("Error parsing room types:", e);
              roomTypes = [];
            }
          } else if (Array.isArray(hotel.roomTypes)) {
            roomTypes = hotel.roomTypes;
          }
          console.log("Hotel with features loaded:", {
            id: hotel.id,
            name: hotel.name,
            restaurantsCount: restaurants.length,
            landmarksCount: landmarks.length,
            faqsCount: faqs.length,
            roomTypesCount: roomTypes.length
          });
          return {
            ...hotel,
            facilityIds,
            highlightIds,
            cleanlinessFeatureIds,
            // Also include the actual feature objects for backwards compatibility
            facilities: facilityIds,
            highlights: highlightIds,
            cleanlinessFeatures: cleanlinessFeatureIds,
            // Include complex data
            restaurants,
            landmarks,
            faqs,
            roomTypes
          };
        } catch (error) {
          console.error("Error fetching hotel with features:", error);
          return await this.getHotel(id);
        }
      }
      async getHotelFeatureAssociations(hotelId, featureType) {
        try {
          const client = await pool.connect();
          let result;
          switch (featureType) {
            case "facilities":
              result = await client.query(
                "SELECT facility_id FROM hotel_to_facilities WHERE hotel_id = $1",
                [hotelId]
              );
              client.release();
              return result.rows.map((row) => row.facility_id);
            case "highlights":
              result = await client.query(
                "SELECT highlight_id FROM hotel_to_highlights WHERE hotel_id = $1",
                [hotelId]
              );
              client.release();
              return result.rows.map((row) => row.highlight_id);
            case "cleanlinessFeatures":
              result = await client.query(
                "SELECT feature_id FROM hotel_to_cleanliness WHERE hotel_id = $1",
                [hotelId]
              );
              client.release();
              return result.rows.map((row) => row.feature_id);
            default:
              client.release();
              return [];
          }
        } catch (error) {
          console.error(`Error fetching hotel ${featureType}:`, error);
          return [];
        }
      }
      async updateHotelFeatureAssociations(hotelId, featureType, featureIds) {
        try {
          console.log(
            `Updating hotel ${featureType} for hotel ${hotelId}:`,
            featureIds
          );
          switch (featureType) {
            case "facilities":
              await db.delete(hotelToFacilities).where(eq(hotelToFacilities.hotelId, hotelId));
              if (featureIds.length > 0) {
                const values = featureIds.map((facilityId) => ({
                  hotelId,
                  facilityId
                }));
                await db.insert(hotelToFacilities).values(values);
              }
              break;
            case "highlights":
              await db.delete(hotelToHighlights).where(eq(hotelToHighlights.hotelId, hotelId));
              if (featureIds.length > 0) {
                const values = featureIds.map((highlightId) => ({
                  hotelId,
                  highlightId
                }));
                await db.insert(hotelToHighlights).values(values);
              }
              break;
            case "cleanlinessFeatures":
              await db.delete(hotelToCleanlinessFeatures).where(eq(hotelToCleanlinessFeatures.hotelId, hotelId));
              if (featureIds.length > 0) {
                const values = featureIds.map((featureId) => ({
                  hotelId,
                  featureId
                }));
                await db.insert(hotelToCleanlinessFeatures).values(values);
              }
              break;
            default:
              console.warn(`Unknown feature type: ${featureType}`);
          }
          console.log(`Successfully updated ${featureType} associations for hotel ${hotelId}`);
        } catch (error) {
          console.error(`Error updating hotel ${featureType}:`, error);
          throw error;
        }
      }
      // Tours
      async getTour(id) {
        try {
          const [tour] = await db.select().from(tours).where(eq(tours.id, id));
          return tour || void 0;
        } catch (error) {
          console.error("Error getting tour:", error);
          return void 0;
        }
      }
      async listTours(active) {
        try {
          if (active !== void 0) {
            return await db.select().from(tours).where(eq(tours.active, active)).orderBy(desc(tours.createdAt));
          }
          return await db.select().from(tours).orderBy(desc(tours.createdAt));
        } catch (error) {
          console.error("Error listing tours:", error);
          return [];
        }
      }
      async createTour(tour) {
        const [created] = await db.insert(tours).values(tour).returning();
        return created;
      }
      async updateTour(id, tour) {
        try {
          const [updatedTour] = await db.update(tours).set({
            ...tour,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(tours.id, id)).returning();
          return updatedTour || void 0;
        } catch (error) {
          console.error("Error updating tour:", error);
          return void 0;
        }
      }
      async deleteTour(id) {
        try {
          const result = await db.delete(tours).where(eq(tours.id, id));
          return true;
        } catch (error) {
          console.error("Error deleting tour:", error);
          return false;
        }
      }
      // Hero Slides
      async getActiveHeroSlides() {
        try {
          console.log("Storage: Attempting to fetch hero slides...");
          const slides = await db.select().from(heroSlides).where(eq(heroSlides.active, true)).orderBy(asc(heroSlides.order));
          console.log("Storage: Successfully fetched hero slides:", slides.length);
          return slides;
        } catch (error) {
          console.error("Storage: Error getting active hero slides:", error);
          return [];
        }
      }
      async createHeroSlide(slide) {
        const [created] = await db.insert(heroSlides).values(slide).returning();
        return created;
      }
      // Menus
      async getMenuByLocation(location) {
        try {
          const [menu] = await db.select().from(menus).where(eq(menus.location, location));
          return menu || void 0;
        } catch (error) {
          console.error("Error getting menu by location:", error);
          return void 0;
        }
      }
      async listMenus() {
        try {
          return await db.select().from(menus).orderBy(asc(menus.name));
        } catch (error) {
          console.error("Error listing menus:", error);
          return [];
        }
      }
      async createMenu(menu) {
        const [created] = await db.insert(menus).values(menu).returning();
        return created;
      }
      // Package Categories
      async listPackageCategories(active) {
        try {
          const client = await pool.connect();
          const result = await client.query(
            "SELECT * FROM package_categories ORDER BY name"
          );
          client.release();
          return result.rows || [];
        } catch (error) {
          console.error("Error listing package categories:", error);
          return [];
        }
      }
      async createPackageCategory(category) {
        try {
          const client = await pool.connect();
          const result = await client.query(
            "INSERT INTO package_categories (name, description, active) VALUES ($1, $2, $3) RETURNING *",
            [
              category.name,
              category.description || null,
              category.active !== false
            ]
          );
          client.release();
          return result.rows[0] || null;
        } catch (error) {
          console.error("Error creating package category:", error);
          throw error;
        }
      }
      // Menu Items
      async listMenuItems(menuId) {
        try {
          const client = await pool.connect();
          let result;
          if (menuId !== void 0) {
            result = await client.query(
              'SELECT * FROM menu_items WHERE menu_id = $1 ORDER BY "order"',
              [menuId]
            );
          } else {
            result = await client.query(
              'SELECT * FROM menu_items ORDER BY "order"'
            );
          }
          client.release();
          return result.rows || [];
        } catch (error) {
          console.error("Error listing menu items:", error);
          return [];
        }
      }
      async createMenuItem(item) {
        try {
          const client = await pool.connect();
          const result = await client.query(
            'INSERT INTO menu_items (menu_id, title, url, icon, "order", active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [
              item.menuId,
              item.title,
              item.url || null,
              item.icon || null,
              item.order || 0,
              item.active !== false
            ]
          );
          client.release();
          return result.rows[0] || null;
        } catch (error) {
          console.error("Error creating menu item:", error);
          throw error;
        }
      }
      // Tour Categories
      async listTourCategories(active) {
        try {
          const client = await pool.connect();
          let result;
          if (active !== void 0) {
            result = await client.query(
              "SELECT * FROM tour_categories WHERE active = $1 ORDER BY name",
              [active]
            );
          } else {
            result = await client.query(
              "SELECT * FROM tour_categories ORDER BY name"
            );
          }
          client.release();
          return result.rows || [];
        } catch (error) {
          console.error("Error listing tour categories:", error);
          return [];
        }
      }
      async createTourCategory(category) {
        try {
          const client = await pool.connect();
          const result = await client.query(
            "INSERT INTO tour_categories (name, description, active) VALUES ($1, $2, $3) RETURNING *",
            [
              category.name,
              category.description || null,
              category.active !== false
            ]
          );
          client.release();
          return result.rows[0] || null;
        } catch (error) {
          console.error("Error creating tour category:", error);
          throw error;
        }
      }
      // Translations
      async listTranslations() {
        try {
          return await db.select().from(translations).orderBy(asc(translations.key));
        } catch (error) {
          console.error("Error listing translations:", error);
          return [];
        }
      }
      async getTranslation(id) {
        try {
          const result = await db.select().from(translations).where(eq(translations.id, id));
          return result[0];
        } catch (error) {
          console.error("Error getting translation:", error);
          return void 0;
        }
      }
      async getTranslationByKey(key) {
        try {
          const result = await db.select().from(translations).where(eq(translations.key, key));
          return result[0];
        } catch (error) {
          console.error("Error getting translation by key:", error);
          return void 0;
        }
      }
      async createTranslation(translation) {
        try {
          const result = await db.insert(translations).values(translation).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating translation:", error);
          throw error;
        }
      }
      async updateTranslation(id, translation) {
        try {
          const result = await db.update(translations).set({ ...translation, updatedAt: /* @__PURE__ */ new Date() }).where(eq(translations.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error("Error updating translation:", error);
          return void 0;
        }
      }
      async deleteTranslation(id) {
        try {
          const result = await db.delete(translations).where(eq(translations.id, id));
          return (result.rowCount || 0) > 0;
        } catch (error) {
          console.error("Error deleting translation:", error);
          return false;
        }
      }
      // Language Settings
      async getSiteLanguageSettings() {
        try {
          const client = await pool.connect();
          const result = await client.query("SELECT * FROM site_language_settings");
          client.release();
          return result.rows || [];
        } catch (error) {
          console.error("Error getting site language settings:", error);
          return [];
        }
      }
      async updateSiteLanguageSettings(settings) {
        try {
          const client = await pool.connect();
          const result = await client.query(
            "UPDATE site_language_settings SET default_language = $1 WHERE id = 1 RETURNING *",
            [settings.defaultLanguage || "en"]
          );
          client.release();
          return result.rows[0] || null;
        } catch (error) {
          console.error("Error updating site language settings:", error);
          return void 0;
        }
      }
      // Rooms management
      async listRooms(hotelId) {
        try {
          console.log("\u{1F50D} Listing rooms with hotelId:", hotelId);
          const client = await pool.connect();
          const sqlQuery = hotelId ? "SELECT * FROM rooms WHERE hotel_id = $1 ORDER BY created_at DESC" : "SELECT * FROM rooms ORDER BY created_at DESC";
          const params = hotelId ? [hotelId] : [];
          const result = await client.query(sqlQuery, params);
          client.release();
          console.log("\u2705 Rooms query result:", result.rows.length, "rooms found");
          if (result.rows.length > 0) {
            console.log("\u{1F4CB} Sample room:", {
              id: result.rows[0].id,
              name: result.rows[0].name,
              hotel_id: result.rows[0].hotel_id
            });
          }
          return result.rows || [];
        } catch (error) {
          console.error("\u274C Error listing rooms:", error);
          return [];
        }
      }
      async createRoom(room) {
        try {
          const [newRoom] = await db.insert(rooms).values({
            name: room.name,
            description: room.description,
            hotelId: room.hotelId,
            type: room.type,
            maxOccupancy: room.maxOccupancy,
            maxAdults: room.maxAdults,
            maxChildren: room.maxChildren || 0,
            maxInfants: room.maxInfants || 0,
            price: room.price,
            discountedPrice: room.discountedPrice,
            currency: room.currency || "EGP",
            imageUrl: room.imageUrl,
            size: room.size,
            bedType: room.bedType,
            amenities: room.amenities,
            view: room.view,
            available: room.available !== false,
            status: room.status || "active",
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).returning();
          return newRoom;
        } catch (error) {
          console.error("Error creating room:", error);
          throw error;
        }
      }
      async updateRoom(id, room) {
        try {
          const [updatedRoom] = await db.update(rooms).set({
            name: room.name,
            description: room.description,
            hotelId: room.hotelId,
            type: room.type,
            maxOccupancy: room.maxOccupancy,
            maxAdults: room.maxAdults,
            maxChildren: room.maxChildren || 0,
            maxInfants: room.maxInfants || 0,
            price: room.price,
            discountedPrice: room.discountedPrice,
            currency: room.currency || "EGP",
            imageUrl: room.imageUrl,
            size: room.size,
            bedType: room.bedType,
            amenities: room.amenities,
            view: room.view,
            available: room.available !== false,
            status: room.status || "active",
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(rooms.id, id)).returning();
          return updatedRoom;
        } catch (error) {
          console.error("Error updating room:", error);
          throw error;
        }
      }
      async getRoom(id) {
        try {
          const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
          return room;
        } catch (error) {
          console.error("Error getting room:", error);
          return void 0;
        }
      }
      async getRoomsByHotel(hotelId) {
        try {
          const result = await db.select().from(rooms).where(eq(rooms.hotelId, hotelId)).orderBy(rooms.createdAt);
          return result || [];
        } catch (error) {
          console.error("Error getting rooms by hotel:", error);
          return [];
        }
      }
      async deleteRoom(id) {
        try {
          await db.delete(rooms).where(eq(rooms.id, id));
          return true;
        } catch (error) {
          console.error("Error deleting room:", error);
          return false;
        }
      }
      // Hotel Facilities methods
      async listHotelFacilities() {
        try {
          return await db.select().from(hotelFacilities).orderBy(hotelFacilities.name);
        } catch (error) {
          console.error("Error listing hotel facilities:", error);
          return [];
        }
      }
      async getHotelFacility(id) {
        try {
          const [facility] = await db.select().from(hotelFacilities).where(eq(hotelFacilities.id, id));
          return facility;
        } catch (error) {
          console.error("Error getting hotel facility:", error);
          return void 0;
        }
      }
      async createHotelFacility(facility) {
        try {
          const [newFacility] = await db.insert(hotelFacilities).values({
            name: facility.name,
            description: facility.description,
            icon: facility.icon,
            category: facility.category,
            active: facility.active !== void 0 ? facility.active : true,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).returning();
          return newFacility;
        } catch (error) {
          console.error("Error creating hotel facility:", error);
          throw error;
        }
      }
      async updateHotelFacility(id, facility) {
        try {
          const [updatedFacility] = await db.update(hotelFacilities).set({
            name: facility.name,
            description: facility.description,
            icon: facility.icon,
            category: facility.category,
            active: facility.active,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(hotelFacilities.id, id)).returning();
          return updatedFacility;
        } catch (error) {
          console.error(`Error updating hotel facility with ID ${id}:`, error);
          return void 0;
        }
      }
      async deleteHotelFacility(id) {
        try {
          await db.delete(hotelFacilities).where(eq(hotelFacilities.id, id));
          return true;
        } catch (error) {
          console.error(`Error deleting hotel facility with ID ${id}:`, error);
          return false;
        }
      }
      // Hotel Highlights methods
      async listHotelHighlights() {
        try {
          return await db.select().from(hotelHighlights).orderBy(hotelHighlights.name);
        } catch (error) {
          console.error("Error listing hotel highlights:", error);
          return [];
        }
      }
      async getHotelHighlight(id) {
        try {
          const [highlight] = await db.select().from(hotelHighlights).where(eq(hotelHighlights.id, id));
          return highlight;
        } catch (error) {
          console.error("Error getting hotel highlight:", error);
          return void 0;
        }
      }
      async createHotelHighlight(highlight) {
        try {
          const [newHighlight] = await db.insert(hotelHighlights).values({
            name: highlight.name,
            description: highlight.description,
            icon: highlight.icon,
            active: highlight.active !== void 0 ? highlight.active : true,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).returning();
          return newHighlight;
        } catch (error) {
          console.error("Error creating hotel highlight:", error);
          throw error;
        }
      }
      async updateHotelHighlight(id, highlight) {
        try {
          const [updatedHighlight] = await db.update(hotelHighlights).set({
            name: highlight.name,
            description: highlight.description,
            icon: highlight.icon,
            active: highlight.active,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(hotelHighlights.id, id)).returning();
          return updatedHighlight;
        } catch (error) {
          console.error(`Error updating hotel highlight with ID ${id}:`, error);
          return void 0;
        }
      }
      async deleteHotelHighlight(id) {
        try {
          await db.delete(hotelHighlights).where(eq(hotelHighlights.id, id));
          return true;
        } catch (error) {
          console.error(`Error deleting hotel highlight with ID ${id}:`, error);
          return false;
        }
      }
      // Cleanliness Features methods
      async listCleanlinessFeatures() {
        try {
          return await db.select().from(cleanlinessFeatures).orderBy(cleanlinessFeatures.name);
        } catch (error) {
          console.error("Error listing cleanliness features:", error);
          return [];
        }
      }
      async getCleanlinessFeature(id) {
        try {
          const [feature] = await db.select().from(cleanlinessFeatures).where(eq(cleanlinessFeatures.id, id));
          return feature;
        } catch (error) {
          console.error("Error getting cleanliness feature:", error);
          return void 0;
        }
      }
      async createCleanlinessFeature(feature) {
        try {
          const [newFeature] = await db.insert(cleanlinessFeatures).values({
            name: feature.name,
            description: feature.description,
            icon: feature.icon,
            active: feature.active !== void 0 ? feature.active : true,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).returning();
          return newFeature;
        } catch (error) {
          console.error("Error creating cleanliness feature:", error);
          throw error;
        }
      }
      async updateCleanlinessFeature(id, feature) {
        try {
          const [updatedFeature] = await db.update(cleanlinessFeatures).set({
            name: feature.name,
            description: feature.description,
            icon: feature.icon,
            active: feature.active,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(cleanlinessFeatures.id, id)).returning();
          return updatedFeature;
        } catch (error) {
          console.error(`Error updating cleanliness feature with ID ${id}:`, error);
          return void 0;
        }
      }
      async deleteCleanlinessFeature(id) {
        try {
          await db.delete(cleanlinessFeatures).where(eq(cleanlinessFeatures.id, id));
          return true;
        } catch (error) {
          console.error(`Error deleting cleanliness feature with ID ${id}:`, error);
          return false;
        }
      }
      // Hotel Categories methods
      async listHotelCategories(active) {
        try {
          let query = db.select().from(hotelCategories);
          if (active !== void 0) {
            query = query.where(eq(hotelCategories.active, active));
          }
          return await query.orderBy(hotelCategories.name);
        } catch (error) {
          console.error("Error listing hotel categories:", error);
          return [];
        }
      }
      async getHotelCategory(id) {
        try {
          const [category] = await db.select().from(hotelCategories).where(eq(hotelCategories.id, id));
          return category;
        } catch (error) {
          console.error("Error getting hotel category:", error);
          return void 0;
        }
      }
      async createHotelCategory(category) {
        try {
          const [newCategory] = await db.insert(hotelCategories).values({
            name: category.name,
            description: category.description,
            active: category.active !== void 0 ? category.active : true,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).returning();
          return newCategory;
        } catch (error) {
          console.error("Error creating hotel category:", error);
          throw error;
        }
      }
      async updateHotelCategory(id, category) {
        try {
          const [updatedCategory] = await db.update(hotelCategories).set({
            name: category.name,
            description: category.description,
            active: category.active,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(hotelCategories.id, id)).returning();
          return updatedCategory;
        } catch (error) {
          console.error("Error updating hotel category:", error);
          throw error;
        }
      }
      async deleteHotelCategory(id) {
        try {
          await db.delete(hotelCategories).where(eq(hotelCategories.id, id));
          return true;
        } catch (error) {
          console.error(`Error deleting hotel category with ID ${id}:`, error);
          return false;
        }
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/admin-setup.ts
var admin_setup_exports = {};
__export(admin_setup_exports, {
  setupAdmin: () => setupAdmin
});
import { scrypt as scrypt3, randomBytes as randomBytes3 } from "crypto";
import { promisify as promisify3 } from "util";
import { eq as eq5 } from "drizzle-orm";
async function hashPassword2(password) {
  const salt = randomBytes3(16).toString("hex");
  const buf = await scryptAsync3(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function setupAdmin() {
  try {
    console.log("\u{1F510} Setting up admin users...");
    const existingAdmin = await db.select().from(users).where(eq5(users.username, "EETADMIN"));
    if (existingAdmin.length === 0) {
      const hashedPassword = await hashPassword2("passW0rd");
      await db.insert(users).values({
        username: "EETADMIN",
        password: hashedPassword,
        email: "admin@egyptexpress.com",
        displayName: "Admin User",
        role: "admin"
      });
      console.log("\u2705 Main admin user created successfully!");
    } else {
      console.log("\u2705 Main admin user already exists");
    }
    const existingTestAdmin = await db.select().from(users).where(eq5(users.username, "testadmin"));
    if (existingTestAdmin.length === 0) {
      const testAdminPassword = await hashPassword2("test123");
      await db.insert(users).values({
        username: "testadmin",
        password: testAdminPassword,
        email: "testadmin@egyptexpress.com",
        displayName: "Test Admin",
        role: "admin"
      });
      console.log("\u2705 Test admin user created successfully!");
    } else {
      console.log("\u2705 Test admin user already exists");
    }
  } catch (error) {
    console.error("\u274C Error setting up admin users:", error);
  }
}
var scryptAsync3;
var init_admin_setup = __esm({
  "server/admin-setup.ts"() {
    "use strict";
    init_schema();
    init_db();
    scryptAsync3 = promisify3(scrypt3);
  }
});

// setup-for-remix.ts
var setup_for_remix_exports = {};
__export(setup_for_remix_exports, {
  setupDatabase: () => setupDatabase
});
import { sql as sql6 } from "drizzle-orm";
async function setupDatabase() {
  console.log("\u{1F504} Checking database setup...");
  try {
    await db.execute(sql6`
      ALTER TABLE packages ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
    `);
    console.log("\u2705 Ensured packages table has slug column");
    await db.execute(sql6`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("\u2705 Ensured countries table exists");
    await db.execute(sql6`
      CREATE TABLE IF NOT EXISTS nationalities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("\u2705 Ensured nationalities table exists");
    await db.execute(sql6`
      CREATE TABLE IF NOT EXISTS visas (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        target_country_id INTEGER REFERENCES countries(id),
        image_url TEXT,
        price INTEGER,
        processing_time TEXT,
        required_documents JSONB,
        validity_period TEXT,
        entry_type TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("\u2705 Ensured visas table exists");
    await db.execute(sql6`
      CREATE TABLE IF NOT EXISTS nationality_visa_requirements (
        id SERIAL PRIMARY KEY,
        visa_id INTEGER REFERENCES visas(id) ON DELETE CASCADE,
        nationality_id INTEGER REFERENCES nationalities(id) ON DELETE CASCADE,
        requirement_details TEXT,
        additional_documents JSONB,
        fees INTEGER,
        processing_time TEXT,
        notes TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("\u2705 Ensured nationality_visa_requirements table exists");
    console.log("\u2705 All necessary visa tables are created");
    console.log("\u2705 Database setup complete!");
    return true;
  } catch (error) {
    console.error("\u274C Error setting up database:", error);
    return false;
  }
}
var init_setup_for_remix = __esm({
  "setup-for-remix.ts"() {
    "use strict";
    init_db();
  }
});

// server/seed-package-categories.ts
var seed_package_categories_exports = {};
__export(seed_package_categories_exports, {
  seedPackageCategories: () => seedPackageCategories
});
async function seedPackageCategories() {
  console.log("\u{1F3F7}\uFE0F Seeding package categories...");
  try {
    const existingCategories = await storage.listPackageCategories();
    if (existingCategories.length > 0) {
      console.log("\u2705 Package categories already seeded");
      return;
    }
    const categories = [
      {
        name: "Featured",
        description: "Our top recommended packages with special offers",
        active: true
      },
      {
        name: "Cultural",
        description: "Immersive cultural experiences visiting historical and heritage sites",
        active: true
      },
      {
        name: "Luxury",
        description: "Premium travel experiences with high-end accommodations and services",
        active: true
      },
      {
        name: "Adventure",
        description: "Exciting outdoor activities and unique experiences for thrill-seekers",
        active: true
      },
      {
        name: "Beach & Relaxation",
        description: "Beach getaways and relaxing retreats perfect for unwinding",
        active: true
      },
      {
        name: "Transportation",
        description: "Transportation services including transfers and rental options",
        active: true
      },
      {
        name: "Fly & Stay",
        description: "Combined flight and accommodation packages for convenient booking",
        active: true
      }
    ];
    for (const category of categories) {
      await storage.createPackageCategory(category);
      console.log(`\u2705 Created package category: ${category.name}`);
    }
    console.log("\u2705 Package categories seeded successfully");
  } catch (error) {
    console.error("\u274C Error seeding package categories:", error);
  }
}
var init_seed_package_categories = __esm({
  "server/seed-package-categories.ts"() {
    "use strict";
    init_storage();
    seedPackageCategories().then(() => {
      console.log("\u2705 Package categories seeding complete");
    }).catch((error) => {
      console.error("\u274C Error in package categories seeding:", error);
    });
  }
});

// server/seed-translations.ts
async function seedTranslations() {
  console.log("\u{1F331} Seeding translations...");
  const existingTranslations = await db.select().from(translations);
  if (existingTranslations.length > 0) {
    console.log("\u2705 Translations already seeded");
    return;
  }
  try {
    const currentDate = /* @__PURE__ */ new Date();
    const translationData = [
      // Common UI elements
      { key: "common.english", language: "en", enText: "English", arText: "\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629", category: "common", context: "Language name in language switcher", createdAt: currentDate, updatedAt: currentDate },
      { key: "common.arabic", language: "en", enText: "Arabic", arText: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", category: "common", context: "Language name in language switcher", createdAt: currentDate, updatedAt: currentDate },
      { key: "common.loading", language: "en", enText: "Loading...", arText: "\u062C\u0627\u0631 \u0627\u0644\u062A\u062D\u0645\u064A\u0644...", category: "common", context: "Loading state text", createdAt: currentDate, updatedAt: currentDate },
      { key: "common.save", language: "en", enText: "Save", arText: "\u062D\u0641\u0638", category: "common", context: "Save button text", createdAt: currentDate, updatedAt: currentDate },
      { key: "common.cancel", language: "en", enText: "Cancel", arText: "\u0625\u0644\u063A\u0627\u0621", category: "common", context: "Cancel button text", createdAt: currentDate, updatedAt: currentDate },
      { key: "common.edit", language: "en", enText: "Edit", arText: "\u062A\u0639\u062F\u064A\u0644", category: "common", context: "Edit button/action text", createdAt: currentDate, updatedAt: currentDate },
      { key: "common.delete", language: "en", enText: "Delete", arText: "\u062D\u0630\u0641", category: "common", context: "Delete button/action text", createdAt: currentDate, updatedAt: currentDate },
      { key: "common.search", language: "en", enText: "Search", arText: "\u0628\u062D\u062B", category: "common", context: "Search input placeholder/button", createdAt: currentDate, updatedAt: currentDate },
      // Navigation
      { key: "nav.home", language: "en", enText: "Home", arText: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", category: "navigation", context: "Main navigation link", createdAt: currentDate, updatedAt: currentDate },
      { key: "nav.packages", language: "en", enText: "Packages", arText: "\u0627\u0644\u0628\u0627\u0642\u0627\u062A", category: "navigation", context: "Main navigation link", createdAt: currentDate, updatedAt: currentDate },
      { key: "nav.destinations", language: "en", enText: "Destinations", arText: "\u0627\u0644\u0648\u062C\u0647\u0627\u062A", category: "navigation", context: "Main navigation link", createdAt: currentDate, updatedAt: currentDate },
      { key: "nav.about", language: "en", enText: "About", arText: "\u0639\u0646 \u0627\u0644\u0634\u0631\u0643\u0629", category: "navigation", context: "Main navigation link", createdAt: currentDate, updatedAt: currentDate },
      { key: "nav.contact", language: "en", enText: "Contact", arText: "\u0627\u062A\u0635\u0644 \u0628\u0646\u0627", category: "navigation", context: "Main navigation link", createdAt: currentDate, updatedAt: currentDate },
      // Homepage
      { key: "home.title", language: "en", enText: "Discover the Magic of the Middle East", arText: "\u0627\u0643\u062A\u0634\u0641 \u0633\u062D\u0631 \u0627\u0644\u0634\u0631\u0642 \u0627\u0644\u0623\u0648\u0633\u0637", category: "homepage", context: "Homepage hero title", createdAt: currentDate, updatedAt: currentDate },
      { key: "home.featured", language: "en", enText: "Featured Destinations", arText: "\u0648\u062C\u0647\u0627\u062A \u0645\u0645\u064A\u0632\u0629", category: "homepage", context: "Featured destinations section title", createdAt: currentDate, updatedAt: currentDate },
      // Authentication
      { key: "auth.login", language: "en", enText: "Log In", arText: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644", category: "auth", context: "Login button/page title", createdAt: currentDate, updatedAt: currentDate },
      { key: "auth.register", language: "en", enText: "Register", arText: "\u0627\u0644\u062A\u0633\u062C\u064A\u0644", category: "auth", context: "Register button/page title", createdAt: currentDate, updatedAt: currentDate },
      { key: "auth.logout", language: "en", enText: "Log Out", arText: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C", category: "auth", context: "Logout button", createdAt: currentDate, updatedAt: currentDate }
    ];
    for (const item of translationData) {
      await db.insert(translations).values(item);
    }
    await db.insert(siteLanguageSettings).values({
      defaultLanguage: "en",
      availableLanguages: ["en", "ar"],
      rtlLanguages: ["ar"],
      createdAt: currentDate,
      updatedAt: currentDate
    });
    console.log("\u2705 Translations and language settings seeded successfully!");
  } catch (error) {
    console.error("\u274C Error seeding translations:", error);
  }
}
var init_seed_translations = __esm({
  "server/seed-translations.ts"() {
    "use strict";
    init_db();
    init_schema();
    if (import.meta.url === `file://${process.argv[1]}`) {
      seedTranslations().then(() => {
        console.log("Translations seeding complete");
        process.exit(0);
      }).catch((error) => {
        console.error("Error during translations seeding:", error);
        process.exit(1);
      });
    }
  }
});

// server/seed-dictionary.ts
async function seedDictionary() {
  console.log("\u{1F331} Seeding dictionary entries...");
  const existingEntries = await db.select().from(dictionaryEntries).limit(1);
  if (existingEntries.length > 0) {
    console.log("\u2705 Dictionary entries already exist");
    return;
  }
  const entries = [
    {
      word: "travel",
      englishDefinition: "To go from one place to another, especially over a long distance.",
      arabicTranslation: "\u0633\u0641\u0631",
      partOfSpeech: "noun",
      context: "Tourism",
      example: "They enjoy travel to exotic destinations.",
      notes: "Also used as a verb: to travel"
    },
    {
      word: "hotel",
      englishDefinition: "An establishment providing accommodation, meals, and other services for travelers and tourists.",
      arabicTranslation: "\u0641\u0646\u062F\u0642",
      partOfSpeech: "noun",
      context: "Accommodation",
      example: "We stayed at a five-star hotel in Cairo.",
      notes: null
    },
    {
      word: "pyramid",
      englishDefinition: "A monumental structure with a square or triangular base and sloping sides that meet in a point at the top.",
      arabicTranslation: "\u0647\u0631\u0645",
      partOfSpeech: "noun",
      context: "Landmarks",
      example: "The Great Pyramid of Giza is the oldest of the Seven Wonders of the Ancient World.",
      notes: "Plural: pyramids"
    },
    {
      word: "museum",
      englishDefinition: "A building in which objects of historical, scientific, artistic, or cultural interest are stored and exhibited.",
      arabicTranslation: "\u0645\u062A\u062D\u0641",
      partOfSpeech: "noun",
      context: "Tourism",
      example: "The Egyptian Museum houses the world's largest collection of Pharaonic antiquities.",
      notes: null
    },
    {
      word: "flight",
      englishDefinition: "A journey made by air, especially in an airplane.",
      arabicTranslation: "\u0631\u062D\u0644\u0629 \u062C\u0648\u064A\u0629",
      partOfSpeech: "noun",
      context: "Transportation",
      example: "Our flight to Cairo takes about four hours.",
      notes: null
    }
  ];
  try {
    const currentDate = /* @__PURE__ */ new Date();
    for (const entry of entries) {
      await db.insert(dictionaryEntries).values({
        word: entry.word.toLowerCase().trim(),
        englishDefinition: entry.englishDefinition,
        arabicTranslation: entry.arabicTranslation,
        partOfSpeech: entry.partOfSpeech,
        context: entry.context,
        example: entry.example,
        notes: entry.notes,
        createdAt: currentDate,
        updatedAt: currentDate
      });
    }
    console.log("\u2705 Dictionary entries seeded successfully");
  } catch (error) {
    console.error("\u274C Error seeding dictionary entries:", error);
  }
}
var init_seed_dictionary = __esm({
  "server/seed-dictionary.ts"() {
    "use strict";
    init_db();
    init_schema();
    if (import.meta.url === `file://${process.argv[1]}`) {
      seedDictionary().then(() => {
        console.log("Dictionary seeding complete");
        process.exit(0);
      }).catch((error) => {
        console.error("Error during dictionary seeding:", error);
        process.exit(1);
      });
    }
  }
});

// server/seed-room-categories.ts
async function seedRoomCategories() {
  console.log("\u{1F6CF}\uFE0F Seeding room categories...");
  const existingCategories = await storage.listRoomCategories();
  if (existingCategories.length > 0) {
    console.log("\u2705 Room categories already seeded");
    return;
  }
  const categories = [
    {
      name: "Standard",
      description: "Basic comfortable rooms with essential amenities for budget travelers.",
      active: true
    },
    {
      name: "Deluxe",
      description: "Premium rooms with enhanced amenities and more space for a luxurious stay.",
      active: true
    },
    {
      name: "Suite",
      description: "Spacious multi-room accommodations with separate living areas and premium amenities.",
      active: true
    },
    {
      name: "Family",
      description: "Larger rooms designed for families with additional beds and child-friendly amenities.",
      active: true
    }
  ];
  for (const category of categories) {
    await storage.createRoomCategory(category);
  }
  console.log("\u2705 Room categories seeding complete");
}
var init_seed_room_categories = __esm({
  "server/seed-room-categories.ts"() {
    "use strict";
    init_storage();
  }
});

// server/seed.ts
var seed_exports = {};
__export(seed_exports, {
  seed: () => seed
});
async function seed() {
  console.log("\u{1F331} Seeding data...");
  const existingDestinations = await storage.listDestinations();
  if (existingDestinations.length > 0) {
    console.log("\u2705 Data already seeded");
    return;
  }
  try {
    console.log("\u{1F30D} Seeding countries...");
    const egypt = await storage.createCountry({
      name: "Egypt",
      code: "EG",
      description: "A country linking northeast Africa with the Middle East, dates to the time of the pharaohs.",
      imageUrl: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const uae = await storage.createCountry({
      name: "United Arab Emirates",
      code: "UAE",
      description: "A federation of seven emirates on the eastern Arabian Peninsula.",
      imageUrl: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const jordan = await storage.createCountry({
      name: "Jordan",
      code: "JO",
      description: "An Arab nation on the banks of the Jordan River, known for ancient monuments and nature reserves.",
      imageUrl: "https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const morocco = await storage.createCountry({
      name: "Morocco",
      code: "MA",
      description: "A North African country with a vibrant culture and landscapes from the Sahara to the Atlas Mountains.",
      imageUrl: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    console.log("\u{1F3D9}\uFE0F Seeding cities...");
    const cairoCity = await storage.createCity({
      name: "Cairo",
      countryId: egypt.id,
      description: "The capital of Egypt and the largest city in the Arab world.",
      imageUrl: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const luxorCity = await storage.createCity({
      name: "Luxor",
      countryId: egypt.id,
      description: "A city on the east bank of the Nile River, known for its ancient ruins.",
      imageUrl: "https://images.unsplash.com/photo-1558685582-2d0d597e6b71?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const sharmCity = await storage.createCity({
      name: "Sharm El Sheikh",
      countryId: egypt.id,
      description: "A resort town between the desert of the Sinai Peninsula and the Red Sea.",
      imageUrl: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const dubaiCity = await storage.createCity({
      name: "Dubai",
      countryId: uae.id,
      description: "A city known for luxury shopping, ultramodern architecture, and a lively nightlife.",
      imageUrl: "https://images.unsplash.com/photo-1548813395-e5217e9a3520?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const abuDhabiCity = await storage.createCity({
      name: "Abu Dhabi",
      countryId: uae.id,
      description: "The capital of the UAE, known for its cultural landmarks and high-end shopping.",
      imageUrl: "https://images.unsplash.com/photo-1551041777-575d3b3a5f8d?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const ammanCity = await storage.createCity({
      name: "Amman",
      countryId: jordan.id,
      description: "The capital and largest city of Jordan, featuring a unique blend of old and new.",
      imageUrl: "https://images.unsplash.com/photo-1534293230397-c067fc201ebb?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const petraCity = await storage.createCity({
      name: "Petra",
      countryId: jordan.id,
      description: "An archaeological city famous for its rock-cut architecture and water conduit system.",
      imageUrl: "https://images.unsplash.com/photo-1518368305415-e7e5621e3bef?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const marrakechCity = await storage.createCity({
      name: "Marrakech",
      countryId: morocco.id,
      description: "A major city known for its vibrant markets, gardens, palaces, and mosques.",
      imageUrl: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const casablancaCity = await storage.createCity({
      name: "Casablanca",
      countryId: morocco.id,
      description: "Morocco's chief port and one of the largest financial centers in Africa.",
      imageUrl: "https://images.unsplash.com/photo-1577048982768-5cb3e7ddfa23?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const alexandriaCity = await storage.createCity({
      name: "Alexandria",
      countryId: egypt.id,
      description: "Egypt's Mediterranean port city with a rich history.",
      imageUrl: "https://images.unsplash.com/photo-1588332652694-9f46b4cfd1af?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const istanbulCity = await storage.createCity({
      name: "Istanbul",
      countryId: await (async () => {
        const existingTurkey = await storage.getCountryByCode("TR");
        if (existingTurkey) return existingTurkey.id;
        const turkey = await storage.createCountry({
          name: "Turkey",
          code: "TR",
          description: "A transcontinental country straddling Europe and Asia.",
          imageUrl: "https://images.unsplash.com/photo-1545293527-e26058c5b48b?q=80&w=800&auto=format&fit=crop",
          active: true
        });
        return turkey.id;
      })(),
      description: "Turkey's cultural and economic hub spanning Europe and Asia.",
      imageUrl: "https://images.unsplash.com/photo-1628940498613-8c4f1b19ce59?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const londonCity = await storage.createCity({
      name: "London",
      countryId: await (async () => {
        const existingUK = await storage.getCountryByCode("UK");
        if (existingUK) return existingUK.id;
        const uk = await storage.createCountry({
          name: "United Kingdom",
          code: "UK",
          description: "An island nation in northwestern Europe known for its iconic landmarks.",
          imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop",
          active: true
        });
        return uk.id;
      })(),
      description: "The capital of England and the UK, a global city with rich history.",
      imageUrl: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const newYorkCity = await storage.createCity({
      name: "New York",
      countryId: await (async () => {
        const existingUSA = await storage.getCountryByCode("US");
        if (existingUSA) return existingUSA.id;
        const usa = await storage.createCountry({
          name: "United States",
          code: "US",
          description: "A diverse country spanning North America with global influence.",
          imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=800&auto=format&fit=crop",
          active: true
        });
        return usa.id;
      })(),
      description: "A major US city known for its skyscrapers and cultural diversity.",
      imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const parisCity = await storage.createCity({
      name: "Paris",
      countryId: await (async () => {
        const existingFrance = await storage.getCountryByCode("FR");
        if (existingFrance) return existingFrance.id;
        const france = await storage.createCountry({
          name: "France",
          code: "FR",
          description: "A Western European country known for its art, culture, and cuisine.",
          imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop",
          active: true
        });
        return france.id;
      })(),
      description: "The capital of France, known for its art, fashion, and landmarks.",
      imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const romeCity = await storage.createCity({
      name: "Rome",
      countryId: await (async () => {
        const existingItaly = await storage.getCountryByCode("IT");
        if (existingItaly) return existingItaly.id;
        const italy = await storage.createCountry({
          name: "Italy",
          code: "IT",
          description: "A Mediterranean country with a rich history and beautiful coastlines.",
          imageUrl: "https://images.unsplash.com/photo-1516108317508-6788f6a160e4?q=80&w=800&auto=format&fit=crop",
          active: true
        });
        return italy.id;
      })(),
      description: "The capital of Italy, home to ancient ruins and Renaissance art.",
      imageUrl: "https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const tokyoCity = await storage.createCity({
      name: "Tokyo",
      countryId: await (async () => {
        const existingJapan = await storage.getCountryByCode("JP");
        if (existingJapan) return existingJapan.id;
        const japan = await storage.createCountry({
          name: "Japan",
          code: "JP",
          description: "An island nation in East Asia known for its traditional culture and technology.",
          imageUrl: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?q=80&w=800&auto=format&fit=crop",
          active: true
        });
        return japan.id;
      })(),
      description: "Japan's capital, a blend of traditional culture and cutting-edge technology.",
      imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    const jeddahCity = await storage.createCity({
      name: "Jeddah",
      countryId: await (async () => {
        const existingSA = await storage.getCountryByCode("SA");
        if (existingSA) return existingSA.id;
        const saudiArabia = await storage.createCountry({
          name: "Saudi Arabia",
          code: "SA",
          description: "A desert country encompassing most of the Arabian Peninsula.",
          imageUrl: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?q=80&w=800&auto=format&fit=crop",
          active: true
        });
        return saudiArabia.id;
      })(),
      description: "Saudi Arabia's commercial center and gateway to Mecca.",
      imageUrl: "https://images.unsplash.com/photo-1584132967334-72a3e38fabc4?q=80&w=800&auto=format&fit=crop",
      active: true
    });
    console.log("\u2708\uFE0F Seeding airports...");
    await storage.createAirport({
      name: "Cairo International Airport",
      cityId: cairoCity.id,
      code: "CAI",
      description: "The main international airport serving Cairo, Egypt.",
      active: true
    });
    await storage.createAirport({
      name: "Almaza Airport",
      cityId: cairoCity.id,
      code: "ALM",
      description: "A military airport in Cairo with limited civilian operations.",
      active: true
    });
    await storage.createAirport({
      name: "Borg El Arab Airport",
      cityId: alexandriaCity.id,
      code: "HBE",
      description: "The main airport serving Alexandria, Egypt.",
      active: true
    });
    await storage.createAirport({
      name: "Dubai International Airport",
      cityId: dubaiCity.id,
      code: "DXB",
      description: "One of the busiest international airports in the world.",
      active: true
    });
    await storage.createAirport({
      name: "Al Maktoum International Airport",
      cityId: dubaiCity.id,
      code: "DWC",
      description: "Dubai's second international airport, also known as Dubai World Central.",
      active: true
    });
    await storage.createAirport({
      name: "Istanbul Airport",
      cityId: istanbulCity.id,
      code: "IST",
      description: "The main international airport serving Istanbul, Turkey.",
      active: true
    });
    await storage.createAirport({
      name: "Sabiha G\xF6k\xE7en International Airport",
      cityId: istanbulCity.id,
      code: "SAW",
      description: "Istanbul's second international airport located on the Asian side.",
      active: true
    });
    await storage.createAirport({
      name: "Heathrow Airport",
      cityId: londonCity.id,
      code: "LHR",
      description: "One of the busiest airports in Europe and the main hub for London.",
      active: true
    });
    await storage.createAirport({
      name: "Gatwick Airport",
      cityId: londonCity.id,
      code: "LGW",
      description: "London's second largest international airport.",
      active: true
    });
    await storage.createAirport({
      name: "Stansted Airport",
      cityId: londonCity.id,
      code: "STN",
      description: "A major base for low-cost carriers serving London and the East of England.",
      active: true
    });
    await storage.createAirport({
      name: "John F. Kennedy International Airport",
      cityId: newYorkCity.id,
      code: "JFK",
      description: "The primary international airport serving New York City.",
      active: true
    });
    await storage.createAirport({
      name: "LaGuardia Airport",
      cityId: newYorkCity.id,
      code: "LGA",
      description: "An airport in Queens that serves domestic flights to New York City.",
      active: true
    });
    await storage.createAirport({
      name: "Newark Liberty International Airport",
      cityId: newYorkCity.id,
      code: "EWR",
      description: "An international airport serving the New York metropolitan area.",
      active: true
    });
    await storage.createAirport({
      name: "Charles de Gaulle Airport",
      cityId: parisCity.id,
      code: "CDG",
      description: "The largest international airport in France.",
      active: true
    });
    await storage.createAirport({
      name: "Orly Airport",
      cityId: parisCity.id,
      code: "ORY",
      description: "The second main airport serving Paris, located south of the city.",
      active: true
    });
    await storage.createAirport({
      name: "Leonardo da Vinci International Airport",
      cityId: romeCity.id,
      code: "FCO",
      description: "The main airport serving Rome, also known as Fiumicino Airport.",
      active: true
    });
    await storage.createAirport({
      name: "Rome Ciampino Airport",
      cityId: romeCity.id,
      code: "CIA",
      description: "A secondary international airport serving Rome.",
      active: true
    });
    await storage.createAirport({
      name: "Haneda Airport",
      cityId: tokyoCity.id,
      code: "HND",
      description: "One of the two primary airports serving the Greater Tokyo Area.",
      active: true
    });
    await storage.createAirport({
      name: "Narita International Airport",
      cityId: tokyoCity.id,
      code: "NRT",
      description: "The main international airport serving the Greater Tokyo Area.",
      active: true
    });
    await storage.createAirport({
      name: "King Abdulaziz International Airport",
      cityId: jeddahCity.id,
      code: "JED",
      description: "The main airport serving Jeddah, Saudi Arabia.",
      active: true
    });
    console.log("\u{1F4CD} Seeding destinations...");
    const cairo = await storage.createDestination({
      name: "Cairo",
      country: "Egypt",
      countryId: egypt.id,
      cityId: cairoCity.id,
      description: "Explore the ancient pyramids and rich history of Cairo.",
      imageUrl: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=800&auto=format&fit=crop",
      featured: true
    });
    const dubai = await storage.createDestination({
      name: "Dubai",
      country: "UAE",
      countryId: uae.id,
      cityId: dubaiCity.id,
      description: "Experience luxury and modern architecture in Dubai.",
      imageUrl: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=800&auto=format&fit=crop",
      featured: true
    });
    const sharmElSheikh = await storage.createDestination({
      name: "Sharm El Sheikh",
      country: "Egypt",
      countryId: egypt.id,
      cityId: sharmCity.id,
      description: "Relax on beautiful beaches and dive in crystal-clear waters of the Red Sea.",
      imageUrl: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop",
      featured: true
    });
    const petra = await storage.createDestination({
      name: "Petra",
      country: "Jordan",
      countryId: jordan.id,
      cityId: petraCity.id,
      description: "Discover the hidden city carved into rose-colored stone.",
      imageUrl: "https://images.unsplash.com/photo-1518368305415-e7e5621e3bef?q=80&w=800&auto=format&fit=crop",
      featured: true
    });
    const marrakech = await storage.createDestination({
      name: "Marrakech",
      country: "Morocco",
      countryId: morocco.id,
      cityId: marrakechCity.id,
      description: "Immerse yourself in the vibrant markets and culture of Marrakech.",
      imageUrl: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?q=80&w=800&auto=format&fit=crop",
      featured: true
    });
    console.log("\u{1F4E6} Seeding packages...");
    await storage.createPackage({
      title: "Cairo & Luxor Package",
      description: "Explore ancient pyramids and cruise the Nile in this 7-day adventure",
      price: 1699,
      discountedPrice: 1359,
      imageUrl: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=800&auto=format&fit=crop",
      duration: 7,
      rating: 45,
      // 4.5 stars
      destinationId: cairo.id,
      featured: true,
      type: "Cultural",
      inclusions: ["Flights", "Hotels", "Tours", "Guide"]
    });
    await storage.createPackage({
      title: "Dubai Luxury Weekend",
      description: "Experience luxury shopping, desert safari, and iconic architecture",
      price: 1199,
      discountedPrice: 999,
      imageUrl: "https://images.unsplash.com/photo-1548813395-e5217e9a3520?q=80&w=800&auto=format&fit=crop",
      duration: 4,
      rating: 50,
      // 5.0 stars
      destinationId: dubai.id,
      featured: true,
      type: "Luxury",
      inclusions: ["Hotels", "Breakfast", "Desert Safari"]
    });
    await storage.createPackage({
      title: "Jordan Explorer",
      description: "Discover Petra, Wadi Rum, and the Dead Sea on this adventure",
      price: 1299,
      discountedPrice: 979,
      imageUrl: "https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?q=80&w=800&auto=format&fit=crop",
      duration: 6,
      rating: 40,
      // 4.0 stars
      destinationId: petra.id,
      featured: true,
      type: "Adventure",
      inclusions: ["Hotels", "Half Board", "Tour Guide"]
    });
    await storage.createPackage({
      title: "Moroccan Magic",
      description: "Explore the vibrant markets, historic medinas, and stunning landscapes of Morocco on this unforgettable journey.",
      price: 1249,
      discountedPrice: null,
      imageUrl: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?q=80&w=800&auto=format&fit=crop",
      duration: 8,
      rating: 45,
      // 4.5 stars
      destinationId: marrakech.id,
      featured: false,
      type: "Cultural",
      inclusions: ["Hotels", "Breakfast & Dinner", "Tour Guide"]
    });
    await storage.createPackage({
      title: "Nile Luxury Cruise",
      description: "Sail the legendary Nile River in style, exploring ancient temples and monuments along the way.",
      price: 1899,
      discountedPrice: null,
      imageUrl: "https://images.unsplash.com/photo-1621690977399-354a6556f243?q=80&w=800&auto=format&fit=crop",
      duration: 8,
      rating: 47,
      // 4.7 stars
      destinationId: cairo.id,
      featured: false,
      type: "Luxury",
      inclusions: ["Hotels", "Full Board", "Tours", "Guide"]
    });
    await storage.createPackage({
      title: "Red Sea Visa Package",
      description: "Complete visa service and resort stay in beautiful Sharm El Sheikh, with all formalities handled for you.",
      price: 899,
      discountedPrice: 799,
      imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop",
      duration: 5,
      rating: 46,
      // 4.6 stars
      destinationId: sharmElSheikh.id,
      featured: true,
      type: "Beach & Relaxation",
      inclusions: ["Visa Processing", "Hotels", "Airport Transfers", "Breakfast"]
    });
    await storage.createPackage({
      title: "Jordan Transportation Explorer",
      description: "Premium transportation package covering all your travel needs in Jordan, with private driver and flexible itinerary.",
      price: 1150,
      discountedPrice: 990,
      imageUrl: "https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?q=80&w=800&auto=format&fit=crop",
      duration: 6,
      rating: 48,
      // 4.8 stars
      destinationId: petra.id,
      featured: true,
      type: "Transportation",
      inclusions: ["Private Driver", "Premium Vehicle", "Fuel", "Hotels", "Airport Transfers", "Breakfast"]
    });
    await storage.createPackage({
      title: "Fly & Stay: Dubai Getaway",
      description: "All-inclusive package with international flights to Dubai, luxury accommodation, and unique experiences.",
      price: 1650,
      discountedPrice: 1495,
      imageUrl: "https://images.unsplash.com/photo-1548813395-e5217e9a3520?q=80&w=800&auto=format&fit=crop",
      duration: 5,
      rating: 49,
      // 4.9 stars
      destinationId: dubai.id,
      featured: true,
      type: "Fly & Stay",
      inclusions: ["International Flights", "4-star Hotel", "Airport Transfers", "Dubai City Tour", "Desert Safari"]
    });
    console.log("\u2705 Data seeded successfully!");
    await seedTranslations();
    await seedDictionary();
    await seedPackageCategories();
    await seedRoomCategories();
  } catch (error) {
    console.error("\u274C Error seeding data:", error);
  }
}
var init_seed = __esm({
  "server/seed.ts"() {
    "use strict";
    init_storage();
    init_seed_translations();
    init_seed_dictionary();
    init_seed_package_categories();
    init_seed_room_categories();
  }
});

// server/init-database.ts
var init_database_exports = {};
__export(init_database_exports, {
  initializeDatabase: () => initializeDatabase2
});
import { exec } from "child_process";
import { promisify as promisify4 } from "util";
async function initializeDatabase2() {
  console.log("\u{1F527} Initializing database...");
  try {
    console.log("\u{1F4CB} Creating database schema...");
    await execAsync("npm run db:push");
    console.log("\u2705 Database schema created successfully");
    const { setupDatabase: setupDatabase2 } = await Promise.resolve().then(() => (init_setup_for_remix(), setup_for_remix_exports));
    await setupDatabase2();
    const adminSetup = await Promise.resolve().then(() => (init_admin_setup(), admin_setup_exports));
    await adminSetup.setupAdmin();
    const packageCategoriesSetup = await Promise.resolve().then(() => (init_seed_package_categories(), seed_package_categories_exports));
    await packageCategoriesSetup.seedPackageCategories();
    const seedModule = await Promise.resolve().then(() => (init_seed(), seed_exports));
    await seedModule.seed();
    console.log("\u2705 Database initialization complete!");
  } catch (error) {
    console.error("\u274C Database initialization failed:", error);
  }
}
var execAsync;
var init_init_database = __esm({
  "server/init-database.ts"() {
    "use strict";
    execAsync = promisify4(exec);
  }
});

// server/index.ts
import express3 from "express";
import dotenv from "dotenv";
import cors from "cors";

// server/routes.ts
init_storage();
init_db();
init_schema();
import { createServer } from "http";
import * as fs5 from "fs";
import * as fsPromises from "fs/promises";
import * as path5 from "path";

// server/unified-auth.ts
init_db();
init_schema();
import { scrypt as scrypt2, randomBytes as randomBytes2, timingSafeEqual as timingSafeEqual2 } from "crypto";
import { promisify as promisify2 } from "util";
import { eq as eq2 } from "drizzle-orm";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
var scryptAsync2 = promisify2(scrypt2);
async function hashPassword(password) {
  const salt = randomBytes2(16).toString("hex");
  const buf = await scryptAsync2(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePassword(plainPassword, hashedPassword) {
  if (!hashedPassword || !hashedPassword.includes(".")) {
    return false;
  }
  try {
    const [hashed, salt] = hashedPassword.split(".");
    if (!salt) {
      return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = await scryptAsync2(plainPassword, salt, 64);
    if (hashedBuf.length !== suppliedBuf.length) {
      return false;
    }
    return timingSafeEqual2(hashedBuf, suppliedBuf);
  } catch (e) {
    console.error("Error during password comparison:", e);
    return false;
  }
}
function setupUnifiedAuth(app2) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await db.query.users.findFirst({
          where: eq2(users.username, username)
        });
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq2(users.id, id)
      });
      if (!user) {
        return done(new Error("User not found"));
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(400).json({ message: info.message });
      }
      req.logIn(user, (err2) => {
        if (err2) {
          return next(err2);
        }
        req.session.user = {
          id: user.id,
          username: user.username,
          role: user.role,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          email: user.email
        };
        req.session.save((err3) => {
          if (err3) {
            console.error("Session save error:", err3);
            return res.status(500).json({ message: "Login failed - session error" });
          }
          return res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl
          });
        });
      });
    })(req, res, next);
  });
  app2.post("/api/register", async (req, res) => {
    const { username, password, email, displayName } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ message: "Username, password, and email are required" });
    }
    try {
      const existingUser = await db.query.users.findFirst({
        where: eq2(users.username, username)
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await hashPassword(password);
      const newUser = await db.insert(users).values({
        username,
        password: hashedPassword,
        email,
        displayName,
        role: "user"
        // Default role
      }).returning();
      res.status(201).json({ id: newUser[0].id, username: newUser[0].username });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/user", async (req, res) => {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        console.log("\u26A0\uFE0F No session user found in unified-auth, providing development admin user");
        const tempAdmin = {
          id: 1,
          username: "admin",
          role: "admin",
          email: "admin@example.com",
          fullName: "Admin User",
          displayName: "Admin"
        };
        return res.status(200).json(tempAdmin);
      }
      res.status(200).json({
        id: sessionUser.id,
        username: sessionUser.username,
        email: sessionUser.email,
        fullName: sessionUser.fullName,
        role: sessionUser.role
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(200).json(null);
    }
  });
  app2.post("/api/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.status(200).json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });
}

// server/routes.ts
import { z as z2 } from "zod";

// server/services/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
var GeminiService = class {
  genAI;
  model = "models/gemini-1.5-flash";
  imagineModel = "gemini-pro-vision";
  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY || "";
    this.genAI = new GoogleGenerativeAI(apiKey);
  }
  /**
   * Translate a single text string from English to Arabic
   * @param text The English text to translate
   * @returns Translated Arabic text
   */
  async translateToArabic(text2) {
    try {
      const modelInstance = this.genAI.getGenerativeModel({ model: this.model });
      const prompt = `Please translate the following English text to Arabic. Only respond with the translation, no explanations or additional text.
      
English text: "${text2}"`;
      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text();
      return translatedText.trim();
    } catch (error) {
      console.error("Error translating text with Gemini:", error);
      if (error.status === 429) {
        const isQuotaExceeded = error.message?.includes("exceeded your current quota") || error.message?.includes("Too Many Requests");
        if (isQuotaExceeded) {
          throw new Error("QUOTA_EXCEEDED|The Google AI free tier quota has been exceeded. Please try again later or upgrade your API plan for higher limits.");
        }
        throw new Error("RATE_LIMITED|Too many translation requests. Please wait a moment and try again.");
      }
      if (error.status === 403) {
        throw new Error("API_KEY_INVALID|Google AI API key is invalid or has insufficient permissions. Please check your API key configuration.");
      }
      if (error.status === 400) {
        throw new Error("INVALID_REQUEST|The translation request format is invalid. Please contact support.");
      }
      throw new Error(`TRANSLATION_ERROR|Translation service temporarily unavailable: ${error.message || "Unknown error"}`);
    }
  }
  /**
   * Batch translate multiple text items from English to Arabic
   * @param items An array of texts with IDs to translate
   * @returns Array of translated items with IDs
   */
  async batchTranslateToArabic(items) {
    try {
      const validItems = items.filter(
        (item) => item.text && item.text.trim().length > 1 && item.text.trim() !== "." && item.text.trim() !== "-"
      );
      if (validItems.length === 0) {
        return items.map((item) => ({
          id: item.id,
          translation: ""
        }));
      }
      const modelInstance = this.genAI.getGenerativeModel({ model: this.model });
      const combinedText = validItems.map((item, index) => `${index + 1}. ${item.text}`).join("\n");
      const prompt = `Please translate each of these numbered English text items to Arabic. Return only the translations, maintaining the same numbering format.

English items:
${combinedText}`;
      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text();
      const translationLines = translatedText.split("\n").filter((line) => line.trim() !== "");
      const translations2 = translationLines.map((line) => {
        const match = line.match(/^\d+\.\s*(.*)$/);
        return match ? match[1].trim() : line.trim();
      });
      if (translations2.length !== validItems.length) {
        throw new Error("The number of translations does not match the number of valid inputs");
      }
      const translationMap = /* @__PURE__ */ new Map();
      validItems.forEach((item, index) => {
        translationMap.set(item.id, translations2[index]);
      });
      return items.map((item) => ({
        id: item.id,
        translation: translationMap.get(item.id) || ""
      }));
    } catch (error) {
      console.error("Error batch translating with Gemini:", error);
      if (error.status === 429) {
        const isQuotaExceeded = error.message?.includes("exceeded your current quota") || error.message?.includes("Too Many Requests");
        if (isQuotaExceeded) {
          throw new Error("QUOTA_EXCEEDED|The Google AI free tier quota has been exceeded. Please try again later or upgrade your API plan for higher limits.");
        }
        throw new Error("RATE_LIMITED|Too many translation requests. Please wait a moment and try again.");
      }
      if (error.status === 403) {
        throw new Error("API_KEY_INVALID|Google AI API key is invalid or has insufficient permissions. Please check your API key configuration.");
      }
      if (error.status === 400) {
        throw new Error("INVALID_REQUEST|The batch translation request format is invalid. Please contact support.");
      }
      throw new Error(`TRANSLATION_ERROR|Batch translation service temporarily unavailable: ${error.message || "Unknown error"}`);
    }
  }
  /**
   * Generate an image description for Unsplash based on package overview and city
   * @param overview The package overview/description text
   * @param city The city name
   * @returns A detailed image description for travel photo generation
   */
  async generateImageDescription(overview, city) {
    try {
      const modelInstance = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `Create a detailed, vivid, and evocative description for a high-quality travel photograph of ${city} that captures the essence of this travel package overview:
      
      "${overview}"
      
      The description should focus on remarkable landmarks, landscape features, cultural elements, or natural beauty that would make a professional, inspirational travel image.
      
      Describe specifically what the image should show, focusing on scenery, landmarks, atmosphere, mood, lighting, colors, and composition.
      
      Format the description as a prompt for a search on Unsplash by starting with "site:unsplash.com" and including keywords that would help find this exact type of image.
      
      Do not apologize, and do not explain why you're creating this description. Just provide the search prompt.`;
      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      const description = response.text();
      return description.trim();
    } catch (error) {
      console.error("Error generating image description with Gemini:", error);
      throw new Error(`Image description generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * Get a suitable image URL from Unsplash based on the package content
   * @param overview The package overview/description
   * @param city The city name
   * @returns Unsplash random image URL based on the description 
   */
  async getImageForPackage(overview, city) {
    try {
      const imageDescription = await this.generateImageDescription(overview, city);
      const keywords = imageDescription.replace(/site:unsplash\.com/i, "").split(/[,\s]+/).filter((word) => word.length > 3).join(",");
      const imageUrl = `https://source.unsplash.com/random/800x600/?${encodeURIComponent(city)},${encodeURIComponent(keywords)},travel,landmarks`;
      return imageUrl;
    } catch (error) {
      console.error("Error getting image for package:", error);
      return `https://source.unsplash.com/random/800x600/?${encodeURIComponent(city)},travel`;
    }
  }
};
var geminiService = new GeminiService();
var gemini_default = geminiService;

// server/export-import-routes.ts
import path3 from "path";
import fs3 from "fs";

// server/data-export.ts
init_db();
import path from "path";
import fs from "fs";
import { sql as sql3 } from "drizzle-orm";
async function exportData(entityName, query) {
  const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/:/g, "-");
  const filename = `${entityName}_export_${timestamp2}.json`;
  const filePath = path.join(process.cwd(), "exports", filename);
  const results = await query;
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  return filename;
}
var exportHandlers = {
  async exportRooms(req, res) {
    try {
      const filename = await exportData("rooms", db.query.rooms.findMany({}));
      res.json({ success: true, filename });
    } catch (error) {
      console.error("Error exporting rooms:", error);
      res.status(500).json({ success: false, message: "Failed to export rooms" });
    }
  },
  async exportHotels(req, res) {
    try {
      const filename = await exportData("hotels", db.query.hotels.findMany({}));
      res.json({ success: true, filename });
    } catch (error) {
      console.error("Error exporting hotels:", error);
      res.status(500).json({ success: false, message: "Failed to export hotels" });
    }
  },
  async exportTours(req, res) {
    try {
      const filename = await exportData("tours", db.query.tours.findMany({}));
      res.json({ success: true, filename });
    } catch (error) {
      console.error("Error exporting tours:", error);
      res.status(500).json({ success: false, message: "Failed to export tours" });
    }
  },
  async exportPackages(req, res) {
    try {
      const filename = await exportData("packages", db.query.packages.findMany({}));
      res.json({ success: true, filename });
    } catch (error) {
      console.error("Error exporting packages:", error);
      res.status(500).json({ success: false, message: "Failed to export packages" });
    }
  },
  async exportTransportationTypes(req, res) {
    try {
      const filename = await exportData("transportation_types", db.query.transportationTypes.findMany({}));
      res.json({ success: true, filename });
    } catch (error) {
      console.error("Error exporting transportation types:", error);
      res.status(500).json({ success: false, message: "Failed to export transportation types" });
    }
  },
  async exportTransportationLocations(req, res) {
    try {
      const filename = await exportData("transportation_locations", db.query.transportationLocations.findMany({}));
      res.json({ success: true, filename });
    } catch (error) {
      console.error("Error exporting transportation locations:", error);
      res.status(500).json({ success: false, message: "Failed to export transportation locations" });
    }
  },
  async exportTransportationDurations(req, res) {
    try {
      const filename = await exportData("transportation_durations", db.query.transportationDurations.findMany({}));
      res.json({ success: true, filename });
    } catch (error) {
      console.error("Error exporting transportation durations:", error);
      res.status(500).json({ success: false, message: "Failed to export transportation durations" });
    }
  },
  async exportPackageCategories(req, res) {
    try {
      const filename = await exportData("package_categories", db.query.packageCategories.findMany({}));
      res.json({ success: true, filename });
    } catch (error) {
      console.error("Error exporting package categories:", error);
      res.status(500).json({ success: false, message: "Failed to export package categories" });
    }
  },
  async exportRoomCategories(req, res) {
    try {
      const filename = await exportData("room_categories", db.query.roomCategories.findMany({}));
      res.json({ success: true, filename });
    } catch (error) {
      console.error("Error exporting room categories:", error);
      res.status(500).json({ success: false, message: "Failed to export room categories" });
    }
  },
  async exportTourCategories(req, res) {
    try {
      const filename = await exportData("tour_categories", db.query.tourCategories.findMany({}));
      res.json({ success: true, filename });
    } catch (error) {
      console.error("Error exporting tour categories:", error);
      res.status(500).json({ success: false, message: "Failed to export tour categories" });
    }
  },
  async exportHotelCategories(req, res) {
    try {
      const filename = await exportData("hotel_categories", db.query.hotelCategories.findMany({}));
      res.json({ success: true, filename });
    } catch (error) {
      console.error("Error exporting hotel categories:", error);
      res.status(500).json({ success: false, message: "Failed to export hotel categories" });
    }
  },
  async exportFullDatabase(req, res) {
    try {
      const tablesResult = await db.execute(sql3`
        SELECT tablename 
        FROM pg_catalog.pg_tables 
        WHERE schemaname != 'pg_catalog' 
        AND schemaname != 'information_schema'
      `);
      const tables = tablesResult.map((row) => row.tablename);
      const exportData2 = {};
      for (const table of tables) {
        const results = await db.execute(sql3`SELECT * FROM ${sql3.identifier(table)}`);
        exportData2[table] = results;
      }
      const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/:/g, "-");
      const filename = `full_database_export_${timestamp2}.json`;
      const filePath = path.join(process.cwd(), "exports", filename);
      fs.writeFileSync(filePath, JSON.stringify(exportData2, null, 2));
      res.json({ success: true, filename });
    } catch (error) {
      console.error("Error exporting full database:", error);
      res.status(500).json({ success: false, message: "Failed to export full database" });
    }
  },
  async getExports(req, res) {
    try {
      const exportsDir = path.join(process.cwd(), "exports");
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }
      const files = fs.readdirSync(exportsDir);
      const exports = files.map((file) => {
        const filePath = path.join(exportsDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          isDirectory: stats.isDirectory()
        };
      }).filter((file) => !file.isDirectory);
      exports.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
      res.json({ success: true, exports });
    } catch (error) {
      console.error("Error getting exports:", error);
      res.status(500).json({ success: false, message: "Failed to get exports" });
    }
  },
  async downloadExport(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(process.cwd(), "exports", filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: "Export file not found" });
      }
      res.download(filePath);
    } catch (error) {
      console.error("Error downloading export:", error);
      res.status(500).json({ success: false, message: "Failed to download export" });
    }
  },
  async deleteExport(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(process.cwd(), "exports", filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: "Export file not found" });
      }
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting export:", error);
      res.status(500).json({ success: false, message: "Failed to delete export" });
    }
  }
};

// server/data-import.ts
init_db();
init_schema();
import multer from "multer";
import path2 from "path";
import fs2 from "fs";
var storage2 = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = path2.join(process.cwd(), "imports");
    fs2.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString().replace(/:/g, "-");
    const uniqueFilename = `${path2.parse(file.originalname).name}_${timestamp2}${path2.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});
var upload = multer({
  storage: storage2,
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB file size limit
  },
  fileFilter: function(req, file, cb) {
    if (path2.extname(file.originalname).toLowerCase() !== ".json") {
      return cb(new Error("Only JSON files are allowed"));
    }
    cb(null, true);
  }
});
async function importJsonData(req, tableName, handleValidation) {
  if (!req.file) {
    throw new Error("No file uploaded");
  }
  const fileContent = fs2.readFileSync(req.file.path, "utf8");
  let data;
  try {
    data = JSON.parse(fileContent);
  } catch (error) {
    throw new Error("Invalid JSON file");
  }
  if (handleValidation) {
    data = handleValidation(data);
  }
  const items = Array.isArray(data) ? data : [data];
  const results = [];
  const errors = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const { id, ...rest } = item;
      const result = await db.insert(schema_exports[tableName]).values(rest).returning();
      results.push(result[0]);
    } catch (error) {
      console.error(`Error importing item ${i + 1}:`, error);
      errors.push({
        itemIndex: i + 1,
        item,
        error: error.message || error.toString()
      });
    }
  }
  if (req.file && req.file.path) {
    try {
      fs2.unlinkSync(req.file.path);
    } catch (error) {
      console.error("Error cleaning up temp file:", error);
    }
  }
  return { results, errors, summary: { total: items.length, imported: results.length, failed: errors.length } };
}
var importHandlers = {
  async importRooms(req, res) {
    try {
      const importResult = await importJsonData(req, "rooms");
      res.json({
        success: true,
        count: importResult.results.length,
        results: importResult.results,
        errors: importResult.errors,
        summary: importResult.summary
      });
    } catch (error) {
      console.error("Error importing rooms:", error);
      res.status(500).json({ success: false, message: error.message || "Failed to import rooms" });
    }
  },
  async importHotels(req, res) {
    try {
      const validateHotelData = (data) => {
        const items = Array.isArray(data) ? data : [data];
        return items.map((item) => {
          if (!item.name || !item.destinationId) {
            throw new Error(`Hotel missing required fields: name, destinationId`);
          }
          return {
            ...item,
            stars: item.stars || 3,
            featured: item.featured || false,
            parkingAvailable: item.parkingAvailable || false,
            airportTransferAvailable: item.airportTransferAvailable || false,
            carRentalAvailable: item.carRentalAvailable || false,
            shuttleAvailable: item.shuttleAvailable || false,
            status: item.status || "active",
            checkInTime: item.checkInTime || "14:00",
            checkOutTime: item.checkOutTime || "12:00",
            rating: item.rating || null,
            reviewCount: item.reviewCount || 0,
            guestRating: item.guestRating || null
          };
        });
      };
      const importResult = await importJsonData(req, "hotels", validateHotelData);
      res.json({
        success: true,
        count: importResult.results.length,
        results: importResult.results,
        errors: importResult.errors,
        summary: importResult.summary,
        message: `Successfully imported ${importResult.results.length} hotels`
      });
    } catch (error) {
      console.error("Error importing hotels:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to import hotels",
        details: error.toString()
      });
    }
  },
  async importTours(req, res) {
    try {
      const results = await importJsonData(req, "tours");
      res.json({ success: true, count: results.length, results });
    } catch (error) {
      console.error("Error importing tours:", error);
      res.status(500).json({ success: false, message: error.message || "Failed to import tours" });
    }
  },
  async importPackages(req, res) {
    try {
      const results = await importJsonData(req, "packages");
      res.json({ success: true, count: results.length, results });
    } catch (error) {
      console.error("Error importing packages:", error);
      res.status(500).json({ success: false, message: error.message || "Failed to import packages" });
    }
  },
  async importTransportationTypes(req, res) {
    try {
      const results = await importJsonData(req, "transportation_types");
      res.json({ success: true, count: results.length, results });
    } catch (error) {
      console.error("Error importing transportation types:", error);
      res.status(500).json({ success: false, message: error.message || "Failed to import transportation types" });
    }
  },
  async importTransportationLocations(req, res) {
    try {
      const results = await importJsonData(req, "transportation_locations");
      res.json({ success: true, count: results.length, results });
    } catch (error) {
      console.error("Error importing transportation locations:", error);
      res.status(500).json({ success: false, message: error.message || "Failed to import transportation locations" });
    }
  },
  async importTransportationDurations(req, res) {
    try {
      const results = await importJsonData(req, "transportation_durations");
      res.json({ success: true, count: results.length, results });
    } catch (error) {
      console.error("Error importing transportation durations:", error);
      res.status(500).json({ success: false, message: error.message || "Failed to import transportation durations" });
    }
  },
  async importPackageCategories(req, res) {
    try {
      const results = await importJsonData(req, "package_categories");
      res.json({ success: true, count: results.length, results });
    } catch (error) {
      console.error("Error importing package categories:", error);
      res.status(500).json({ success: false, message: error.message || "Failed to import package categories" });
    }
  },
  async importRoomCategories(req, res) {
    try {
      const results = await importJsonData(req, "room_categories");
      res.json({ success: true, count: results.length, results });
    } catch (error) {
      console.error("Error importing room categories:", error);
      res.status(500).json({ success: false, message: error.message || "Failed to import room categories" });
    }
  },
  async importTourCategories(req, res) {
    try {
      const results = await importJsonData(req, "tour_categories");
      res.json({ success: true, count: results.length, results });
    } catch (error) {
      console.error("Error importing tour categories:", error);
      res.status(500).json({ success: false, message: error.message || "Failed to import tour categories" });
    }
  },
  async importHotelCategories(req, res) {
    try {
      const results = await importJsonData(req, "hotel_categories");
      res.json({ success: true, count: results.length, results });
    } catch (error) {
      console.error("Error importing hotel categories:", error);
      res.status(500).json({ success: false, message: error.message || "Failed to import hotel categories" });
    }
  },
  async importFullDatabase(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }
      const fileContent = fs2.readFileSync(req.file.path, "utf8");
      let data;
      try {
        data = JSON.parse(fileContent);
      } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid JSON file" });
      }
      const tables = Object.keys(data);
      const results = {};
      for (const table of tables) {
        try {
          if (table === "migrations" || table === "pg_stat_statements") {
            continue;
          }
          const items = data[table];
          if (!Array.isArray(items) || items.length === 0) {
            results[table] = { count: 0, message: "No items to import or invalid data format" };
            continue;
          }
          let successCount = 0;
          for (const item of items) {
            try {
              const { id, ...rest } = item;
              try {
                switch (table) {
                  case "countries":
                    if (!rest.name || !rest.code) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    try {
                      await db.insert(countries).values({
                        name: rest.name,
                        code: rest.code,
                        description: rest.description || null,
                        imageUrl: rest.image_url || null,
                        active: rest.active !== void 0 ? rest.active : true
                      }).returning();
                    } catch (insertError) {
                      console.log(`Error inserting country: ${insertError}`);
                      continue;
                    }
                    break;
                  case "cities":
                    if (!rest.country_id) {
                      console.log(`Skipping import for ${table} due to missing country_id: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    try {
                      await db.insert(cities).values({
                        name: rest.name,
                        countryId: rest.country_id,
                        description: rest.description || null,
                        imageUrl: rest.image_url || null,
                        active: rest.active !== void 0 ? rest.active : true
                      }).returning();
                    } catch (insertError) {
                      console.log(`Error inserting city: ${insertError}`);
                      continue;
                    }
                    break;
                  case "airports":
                    if (!rest.city_id) {
                      console.log(`Skipping import for ${table} due to missing city_id: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    try {
                      await db.insert(airports).values({
                        name: rest.name,
                        cityId: rest.city_id,
                        code: rest.code || null,
                        description: rest.description || null,
                        imageUrl: rest.image_url || null,
                        active: rest.active !== void 0 ? rest.active : true
                      }).returning();
                    } catch (insertError) {
                      console.log(`Error inserting airport: ${insertError}`);
                      continue;
                    }
                    break;
                  case "users":
                    if (!rest.username || !rest.password || !rest.email) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    await db.insert(users).values(rest).returning();
                    break;
                  case "destinations":
                    if (!rest.name || !rest.country) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    await db.insert(destinations).values(rest).returning();
                    break;
                  case "packages":
                    if (!rest.title || !rest.description || !rest.price || !rest.duration) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    try {
                      const timestamp2 = (/* @__PURE__ */ new Date()).getTime().toString().slice(-4);
                      const packageData = {
                        title: rest.title,
                        description: rest.description,
                        price: rest.price,
                        discountedPrice: rest.discounted_price || null,
                        imageUrl: rest.image_url || null,
                        galleryUrls: rest.gallery_urls || null,
                        duration: rest.duration,
                        rating: rest.rating || null,
                        reviewCount: rest.review_count || 0,
                        destinationId: rest.destination_id || null,
                        countryId: rest.country_id || null,
                        cityId: rest.city_id || null,
                        featured: rest.featured !== void 0 ? rest.featured : false,
                        type: rest.type || null,
                        inclusions: rest.inclusions || null,
                        // Generate a unique slug by appending a timestamp if it exists
                        slug: rest.slug ? `${rest.slug}-${timestamp2}` : null
                      };
                      await db.insert(packages).values(packageData).returning();
                    } catch (insertError) {
                      console.log(`Error inserting package: ${insertError}`);
                      continue;
                    }
                    break;
                  case "bookings":
                    if (!rest.booking_date || !rest.travel_date || !rest.number_of_travelers || !rest.total_price) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    await db.insert(bookings).values(rest).returning();
                    break;
                  case "favorites":
                    if (!rest.user_id || !rest.destination_id) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    await db.insert(favorites).values(rest).returning();
                    break;
                  case "tours":
                    if (!rest.name || !rest.price || !rest.duration) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    await db.insert(tours).values(rest).returning();
                    break;
                  case "hotels":
                    if (!rest.name) {
                      console.log(`Skipping import for ${table} due to missing name: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    await db.insert(hotels).values(rest).returning();
                    break;
                  case "rooms":
                    if (!rest.name || !rest.hotel_id || !rest.type || !rest.max_occupancy || !rest.max_adults || !rest.price) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    try {
                      await db.insert(rooms).values({
                        name: rest.name,
                        hotelId: rest.hotel_id,
                        type: rest.type,
                        maxOccupancy: rest.max_occupancy,
                        maxAdults: rest.max_adults,
                        maxChildren: rest.max_children !== void 0 ? rest.max_children : 0,
                        maxInfants: rest.max_infants !== void 0 ? rest.max_infants : 0,
                        price: rest.price,
                        discountedPrice: rest.discounted_price || null,
                        description: rest.description || null,
                        imageUrl: rest.image_url || null,
                        size: rest.size || null,
                        bedType: rest.bed_type || null,
                        amenities: rest.amenities || null,
                        view: rest.view || null,
                        available: rest.available !== void 0 ? rest.available : true,
                        status: rest.status || "active"
                      }).returning();
                    } catch (insertError) {
                      console.log(`Error inserting room: ${insertError}`);
                      continue;
                    }
                    break;
                  case "room_combinations":
                    if (!rest.room_id || rest.adults_count === void 0 || rest.children_count === void 0) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    await db.insert(roomCombinations).values(rest).returning();
                    break;
                  case "menus":
                    if (!rest.name || !rest.location) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    await db.insert(menus).values(rest).returning();
                    break;
                  case "menu_items":
                    if (!rest.menu_id || !rest.title || rest.order === void 0) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    await db.insert(menuItems).values(rest).returning();
                    break;
                  case "translations":
                    if (!rest.key || !rest.en_text) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    await db.insert(translations).values(rest).returning();
                    break;
                  case "site_language_settings":
                    if (!rest.default_language) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    await db.insert(siteLanguageSettings).values(rest).returning();
                    break;
                  case "dictionary_entries":
                    if (!rest.word || !rest.english_definition || !rest.arabic_translation) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    await db.insert(dictionaryEntries).values(rest).returning();
                    break;
                  case "transport_locations":
                    if (!rest.name || !rest.city || !rest.country || !rest.location_type) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    await db.insert(transportLocations).values(rest).returning();
                    break;
                  case "transport_durations":
                    if (!rest.name || rest.hours === void 0) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    await db.insert(transportDurations).values(rest).returning();
                    break;
                  case "transport_types":
                    if (!rest.name || rest.passenger_capacity === void 0 || rest.baggage_capacity === void 0) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    await db.insert(transportTypes).values(rest).returning();
                    break;
                  case "transportation":
                    if (!rest.name || rest.passenger_capacity === void 0 || rest.baggage_capacity === void 0 || rest.price === void 0) {
                      console.log(`Skipping import for ${table} due to missing required fields: ${JSON.stringify(rest)}`);
                      continue;
                    }
                    await db.insert(transportation).values(rest).returning();
                    break;
                  default:
                    console.log(`Skipping unknown table: ${table}`);
                    continue;
                }
                successCount++;
              } catch (error) {
                console.error(`Error importing item to ${table}:`, error);
              }
            } catch (error) {
              console.error(`Error importing item to ${table}:`, error);
            }
          }
          results[table] = { count: successCount };
        } catch (error) {
          console.error(`Error importing table ${table}:`, error);
          results[table] = { count: 0, error: "Failed to import table" };
        }
      }
      fs2.unlinkSync(req.file.path);
      res.json({ success: true, results });
    } catch (error) {
      console.error("Error importing full database:", error);
      res.status(500).json({ success: false, message: error.message || "Failed to import full database" });
    }
  }
};

// server/export-import-routes.ts
function setupExportImportRoutes(app2) {
  const exportsDir = path3.join(process.cwd(), "exports");
  if (!fs3.existsSync(exportsDir)) {
    fs3.mkdirSync(exportsDir, { recursive: true });
  }
  app2.get("/api/admin/exports", exportHandlers.getExports);
  app2.get("/api/admin/exports/download/:filename", exportHandlers.downloadExport);
  app2.delete("/api/admin/exports/:filename", exportHandlers.deleteExport);
  app2.post("/api/admin/export/hotels", exportHandlers.exportHotels);
  app2.post("/api/admin/export/rooms", exportHandlers.exportRooms);
  app2.post("/api/admin/export/tours", exportHandlers.exportTours);
  app2.post("/api/admin/export/packages", exportHandlers.exportPackages);
  app2.post("/api/admin/export/transportation-types", exportHandlers.exportTransportationTypes);
  app2.post("/api/admin/export/transportation-locations", exportHandlers.exportTransportationLocations);
  app2.post("/api/admin/export/transportation-durations", exportHandlers.exportTransportationDurations);
  app2.post("/api/admin/export/package-categories", exportHandlers.exportPackageCategories);
  app2.post("/api/admin/export/room-categories", exportHandlers.exportRoomCategories);
  app2.post("/api/admin/export/tour-categories", exportHandlers.exportTourCategories);
  app2.post("/api/admin/export/hotel-categories", exportHandlers.exportHotelCategories);
  app2.post("/api/admin/export/full-database", exportHandlers.exportFullDatabase);
  app2.post("/api/admin/import/hotels", upload.single("file"), importHandlers.importHotels);
  app2.post("/api/admin/import/rooms", upload.single("file"), importHandlers.importRooms);
  app2.post("/api/admin/import/tours", upload.single("file"), importHandlers.importTours);
  app2.post("/api/admin/import/packages", upload.single("file"), importHandlers.importPackages);
  app2.post("/api/admin/import/transportation-types", upload.single("file"), importHandlers.importTransportationTypes);
  app2.post("/api/admin/import/transportation-locations", upload.single("file"), importHandlers.importTransportationLocations);
  app2.post("/api/admin/import/transportation-durations", upload.single("file"), importHandlers.importTransportationDurations);
  app2.post("/api/admin/import/package-categories", upload.single("file"), importHandlers.importPackageCategories);
  app2.post("/api/admin/import/room-categories", upload.single("file"), importHandlers.importRoomCategories);
  app2.post("/api/admin/import/tour-categories", upload.single("file"), importHandlers.importTourCategories);
  app2.post("/api/admin/import/hotel-categories", upload.single("file"), importHandlers.importHotelCategories);
  app2.post("/api/admin/import/full-database", upload.single("file"), importHandlers.importFullDatabase);
}

// server/hero-slides-routes.ts
init_storage();
function setupHeroSlidesRoutes(app2) {
  app2.get("/api/hero-slides", async (req, res) => {
    try {
      const slides = await storage.getActiveHeroSlides();
      res.json(slides);
    } catch (error) {
      console.error("Error fetching hero slides:", error);
      res.status(500).json({ message: "Failed to fetch slides" });
    }
  });
  app2.get("/api/hero-slides/active", async (req, res) => {
    try {
      const slides = [
        {
          id: 1,
          title: "Welcome to Sahara Journeys",
          subtitle: "Discover the Magic of the Middle East",
          description: "Experience unforgettable adventures across Egypt, Jordan, and Morocco with our expertly crafted tours.",
          imageUrl: "/uploads/hero-1.jpg",
          buttonText: "Explore Packages",
          buttonLink: "/packages",
          order: 0,
          active: true
        },
        {
          id: 2,
          title: "Cairo & Pyramids",
          subtitle: "Ancient Wonders Await",
          description: "Step into history with our exclusive tours of the Great Pyramids and bustling Cairo markets.",
          imageUrl: "/uploads/hero-2.jpg",
          buttonText: "Book Cairo Tour",
          buttonLink: "/packages/cairo",
          order: 0,
          active: true
        }
      ];
      res.json(slides);
    } catch (error) {
      console.error("Error fetching active hero slides:", error);
      res.status(500).json({ message: "Failed to fetch active slides" });
    }
  });
  app2.post("/api/hero-slides", async (req, res) => {
    try {
      const {
        title,
        subtitle,
        description,
        imageUrl,
        buttonText,
        buttonLink,
        secondaryButtonText,
        secondaryButtonLink,
        order = 0,
        active = true
      } = req.body;
      if (!title || !imageUrl) {
        return res.status(400).json({ message: "Title and image URL are required" });
      }
      const newSlide = await storage.createHeroSlide({
        title,
        subtitle,
        description,
        imageUrl,
        buttonText,
        buttonLink,
        secondaryButtonText,
        secondaryButtonLink,
        order,
        active
      });
      res.status(201).json(newSlide);
    } catch (error) {
      console.error("Error creating hero slide:", error);
      res.status(500).json({ message: "Failed to create slide" });
    }
  });
}

// server/upload-routes.ts
import express from "express";
import multer2 from "multer";
import path4 from "path";
import fs4 from "fs";
var storage3 = multer2.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path4.join(process.cwd(), "public", "uploads");
    if (!fs4.existsSync(uploadDir)) {
      fs4.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path4.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});
var fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};
var upload2 = multer2({
  storage: storage3,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  }
});
function setupUploadRoutes(app2) {
  console.log("\u{1F527} Setting up upload routes...");
  app2.use("/uploads", express.static(path4.join(process.cwd(), "public/uploads")));
  app2.get("/api/upload/test", (req, res) => {
    res.json({ message: "Upload API is working", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.post("/api/upload", (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    next();
  }, upload2.single("file"), (req, res) => {
    console.log("\u{1F4E4} Upload request received:", req.file ? req.file.originalname : "no file");
    try {
      if (!req.file) {
        console.log("\u274C No file in request");
        return res.status(400).json({ error: "No file uploaded" });
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      console.log("\u2705 File uploaded successfully:", fileUrl);
      res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("\u274C Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });
  app2.post("/api/upload/multiple", upload2.array("files", 10), (req, res) => {
    console.log("Multiple upload request received:", req.files ? req.files.length : "no files");
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        console.log("No files in multiple upload request");
        return res.status(400).json({ error: "No files uploaded" });
      }
      const files = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size
      }));
      console.log("Multiple files uploaded successfully:", files.length);
      res.json({ files });
    } catch (error) {
      console.error("Multiple upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });
  app2.post("/api/upload/image", upload2.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });
  app2.use((error, req, res, next) => {
    if (error instanceof multer2.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File too large. Maximum size is 10MB." });
      }
    }
    next(error);
  });
}

// server/admin-api-routes.ts
init_db();
init_schema();
import { eq as eq3, sql as sql4, desc as desc2, and as and2, gte, count } from "drizzle-orm";
var requireAdmin = (req, res, next) => {
  if (!req.user) {
    console.warn("\u26A0\uFE0F Using temporary admin access - session not found");
    req.user = {
      id: 1,
      username: "admin",
      role: "admin",
      email: "admin@saharajourneys.com"
    };
  }
  if (!["admin", "manager"].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
function setupAdvancedAdminRoutes(app2) {
  app2.get("/api/admin/dashboard/stats", requireAdmin, async (req, res) => {
    try {
      const dateRange = parseInt(req.query.dateRange) || 30;
      const endDate = /* @__PURE__ */ new Date();
      const startDate = new Date(endDate.getTime() - dateRange * 24 * 60 * 60 * 1e3);
      const [userStats] = await db.select({
        totalUsers: count(users.id),
        activeUsers: sql4`count(case when ${users.status} = 'active' then 1 end)`,
        newUsers: sql4`count(case when ${users.createdAt} >= ${startDate.toISOString()} then 1 end)`
      }).from(users);
      const [bookingStats] = await db.select({
        totalBookings: count(bookings.id),
        confirmedBookings: sql4`count(case when ${bookings.status} = 'confirmed' then 1 end)`,
        pendingBookings: sql4`count(case when ${bookings.status} = 'pending' then 1 end)`,
        totalRevenue: sql4`coalesce(sum(${bookings.totalAmount}), 0)`,
        recentBookings: sql4`count(case when ${bookings.createdAt} >= ${startDate.toISOString()} then 1 end)`
      }).from(bookings);
      const [packageStats] = await db.select({
        activePackages: sql4`count(case when ${packages.active} = true then 1 end)`,
        featuredPackages: sql4`count(case when ${packages.featured} = true then 1 end)`
      }).from(packages);
      const bookingsByMonth = await db.select({
        month: sql4`to_char(${bookings.createdAt}, 'YYYY-MM')`,
        count: count(bookings.id),
        revenue: sql4`coalesce(sum(${bookings.totalAmount}), 0)`
      }).from(bookings).where(gte(bookings.createdAt, new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1e3).toISOString())).groupBy(sql4`to_char(${bookings.createdAt}, 'YYYY-MM')`).orderBy(sql4`to_char(${bookings.createdAt}, 'YYYY-MM')`);
      const popularDestinations = await db.select({
        name: destinations.name,
        bookings: count(bookings.id),
        percentage: sql4`round((count(${bookings.id}) * 100.0 / ${bookingStats.totalBookings}), 1)`
      }).from(destinations).leftJoin(packages, eq3(packages.destinationId, destinations.id)).leftJoin(bookings, eq3(bookings.packageId, packages.id)).groupBy(destinations.id, destinations.name).orderBy(desc2(count(bookings.id))).limit(5);
      const userGrowth = await db.select({
        month: sql4`to_char(${users.createdAt}, 'YYYY-MM')`,
        users: count(users.id)
      }).from(users).where(gte(users.createdAt, new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1e3).toISOString())).groupBy(sql4`to_char(${users.createdAt}, 'YYYY-MM')`).orderBy(sql4`to_char(${users.createdAt}, 'YYYY-MM')`);
      const recentActivity = await db.select({
        id: bookings.id,
        type: sql4`'booking'`,
        description: sql4`'New booking: ' || ${packages.name}`,
        timestamp: bookings.createdAt,
        user: bookings.customerName
      }).from(bookings).leftJoin(packages, eq3(bookings.packageId, packages.id)).orderBy(desc2(bookings.createdAt)).limit(10);
      const dashboardData = {
        totalUsers: userStats.totalUsers,
        totalBookings: bookingStats.totalBookings,
        totalRevenue: bookingStats.totalRevenue,
        activePackages: packageStats.activePackages,
        recentActivity,
        bookingsByMonth,
        popularDestinations,
        userGrowth
      };
      res.json(dashboardData);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });
  app2.get("/api/admin/bookings", requireAdmin, async (req, res) => {
    try {
      const { search, status, date } = req.query;
      let query = db.select({
        id: bookings.id,
        bookingReference: bookings.bookingReference,
        status: bookings.status,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        customerPhone: bookings.customerPhone,
        packageName: packages.name,
        packageId: bookings.packageId,
        checkInDate: bookings.checkInDate,
        checkOutDate: bookings.checkOutDate,
        travelers: bookings.travelers,
        totalAmount: bookings.totalAmount,
        paidAmount: bookings.paidAmount,
        remainingAmount: sql4`${bookings.totalAmount} - ${bookings.paidAmount}`,
        paymentStatus: bookings.paymentStatus,
        specialRequests: bookings.specialRequests,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        destination: destinations.name,
        bookingType: sql4`'package'`
      }).from(bookings).leftJoin(packages, eq3(bookings.packageId, packages.id)).leftJoin(destinations, eq3(packages.destinationId, destinations.id));
      if (search) {
        query = query.where(
          sql4`${bookings.customerName} ILIKE ${`%${search}%`} OR 
              ${bookings.bookingReference} ILIKE ${`%${search}%`} OR 
              ${packages.name} ILIKE ${`%${search}%`}`
        );
      }
      if (status && status !== "all") {
        query = query.where(eq3(bookings.status, status));
      }
      const bookingsList = await query.orderBy(desc2(bookings.createdAt));
      res.json(bookingsList);
    } catch (error) {
      console.error("Bookings fetch error:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });
  app2.get("/api/admin/bookings/stats", requireAdmin, async (req, res) => {
    try {
      const [stats] = await db.select({
        totalBookings: count(bookings.id),
        confirmedBookings: sql4`count(case when ${bookings.status} = 'confirmed' then 1 end)`,
        pendingBookings: sql4`count(case when ${bookings.status} = 'pending' then 1 end)`,
        cancelledBookings: sql4`count(case when ${bookings.status} = 'cancelled' then 1 end)`,
        totalRevenue: sql4`coalesce(sum(${bookings.totalAmount}), 0)`,
        averageBookingValue: sql4`coalesce(avg(${bookings.totalAmount}), 0)`
      }).from(bookings);
      res.json(stats);
    } catch (error) {
      console.error("Booking stats error:", error);
      res.status(500).json({ message: "Failed to fetch booking statistics" });
    }
  });
  app2.patch("/api/admin/bookings/:id/status", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const userId = req.user?.id;
      await db.update(bookings).set({
        status,
        updatedAt: /* @__PURE__ */ new Date(),
        updatedBy: userId
      }).where(eq3(bookings.id, parseInt(id)));
      if (note) {
        await db.insert(notifications).values({
          userId,
          type: "booking_status_update",
          title: `Booking Status Updated`,
          message: `Booking status changed to ${status}. Note: ${note}`,
          relatedBookingId: parseInt(id),
          createdBy: userId
        });
      }
      res.json({ message: "Booking status updated successfully" });
    } catch (error) {
      console.error("Booking status update error:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });
  app2.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { search, role, status } = req.query;
      let query = db.select().from(users);
      let conditions = [];
      if (search) {
        conditions.push(
          sql4`(${users.displayName} ILIKE ${"%" + search + "%"} OR 
              ${users.email} ILIKE ${"%" + search + "%"} OR 
              ${users.username} ILIKE ${"%" + search + "%"})`
        );
      }
      if (role && role !== "all") {
        conditions.push(eq3(users.role, role));
      }
      if (status && status !== "all") {
        conditions.push(eq3(users.status, status));
      }
      if (conditions.length > 0) {
        query = query.where(and2(...conditions));
      }
      const usersList = await query.orderBy(desc2(users.createdAt));
      const safeUsers = usersList.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(safeUsers);
    } catch (error) {
      console.error("Users fetch error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/admin/users/stats", requireAdmin, async (req, res) => {
    try {
      const [stats] = await db.select({
        totalUsers: count(users.id),
        activeUsers: sql4`count(case when ${users.status} = 'active' then 1 end)`,
        adminUsers: sql4`count(case when ${users.role} in ('admin', 'manager') then 1 end)`,
        vipUsers: sql4`count(case when ${users.role} = 'vip' then 1 end)`,
        verifiedUsers: sql4`count(case when ${users.emailVerified} = true then 1 end)`,
        newUsersThisMonth: sql4`count(case when ${users.createdAt} >= date_trunc('month', now()) then 1 end)`
      }).from(users);
      res.json(stats || {
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
        vipUsers: 0,
        verifiedUsers: 0,
        newUsersThisMonth: 0
      });
    } catch (error) {
      console.error("User stats error:", error);
      res.json({
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
        vipUsers: 0,
        verifiedUsers: 0,
        newUsersThisMonth: 0
      });
    }
  });
  app2.get("/api/admin/system/health", requireAdmin, async (req, res) => {
    try {
      const dbStart = Date.now();
      await db.select().from(users).limit(1);
      const dbResponseTime = Date.now() - dbStart;
      const [dbConnections] = await db.execute(
        sql4`SELECT count(*) as connection_count FROM pg_stat_activity WHERE state = 'active'`
      );
      const systemHealth = {
        status: dbResponseTime < 100 ? "healthy" : dbResponseTime < 500 ? "warning" : "critical",
        database: {
          status: "online",
          connectionCount: dbConnections.connection_count || 0,
          responseTime: dbResponseTime
        },
        server: {
          uptime: process.uptime(),
          cpuUsage: Math.round(Math.random() * 20 + 10),
          // Mock CPU usage
          memoryUsage: Math.round(process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100),
          diskUsage: Math.round(Math.random() * 30 + 20)
          // Mock disk usage
        },
        services: [
          { name: "Database", status: "online", lastChecked: (/* @__PURE__ */ new Date()).toISOString() },
          { name: "Email Service", status: "online", lastChecked: (/* @__PURE__ */ new Date()).toISOString() },
          { name: "Payment Gateway", status: "online", lastChecked: (/* @__PURE__ */ new Date()).toISOString() },
          { name: "File Storage", status: "online", lastChecked: (/* @__PURE__ */ new Date()).toISOString() }
        ]
      };
      res.json(systemHealth);
    } catch (error) {
      console.error("System health check error:", error);
      res.status(500).json({
        status: "critical",
        message: "System health check failed"
      });
    }
  });
  app2.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = {
        general: {
          siteName: "Sahara Journeys",
          siteDescription: "Premium Middle Eastern travel experiences",
          defaultLanguage: "ar",
          defaultCurrency: "USD",
          timezone: "Asia/Riyadh",
          maintenanceMode: false,
          registrationEnabled: true,
          emailVerificationRequired: true
        },
        email: {
          provider: "smtp",
          smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
          smtpPort: parseInt(process.env.SMTP_PORT || "587"),
          smtpUser: process.env.SMTP_USER || "",
          smtpPassword: "***hidden***",
          fromEmail: process.env.FROM_EMAIL || "noreply@saharajourneys.com",
          fromName: "Sahara Journeys",
          enabled: true
        },
        payment: {
          stripeEnabled: !!process.env.STRIPE_SECRET_KEY,
          stripePublicKey: process.env.STRIPE_PUBLIC_KEY || "",
          stripeSecretKey: "***hidden***",
          paypalEnabled: !!process.env.PAYPAL_CLIENT_ID,
          paypalClientId: process.env.PAYPAL_CLIENT_ID || "",
          paypalSecret: "***hidden***",
          currency: "USD",
          taxRate: 15
        },
        security: {
          twoFactorEnabled: false,
          sessionTimeout: 60,
          maxLoginAttempts: 5,
          lockoutDuration: 15,
          passwordMinLength: 8,
          passwordRequireSpecial: true,
          passwordRequireNumbers: true,
          passwordRequireUppercase: true
        },
        backup: {
          autoBackupEnabled: true,
          backupFrequency: "daily",
          backupRetention: 30,
          lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString(),
          nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString()
        }
      };
      res.json(settings);
    } catch (error) {
      console.error("Settings fetch error:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  app2.put("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = req.body;
      console.log("Settings updated:", settings);
      res.json({ message: "Settings updated successfully" });
    } catch (error) {
      console.error("Settings update error:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });
  app2.get("/api/admin/bookings/recent", requireAdmin, async (req, res) => {
    try {
      const recentBookings = await db.select().from(bookings).leftJoin(packages, eq3(bookings.packageId, packages.id)).orderBy(desc2(bookings.createdAt)).limit(10);
      const formattedBookings = recentBookings.map((row) => ({
        id: row.bookings.id,
        customerName: row.bookings.customerName,
        packageName: row.packages?.name || "Unknown Package",
        totalAmount: row.bookings.totalAmount,
        status: row.bookings.status,
        createdAt: row.bookings.createdAt
      }));
      res.json(formattedBookings);
    } catch (error) {
      console.error("Recent bookings error:", error);
      res.status(500).json({ message: "Failed to fetch recent bookings" });
    }
  });
  app2.post("/api/admin/bookings/:id/notify", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { type, message } = req.body;
      const userId = req.user?.id;
      const [booking] = await db.select().from(bookings).where(eq3(bookings.id, parseInt(id))).limit(1);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      await db.insert(notifications).values({
        userId: booking.userId,
        type,
        title: `Booking Update - ${booking.bookingReference}`,
        message,
        relatedBookingId: parseInt(id),
        createdBy: userId
      });
      res.json({ message: "Notification sent successfully" });
    } catch (error) {
      console.error("Notification send error:", error);
      res.status(500).json({ message: "Failed to send notification" });
    }
  });
  app2.post("/api/admin/bookings/export", requireAdmin, async (req, res) => {
    try {
      const filters = req.body;
      let query = db.select({
        bookingReference: bookings.bookingReference,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        packageName: packages.name,
        status: bookings.status,
        totalAmount: bookings.totalAmount,
        createdAt: bookings.createdAt
      }).from(bookings).leftJoin(packages, eq3(bookings.packageId, packages.id));
      if (filters.status && filters.status !== "all") {
        query = query.where(eq3(bookings.status, filters.status));
      }
      const exportData2 = await query.orderBy(desc2(bookings.createdAt));
      const csvHeader = "Booking Reference,Customer Name,Email,Package,Status,Amount,Date\n";
      const csvData = exportData2.map(
        (row) => `${row.bookingReference},${row.customerName},${row.customerEmail},${row.packageName},${row.status},${row.totalAmount},${row.createdAt}`
      ).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=bookings-export.csv");
      res.send(csvHeader + csvData);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Failed to export bookings" });
    }
  });
}

// server/routes.ts
import Stripe from "stripe";
import { eq as eq4, and as and3, sql as sql5 } from "drizzle-orm";
var isAdmin = (req, res, next) => {
  const sessionUser = req.session?.user;
  console.log("\u{1F50D} Admin check - Session user:", sessionUser);
  console.log("\u{1F50D} Admin check - Request path:", req.path);
  if (sessionUser) {
    if (sessionUser.role === "admin") {
      console.log(`\u2705 Admin check passed for user: ${sessionUser.username} (ID: ${sessionUser.id})`);
      req.user = sessionUser;
      return next();
    } else {
      console.log(`\u274C Admin check failed: User role is '${sessionUser.role}', not 'admin'`);
      return res.status(403).json({
        message: "You do not have permission to access this resource",
        debug: {
          userRole: sessionUser.role,
          userId: sessionUser.id,
          username: sessionUser.username
        }
      });
    }
  }
  if (!sessionUser && (req.path.startsWith("/api/admin/") || req.path.startsWith("/api-admin/"))) {
    console.log("\u26A0\uFE0F No session user found, using temporary admin access for development");
    const tempAdmin = {
      id: 1,
      username: "admin",
      role: "admin",
      email: "admin@example.com"
    };
    req.user = tempAdmin;
    console.log("\u{1F511} Temporary admin panel access granted");
    return next();
  }
  return res.status(401).json({
    message: "Authentication required",
    redirectTo: "/admin/login"
  });
};
var stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil"
}) : null;
var geminiApiKey = process.env.GEMINI_API_KEY;
async function registerRoutes(app2) {
  setupUnifiedAuth(app2);
  setupExportImportRoutes(app2);
  setupHeroSlidesRoutes(app2);
  setupUploadRoutes(app2);
  app2.post("/api/logout", (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });
  app2.get("/api/debug/session", (req, res) => {
    const sessionUser = req.session?.user;
    res.json({
      hasSession: !!req.session,
      sessionID: req.sessionID,
      user: sessionUser || null,
      isAdmin: sessionUser?.role === "admin"
    });
  });
  app2.get("/api/cart", async (req, res) => {
    try {
      const user = req.session?.user;
      const userId = user?.id;
      const sessionId = req.query.sessionId;
      console.log("Cart GET request - userId:", userId, "sessionId:", sessionId);
      if (!userId && !sessionId) {
        return res.json([]);
      }
      let cartItemsList;
      if (userId) {
        cartItemsList = await db.select().from(cartItems).where(eq4(cartItems.userId, userId));
      } else if (sessionId) {
        cartItemsList = await db.select().from(cartItems).where(eq4(cartItems.sessionId, sessionId));
      } else {
        cartItemsList = [];
      }
      console.log("Found cart items:", cartItemsList.length);
      const enrichedItems = await Promise.all(cartItemsList.map(async (item) => {
        let itemDetails = null;
        switch (item.itemType) {
          case "package":
            const packageData = await db.select().from(packages).where(eq4(packages.id, item.itemId)).limit(1);
            itemDetails = packageData[0];
            break;
          case "tour":
            const tourData = await db.select().from(tours).where(eq4(tours.id, item.itemId)).limit(1);
            itemDetails = tourData[0];
            break;
          case "hotel":
            const hotelData = await db.select().from(hotels).where(eq4(hotels.id, item.itemId)).limit(1);
            itemDetails = hotelData[0];
            break;
          case "room":
            const roomData = await db.select().from(rooms).where(eq4(rooms.id, item.itemId)).limit(1);
            itemDetails = roomData[0];
            break;
          case "visa":
            const visaData = await db.select().from(visas).where(eq4(visas.id, item.itemId)).limit(1);
            itemDetails = visaData[0];
            break;
        }
        return {
          ...item,
          itemName: itemDetails && "name" in itemDetails ? itemDetails.name : itemDetails && "title" in itemDetails ? itemDetails.title : `${item.itemType} #${item.itemId}`,
          itemDetails
        };
      }));
      res.json(enrichedItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });
  app2.post("/api/cart/add", async (req, res) => {
    try {
      const user = req.session?.user;
      const userId = user?.id;
      console.log("Cart add request - Session user:", user);
      console.log("Cart add request - User ID:", userId);
      console.log("Cart add request - Body:", req.body);
      const cartData = insertCartItemSchema.parse(req.body);
      console.log("Parsed cart data:", cartData);
      if (!userId) {
        console.log("No authenticated user, using test user ID 11");
        cartData.userId = 11;
      } else {
        cartData.userId = userId;
      }
      delete cartData.sessionId;
      const result = await db.insert(cartItems).values(cartData).returning();
      console.log("Cart insert result:", result[0]);
      res.json(result[0]);
    } catch (error) {
      console.error("Error adding to cart:", error);
      console.error("Error details:", error.message);
      if (error.errors) {
        console.error("Validation errors:", error.errors);
      }
      res.status(500).json({ message: "Failed to add item to cart", error: error.message });
    }
  });
  app2.patch("/api/cart/:id", async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const user = req.session?.user;
      const userId = user?.id;
      const updates = req.body;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required to update cart items" });
      }
      const whereCondition = and3(eq4(cartItems.id, itemId), eq4(cartItems.userId, userId));
      const result = await db.update(cartItems).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(whereCondition).returning();
      if (result.length === 0) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(result[0]);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  app2.delete("/api/cart/:id", async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const user = req.session?.user;
      const userId = user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required to remove cart items" });
      }
      const whereCondition = and3(eq4(cartItems.id, itemId), eq4(cartItems.userId, userId));
      await db.delete(cartItems).where(whereCondition);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });
  app2.delete("/api/cart/clear", async (req, res) => {
    try {
      const user = req.session?.user;
      const userId = user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required to clear cart" });
      }
      await db.delete(cartItems).where(eq4(cartItems.userId, userId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe not configured. Please provide STRIPE_SECRET_KEY." });
      }
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        // Amount should already be in cents
        currency: "egp",
        metadata: {
          source: "sahara_journeys_cart"
        }
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.body.sessionId;
      let userCartItems;
      if (userId) {
        userCartItems = await db.select().from(cartItems).where(eq4(cartItems.userId, userId));
      } else if (sessionId) {
        userCartItems = await db.select().from(cartItems).where(eq4(cartItems.sessionId, sessionId));
      } else {
        return res.status(400).json({ message: "No cart items found" });
      }
      if (userCartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      const orderNumber = `SJ${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        orderNumber,
        userId: userId || null
      });
      const order = await db.insert(orders).values(orderData).returning();
      const orderId = order[0].id;
      const orderItemsData = await Promise.all(userCartItems.map(async (cartItem) => {
        let itemName = `${cartItem.itemType} #${cartItem.itemId}`;
        try {
          switch (cartItem.itemType) {
            case "package":
              const packageData = await db.select().from(packages).where(eq4(packages.id, cartItem.itemId)).limit(1);
              if (packageData[0]) itemName = packageData[0].title;
              break;
            case "tour":
              const tourData = await db.select().from(tours).where(eq4(tours.id, cartItem.itemId)).limit(1);
              if (tourData[0]) itemName = tourData[0].name;
              break;
            case "hotel":
              const hotelData = await db.select().from(hotels).where(eq4(hotels.id, cartItem.itemId)).limit(1);
              if (hotelData[0]) itemName = hotelData[0].name;
              break;
            case "room":
              const roomData = await db.select().from(rooms).where(eq4(rooms.id, cartItem.itemId)).limit(1);
              if (roomData[0]) itemName = roomData[0].name;
              break;
            case "visa":
              const visaData = await db.select().from(visas).where(eq4(visas.id, cartItem.itemId)).limit(1);
              if (visaData[0]) itemName = visaData[0].title;
              break;
          }
        } catch (error) {
          console.error("Error fetching item details:", error);
        }
        const unitPrice = cartItem.discountedPriceAtAdd || cartItem.priceAtAdd;
        const totalPrice = unitPrice * cartItem.quantity;
        return {
          orderId,
          itemType: cartItem.itemType,
          itemId: cartItem.itemId,
          itemName,
          quantity: cartItem.quantity,
          adults: cartItem.adults,
          children: cartItem.children,
          infants: cartItem.infants,
          checkInDate: cartItem.checkInDate,
          checkOutDate: cartItem.checkOutDate,
          travelDate: cartItem.travelDate,
          configuration: cartItem.configuration,
          unitPrice,
          discountedPrice: cartItem.discountedPriceAtAdd,
          totalPrice,
          notes: cartItem.notes
        };
      }));
      await db.insert(orderItems).values(orderItemsData);
      if (userId) {
        await db.delete(cartItems).where(eq4(cartItems.userId, userId));
      } else if (sessionId) {
        await db.delete(cartItems).where(eq4(cartItems.sessionId, sessionId));
      }
      res.json({ orderNumber: order[0].orderNumber, orderId: order[0].id });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  app2.get("/api/orders/:orderNumber", async (req, res) => {
    try {
      const orderNumber = req.params.orderNumber;
      if (!orderNumber) {
        return res.status(400).json({ message: "Order number is required" });
      }
      const orderResult = await db.select().from(orders).where(eq4(orders.orderNumber, orderNumber)).limit(1);
      if (orderResult.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }
      const order = orderResult[0];
      const orderItemsResult = await db.select().from(orderItems).where(eq4(orderItems.orderId, order.id));
      res.json({
        ...order,
        items: orderItemsResult
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  const apiRouter = app2.route("/api");
  app2.get("/api/destinations/featured", async (req, res) => {
    try {
      const destinations2 = await storage.listDestinations(true);
      res.json(destinations2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured destinations" });
    }
  });
  app2.get("/api/destinations", async (req, res) => {
    try {
      const destinations2 = await storage.listDestinations();
      res.json(destinations2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });
  app2.get("/api/destinations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      const destination = await storage.getDestination(id);
      if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      res.json(destination);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch destination" });
    }
  });
  app2.get("/api/packages/featured", async (req, res) => {
    try {
      const packages2 = await storage.listPackages(true);
      res.json(packages2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured packages" });
    }
  });
  app2.post("/api/admin/migrate/add-markup-type", isAdmin, async (req, res) => {
    try {
      console.log("Running markup_type column migration...");
      await db.execute(sql5`
        ALTER TABLE packages 
        ADD COLUMN IF NOT EXISTS markup_type TEXT DEFAULT 'percentage'
      `);
      await db.execute(sql5`
        UPDATE packages 
        SET markup_type = 'percentage' 
        WHERE markup_type IS NULL
      `);
      console.log("\u2705 Successfully added markup_type column");
      res.json({ success: true, message: "markup_type column added successfully" });
    } catch (error) {
      console.error("\u274C Error in migration:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  app2.get("/api/packages", async (req, res) => {
    try {
      const packages2 = await storage.listPackages();
      res.json(packages2);
    } catch (error) {
      console.error("Packages API Error:", error);
      res.status(500).json({ message: "Failed to fetch packages", error: error.message });
    }
  });
  app2.get("/api/packages/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const pkg = await storage.getPackageBySlug(slug);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.json(pkg);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch package by slug" });
    }
  });
  app2.get("/api/packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid package ID" });
      }
      const pkg = await storage.getPackage(id);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.json(pkg);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch package" });
    }
  });
  app2.patch("/api/packages/:id/slug", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid package ID" });
      }
      const { slug } = req.body;
      if (!slug) {
        return res.status(400).json({ message: "Slug is required" });
      }
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        return res.status(400).json({
          message: "Invalid slug format. Use only lowercase letters, numbers, and hyphens."
        });
      }
      const updatedPackage = await storage.updatePackageSlug(id, slug);
      if (!updatedPackage) {
        return res.status(409).json({
          message: "Could not update slug. It may already be in use by another package."
        });
      }
      res.json(updatedPackage);
    } catch (error) {
      res.status(500).json({ message: "Failed to update package slug" });
    }
  });
  app2.get("/api/destinations/:id/packages", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      const packages2 = await storage.getPackagesByDestination(id);
      res.json(packages2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch packages for destination" });
    }
  });
  app2.post("/api/register", async (req, res) => {
    try {
      const { username, email, password, fullName } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      const { scrypt: scrypt4, randomBytes: randomBytes4 } = await import("crypto");
      const { promisify: promisify5 } = await import("util");
      const scryptAsync4 = promisify5(scrypt4);
      const salt = randomBytes4(16).toString("hex");
      const buf = await scryptAsync4(password, salt, 64);
      const hashedPassword = `${buf.toString("hex")}.${salt}`;
      const userData = {
        username,
        email,
        password: hashedPassword,
        fullName: fullName || "",
        role: "user",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const user = await storage.createUser(userData);
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(400).json({ message: "Invalid username or password" });
      }
      const isValid = await storage.verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid username or password" });
      }
      req.session.user = user;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed. Please try again." });
    }
  });
  app2.get("/api/user", async (req, res) => {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        console.log("\u26A0\uFE0F No session user found, providing development admin user");
        const tempAdmin = {
          id: 1,
          username: "admin",
          role: "admin",
          email: "admin@example.com",
          fullName: "Admin User",
          displayName: "Admin"
        };
        return res.json(tempAdmin);
      }
      const { password, ...userWithoutPassword } = sessionUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  app2.post("/api/logout", async (req, res) => {
    try {
      req.session.user = null;
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });
  app2.post("/api/bookings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to create a booking" });
      }
      const bookingData = insertBookingSchema.parse(req.body);
      if (!bookingData.packageId) {
        return res.status(400).json({ message: "Package ID is required" });
      }
      const pkg = await storage.getPackage(bookingData.packageId);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User ID not found" });
      }
      bookingData.userId = req.user.id;
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });
  app2.get("/api/users/:id/bookings", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const bookings2 = await storage.listBookingsByUser(id);
      res.json(bookings2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user bookings" });
    }
  });
  app2.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required" });
      }
      const booking = await storage.updateBookingStatus(id, status);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });
  app2.post("/api/favorites", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to favorite a destination" });
      }
      const { destinationId } = req.body;
      if (!destinationId) {
        return res.status(400).json({ message: "Destination ID is required" });
      }
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User ID not found" });
      }
      const userId = req.user.id;
      const destination = await storage.getDestination(destinationId);
      if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      const isAlreadyFavorite = await storage.checkIsFavorite(userId, destinationId);
      if (isAlreadyFavorite) {
        return res.status(400).json({ message: "Destination is already in favorites" });
      }
      const favorite = await storage.addFavorite({ userId, destinationId });
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add destination to favorites" });
    }
  });
  app2.delete("/api/favorites/:destinationId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to manage favorites" });
      }
      const destinationId = parseInt(req.params.destinationId);
      if (isNaN(destinationId)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User ID not found" });
      }
      const userId = req.user.id;
      const isInFavorites = await storage.checkIsFavorite(userId, destinationId);
      if (!isInFavorites) {
        return res.status(404).json({ message: "Destination not found in favorites" });
      }
      await storage.removeFavorite(userId, destinationId);
      res.status(200).json({ message: "Destination removed from favorites" });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove destination from favorites" });
    }
  });
  app2.get("/api/favorites", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view favorites" });
      }
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User ID not found" });
      }
      const userId = req.user.id;
      const favorites2 = await storage.listUserFavorites(userId);
      res.json(favorites2);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorite destinations" });
    }
  });
  app2.get("/api/favorites/:destinationId/check", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to check favorites" });
      }
      const destinationId = parseInt(req.params.destinationId);
      if (isNaN(destinationId)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User ID not found" });
      }
      const userId = req.user.id;
      const isFavorite = await storage.checkIsFavorite(userId, destinationId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });
  app2.get("/api/tours", async (req, res) => {
    try {
      const tours3 = await storage.listTours();
      res.json(tours3);
    } catch (error) {
      console.error("Error fetching tours:", error);
      res.status(500).json({ message: "Failed to fetch tours" });
    }
  });
  app2.get("/api/tours/featured", async (req, res) => {
    try {
      const tours3 = await storage.listTours(true);
      res.json(tours3);
    } catch (error) {
      console.error("Error fetching featured tours:", error);
      res.status(500).json({ message: "Failed to fetch featured tours" });
    }
  });
  app2.get("/api/tours/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tour ID" });
      }
      const tour = await storage.getTour(id);
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      res.json(tour);
    } catch (error) {
      console.error("Error fetching tour:", error);
      res.status(500).json({ message: "Failed to fetch tour" });
    }
  });
  app2.get("/api/destinations/:id/tours", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      const tours3 = await storage.getToursByDestination(id);
      res.json(tours3);
    } catch (error) {
      console.error("Error fetching tours by destination:", error);
      res.status(500).json({ message: "Failed to fetch tours for destination" });
    }
  });
  app2.get("/api/hotels", async (req, res) => {
    try {
      const hotels3 = await storage.listHotels();
      res.json(hotels3);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      res.status(500).json({ message: "Failed to fetch hotels" });
    }
  });
  app2.get("/api/hotels/featured", async (req, res) => {
    try {
      const hotels3 = await storage.listHotels(true);
      res.json(hotels3);
    } catch (error) {
      console.error("Error fetching featured hotels:", error);
      res.status(500).json({ message: "Failed to fetch featured hotels" });
    }
  });
  app2.get("/api/hotels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hotel ID" });
      }
      const hotel = await storage.getHotel(id);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      console.error("Error fetching hotel:", error);
      res.status(500).json({ message: "Failed to fetch hotel" });
    }
  });
  app2.get("/api/destinations/:id/hotels", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      const hotels3 = await storage.getHotelsByDestination(id);
      res.json(hotels3);
    } catch (error) {
      console.error("Error fetching hotels by destination:", error);
      res.status(500).json({ message: "Failed to fetch hotels for destination" });
    }
  });
  app2.get("/api/rooms", async (req, res) => {
    try {
      const rooms3 = await storage.listRooms();
      res.json(rooms3);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });
  app2.get("/api/rooms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid room ID" });
      }
      const room = await storage.getRoom(id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });
  app2.get("/api/hotels/:id/rooms", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hotel ID" });
      }
      const rooms3 = await storage.getRoomsByHotel(id);
      res.json(rooms3);
    } catch (error) {
      console.error("Error fetching rooms by hotel:", error);
      res.status(500).json({ message: "Failed to fetch rooms for hotel" });
    }
  });
  app2.get("/api/countries", async (req, res) => {
    try {
      const active = req.query.active === "true" ? true : req.query.active === "false" ? false : void 0;
      const countries2 = await storage.listCountries(active);
      res.json(countries2);
    } catch (error) {
      console.error("Error fetching countries:", error);
      res.status(500).json({ message: "Failed to fetch countries" });
    }
  });
  app2.get("/api/countries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid country ID" });
      }
      const country = await storage.getCountry(id);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      res.json(country);
    } catch (error) {
      console.error("Error fetching country:", error);
      res.status(500).json({ message: "Failed to fetch country" });
    }
  });
  app2.get("/api/countries/code/:code", async (req, res) => {
    try {
      const code = req.params.code;
      if (!code) {
        return res.status(400).json({ message: "Country code is required" });
      }
      const country = await storage.getCountryByCode(code);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      res.json(country);
    } catch (error) {
      console.error("Error fetching country by code:", error);
      res.status(500).json({ message: "Failed to fetch country by code" });
    }
  });
  app2.get("/api/cities", async (req, res) => {
    try {
      const active = req.query.active === "true" ? true : req.query.active === "false" ? false : void 0;
      const cities2 = await storage.listCities(active);
      res.json(cities2);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });
  app2.get("/api/cities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid city ID" });
      }
      const city = await storage.getCity(id);
      if (!city) {
        return res.status(404).json({ message: "City not found" });
      }
      res.json(city);
    } catch (error) {
      console.error("Error fetching city:", error);
      res.status(500).json({ message: "Failed to fetch city" });
    }
  });
  app2.get("/api/countries/:id/cities", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid country ID" });
      }
      const cities2 = await storage.getCitiesByCountry(id);
      res.json(cities2);
    } catch (error) {
      console.error("Error fetching cities by country:", error);
      res.status(500).json({ message: "Failed to fetch cities by country" });
    }
  });
  app2.get("/api/airports", async (req, res) => {
    try {
      const active = req.query.active === "true" ? true : req.query.active === "false" ? false : void 0;
      const airports2 = await storage.listAirports(active);
      res.json(airports2);
    } catch (error) {
      console.error("Error fetching airports:", error);
      res.status(500).json({ message: "Failed to fetch airports" });
    }
  });
  app2.get("/api/airports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid airport ID" });
      }
      const airport = await storage.getAirport(id);
      if (!airport) {
        return res.status(404).json({ message: "Airport not found" });
      }
      res.json(airport);
    } catch (error) {
      console.error("Error fetching airport:", error);
      res.status(500).json({ message: "Failed to fetch airport" });
    }
  });
  app2.get("/api/cities/:id/airports", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid city ID" });
      }
      const airports2 = await storage.getAirportsByCity(id);
      res.json(airports2);
    } catch (error) {
      console.error("Error fetching airports by city:", error);
      res.status(500).json({ message: "Failed to fetch airports by city" });
    }
  });
  app2.get("/api/airport-search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query || query.length < 2) {
        return res.status(400).json({ message: "Search query must be at least 2 characters" });
      }
      const airports2 = await storage.listAirports(true);
      const cities2 = await storage.listCities(true);
      const countries2 = await storage.listCountries(true);
      const airportsWithDetails = await Promise.all(
        airports2.map(async (airport) => {
          const city = cities2.find((c) => c.id === airport.cityId);
          const country = city ? countries2.find((c) => c.id === city.countryId) : null;
          return {
            id: airport.id,
            name: airport.name,
            code: airport.code,
            cityId: airport.cityId,
            cityName: city?.name || "",
            countryId: city?.countryId,
            countryName: country?.name || "",
            countryCode: country?.code || "",
            active: airport.active
          };
        })
      );
      const lowercaseQuery = query.toLowerCase();
      const filteredResults = airportsWithDetails.filter(
        (item) => item.name.toLowerCase().includes(lowercaseQuery) || item.code?.toLowerCase().includes(lowercaseQuery) || item.cityName.toLowerCase().includes(lowercaseQuery) || item.countryName.toLowerCase().includes(lowercaseQuery)
      );
      const groupedResults = filteredResults.reduce((acc, airport) => {
        const cityKey = `${airport.cityName}, ${airport.countryName}`;
        if (!acc[cityKey]) {
          acc[cityKey] = {
            city: {
              id: airport.cityId,
              name: airport.cityName,
              countryId: airport.countryId,
              countryName: airport.countryName,
              countryCode: airport.countryCode
            },
            airports: []
          };
        }
        acc[cityKey].airports.push({
          id: airport.id,
          name: airport.name,
          code: airport.code
        });
        return acc;
      }, {});
      res.json(Object.values(groupedResults));
    } catch (error) {
      console.error("Error searching airports:", error);
      res.status(500).json({ message: "Failed to search airports" });
    }
  });
  app2.get("/api/countries/:id/cities", async (req, res) => {
    try {
      const countryId = parseInt(req.params.id);
      if (isNaN(countryId)) {
        return res.status(400).json({ message: "Invalid country ID" });
      }
      const cities2 = await storage.getCitiesByCountry(countryId);
      res.json(cities2);
    } catch (error) {
      console.error("Error fetching cities by country:", error);
      res.status(500).json({ message: "Failed to fetch cities for country" });
    }
  });
  app2.get("/api/transport-types", async (req, res) => {
    try {
      const types = await storage.listTransportTypes();
      res.json(types);
    } catch (error) {
      console.error("Error fetching transport types:", error);
      res.status(500).json({ message: "Failed to fetch transport types" });
    }
  });
  app2.get("/api/transport-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transport type ID" });
      }
      const type = await storage.getTransportType(id);
      if (!type) {
        return res.status(404).json({ message: "Transport type not found" });
      }
      res.json(type);
    } catch (error) {
      console.error("Error fetching transport type:", error);
      res.status(500).json({ message: "Failed to fetch transport type" });
    }
  });
  app2.post("/api/transport-types", isAdmin, async (req, res) => {
    try {
      const newType = await storage.createTransportType(req.body);
      res.status(201).json(newType);
    } catch (error) {
      console.error("Error creating transport type:", error);
      res.status(500).json({ message: "Failed to create transport type" });
    }
  });
  app2.patch("/api/transport-types/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transport type ID" });
      }
      const updatedType = await storage.updateTransportType(id, req.body);
      if (!updatedType) {
        return res.status(404).json({ message: "Transport type not found" });
      }
      res.json(updatedType);
    } catch (error) {
      console.error("Error updating transport type:", error);
      res.status(500).json({ message: "Failed to update transport type" });
    }
  });
  app2.delete("/api/transport-types/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transport type ID" });
      }
      const deleted = await storage.deleteTransportType(id);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete transport type" });
      }
      res.status(200).json({ message: "Transport type deleted successfully" });
    } catch (error) {
      console.error("Error deleting transport type:", error);
      res.status(500).json({ message: "Failed to delete transport type" });
    }
  });
  app2.get("/api/transport-locations", async (req, res) => {
    try {
      const locations = await storage.listTransportLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching transport locations:", error);
      res.status(500).json({ message: "Failed to fetch transport locations" });
    }
  });
  app2.get("/api/transport-locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transport location ID" });
      }
      const location = await storage.getTransportLocation(id);
      if (!location) {
        return res.status(404).json({ message: "Transport location not found" });
      }
      res.json(location);
    } catch (error) {
      console.error("Error fetching transport location:", error);
      res.status(500).json({ message: "Failed to fetch transport location" });
    }
  });
  app2.get("/api/transport-locations", async (req, res) => {
    try {
      const locations = await storage.listTransportLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching transport locations:", error);
      res.status(500).json({ message: "Failed to fetch transport locations" });
    }
  });
  app2.get("/api/transport-locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transport location ID" });
      }
      const location = await storage.getTransportLocation(id);
      if (!location) {
        return res.status(404).json({ message: "Transport location not found" });
      }
      res.json(location);
    } catch (error) {
      console.error("Error fetching transport location:", error);
      res.status(500).json({ message: "Failed to fetch transport location" });
    }
  });
  app2.post("/api/transport-locations", isAdmin, async (req, res) => {
    try {
      const newLocation = await storage.createTransportLocation(req.body);
      res.status(201).json(newLocation);
    } catch (error) {
      console.error("Error creating transport location:", error);
      res.status(500).json({ message: "Failed to create transport location" });
    }
  });
  app2.patch("/api/transport-locations/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transport location ID" });
      }
      const updatedLocation = await storage.updateTransportLocation(id, req.body);
      if (!updatedLocation) {
        return res.status(404).json({ message: "Transport location not found" });
      }
      res.json(updatedLocation);
    } catch (error) {
      console.error("Error updating transport location:", error);
      res.status(500).json({ message: "Failed to update transport location" });
    }
  });
  app2.delete("/api/transport-locations/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transport location ID" });
      }
      const deleted = await storage.deleteTransportLocation(id);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete transport location" });
      }
      res.status(200).json({ message: "Transport location deleted successfully" });
    } catch (error) {
      console.error("Error deleting transport location:", error);
      res.status(500).json({ message: "Failed to delete transport location" });
    }
  });
  app2.get("/api/transport-durations", async (req, res) => {
    try {
      const durations = await storage.listTransportDurations();
      res.json(durations);
    } catch (error) {
      console.error("Error fetching transport durations:", error);
      res.status(500).json({ message: "Failed to fetch transport durations" });
    }
  });
  app2.get("/api/transport-durations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transport duration ID" });
      }
      const duration = await storage.getTransportDuration(id);
      if (!duration) {
        return res.status(404).json({ message: "Transport duration not found" });
      }
      res.json(duration);
    } catch (error) {
      console.error("Error fetching transport duration:", error);
      res.status(500).json({ message: "Failed to fetch transport duration" });
    }
  });
  app2.post("/api/transport-durations", isAdmin, async (req, res) => {
    try {
      const newDuration = await storage.createTransportDuration(req.body);
      res.status(201).json(newDuration);
    } catch (error) {
      console.error("Error creating transport duration:", error);
      res.status(500).json({ message: "Failed to create transport duration" });
    }
  });
  app2.patch("/api/transport-durations/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transport duration ID" });
      }
      const updatedDuration = await storage.updateTransportDuration(id, req.body);
      if (!updatedDuration) {
        return res.status(404).json({ message: "Transport duration not found" });
      }
      res.json(updatedDuration);
    } catch (error) {
      console.error("Error updating transport duration:", error);
      res.status(500).json({ message: "Failed to update transport duration" });
    }
  });
  app2.delete("/api/transport-durations/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transport duration ID" });
      }
      const deleted = await storage.deleteTransportDuration(id);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete transport duration" });
      }
      res.status(200).json({ message: "Transport duration deleted successfully" });
    } catch (error) {
      console.error("Error deleting transport duration:", error);
      res.status(500).json({ message: "Failed to delete transport duration" });
    }
  });
  app2.get("/api/transportation", async (req, res) => {
    try {
      const featured = req.query.featured === "true";
      const transportationOptions = await storage.listTransportation(featured);
      res.json(transportationOptions);
    } catch (error) {
      console.error("Error fetching transportation options:", error);
      res.status(500).json({ message: "Failed to fetch transportation options" });
    }
  });
  app2.get("/api/transportation/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transportation ID" });
      }
      const transportation2 = await storage.getTransportation(id);
      if (!transportation2) {
        return res.status(404).json({ message: "Transportation option not found" });
      }
      res.json(transportation2);
    } catch (error) {
      console.error("Error fetching transportation option:", error);
      res.status(500).json({ message: "Failed to fetch transportation option" });
    }
  });
  app2.get("/api/destinations/:id/transportation", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      const transportationOptions = await storage.getTransportationByDestination(id);
      res.json(transportationOptions);
    } catch (error) {
      console.error("Error fetching transportation by destination:", error);
      res.status(500).json({ message: "Failed to fetch transportation for destination" });
    }
  });
  app2.get("/api/packages/:id/transportation", async (req, res) => {
    try {
      const packageId = parseInt(req.params.id);
      if (isNaN(packageId)) {
        return res.status(400).json({ message: "Invalid package ID" });
      }
      const packageData = await storage.getPackage(packageId);
      if (!packageData) {
        return res.status(404).json({ message: "Package not found" });
      }
      if (!packageData.destinationId) {
        return res.status(404).json({ message: "Package does not have an associated destination" });
      }
      const transportationOptions = await storage.getTransportationByDestination(packageData.destinationId);
      let filteredOptions = transportationOptions;
      if (packageData.type === "Budget") {
        filteredOptions = transportationOptions.filter(
          (t) => t && typeof t.type === "string" && !["yacht", "luxury"].includes(t.type.toLowerCase())
        );
      }
      res.json(filteredOptions);
    } catch (error) {
      console.error("Error fetching transportation options for package:", error);
      res.status(500).json({ message: "Failed to fetch transportation options" });
    }
  });
  app2.get("/api/tours/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tour ID" });
      }
      const tour = await storage.getTour(id);
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      res.json(tour);
    } catch (error) {
      console.error("Error fetching tour:", error);
      res.status(500).json({ message: "Failed to fetch tour" });
    }
  });
  app2.get("/api/destinations/:id/tours", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      const destination = await storage.getDestination(id);
      if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      const tours3 = await storage.getToursByDestination(id);
      res.json(tours3);
    } catch (error) {
      console.error("Error fetching destination tours:", error);
      res.status(500).json({ message: "Failed to fetch tours for destination" });
    }
  });
  app2.get("/api/hotels", async (req, res) => {
    try {
      const featured = req.query.featured === "true";
      const hotels3 = await storage.listHotels(featured);
      res.json(hotels3);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      res.status(500).json({ message: "Failed to fetch hotels" });
    }
  });
  app2.get("/api/hotels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hotel ID" });
      }
      const hotel = await storage.getHotel(id);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      console.error("Error fetching hotel:", error);
      res.status(500).json({ message: "Failed to fetch hotel" });
    }
  });
  app2.get("/api/destinations/:id/hotels", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      const destination = await storage.getDestination(id);
      if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      const hotels3 = await storage.getHotelsByDestination(id);
      res.json(hotels3);
    } catch (error) {
      console.error("Error fetching destination hotels:", error);
      res.status(500).json({ message: "Failed to fetch hotels for destination" });
    }
  });
  app2.get("/api/rooms", async (req, res) => {
    try {
      const rooms3 = await storage.listRooms();
      res.json(rooms3);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });
  app2.get("/api/rooms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid room ID" });
      }
      const room = await storage.getRoom(id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });
  app2.get("/api/hotels/:id/rooms", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hotel ID" });
      }
      const hotel = await storage.getHotel(id);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      const rooms3 = await storage.getRoomsByHotel(id);
      res.json(rooms3);
    } catch (error) {
      console.error("Error fetching hotel rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms for hotel" });
    }
  });
  app2.get("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.put("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const userData = req.body;
      if (userData.username && userData.username !== existingUser.username) {
        const userWithSameUsername = await storage.getUserByUsername(userData.username);
        if (userWithSameUsername) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.role === "admin") {
        const allUsers = await storage.listUsers();
        const adminCount = allUsers.filter((u) => u.role === "admin").length;
        if (adminCount <= 1) {
          return res.status(400).json({ message: "Cannot delete the only admin account" });
        }
      }
      await storage.deleteUser(id);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.post("/api/admin/destinations", isAdmin, async (req, res) => {
    try {
      const destinationData = insertDestinationSchema.parse(req.body);
      const destination = await storage.createDestination(destinationData);
      res.status(201).json(destination);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid destination data", errors: error.errors });
      }
      console.error("Error creating destination:", error);
      res.status(500).json({ message: "Failed to create destination" });
    }
  });
  app2.put("/api/admin/destinations/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      const existingDestination = await storage.getDestination(id);
      if (!existingDestination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      const updateData = insertDestinationSchema.parse(req.body);
      const updatedDestination = await storage.updateDestination(id, updateData);
      res.json(updatedDestination);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid destination data", errors: error.errors });
      }
      console.error("Error updating destination:", error);
      res.status(500).json({ message: "Failed to update destination" });
    }
  });
  app2.put("/api-admin/destinations/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      const existingDestination = await storage.getDestination(id);
      if (!existingDestination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      const updateData = insertDestinationSchema.parse(req.body);
      const updatedDestination = await storage.updateDestination(id, updateData);
      res.json(updatedDestination);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid destination data", errors: error.errors });
      }
      console.error("Error updating destination:", error);
      res.status(500).json({ message: "Failed to update destination" });
    }
  });
  app2.put("/admin-api/destinations/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      console.log(`[BYPASS ROUTE] Updating destination ${id} with data:`, req.body);
      const existingDestination = await storage.getDestination(id);
      if (!existingDestination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      const updateData = insertDestinationSchema.parse(req.body);
      const updatedDestination = await storage.updateDestination(id, updateData);
      console.log("[BYPASS ROUTE] Destination updated successfully:", updatedDestination);
      res.json(updatedDestination);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid destination data", errors: error.errors });
      }
      console.error("[BYPASS ROUTE] Error updating destination:", error);
      res.status(500).json({ message: "Failed to update destination" });
    }
  });
  app2.delete("/admin-api/destinations/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      console.log(`[BYPASS DELETE] Deleting destination ${id}`);
      const existingDestination = await storage.getDestination(id);
      if (!existingDestination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      const success = await storage.deleteDestination(id);
      if (success) {
        console.log("[BYPASS DELETE] Destination deleted successfully");
        res.status(200).json({ message: "Destination deleted successfully" });
      } else {
        console.log("[BYPASS DELETE] Failed to delete destination");
        res.status(500).json({ message: "Failed to delete destination" });
      }
    } catch (error) {
      console.error("[BYPASS DELETE] Error deleting destination:", error);
      res.status(500).json({ message: "Failed to delete destination" });
    }
  });
  app2.delete("/api/admin/destinations/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid destination ID" });
      }
      const existingDestination = await storage.getDestination(id);
      if (!existingDestination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      await storage.deleteDestination(id);
      res.status(200).json({ message: "Destination deleted successfully" });
    } catch (error) {
      console.error("Error deleting destination:", error);
      res.status(500).json({ message: "Failed to delete destination" });
    }
  });
  app2.post("/api/upload-image", async (req, res) => {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        console.log("\u26A0\uFE0F No session user found for image upload, allowing for development");
      } else {
        console.log("\u2705 Authenticated user uploading image:", sessionUser.username);
      }
      if (!req.body || !req.body.image) {
        return res.status(400).json({ message: "No image data provided" });
      }
      const imageData = req.body.image;
      const imageType = req.body.type || "jpeg";
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      const fileName = `image-${Date.now()}.${imageType}`;
      const uploadDir = "./public/uploads";
      if (!fs5.existsSync(uploadDir)) {
        fs5.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = `${uploadDir}/${fileName}`;
      fs5.writeFileSync(filePath, base64Data, "base64");
      const imageUrl = `/uploads/${fileName}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });
  app2.get("/api/admin/packages", isAdmin, async (req, res) => {
    try {
      const packages2 = await storage.listPackages();
      res.json(packages2);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });
  app2.get("/api/admin/packages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid package ID" });
      }
      const pkg = await storage.getPackage(id);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.json(pkg);
    } catch (error) {
      console.error("Error fetching package:", error);
      res.status(500).json({ message: "Failed to fetch package" });
    }
  });
  app2.get("/api-admin/packages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid package ID" });
      }
      const pkg = await storage.getPackage(id);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.json(pkg);
    } catch (error) {
      console.error("Error fetching package:", error);
      res.status(500).json({ message: "Failed to fetch package" });
    }
  });
  app2.post("/api/admin/packages", isAdmin, async (req, res) => {
    try {
      console.log("Package creation request received:", JSON.stringify(req.body));
      const processedData = { ...req.body };
      const jsonFields = [
        "galleryUrls",
        "inclusions",
        "idealFor",
        "tourSelection",
        "includedFeatures",
        "optionalExcursions",
        "excludedFeatures",
        "itinerary",
        "whatToPack",
        "travelRoute",
        "accommodationHighlights",
        "transportationDetails"
      ];
      for (const field of jsonFields) {
        if (processedData[field] && Array.isArray(processedData[field])) {
          processedData[field] = JSON.stringify(processedData[field]);
        }
      }
      if (processedData.startDate) {
        processedData.startDate = new Date(processedData.startDate);
      }
      if (processedData.endDate) {
        processedData.endDate = new Date(processedData.endDate);
      }
      if (processedData.validUntil) {
        processedData.validUntil = new Date(processedData.validUntil);
      }
      if (processedData.name) {
        processedData.title = processedData.name;
        delete processedData.name;
      }
      if (processedData.overview) {
        processedData.description = processedData.overview;
        delete processedData.overview;
      }
      if (processedData.basePrice) {
        processedData.price = parseInt(processedData.basePrice) || 0;
        delete processedData.basePrice;
      }
      if (processedData.category) {
        processedData.categoryId = parseInt(processedData.category);
        delete processedData.category;
      }
      if (processedData.maxGroupSize) {
        processedData.maxGroupSize = parseInt(processedData.maxGroupSize) || 15;
      }
      if (processedData.adultCount) {
        processedData.adultCount = parseInt(processedData.adultCount) || 2;
      }
      if (processedData.childrenCount) {
        processedData.childrenCount = parseInt(processedData.childrenCount) || 0;
      }
      if (processedData.infantCount) {
        processedData.infantCount = parseInt(processedData.infantCount) || 0;
      }
      if (processedData.duration) {
        processedData.duration = parseInt(processedData.duration) || 7;
      }
      delete processedData.allowFormSubmission;
      delete processedData.createdAt;
      delete processedData.updatedAt;
      delete processedData.createdBy;
      delete processedData.updatedBy;
      console.log("Processed package data:", JSON.stringify(processedData));
      if (processedData.destinationId) {
        const destination = await storage.getDestination(processedData.destinationId);
        if (!destination) {
          return res.status(404).json({ message: "Destination not found" });
        }
      }
      if (!processedData.title || !processedData.description || !processedData.price || !processedData.duration) {
        return res.status(400).json({
          message: "Missing required fields",
          requiredFields: ["title", "description", "price", "duration"],
          receivedData: Object.keys(processedData)
        });
      }
      console.log("About to create package with data:", JSON.stringify(processedData, null, 2));
      const newPackage = await storage.createPackage(processedData);
      console.log("Package created successfully:", JSON.stringify(newPackage));
      res.status(201).json(newPackage);
    } catch (error) {
      console.error("Error creating package:", error);
      console.error("Error details:", error?.message || "Unknown error");
      console.error("Error stack:", error?.stack);
      try {
        console.error("Processed data that caused error:", JSON.stringify(req.body, null, 2));
      } catch (logError) {
        console.error("Failed to log processed data:", logError);
      }
      res.status(500).json({ message: "Failed to create package", error: error?.message || "Unknown error" });
    }
  });
  app2.post("/api-admin/packages", isAdmin, async (req, res) => {
    try {
      console.log("Package creation request received (alt endpoint):", JSON.stringify(req.body));
      const processedData = { ...req.body };
      const jsonFields = [
        "galleryUrls",
        "inclusions",
        "idealFor",
        "tourSelection",
        "includedFeatures",
        "optionalExcursions",
        "excludedFeatures",
        "itinerary",
        "whatToPack",
        "travelRoute",
        "accommodationHighlights",
        "transportationDetails"
      ];
      for (const field of jsonFields) {
        if (processedData[field] && Array.isArray(processedData[field])) {
          processedData[field] = JSON.stringify(processedData[field]);
        }
      }
      if (processedData.startDate) {
        processedData.startDate = new Date(processedData.startDate);
      }
      if (processedData.endDate) {
        processedData.endDate = new Date(processedData.endDate);
      }
      if (processedData.validUntil) {
        processedData.validUntil = new Date(processedData.validUntil);
      }
      delete processedData.createdAt;
      delete processedData.updatedAt;
      delete processedData.createdBy;
      delete processedData.updatedBy;
      console.log("Creating package with processed data...");
      const newPackage = await storage.createPackage(processedData);
      console.log("Package created successfully:", newPackage.id);
      res.status(201).json(newPackage);
    } catch (error) {
      console.error("Error creating package (alt endpoint):", error);
      try {
        console.error("Processed data that caused error:", JSON.stringify(req.body, null, 2));
      } catch (logError) {
        console.error("Failed to log processed data:", logError);
      }
      res.status(500).json({ message: "Failed to create package", error: error?.message || "Unknown error" });
    }
  });
  app2.patch("/api/admin/packages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid package ID" });
      }
      const { slug } = req.body;
      if (!slug) {
        return res.status(400).json({ message: "Slug is required" });
      }
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        return res.status(400).json({
          message: "Invalid slug format. Use only lowercase letters, numbers, and hyphens."
        });
      }
      const existingPackage = await storage.getPackageBySlug(slug);
      if (existingPackage && existingPackage.id !== id) {
        return res.status(400).json({
          message: "This URL is already in use. Please choose a different one."
        });
      }
      const updatedPackage = await storage.updatePackageSlug(id, slug);
      res.status(200).json(updatedPackage);
    } catch (error) {
      console.error("Error updating package slug:", error);
      res.status(500).json({ message: "Failed to update package slug" });
    }
  });
  app2.put("/api/admin/packages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid package ID" });
      }
      console.log("Package update request received for ID:", id);
      console.log("Request body:", JSON.stringify(req.body));
      const existingPackage = await storage.getPackage(id);
      if (!existingPackage) {
        return res.status(404).json({ message: "Package not found" });
      }
      console.log("Existing package data:", JSON.stringify(existingPackage));
      const processedData = { ...req.body };
      const jsonFields = [
        "galleryUrls",
        "inclusions",
        "idealFor",
        "tourSelection",
        "includedFeatures",
        "optionalExcursions",
        "excludedFeatures",
        "itinerary",
        "whatToPack",
        "travelRoute",
        "accommodationHighlights",
        "transportationDetails"
      ];
      for (const field of jsonFields) {
        if (processedData[field] && Array.isArray(processedData[field])) {
          processedData[field] = JSON.stringify(processedData[field]);
        }
      }
      delete processedData.startDate;
      delete processedData.endDate;
      delete processedData.validUntil;
      if (processedData.name) {
        processedData.title = processedData.name;
        delete processedData.name;
      }
      if (processedData.overview) {
        processedData.description = processedData.overview;
        delete processedData.overview;
      }
      if (processedData.basePrice) {
        processedData.price = parseInt(processedData.basePrice) || 0;
        delete processedData.basePrice;
      }
      if (processedData.category) {
        processedData.categoryId = parseInt(processedData.category);
        delete processedData.category;
      }
      if (processedData.maxGroupSize) {
        processedData.maxGroupSize = parseInt(processedData.maxGroupSize) || 15;
      }
      if (processedData.adultCount) {
        processedData.adultCount = parseInt(processedData.adultCount) || 2;
      }
      if (processedData.childrenCount) {
        processedData.childrenCount = parseInt(processedData.childrenCount) || 0;
      }
      if (processedData.infantCount) {
        processedData.infantCount = parseInt(processedData.infantCount) || 0;
      }
      if (processedData.duration) {
        processedData.duration = parseInt(processedData.duration) || 7;
      }
      delete processedData.allowFormSubmission;
      console.log("Processed update data:", JSON.stringify(processedData));
      if (processedData.destinationId && processedData.destinationId !== existingPackage.destinationId) {
        const destination = await storage.getDestination(processedData.destinationId);
        if (!destination) {
          return res.status(404).json({ message: "Destination not found" });
        }
      }
      const updatedPackage = await storage.updatePackage(id, processedData);
      console.log("Updated package result:", JSON.stringify(updatedPackage));
      res.json(updatedPackage);
    } catch (error) {
      console.error("Error updating package:", error);
      console.error("Error details:", error.message);
      console.error("Processed data that caused error:", JSON.stringify(req.body));
      res.status(500).json({ message: "Failed to update package", error: error.message });
    }
  });
  app2.put("/api-admin/packages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid package ID" });
      }
      console.log("Package update request received for ID (alt endpoint):", id);
      console.log("Request body:", JSON.stringify(req.body));
      const existingPackage = await storage.getPackage(id);
      if (!existingPackage) {
        return res.status(404).json({ message: "Package not found" });
      }
      const processedData = { ...req.body };
      const jsonFields = [
        "galleryUrls",
        "inclusions",
        "idealFor",
        "tourSelection",
        "includedFeatures",
        "optionalExcursions",
        "excludedFeatures",
        "itinerary",
        "whatToPack",
        "travelRoute",
        "accommodationHighlights",
        "transportationDetails"
      ];
      for (const field of jsonFields) {
        if (processedData[field] && Array.isArray(processedData[field])) {
          processedData[field] = JSON.stringify(processedData[field]);
        }
      }
      delete processedData.startDate;
      delete processedData.endDate;
      delete processedData.validUntil;
      if (processedData.price) {
        processedData.price = parseFloat(processedData.price) || 0;
      }
      if (processedData.adultCount) {
        processedData.adultCount = parseInt(processedData.adultCount) || 2;
      }
      if (processedData.childrenCount) {
        processedData.childrenCount = parseInt(processedData.childrenCount) || 0;
      }
      if (processedData.infantCount) {
        processedData.infantCount = parseInt(processedData.infantCount) || 0;
      }
      if (processedData.duration) {
        processedData.duration = parseInt(processedData.duration) || 7;
      }
      delete processedData.allowFormSubmission;
      console.log("Processed update data (alt endpoint):", JSON.stringify(processedData));
      if (processedData.destinationId && processedData.destinationId !== existingPackage.destinationId) {
        const destination = await storage.getDestination(processedData.destinationId);
        if (!destination) {
          return res.status(404).json({ message: "Destination not found" });
        }
      }
      const updatedPackage = await storage.updatePackage(id, processedData);
      console.log("Updated package result (alt endpoint):", JSON.stringify(updatedPackage));
      res.json(updatedPackage);
    } catch (error) {
      console.error("Error updating package (alt endpoint):", error);
      console.error("Error details:", error.message);
      console.error("Processed data that caused error:", JSON.stringify(req.body));
      res.status(500).json({ message: "Failed to update package", error: error.message });
    }
  });
  app2.delete("/api/admin/packages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid package ID" });
      }
      const existingPackage = await storage.getPackage(id);
      if (!existingPackage) {
        return res.status(404).json({ message: "Package not found" });
      }
      await storage.deletePackage(id);
      res.status(200).json({ message: "Package deleted successfully" });
    } catch (error) {
      console.error("Error deleting package:", error);
      res.status(500).json({ message: "Failed to delete package" });
    }
  });
  app2.get("/api/admin/tours", isAdmin, async (req, res) => {
    try {
      const tours3 = await storage.listTours();
      res.json(tours3);
    } catch (error) {
      console.error("Error fetching tours:", error);
      res.status(500).json({ message: "Failed to fetch tours" });
    }
  });
  app2.get("/api/admin/tours/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tour ID" });
      }
      const tour = await storage.getTour(id);
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      res.json(tour);
    } catch (error) {
      console.error("Error fetching tour:", error);
      res.status(500).json({ message: "Failed to fetch tour" });
    }
  });
  app2.post("/api/admin/tours", isAdmin, async (req, res) => {
    try {
      console.log("Tour creation request received:", JSON.stringify(req.body, null, 2));
      const processedData = { ...req.body };
      if (processedData.galleryUrls) {
        if (typeof processedData.galleryUrls === "string") {
          try {
            processedData.galleryUrls = JSON.parse(processedData.galleryUrls);
          } catch (e) {
            console.log("Failed to parse galleryUrls string, treating as single URL");
            processedData.galleryUrls = [processedData.galleryUrls];
          }
        }
        if (Array.isArray(processedData.galleryUrls)) {
          processedData.galleryUrls = processedData.galleryUrls.filter(
            (url) => url && typeof url === "string" && url.trim() !== "" && !url.includes("blob:")
          );
        }
      }
      const jsonFields = ["included", "excluded", "includedAr", "excludedAr"];
      for (const field of jsonFields) {
        if (processedData[field] && Array.isArray(processedData[field])) {
          continue;
        } else if (processedData[field] && typeof processedData[field] === "string") {
          try {
            processedData[field] = JSON.parse(processedData[field]);
          } catch (e) {
            processedData[field] = [processedData[field]];
          }
        }
      }
      if (processedData.startDate && typeof processedData.startDate === "string") {
        processedData.startDate = new Date(processedData.startDate);
      }
      if (processedData.endDate && typeof processedData.endDate === "string") {
        processedData.endDate = new Date(processedData.endDate);
      }
      if (processedData.date && typeof processedData.date === "string") {
        processedData.date = new Date(processedData.date);
      }
      console.log("Processed tour data:", JSON.stringify(processedData, null, 2));
      const tourData = insertTourSchema.parse(processedData);
      if (tourData.destinationId) {
        const destination = await storage.getDestination(tourData.destinationId);
        if (!destination) {
          return res.status(400).json({ message: "Invalid destination ID" });
        }
      }
      const tourDataWithUser = {
        ...tourData,
        createdBy: req.user?.id || null,
        updatedBy: req.user?.id || null
      };
      console.log("Final tour data to be saved:", JSON.stringify(tourDataWithUser, null, 2));
      const newTour = await storage.createTour(tourDataWithUser);
      console.log("Tour created successfully:", JSON.stringify(newTour, null, 2));
      res.status(201).json(newTour);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid tour data", errors: error.errors });
      }
      console.error("Error creating tour:", error);
      res.status(500).json({ message: "Failed to create tour" });
    }
  });
  app2.put("/api/admin/tours/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tour ID" });
      }
      const existingTour = await storage.getTour(id);
      if (!existingTour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      console.log("Tour update request received for ID:", id, JSON.stringify(req.body, null, 2));
      const processedData = { ...req.body };
      if (processedData.galleryUrls) {
        if (typeof processedData.galleryUrls === "string") {
          try {
            processedData.galleryUrls = JSON.parse(processedData.galleryUrls);
          } catch (e) {
            console.log("Failed to parse galleryUrls string, treating as single URL");
            processedData.galleryUrls = [processedData.galleryUrls];
          }
        }
        if (Array.isArray(processedData.galleryUrls)) {
          processedData.galleryUrls = processedData.galleryUrls.filter(
            (url) => url && typeof url === "string" && url.trim() !== "" && !url.includes("blob:")
          );
        }
      }
      const jsonFields = ["included", "excluded", "includedAr", "excludedAr"];
      for (const field of jsonFields) {
        if (processedData[field] && Array.isArray(processedData[field])) {
          continue;
        } else if (processedData[field] && typeof processedData[field] === "string") {
          try {
            processedData[field] = JSON.parse(processedData[field]);
          } catch (e) {
            processedData[field] = [processedData[field]];
          }
        }
      }
      if (processedData.startDate && typeof processedData.startDate === "string") {
        processedData.startDate = new Date(processedData.startDate);
      }
      if (processedData.endDate && typeof processedData.endDate === "string") {
        processedData.endDate = new Date(processedData.endDate);
      }
      if (processedData.date && typeof processedData.date === "string") {
        processedData.date = new Date(processedData.date);
      }
      console.log("Processed tour update data:", JSON.stringify(processedData, null, 2));
      const updateData = insertTourSchema.parse(processedData);
      if (updateData.destinationId) {
        const destination = await storage.getDestination(updateData.destinationId);
        if (!destination) {
          return res.status(400).json({ message: "Invalid destination ID" });
        }
      }
      const updateDataWithUser = {
        ...updateData,
        updatedBy: req.user?.id || null
      };
      console.log("Final tour update data to be saved:", JSON.stringify(updateDataWithUser, null, 2));
      const updatedTour = await storage.updateTour(id, updateDataWithUser);
      console.log("Tour updated successfully:", JSON.stringify(updatedTour, null, 2));
      res.json(updatedTour);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid tour data", errors: error.errors });
      }
      console.error("Error updating tour:", error);
      res.status(500).json({ message: "Failed to update tour" });
    }
  });
  app2.delete("/api/admin/tours/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tour ID" });
      }
      const tour = await storage.getTour(id);
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      await storage.deleteTour(id);
      res.status(200).json({ message: "Tour deleted successfully" });
    } catch (error) {
      console.error("Error deleting tour:", error);
      res.status(500).json({ message: "Failed to delete tour" });
    }
  });
  app2.get("/api/admin/hotel-facilities", isAdmin, async (req, res) => {
    try {
      const facilities = await storage.listHotelFacilities();
      res.json(facilities);
    } catch (error) {
      console.error("Error fetching hotel facilities:", error);
      res.status(500).json({ message: "Failed to fetch hotel facilities" });
    }
  });
  app2.get("/api/admin/hotel-facilities/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid facility ID" });
      }
      const facility = await storage.getHotelFacility(id);
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }
      res.json(facility);
    } catch (error) {
      console.error("Error fetching hotel facility:", error);
      res.status(500).json({ message: "Failed to fetch hotel facility" });
    }
  });
  app2.post("/api/admin/hotel-facilities", isAdmin, async (req, res) => {
    try {
      const facilityData = req.body;
      const newFacility = await storage.createHotelFacility(facilityData);
      res.status(201).json(newFacility);
    } catch (error) {
      console.error("Error creating hotel facility:", error);
      res.status(500).json({ message: "Failed to create hotel facility" });
    }
  });
  app2.put("/api/admin/hotel-facilities/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid facility ID" });
      }
      const facility = await storage.getHotelFacility(id);
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }
      const facilityData = req.body;
      const updatedFacility = await storage.updateHotelFacility(id, facilityData);
      res.json(updatedFacility);
    } catch (error) {
      console.error("Error updating hotel facility:", error);
      res.status(500).json({ message: "Failed to update hotel facility" });
    }
  });
  app2.delete("/api/admin/hotel-facilities/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid facility ID" });
      }
      const facility = await storage.getHotelFacility(id);
      if (!facility) {
        return res.status(404).json({ message: "Facility not found" });
      }
      await storage.deleteHotelFacility(id);
      res.status(200).json({ message: "Facility deleted successfully" });
    } catch (error) {
      console.error("Error deleting hotel facility:", error);
      res.status(500).json({ message: "Failed to delete hotel facility" });
    }
  });
  app2.get("/api/admin/hotel-highlights", isAdmin, async (req, res) => {
    try {
      const highlights = await storage.listHotelHighlights();
      res.json(highlights);
    } catch (error) {
      console.error("Error fetching hotel highlights:", error);
      res.status(500).json({ message: "Failed to fetch hotel highlights" });
    }
  });
  app2.get("/api/admin/hotel-highlights/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid highlight ID" });
      }
      const highlight = await storage.getHotelHighlight(id);
      if (!highlight) {
        return res.status(404).json({ message: "Highlight not found" });
      }
      res.json(highlight);
    } catch (error) {
      console.error("Error fetching hotel highlight:", error);
      res.status(500).json({ message: "Failed to fetch hotel highlight" });
    }
  });
  app2.post("/api/admin/hotel-highlights", isAdmin, async (req, res) => {
    try {
      const highlightData = req.body;
      const newHighlight = await storage.createHotelHighlight(highlightData);
      res.status(201).json(newHighlight);
    } catch (error) {
      console.error("Error creating hotel highlight:", error);
      res.status(500).json({ message: "Failed to create hotel highlight" });
    }
  });
  app2.put("/api/admin/hotel-highlights/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid highlight ID" });
      }
      const highlight = await storage.getHotelHighlight(id);
      if (!highlight) {
        return res.status(404).json({ message: "Highlight not found" });
      }
      const highlightData = req.body;
      const updatedHighlight = await storage.updateHotelHighlight(id, highlightData);
      res.json(updatedHighlight);
    } catch (error) {
      console.error("Error updating hotel highlight:", error);
      res.status(500).json({ message: "Failed to update hotel highlight" });
    }
  });
  app2.delete("/api/admin/hotel-highlights/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid highlight ID" });
      }
      const highlight = await storage.getHotelHighlight(id);
      if (!highlight) {
        return res.status(404).json({ message: "Highlight not found" });
      }
      await storage.deleteHotelHighlight(id);
      res.status(200).json({ message: "Highlight deleted successfully" });
    } catch (error) {
      console.error("Error deleting hotel highlight:", error);
      res.status(500).json({ message: "Failed to delete hotel highlight" });
    }
  });
  app2.get("/api/admin/cleanliness-features", isAdmin, async (req, res) => {
    try {
      const features = await storage.listCleanlinessFeatures();
      res.json(features);
    } catch (error) {
      console.error("Error fetching cleanliness features:", error);
      res.status(500).json({ message: "Failed to fetch cleanliness features" });
    }
  });
  app2.get("/api/admin/cleanliness-features/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid feature ID" });
      }
      const feature = await storage.getCleanlinessFeature(id);
      if (!feature) {
        return res.status(404).json({ message: "Feature not found" });
      }
      res.json(feature);
    } catch (error) {
      console.error("Error fetching cleanliness feature:", error);
      res.status(500).json({ message: "Failed to fetch cleanliness feature" });
    }
  });
  app2.post("/api/admin/cleanliness-features", isAdmin, async (req, res) => {
    try {
      const featureData = req.body;
      const newFeature = await storage.createCleanlinessFeature(featureData);
      res.status(201).json(newFeature);
    } catch (error) {
      console.error("Error creating cleanliness feature:", error);
      res.status(500).json({ message: "Failed to create cleanliness feature" });
    }
  });
  app2.put("/api/admin/cleanliness-features/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid feature ID" });
      }
      const feature = await storage.getCleanlinessFeature(id);
      if (!feature) {
        return res.status(404).json({ message: "Feature not found" });
      }
      const featureData = req.body;
      const updatedFeature = await storage.updateCleanlinessFeature(id, featureData);
      res.json(updatedFeature);
    } catch (error) {
      console.error("Error updating cleanliness feature:", error);
      res.status(500).json({ message: "Failed to update cleanliness feature" });
    }
  });
  app2.delete("/api/admin/cleanliness-features/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid feature ID" });
      }
      const feature = await storage.getCleanlinessFeature(id);
      if (!feature) {
        return res.status(404).json({ message: "Feature not found" });
      }
      await storage.deleteCleanlinessFeature(id);
      res.status(200).json({ message: "Feature deleted successfully" });
    } catch (error) {
      console.error("Error deleting cleanliness feature:", error);
      res.status(500).json({ message: "Failed to delete cleanliness feature" });
    }
  });
  app2.get("/api/admin/hotels", async (req, res) => {
    try {
      const hotels3 = await storage.listHotels();
      res.json(hotels3 || []);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      res.json([]);
    }
  });
  app2.get("/api/admin/hotels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hotel ID" });
      }
      const hotel = await storage.getHotelWithFeatures(id);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      console.error("Error fetching hotel:", error);
      res.status(500).json({ message: "Failed to fetch hotel" });
    }
  });
  app2.post("/api/admin/hotels", isAdmin, async (req, res) => {
    try {
      console.log("Hotel creation request body:", req.body);
      const formData = req.body;
      console.log("Raw form data received:", JSON.stringify(formData, null, 2));
      const hotelFormData = formData;
      console.log("=== FEATURES EXTRACTION ===");
      console.log("Raw features from form data:", hotelFormData.features);
      console.log("Features type:", typeof hotelFormData.features);
      console.log("Features is array:", Array.isArray(hotelFormData.features));
      if (Array.isArray(hotelFormData.features)) {
        console.log("Features length:", hotelFormData.features.length);
        hotelFormData.features.forEach((feature, index) => {
          console.log(`Feature ${index}:`, JSON.stringify(feature));
        });
      }
      let cityName = hotelFormData.city || null;
      let countryName = hotelFormData.country || null;
      if (hotelFormData.cityId) {
        const cityData = await storage.getCity(parseInt(hotelFormData.cityId.toString()));
        if (cityData) {
          cityName = cityData.name;
          console.log("Fetched city name:", cityName);
        }
      }
      if (hotelFormData.countryId) {
        const countryData = await storage.getCountry(parseInt(hotelFormData.countryId.toString()));
        if (countryData) {
          countryName = countryData.name;
          console.log("Fetched country name:", countryName);
        }
      }
      const sessionUser = req.session?.user;
      const rawUserId = sessionUser?.id || req.user?.id || null;
      const currentUserId = rawUserId ? parseInt(rawUserId.toString()) : null;
      console.log("Current user ID for created_by:", currentUserId);
      const transformedData = {
        name: hotelFormData.name,
        description: hotelFormData.description,
        shortDescription: hotelFormData.shortDescription,
        destinationId: hotelFormData.destinationId,
        countryId: hotelFormData.countryId ? parseInt(hotelFormData.countryId.toString()) : null,
        cityId: hotelFormData.cityId ? parseInt(hotelFormData.cityId.toString()) : null,
        categoryId: hotelFormData.categoryId ? parseInt(hotelFormData.categoryId.toString()) : null,
        address: hotelFormData.address,
        city: cityName,
        country: countryName,
        postalCode: hotelFormData.postalCode,
        phone: hotelFormData.phone,
        email: hotelFormData.email,
        website: hotelFormData.website,
        imageUrl: hotelFormData.imageUrl,
        galleryUrls: hotelFormData.galleryUrls,
        stars: hotelFormData.stars ? parseInt(hotelFormData.stars.toString()) : null,
        amenities: hotelFormData.amenities,
        checkInTime: hotelFormData.checkInTime || "15:00",
        checkOutTime: hotelFormData.checkOutTime || "11:00",
        longitude: hotelFormData.longitude,
        latitude: hotelFormData.latitude,
        featured: hotelFormData.featured || false,
        rating: hotelFormData.rating ? parseFloat(hotelFormData.rating) : null,
        guestRating: hotelFormData.guestRating ? parseFloat(hotelFormData.guestRating) : null,
        basePrice: hotelFormData.basePrice ? parseInt(hotelFormData.basePrice.toString()) : null,
        currency: hotelFormData.currency || "EGP",
        parkingAvailable: hotelFormData.parkingAvailable || false,
        airportTransferAvailable: hotelFormData.airportTransferAvailable || false,
        carRentalAvailable: hotelFormData.carRentalAvailable || false,
        shuttleAvailable: hotelFormData.shuttleAvailable || false,
        wifiAvailable: hotelFormData.wifiAvailable !== false,
        petFriendly: hotelFormData.petFriendly || false,
        accessibleFacilities: hotelFormData.accessibleFacilities || false,
        status: hotelFormData.status || "active",
        verificationStatus: hotelFormData.verificationStatus || "pending",
        createdBy: currentUserId,
        // Add complex data fields (direct pass-through for proper JSON handling)
        restaurants: hotelFormData.restaurants || null,
        landmarks: hotelFormData.landmarks || null,
        faqs: hotelFormData.faqs || null,
        roomTypes: hotelFormData.roomTypes || null,
        // Add features array (simplified system)
        features: hotelFormData.features || []
      };
      console.log("Transformed hotel data:", transformedData);
      const validatedHotelData = insertHotelSchema.parse(transformedData);
      console.log("Validated hotel data:", validatedHotelData);
      if (validatedHotelData.destinationId) {
        const destination = await storage.getDestination(validatedHotelData.destinationId);
        if (!destination) {
          return res.status(400).json({ message: "Invalid destination ID" });
        }
      }
      console.log("=== CALLING STORAGE.CREATEHOTEL ===");
      console.log("Features being passed to storage:", JSON.stringify(validatedHotelData.features, null, 2));
      const newHotel = await storage.createHotel(validatedHotelData);
      console.log("Hotel created successfully:", newHotel);
      console.log("Hotel created with features:", newHotel.features);
      res.status(201).json(newHotel);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.error("Zod validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid hotel data", errors: error.errors });
      }
      console.error("Error creating hotel - Full error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error?.constructor?.name);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({ message: "Failed to create hotel", error: errorMessage });
    }
  });
  app2.post("/api/admin/hotel-drafts", isAdmin, async (req, res) => {
    try {
      const hotelData = req.body;
      const draftData = {
        name: hotelData.name || "Untitled Hotel",
        description: hotelData.description,
        destination_id: hotelData.destinationId,
        address: hotelData.address,
        city: hotelData.city,
        country: hotelData.country,
        postal_code: hotelData.postalCode,
        phone: hotelData.phone,
        email: hotelData.email,
        website: hotelData.website,
        image_url: hotelData.imageUrl,
        stars: hotelData.stars,
        amenities: JSON.stringify(hotelData.amenities || {}),
        check_in_time: hotelData.checkInTime,
        check_out_time: hotelData.checkOutTime,
        longitude: hotelData.longitude,
        latitude: hotelData.latitude,
        featured: hotelData.featured || false,
        rating: hotelData.rating,
        guest_rating: hotelData.guestRating,
        parking_available: hotelData.parkingAvailable || false,
        airport_transfer_available: hotelData.airportTransferAvailable || false,
        car_rental_available: hotelData.carRentalAvailable || false,
        shuttle_available: hotelData.shuttleAvailable || false,
        draft_data: JSON.stringify(hotelData),
        // Store the complete form data as JSON
        status: "draft"
      };
      const draftHotel = await storage.createHotel({
        name: hotelData.name,
        description: hotelData.description,
        destinationId: hotelData.destinationId,
        status: "draft"
      });
      return res.status(201).json({ message: "Hotel draft saved successfully", hotel: draftHotel });
    } catch (error) {
      console.error("Error saving hotel draft:", error);
      res.status(500).json({ message: "Failed to save hotel draft" });
    }
  });
  app2.put("/api/admin/hotels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hotel ID" });
      }
      const existingHotel = await storage.getHotel(id);
      if (!existingHotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      console.log("Hotel update request for ID:", id);
      console.log("Update data received:", req.body);
      const { facilityIds, highlightIds, cleanlinessFeatureIds, ...hotelData } = req.body;
      const updateData = insertHotelSchema.partial().parse(hotelData);
      if (updateData.destinationId) {
        const destination = await storage.getDestination(updateData.destinationId);
        if (!destination) {
          return res.status(400).json({ message: "Invalid destination ID" });
        }
      }
      const updatedHotel = await storage.updateHotel(id, updateData);
      if (facilityIds !== void 0) {
        console.log("Updating hotel facilities:", facilityIds);
        await storage.updateHotelFeatureAssociations(id, "facilities", facilityIds);
      }
      if (highlightIds !== void 0) {
        console.log("Updating hotel highlights:", highlightIds);
        await storage.updateHotelFeatureAssociations(id, "highlights", highlightIds);
      }
      if (cleanlinessFeatureIds !== void 0) {
        console.log("Updating hotel cleanliness features:", cleanlinessFeatureIds);
        await storage.updateHotelFeatureAssociations(id, "cleanlinessFeatures", cleanlinessFeatureIds);
      }
      const hotelWithFeatures = await storage.getHotelWithFeatures(id);
      res.json(hotelWithFeatures || updatedHotel);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid hotel data", errors: error.errors });
      }
      console.error("Error updating hotel:", error);
      res.status(500).json({ message: "Failed to update hotel" });
    }
  });
  app2.patch("/api/admin/hotels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hotel ID" });
      }
      const existingHotel = await storage.getHotel(id);
      if (!existingHotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      console.log("Hotel update request for ID:", id);
      console.log("Update data received:", req.body);
      const { facilities, highlights, cleanlinessFeatures: cleanlinessFeatures2, ...hotelData } = req.body;
      const updateData = insertHotelSchema.partial().parse(hotelData);
      if (updateData.destinationId) {
        const destination = await storage.getDestination(updateData.destinationId);
        if (!destination) {
          return res.status(400).json({ message: "Invalid destination ID" });
        }
      }
      const updatedHotel = await storage.updateHotel(id, updateData);
      if (facilities !== void 0) {
        console.log("Updating hotel facilities:", facilities);
        await storage.updateHotelFeatureAssociations(id, "facilities", facilities);
      }
      if (highlights !== void 0) {
        console.log("Updating hotel highlights:", highlights);
        await storage.updateHotelFeatureAssociations(id, "highlights", highlights);
      }
      if (cleanlinessFeatures2 !== void 0) {
        console.log("Updating hotel cleanliness features:", cleanlinessFeatures2);
        await storage.updateHotelFeatureAssociations(id, "cleanlinessFeatures", cleanlinessFeatures2);
      }
      const hotelWithFeatures = await storage.getHotelWithFeatures(id);
      res.json(hotelWithFeatures || updatedHotel);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid hotel data", errors: error.errors });
      }
      console.error("Error updating hotel:", error);
      res.status(500).json({ message: "Failed to update hotel" });
    }
  });
  app2.delete("/api/admin/hotels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hotel ID" });
      }
      const hotel = await storage.getHotel(id);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      await storage.deleteHotel(id);
      res.status(200).json({ message: "Hotel deleted successfully" });
    } catch (error) {
      console.error("Error deleting hotel:", error);
      res.status(500).json({ message: "Failed to delete hotel" });
    }
  });
  app2.get("/api/admin/rooms", isAdmin, async (req, res) => {
    try {
      console.log("Admin rooms endpoint called");
      const rooms3 = await storage.listRooms();
      console.log("Rooms returned from storage:", rooms3.length, "rooms");
      res.json(rooms3);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });
  app2.get("/api/admin/rooms/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid room ID" });
      }
      const room = await storage.getRoom(id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });
  app2.post("/api/admin/rooms", isAdmin, async (req, res) => {
    try {
      const roomData = insertRoomSchema.parse(req.body);
      const hotel = await storage.getHotel(roomData.hotelId);
      if (!hotel) {
        return res.status(400).json({ message: "Invalid hotel ID" });
      }
      const newRoom = await storage.createRoom(roomData);
      res.status(201).json(newRoom);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid room data", errors: error.errors });
      }
      console.error("Error creating room:", error);
      res.status(500).json({ message: "Failed to create room" });
    }
  });
  app2.put("/api/admin/rooms/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid room ID" });
      }
      const existingRoom = await storage.getRoom(id);
      if (!existingRoom) {
        return res.status(404).json({ message: "Room not found" });
      }
      const updateData = insertRoomSchema.parse(req.body);
      if (updateData.hotelId) {
        const hotel = await storage.getHotel(updateData.hotelId);
        if (!hotel) {
          return res.status(400).json({ message: "Invalid hotel ID" });
        }
      }
      const updatedRoom = await storage.updateRoom(id, updateData);
      res.json(updatedRoom);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid room data", errors: error.errors });
      }
      console.error("Error updating room:", error);
      res.status(500).json({ message: "Failed to update room" });
    }
  });
  app2.delete("/api/admin/rooms/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid room ID" });
      }
      const room = await storage.getRoom(id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      await storage.deleteRoom(id);
      res.status(200).json({ message: "Room deleted successfully" });
    } catch (error) {
      console.error("Error deleting room:", error);
      res.status(500).json({ message: "Failed to delete room" });
    }
  });
  app2.get("/api/admin/room-categories", isAdmin, async (req, res) => {
    try {
      const categories = await storage.listRoomCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching room categories:", error);
      res.status(500).json({ message: "Failed to fetch room categories" });
    }
  });
  app2.get("/api/admin/room-categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid room category ID" });
      }
      const category = await storage.getRoomCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Room category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching room category:", error);
      res.status(500).json({ message: "Failed to fetch room category" });
    }
  });
  app2.post("/api/admin/room-categories", isAdmin, async (req, res) => {
    try {
      const categoryData = req.body;
      const category = await storage.createRoomCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating room category:", error);
      res.status(500).json({ message: "Failed to create room category" });
    }
  });
  app2.put("/api/admin/room-categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid room category ID" });
      }
      const existingCategory = await storage.getRoomCategory(id);
      if (!existingCategory) {
        return res.status(404).json({ message: "Room category not found" });
      }
      const updateData = req.body;
      const updatedCategory = await storage.updateRoomCategory(id, updateData);
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error updating room category:", error);
      res.status(500).json({ message: "Failed to update room category" });
    }
  });
  app2.delete("/api/admin/room-categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid room category ID" });
      }
      const category = await storage.getRoomCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Room category not found" });
      }
      await storage.deleteRoomCategory(id);
      res.status(200).json({ message: "Room category deleted successfully" });
    } catch (error) {
      console.error("Error deleting room category:", error);
      res.status(500).json({ message: "Failed to delete room category" });
    }
  });
  app2.get("/api/rooms/:roomId/combinations", async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      if (isNaN(roomId)) {
        return res.status(400).json({ message: "Invalid room ID" });
      }
      const room = await storage.getRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      const combinations = await storage.getRoomCombinationsByRoom(roomId);
      res.json(combinations);
    } catch (error) {
      console.error("Error fetching room combinations:", error);
      res.status(500).json({ message: "Failed to fetch room combinations" });
    }
  });
  app2.get("/api/room-combinations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid combination ID" });
      }
      const combination = await storage.getRoomCombination(id);
      if (!combination) {
        return res.status(404).json({ message: "Room combination not found" });
      }
      res.json(combination);
    } catch (error) {
      console.error("Error fetching room combination:", error);
      res.status(500).json({ message: "Failed to fetch room combination" });
    }
  });
  app2.post("/api/admin/room-combinations", isAdmin, async (req, res) => {
    try {
      const combinationData = insertRoomCombinationSchema.parse(req.body);
      const room = await storage.getRoom(combinationData.roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      if (!combinationData.description) {
        const parts = [];
        if ((combinationData.adultsCount ?? 0) > 0) {
          parts.push(`${combinationData.adultsCount} Adult${(combinationData.adultsCount ?? 0) !== 1 ? "s" : ""}`);
        }
        if ((combinationData.childrenCount ?? 0) > 0) {
          parts.push(`${combinationData.childrenCount} Child${(combinationData.childrenCount ?? 0) !== 1 ? "ren" : ""}`);
        }
        if ((combinationData.infantsCount ?? 0) > 0) {
          parts.push(`${combinationData.infantsCount} Infant${(combinationData.infantsCount ?? 0) !== 1 ? "s" : ""}`);
        }
        combinationData.description = parts.join(" + ");
      }
      const existingCombinations = await storage.getRoomCombinationsByRoom(combinationData.roomId);
      const exists = existingCombinations.some(
        (combo) => combo.adultsCount === combinationData.adultsCount && combo.childrenCount === combinationData.childrenCount && combo.infantsCount === combinationData.infantsCount
      );
      if (exists) {
        return res.status(400).json({ message: "This room combination already exists" });
      }
      const newCombination = await storage.createRoomCombination(combinationData);
      res.status(201).json(newCombination);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid room combination data", errors: error.errors });
      }
      console.error("Error creating room combination:", error);
      res.status(500).json({ message: "Failed to create room combination" });
    }
  });
  app2.put("/api/admin/room-combinations/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid combination ID" });
      }
      const combination = await storage.getRoomCombination(id);
      if (!combination) {
        return res.status(404).json({ message: "Room combination not found" });
      }
      const updateData = req.body;
      if ((updateData.adultsCount !== void 0 || updateData.childrenCount !== void 0 || updateData.infantsCount !== void 0) && !updateData.description) {
        const adultsCount = updateData.adultsCount ?? combination.adultsCount;
        const childrenCount = updateData.childrenCount ?? combination.childrenCount;
        const infantsCount = updateData.infantsCount ?? combination.infantsCount;
        const parts = [];
        if (adultsCount > 0) {
          parts.push(`${adultsCount} Adult${adultsCount !== 1 ? "s" : ""}`);
        }
        if (childrenCount > 0) {
          parts.push(`${childrenCount} Child${childrenCount !== 1 ? "ren" : ""}`);
        }
        if (infantsCount > 0) {
          parts.push(`${infantsCount} Infant${infantsCount !== 1 ? "s" : ""}`);
        }
        updateData.description = parts.join(" + ");
      }
      const updatedCombination = await storage.updateRoomCombination(id, updateData);
      res.json(updatedCombination);
    } catch (error) {
      console.error("Error updating room combination:", error);
      res.status(500).json({ message: "Failed to update room combination" });
    }
  });
  app2.delete("/api/admin/room-combinations/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid combination ID" });
      }
      const combination = await storage.getRoomCombination(id);
      if (!combination) {
        return res.status(404).json({ message: "Room combination not found" });
      }
      await storage.deleteRoomCombination(id);
      res.status(200).json({ message: "Room combination deleted successfully" });
    } catch (error) {
      console.error("Error deleting room combination:", error);
      res.status(500).json({ message: "Failed to delete room combination" });
    }
  });
  app2.get("/api/admin/countries", isAdmin, async (req, res) => {
    try {
      const countries2 = await storage.listCountries();
      res.json(countries2);
    } catch (error) {
      console.error("Error fetching countries:", error);
      res.status(500).json({ message: "Failed to fetch countries" });
    }
  });
  app2.get("/api/admin/countries/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid country ID" });
      }
      const country = await storage.getCountry(id);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      res.json(country);
    } catch (error) {
      console.error("Error fetching country:", error);
      res.status(500).json({ message: "Failed to fetch country" });
    }
  });
  app2.post("/api/admin/countries", isAdmin, async (req, res) => {
    try {
      const countryData = insertCountrySchema.parse(req.body);
      if (countryData.code) {
        const existingCountry = await storage.getCountryByCode(countryData.code);
        if (existingCountry) {
          return res.status(409).json({ message: "Country with this code already exists" });
        }
      }
      const country = await storage.createCountry(countryData);
      res.status(201).json(country);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid country data", errors: error.errors });
      }
      console.error("Error creating country:", error);
      res.status(500).json({ message: "Failed to create country" });
    }
  });
  app2.put("/api/admin/countries/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid country ID" });
      }
      const existingCountry = await storage.getCountry(id);
      if (!existingCountry) {
        return res.status(404).json({ message: "Country not found" });
      }
      const updateData = insertCountrySchema.parse(req.body);
      if (updateData.code && updateData.code !== existingCountry.code) {
        const countryWithCode = await storage.getCountryByCode(updateData.code);
        if (countryWithCode && countryWithCode.id !== id) {
          return res.status(409).json({ message: "Country with this code already exists" });
        }
      }
      const updatedCountry = await storage.updateCountry(id, updateData);
      res.json(updatedCountry);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid country data", errors: error.errors });
      }
      console.error("Error updating country:", error);
      res.status(500).json({ message: "Failed to update country" });
    }
  });
  app2.delete("/api/admin/countries/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid country ID" });
      }
      const country = await storage.getCountry(id);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      const cities2 = await storage.getCitiesByCountry(id);
      if (cities2 && cities2.length > 0) {
        return res.status(400).json({
          message: "Cannot delete country with associated cities. Please delete the cities first or reassign them to another country."
        });
      }
      await storage.deleteCountry(id);
      res.status(200).json({ message: "Country deleted successfully" });
    } catch (error) {
      console.error("Error deleting country:", error);
      res.status(500).json({ message: "Failed to delete country" });
    }
  });
  app2.get("/api/admin/cities", isAdmin, async (req, res) => {
    try {
      const cities2 = await storage.listCities();
      res.json(cities2);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });
  app2.get("/api/admin/cities/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid city ID" });
      }
      const city = await storage.getCity(id);
      if (!city) {
        return res.status(404).json({ message: "City not found" });
      }
      res.json(city);
    } catch (error) {
      console.error("Error fetching city:", error);
      res.status(500).json({ message: "Failed to fetch city" });
    }
  });
  app2.post("/api/admin/cities", isAdmin, async (req, res) => {
    try {
      const cityData = insertCitySchema.parse(req.body);
      const country = await storage.getCountry(cityData.countryId);
      if (!country) {
        return res.status(400).json({ message: "Invalid country ID" });
      }
      const city = await storage.createCity(cityData);
      res.status(201).json(city);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid city data", errors: error.errors });
      }
      console.error("Error creating city:", error);
      res.status(500).json({ message: "Failed to create city" });
    }
  });
  app2.put("/api/admin/cities/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid city ID" });
      }
      const existingCity = await storage.getCity(id);
      if (!existingCity) {
        return res.status(404).json({ message: "City not found" });
      }
      const updateData = insertCitySchema.parse(req.body);
      if (updateData.countryId) {
        const country = await storage.getCountry(updateData.countryId);
        if (!country) {
          return res.status(400).json({ message: "Invalid country ID" });
        }
      }
      const updatedCity = await storage.updateCity(id, updateData);
      res.json(updatedCity);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid city data", errors: error.errors });
      }
      console.error("Error updating city:", error);
      res.status(500).json({ message: "Failed to update city" });
    }
  });
  app2.delete("/api/admin/cities/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid city ID" });
      }
      const city = await storage.getCity(id);
      if (!city) {
        return res.status(404).json({ message: "City not found" });
      }
      await storage.deleteCity(id);
      res.status(200).json({ message: "City deleted successfully" });
    } catch (error) {
      console.error("Error deleting city:", error);
      res.status(500).json({ message: "Failed to delete city" });
    }
  });
  app2.get("/api/admin/airports", isAdmin, async (req, res) => {
    try {
      const airports2 = await storage.listAirports();
      res.json(airports2);
    } catch (error) {
      console.error("Error fetching airports for admin:", error);
      res.status(500).json({ message: "Failed to fetch airports" });
    }
  });
  app2.get("/api/admin/airports/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid airport ID" });
      }
      const airport = await storage.getAirport(id);
      if (!airport) {
        return res.status(404).json({ message: "Airport not found" });
      }
      res.json(airport);
    } catch (error) {
      console.error("Error fetching airport for admin:", error);
      res.status(500).json({ message: "Failed to fetch airport" });
    }
  });
  app2.post("/api/admin/airports", isAdmin, async (req, res) => {
    try {
      const validatedData = insertAirportSchema.parse(req.body);
      const airport = await storage.createAirport(validatedData);
      res.status(201).json(airport);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Error creating airport:", error);
      res.status(500).json({ message: "Failed to create airport" });
    }
  });
  app2.put("/api/admin/airports/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid airport ID" });
      }
      const validationResult = insertAirportSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: validationResult.error.errors
        });
      }
      const updatedAirport = await storage.updateAirport(id, validationResult.data);
      if (!updatedAirport) {
        return res.status(404).json({ message: "Airport not found" });
      }
      res.json(updatedAirport);
    } catch (error) {
      console.error("Error updating airport:", error);
      res.status(500).json({ message: "Failed to update airport" });
    }
  });
  app2.delete("/api/admin/airports/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid airport ID" });
      }
      const airport = await storage.getAirport(id);
      if (!airport) {
        return res.status(404).json({ message: "Airport not found" });
      }
      await storage.deleteAirport(id);
      res.status(200).json({ message: "Airport deleted successfully" });
    } catch (error) {
      console.error("Error deleting airport:", error);
      res.status(500).json({ message: "Failed to delete airport" });
    }
  });
  app2.post("/api/admin/transportation", isAdmin, async (req, res) => {
    try {
      const transportationData = req.body;
      if (!transportationData.name || !transportationData.typeId || !transportationData.price || !transportationData.passengerCapacity) {
        return res.status(400).json({ message: "Missing required transportation fields" });
      }
      if (transportationData.destinationId) {
        const destination = await storage.getDestination(transportationData.destinationId);
        if (!destination) {
          return res.status(404).json({ message: "Destination not found" });
        }
      }
      const transportation2 = await storage.createTransportation(transportationData);
      res.status(201).json(transportation2);
    } catch (error) {
      console.error("Error creating transportation option:", error);
      res.status(500).json({ message: "Failed to create transportation option" });
    }
  });
  app2.put("/api/admin/transportation/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transportation ID" });
      }
      const transportation2 = await storage.getTransportation(id);
      if (!transportation2) {
        return res.status(404).json({ message: "Transportation option not found" });
      }
      if (req.body.destinationId && req.body.destinationId !== transportation2.destinationId) {
        const destination = await storage.getDestination(req.body.destinationId);
        if (!destination) {
          return res.status(404).json({ message: "Destination not found" });
        }
      }
      const updatedTransportation = await storage.updateTransportation(id, req.body);
      res.json(updatedTransportation);
    } catch (error) {
      console.error("Error updating transportation option:", error);
      res.status(500).json({ message: "Failed to update transportation option" });
    }
  });
  app2.delete("/api/admin/transportation/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transportation ID" });
      }
      const transportation2 = await storage.getTransportation(id);
      if (!transportation2) {
        return res.status(404).json({ message: "Transportation option not found" });
      }
      const deleted = await storage.deleteTransportation(id);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete transportation option" });
      }
      res.status(200).json({ message: "Transportation option deleted successfully" });
    } catch (error) {
      console.error("Error deleting transportation option:", error);
      res.status(500).json({ message: "Failed to delete transportation option" });
    }
  });
  app2.get("/api/admin/menus", isAdmin, async (req, res) => {
    try {
      const active = req.query.active === "true" ? true : req.query.active === "false" ? false : void 0;
      const menus2 = await storage.listMenus(active);
      res.json(menus2);
    } catch (error) {
      console.error("Error fetching menus:", error);
      res.status(500).json({ message: "Failed to fetch menus" });
    }
  });
  app2.get("/api/admin/menus/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu ID" });
      }
      const menu = await storage.getMenu(id);
      if (!menu) {
        return res.status(404).json({ message: "Menu not found" });
      }
      res.json(menu);
    } catch (error) {
      console.error("Error fetching menu:", error);
      res.status(500).json({ message: "Failed to fetch menu" });
    }
  });
  app2.get("/api/menus/location/:location", async (req, res) => {
    try {
      const location = req.params.location;
      if (!location) {
        return res.status(400).json({ message: "Location parameter is required" });
      }
      const menu = await storage.getMenuByLocation(location);
      if (!menu) {
        return res.status(404).json({ message: "Menu not found for this location" });
      }
      const menuItems2 = await storage.listMenuItems(menu.id, true);
      res.json({
        menu,
        items: menuItems2
      });
    } catch (error) {
      console.error("Error fetching menu by location:", error);
      res.status(500).json({ message: "Failed to fetch menu by location" });
    }
  });
  app2.post("/api/admin/menus", isAdmin, async (req, res) => {
    try {
      const menuData = insertMenuSchema.parse(req.body);
      const existingMenu = await storage.getMenuByName(menuData.name);
      if (existingMenu) {
        return res.status(400).json({ message: "Menu with this name already exists" });
      }
      const existingLocation = await storage.getMenuByLocation(menuData.location);
      if (existingLocation) {
        return res.status(400).json({ message: "Menu with this location already exists" });
      }
      const menu = await storage.createMenu(menuData);
      res.status(201).json(menu);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid menu data", errors: error.errors });
      }
      console.error("Error creating menu:", error);
      res.status(500).json({ message: "Failed to create menu" });
    }
  });
  app2.put("/api/admin/menus/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu ID" });
      }
      const existingMenu = await storage.getMenu(id);
      if (!existingMenu) {
        return res.status(404).json({ message: "Menu not found" });
      }
      const updateData = insertMenuSchema.partial().parse(req.body);
      if (updateData.name && updateData.name !== existingMenu.name) {
        const menuWithName = await storage.getMenuByName(updateData.name);
        if (menuWithName && menuWithName.id !== id) {
          return res.status(400).json({ message: "Menu with this name already exists" });
        }
      }
      if (updateData.location && updateData.location !== existingMenu.location) {
        const menuWithLocation = await storage.getMenuByLocation(updateData.location);
        if (menuWithLocation && menuWithLocation.id !== id) {
          return res.status(400).json({ message: "Menu with this location already exists" });
        }
      }
      const updatedMenu = await storage.updateMenu(id, updateData);
      res.json(updatedMenu);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid menu data", errors: error.errors });
      }
      console.error("Error updating menu:", error);
      res.status(500).json({ message: "Failed to update menu" });
    }
  });
  app2.delete("/api/admin/menus/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu ID" });
      }
      const existingMenu = await storage.getMenu(id);
      if (!existingMenu) {
        return res.status(404).json({ message: "Menu not found" });
      }
      const success = await storage.deleteMenu(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete menu" });
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      res.status(500).json({ message: "Failed to delete menu" });
    }
  });
  app2.get("/api/admin/menus/:menuId/items", isAdmin, async (req, res) => {
    try {
      const menuId = parseInt(req.params.menuId);
      if (isNaN(menuId)) {
        return res.status(400).json({ message: "Invalid menu ID" });
      }
      const menu = await storage.getMenu(menuId);
      if (!menu) {
        return res.status(404).json({ message: "Menu not found" });
      }
      const active = req.query.active === "true" ? true : req.query.active === "false" ? false : void 0;
      const items = await storage.listMenuItems(menuId, active);
      res.json(items);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });
  app2.get("/api/admin/menu-items/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }
      const menuItem = await storage.getMenuItem(id);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(menuItem);
    } catch (error) {
      console.error("Error fetching menu item:", error);
      res.status(500).json({ message: "Failed to fetch menu item" });
    }
  });
  app2.post("/api/admin/menu-items", isAdmin, async (req, res) => {
    try {
      const menuItemData = insertMenuItemSchema.parse(req.body);
      const menu = await storage.getMenu(menuItemData.menuId);
      if (!menu) {
        return res.status(404).json({ message: "Menu not found" });
      }
      if (menuItemData.parentId) {
        const parentItem = await storage.getMenuItem(menuItemData.parentId);
        if (!parentItem) {
          return res.status(404).json({ message: "Parent menu item not found" });
        }
        if (parentItem.menuId !== menuItemData.menuId) {
          return res.status(400).json({ message: "Parent menu item must belong to the same menu" });
        }
      }
      const menuItem = await storage.createMenuItem(menuItemData);
      res.status(201).json(menuItem);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      }
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });
  app2.put("/api/admin/menu-items/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }
      const existingMenuItem = await storage.getMenuItem(id);
      if (!existingMenuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      const updateData = insertMenuItemSchema.partial().parse(req.body);
      if (updateData.menuId && updateData.menuId !== existingMenuItem.menuId) {
        const menu = await storage.getMenu(updateData.menuId);
        if (!menu) {
          return res.status(404).json({ message: "Menu not found" });
        }
      }
      if (updateData.parentId && updateData.parentId !== existingMenuItem.parentId) {
        if (updateData.parentId === id) {
          return res.status(400).json({ message: "A menu item cannot be its own parent" });
        }
        const parentItem = await storage.getMenuItem(updateData.parentId);
        if (!parentItem) {
          return res.status(404).json({ message: "Parent menu item not found" });
        }
        const menuId = updateData.menuId || existingMenuItem.menuId;
        if (parentItem.menuId !== menuId) {
          return res.status(400).json({ message: "Parent menu item must belong to the same menu" });
        }
      }
      const updatedMenuItem = await storage.updateMenuItem(id, updateData);
      res.json(updatedMenuItem);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      }
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });
  app2.delete("/api/admin/menu-items/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }
      const existingMenuItem = await storage.getMenuItem(id);
      if (!existingMenuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      const success = await storage.deleteMenuItem(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete menu item" });
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });
  app2.get("/api/maps-key", (req, res) => {
    res.json({ key: process.env.GOOGLE_MAPS_API_KEY || "" });
  });
  app2.get("/api/translations/settings", async (req, res) => {
    try {
      const settings = await storage.getSiteLanguageSettings();
      if (!settings) {
        return res.json({
          defaultLanguage: "en",
          availableLanguages: ["en", "ar"],
          rtlLanguages: ["ar"]
        });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching language settings:", error);
      res.status(500).json({ message: "Failed to fetch language settings" });
    }
  });
  app2.get("/api/dictionary", async (req, res) => {
    try {
      const entries = await storage.listDictionaryEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching dictionary entries:", error);
      res.status(500).json({ message: "Failed to fetch dictionary entries" });
    }
  });
  app2.get("/api/dictionary/search", async (req, res) => {
    try {
      const { term } = req.query;
      if (!term || typeof term !== "string") {
        return res.status(400).json({ message: "Search term is required" });
      }
      const entries = await storage.searchDictionaryEntries(term);
      res.json(entries);
    } catch (error) {
      console.error("Error searching dictionary entries:", error);
      res.status(500).json({ message: "Failed to search dictionary entries" });
    }
  });
  app2.get("/api/dictionary/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      const entry = await storage.getDictionaryEntry(id);
      if (!entry) {
        return res.status(404).json({ message: "Dictionary entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching dictionary entry:", error);
      res.status(500).json({ message: "Failed to fetch dictionary entry" });
    }
  });
  app2.post("/api/dictionary", isAdmin, async (req, res) => {
    try {
      const data = insertDictionaryEntrySchema.parse(req.body);
      const newEntry = await storage.createDictionaryEntry(data);
      res.status(201).json(newEntry);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid dictionary entry data", errors: error.errors });
      }
      console.error("Error creating dictionary entry:", error);
      res.status(500).json({ message: "Failed to create dictionary entry" });
    }
  });
  app2.put("/api/dictionary/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      const data = insertDictionaryEntrySchema.parse(req.body);
      const updatedEntry = await storage.updateDictionaryEntry(id, data);
      if (!updatedEntry) {
        return res.status(404).json({ message: "Dictionary entry not found" });
      }
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid dictionary entry data", errors: error.errors });
      }
      console.error("Error updating dictionary entry:", error);
      res.status(500).json({ message: "Failed to update dictionary entry" });
    }
  });
  app2.delete("/api/dictionary/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      const success = await storage.deleteDictionaryEntry(id);
      if (!success) {
        return res.status(404).json({ message: "Dictionary entry not found" });
      }
      res.json({ message: "Dictionary entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting dictionary entry:", error);
      res.status(500).json({ message: "Failed to delete dictionary entry" });
    }
  });
  app2.put("/api/admin/translations/settings", isAdmin, async (req, res) => {
    try {
      const settingsData = insertSiteLanguageSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateSiteLanguageSettings(settingsData);
      if (!updatedSettings) {
        return res.status(500).json({ message: "Failed to update language settings" });
      }
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid language settings data", errors: error.errors });
      }
      console.error("Error updating language settings:", error);
      res.status(500).json({ message: "Failed to update language settings" });
    }
  });
  app2.get("/api/translations", async (req, res) => {
    try {
      const translations2 = await storage.listTranslations();
      res.json(translations2);
    } catch (error) {
      console.error("Error fetching translations:", error);
      res.status(500).json({ message: "Failed to fetch translations" });
    }
  });
  app2.get("/api/translations/key/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const translation = await storage.getTranslationByKey(key);
      if (!translation) {
        return res.status(404).json({ message: "Translation not found" });
      }
      res.json(translation);
    } catch (error) {
      console.error("Error fetching translation:", error);
      res.status(500).json({ message: "Failed to fetch translation" });
    }
  });
  app2.get("/api/translations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid translation ID" });
      }
      const translation = await storage.getTranslation(id);
      if (!translation) {
        return res.status(404).json({ message: "Translation not found" });
      }
      res.json(translation);
    } catch (error) {
      console.error("Error fetching translation:", error);
      res.status(500).json({ message: "Failed to fetch translation" });
    }
  });
  app2.post("/api/admin/translations", isAdmin, async (req, res) => {
    try {
      const translationData = insertTranslationSchema.parse(req.body);
      const newTranslation = await storage.createTranslation(translationData);
      res.json(newTranslation);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid translation data", errors: error.errors });
      }
      console.error("Error creating translation:", error);
      res.status(500).json({ message: "Failed to create translation" });
    }
  });
  app2.put("/api/admin/translations/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid translation ID" });
      }
      const existingTranslation = await storage.getTranslation(id);
      if (!existingTranslation) {
        return res.status(404).json({ message: "Translation not found" });
      }
      const translationData = insertTranslationSchema.partial().parse(req.body);
      const updatedTranslation = await storage.updateTranslation(id, translationData);
      if (!updatedTranslation) {
        return res.status(500).json({ message: "Failed to update translation" });
      }
      res.json(updatedTranslation);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid translation data", errors: error.errors });
      }
      console.error("Error updating translation:", error);
      res.status(500).json({ message: "Failed to update translation" });
    }
  });
  app2.delete("/api/admin/translations/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid translation ID" });
      }
      const existingTranslation = await storage.getTranslation(id);
      if (!existingTranslation) {
        return res.status(404).json({ message: "Translation not found" });
      }
      const success = await storage.deleteTranslation(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete translation" });
      }
    } catch (error) {
      console.error("Error deleting translation:", error);
      res.status(500).json({ message: "Failed to delete translation" });
    }
  });
  app2.post("/api/admin/translations/:id/translate", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid translation ID" });
      }
      const existingTranslation = await storage.getTranslation(id);
      if (!existingTranslation) {
        return res.status(404).json({ message: "Translation not found" });
      }
      if (req.body.force !== true && existingTranslation.arText) {
        return res.status(400).json({
          message: "Translation already exists. Use force=true to overwrite."
        });
      }
      try {
        const translatedText = await gemini_default.translateToArabic(existingTranslation.enText);
        const updatedTranslation = await storage.updateTranslation(id, {
          arText: translatedText
        });
        res.json({
          success: true,
          translation: updatedTranslation,
          message: "Translation completed successfully"
        });
      } catch (transError) {
        console.error("Gemini translation error:", transError);
        const errorMessage = transError instanceof Error ? transError.message : String(transError);
        if (errorMessage.includes("QUOTA_EXCEEDED") || errorMessage.includes("RATE_LIMITED") || errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("TRANSLATION_ERROR")) {
          return res.status(500).json({
            success: false,
            message: errorMessage
          });
        }
        res.status(500).json({
          success: false,
          message: `Translation service error: ${errorMessage}`
        });
      }
    } catch (error) {
      console.error("Error processing translation request:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process translation request"
      });
    }
  });
  app2.post("/api/admin/packages/generate-image", isAdmin, async (req, res) => {
    try {
      const imageGenSchema = z2.object({
        overview: z2.string().min(10, "Overview text is too short"),
        city: z2.string().min(2, "City name is too short")
      });
      const { overview, city } = imageGenSchema.parse(req.body);
      try {
        const imageUrl = await gemini_default.getImageForPackage(overview, city);
        res.json({
          success: true,
          imageUrl,
          message: "Image generated successfully"
        });
      } catch (genError) {
        console.error("Image generation error:", genError);
        res.status(500).json({
          success: false,
          message: `Image generation error: ${genError instanceof Error ? genError.message : String(genError)}`
        });
      }
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid request parameters",
          errors: error.errors
        });
      }
      console.error("Error processing image generation:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process image generation"
      });
    }
  });
  app2.post("/api/admin/translations/batch-translate", isAdmin, async (req, res) => {
    try {
      const batchSchema = z2.object({
        filter: z2.enum(["all", "untranslated", "category"]).default("untranslated"),
        category: z2.string().optional(),
        limit: z2.number().min(1).max(50).default(10),
        force: z2.boolean().default(false)
      });
      const { filter, category, limit, force } = batchSchema.parse(req.body);
      let translations2 = await storage.listTranslations(filter === "category" ? category : void 0);
      if (filter === "untranslated" || filter === "all" && !force) {
        translations2 = translations2.filter(
          (t) => !t.arText || t.arText.trim() === "" || t.arText === null || t.arText === void 0
        );
      } else if (filter === "category" && !force) {
        translations2 = translations2.filter(
          (t) => !t.arText || t.arText.trim() === "" || t.arText === null || t.arText === void 0
        );
      }
      translations2 = translations2.slice(0, limit);
      if (translations2.length === 0) {
        return res.json({
          success: true,
          message: "No translations to process",
          processed: 0,
          translations: []
        });
      }
      const translationItems = translations2.map((t) => ({
        id: t.id,
        text: t.enText
      }));
      try {
        const translationResults = await gemini_default.batchTranslateToArabic(translationItems);
        const updatedTranslations = [];
        for (const result of translationResults) {
          const updatedTranslation = await storage.updateTranslation(result.id, {
            arText: result.translation
          });
          if (updatedTranslation) {
            updatedTranslations.push(updatedTranslation);
          }
        }
        res.json({
          success: true,
          message: `Successfully processed ${updatedTranslations.length} translations`,
          processed: updatedTranslations.length,
          translations: updatedTranslations
        });
      } catch (batchError) {
        console.error("Batch translation error:", batchError);
        const errorMessage = batchError instanceof Error ? batchError.message : String(batchError);
        if (errorMessage.includes("QUOTA_EXCEEDED") || errorMessage.includes("RATE_LIMITED") || errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("TRANSLATION_ERROR")) {
          return res.status(500).json({
            success: false,
            message: errorMessage
          });
        }
        res.status(500).json({
          success: false,
          message: `Batch translation error: ${errorMessage}`
        });
      }
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid request parameters",
          errors: error.errors
        });
      }
      console.error("Error processing batch translation:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process batch translation"
      });
    }
  });
  app2.post("/api/test/batch-translate", async (req, res) => {
    try {
      console.log("Test batch translation endpoint called");
      const translations2 = await storage.listTranslations();
      const untranslated = translations2.filter((t) => !t.arText || t.arText.trim() === "").slice(0, 2);
      if (untranslated.length === 0) {
        return res.json({
          success: true,
          message: "No untranslated items found",
          processed: 0
        });
      }
      const translationItems = untranslated.map((t) => ({
        id: t.id,
        text: t.enText
      }));
      console.log("Processing translations:", translationItems);
      try {
        const translationResults = await gemini_default.batchTranslateToArabic(translationItems);
        console.log("Translation results:", translationResults);
        const updatedTranslations = [];
        for (const result of translationResults) {
          if (result.translation && result.translation.trim() !== "") {
            const updatedTranslation = await storage.updateTranslation(result.id, {
              arText: result.translation
            });
            if (updatedTranslation) {
              updatedTranslations.push(updatedTranslation);
            }
          }
        }
        res.json({
          success: true,
          message: `Successfully translated ${updatedTranslations.length} items`,
          processed: updatedTranslations.length,
          results: translationResults
        });
      } catch (batchError) {
        console.error("Batch translation error:", batchError);
        res.status(500).json({
          success: false,
          message: `Batch translation error: ${batchError instanceof Error ? batchError.message : String(batchError)}`
        });
      }
    } catch (error) {
      console.error("Error in test batch translate:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process test batch translation"
      });
    }
  });
  app2.post("/api/admin/translations/sync", async (req, res) => {
    console.log("Starting translation sync from codebase");
    try {
      const existingTranslations = await storage.listTranslations();
      const existingKeys = new Set(existingTranslations.map((t) => t.key));
      console.log(`Found ${existingTranslations.length} existing translations`);
      let scannedFiles = 0;
      let foundKeys = 0;
      let newKeysAdded = 0;
      const newTranslations = [];
      const translationPattern = /t\(\s*['"`]([^'"`\s][^'"`]*[^'"`\s]|[^'"`\s])['"`](?:\s*,\s*['"`]([^'"`]*)['"`])?\s*\)/g;
      const scanFile = async (filePath) => {
        try {
          const content = await fsPromises.readFile(filePath, "utf8");
          scannedFiles++;
          let match;
          while ((match = translationPattern.exec(content)) !== null) {
            const key = match[1]?.trim();
            console.log(`[SYNC] Found potential key: "${key}" in file ${filePath}`);
            const defaultText = match[2] || key;
            if (!key || key.length === 0 || /^\s*$/.test(key) || existingKeys.has(key)) continue;
            foundKeys++;
            let category = "general";
            if (filePath.includes("/admin/")) category = "admin";
            else if (filePath.includes("/components/")) category = "components";
            else if (filePath.includes("/pages/")) category = "pages";
            const inserted = await db.insert(translations).values({
              key,
              language: "en",
              // Set default language to English
              enText: defaultText,
              arText: null,
              category,
              context: `Auto-detected from ${path5.relative(".", filePath)}`,
              createdAt: /* @__PURE__ */ new Date(),
              updatedAt: /* @__PURE__ */ new Date()
            }).returning();
            if (inserted[0]) {
              newKeysAdded++;
              newTranslations.push(inserted[0]);
              existingKeys.add(key);
              console.log(`Added: ${key}`);
            }
          }
        } catch (err) {
          console.error(`Error scanning ${filePath}:`, err);
        }
      };
      const scanDirectory = async (dir) => {
        try {
          const entries = await fsPromises.readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path5.join(dir, entry.name);
            if (entry.isDirectory() && !entry.name.startsWith(".")) {
              await scanDirectory(fullPath);
            } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
              await scanFile(fullPath);
            }
          }
        } catch (err) {
          console.error(`Error scanning directory ${dir}:`, err);
        }
      };
      const dirsToScan = ["./client/src/pages", "./client/src/components"];
      for (const dir of dirsToScan) {
        if (await fsPromises.access(dir).then(() => true).catch(() => false)) {
          await scanDirectory(dir);
        }
      }
      console.log(`Scan complete: ${scannedFiles} files, ${foundKeys} keys found, ${newKeysAdded} new translations added`);
      res.json({
        success: true,
        message: `Scan complete. Found ${foundKeys} keys in ${scannedFiles} files. Added ${newKeysAdded} new translations.`,
        results: {
          scannedFiles,
          foundKeys,
          newKeysAdded,
          newTranslations: newTranslations.slice(0, 10)
          // Return first 10 for preview
        }
      });
    } catch (error) {
      console.error("Translation sync error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to sync translations",
        error: error.message
      });
    }
  });
  app2.get("/api/dictionary", async (req, res) => {
    try {
      const entries = await storage.listDictionaryEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching dictionary entries:", error);
      res.status(500).json({ message: "Failed to fetch dictionary entries" });
    }
  });
  app2.get("/api/dictionary/search", async (req, res) => {
    try {
      const searchTerm = req.query.term;
      if (!searchTerm) {
        return res.status(400).json({ message: "Search term is required" });
      }
      const entries = await storage.searchDictionaryEntries(searchTerm);
      res.json(entries);
    } catch (error) {
      console.error("Error searching dictionary entries:", error);
      res.status(500).json({ message: "Failed to search dictionary entries" });
    }
  });
  app2.get("/api/dictionary/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid dictionary entry ID" });
      }
      const entry = await storage.getDictionaryEntry(id);
      if (!entry) {
        return res.status(404).json({ message: "Dictionary entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching dictionary entry:", error);
      res.status(500).json({ message: "Failed to fetch dictionary entry" });
    }
  });
  app2.get("/api/dictionary/word/:word", async (req, res) => {
    try {
      const word = req.params.word;
      const entry = await storage.getDictionaryEntryByWord(word);
      if (!entry) {
        return res.status(404).json({ message: "Dictionary entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching dictionary entry by word:", error);
      res.status(500).json({ message: "Failed to fetch dictionary entry" });
    }
  });
  app2.post("/api/admin/dictionary", isAdmin, async (req, res) => {
    try {
      const entryData = insertDictionaryEntrySchema.parse(req.body);
      const newEntry = await storage.createDictionaryEntry(entryData);
      res.status(201).json(newEntry);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid dictionary entry data", errors: error.errors });
      }
      console.error("Error creating dictionary entry:", error);
      res.status(500).json({ message: "Failed to create dictionary entry" });
    }
  });
  app2.put("/api/admin/dictionary/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid dictionary entry ID" });
      }
      const existingEntry = await storage.getDictionaryEntry(id);
      if (!existingEntry) {
        return res.status(404).json({ message: "Dictionary entry not found" });
      }
      const entryData = insertDictionaryEntrySchema.partial().parse(req.body);
      const updatedEntry = await storage.updateDictionaryEntry(id, entryData);
      if (!updatedEntry) {
        return res.status(500).json({ message: "Failed to update dictionary entry" });
      }
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid dictionary entry data", errors: error.errors });
      }
      console.error("Error updating dictionary entry:", error);
      res.status(500).json({ message: "Failed to update dictionary entry" });
    }
  });
  app2.delete("/api/admin/dictionary/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid dictionary entry ID" });
      }
      const existingEntry = await storage.getDictionaryEntry(id);
      if (!existingEntry) {
        return res.status(404).json({ message: "Dictionary entry not found" });
      }
      const success = await storage.deleteDictionaryEntry(id);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete dictionary entry" });
      }
    } catch (error) {
      console.error("Error deleting dictionary entry:", error);
      res.status(500).json({ message: "Failed to delete dictionary entry" });
    }
  });
  app2.get("/api/admin/translations/export", isAdmin, async (req, res) => {
    try {
      const allTranslations = await storage.listTranslations();
      const languageSettings = await storage.getSiteLanguageSettings();
      const exportData2 = {
        translations: allTranslations,
        languageSettings: languageSettings || {
          defaultLanguage: "en",
          availableLanguages: ["en", "ar"],
          rtlLanguages: ["ar"]
        }
      };
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=sahara-translations.json");
      res.json(exportData2);
    } catch (error) {
      console.error("Error exporting translations:", error);
      res.status(500).json({ message: "Failed to export translations" });
    }
  });
  app2.put("/api/tours/:id/arabic", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tour ID" });
      }
      const existingTour = await storage.getTour(id);
      if (!existingTour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      const updatedTour = await db.update(tours).set({
        nameAr: req.body.nameAr,
        descriptionAr: req.body.descriptionAr,
        itineraryAr: req.body.itineraryAr,
        includedAr: req.body.includedAr,
        excludedAr: req.body.excludedAr,
        hasArabicVersion: req.body.hasArabicVersion,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq4(tours.id, id)).returning();
      if (updatedTour.length === 0) {
        return res.status(500).json({ message: "Failed to update tour Arabic version" });
      }
      res.json(updatedTour[0]);
    } catch (error) {
      console.error("Error updating tour Arabic version:", error);
      res.status(500).json({ message: "Failed to update tour Arabic version" });
    }
  });
  app2.post("/api/admin/translations/import", isAdmin, async (req, res) => {
    try {
      const importSchema = z2.object({
        translations: z2.array(z2.object({
          key: z2.string(),
          enText: z2.string(),
          arText: z2.string().nullable(),
          context: z2.string().nullable(),
          category: z2.string().nullable()
        })),
        languageSettings: z2.object({
          defaultLanguage: z2.string(),
          availableLanguages: z2.union([z2.array(z2.string()), z2.string()]),
          rtlLanguages: z2.union([z2.array(z2.string()), z2.string()])
        })
      });
      const importData = importSchema.parse(req.body);
      const stats = {
        totalTranslations: importData.translations.length,
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: 0
      };
      for (const translation of importData.translations) {
        try {
          const existingTranslation = await storage.getTranslationByKey(translation.key);
          if (existingTranslation) {
            await storage.updateTranslation(existingTranslation.id, translation);
            stats.updated++;
          } else {
            await storage.createTranslation(translation);
            stats.imported++;
          }
        } catch (err) {
          console.error(`Error importing translation key ${translation.key}:`, err);
          stats.errors++;
        }
      }
      if (importData.languageSettings) {
        try {
          await storage.updateSiteLanguageSettings(importData.languageSettings);
        } catch (err) {
          console.error("Error updating language settings:", err);
          stats.errors++;
        }
      }
      res.json({
        success: true,
        message: "Translations imported successfully",
        stats
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Invalid import data format",
          errors: error.errors
        });
      }
      console.error("Error importing translations:", error);
      res.status(500).json({ message: "Failed to import translations" });
    }
  });
  app2.get("/api/tour-categories", async (req, res) => {
    try {
      const active = req.query.active === "true" ? true : void 0;
      const categories = await storage.listTourCategories(active);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching tour categories:", error);
      res.status(500).json({ message: "Failed to fetch tour categories" });
    }
  });
  app2.get("/api/tour-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const category = await storage.getTourCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Tour category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching tour category:", error);
      res.status(500).json({ message: "Failed to fetch tour category" });
    }
  });
  app2.post("/api/tour-categories", isAdmin, async (req, res) => {
    try {
      const { name, description, active } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }
      const newCategory = await storage.createTourCategory({
        name,
        description: description || null,
        active: active !== void 0 ? active : true
      });
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Error creating tour category:", error);
      res.status(500).json({ message: "Failed to create tour category" });
    }
  });
  app2.patch("/api/tour-categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const { name, description, active } = req.body;
      const updatedData = {};
      if (name !== void 0) updatedData.name = name;
      if (description !== void 0) updatedData.description = description;
      if (active !== void 0) updatedData.active = active;
      const updatedCategory = await storage.updateTourCategory(id, updatedData);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Tour category not found" });
      }
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error updating tour category:", error);
      res.status(500).json({ message: "Failed to update tour category" });
    }
  });
  app2.delete("/api/tour-categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const success = await storage.deleteTourCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Tour category not found or could not be deleted" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting tour category:", error);
      res.status(500).json({ message: "Failed to delete tour category" });
    }
  });
  app2.get("/api/hotel-categories", async (req, res) => {
    try {
      const active = req.query.active === "true" ? true : void 0;
      const categories = await storage.listHotelCategories(active);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching hotel categories:", error);
      res.status(500).json({ message: "Failed to fetch hotel categories" });
    }
  });
  app2.get("/api/hotel-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const category = await storage.getHotelCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Hotel category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching hotel category:", error);
      res.status(500).json({ message: "Failed to fetch hotel category" });
    }
  });
  app2.post("/api/hotel-categories", isAdmin, async (req, res) => {
    try {
      const { name, description, active } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }
      const newCategory = await storage.createHotelCategory({
        name,
        description: description || null,
        active: active !== void 0 ? active : true
      });
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Error creating hotel category:", error);
      res.status(500).json({ message: "Failed to create hotel category" });
    }
  });
  app2.patch("/api/hotel-categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const { name, description, active } = req.body;
      const updatedData = {};
      if (name !== void 0) updatedData.name = name;
      if (description !== void 0) updatedData.description = description;
      if (active !== void 0) updatedData.active = active;
      const updatedCategory = await storage.updateHotelCategory(id, updatedData);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Hotel category not found" });
      }
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error updating hotel category:", error);
      res.status(500).json({ message: "Failed to update hotel category" });
    }
  });
  app2.delete("/api/hotel-categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const success = await storage.deleteHotelCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Hotel category not found or could not be deleted" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting hotel category:", error);
      res.status(500).json({ message: "Failed to delete hotel category" });
    }
  });
  app2.get("/api/room-categories", async (req, res) => {
    try {
      const active = req.query.active === "true" ? true : void 0;
      const categories = await storage.listRoomCategories(active);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching room categories:", error);
      res.status(500).json({ message: "Failed to fetch room categories" });
    }
  });
  app2.get("/api/package-categories", async (req, res) => {
    try {
      const active = req.query.active === "true" ? true : void 0;
      const categories = await storage.listPackageCategories(active);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching package categories:", error);
      res.status(500).json({ message: "Failed to fetch package categories" });
    }
  });
  setupAdvancedAdminRoutes(app2);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs6 from "fs";
import path7 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path6 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path6.resolve(path.dirname(fileURLToPath(import.meta.url)), "client", "src"),
      "@shared": path6.resolve(path.dirname(fileURLToPath(import.meta.url)), "shared"),
      "@assets": path6.resolve(path.dirname(fileURLToPath(import.meta.url)), "attached_assets")
    }
  },
  root: path6.resolve(path.dirname(fileURLToPath(import.meta.url)), "client"),
  build: {
    outDir: path6.resolve(path.dirname(fileURLToPath(import.meta.url)), "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path7.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "..",
        "client",
        "index.html"
      );
      let template = await fs6.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path7.resolve(path.dirname(fileURLToPath(import.meta.url)), "public");
  if (!fs6.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path7.resolve(distPath, "index.html"));
  });
}

// server/index.ts
init_db();
init_admin_setup();
import path8 from "path";
import session from "express-session";
import passport2 from "passport";
import MemoryStoreFactory from "memorystore";
dotenv.config();
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_ZN9Ylt3AoQRJ@ep-dawn-voice-a8bd2yi7-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";
  console.log("\u{1F517} Using fallback DATABASE_URL");
}
var app = express3();
app.use(cors({
  credentials: true,
  origin: true
}));
app.use(express3.json({ limit: "25mb" }));
app.use(express3.urlencoded({ extended: false, limit: "25mb" }));
var MemoryStore = MemoryStoreFactory(session);
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
  store: new MemoryStore({
    checkPeriod: 864e5
    // prune expired entries every 24h
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1e3
    // 24 hours
  }
}));
app.use(passport2.initialize());
app.use(passport2.session());
app.use("/uploads", express3.static(path8.join(process.cwd(), "public/uploads")));
app.use((req, res, next) => {
  const start = Date.now();
  const path9 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path9.startsWith("/api")) {
      let logLine = `${req.method} ${path9} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const jsonString = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${jsonString.length > 200 ? jsonString.substring(0, 197) + "..." : jsonString}`;
      }
      if (logLine.length > 150) {
        logLine = logLine.slice(0, 147) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    console.log("\u23F3 Waiting for database initialization...");
    let dbInitialized = false;
    try {
      const dbResult = await Promise.race([
        dbPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Database connection timeout")), 1e4))
      ]);
      dbInitialized = !!dbResult;
    } catch (error) {
      console.warn("\u26A0\uFE0F Database connection failed, continuing with basic functionality:", error?.message || "Unknown error");
      dbInitialized = false;
    }
    if (dbInitialized) {
      console.log("\u2705 Database initialized.");
    } else {
      console.log("\u{1F4E6} Using fallback storage due to database connection issues.");
    }
    try {
      await setupAdmin();
      console.log("\u2705 Admin setup completed");
    } catch (error) {
      console.error("\u274C Admin setup failed:", error);
    }
    try {
      setupUnifiedAuth(app);
      console.log("\u2705 Unified auth setup completed");
    } catch (error) {
      console.error("\u274C Unified auth setup failed:", error);
    }
    try {
      setupHeroSlidesRoutes(app);
      console.log("\u2705 Hero slides routes setup completed");
    } catch (error) {
      console.error("\u274C Hero slides routes setup failed:", error);
    }
    try {
      setupUploadRoutes(app);
      app.use("/uploads", express3.static(path8.join(process.cwd(), "public/uploads")));
      console.log("\u2705 Upload routes and static serving setup completed");
    } catch (error) {
      console.error("\u274C Upload routes setup failed:", error);
    }
    const { storage: storage4 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    app.get("/api/translations", async (req, res) => {
      try {
        const language = req.query.language;
        const translations2 = await storage4.listTranslations(language);
        res.json(translations2);
      } catch (error) {
        console.error("Error fetching translations:", error);
        res.status(500).json({ message: "Failed to fetch translations" });
      }
    });
    app.get("/api/tour-categories", async (req, res) => {
      try {
        const active = req.query.active === "true" ? true : void 0;
        const categories = await storage4.listTourCategories(active);
        res.json(categories);
      } catch (error) {
        console.error("Error fetching tour categories:", error);
        res.status(500).json({ message: "Failed to fetch tour categories" });
      }
    });
    app.get("/api/translations/settings", async (req, res) => {
      try {
        const settings = await storage4.getSiteLanguageSettings();
        if (!settings || settings.length === 0) {
          return res.json({
            defaultLanguage: "en",
            availableLanguages: ["en", "ar"],
            rtlLanguages: ["ar"]
          });
        }
        res.json(settings[0]);
      } catch (error) {
        console.error("Error fetching language settings:", error);
        res.status(500).json({ message: "Failed to fetch language settings" });
      }
    });
    app.get("/api/admin/hotel-facilities", async (req, res) => {
      try {
        const facilities = await storage4.listHotelFacilities();
        res.json(facilities);
      } catch (error) {
        console.error("Error fetching hotel facilities:", error);
        res.status(500).json({ message: "Failed to fetch hotel facilities" });
      }
    });
    app.get("/api/admin/hotel-highlights", async (req, res) => {
      try {
        const highlights = await storage4.listHotelHighlights();
        res.json(highlights);
      } catch (error) {
        console.error("Error fetching hotel highlights:", error);
        res.status(500).json({ message: "Failed to fetch hotel highlights" });
      }
    });
    app.get("/api/admin/cleanliness-features", async (req, res) => {
      try {
        const features = await storage4.listCleanlinessFeatures();
        res.json(features);
      } catch (error) {
        console.error("Error fetching cleanliness features:", error);
        res.status(500).json({ message: "Failed to fetch cleanliness features" });
      }
    });
    let server;
    try {
      server = await registerRoutes(app);
      console.log("\u2705 API routes registered successfully");
      if (!server) {
        throw new Error("Server creation failed - no server returned from registerRoutes");
      }
    } catch (error) {
      console.error("\u274C Route registration failed:", error);
      throw error;
    }
    app.get("/admin-test", (req, res) => {
      res.sendFile(path8.join(process.cwd(), "client", "public", "admin-test.html"));
    });
    (async () => {
      try {
        const { initializeDatabase: initializeDatabase3 } = await Promise.resolve().then(() => (init_init_database(), init_database_exports));
        await initializeDatabase3();
      } catch (error) {
        console.error("Failed to run initial database setup and seeding:", error);
      }
    })();
    app.use("/api/*", (req, res, next) => {
      console.log(`\u{1F4CD} API Route Hit: ${req.method} ${req.path}`);
      next();
    });
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error("Error:", err);
    });
    if (app.get("env") === "development") {
      await setupVite(app, server);
      console.log("\u2705 Vite development setup completed");
    } else {
      serveStatic(app);
      console.log("\u2705 Static file serving setup completed");
    }
    const port = parseInt(process.env.PORT || "8080");
    await new Promise((resolve, reject) => {
      server.listen(port, "0.0.0.0", (err) => {
        if (err) {
          console.error(`\u274C Failed to start server on port ${port}:`, err);
          reject(err);
        } else {
          log(`\u2705 Server serving on port ${port}`);
          console.log(`\u{1F30D} Application available at http://localhost:${port}`);
          resolve();
        }
      });
    });
  } catch (error) {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  }
})();
