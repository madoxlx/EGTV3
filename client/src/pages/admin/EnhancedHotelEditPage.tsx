import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import InlineFeatureManager from "@/components/hotel/InlineFeatureManager";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronRight,
  Save,
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  Plus,
  Minus,
  Building,
  Search,
  Car,
  Plane,
  Bus,
  Coffee,
  Utensils,
  PanelLeftClose,
  Bed,
  Check,
  X,
  LifeBuoy,
  ShieldCheck,
  BedDouble,
  FileQuestion,
  RefreshCw,
  Trash2,
  Link,
  Image,
  Upload,
  Camera,
  Home,
  PencilLine,
  Loader2,
  Pencil,
  Tag,
  Sparkles,
  Hotel
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Define schema for nearby landmark
const landmarkSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  distance: z.string().optional(),
  placeId: z.string().optional(),
});

// Define schema for restaurant
const restaurantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  cuisineType: z.string().optional(),
  breakfastOptions: z.array(z.string()).default([]),
});

// Define schema for FAQ
const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

// Define schema for room type
const roomTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bedType: z.string().optional(),
  size: z.string().optional(),
  view: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  price: z.number().optional(),
});

// Define the schema for hotel form validation
const hotelFormSchema = z.object({
  // Basic Hotel Information
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().optional().nullable(),
  destinationId: z.coerce
    .number()
    .positive({ message: "Please select a destination" }),
  address: z.string().min(1, { message: "Address is required" }),
  cityId: z.coerce
    .number()
    .positive({ message: "Please select a city" })
    .optional()
    .nullable(),
  countryId: z.coerce
    .number()
    .positive({ message: "Please select a country" })
    .optional()
    .nullable(),
  postalCode: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z
    .string()
    .email({ message: "Please enter a valid email" })
    .optional()
    .nullable(),
  website: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .nullable(),

  // Hotel rating
  stars: z.coerce
    .number()
    .min(1, { message: "Rating must be at least 1 star" })
    .max(5, { message: "Rating cannot exceed 5 stars" })
    .optional()
    .nullable(),

  // Coordinates and additional info
  longitude: z.coerce.number().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  featured: z.boolean().default(false),
  status: z.string().default("active"),
  checkInTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Please enter a valid time in 24-hour format (HH:MM)",
    })
    .optional()
    .nullable(),
  checkOutTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Please enter a valid time in 24-hour format (HH:MM)",
    })
    .optional()
    .nullable(),

  // General Highlights, Facilities, and Cleanliness Features (using IDs for Many-to-Many)
  highlightIds: z.array(z.number()).default([]),
  facilityIds: z.array(z.number()).default([]),
  cleanlinessFeatureIds: z.array(z.number()).default([]),

  // Transportation and amenities (direct fields in hotels table)
  parkingAvailable: z.boolean().default(false),
  airportTransferAvailable: z.boolean().default(false),
  carRentalAvailable: z.boolean().default(false),
  shuttleAvailable: z.boolean().default(false),
  wifiAvailable: z.boolean().default(true),
  petFriendly: z.boolean().default(false),
  accessibleFacilities: z.boolean().default(false),

  // Additional fields for database compatibility
  imageUrl: z.string().optional().nullable(),
  galleryUrls: z.array(z.string()).default([]),

  // Complex related data (to be processed separately)
  landmarks: z.array(landmarkSchema).default([]),
  restaurants: z.array(restaurantSchema).default([]),
  faqs: z.array(faqSchema).default([]),
  roomTypes: z.array(roomTypeSchema).default([]),
});

type HotelFormValues = z.infer<typeof hotelFormSchema>;

// Breakfast options
const breakfastOptions = [
  { id: "halal", label: "Halal" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "glutenFree", label: "Gluten-Free" },
  { id: "continental", label: "Continental" },
  { id: "american", label: "American" },
  { id: "buffet", label: "Buffet" },
];

// Room view options
const roomViewOptions = [
  "City View",
  "Garden View",
  "Mountain View",
  "Ocean View",
  "Pool View",
  "River View",
  "Landmark View",
  "No View",
];

// Bed type options
const bedTypeOptions = [
  "Single Bed",
  "Twin Beds",
  "Double Bed",
  "Queen Bed",
  "King Bed",
  "Super King Bed",
  "Bunk Bed",
  "Sofa Bed",
];

