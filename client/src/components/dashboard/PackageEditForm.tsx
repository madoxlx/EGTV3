const packageEditSchema = z.object({
  // Basic fields
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(20, { message: "Description should be at least 20 characters" }),
  shortDescription: z.string().optional(),
  overview: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
  discountedPrice: z.coerce.number().min(0).optional().nullable(),
  currency: z.string().default("EGP"),
  imageUrl: z.string().optional(),
  galleryUrls: z.array(z.string()).optional(),
  duration: z.coerce.number().min(1, { message: "Duration must be at least 1 day" }),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
  reviewCount: z.coerce.number().min(0).optional().nullable(),
  
  // Location fields
  destinationId: z.coerce.number().positive().optional().nullable(),
  countryId: z.coerce.number().optional().nullable(),
  cityId: z.coerce.number().optional().nullable(),
  categoryId: z.coerce.number().optional().nullable(),
  category: z.string().optional(),
  
  // Date fields
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  
  // Route and metadata
  route: z.string().optional(),
  type: z.string().optional(),
  maxGroupSize: z.coerce.number().min(1, { message: "Group size must be at least 1" }).optional(),
  language: z.string().optional(),
  bestTimeToVisit: z.string().optional(),
  
  // Complex fields
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
  inclusions: z.array(z.string()).optional(),
  includedFeatures: z.array(z.string()).optional(),
  excludedFeatures: z.array(z.string()).optional(),
  optionalExcursions: z.array(z.string()).optional(),
  travelRoute: z.array(z.string()).optional(),
  accommodationHighlights: z.array(z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional()
  })).optional(),
  transportationDetails: z.array(z.string()).optional(),
  
  // Transportation
  transportation: z.string().optional(),
  transportationPrice: z.coerce.number().optional(),
  
  // Hotel and room selections
  selectedHotels: z.array(z.string()).optional(),
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
  
  // Tour selection
  tourSelection: z.array(z.string()).optional(),
  selectedTourId: z.number().optional(),
  
  // Traveler counts
  adultCount: z.coerce.number().min(1, { message: "At least 1 adult is required" }),
  childrenCount: z.coerce.number().min(0, { message: "Cannot be negative" }),
  infantCount: z.coerce.number().min(0, { message: "Cannot be negative" }),
  
  // Pricing
  pricingMode: z.enum(["per_booking", "per_percentage", "per_amount"]),
  
  // Status
  featured: z.boolean().default(false),
  slug: z.string().optional(),
}); 

const form = useForm<PackageFormValues>({
  resolver: zodResolver(packageEditSchema),
  defaultValues: {
    title: package?.title || "",
    description: package?.description || "",
    shortDescription: package?.shortDescription || "",
    overview: package?.overview || "",
    price: package?.price || 0,
    discountedPrice: package?.discountedPrice || null,
    currency: package?.currency || "EGP",
    imageUrl: package?.imageUrl || "",
    galleryUrls: package?.galleryUrls || [],
    duration: package?.duration || 1,
    rating: package?.rating || null,
    reviewCount: package?.reviewCount || 0,
    destinationId: package?.destinationId || null,
    countryId: package?.countryId || null,
    cityId: package?.cityId || null,
    categoryId: package?.categoryId || null,
    category: package?.category || "",
    startDate: package?.startDate ? new Date(package.startDate) : new Date(),
    endDate: package?.endDate ? new Date(package.endDate) : new Date(new Date().setDate(new Date().getDate() + 1)),
    route: package?.route || "",
    type: package?.type || "",
    maxGroupSize: package?.maxGroupSize || 15,
    language: package?.language || "english",
    bestTimeToVisit: package?.bestTimeToVisit || "",
    idealFor: package?.idealFor || [],
    whatToPack: package?.whatToPack || [],
    itinerary: package?.itinerary || [],
    inclusions: package?.inclusions || [],
    includedFeatures: package?.includedFeatures || [],
    excludedFeatures: package?.excludedFeatures || [],
    optionalExcursions: package?.optionalExcursions || [],
    travelRoute: package?.travelRoute || [],
    accommodationHighlights: package?.accommodationHighlights || [],
    transportationDetails: package?.transportationDetails || [],
    transportation: package?.transportation || "",
    transportationPrice: package?.transportationPrice || 0,
    selectedHotels: package?.selectedHotels || [],
    rooms: package?.rooms || [],
    tourSelection: package?.tourSelection || [],
    selectedTourId: package?.selectedTourId || null,
    adultCount: package?.adultCount || 2,
    childrenCount: package?.childrenCount || 0,
    infantCount: package?.infantCount || 0,
    pricingMode: package?.pricingMode || "per_booking",
    featured: package?.featured || false,
    slug: package?.slug || "",
  },
}); 