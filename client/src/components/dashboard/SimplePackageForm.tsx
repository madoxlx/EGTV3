import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import HotelSearchComponent from "@/components/HotelSearchComponent";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  ArrowRight,
  CalendarIcon,
  ImagePlus,
  Loader2,
  Plus,
  Trash,
  Star,
  X,
  Package,
  Hotel,
  Map as MapIcon,
  Search,
  Check,
  LucideProps,
  Languages,
} from "lucide-react";

// A simple component to dynamically use Lucide icons based on string name
// A simple component to render an icon using Lucide
const LucideIcon = ({
  name,
  className,
  fallback,
  ...props
}: {
  name: string;
  className?: string;
  fallback?: React.ReactNode;
} & Omit<LucideProps, "ref">) => {
  // If we have an exact match for the icon name, use it
  if (name === "package") return <Package className={className} {...props} />;
  if (name === "hotel") return <Hotel className={className} {...props} />;
  if (name === "map") return <MapIcon className={className} {...props} />;
  if (name === "trash") return <Trash className={className} {...props} />;
  if (name === "star") return <Star className={className} {...props} />;
  if (name === "x") return <X className={className} {...props} />;

  // Default fallback
  return <>{fallback || <Package className={className} {...props} />}</>;
};
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import {
  validateForm,
  validateRequiredFields,
  validateDateFields,
  validateNumericFields,
} from "@/lib/validateForm";
import {
  FormRequiredFieldsNote,
  FormValidationAlert,
  FormRequirementsAlert,
} from "@/components/dashboard/FormValidationAlert";
import { useLocation } from "wouter";
import { IconSelector } from "@/components/ui/IconSelector";

// Validation schema - Made more permissive to allow custom validation logic
const packageFormSchema = z.object({
  // Basic fields
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(), // Made optional since the form doesn't have this field
  shortDescription: z.string().optional(),
  overview: z.string().min(10, { message: "Overview should be at least 10 characters" }),
  price: z.coerce
    .number()
    .min(0, { message: "Price must be a positive number" }),
  markup: z.coerce.number().min(0).optional().nullable(),
  markupType: z.enum(["percentage", "fixed"]).default("percentage"),
  currency: z.string().default("EGP"),
  imageUrl: z.string().optional(),
  galleryUrls: z.array(z.string()).optional(),
  duration: z.coerce
    .number()
    .min(1, { message: "Duration must be at least 1 day" }),
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
  validUntil: z.date().optional(),

  // Route and metadata
  route: z.string().optional(),
  type: z.string().optional(),
  maxGroupSize: z.coerce
    .number()
    .min(1, { message: "Group size must be at least 1" })
    .optional(),
  language: z.string().optional(),
  bestTimeToVisit: z.string().optional(),

  // Complex fields
  idealFor: z.array(z.string()).optional(),
  whatToPack: z
    .array(
      z.object({
        item: z.string(),
        icon: z.string().optional(),
        tooltip: z.string().optional(),
      }),
    )
    .optional(),
  itinerary: z
    .array(
      z.object({
        day: z.number(),
        title: z.string(),
        description: z.string(),
        image: z.string().optional(),
      }),
    )
    .optional(),
  inclusions: z.array(z.string()).optional(),
  includedFeatures: z.array(z.string()).optional(),
  excludedFeatures: z.array(z.string()).optional(),
  excludedItems: z.array(z.string()).optional(),
  optionalExcursions: z.array(z.string()).optional(),
  travelRoute: z.array(z.string()).optional(),
  accommodationHighlights: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        icon: z.string().optional(),
      }),
    )
    .optional(),
  transportationDetails: z.array(z.string()).optional(),

  // Transportation
  transportation: z.string().optional(),
  transportationPrice: z.coerce.number().optional(),

  // Hotel and room selections
  selectedHotels: z.array(z.string()).optional(),
  rooms: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        hotelId: z.string(),
        hotelName: z.string(),
        price: z.coerce.number(),
        customPrice: z.number().optional(),
        originalPrice: z.number().optional(),
        maxOccupancy: z.number().optional(),
        maxAdults: z.number().optional(),
        maxChildren: z.number().optional(),
        maxInfants: z.number().optional(),
        amenities: z.array(z.string()).optional(),
        bedType: z.string().optional(),
        view: z.string().optional(),
        size: z.string().optional(),
      }),
    )
    .optional(),

  // Tour selection
  tourSelection: z.array(z.string()).optional(),
  selectedTourId: z.number().optional(),
  selectedTourIds: z.array(z.number()).optional(),

  // Traveler counts
  adultCount: z.coerce
    .number()
    .min(1, { message: "At least 1 adult is required" }),
  childrenCount: z.coerce.number().min(0, { message: "Cannot be negative" }),
  infantCount: z.coerce.number().min(0, { message: "Cannot be negative" }),

  // Pricing
  pricingMode: z.enum(["per_booking", "per_percentage", "per_amount"]),

  // Status
  featured: z.boolean().default(false),
  slug: z.string().optional(),

  // Arabic translation fields
  hasArabicVersion: z.boolean().default(false),
  titleAr: z.string().optional(),
  descriptionAr: z.string().optional(),
  shortDescriptionAr: z.string().optional(),
  overviewAr: z.string().optional(),
  bestTimeToVisitAr: z.string().optional(),
  cancellationPolicyAr: z.string().optional(),
  childrenPolicyAr: z.string().optional(),
  termsAndConditionsAr: z.string().optional(),
  customTextAr: z.string().optional(),
  includedFeaturesAr: z.array(z.string()).optional(),
  excludedFeaturesAr: z.array(z.string()).optional(),
  idealForAr: z.array(z.string()).optional(),
  itineraryAr: z.array(z.object({
    day: z.number(),
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
  })).optional(),
  whatToPackAr: z.array(z.object({
    item: z.string(),
    icon: z.string().optional(),
    tooltip: z.string().optional(),
  })).optional(),
  travelRouteAr: z.array(z.object({
    order: z.number(),
    location: z.string(),
    description: z.string(),
    estimatedTime: z.string().optional(),
  })).optional(),
  optionalExcursionsAr: z.array(z.object({
    name: z.string(),
    price: z.number(),
    description: z.string().optional(),
  })).optional(),
}).refine((data) => {
  // Require at least one image: either imageUrl or at least one URL in galleryUrls
  const hasMainImage = data.imageUrl && data.imageUrl.trim() !== '';
  const hasGalleryImages = data.galleryUrls && Array.isArray(data.galleryUrls) && data.galleryUrls.length > 0;
  
  return hasMainImage || hasGalleryImages;
}, {
  message: "At least one image is required. Please provide either a main image or add images to the gallery.",
  path: ["imageUrl"] // This will show the error on the imageUrl field
});

type PackageFormValues = z.infer<typeof packageFormSchema>;

// We're using the names in the pricingRules directly now, so this array is no longer needed
// Kept for backward compatibility
const pricingOptions = [
  { id: "adult", label: "Adult (12+ years)" },
  { id: "child", label: "Child (2-11 years)" },
  { id: "infant", label: "Infant (0-23 months)" },
];

const features = [
  // Meals & Dining
  { id: "breakfast", label: "Breakfast Included" },
  { id: "lunch", label: "Lunch Included" },
  { id: "dinner", label: "Dinner Included" },
  { id: "welcome_drink", label: "Welcome Drink" },
  { id: "traditional_meal", label: "Traditional Local Cuisine" },
  { id: "cooking_class", label: "Cooking Class Experience" },
  
  // Transportation
  { id: "airport_transfer", label: "Airport Transfer" },
  { id: "private_transport", label: "Private Transportation" },
  { id: "train_tickets", label: "Train Tickets Included" },
  { id: "domestic_flights", label: "Domestic Flights" },
  { id: "car_rental", label: "Car Rental Included" },
  
  // Accommodation Features
  { id: "wifi", label: "Free Wi-Fi" },
  { id: "spa_access", label: "Spa & Wellness Access" },
  { id: "pool_access", label: "Swimming Pool Access" },
  { id: "gym_access", label: "Fitness Center Access" },
  { id: "room_upgrade", label: "Room Upgrade Included" },
  { id: "concierge", label: "Concierge Services" },
  
  // Tours & Activities
  { id: "city_tour", label: "City Tour" },
  { id: "museum_tickets", label: "Museum Entry Tickets" },
  { id: "archaeological_sites", label: "Archaeological Sites Access" },
  { id: "desert_safari", label: "Desert Safari Experience" },
  { id: "boat_cruise", label: "Boat Cruise" },
  { id: "camel_ride", label: "Camel Riding Experience" },
  { id: "cultural_show", label: "Cultural Performance Show" },
  { id: "shopping_tour", label: "Shopping Tour" },
  { id: "photography_session", label: "Professional Photography" },
  
  // Services & Support
  { id: "tour_guide", label: "Professional Tour Guide" },
  { id: "multilingual_guide", label: "Multilingual Guide Support" },
  { id: "24_7_support", label: "24/7 Customer Support" },
  { id: "local_sim", label: "Local SIM Card" },
  { id: "luggage_handling", label: "Luggage Handling Service" },
  { id: "travel_kit", label: "Travel Kit & Amenities" },
  
  // Special Experiences
  { id: "sunset_viewing", label: "Sunset Viewing Experience" },
  { id: "stargazing", label: "Stargazing Activity" },
  { id: "hot_air_balloon", label: "Hot Air Balloon Ride" },
  { id: "helicopter_tour", label: "Helicopter Tour" },
  { id: "diving_snorkeling", label: "Diving/Snorkeling Activity" },
  { id: "adventure_sports", label: "Adventure Sports" },
  
  // Cultural & Educational
  { id: "cultural_immersion", label: "Cultural Immersion Experience" },
  { id: "language_lesson", label: "Local Language Lessons" },
  { id: "artisan_workshop", label: "Local Artisan Workshop" },
  { id: "historical_lecture", label: "Historical Lectures" },
  
  // Optional Services
  { id: "excursion", label: "Optional Excursions" },
  { id: "souvenir_package", label: "Souvenir Package" },
  { id: "photo_package", label: "Photo Package" },
];

const excludedItems = [
  // Travel Documents & Fees
  { id: "visa", label: "Visa Fees" },
  { id: "passport", label: "Passport Processing" },
  { id: "insurance", label: "Travel Insurance" },
  { id: "vaccination", label: "Vaccination Costs" },
  
  // Meals & Beverages
  { id: "meals", label: "Additional Meals" },
  { id: "drinks", label: "Alcoholic Beverages" },
  { id: "room_service", label: "Room Service" },
  { id: "special_diet", label: "Special Dietary Requirements" },
  { id: "snacks", label: "Snacks & Refreshments" },
  
  // Transportation
  { id: "excess_baggage", label: "Excess Baggage Fees" },
  { id: "seat_upgrade", label: "Flight Seat Upgrades" },
  { id: "taxi_fares", label: "Local Taxi Fares" },
  { id: "fuel_surcharge", label: "Fuel Surcharges" },
  { id: "parking_fees", label: "Parking Fees" },
  
  // Personal & Services
  { id: "tips", label: "Tips and Gratuities" },
  { id: "personal", label: "Personal Expenses" },
  { id: "laundry", label: "Laundry Services" },
  { id: "phone_calls", label: "International Phone Calls" },
  { id: "internet", label: "Premium Internet Access" },
  { id: "spa_treatments", label: "Spa Treatments" },
  { id: "minibar", label: "Minibar Consumption" },
  
  // Activities & Entertainment
  { id: "extras", label: "Optional Activities" },
  { id: "entrance_fees", label: "Additional Entrance Fees" },
  { id: "equipment_rental", label: "Equipment Rental" },
  { id: "photography", label: "Professional Photography" },
  { id: "shopping", label: "Shopping & Souvenirs" },
  { id: "entertainment", label: "Evening Entertainment" },
  { id: "excursions", label: "Optional Day Excursions" },
  
  // Medical & Emergency
  { id: "medical", label: "Medical Expenses" },
  { id: "emergency", label: "Emergency Evacuation" },
  { id: "medication", label: "Personal Medication" },
  
  // Accommodation Extras
  { id: "room_upgrade_fees", label: "Room Upgrade Fees" },
  { id: "early_checkin", label: "Early Check-in Fees" },
  { id: "late_checkout", label: "Late Check-out Fees" },
  { id: "resort_fees", label: "Resort Fees" },
  { id: "city_tax", label: "City/Tourist Tax" },
];

const travellerTypes = [
  { id: "families", label: "Families" },
  { id: "couples", label: "Couples" },
  { id: "solo", label: "Solo Travelers" },
  { id: "seniors", label: "Seniors" },
  { id: "friends", label: "Groups of Friends" },
  { id: "business", label: "Business Travelers" },
  { id: "adventure", label: "Adventure Seekers" },
];

const languages = [
  { id: "english", label: "English" },
  { id: "arabic", label: "Arabic" },
  { id: "french", label: "French" },
  { id: "spanish", label: "Spanish" },
  { id: "german", label: "German" },
  { id: "italian", label: "Italian" },
  { id: "russian", label: "Russian" },
  { id: "chinese", label: "Chinese" },
];

const transportOptions = [
  { id: "private_car", label: "Private Car", priceMultiplier: 1.2 },
  { id: "shared_minivan", label: "Shared Minivan", priceMultiplier: 1 },
  { id: "luxury_car", label: "Luxury Car", priceMultiplier: 1.5 },
  { id: "coach", label: "Coach Bus", priceMultiplier: 0.8 },
  { id: "self_drive", label: "Self Drive", priceMultiplier: 0.7 },
];

// This static array will be replaced by the dynamic data from packageCategories
const categoryOptions = [
  { value: "cultural", label: "Cultural Tours" },
  { value: "beach", label: "Beach Holidays" },
  { value: "adventure", label: "Adventure" },
  { value: "honeymoon", label: "Honeymoon" },
  { value: "family", label: "Family Friendly" },
  { value: "luxury", label: "Luxury" },
];

export interface PackageCreatorFormProps {
  packageId?: string; // Optional package ID for edit mode
  onNavigateRequest?: () => void; // Optional callback for navigation requests
}