// Room amenities
const roomAmenityOptions = [
  { id: "airConditioning", label: "Air Conditioning" },
  { id: "minibar", label: "Minibar" },
  { id: "tv", label: "TV" },
  { id: "safe", label: "Safe" },
  { id: "hairDryer", label: "Hair Dryer" },
  { id: "toiletries", label: "Toiletries" },
  { id: "blackoutCurtains", label: "Blackout Curtains" },
  { id: "desk", label: "Desk" },
  { id: "bathtub", label: "Bathtub" },
  { id: "bathrobe", label: "Bathrobe" },
  { id: "slippers", label: "Slippers" },
  { id: "coffeemaker", label: "Coffee Maker" },
  { id: "iron", label: "Iron & Ironing Board" },
  { id: "balcony", label: "Balcony" },
  { id: "soundproofing", label: "Soundproofing" },
];

export default function EnhancedHotelEditPage() {
  const { t } = useLanguage();
  const [_, navigate] = useLocation();
  const [match, params] = useRoute("/admin/hotels/edit/:id");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for selections
  const [selectedFacilities, setSelectedFacilities] = useState<number[]>([]);
  const [selectedHighlights, setSelectedHighlights] = useState<number[]>([]);
  const [selectedCleanlinessFeatures, setSelectedCleanlinessFeatures] =
    useState<number[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    null,
  );
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [isSearchingLandmarks, setIsSearchingLandmarks] = useState(false);
  const [suggestedLandmarks, setSuggestedLandmarks] = useState<any[]>([]);

  // Image management state
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingMainImage, setExistingMainImage] = useState<string>("");

  // Form state
  const [formInitialized, setFormInitialized] = useState(false);
  const [showUnsavedChangesAlert, setShowUnsavedChangesAlert] = useState(false);
  const [redirectPath, setRedirectPath] = useState("");

  const hotelId = params?.id ? parseInt(params.id) : null;

  // Google Maps integration
  const { isLoaded: isMapLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  // Initialize map state
  const [mapCenter, setMapCenter] = useState({ lat: 30.0444, lng: 31.2357 }); // Cairo default

  // Fetch hotel data for editing
  const {
    data: hotel,
    isLoading: isLoadingHotel,
    error: hotelError,
  } = useQuery({
    queryKey: [`/api/admin/hotels/${hotelId}`],
    queryFn: async () => {
      const response = await fetch(`/api/admin/hotels/${hotelId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch hotel');
      return response.json();
    },
    enabled: !!hotelId,
  });

  // Fetch destinations
  const {
    data: destinations,
    isLoading: isLoadingDestinations,
    error: destinationsError,
  } = useQuery({
    queryKey: ["/api/destinations"],
    queryFn: async () => {
      const response = await fetch('/api/destinations');
      if (!response.ok) throw new Error('Failed to fetch destinations');
      return response.json();
    },
  });

  // Fetch countries
  const {
    data: countries,
    isLoading: isLoadingCountries,
    error: countriesError,
  } = useQuery({
    queryKey: ["/api/countries"],
    queryFn: async () => {
      const response = await fetch('/api/countries');
      if (!response.ok) throw new Error('Failed to fetch countries');
      return response.json();
    },
  });

  // Fetch cities based on selected country
  const {
    data: cities,
    isLoading: isLoadingCities,
    error: citiesError,
  } = useQuery({
    queryKey: ["/api/cities"],
    queryFn: async () => {
      const response = await fetch('/api/cities');
      if (!response.ok) throw new Error('Failed to fetch cities');
      return response.json();
    },
  });

  // Fetch hotel features data
  const { data: highlights } = useQuery({
    queryKey: ["/api/admin/hotel-highlights"],
    queryFn: async () => {
      const response = await fetch('/api/admin/hotel-highlights', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch highlights');
      return response.json();
    },
  });

  const { data: facilities } = useQuery({
    queryKey: ["/api/admin/hotel-facilities"],
    queryFn: async () => {
      const response = await fetch('/api/admin/hotel-facilities', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch facilities');
      return response.json();
    },
  });

  const { data: cleanlinessFeatures } = useQuery({
    queryKey: ["/api/admin/cleanliness-features"],
    queryFn: async () => {
      const response = await fetch('/api/admin/cleanliness-features', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch cleanliness features');
      return response.json();
    },
  });

  // Initialize form with proper typing
  const form = useForm<HotelFormValues>({
    resolver: zodResolver(hotelFormSchema),
    defaultValues: {
      name: "",
      description: "",
      destinationId: 0,
      address: "",
      cityId: null,
      countryId: null,
      postalCode: "",
      phone: "",
      email: "",
      website: "",
      stars: 3,
      longitude: null,
      latitude: null,
      featured: false,
      status: "active",
      checkInTime: "",
      checkOutTime: "",
      highlightIds: [],
      facilityIds: [],
      cleanlinessFeatureIds: [],
      parkingAvailable: false,
      airportTransferAvailable: false,
      carRentalAvailable: false,
      shuttleAvailable: false,
      wifiAvailable: true,
      petFriendly: false,
      accessibleFacilities: false,
      imageUrl: "",
      galleryUrls: [],
      landmarks: [],
      restaurants: [],
      faqs: [],
      roomTypes: [],
    },
  });

  // Initialize field arrays
  const {
    fields: landmarkFields,
    append: appendLandmark,
    remove: removeLandmark,
  } = useFieldArray({
    control: form.control,
    name: "landmarks",
  });

  const {
    fields: restaurantFields,
    append: appendRestaurant,
    remove: removeRestaurant,
  } = useFieldArray({
    control: form.control,
    name: "restaurants",
  });

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  const {
    fields: roomTypeFields,
    append: appendRoomType,
    remove: removeRoomType,
  } = useFieldArray({
    control: form.control,
    name: "roomTypes",
  });

  // Initialize form data when hotel data is loaded
  useEffect(() => {
    if (hotel && !formInitialized) {
      console.log('Hotel data received:', hotel);
      
      // Load real data from hotel if exists, otherwise add empty items to show the interface
      if (hotel.landmarks && hotel.landmarks.length > 0) {
        hotel.landmarks.forEach((landmark: any) => {
          appendLandmark({ 
            name: landmark.name || "", 
            distance: landmark.distance || "", 
            description: landmark.description || "" 
          });
        });
      } else {
        // Add one empty landmark to show the interface
        appendLandmark({ name: "", distance: "", description: "" });
      }

      if (hotel.restaurants && hotel.restaurants.length > 0) {
        hotel.restaurants.forEach((restaurant: any) => {
          appendRestaurant({ 
            name: restaurant.name || "", 
            cuisineType: restaurant.cuisineType || "", 
            breakfastOptions: restaurant.breakfastOptions || [] 
          });
        });
      } else {
        // Add one empty restaurant to show the interface
        appendRestaurant({ 
          name: "", 
          cuisineType: "", 
          breakfastOptions: [] 
        });
      }

      if (hotel.faqs && hotel.faqs.length > 0) {
        hotel.faqs.forEach((faq: any) => {
          appendFaq({ 
            question: faq.question || "", 
            answer: faq.answer || "" 
          });
        });
      } else {
        // Add one empty FAQ to show the interface
        appendFaq({ question: "", answer: "" });
      }

      if (hotel.roomTypes && hotel.roomTypes.length > 0) {
        hotel.roomTypes.forEach((roomType: any) => {
          appendRoomType({ 
            name: roomType.name || "", 
            bedType: roomType.bedType || "", 
            size: roomType.size || "", 
            view: roomType.view || "", 
            amenities: roomType.amenities || [], 
            price: roomType.price || 0 
          });
        });
      } else {
        // Add one empty room type to show the interface
        appendRoomType({ 
          name: "", 
          bedType: "", 
          size: "", 
          view: "", 
          amenities: [], 
          price: 0 
        });
      }

      const formData: Partial<HotelFormValues> = {
        name: hotel.name || "",
        description: hotel.description || "",
        destinationId: hotel.destinationId || 0,
        address: hotel.address || "",
        cityId: hotel.cityId || null,
        countryId: hotel.countryId || null,
        postalCode: hotel.postalCode || "",
        phone: hotel.phone || "",
        email: hotel.email || "",
        website: hotel.website || "",
        stars: hotel.stars || 3,
        longitude: hotel.longitude || null,
        latitude: hotel.latitude || null,
        featured: hotel.featured || false,
        status: hotel.status || "active",
        checkInTime: hotel.checkInTime || "",
        checkOutTime: hotel.checkOutTime || "",
        parkingAvailable: hotel.parkingAvailable || false,
        airportTransferAvailable: hotel.airportTransferAvailable || false,
        carRentalAvailable: hotel.carRentalAvailable || false,
        shuttleAvailable: hotel.shuttleAvailable || false,
        wifiAvailable: hotel.wifiAvailable !== false,
        petFriendly: hotel.petFriendly || false,
        accessibleFacilities: hotel.accessibleFacilities || false,
        imageUrl: hotel.imageUrl || "",
        galleryUrls: hotel.galleryUrls || [],
        highlightIds: hotel.highlightIds || [],
        facilityIds: hotel.facilityIds || [],
        cleanlinessFeatureIds: hotel.cleanlinessFeatureIds || [],
        landmarks: hotel.landmarks || [],
        restaurants: hotel.restaurants || [],
        faqs: hotel.faqs || [],
        roomTypes: hotel.roomTypes || [],
      };

      // Set selected features
      console.log('Setting facilities:', hotel.facilityIds);
      console.log('Setting highlights:', hotel.highlightIds);
      console.log('Setting cleanliness features:', hotel.cleanlinessFeatureIds);
      
      setSelectedFacilities(hotel.facilityIds || []);
      setSelectedHighlights(hotel.highlightIds || []);
      setSelectedCleanlinessFeatures(hotel.cleanlinessFeatureIds || []);
      setSelectedCountryId(hotel.countryId || null);

      // Set images
      setExistingMainImage(hotel.imageUrl || "");
      setExistingImages(hotel.galleryUrls || []);
      setMainImagePreview(hotel.imageUrl || "");
      setGalleryPreviews(hotel.galleryUrls || []);

      // Set map center if coordinates exist
      if (hotel.latitude && hotel.longitude) {
        setMapCenter({ lat: hotel.latitude, lng: hotel.longitude });
      }

      // Reset form with hotel data
      form.reset(formData);
      setFormInitialized(true);
    }
  }, [hotel, form, formInitialized]);

  // Update hotel mutation
  const updateHotelMutation = useMutation({
    mutationFn: async (hotelData: HotelFormValues) => {
      if (!hotelId) throw new Error("Hotel ID is required");

      const response = await apiRequest(`/api/admin/hotels/${hotelId}`, {
        method: "PUT",
        body: JSON.stringify(hotelData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update hotel");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hotel updated successfully",
        duration: 3000,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hotels"] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/hotels/${hotelId}`] });

      // Navigate back to hotels list
      navigate("/admin/hotels");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update hotel",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Clean URL function to filter out blob URLs
  const getCleanUrl = (url: string): string | null => {
    if (!url) return null;
    // Only allow proper server URLs starting with /uploads
    if (url.startsWith("/uploads")) return url;
    // Filter out blob URLs and other invalid formats
    if (url.startsWith("blob:") || url.startsWith("data:")) return null;
    return url;
  };

  // Form submission handler
  const onSubmit = async (data: HotelFormValues) => {
    try {
      // Clean gallery URLs to remove blob URLs
      const cleanGalleryUrls = galleryPreviews
        .map(getCleanUrl)
        .filter(Boolean) as string[];

      // Clean main image URL
      const cleanMainImageUrl = getCleanUrl(
        mainImagePreview || data.imageUrl || "",
      );

      // Prepare JSON data for submission
      const hotelData = {
        ...data,
        // Add selected features
        facilityIds: selectedFacilities,
        highlightIds: selectedHighlights,
        cleanlinessFeatureIds: selectedCleanlinessFeatures,
        // Include only clean server URLs
        imageUrl: cleanMainImageUrl,
        galleryUrls:
          cleanGalleryUrls.length > 0 ? cleanGalleryUrls : data.galleryUrls,
        stars: data.stars,
      };

      console.log("Submitting hotel data:", hotelData);

      // Call the mutation with JSON data
      updateHotelMutation.mutate(hotelData);
    } catch (error) {
      console.error("Error preparing form data:", error);
    }
  };

  // Toggle facility selection
  const toggleFacility = (facilityId: number) => {
    if (selectedFacilities.includes(facilityId)) {
      setSelectedFacilities(
        selectedFacilities.filter((id) => id !== facilityId),
      );
    } else {
      setSelectedFacilities([...selectedFacilities, facilityId]);
    }
  };

  // Toggle highlight selection
  const toggleHighlight = (highlightId: number) => {
    if (selectedHighlights.includes(highlightId)) {
      setSelectedHighlights(
        selectedHighlights.filter((id) => id !== highlightId),
      );
    } else {
      setSelectedHighlights([...selectedHighlights, highlightId]);
    }
  };

  // Toggle cleanliness feature selection
  const toggleCleanlinessFeature = (featureId: number) => {
    if (selectedCleanlinessFeatures.includes(featureId)) {
      setSelectedCleanlinessFeatures(
        selectedCleanlinessFeatures.filter((id) => id !== featureId),
      );
    } else {
      setSelectedCleanlinessFeatures([
        ...selectedCleanlinessFeatures,
        featureId,
      ]);
    }
  };

  // Image management functions
  const handleMainImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setMainImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setGalleryFiles([...galleryFiles, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGalleryPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMainImage = () => {
    setMainImageFile(null);
    setMainImagePreview("");
    setExistingMainImage("");
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(galleryFiles.filter((_, i) => i !== index));
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
  };

  // Navigation handlers
  const handleNavigateAway = (path: string) => {
    if (form.formState.isDirty) {
      setRedirectPath(path);
      setShowUnsavedChangesAlert(true);
    } else {
      navigate(path);
    }
  };

  const handleConfirmNavigation = () => {
    setShowUnsavedChangesAlert(false);
    navigate(redirectPath);
  };

  if (isLoadingHotel) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading hotel data...</span>
        </div>
      </div>
    );
  }

  if (hotelError || !hotel) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Hotel Not Found</h1>
          <p className="text-muted-foreground mt-2">
            The hotel you're looking for doesn't exist or has been deleted.
          </p>
          <Button
            onClick={() => navigate("/admin/hotels")}
            className="mt-4"
          >
            Back to Hotels
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="link" onClick={() => handleNavigateAway("/admin")}>
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <ChevronRight className="h-4 w-4" />
          <Button variant="link" onClick={() => handleNavigateAway("/admin/hotels")}>
            <Hotel className="h-4 w-4 mr-2" />
            Hotels
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span className="flex items-center">
            <PencilLine className="h-4 w-4 mr-2" />
            Edit Hotel
          </span>
        </div>
        <h1 className="text-3xl font-bold">Edit Hotel: {hotel.name}</h1>
        <p className="text-muted-foreground">
          Update hotel information and manage associated features.
        </p>
      </div>

      {formInitialized && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="transportation">Transportation</TabsTrigger>
                <TabsTrigger value="dining">Dining</TabsTrigger>
                <TabsTrigger value="rooms-faqs">Rooms & FAQs</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Basic Hotel Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hotel Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Hotel Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Grand Hotel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Destination */}
                  <FormField
                    control={form.control}
                    name="destinationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Destination{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a destination" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {!isLoadingDestinations &&
                              Array.isArray(destinations) &&
                              destinations.map((destination: any) => (
                                <SelectItem
                                  key={destination.id}
                                  value={destination.id.toString()}
                                >
                                  {destination.name}, {destination.country}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the hotel and its unique features"
                          className="min-h-[120px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="123 Hotel Street"
                              {...field}
                              className="pl-10"
                            />
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Star Rating */}
                  <FormField
                    control={form.control}
                    name="stars"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Star Rating <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select star rating" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((stars) => (
                              <SelectItem key={stars} value={stars.toString()}>
                                <div className="flex items-center">
                                  {"★".repeat(stars)} ({stars} Star{stars > 1 ? "s" : ""})
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Country and City Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Country */}
                  <FormField
                    control={form.control}
                    name="countryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const countryId = parseInt(value);
                            field.onChange(countryId);
                            setSelectedCountryId(countryId);
                            // Reset city when country changes
                            form.setValue("cityId", null);
                          }}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {!isLoadingCountries &&
                              Array.isArray(countries) &&
                              countries.map((country: any) => (
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

                  {/* City */}
                  <FormField
                    control={form.control}
                    name="cityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                          disabled={!selectedCountryId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  selectedCountryId
                                    ? "Select a city"
                                    : "Select country first"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {!isLoadingCities &&
                              Array.isArray(cities) &&
                              cities
                                .filter((city: any) => city.countryId === selectedCountryId)
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
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="+1 234 567 8900"
                              {...field}
                              value={field.value || ""}
                              className="pl-10"
                            />
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="hotel@example.com"
                              type="email"
                              {...field}
                              value={field.value || ""}
                              className="pl-10"
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="https://hotel.com"
                              {...field}
                              value={field.value || ""}
                              className="pl-10"
                            />
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Check-in/Check-out Times */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="checkInTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-in Time</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="15:00"
                              {...field}
                              value={field.value || ""}
                              className="pl-10"
                            />
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Use 24-hour format (e.g., 15:00)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkOutTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-out Time</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="11:00"
                              {...field}
                              value={field.value || ""}
                              className="pl-10"
                            />
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Use 24-hour format (e.g., 11:00)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Image Management */}
                <div className="space-y-6">
                  <h4 className="text-md font-semibold flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Hotel Images
                  </h4>

                  {/* Main Image */}
                  <div className="space-y-4">
                    <FormLabel>Main Image</FormLabel>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="https://example.com/image.jpg"
                                    {...field}
                                    value={field.value || ""}
                                    className="pl-10"
                                  />
                                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex items-center">
                        <span className="mx-2 text-muted-foreground">OR</span>
                      </div>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("main-image-upload")?.click()
                          }
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                        <input
                          id="main-image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleMainImageChange}
                        />
                      </div>
                    </div>

                    {/* Main Image Preview */}
                    {mainImagePreview && (
                      <div className="relative w-40 h-28">
                        <img
                          src={mainImagePreview}
                          alt="Main hotel image"
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={removeMainImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Gallery Images */}
                  <div className="space-y-4">
                    <FormLabel>Gallery Images</FormLabel>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("gallery-images-upload")?.click()
                        }
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Gallery Images
                      </Button>
                      <input
                        id="gallery-images-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleGalleryImagesChange}
                      />
                    </div>

                    {/* Gallery Images Preview */}
                    {galleryPreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {galleryPreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Gallery image ${index + 1}`}
                              className="w-full h-28 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => removeGalleryImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status and Featured */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Featured Hotel</FormLabel>
                          <FormDescription>
                            Display this hotel prominently on the homepage
                          </FormDescription>
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
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Hotel Features & Amenities
                </h3>

                {/* Hotel Highlights */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Hotel Highlights
                  </h4>
                  <InlineFeatureManager
                    featureType="highlights"
                    selectedFeatures={selectedHighlights}
                    onSelectionChange={setSelectedHighlights}
                    label="Hotel Highlights"
                  />
                </div>

                {/* Hotel Facilities */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Hotel Facilities
                  </h4>
                  <InlineFeatureManager
                    featureType="facilities"
                    selectedFeatures={selectedFacilities}
                    onSelectionChange={setSelectedFacilities}
                    label="Hotel Facilities"
                  />
                </div>

                {/* Cleanliness Features */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Health & Safety Features
                  </h4>
                  <InlineFeatureManager
                    featureType="cleanliness-features"
                    selectedFeatures={selectedCleanlinessFeatures}
                    onSelectionChange={setSelectedCleanlinessFeatures}
                    label="Health & Safety Features"
                  />
                </div>

                {/* Basic Amenities */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold">Basic Amenities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="wifiAvailable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>WiFi Available</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="petFriendly"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Pet Friendly</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accessibleFacilities"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Accessible Facilities</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Transportation Tab */}
              <TabsContent value="transportation" className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Transportation Services
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="parkingAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Parking Available</FormLabel>
                          <FormDescription>
                            Hotel provides parking facilities
                          </FormDescription>
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

                  <FormField
                    control={form.control}
                    name="airportTransferAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Airport Transfer</FormLabel>
                          <FormDescription>
                            Airport shuttle service available
                          </FormDescription>
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

                  <FormField
                    control={form.control}
                    name="carRentalAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Car Rental</FormLabel>
                          <FormDescription>
                            Car rental services available
                          </FormDescription>
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

                  <FormField
                    control={form.control}
                    name="shuttleAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Shuttle Service</FormLabel>
                          <FormDescription>
                            Local shuttle service available
                          </FormDescription>
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
              </TabsContent>

              {/* Dining Tab */}
              <TabsContent value="dining" className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Dining & Restaurants
                </h3>

                {/* Restaurants */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold">Hotel Restaurants</h4>
                    <Button
                      type="button"
                      onClick={() =>
                        appendRestaurant({
                          name: "",
                          cuisineType: "",
                          breakfastOptions: [],
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Restaurant
                    </Button>
                  </div>

                  {restaurantFields.map((field, index) => (
                    <Card key={field.id}>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`restaurants.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Restaurant Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Restaurant name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`restaurants.${index}.cuisineType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cuisine Type</FormLabel>
                                <FormControl>
                                  <Input placeholder="Mediterranean, Arabic, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="mt-4">
                          <FormLabel>Breakfast Options</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            {breakfastOptions.map((option) => (
                              <FormField
                                key={option.id}
                                control={form.control}
                                name={`restaurants.${index}.breakfastOptions`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                          const current = field.value || [];
                                          if (checked) {
                                            field.onChange([...current, option.id]);
                                          } else {
                                            field.onChange(current.filter((item) => item !== option.id));
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end mt-4">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeRestaurant(index)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Rooms & FAQs Tab */}
              <TabsContent value="rooms-faqs" className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BedDouble className="h-5 w-5" />
                  Room Types & FAQs
                </h3>

                {/* Room Types */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold">Room Types</h4>
                    <Button
                      type="button"
                      onClick={() =>
                        appendRoomType({
                          name: "",
                          bedType: "",
                          size: "",
                          view: "",
                          amenities: [],
                          price: 0,
                        })
                      }
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Room Type
                    </Button>
                  </div>

                  {roomTypeFields.map((field, index) => (
                    <Card key={field.id}>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`roomTypes.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Room Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Deluxe Room" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`roomTypes.${index}.bedType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bed Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select bed type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {bedTypeOptions.map((bedType) => (
                                      <SelectItem key={bedType} value={bedType}>
                                        {bedType}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`roomTypes.${index}.size`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Room Size</FormLabel>
                                <FormControl>
                                  <Input placeholder="25 sqm" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`roomTypes.${index}.view`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>View</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select view" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {roomViewOptions.map((view) => (
                                      <SelectItem key={view} value={view}>
                                        {view}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`roomTypes.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price per Night (EGP)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="2500"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="mt-4">
                          <FormLabel>Room Amenities</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {roomAmenityOptions.map((amenity) => (
                              <FormField
                                key={amenity.id}
                                control={form.control}
                                name={`roomTypes.${index}.amenities`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(amenity.id)}
                                        onCheckedChange={(checked) => {
                                          const current = field.value || [];
                                          if (checked) {
                                            field.onChange([...current, amenity.id]);
                                          } else {
                                            field.onChange(current.filter((item) => item !== amenity.id));
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {amenity.label}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end mt-4">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeRoomType(index)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* FAQs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold flex items-center gap-2">
                      <FileQuestion className="h-4 w-4" />
                      Frequently Asked Questions
                    </h4>
                    <Button
                      type="button"
                      onClick={() => appendFaq({ question: "", answer: "" })}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add FAQ
                    </Button>
                  </div>

                  {faqFields.map((field, index) => (
                    <Card key={field.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`faqs.${index}.question`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Question</FormLabel>
                                <FormControl>
                                  <Input placeholder="What time is check-in?" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`faqs.${index}.answer`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Answer</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Check-in is from 15:00..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end mt-4">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFaq(index)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleNavigateAway("/admin/hotels")}
              >
                Cancel
              </Button>
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={updateHotelMutation.isPending}
                >
                  {updateHotelMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </Form>
      )}

      {/* Unsaved Changes Alert */}
      <AlertDialog open={showUnsavedChangesAlert} onOpenChange={setShowUnsavedChangesAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave this page?
              Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay on Page</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNavigation}>
              Leave Page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}