// Export function with two names
// Define a tour type
interface Tour {
  id: number;
  name: string;
  price: number;
  description: string;
  duration?: number;
  status?: string;
  destination_id?: number;
}

export function PackageCreatorForm({
  packageId,
  onNavigateRequest,
}: PackageCreatorFormProps) {
  const isEditMode = !!packageId;
  const [, setLocation] = useLocation();

  const { toast } = useToast();
  const { t } = useLanguage();
  const [pricingRules, setPricingRules] = useState([
    { id: "adult", value: 100, percentage: true, name: "Adult (12+ years)" },
    { id: "child", value: 75, percentage: true, name: "Child (2-11 years)" },
    { id: "infant", value: 0, percentage: true, name: "Infant (0-23 months)" },
  ]);
  const [images, setImages] = useState<
    { id: string; file: File | null; preview: string; isMain: boolean }[]
  >([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [selectedHotelRooms, setSelectedHotelRooms] = useState<any[]>([]);
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Tour selection variables
  const [tourSearchQuery, setTourSearchQuery] = useState<string>("");
  const [showTourDropdown, setShowTourDropdown] = useState<boolean>(false);
  const [selectedTours, setSelectedTours] = useState<Tour[]>([]);
  const tourSearchRef = useRef<HTMLDivElement>(null);

  // Hotel search functionality
  const [hotelSearchQuery, setHotelSearchQuery] = useState<string>("");

  // Track whether we're submitting an update or create
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // For validation hints
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [showValidationHints, setShowValidationHints] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("basic");

  // Package feature states with user-friendly names
  const [excludedItemsList, setExcludedItemsList] = useState<string[]>([]);
  const [selectedTravellerTypes, setSelectedTravellerTypes] = useState<
    string[]
  >([]);
  const [optionalExcursions, setOptionalExcursions] = useState<string[]>([]);
  const [newExcursion, setNewExcursion] = useState<string>("");
  
  // Custom features state
  const [newIncludedFeature, setNewIncludedFeature] = useState<string>("");
  const [newExcludedFeature, setNewExcludedFeature] = useState<string>("");
  const [customIncludedFeatures, setCustomIncludedFeatures] = useState<string[]>([]);
  const [customExcludedFeatures, setCustomExcludedFeatures] = useState<string[]>([]);
  const [travelRouteItems, setTravelRouteItems] = useState<string[]>([]);
  const [newRouteStop, setNewRouteStop] = useState<string>("");
  
  // Custom traveler types state
  const [newTravelerType, setNewTravelerType] = useState<string>("");
  const [customTravelerTypes, setCustomTravelerTypes] = useState<string[]>([]);

  // Packing list section
  const [packItems, setPackItems] = useState<
    { item: string; icon: string; tooltip: string }[]
  >([]);
  const [newPackItem, setNewPackItem] = useState({
    item: "",
    icon: "Luggage",
    tooltip: "",
  });

  // Day-by-day itinerary
  const [itineraryItems, setItineraryItems] = useState<
    { day: number; title: string; description: string; image: string }[]
  >([]);
  const [newItineraryDay, setNewItineraryDay] = useState({
    day: 1,
    title: "",
    description: "",
    image: "",
  });

  // Hotel and accommodation features
  const [accommodationHighlights, setAccommodationHighlights] = useState<
    { title: string; description: string; icon: string }[]
  >([]);
  const [newHighlight, setNewHighlight] = useState({
    title: "",
    description: "",
    icon: "Hotel",
  });

  // For transportation options
  const [selectedTransport, setSelectedTransport] = useState("");
  const [transportPrice, setTransportPrice] = useState(0);
  const [allowFormSubmission, setAllowFormSubmission] = useState(false);

  // Track form changes for unsaved changes warning
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormData, setInitialFormData] =
    useState<PackageFormValues | null>(null);

  // Function to check for unsaved changes and warn user
  const handleNavigateWithWarning = (destination: string) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave? Your changes will be lost.",
      );
      if (confirmLeave) {
        if (onNavigateRequest) {
          onNavigateRequest();
        } else {
          setLocation(destination);
        }
      }
    } else {
      if (onNavigateRequest) {
        onNavigateRequest();
      } else {
        setLocation(destination);
      }
    }
  };

  // Fetch destinations for the dropdown
  const { data: destinations = [] } = useQuery<any[]>({
    queryKey: ["/api/destinations"],
  });

  // Fetch package categories for the dropdown
  const { data: packageCategories = [] } = useQuery<any[]>({
    queryKey: ["/api/package-categories"],
  });

  // Fetch tours for the tour search feature
  const { data: tours = [] } = useQuery<Tour[]>({
    queryKey: ["/api/admin/tours"],
  });

  // Fetch hotels from database
  const { data: hotels = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/hotels"],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Fetch rooms data from database
  const {
    data: allRooms = [],
    isLoading: roomsLoading,
    error: roomsError,
  } = useQuery<any[]>({
    queryKey: ["/api/admin/rooms"],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Debug logging for rooms data
  useEffect(() => {
    console.log("Rooms query status:", {
      allRooms,
      roomsLoading,
      roomsError,
      roomsCount: allRooms?.length,
    });
  }, [allRooms, roomsLoading, roomsError]);

  // Fetch countries for the dropdown
  const { data: countries = [] } = useQuery<any[]>({
    queryKey: ["/api/countries"],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Fetch cities based on selected country
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    null,
  );
  const { data: cities = [] } = useQuery<any[]>({
    queryKey: ["/api/cities"],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Memoize filtered cities to prevent unnecessary re-calculations
  const filteredCities = useMemo(() => {
    if (!selectedCountryId) return cities;
    return cities.filter((city) => city.countryId === selectedCountryId);
  }, [cities, selectedCountryId]);

  // Fetch the package data if in edit mode
  const { data: existingPackageData, isLoading: isLoadingPackage } =
    useQuery<any>({
      queryKey: ["/api-admin/packages", packageId],
      queryFn: async () => {
        if (!packageId) return null;
        try {
          const response = await fetch(`/api-admin/packages/${packageId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch package: ${response.statusText}`);
          }
          const data = await response.json();
          console.log("Fetched package data:", data);
          return data;
        } catch (error) {
          console.error("Error fetching package:", error);
          throw error;
        }
      },
      enabled: isEditMode && !!packageId,
    });

  // Handle click outside tour search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tourSearchRef.current &&
        !tourSearchRef.current.contains(event.target as Node)
      ) {
        setShowTourDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tourSearchRef]);

  // Initialize form with empty values (will be updated when editing)
  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      overview: "",
      price: 0,
      markup: null,
      markupType: "percentage",
      currency: "EGP",
      imageUrl: "",
      galleryUrls: [],
      duration: 1,
      rating: null,
      reviewCount: 0,
      destinationId: null,
      countryId: null,
      cityId: null,
      categoryId: null,
      category: "",
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      validUntil: new Date(new Date().setMonth(new Date().getMonth() + 6)), // Default to 6 months from now
      route: "",
      type: "dynamic",
      maxGroupSize: 15,
      language: "english",
      bestTimeToVisit: "",
      idealFor: [],
      whatToPack: [],
      itinerary: [],
      inclusions: [],
      includedFeatures: [],
      excludedFeatures: [],
      optionalExcursions: [],
      travelRoute: [],
      accommodationHighlights: [],
      transportationDetails: [],
      transportation: "",
      transportationPrice: 0,
      selectedHotels: [],
      rooms: [],
      tourSelection: [],
      selectedTourId: undefined,
      selectedTourIds: [],
      adultCount: 2,
      childrenCount: 0,
      infantCount: 0,
      pricingMode: "per_booking",
      featured: false,
      slug: "",
      // Arabic fields
      hasArabicVersion: false,
      titleAr: "",
      descriptionAr: "",
      shortDescriptionAr: "",
      overviewAr: "",
      bestTimeToVisitAr: "",
      includedFeaturesAr: [],
      excludedFeaturesAr: [],
      cancellationPolicyAr: "",
      childrenPolicyAr: "",
      termsAndConditionsAr: "",
      customTextAr: "",
    },
  });

  // Package mutation (handles both create and update)
  const packageMutation = useMutation({
    mutationFn: async (formData: PackageFormValues) => {
      // Get the main image URL (or a default if none is set)
      const mainImage = images.find((img) => img.isMain);
      // If the preview URL is a blob URL, use a placeholder or existing image
      let mainImageUrl = mainImage
        ? mainImage.preview
        : "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800";
      if (mainImageUrl && mainImageUrl.startsWith("blob:")) {
        // For edit mode, if we have existing data, use the existing image URL
        if (isEditMode && existingPackageData && existingPackageData.imageUrl) {
          mainImageUrl = existingPackageData.imageUrl;
        } else {
          // Otherwise use placeholder
          mainImageUrl =
            "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800";
        }
      }

      // Handle gallery URLs
      let galleryUrls: string[] = [];

      if (
        isEditMode &&
        existingPackageData &&
        existingPackageData.galleryUrls
      ) {
        // For edit mode, if we already have gallery URLs in the database, start with those
        try {
          // Parse the existing gallery URLs
          const existingGalleryUrls: string[] =
            typeof existingPackageData.galleryUrls === "string"
              ? JSON.parse(existingPackageData.galleryUrls)
              : (existingPackageData.galleryUrls as string[]) || [];

          // Then add all non-blob URLs from the images array
          const validNewUrls = images
            .map((img) => img.preview)
            .filter((url) => !url.startsWith("blob:"));

          // Merge the two lists, filtering out duplicates
          // Use Array.from to properly handle the Set to Array conversion for TypeScript
          galleryUrls = Array.from(
            new Set([...existingGalleryUrls, ...validNewUrls]),
          );
        } catch (e) {
          console.error("Error parsing galleryUrls:", e);
          galleryUrls = [];
        }
      } else {
        // For new packages, just use valid URLs
        galleryUrls = images
          .map((img) => img.preview)
          .filter((url) => !url.startsWith("blob:"));
      }

      // Transform the form data to match the API schema
      // Log current form values for debugging
      console.log("Form submission values:", {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        countryId: formData.countryId,
        cityId: formData.cityId,
        category: formData.category,
        categoryId: formData.categoryId,
      });

      // Ensure countryId and cityId are valid numbers
      const countryId = formData.countryId ? Number(formData.countryId) : null;
      const cityId = formData.cityId ? Number(formData.cityId) : null;

      console.log("Parsed countryId:", countryId, "cityId:", cityId);

      const packagePayload = {
        // Basic package information
        title: formData.title,
        shortDescription: formData.shortDescription || "",
        description: formData.description,
        overview: formData.overview || formData.description,
        price: formData.price || 0,
        // Map markup fields to existing database schema
        discountType: formData.markupType || "percentage",
        discountValue: formData.markup || 0,

        // Media
        imageUrl: mainImageUrl,
        galleryUrls: galleryUrls,

        // Location and categorization
        destinationId: formData.category ? parseInt(formData.category) : null,
        category: formData.category, // Map to categoryId on server
        categoryId: formData.categoryId,
        countryId: countryId,
        cityId: cityId,

        // Route and itinerary information
        route: formData.route || "",
        itinerary: itineraryItems,

        // Travel details
        duration:
          formData.startDate && formData.endDate
            ? Math.ceil(
                (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
                  (1000 * 3600 * 24),
              )
            : 7,
        startDate:
          formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endDate:
          formData.endDate ? new Date(formData.endDate).toISOString() :
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        validUntil:
          formData.validUntil ? new Date(formData.validUntil).toISOString() :
          new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // Default to 6 months from now

        // Traveler information
        idealFor: customTravelerTypes,
        adultCount: formData.adultCount,
        childrenCount: formData.childrenCount,
        infantCount: formData.infantCount,
        maxGroupSize: formData.maxGroupSize || 15,

        // Package features and inclusions - Use custom features arrays only
        includedFeatures: customIncludedFeatures,
        inclusions: customIncludedFeatures,
        excludedFeatures: customExcludedFeatures,
        excludedItems: customExcludedFeatures,
        optionalExcursions: optionalExcursions,

        // Accommodation and packing
        accommodationHighlights: accommodationHighlights,
        whatToPack: packItems,
        travelRoute: travelRouteItems,

        // Tour selection
        tourSelection: selectedTours.length > 0 ? selectedTours.map(t => t.id) : formData.selectedTourIds,
        selectedTourIds: selectedTours.length > 0 ? selectedTours.map(t => t.id) : formData.selectedTourIds,

        // Hotel and room selections
        selectedHotels: formData.selectedHotels || [],
        rooms: formData.rooms || [],

        // Transportation
        transportation: formData.transportation || "",
        transportationPrice: formData.transportationPrice || 0,
        transportationDetails: formData.transportationDetails || [],

        // Pricing and metadata
        pricingMode: formData.pricingMode || "per_booking",
        language: formData.language || "english",
        bestTimeToVisit: formData.bestTimeToVisit || "",

        // Additional metadata
        rating: 45,
        featured: true,
        type: "dynamic", // Always set as dynamic for packages created via /admin/packages/create

        // Arabic translation fields
        hasArabicVersion: formData.hasArabicVersion || false,
        titleAr: formData.titleAr || "",
        descriptionAr: formData.descriptionAr || "",
        shortDescriptionAr: formData.shortDescriptionAr || "",
        overviewAr: formData.overviewAr || "",
        bestTimeToVisitAr: formData.bestTimeToVisitAr || "",
        includedFeaturesAr: formData.includedFeaturesAr || [],
        excludedFeaturesAr: formData.excludedFeaturesAr || [],
        cancellationPolicyAr: formData.cancellationPolicyAr || "",
        childrenPolicyAr: formData.childrenPolicyAr || "",
        termsAndConditionsAr: formData.termsAndConditionsAr || "",
        customTextAr: formData.customTextAr || "",
      };

      // Log final payload for debugging
      console.log("Package payload:", packagePayload);

      // Determine if this is an update or create
      const isUpdate = isEditMode && packageId;
      const url = isUpdate
        ? `/api-admin/packages/${packageId}`
        : "/api-admin/packages";

      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packagePayload),
      });

      if (!response.ok) {
        let errorMessage = `Failed to ${isUpdate ? "update" : "create"} package`;
        
        try {
          const errorData = await response.json();
          console.log('API Error Response:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
          
          // If the error contains validation details, include them
          if (errorData.details) {
            errorMessage += `. Details: ${JSON.stringify(errorData.details)}`;
          }
        } catch (parseError) {
          // If we can't parse the response as JSON, try to get text
          try {
            const errorText = await response.text();
            console.log('API Error Text Response:', errorText);
            
            // Check if it's an HTML error page
            if (errorText.includes('<!DOCTYPE html>')) {
              errorMessage += ` (Server returned HTML error page - Status: ${response.status})`;
            } else {
              errorMessage = errorText || errorMessage;
            }
          } catch (textError) {
            console.log('Failed to parse error response:', textError);
            errorMessage += ` (Status: ${response.status})`;
          }
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      queryClient.invalidateQueries({ queryKey: ["/api-admin/packages"] });

      // Show success message
      const action = isEditMode ? "Updated" : "Created";
      toast({
        title: `Package ${action}`,
        description: `The package was ${action.toLowerCase()} successfully`,
        variant: "default",
      });

      if (!isEditMode) {
        // Reset form after successful creation (not after update)
        form.reset();

        // Reset any component state
        setImages([]);
        setSelectedTours([]);
        setSelectedTravellerTypes([]);
        setPackItems([]);
        setItineraryItems([]);
        setExcludedItemsList([]);
        setAccommodationHighlights([]);
        setTravelRouteItems([]);
        setOptionalExcursions([]);
        // Clear custom included/excluded features arrays
        setCustomIncludedFeatures([]);
        setCustomExcludedFeatures([]);
        // Clear custom traveler types array
        setCustomTravelerTypes([]);
        setPricingRules([
          {
            id: "adult",
            value: 100,
            percentage: true,
            name: "Adult (12+ years)",
          },
          {
            id: "child",
            value: 75,
            percentage: true,
            name: "Child (2-11 years)",
          },
          {
            id: "infant",
            value: 0,
            percentage: true,
            name: "Infant (0-23 months)",
          },
        ]);
      }
    },
    onError: (error: Error) => {
      toast({
        title: `Error ${isEditMode ? "updating" : "creating"} package`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = useCallback(
    (data: PackageFormValues) => {
      console.log("=== FORM SUBMISSION STARTED ===");
      console.log("Form submitted", data);
      console.log("allowFormSubmission state:", allowFormSubmission);

      // CRITICAL: Block all automatic submissions
      if (!allowFormSubmission) {
        console.log("🚫 FORM SUBMISSION BLOCKED - Manual trigger required");
        setAllowFormSubmission(false); // Reset to ensure it stays false
        return false;
      }

      console.log("✅ Form submission allowed - proceeding");

      // Check for missing required fields
      const errors = validateFormFields();
      console.log("=== VALIDATION COMPLETE ===");

      if (Object.keys(errors).length > 0) {
        // Show validation hints
        setValidationErrors(errors);
        setShowValidationHints(true);

        // Switch to the first tab with errors
        const firstErrorTab = getFirstTabWithErrors(errors);
        setActiveTab(firstErrorTab);

        // Scroll to top of form
        window.scrollTo({ top: 0, behavior: "smooth" });

        return;
      }

      // Hide validation hints if all fields are valid
      setShowValidationHints(false);
      setValidationErrors({});

      // Use our validation utilities for better error handling

      // 1. Required fields validation
      const requiredFieldsValid = validateRequiredFields(
        data,
        [
          "title",
          "shortDescription",
          "overview",
          "countryId",
          "cityId",
          "category",
          "startDate",
          "endDate",
          "price",
        ],
        {
          title: "Package Name",
          shortDescription: "Short Description", 
          overview: "Overview",
          countryId: "Country",
          cityId: "City",
          category: "Destination",
          startDate: "Start Date",
          endDate: "End Date",
          price: "Base Price",
        },
      );

      if (!requiredFieldsValid) return;

      // 2. Numeric fields validation
      const numericFieldsValid = validateNumericFields(data, [
        { field: "price", label: "Base Price", min: 0.01 },
        { field: "adultCount", label: "Adult Count", min: 1, integer: true },
        {
          field: "childrenCount",
          label: "Children Count",
          min: 0,
          integer: true,
        },
        { field: "infantCount", label: "Infant Count", min: 0, integer: true },
      ]);

      if (!numericFieldsValid) return;

      // 3. Date fields validation
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dateFieldsValid = validateDateFields(
        data,
        [
          {
            field: "startDate",
            label: "Start Date",
            notInPast: true,
          },
          {
            field: "endDate",
            label: "End Date",
            notInPast: true,
          },
        ],
        [
          {
            startField: "startDate",
            endField: "endDate",
            startLabel: "Start Date",
            endLabel: "End Date",
          },
        ],
      );

      if (!dateFieldsValid) return;

      // 4. Custom validations
      const customValidationsValid = validateForm(data, [
        {
          condition:
            data.endDate && data.startDate
              ? data.endDate.getTime() === data.startDate.getTime()
              : false,
          errorMessage: {
            title: "Invalid Duration",
            description: "The package must have at least 1 day duration",
          },
          variant: "destructive",
        },
        {
          condition:
            !customIncludedFeatures || customIncludedFeatures.length === 0,
          errorMessage: {
            title: "No Features Selected",
            description:
              "Please add at least one included feature for the package",
          },
          variant: "destructive",
        },
      ]);

      if (!customValidationsValid) {
        setAllowFormSubmission(false);
        return;
      }

      // All validations passed, proceed with submission
      packageMutation.mutate(data);

      // Reset the permission flag after submission
      setAllowFormSubmission(false);
    },
    [allowFormSubmission],
  );

  // Effect to load package data when in edit mode
  useEffect(() => {
    if (isEditMode && existingPackageData && !isInitialized) {
      console.log(
        "Initializing edit form with package data:",
        existingPackageData,
      );

      // Parse JSON strings into arrays if needed
      const inclusions =
        typeof existingPackageData.inclusions === "string"
          ? JSON.parse(existingPackageData.inclusions)
          : existingPackageData.inclusions || [];

      // Handle gallery URLs, ensuring we have a non-null array even if no images
      let galleryUrls: string[] = [];
      if (existingPackageData.galleryUrls) {
        galleryUrls =
          typeof existingPackageData.galleryUrls === "string"
            ? JSON.parse(existingPackageData.galleryUrls)
            : (existingPackageData.galleryUrls as string[]) || [];
      }

      // If galleryUrls is still null or undefined, use an empty array
      if (!galleryUrls) galleryUrls = [];

      // If we don't have any gallery images but we have a main image, add it to the gallery
      if (galleryUrls.length === 0 && existingPackageData.imageUrl) {
        galleryUrls = [existingPackageData.imageUrl];
      }

      // Make sure the main image is included in the gallery  
      if (existingPackageData.imageUrl && !galleryUrls.includes(existingPackageData.imageUrl)) {
        galleryUrls.unshift(existingPackageData.imageUrl);
      }

      // Log image information for debugging
      console.log("Package main image URL:", existingPackageData.imageUrl);
      console.log("Gallery URLs:", galleryUrls);

      // Create image objects from galleryUrls
      const imageObjects = galleryUrls.map((url: string, index: number) => ({
        id: `existing-${index}`,
        file: null,
        preview: url,
        isMain: url === existingPackageData.imageUrl, // Set main image flag
      }));

      // Ensure at least one image is marked as main
      if (
        imageObjects.length > 0 &&
        !imageObjects.some((img: { isMain: boolean }) => img.isMain)
      ) {
        console.log("No main image found, setting first image as main");
        imageObjects[0].isMain = true;
      }

      // Log the created image objects
      console.log("Created image objects:", imageObjects);

      // Set state values
      setImages(imageObjects);
      setIsInitialized(true);

      // Calculate dates based on duration if not provided
      const today = new Date();
      const startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 7,
      ); // Default to 1 week from now
      const endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 7 + (existingPackageData.duration || 7),
      ); // Default to 1 week duration

      // Try to detect city ID based on the destination name matching a city name
      let cityId = existingPackageData.cityId;
      let countryId = existingPackageData.countryId;
      
      // Find the destination data for this package
      const destination = destinations.find(d => d.id === existingPackageData.destinationId);
      
      if (!cityId && destination) {
        if (destination.city_id) {
          cityId = destination.city_id;
        } else {
          // Try to find a city with the same name as the destination
          const matchedCity = cities.find(
            (city) =>
              city.name === destination.name &&
              (!countryId || city.countryId === countryId),
          );

          if (matchedCity) {
            cityId = matchedCity.id;
            console.log(
              "Matched city by name:",
              matchedCity.name,
              "ID:",
              cityId,
            );
          } else {
            // Hard-coded mappings based on known destination-to-city relationships
            const destinationCityMap: Record<number, number> = {
              1: 1, // Cairo destination → Cairo city
              2: 4, // Dubai destination → Dubai city
              3: 3, // Sharm El Sheikh destination → Sharm El Sheikh city
              4: 7, // Petra destination → Petra city
              5: 8, // Marrakech destination → Marrakech city
            };

            if (destinationCityMap[destination.id]) {
              cityId = destinationCityMap[destination.id];
              console.log(
                "Applied city mapping for destination ID:",
                destination.id,
                "City ID:",
                cityId,
              );
            }
          }
        }
      }

      // Log what we found for debugging
      console.log("Setting form values with:", {
        countryId,
        cityId,
        destinationId: existingPackageData.destinationId,
        category: existingPackageData.destinationId?.toString(),
      });

      // Wait for the country to load cities before setting the form values
      setTimeout(() => {
        // Log the available cities for the selected country
        console.log("Available cities for country ID", countryId, ":", cities);

        // Parse additional field data
        const parsedShortDescription =
          existingPackageData.shortDescription || "";
        const parsedCategoryId = existingPackageData.categoryId || null;
        const parsedIdealFor = existingPackageData.idealFor
          ? typeof existingPackageData.idealFor === "string"
            ? JSON.parse(existingPackageData.idealFor)
            : existingPackageData.idealFor
          : [];
        const parsedRoute = existingPackageData.route || "";
        const parsedWhatToPack = existingPackageData.whatToPack
          ? typeof existingPackageData.whatToPack === "string"
            ? JSON.parse(existingPackageData.whatToPack)
            : existingPackageData.whatToPack
          : [];
        const parsedItinerary = existingPackageData.itinerary
          ? typeof existingPackageData.itinerary === "string"
            ? JSON.parse(existingPackageData.itinerary)
            : existingPackageData.itinerary
          : [];
        const parsedExcludedItems = existingPackageData.excludedItems
          ? typeof existingPackageData.excludedItems === "string"
            ? JSON.parse(existingPackageData.excludedItems)
            : existingPackageData.excludedItems
          : [];
        const parsedAccommodationHighlights =
          existingPackageData.accommodationHighlights
            ? typeof existingPackageData.accommodationHighlights === "string"
              ? JSON.parse(existingPackageData.accommodationHighlights)
              : existingPackageData.accommodationHighlights
            : [];

        // Parse included_features and excluded_features arrays
        const parsedIncludedFeatures = existingPackageData.includedFeatures
          ? typeof existingPackageData.includedFeatures === "string"
            ? JSON.parse(existingPackageData.includedFeatures)
            : existingPackageData.includedFeatures
          : [];
        const parsedExcludedFeatures = existingPackageData.excludedFeatures
          ? typeof existingPackageData.excludedFeatures === "string"
            ? JSON.parse(existingPackageData.excludedFeatures)
            : existingPackageData.excludedFeatures
          : [];

        // Set component state for complex fields
        setSelectedTravellerTypes(parsedIdealFor);
        setPackItems(parsedWhatToPack);
        setItineraryItems(parsedItinerary);
        setExcludedItemsList(parsedExcludedItems);
        setAccommodationHighlights(parsedAccommodationHighlights);
        
        // Set custom included and excluded features state (ensure fresh arrays)
        setCustomIncludedFeatures([...parsedIncludedFeatures]);
        setCustomExcludedFeatures([...parsedExcludedFeatures]);
        
        // Set custom traveler types state (ensure fresh array)
        setCustomTravelerTypes([...parsedIdealFor]);

        // Parse Arabic fields
        const parsedIncludedFeaturesAr = existingPackageData.includedFeaturesAr
          ? typeof existingPackageData.includedFeaturesAr === "string"
            ? JSON.parse(existingPackageData.includedFeaturesAr)
            : existingPackageData.includedFeaturesAr
          : [];
        const parsedExcludedFeaturesAr = existingPackageData.excludedFeaturesAr
          ? typeof existingPackageData.excludedFeaturesAr === "string"
            ? JSON.parse(existingPackageData.excludedFeaturesAr)
            : existingPackageData.excludedFeaturesAr
          : [];

        // Set selected tour if exists
        // Handle multiple tour IDs from existing package data
        if (existingPackageData.selectedTourIds && Array.isArray(existingPackageData.selectedTourIds)) {
          const selectedTourObjects = tours.filter(
            (t) => existingPackageData.selectedTourIds.includes(t.id)
          );
          setSelectedTours(selectedTourObjects);
        } else if (existingPackageData.selectedTourId) {
          // Backward compatibility for single tour ID
          const tour = tours.find(
            (t) => t.id === existingPackageData.selectedTourId,
          );
          if (tour) {
            setSelectedTours([tour]);
          }
        }

        // Parse hotel and room data from database
        const parsedSelectedHotels = existingPackageData.selectedHotels
          ? typeof existingPackageData.selectedHotels === "string"
            ? JSON.parse(existingPackageData.selectedHotels)
            : existingPackageData.selectedHotels
          : [];
        const parsedRooms = existingPackageData.rooms
          ? typeof existingPackageData.rooms === "string"
            ? JSON.parse(existingPackageData.rooms)
            : existingPackageData.rooms
          : [];

        // Log hotel and room data loading for debugging
        console.log("Loading hotel and room data from database:");
        console.log("- Selected Hotels:", parsedSelectedHotels);
        console.log("- Rooms:", parsedRooms);

        // Set component state for hotels and rooms
        if (Array.isArray(parsedSelectedHotels) && parsedSelectedHotels.length > 0) {
          // Convert hotel IDs to strings if they aren't already
          const hotelIds = parsedSelectedHotels.map(h => String(h));
          console.log("Setting selectedHotels state:", hotelIds);
          
          // Update available rooms based on selected hotels
          const hotelRooms = allRooms.filter(room => 
            hotelIds.includes(String(room.hotelId || room.hotel_id))
          );
          setAvailableRooms(hotelRooms);
          console.log("Available rooms for selected hotels:", hotelRooms);
        }

        if (Array.isArray(parsedRooms) && parsedRooms.length > 0) {
          setSelectedHotelRooms(parsedRooms);
          console.log("Setting selectedHotelRooms state:", parsedRooms);
        }

        // Set form values with correct field names matching schema
        form.reset({
          title: existingPackageData.title || "",
          description: existingPackageData.description || "",
          shortDescription: parsedShortDescription,
          overview: existingPackageData.overview || existingPackageData.description || "",
          price: existingPackageData.price || 0,
          // Map from existing database schema
          markup: existingPackageData.discountValue || null,
          markupType: existingPackageData.discountType || "percentage",
          currency: existingPackageData.currency || "EGP",
          imageUrl: existingPackageData.imageUrl || "",
          galleryUrls: galleryUrls,
          duration: existingPackageData.duration || 7,
          countryId: countryId,
          cityId: cityId,
          destinationId: existingPackageData.destinationId,
          category: existingPackageData.destinationId?.toString() || undefined,
          categoryId: parsedCategoryId,
          route: parsedRoute,
          // Set dates with sensible defaults
          startDate: startDate,
          endDate: endDate,
          validUntil: existingPackageData.validUntil ? new Date(existingPackageData.validUntil) : new Date(new Date().setMonth(new Date().getMonth() + 6)),
          pricingMode: "per_booking", // Default if not available
          includedFeatures: [], // Keep form field empty, use component state instead
          excludedFeatures: [], // Keep form field empty, use component state instead
          excludedItems: parsedExcludedItems,
          idealFor: [], // Keep form field empty, use component state instead
          whatToPack: parsedWhatToPack,
          itinerary: parsedItinerary,
          accommodationHighlights: parsedAccommodationHighlights,
          selectedTourId: existingPackageData.selectedTourId,
          selectedTourIds: existingPackageData.selectedTourIds || [],
          selectedHotels: Array.isArray(parsedSelectedHotels) ? parsedSelectedHotels.map(h => String(h)) : [],
          rooms: Array.isArray(parsedRooms) ? parsedRooms : [],
          adultCount: existingPackageData.adultCount || 2,
          childrenCount: existingPackageData.childrenCount || 0,
          infantCount: existingPackageData.infantCount || 0,
          maxGroupSize: existingPackageData.maxGroupSize || 15,
          featured: existingPackageData.featured || false,
          slug: existingPackageData.slug || "",
          // Arabic fields
          hasArabicVersion: existingPackageData.hasArabicVersion || false,
          titleAr: existingPackageData.titleAr || "",
          descriptionAr: existingPackageData.descriptionAr || "",
          shortDescriptionAr: existingPackageData.shortDescriptionAr || "",
          overviewAr: existingPackageData.overviewAr || "",
          bestTimeToVisitAr: existingPackageData.bestTimeToVisitAr || "",
          includedFeaturesAr: parsedIncludedFeaturesAr,
          excludedFeaturesAr: parsedExcludedFeaturesAr,
          cancellationPolicyAr: existingPackageData.cancellationPolicyAr || "",
          childrenPolicyAr: existingPackageData.childrenPolicyAr || "",
          termsAndConditionsAr: existingPackageData.termsAndConditionsAr || "",
          customTextAr: existingPackageData.customTextAr || "",
        });

        // Force update the form control values directly as a backup
        form.setValue("countryId", countryId);
        form.setValue("cityId", cityId);
        form.setValue("categoryId", parsedCategoryId);
        form.setValue("shortDescription", parsedShortDescription);
        form.setValue("route", parsedRoute);
        
        // Force set hotel and room data in form
        if (Array.isArray(parsedSelectedHotels) && parsedSelectedHotels.length > 0) {
          const hotelIds = parsedSelectedHotels.map(h => String(h));
          form.setValue("selectedHotels", hotelIds);
          console.log("Force set selectedHotels in form:", hotelIds);
        }
        
        if (Array.isArray(parsedRooms) && parsedRooms.length > 0) {
          form.setValue("rooms", parsedRooms);
          console.log("Force set rooms in form:", parsedRooms);
        }
        
        // Update the selected country state to enable city filtering
        if (countryId) {
          setSelectedCountryId(countryId);
          console.log("Updated selectedCountryId state to:", countryId);
        }

        // Set initial form data for change tracking
        const currentFormData = form.getValues();
        setInitialFormData(currentFormData);

        console.log("Form values set:", currentFormData);
      }, 800); // Give a longer delay to ensure cities are loaded
    }
  }, [
    existingPackageData,
    isEditMode,
    form,
    isInitialized,
    destinations,
    countries,
    cities,
  ]);

  // Watch form changes to track unsaved changes (after form is initialized)
  const formValues = form.watch();

  useEffect(() => {
    if (initialFormData) {
      const hasChanges =
        JSON.stringify(formValues) !== JSON.stringify(initialFormData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [formValues, initialFormData]);

  // Listen for navigate requests from the parent component
  useEffect(() => {
    const handleNavigateRequest = () => {
      handleNavigateWithWarning("/admin/packages");
    };

    window.addEventListener("navigate-request", handleNavigateRequest);
    return () => {
      window.removeEventListener("navigate-request", handleNavigateRequest);
    };
  }, [hasUnsavedChanges]);

  // Effect to initialize rooms when component loads
  useEffect(() => {
    // This would normally be an API call in a real app
    const adultCount = form.getValues("adultCount") || 2;
    const childrenCount = form.getValues("childrenCount") || 0;
    const infantCount = form.getValues("infantCount") || 0;

    setAvailableRooms(allRooms);
    filterRoomsByCapacity(allRooms, adultCount, childrenCount, infantCount);
  }, []);

  const handleHotelSelectionChange = (selectedHotelIds: string[]) => {
    console.log("🏨 HOTEL SELECTION CHANGED:", selectedHotelIds);
    form.setValue("selectedHotels", selectedHotelIds);
    updateAvailableRooms(selectedHotelIds);

    // Force re-render by triggering form watch
    setTimeout(() => {
      console.log(
        "Current selectedHotels from form:",
        form.watch("selectedHotels"),
      );
    }, 100);
  };

  const updateAvailableRooms = (selectedHotelIds: string[]) => {
    console.log("🏨 HOTEL SELECTION CHANGED:", selectedHotelIds);
    console.log("📊 All rooms in database:", allRooms.length, "rooms");

    if (selectedHotelIds.length === 0) {
      console.log("❌ No hotels selected - clearing available rooms");
      setAvailableRooms([]);
      setFilteredRooms([]);
      return;
    }

    const hotelRooms = allRooms.filter((room) => {
      // Handle both camelCase and snake_case field names
      const roomHotelId = room.hotelId || room.hotel_id;
      // Convert both to strings for comparison since hotels API returns string IDs
      const matches = selectedHotelIds.includes(String(roomHotelId));
      console.log(
        `🏠 Room "${room.name}": hotel_id=${roomHotelId}, matches=${matches ? "✅" : "❌"}`,
      );
      return matches;
    });

    console.log(
      "🔄 Rooms for selected hotels:",
      hotelRooms.length,
      "rooms found",
    );
    setAvailableRooms(hotelRooms);

    const adultCount = form.getValues("adultCount") || 2;
    const childrenCount = form.getValues("childrenCount") || 0;
    const infantCount = form.getValues("infantCount") || 0;

    filterRoomsByCapacity(hotelRooms, adultCount, childrenCount, infantCount);

    // Force re-render by updating form state
    form.trigger("selectedHotels");
  };

  // Function to handle tour selection (multiple tours)
  const handleTourSelection = (tour: Tour) => {
    // Check if tour is already selected
    if (selectedTours.find(t => t.id === tour.id)) {
      return; // Don't add duplicate tours
    }
    
    const updatedTours = [...selectedTours, tour];
    setSelectedTours(updatedTours);
    form.setValue("selectedTourIds", updatedTours.map(t => t.id));
    setTourSearchQuery("");
    setShowTourDropdown(false);
  };

  const handleRemoveTour = (tourId: number) => {
    const updatedTours = selectedTours.filter(tour => tour.id !== tourId);
    setSelectedTours(updatedTours);
    form.setValue("selectedTourIds", updatedTours.map(t => t.id));
  };

  // Function to handle adding route stops
  const handleAddRouteStop = () => {
    if (newRouteStop.trim()) {
      const updatedRouteItems = [...travelRouteItems, newRouteStop.trim()];
      setTravelRouteItems(updatedRouteItems);
      form.setValue("travelRoute", updatedRouteItems);
      setNewRouteStop("");
    }
  };

  // Function to remove a route stop
  const handleRemoveRouteStop = (index: number) => {
    const updatedRouteItems = travelRouteItems.filter((_, i) => i !== index);
    setTravelRouteItems(updatedRouteItems);
    form.setValue("travelRoute", updatedRouteItems);
  };

  // Function to clear all route stops
  const handleClearRoute = () => {
    setTravelRouteItems([]);
    form.setValue("travelRoute", []);
  };

  // Function to handle adding optional excursions
  const handleAddExcursion = () => {
    if (newExcursion.trim()) {
      const updatedExcursions = [...optionalExcursions, newExcursion.trim()];
      setOptionalExcursions(updatedExcursions);
      form.setValue("optionalExcursions", updatedExcursions);
      setNewExcursion("");
    }
  };

  // Handler for adding custom included features
  const handleAddIncludedFeature = () => {
    if (newIncludedFeature.trim()) {
      const updatedFeatures = [...customIncludedFeatures, newIncludedFeature.trim()];
      setCustomIncludedFeatures(updatedFeatures);
      form.setValue("includedFeatures", updatedFeatures);
      setNewIncludedFeature("");
    }
  };

  // Handler for removing custom included features
  const handleRemoveIncludedFeature = (index: number) => {
    const updatedFeatures = customIncludedFeatures.filter((_, i) => i !== index);
    setCustomIncludedFeatures(updatedFeatures);
    form.setValue("includedFeatures", updatedFeatures);
  };

  // Handler for adding custom excluded features
  const handleAddExcludedFeature = () => {
    if (newExcludedFeature.trim()) {
      const updatedFeatures = [...customExcludedFeatures, newExcludedFeature.trim()];
      setCustomExcludedFeatures(updatedFeatures);
      form.setValue("excludedFeatures", updatedFeatures);
      setNewExcludedFeature("");
    }
  };

  // Handler for removing custom excluded features
  const handleRemoveExcludedFeature = (index: number) => {
    const updatedFeatures = customExcludedFeatures.filter((_, i) => i !== index);
    setCustomExcludedFeatures(updatedFeatures);
    form.setValue("excludedFeatures", updatedFeatures);
  };

  // Handler for adding custom traveler types
  const handleAddTravelerType = () => {
    if (newTravelerType.trim()) {
      const updatedTypes = [...customTravelerTypes, newTravelerType.trim()];
      setCustomTravelerTypes(updatedTypes);
      form.setValue("idealFor", updatedTypes);
      setNewTravelerType("");
    }
  };

  // Handler for removing custom traveler types
  const handleRemoveTravelerType = (index: number) => {
    const updatedTypes = customTravelerTypes.filter((_, i) => i !== index);
    setCustomTravelerTypes(updatedTypes);
    form.setValue("idealFor", updatedTypes);
  };

  // Function to filter tours based on search query
  const getFilteredTours = () => {
    // Ensure tours is an array
    if (!Array.isArray(tours) || tours.length === 0) {
      return [];
    }

    if (!tourSearchQuery.trim()) {
      // If empty query, return all tours sorted by ID (most recent first)
      return [...tours]
        .filter((tour) => tour && tour.id && tour.name) // Filter out invalid entries
        .sort((a, b) => (b.id || 0) - (a.id || 0))
        .slice(0, 10);
    }

    // Otherwise filter by name match
    return tours.filter(
      (tour) =>
        tour &&
        tour.name &&
        tour.name.toLowerCase().includes(tourSearchQuery.toLowerCase()),
    );
  };

  const filterRoomsByCapacity = (
    rooms: any[],
    adults: number,
    children: number,
    infants: number,
  ) => {
    console.log("Filtering rooms by capacity:", { adults, children, infants });
    console.log("Available rooms:", rooms);

    const filtered = rooms.filter((room) => {
      // Check detailed capacity constraints
      const maxAdults = room.max_adults || room.maxAdults || 2;
      const maxChildren = room.max_children || room.maxChildren || 0;
      const maxInfants = room.max_infants || room.maxInfants || 0;
      const maxOccupancy = room.max_occupancy || room.maxOccupancy || 2;

      // Check if room can accommodate the specific guest types
      const canAccommodateAdults = adults <= maxAdults;
      const canAccommodateChildren = children <= maxChildren;
      const canAccommodateInfants = infants <= maxInfants;
      const canAccommodateTotal = (adults + children + infants) <= maxOccupancy;

      const meetsCapacity = canAccommodateAdults && canAccommodateChildren && canAccommodateInfants && canAccommodateTotal;

      console.log(
        `Room "${room.name}": adults=${adults}/${maxAdults}(${canAccommodateAdults}), children=${children}/${maxChildren}(${canAccommodateChildren}), infants=${infants}/${maxInfants}(${canAccommodateInfants}), total=${adults + children + infants}/${maxOccupancy}(${canAccommodateTotal}), meets=${meetsCapacity ? "✅" : "❌"}`,
      );

      return meetsCapacity;
    });

    console.log("Filtered rooms:", filtered);
    setFilteredRooms(filtered);

    // Clear selected rooms that no longer match criteria
    const currentSelectedRooms = form.getValues("rooms") || [];
    const validRoomIds = filtered.map((room) => room.id);
    const validSelectedRooms = currentSelectedRooms.filter((room) =>
      validRoomIds.includes(room.id),
    );
    form.setValue("rooms", validSelectedRooms);
  };

  const handlePricingRuleChange = (
    id: string,
    field: "value" | "percentage",
    value: number | boolean,
  ) => {
    setPricingRules((prev) =>
      prev.map((rule) =>
        rule.id === id
          ? {
              ...rule,
              [field]: field === "percentage" ? value : Number(value),
            }
          : rule,
      ),
    );
  };

  // Reference to hidden file input
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Process each file
      for (const file of files) {
        // Create a temporary URL for preview until upload completes
        const tempPreview = URL.createObjectURL(file);

        // Read the file as base64
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async () => {
          try {
            // Upload the image to the server
            const response = await fetch("/api/upload-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                image: reader.result,
                type: file.name.split(".").pop() || "jpeg",
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to upload image");
            }

            const data = await response.json();
            const serverUrl = data.imageUrl; // URL to the uploaded image on the server

            // Set as main image if this is the first image
            const isFirstImage = images.length === 0;

            // Add to images array with the permanent server URL
            const newImage = {
              id: Math.random().toString(36).substring(7),
              file: null, // We don't need to keep the file object anymore
              preview: serverUrl, // Use the server URL instead of blob URL
              isMain: isFirstImage,
            };

            setImages((prev) => [...prev, newImage]);

            // Clean up the temporary blob URL
            URL.revokeObjectURL(tempPreview);
          } catch (error) {
            console.error("Error uploading image:", error);
            toast({
              title: "Error uploading image",
              description: `Failed to upload ${file.name} to server`,
              variant: "destructive",
            });
          }
        };
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const setMainImage = (id: string) => {
    setImages((prev) =>
      prev.map((image) => ({
        ...image,
        isMain: image.id === id,
      })),
    );
  };

  const addImage = () => {
    // Trigger the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Hotel filtering function
  const getFilteredHotels = useCallback(() => {
    if (!hotelSearchQuery.trim()) {
      return hotels;
    }

    const searchQuery = hotelSearchQuery.toLowerCase().trim();
    
    return hotels.filter((hotel) => {
      // Search by hotel name
      const nameMatch = hotel.name.toLowerCase().includes(searchQuery);
      
      // Search by destination/city
      const cityMatch = hotel.city?.toLowerCase().includes(searchQuery);
      const countryMatch = hotel.country?.toLowerCase().includes(searchQuery);
      
      // Search by ID (convert to string for comparison)
      const idMatch = hotel.id.toString().includes(searchQuery);
      
      return nameMatch || cityMatch || countryMatch || idMatch;
    });
  }, [hotels, hotelSearchQuery]);

  // Validation helper functions
  const validateFormFields = useCallback(() => {
    const formData = form.getValues();
    const errors: { [key: string]: string[] } = {};

    // Basic Info tab validation
    const basicErrors: string[] = [];
    if (!formData.title || formData.title.trim().length < 3) {
      basicErrors.push("Package Name");
    }
    if (
      !formData.shortDescription ||
      formData.shortDescription.trim().length < 5
    ) {
      basicErrors.push("Short Description");
    }
    if (
      !formData.countryId ||
      formData.countryId === null ||
      formData.countryId === 0
    ) {
      basicErrors.push("Country");
    }
    if (!formData.cityId || formData.cityId === null || formData.cityId === 0) {
      basicErrors.push("City");
    }
    if (
      !formData.categoryId ||
      formData.categoryId === null ||
      formData.categoryId === 0
    ) {
      basicErrors.push("Package Category");
    }
    if (!formData.overview || formData.overview.trim().length < 10) {
      basicErrors.push("Overview");
    }
    if (basicErrors.length > 0) {
      errors["Basic Info"] = basicErrors;
    }

    // Pricing Rules tab validation
    const pricingErrors: string[] = [];
    if (!formData.price || formData.price <= 0) {
      pricingErrors.push("Base Price");
    }
    if (!formData.startDate) {
      pricingErrors.push("Start Date");
    }
    if (!formData.endDate) {
      pricingErrors.push("End Date");
    }
    if (pricingErrors.length > 0) {
      errors["Pricing Rules"] = pricingErrors;
    }

    return errors;
  }, [form]);

  const getFirstTabWithErrors = (errors: { [key: string]: string[] }) => {
    const tabOrder = [
      "basic",
      "pricing",
      "accommodation",
      "features",
      "itinerary",
      "packing",
      "route",
    ];
    const errorTabs = Object.keys(errors);

    for (const tab of tabOrder) {
      if (tab === "basic" && errorTabs.includes("Basic Info")) return "basic";
      if (tab === "pricing" && errorTabs.includes("Pricing Rules"))
        return "pricing";
      if (tab === "accommodation" && errorTabs.includes("Hotel & Rooms"))
        return "accommodation";
      if (tab === "features" && errorTabs.includes("Features"))
        return "features";
      if (tab === "itinerary" && errorTabs.includes("Itinerary"))
        return "itinerary";
      if (tab === "packing" && errorTabs.includes("What to Pack"))
        return "packing";
      if (tab === "route" && errorTabs.includes("Travel Route")) return "route";
    }
    return "basic";
  };

  const removeImage = (id: string) => {
    // Find the image to remove
    const imageToRemove = images.find((img) => img.id === id);
    const wasMainImage = imageToRemove?.isMain || false;

    // Revoke object URL to prevent memory leaks
    if (
      imageToRemove &&
      imageToRemove.preview &&
      !imageToRemove.preview.startsWith("https://placehold.co")
    ) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    // Remove from state
    const updatedImages = images.filter((image) => image.id !== id);

    // If we removed the main image and there are other images, set the first one as main
    if (wasMainImage && updatedImages.length > 0) {
      updatedImages[0].isMain = true;
    }

    setImages(updatedImages);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();

          if (!allowFormSubmission) {
            console.log("🚫 BLOCKED: Form auto-submission prevented");
            return false;
          }

          console.log("✅ ALLOWED: Manual form submission proceeding");
          onSubmit(form.getValues());
        }}
        className="space-y-8"
      >
        <div className="mb-6">
          <FormRequiredFieldsNote />
          {packageMutation.isError && (
            <FormValidationAlert
              status="error"
              title={
                isEditMode ? "Package Update Failed" : "Package Creation Failed"
              }
              message={
                packageMutation.error?.message ||
                `An error occurred while ${isEditMode ? "updating" : "creating"} the package. Please check the form data and try again.`
              }
              className="mt-3"
            />
          )}

          {/* Enhanced Validation Requirements */}
          {showValidationHints && Object.keys(validationErrors).length > 0 && (
            <FormRequirementsAlert
              missingFields={validationErrors}
              className="mt-4"
            />
          )}
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Rules</TabsTrigger>
            <TabsTrigger value="accommodation">Hotel & Rooms</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="whatTopack">What to Pack</TabsTrigger>
            <TabsTrigger value="travelRoute">Travel Route</TabsTrigger>
            <TabsTrigger value="arabic">
              <Languages className="h-4 w-4 mr-1" />
              Arabic
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Package Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="package-title"
                        className="package-title-input admin-input"
                        placeholder="Enter package name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Short Description */}
              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Short Description{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="package-short-description"
                        className="package-short-description-input admin-input"
                        placeholder="Brief description for package listings"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A short summary that will appear in package listings (min
                      5 characters, max 200 characters).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Country Selection */}
              <FormField
                control={form.control}
                name="countryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const countryId = parseInt(value);
                        console.log("Country selection changed to:", countryId);
                        field.onChange(countryId);
                        setSelectedCountryId(countryId);
                        // Reset cityId when country changes
                        form.setValue("cityId", null as any);

                        // Log available cities for the selected country
                        const filteredCities = Array.isArray(cities)
                          ? cities.filter(
                              (city) => city.countryId === countryId,
                            )
                          : [];
                        console.log(
                          "Available cities for country",
                          countryId,
                          ":",
                          filteredCities,
                        );
                      }}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger
                          id="package-country"
                          className="country-select admin-select"
                        >
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country: any) => (
                          <SelectItem
                            key={country.id}
                            value={country.id.toString()}
                          >
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City Selection */}
              <FormField
                control={form.control}
                name="cityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                      }}
                      value={field.value?.toString()}
                      disabled={!selectedCountryId && !form.getValues("countryId")}
                    >
                      <FormControl>
                        <SelectTrigger
                          id="package-city"
                          className="city-select admin-select"
                        >
                          <SelectValue
                            placeholder={
                              selectedCountryId || form.getValues("countryId")
                                ? "Select a city"
                                : "Select a country first"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(cities) &&
                          cities
                            .filter(
                              (city: any) => {
                                const currentCountryId = selectedCountryId || form.getValues("countryId");
                                return currentCountryId && (city.countryId === currentCountryId || Number(city.countryId) === Number(currentCountryId));
                              }
                            )
                            .map((city: any) => (
                              <SelectItem
                                key={city.id}
                                value={city.id.toString()}
                              >
                                {city.name}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Destination Selection */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          id="package-destination"
                          className="destination-select admin-select"
                        >
                          <SelectValue placeholder="Select a destination" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {destinations.map((destination: any) => (
                          <SelectItem
                            key={destination.id}
                            value={destination.id.toString()}
                          >
                            {destination.name}, {destination.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the destination for this package
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Package Category{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger
                          id="package-category"
                          className="category-select admin-select"
                        >
                          <SelectValue placeholder="Select a package category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {packageCategories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the category that best describes this package.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      id="package-short-description"
                      className="min-h-[80px] package-short-description-input admin-textarea"
                      placeholder="Enter a brief description (min 5 characters, max 200 characters)"
                      maxLength={200}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief summary that appears in package listings
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="overview"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overview</FormLabel>
                  <FormControl>
                    <Textarea
                      id="package-overview"
                      className="min-h-[120px] package-description-input admin-textarea"
                      placeholder="Enter package overview"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Base Price (EGP) <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-zinc-500">
                        EGP
                      </span>
                      <Input
                        id="package-price"
                        className="pl-7 package-price-input admin-currency-input"
                        type="number"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    The base price for this package
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Markup Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="markupType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Markup Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select markup type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount (EGP)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose how the markup is calculated
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="markup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Markup {form.watch("markupType") === "percentage" ? "(%)" : "(EGP)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step={form.watch("markupType") === "percentage" ? "0.1" : "1"}
                        placeholder={form.watch("markupType") === "percentage" ? "e.g., 15" : "Enter amount"}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormDescription>
                      {form.watch("markupType") === "percentage" 
                        ? "Enter percentage (0-100)" 
                        : "Enter fixed amount in EGP"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Language Selection */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.id} value={language.id}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Primary language for this package tour.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Max Group Size */}
            <FormField
              control={form.control}
              name="maxGroupSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Group Size</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="15" {...field} />
                  </FormControl>
                  <FormDescription>
                    Maximum number of travelers in the group.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Best Time to Visit */}
            <FormField
              control={form.control}
              name="bestTimeToVisit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Best Time to Visit</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., October to April" {...field} />
                  </FormControl>
                  <FormDescription>
                    Recommended season or months for this tour.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location/Route */}
            <FormField
              control={form.control}
              name="route"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route/Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cairo to Aswan" {...field} />
                  </FormControl>
                  <FormDescription>
                    The specific route or location of this tour.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ideal For */}
            <FormField
              control={form.control}
              name="idealFor"
              render={() => (
                <FormItem>
                  <FormLabel>Ideal For</FormLabel>
                  <div className="space-y-2">
                    {travellerTypes.map((type) => (
                      <div
                        className="flex items-center space-x-2"
                        key={type.id}
                      >
                        <Checkbox
                          id={`ideal-for-${type.id}`}
                          checked={selectedTravellerTypes.includes(type.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTravellerTypes([
                                ...selectedTravellerTypes,
                                type.id,
                              ]);
                              form.setValue("idealFor", [
                                ...selectedTravellerTypes,
                                type.id,
                              ]);
                            } else {
                              const filtered = selectedTravellerTypes.filter(
                                (id) => id !== type.id,
                              );
                              setSelectedTravellerTypes(filtered);
                              form.setValue("idealFor", filtered);
                            }
                          }}
                        />
                        <label
                          htmlFor={`ideal-for-${type.id}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormDescription>
                    Select all traveler types this package is suitable for.
                  </FormDescription>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Package Valid Until</FormLabel>
                    <FormDescription>
                      This package can be booked until this date
                    </FormDescription>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">
                {t("gallery_images", "Gallery Images")} <span className="text-destructive">*</span>
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                <span className="text-destructive">*</span> {t("gallery_images_required", "At least one image is required. Upload images to the package gallery. The first or featured image will be used as the main image.")}
              </p>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`relative ${image.isMain ? "ring-2 ring-primary" : ""}`}
                  >
                    <img
                      src={image.preview}
                      alt="Gallery preview"
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6 rounded-full bg-white"
                        onClick={() => setMainImage(image.id)}
                        title={image.isMain ? "Main image" : "Set as main image"}
                      >
                        <Star 
                          size={14} 
                          className={image.isMain ? "text-amber-500 fill-amber-500" : "text-amber-500"} 
                        />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => removeImage(image.id)}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                    {image.isMain && (
                      <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-md">
                        {t("main_photo", "Main Photo")}
                      </div>
                    )}
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addImage}
                    className="h-32 border-dashed flex flex-col items-center justify-center gap-2"
                  >
                    <ImagePlus size={24} />
                    <span className="text-sm">Add Images</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-32 border-dashed flex flex-col items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10"
                    onClick={() => {
                      // Get values from form
                      const overview = form.getValues("overview");
                      const cityName =
                        cities.find(
                          (city) => city.id === form.getValues("cityId"),
                        )?.name || "Cairo";

                      if (!overview || overview.length < 10) {
                        toast({
                          title: "Missing Information",
                          description:
                            "Please enter a package overview first (minimum 10 characters)",
                          variant: "destructive",
                        });
                        return;
                      }

                      setAiGenerating(true);

                      // Call the API
                      fetch("/api/admin/packages/generate-image", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ overview, city: cityName }),
                      })
                        .then((response) => {
                          if (!response.ok) {
                            throw new Error("Failed to generate image");
                          }
                          return response.json();
                        })
                        .then((data) => {
                          if (data.imageUrl) {
                            // Create a new image object
                            const newImage = {
                              id: Math.random().toString(36).substring(7),
                              file: null, // AI generated images don't have a file
                              preview: data.imageUrl,
                              isMain: images.length === 0, // Make it main if it's the first image
                            };

                            setImages((prev) => [...prev, newImage]);

                            toast({
                              title: "Image Generated",
                              description:
                                "AI has generated a new image for your package",
                              variant: "default",
                            });
                          }
                        })
                        .catch((error) => {
                          console.error("Error generating image:", error);
                          toast({
                            title: "Generation Failed",
                            description:
                              error.message || "Failed to generate image",
                            variant: "destructive",
                          });
                        })
                        .finally(() => {
                          setAiGenerating(false);
                        });
                    }}
                    disabled={aiGenerating}
                  >
                    {aiGenerating ? (
                      <>
                        <Loader2 size={24} className="animate-spin" />
                        <span className="text-sm">Generating...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <path d="M12 2c1.5 0 3 1.5 3 3 0 1.4-.7 2.7-1.8 3.2.6.2 1.2.5 1.8.8 1 .5 1.3 1.8.8 2.7-.5.9-1.8 1.3-2.7.8-.7-.4-1.3-.6-2.1-.6s-1.4.2-2.1.6c-1 .5-2.2.2-2.7-.8-.5-1-.2-2.2.8-2.7.6-.3 1.2-.6 1.8-.8C7.7 7.7 7 6.4 7 5c0-1.5 1.5-3 3-3Z" />
                          <path d="M19 16.1c-1.1.6-2.5.1-3.1-1.1-.6-1.1-.2-2.5.9-3.1 1.1-.6 2.5-.1 3.1 1.1.7 1.1.2 2.5-.9 3.1Z" />
                          <path d="M9 14c.3 2.1-1.1 4-3 4-1.5 0-3-1.5-3-3 0-1.4.7-2.7 1.8-3.2-.6-.2-1.2-.5-1.8-.8-1-.5-1.3-1.8-.8-2.7.5-.9 1.7-1.3 2.7-.8.7.4 1.3.6 2.1.6" />
                          <path d="M21 12c0 4.4-3.6 8-8 8" />
                          <path d="M14 19c-1.9 1.9-5.1 2-7 0" />
                        </svg>
                        <span className="text-sm">AI Generate Image</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Pricing Rules Tab */}
          <TabsContent value="pricing" className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="pricingMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pricing Mode</FormLabel>
                  <div className="flex flex-col space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="per_booking"
                          value="per_booking"
                          checked={field.value === "per_booking"}
                          onChange={() => field.onChange("per_booking")}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="per_booking"
                          className="text-sm font-medium"
                        >
                          Per Booking
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="per_percentage"
                          value="per_percentage"
                          checked={field.value === "per_percentage"}
                          onChange={() => field.onChange("per_percentage")}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="per_percentage"
                          className="text-sm font-medium"
                        >
                          Per Percentage
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="per_amount"
                          value="per_amount"
                          checked={field.value === "per_amount"}
                          onChange={() => field.onChange("per_amount")}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="per_amount"
                          className="text-sm font-medium"
                        >
                          Per Amount
                        </label>
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hotel Room Pricing Section */}
            {filteredRooms.length > 0 && (
              <div className="mb-6 border rounded-md p-4">
                <h3 className="text-lg font-semibold mb-2">
                  Hotel Room Pricing
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure pricing for each selected room based on capacity
                </p>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room Name</TableHead>
                      <TableHead>Hotel</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Price/Night</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell>{room.name}</TableCell>
                        <TableCell>{room.hotelName}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {room.maxAdults} Adults
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {room.maxChildren} Children
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {room.maxInfants} Infants
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const selectedRoom = form.watch("rooms")?.find(r => r.id === room.id);
                            return selectedRoom ? (
                              <Input
                                type="number"
                                min="0"
                                value={selectedRoom.customPrice || selectedRoom.price || 0}
                                onChange={(e) => {
                                  const currentRooms = form.getValues("rooms") || [];
                                  const updatedRooms = currentRooms.map((r) =>
                                    r.id === room.id
                                      ? { ...r, customPrice: Number(e.target.value) }
                                      : r,
                                  );
                                  form.setValue("rooms", updatedRooms);
                                  console.log("Updated room pricing:", updatedRooms);
                                }}
                                className="w-24"
                              />
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                Select room to set custom price
                              </span>
                            );
                          })()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="text-sm text-muted-foreground mt-4">
                  <span className="font-medium">Note:</span> Room prices will be
                  adjusted based on the selected pricing mode and traveler rules
                  below
                </div>
              </div>
            )}

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2 mb-4">
                  <h3 className="text-base font-medium">
                    Traveler Pricing Rules
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Set prices per traveler type using either a percentage of
                    the base price or a fixed amount in L.E.
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Traveler Type</TableHead>
                      <TableHead>Price Value</TableHead>
                      <TableHead>Pricing Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>{rule.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={rule.value}
                            onChange={(e) =>
                              handlePricingRuleChange(
                                rule.id,
                                "value",
                                e.target.value ? parseInt(e.target.value) : 0,
                              )
                            }
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={rule.percentage}
                                onCheckedChange={(checked) =>
                                  handlePricingRuleChange(
                                    rule.id,
                                    "percentage",
                                    checked,
                                  )
                                }
                              />
                              <span className="text-sm font-medium">
                                {rule.percentage ? "%" : "L.E"}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {rule.percentage
                                ? `(${rule.value}% of base price)`
                                : `(Fixed amount: ${rule.value} L.E)`}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      (filteredRooms?.length || 0) > 0 &&
                      (form.getValues("rooms")?.length || 0) > 0
                    }
                    onClick={() => {
                      // In a real app, you would add a new pricing rule here
                      const newRule = {
                        id: "infant",
                        value: 50,
                        percentage: true,
                        name: "Infant Discount",
                      };
                      setPricingRules((prev) => [...prev, newRule]);
                    }}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Pricing Rule
                  </Button>

                  {(filteredRooms?.length || 0) > 0 &&
                    (form.getValues("rooms")?.length || 0) > 0 && (
                      <p className="text-xs text-amber-600 mt-2">
                        Adding new pricing rules is disabled when room pricing
                        is configured
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accommodation Tab */}
          <TabsContent value="accommodation" className="space-y-6 pt-4">
            {/* Hotel Selection */}
            <div className="space-y-4 border rounded-md p-4">
              <h3 className="text-lg font-semibold">Select Hotels</h3>
              
              {/* Hotel Search Input */}
              <div className="space-y-2">
                <Label htmlFor="hotel-search">Search Hotels</Label>
                <Input
                  id="hotel-search"
                  type="text"
                  placeholder="Search by hotel name, destination, or ID..."
                  value={hotelSearchQuery}
                  onChange={(e) => setHotelSearchQuery(e.target.value)}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">
                  Showing {getFilteredHotels().length} of {hotels.length} hotels
                </div>
              </div>

              <FormField
                control={form.control}
                name="selectedHotels"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-2">
                        {getFilteredHotels().map((hotel) => (
                          <div
                            key={hotel.id}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`hotel-${hotel.id}`}
                                checked={
                                  Array.isArray(field.value) &&
                                  field.value.includes(hotel.id)
                                }
                                onCheckedChange={(checked) => {
                                  const currentSelection = Array.isArray(
                                    field.value,
                                  )
                                    ? field.value
                                    : [];
                                  let newSelection;
                                  if (checked) {
                                    newSelection = [
                                      ...currentSelection,
                                      hotel.id,
                                    ];
                                  } else {
                                    newSelection = currentSelection.filter(
                                      (id) => id !== hotel.id,
                                    );
                                  }
                                  field.onChange(newSelection);
                                  handleHotelSelectionChange(newSelection);
                                }}
                              />
                              <label
                                htmlFor={`hotel-${hotel.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {hotel.name}
                              </label>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="flex items-center gap-1 mb-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs ${
                                      i < (hotel.stars || 0)
                                        ? "text-yellow-500"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({hotel.stars || 0})
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {hotel.city}, {hotel.country}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Guest Breakdown */}
            <div className="space-y-4 border rounded-md p-4">
              <h3 className="text-lg font-semibold">Guest Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="adultCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adults (12+ years)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            field.onChange(value);
                            const selectedHotels =
                              form.getValues("selectedHotels") || [];
                            if (selectedHotels.length > 0) {
                              updateAvailableRooms(selectedHotels);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="childrenCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Children (2-11 years)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            field.onChange(value);
                            const selectedHotels =
                              form.getValues("selectedHotels") || [];
                            if (selectedHotels.length > 0) {
                              updateAvailableRooms(selectedHotels);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="infantCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Infants (0-23 months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            field.onChange(value);
                            const selectedHotels =
                              form.getValues("selectedHotels") || [];
                            if (selectedHotels.length > 0) {
                              updateAvailableRooms(selectedHotels);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Available Rooms */}
            {Array.isArray(form.watch("selectedHotels")) &&
              (form.watch("selectedHotels")?.length || 0) > 0 &&
              filteredRooms.length > 0 && (
                <FormField
                  control={form.control}
                  name="rooms"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold">
                          Available Rooms
                        </h3>
                        <FormDescription>
                          Only rooms that can accommodate your specified guest
                          count are shown.
                        </FormDescription>
                      </div>

                      {filteredRooms.length === 0 ? (
                        <div className="text-center p-8 border border-dashed rounded-md">
                          <p className="text-muted-foreground">
                            No rooms match the selected criteria. Try adjusting
                            your guest count or selecting different hotels.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Room Capacity Summary */}
                          {form.watch("rooms") &&
                            form.watch("rooms")?.length > 0 && (
                              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                <h4 className="text-sm font-medium text-green-900 mb-2">
                                  Selected Rooms Capacity:
                                </h4>
                                <div className="space-y-2">
                                  {form
                                    .watch("rooms")
                                    ?.map((selectedRoom: any, index: number) => {
                                      const roomData = filteredRooms.find(
                                        (r) => r.id === selectedRoom.id,
                                      );
                                      if (!roomData) return null;

                                      return (
                                        <div key={selectedRoom.id}>
                                          <div className="flex items-center justify-between text-sm bg-white p-2 rounded border">
                                            <span className="font-medium text-green-800">
                                              {roomData.name}
                                            </span>
                                            <div className="flex gap-2">
                                              <Badge
                                                variant="outline"
                                                className="text-xs"
                                              >
                                                Adults:{" "}
                                                {roomData.max_adults ||
                                                  roomData.maxAdults ||
                                                  2}
                                              </Badge>
                                              <Badge
                                                variant="outline"
                                                className="text-xs"
                                              >
                                                Children:{" "}
                                                {roomData.max_children ||
                                                  roomData.maxChildren ||
                                                  0}
                                              </Badge>
                                              <Badge
                                                variant="outline"
                                                className="text-xs"
                                              >
                                                Infants:{" "}
                                                {roomData.max_infants ||
                                                  roomData.maxInfants ||
                                                  0}
                                              </Badge>
                                              <Badge
                                                variant="default"
                                                className="bg-green-600 text-xs"
                                              >
                                                Total:{" "}
                                                {roomData.max_occupancy ||
                                                  roomData.maxOccupancy ||
                                                  2}
                                              </Badge>
                                            </div>
                                          </div>
                                          {index < (form.watch("rooms")?.length || 0) - 1 && (
                                            <div className="border-b border-gray-200 my-2"></div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  <div className="border-t pt-2 mt-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-green-900">
                                        Total Package Capacity:
                                      </span>
                                      <div className="flex gap-2">
                                        <Badge variant="secondary">
                                          Adults:{" "}
                                          {form
                                            .watch("rooms")
                                            .reduce(
                                              (total: number, room: any) => {
                                                const roomData =
                                                  filteredRooms.find(
                                                    (r) => r.id === room.id,
                                                  );
                                                return (
                                                  total +
                                                  (roomData?.max_adults ||
                                                    roomData?.maxAdults ||
                                                    2)
                                                );
                                              },
                                              0,
                                            )}
                                        </Badge>
                                        <Badge variant="secondary">
                                          Children:{" "}
                                          {form
                                            .watch("rooms")
                                            .reduce(
                                              (total: number, room: any) => {
                                                const roomData =
                                                  filteredRooms.find(
                                                    (r) => r.id === room.id,
                                                  );
                                                return (
                                                  total +
                                                  (roomData?.max_children ||
                                                    roomData?.maxChildren ||
                                                    0)
                                                );
                                              },
                                              0,
                                            )}
                                        </Badge>
                                        <Badge variant="secondary">
                                          Infants:{" "}
                                          {form
                                            .watch("rooms")
                                            .reduce(
                                              (total: number, room: any) => {
                                                const roomData =
                                                  filteredRooms.find(
                                                    (r) => r.id === room.id,
                                                  );
                                                return (
                                                  total +
                                                  (roomData?.max_infants ||
                                                    roomData?.maxInfants ||
                                                    0)
                                                );
                                              },
                                              0,
                                            )}
                                        </Badge>
                                        <Badge
                                          variant="default"
                                          className="bg-green-700"
                                        >
                                          Total:{" "}
                                          {form
                                            .watch("rooms")
                                            .reduce(
                                              (total: number, room: any) => {
                                                const roomData =
                                                  filteredRooms.find(
                                                    (r) => r.id === room.id,
                                                  );
                                                return (
                                                  total +
                                                  (roomData?.max_occupancy ||
                                                    roomData?.maxOccupancy ||
                                                    2)
                                                );
                                              },
                                              0,
                                            )}{" "}
                                          guests
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                          {hotels
                            .filter(
                              (hotel) =>
                                Array.isArray(form.watch("selectedHotels")) &&
                                form.watch("selectedHotels")?.includes(hotel.id),
                            )
                            .map((hotel) => {
                              const hotelRooms = filteredRooms.filter(
                                (room) =>
                                  String(room.hotelId || room.hotel_id) === String(hotel.id),
                              );
                              
                              return (
                                <div
                                  key={hotel.id}
                                  className="border-2 border-blue-200 rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50 mb-6"
                                >
                                  {/* Hotel Header */}
                                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-200">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-bold text-lg">
                                          {hotel.name.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-lg text-gray-900">
                                          {hotel.name}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          {hotel.city}, {hotel.country}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <div className="flex items-center gap-1 mb-1">
                                        {Array.from({ length: 5 }, (_, i) => (
                                          <span
                                            key={i}
                                            className={`text-lg ${
                                              i < (hotel.stars || 0)
                                                ? "text-yellow-500"
                                                : "text-gray-300"
                                            }`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                      <span className="text-sm text-gray-600 font-medium">
                                        {hotel.stars || 0} Star Hotel
                                      </span>
                                    </div>
                                  </div>

                                  {/* Room Count Info */}
                                  <div className="mb-4 bg-white rounded-md p-3 border border-blue-100">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-gray-700">
                                        Available Rooms for Your Group:
                                      </span>
                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                        {hotelRooms.length} room{hotelRooms.length !== 1 ? 's' : ''} available
                                      </span>
                                    </div>
                                  </div>

                                  {/* Rooms Grid */}
                                  {hotelRooms.length === 0 ? (
                                    <div className="text-center py-8 bg-white rounded-md border border-dashed border-gray-300">
                                      <p className="text-gray-500">
                                        No rooms available at this hotel for your guest count.
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                      {hotelRooms.map((room) => {
                                        const isSelected = Array.isArray(form.watch("rooms")) &&
                                          form.watch("rooms")?.some((r) => r.id === room.id);
                                        
                                        return (
                                          <FormItem
                                            key={room.id}
                                            className={`bg-white border-2 rounded-lg p-4 transition-all duration-200 ${
                                              isSelected 
                                                ? "border-green-400 bg-green-50 shadow-md" 
                                                : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                                            }`}
                                          >
                                            {/* Room Header */}
                                            <div className="flex items-start justify-between mb-3">
                                              <div className="flex items-center space-x-3">
                                                <FormControl>
                                                  <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={(checked) => {
                                                      const currentRooms = form.watch("rooms") || [];
                                                      if (checked) {
                                                        // Add comprehensive room data
                                                        const roomData = {
                                                          id: room.id,
                                                          name: room.name,
                                                          description: room.description,
                                                          hotelId: room.hotelId || room.hotel_id,
                                                          hotelName: hotel.name,
                                                          type: room.type,
                                                          maxOccupancy: room.max_occupancy || room.maxOccupancy,
                                                          maxAdults: room.max_adults || room.maxAdults,
                                                          maxChildren: room.max_children || room.maxChildren,
                                                          maxInfants: room.max_infants || room.maxInfants,
                                                          price: room.price ? room.price / 100 : 0,
                                                          originalPrice: room.price ? room.price / 100 : 0,
                                                          discountedPrice: room.discounted_price ? room.discounted_price / 100 : null,
                                                          currency: room.currency || 'EGP',
                                                          size: room.size,
                                                          bedType: room.bed_type || room.bedType,
                                                          view: room.view,
                                                          amenities: room.amenities || [],
                                                          imageUrl: room.image_url || room.imageUrl,
                                                          available: room.available,
                                                          status: room.status,
                                                          customPrice: room.price ? room.price / 100 : 0,
                                                          customDiscount: 0,
                                                        };
                                                        
                                                        form.setValue("rooms", [...currentRooms, roomData]);
                                                      } else {
                                                        form.setValue("rooms", currentRooms.filter((r) => r.id !== room.id));
                                                      }
                                                    }}
                                                    className="mt-1"
                                                  />
                                                </FormControl>
                                                <div className="flex-1">
                                                  <FormLabel className="font-semibold text-base cursor-pointer block text-gray-900">
                                                    {room.name}
                                                  </FormLabel>
                                                  {room.description && (
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                      {room.description}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                              
                                              {/* Selected Badge */}
                                              {isSelected && (
                                                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                  Selected
                                                </div>
                                              )}
                                            </div>

                                            {/* Room Details */}
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                              {/* Capacity Info */}
                                              <div className="bg-gray-50 rounded-md p-3">
                                                <div className="text-xs font-medium text-gray-700 mb-2">Guest Capacity</div>
                                                <div className="flex flex-wrap gap-1">
                                                  <Badge variant="outline" className="text-xs">
                                                    Adults: {room.max_adults || room.maxAdults || 2}
                                                  </Badge>
                                                  <Badge variant="outline" className="text-xs">
                                                    Children: {room.max_children || room.maxChildren || 0}
                                                  </Badge>
                                                  <Badge variant="outline" className="text-xs">
                                                    Infants: {room.max_infants || room.maxInfants || 0}
                                                  </Badge>
                                                </div>
                                                <div className="mt-1">
                                                  <Badge variant="secondary" className="text-xs">
                                                    Total: {room.max_occupancy || room.maxOccupancy || 2} guests
                                                  </Badge>
                                                </div>
                                              </div>

                                              {/* Room Features */}
                                              <div className="bg-gray-50 rounded-md p-3">
                                                <div className="text-xs font-medium text-gray-700 mb-2">Room Features</div>
                                                <div className="flex flex-wrap gap-1">
                                                  {room.type && (
                                                    <Badge variant="secondary" className="text-xs">
                                                      {room.type}
                                                    </Badge>
                                                  )}
                                                  {room.bedType && (
                                                    <Badge variant="outline" className="text-xs">
                                                      {room.bedType}
                                                    </Badge>
                                                  )}
                                                  {room.view && (
                                                    <Badge variant="outline" className="text-xs">
                                                      {room.view} view
                                                    </Badge>
                                                  )}
                                                  {room.size && (
                                                    <Badge variant="outline" className="text-xs">
                                                      {room.size}
                                                    </Badge>
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Pricing Section */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                              <div className="text-sm text-gray-600">
                                                Custom pricing in <span className="font-medium">Pricing Rules</span> section
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-500">Price/night:</span>
                                                <Input
                                                  className="w-20 h-8 text-sm"
                                                  type="number"
                                                  min="0"
                                                  value={room.price ? room.price / 100 : 0}
                                                  onChange={(e) => {
                                                    const newPrice = parseInt(e.target.value) * 100;
                                                    const newRooms = filteredRooms.map((r) => 
                                                      r.id === room.id ? { ...r, price: newPrice } : r
                                                    );
                                                    setFilteredRooms(newRooms);

                                                    const currentRooms = form.getValues("rooms") || [];
                                                    const roomIndex = currentRooms.findIndex((r) => r.id === room.id);
                                                    if (roomIndex !== -1) {
                                                      const updatedRooms = [...currentRooms];
                                                      updatedRooms[roomIndex] = {
                                                        ...updatedRooms[roomIndex],
                                                        price: newPrice / 100,
                                                      };
                                                      form.setValue("rooms", updatedRooms);
                                                    }
                                                  }}
                                                />
                                                <span className="text-xs text-gray-600">EGP</span>
                                              </div>
                                            </div>
                                          </FormItem>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6 pt-4">
            {/* Multiple Tours Selection Component */}
            <div className="p-4 border rounded-md mb-6">
              <h3 className="text-lg font-semibold mb-2">Tour Selection</h3>
              <FormDescription className="mb-4">
                Search and select multiple tours to include in this package. You can add as many tours as needed.
              </FormDescription>

              <div className="relative mb-4" ref={tourSearchRef}>
                <div className="flex items-center relative">
                  <Input
                    type="text"
                    placeholder="Search for tours by name or double-click to view all tours"
                    value={tourSearchQuery}
                    onChange={(e) => setTourSearchQuery(e.target.value)}
                    onFocus={() => setShowTourDropdown(true)}
                    onClick={() => setShowTourDropdown(true)}
                    onDoubleClick={() => {
                      setTourSearchQuery("");
                      setShowTourDropdown(true);
                    }}
                    className="pr-10"
                  />
                  <Search className="w-4 h-4 absolute right-3 text-gray-500" />
                </div>

                {showTourDropdown && (
                  <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border rounded-md shadow-lg">
                    {!tourSearchQuery.trim() && (
                      <div className="px-4 py-2 text-sm text-zinc-500 border-b">
                        Showing {Math.min(tours.length, 10)} of {tours.length}{" "}
                        available tours
                      </div>
                    )}

                    {getFilteredTours().length > 0 ? (
                      getFilteredTours().map((tour) => {
                        const isSelected = selectedTours.find(t => t.id === tour.id);
                        return (
                          <div
                            key={tour.id}
                            className={`p-3 cursor-pointer border-b last:border-0 ${
                              isSelected 
                                ? 'bg-green-50 hover:bg-green-100' 
                                : 'hover:bg-zinc-100'
                            }`}
                            onClick={() => handleTourSelection(tour)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                {isSelected && (
                                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <Check className="w-2 h-2 text-white" />
                                  </div>
                                )}
                                <span className={`font-medium ${isSelected ? 'text-green-700' : ''}`}>
                                  {tour.name}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-green-700">
                                {tour.price
                                  ? `${tour.price.toLocaleString("ar-EG")} EGP`
                                  : "Price TBD"}
                              </span>
                            </div>
                            {tour.description && (
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {tour.description.substring(0, 80)}...
                              </p>
                            )}
                            {isSelected && (
                              <p className="text-xs text-green-600 mt-1 font-medium">
                                ✓ Already selected
                              </p>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-4 py-2 text-gray-500">
                        {tours.length === 0
                          ? "Loading tours..."
                          : "No tours found matching your search"}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Tours Display */}
              {selectedTours.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-zinc-900">
                      Selected Tours ({selectedTours.length})
                    </h4>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Total: {selectedTours.reduce((sum, tour) => sum + (tour.price || 0), 0).toLocaleString("ar-EG")} EGP
                    </Badge>
                  </div>
                  
                  <div className="grid gap-4">
                    {selectedTours.map((tour) => (
                      <div key={tour.id} className="p-4 border rounded-md bg-green-50 border-green-200">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-semibold text-green-900">{tour.name}</h5>
                              <Badge variant="secondary" className="text-xs">
                                ID: {tour.id}
                              </Badge>
                            </div>
                            <p className="text-sm text-green-700 mb-2">{tour.description}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTour(tour.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-2 bg-white rounded border">
                            <h6 className="text-xs font-medium text-green-700 mb-1">Base Price</h6>
                            <p className="text-sm font-semibold text-green-800">
                              {tour.price
                                ? `${tour.price.toLocaleString("ar-EG")} EGP`
                                : "Price TBD"}
                            </p>
                          </div>
                          <div className="p-2 bg-white rounded border">
                            <h6 className="text-xs font-medium text-green-700 mb-1">Duration</h6>
                            <p className="text-sm font-semibold text-green-800">
                              {tour.duration ? `${tour.duration} hours` : "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTours.length === 0 && (
                <div className="mt-4 p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
                  <p className="text-sm text-gray-500">No tours selected yet. Search and click on tours above to add them to your package.</p>
                </div>
              )}
            </div>

            {/* Included Features Section */}
            <div className="p-4 border rounded-md bg-green-50">
              <div className="mb-4">
                <Label className="text-sm font-medium">Included Features</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Add features that are included in this package
                </p>
              </div>
              
              {/* Display existing included features */}
              {customIncludedFeatures.length > 0 && (
                <div className="mb-4 space-y-2">
                  {customIncludedFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-100 rounded border">
                      <span className="text-sm text-green-800">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveIncludedFeature(index)}
                        className="text-green-600 hover:text-green-800 hover:bg-green-200 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input for new included feature */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter included feature (e.g., Private chef service, Airport transfers)"
                  value={newIncludedFeature}
                  onChange={(e) => setNewIncludedFeature(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIncludedFeature();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddIncludedFeature}
                  disabled={!newIncludedFeature.trim()}
                  size="sm"
                  className="px-4 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Excluded Features Section */}
            <div className="p-4 border rounded-md bg-red-50">
              <div className="mb-4">
                <Label className="text-sm font-medium">Excluded Features</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Add features that are NOT included in this package
                </p>
              </div>
              
              {/* Display existing excluded features */}
              {customExcludedFeatures.length > 0 && (
                <div className="mb-4 space-y-2">
                  {customExcludedFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-100 rounded border">
                      <span className="text-sm text-red-800">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveExcludedFeature(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-200 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input for new excluded feature */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter excluded feature (e.g., International flights, Visas)"
                  value={newExcludedFeature}
                  onChange={(e) => setNewExcludedFeature(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExcludedFeature();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddExcludedFeature}
                  disabled={!newExcludedFeature.trim()}
                  size="sm"
                  className="px-4 bg-red-600 hover:bg-red-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Ideal Traveler Types */}
            <div className="p-4 border rounded-md bg-blue-50">
              <div className="mb-4">
                <Label className="text-sm font-medium">Ideal For (Traveler Types)</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Add types of travelers this package is best suited for
                </p>
              </div>
              
              {/* Display existing traveler types */}
              {customTravelerTypes.length > 0 && (
                <div className="mb-4 space-y-2">
                  {customTravelerTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-100 rounded border">
                      <span className="text-sm text-blue-800">{type}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTravelerType(index)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-200 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input for new traveler type */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter traveler type (e.g., Families with children, Adventure seekers)"
                  value={newTravelerType}
                  onChange={(e) => setNewTravelerType(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTravelerType();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddTravelerType}
                  disabled={!newTravelerType.trim()}
                  size="sm"
                  className="px-4 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Optional Excursions */}
            <div className="border-t pt-6">
              <FormLabel className="text-lg font-medium">Optional Excursions & Add-ons</FormLabel>
              <FormDescription className="mb-4">
                Add optional activities that travelers can choose to add to their package
              </FormDescription>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {optionalExcursions.map((excursion, index) => (
                    <div key={index} className="border rounded-md p-4 bg-orange-50">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-orange-800">{excursion}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-orange-600"
                          type="button"
                          onClick={() => {
                            const updatedExcursions = optionalExcursions.filter((_, i) => i !== index);
                            setOptionalExcursions(updatedExcursions);
                            form.setValue("optionalExcursions", updatedExcursions);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Enter optional excursion (e.g., Hot Air Balloon Ride - $150)"
                    value={newExcursion}
                    onChange={(e) => setNewExcursion(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddExcursion();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddExcursion}
                    disabled={!newExcursion.trim()}
                    size="sm"
                    className="px-4"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary" className="space-y-6 pt-4">
            <div className="border-b pb-4 mb-4">
              <h3 className="text-lg font-medium">Day-by-Day Itinerary</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create a day-by-day breakdown of the tour itinerary.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {itineraryItems.map((item, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10">
                          Day {item.day}
                        </Badge>
                        <h4 className="font-medium">{item.title}</h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        type="button"
                        onClick={() => {
                          const updatedItems = itineraryItems.filter(
                            (_, i) => i !== index,
                          );
                          setItineraryItems(updatedItems);
                          form.setValue("itinerary", updatedItems);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.description}
                    </p>
                    {item.image && (
                      <div className="mt-2">
                        <img
                          src={item.image}
                          alt={`Day ${item.day}: ${item.title}`}
                          className="w-full h-48 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-4">Add New Day</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label htmlFor="day-number">Day #</Label>
                    <Input
                      id="day-number"
                      type="number"
                      min="1"
                      value={newItineraryDay.day}
                      onChange={(e) =>
                        setNewItineraryDay({
                          ...newItineraryDay,
                          day: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Label htmlFor="day-title">Title</Label>
                    <Input
                      id="day-title"
                      value={newItineraryDay.title}
                      onChange={(e) =>
                        setNewItineraryDay({
                          ...newItineraryDay,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g., Arrival in Cairo"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <Label htmlFor="day-description">Description</Label>
                  <Textarea
                    id="day-description"
                    value={newItineraryDay.description}
                    onChange={(e) =>
                      setNewItineraryDay({
                        ...newItineraryDay,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe the activities and experiences for this day..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="day-image">Image URL (optional)</Label>
                  <Input
                    id="day-image"
                    value={newItineraryDay.image}
                    onChange={(e) =>
                      setNewItineraryDay({
                        ...newItineraryDay,
                        image: e.target.value,
                      })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    if (
                      !newItineraryDay.title ||
                      !newItineraryDay.description
                    ) {
                      toast({
                        title: "Required fields missing",
                        description:
                          "Please enter a title and description for this day",
                        variant: "destructive",
                      });
                      return;
                    }

                    const updatedItems = [...itineraryItems, newItineraryDay];
                    // Sort by day number
                    updatedItems.sort((a, b) => a.day - b.day);

                    setItineraryItems(updatedItems);
                    form.setValue("itinerary", updatedItems);

                    // Reset the new day form but increment the day number
                    setNewItineraryDay({
                      day:
                        Math.max(...updatedItems.map((item) => item.day, 0)) +
                        1,
                      title: "",
                      description: "",
                      image: "",
                    });
                  }}
                >
                  Add Itinerary Day
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* What to Pack Tab */}
          <TabsContent value="whatTopack" className="space-y-6 pt-4">
            <div className="border-b pb-4 mb-4">
              <h3 className="text-lg font-medium">What to Pack</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add recommended items for travelers to pack for this tour.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {packItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-md"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {/* Use an icon component if available */}
                      <LucideIcon
                        name={item.icon}
                        className="h-5 w-5 text-primary"
                        fallback={<Package className="h-5 w-5 text-primary" />}
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{item.item}</h4>
                      {item.tooltip && (
                        <p className="text-sm text-muted-foreground">
                          {item.tooltip}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto"
                      type="button"
                      onClick={() => {
                        const updatedItems = packItems.filter(
                          (_, i) => i !== index,
                        );
                        setPackItems(updatedItems);
                        form.setValue("whatToPack", updatedItems);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input
                    id="item-name"
                    value={newPackItem.item}
                    onChange={(e) =>
                      setNewPackItem({ ...newPackItem, item: e.target.value })
                    }
                    placeholder="e.g., Sunscreen"
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <FormControl>
                          <IconSelector
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select an icon"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="item-tooltip">Tooltip/Description</Label>
                  <Input
                    id="item-tooltip"
                    value={newPackItem.tooltip}
                    onChange={(e) =>
                      setNewPackItem({
                        ...newPackItem,
                        tooltip: e.target.value,
                      })
                    }
                    placeholder="e.g., SPF 30+ recommended"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={() => {
                  if (!newPackItem.item) {
                    toast({
                      title: "Item name required",
                      description: "Please enter a name for the item",
                      variant: "destructive",
                    });
                    return;
                  }

                  const updatedItems = [...packItems, newPackItem];
                  setPackItems(updatedItems);
                  form.setValue("whatToPack", updatedItems);

                  // Reset the new item form
                  setNewPackItem({ item: "", icon: "suitcase", tooltip: "" });
                }}
              >
                Add Item
              </Button>
            </div>
          </TabsContent>

          {/* Travel Route Tab */}
          <TabsContent value="travelRoute" className="space-y-6 pt-4">
            <div className="border-b pb-4 mb-4">
              <h3 className="text-lg font-medium">Travel Route Map</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Define the travel route for this package tour.
              </p>
            </div>

            <div className="space-y-6">
              <div className="h-[400px] bg-slate-100 rounded-md flex items-center justify-center border">
                <div className="text-center p-4">
                  <MapIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-medium mb-1">Map Integration</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This section will display a map where the route can be
                    pinned. Integration with a mapping service (Google Maps,
                    Mapbox, etc.) is required.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormField
                    control={form.control}
                    name="route"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Route Description</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            {/* Input + Add Button */}
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter a destination (e.g., Cairo)"
                                value={newRouteStop}
                                onChange={(e) => setNewRouteStop(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddRouteStop();
                                  }
                                }}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                onClick={handleAddRouteStop}
                                disabled={!newRouteStop.trim()}
                                size="sm"
                                className="px-4"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </div>
                            
                            {/* Route Display */}
                            {travelRouteItems.length > 0 && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center flex-wrap gap-2 text-sm">
                                  {travelRouteItems.map((stop, index) => (
                                    <div key={index} className="flex items-center">
                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                                        {stop}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveRouteStop(index)}
                                          className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </span>
                                      {index < travelRouteItems.length - 1 && (
                                        <ArrowRight className="h-4 w-4 mx-1 text-gray-500" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Clear all button */}
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearRoute}
                                    className="text-xs"
                                  >
                                    Clear Route
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {/* Hidden input to sync with form */}
                            <input
                              type="hidden"
                              {...field}
                              value={travelRouteItems.join(' → ')}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Add destinations to build your travel route (e.g., Cairo → Aswan → Red Sea)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="transportation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transportation Option</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedTransport(value);

                            // Update price based on selection
                            const option = transportOptions.find(
                              (opt) => opt.id === value,
                            );
                            if (option) {
                              const basePrice =
                                form.getValues("basePrice") || 0;
                              const newPrice =
                                basePrice * (option.priceMultiplier - 1);
                              form.setValue(
                                "transportationPrice",
                                Math.round(newPrice),
                              );
                              setTransportPrice(Math.round(newPrice));
                            }
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select transportation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {transportOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}{" "}
                                {option.priceMultiplier > 1 ? "(Premium)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the transportation type for this package.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="transportationPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Transportation Price Adjustment (EGP)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-zinc-500">
                              EGP
                            </span>
                            <Input
                              className="pl-7"
                              type="number"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setTransportPrice(parseFloat(e.target.value));
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Additional cost for premium transportation options.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Accommodation Highlights</h4>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  {accommodationHighlights.map((highlight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 border rounded-md"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                        <LucideIcon
                          name={highlight.icon}
                          className="h-5 w-5 text-primary"
                          fallback={<Hotel className="h-5 w-5 text-primary" />}
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium">{highlight.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {highlight.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto"
                        type="button"
                        onClick={() => {
                          const updatedHighlights =
                            accommodationHighlights.filter(
                              (_, i) => i !== index,
                            );
                          setAccommodationHighlights(updatedHighlights);
                          form.setValue(
                            "accommodationHighlights",
                            updatedHighlights,
                          );
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="highlight-title">Title</Label>
                      <Input
                        id="highlight-title"
                        value={newHighlight.title}
                        onChange={(e) =>
                          setNewHighlight({
                            ...newHighlight,
                            title: e.target.value,
                          })
                        }
                        placeholder="e.g., Luxury Hotels"
                      />
                    </div>
                    <div>
                      <Label htmlFor="highlight-icon">Icon</Label>
                      <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon</FormLabel>
                            <FormControl>
                              <IconSelector
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select an icon"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Label htmlFor="highlight-description">Description</Label>
                      <Textarea
                        id="highlight-description"
                        value={newHighlight.description}
                        onChange={(e) =>
                          setNewHighlight({
                            ...newHighlight,
                            description: e.target.value,
                          })
                        }
                        placeholder="e.g., Stay at 5-star hotels with Nile views"
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      if (!newHighlight.title || !newHighlight.description) {
                        toast({
                          title: "Required fields missing",
                          description:
                            "Please enter a title and description for this highlight",
                          variant: "destructive",
                        });
                        return;
                      }

                      const updatedHighlights = [
                        ...accommodationHighlights,
                        newHighlight,
                      ];
                      setAccommodationHighlights(updatedHighlights);
                      form.setValue(
                        "accommodationHighlights",
                        updatedHighlights,
                      );

                      // Reset the form
                      setNewHighlight({
                        title: "",
                        description: "",
                        icon: "home",
                      });
                    }}
                  >
                    Add Accommodation Highlight
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Arabic Translation Tab */}
          <TabsContent value="arabic" className="space-y-6 pt-4">
            <div className="space-y-6">
              {/* Arabic Version Toggle */}
              <div className="border rounded-lg p-4">
                <FormField
                  control={form.control}
                  name="hasArabicVersion"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Languages className="h-5 w-5" />
                          Enable Arabic Version
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Create an Arabic translation for this package
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Show Arabic fields only when Arabic version is enabled */}
              {form.watch("hasArabicVersion") && (
                <div className="space-y-6">
                  {/* Basic Arabic Information */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information (Arabic)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="titleAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Arabic Package Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="اسم الباقة بالعربية"
                                dir="rtl"
                                className="text-right"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shortDescriptionAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Arabic Short Description</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="وصف مختصر بالعربية"
                                dir="rtl"
                                className="text-right"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="descriptionAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Arabic Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="وصف مفصل للباقة بالعربية"
                              dir="rtl"
                              className="text-right min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="overviewAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Arabic Overview</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="نظرة عامة بالعربية"
                              dir="rtl"
                              className="text-right min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bestTimeToVisitAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Best Time to Visit (Arabic)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="أفضل وقت للزيارة بالعربية"
                              dir="rtl"
                              className="text-right"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Arabic Features */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-semibold">Features (Arabic)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Arabic Included Features */}
                      <div>
                        <Label className="text-sm font-medium">Included Features (Arabic)</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Add Arabic translations for included features
                        </p>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="ميزة مضمنة بالعربية"
                              dir="rtl"
                              className="text-right"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.target as HTMLInputElement;
                                  if (input.value.trim()) {
                                    const currentFeatures = form.getValues("includedFeaturesAr") || [];
                                    form.setValue("includedFeaturesAr", [...currentFeatures, input.value.trim()]);
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={(e) => {
                                const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                                if (input?.value.trim()) {
                                  const currentFeatures = form.getValues("includedFeaturesAr") || [];
                                  form.setValue("includedFeaturesAr", [...currentFeatures, input.value.trim()]);
                                  input.value = '';
                                }
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {(form.watch("includedFeaturesAr") || []).map((feature: string, index: number) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded border">
                                <span className="text-sm text-green-800" dir="rtl">{feature}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const currentFeatures = form.getValues("includedFeaturesAr") || [];
                                    form.setValue("includedFeaturesAr", currentFeatures.filter((_, i) => i !== index));
                                  }}
                                  className="text-green-600 hover:text-green-800 h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Arabic Excluded Features */}
                      <div>
                        <Label className="text-sm font-medium">Excluded Features (Arabic)</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Add Arabic translations for excluded features
                        </p>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="ميزة غير مضمنة بالعربية"
                              dir="rtl"
                              className="text-right"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.target as HTMLInputElement;
                                  if (input.value.trim()) {
                                    const currentFeatures = form.getValues("excludedFeaturesAr") || [];
                                    form.setValue("excludedFeaturesAr", [...currentFeatures, input.value.trim()]);
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={(e) => {
                                const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                                if (input?.value.trim()) {
                                  const currentFeatures = form.getValues("excludedFeaturesAr") || [];
                                  form.setValue("excludedFeaturesAr", [...currentFeatures, input.value.trim()]);
                                  input.value = '';
                                }
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {(form.watch("excludedFeaturesAr") || []).map((feature: string, index: number) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded border">
                                <span className="text-sm text-red-800" dir="rtl">{feature}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const currentFeatures = form.getValues("excludedFeaturesAr") || [];
                                    form.setValue("excludedFeaturesAr", currentFeatures.filter((_, i) => i !== index));
                                  }}
                                  className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arabic Policies */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-semibold">Policies (Arabic)</h3>
                    
                    <FormField
                      control={form.control}
                      name="cancellationPolicyAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cancellation Policy (Arabic)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="سياسة الإلغاء بالعربية"
                              dir="rtl"
                              className="text-right min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="childrenPolicyAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Children Policy (Arabic)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="سياسة الأطفال بالعربية"
                              dir="rtl"
                              className="text-right min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="termsAndConditionsAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Terms & Conditions (Arabic)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="الشروط والأحكام بالعربية"
                              dir="rtl"
                              className="text-right min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customTextAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Text (Arabic)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="نص مخصص بالعربية"
                              dir="rtl"
                              className="text-right min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col gap-2">
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleNavigateWithWarning("/admin/packages")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={packageMutation.isPending}
              onClick={() => setAllowFormSubmission(true)}
            >
              {packageMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : isEditMode ? (
                "Update Package"
              ) : (
                "Create Package"
              )}
            </Button>
          </div>

          {packageMutation.isError && (
            <div className="text-sm text-destructive flex items-center gap-2 mt-2 justify-end">
              <AlertCircle className="h-4 w-4" />
              <span>
                {packageMutation.error?.message || "An error occurred"}
              </span>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}

// Export the same component as SimplePackageForm for use in PackageCreatorPage
export const SimplePackageForm = PackageCreatorForm;
