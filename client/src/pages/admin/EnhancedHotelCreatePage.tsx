import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

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
  Wifi,
  Waves,
  Dumbbell,
  Heart,
  Sparkles,
  Palette,
  ShowerHead,
  AirVent,
  Tv,
  Shield,
  Users,
  Package,
  ChevronDown,
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

// Define schema for room type (matching database requirements)
const roomTypeSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  description: z.string().optional(),
  type: z.string().min(1, "Room type is required"),
  maxOccupancy: z.coerce.number().min(1, "Max occupancy must be at least 1"),
  maxAdults: z.coerce.number().min(1, "Max adults must be at least 1"),
  maxChildren: z.coerce.number().min(0, "Max children cannot be negative").default(0),
  maxInfants: z.coerce.number().min(0, "Max infants cannot be negative").default(0),
  price: z.coerce.number().min(1, "Price is required and must be greater than 0"),
  discountedPrice: z.coerce.number().optional(),
  size: z.string().optional(),
  bedType: z.string().optional(),
  view: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  available: z.boolean().default(true),
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

  // Enhanced features storage with name and icon properties
  features: z.array(z.object({
    name: z.string(),
    icon: z.string()
  })).default([]),

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

// Room type options (for the type field)
const roomTypeOptions = [
  "Standard",
  "Deluxe",
  "Superior",
  "Suite",
  "Executive",
  "Presidential",
  "Family",
  "Twin",
  "Single",
  "Double",
  "Junior Suite",
  "Connecting",
  "Accessible",
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

// Feature icon options
const featureIconOptions = [
  { name: "Star", component: Star },
  { name: "Wifi", component: Wifi },
  { name: "Waves", component: Waves },
  { name: "Dumbbell", component: Dumbbell },
  { name: "Coffee", component: Coffee },
  { name: "Utensils", component: Utensils },
  { name: "Car", component: Car },
  { name: "Plane", component: Plane },
  { name: "Bus", component: Bus },
  { name: "Heart", component: Heart },
  { name: "Sparkles", component: Sparkles },
  { name: "ShowerHead", component: ShowerHead },
  { name: "AirVent", component: AirVent },
  { name: "Tv", component: Tv },
  { name: "Shield", component: Shield },
  { name: "Users", component: Users },
  { name: "Building", component: Building },
  { name: "MapPin", component: MapPin },
  { name: "Clock", component: Clock },
  { name: "Package", component: Package },
];

// Predefined feature objects for hotel creation
const predefinedFeatures = [
  { name: "drink", icon: "wine-glass" },
  { name: "meal", icon: "hamburger" },
  { name: "wifi", icon: "wifi" },
  { name: "parking", icon: "car" },
  { name: "pool", icon: "swimming-pool" },
  { name: "gym", icon: "dumbbell" },
  { name: "spa", icon: "spa" },
  { name: "restaurant", icon: "utensils" },
  { name: "room service", icon: "concierge-bell" },
  { name: "air conditioning", icon: "snowflake" },
  { name: "laundry", icon: "tshirt" },
  { name: "business center", icon: "briefcase" },
  { name: "conference room", icon: "presentation-screen" },
  { name: "elevator", icon: "elevator" },
  { name: "balcony", icon: "balcony" },
  { name: "kitchen", icon: "chef-hat" },
  { name: "bar", icon: "martini-glass" },
  { name: "garden", icon: "tree" },
  { name: "beach access", icon: "umbrella-beach" },
  { name: "pet friendly", icon: "dog" }
];

export default function EnhancedHotelCreatePage() {
  const { t } = useLanguage();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for selections
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
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Simple feature management state - Initialize empty, will be set after predefinedFeatures is defined
  const [newFeature, setNewFeature] = useState<string>("");
  const [hotelFeatures, setHotelFeatures] = useState<{ name: string; icon: string }[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string>("Star");
  const [showIconSelector, setShowIconSelector] = useState<boolean>(false);
  const iconSelectorRef = useRef<HTMLDivElement>(null);

  // Google Maps integration
  const [apiKey, setApiKey] = useState<string>("");
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey || "",
  });

  // Initialize hotel features as empty - users will select what they want
  useEffect(() => {
    setHotelFeatures([]);
  }, []);

  // Load Google Maps API key
  useEffect(() => {
    // In a real implementation, this would fetch from your backend
    // For demo purposes, we'll use a placeholder
    // Replace this with an actual API call
    const fetchApiKey = async () => {
      try {
        const response = await fetch("/api/maps-key");
        const data = await response.json();
        if (data && data.key) {
          setApiKey(data.key);
        }
      } catch (error) {
        console.error("Failed to load Maps API key:", error);
      }
    };

    fetchApiKey();
  }, []);

  // Handle click outside icon selector
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (iconSelectorRef.current && !iconSelectorRef.current.contains(event.target as Node)) {
        setShowIconSelector(false);
      }
    };

    if (showIconSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIconSelector]);

  // Image handling functions
  const handleMainImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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

  const handleGalleryImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setGalleryFiles((prev) => [...prev, ...files]);

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setGalleryPreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMainImage = () => {
    setMainImageFile(null);
    setMainImagePreview("");
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Placeholder for toggleFeature - will be defined after form initialization

  const addCustomFeature = () => {
    if (newFeature.trim() && !hotelFeatures.some(f => f.name === newFeature.trim())) {
      const newFeatureObj = { name: newFeature.trim(), icon: selectedIcon };
      const updatedFeatures = [...hotelFeatures, newFeatureObj];
      setHotelFeatures(updatedFeatures);
      
      // Update the form's features field with complete feature objects (name + icon)
      form.setValue("features", updatedFeatures);
      
      console.log("✅ Custom feature added successfully:");
      console.log("- Feature name:", newFeature.trim());
      console.log("- Feature icon:", selectedIcon);
      console.log("- Updated hotelFeatures:", updatedFeatures);
      
      setNewFeature("");
    } else {
      console.log("❌ Failed to add custom feature:");
      console.log("- Feature name:", newFeature.trim());
      console.log("- Already exists:", hotelFeatures.some(f => f.name === newFeature.trim()));
    }
  };

  const removeFeature = (index: number) => {
    const featureToRemove = hotelFeatures[index];
    const updatedFeatures = hotelFeatures.filter((_, i) => i !== index);
    setHotelFeatures(updatedFeatures);
    
    // Update the form's features field with complete feature objects
    form.setValue("features", updatedFeatures);
    
    console.log("🗑️ Feature removed:");
    console.log("- Removed feature:", featureToRemove?.name);
    console.log("- Updated hotelFeatures:", updatedFeatures);
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = featureIconOptions.find(option => option.name === iconName);
    return iconOption ? iconOption.component : Star;
  };



  // Form setup with default values including predefined features
  const form = useForm<HotelFormValues>({
    resolver: zodResolver(hotelFormSchema),
    defaultValues: {
      name: "",
      description: "",
      destinationId: undefined,
      address: "",
      cityId: undefined,
      countryId: undefined,
      postalCode: "",
      phone: "",
      email: "",
      website: "",
      stars: 3,
      checkInTime: "14:00",
      checkOutTime: "11:00",
      longitude: undefined,
      latitude: undefined,
      featured: false,
      status: "active",
      features: [], // Start with empty features - users select what they want
      parkingAvailable: false,
      airportTransferAvailable: false,
      carRentalAvailable: false,
      shuttleAvailable: false,
      landmarks: [],
      restaurants: [],
      faqs: [],
      roomTypes: [],
    },
  });

  // Enhanced feature management functions - storing complete objects with name and icon
  const toggleFeature = useCallback((feature: { name: string; icon: string }) => {
    setHotelFeatures(currentFeatures => {
      const isSelected = currentFeatures.some(f => f.name === feature.name);
      let updatedFeatures;
      
      if (isSelected) {
        // Remove feature
        updatedFeatures = currentFeatures.filter(f => f.name !== feature.name);
      } else {
        // Add feature
        updatedFeatures = [...currentFeatures, feature];
      }
      
      // Update form value
      form.setValue("features", updatedFeatures);
      
      console.log(`${isSelected ? '🗑️' : '✅'} Feature ${isSelected ? 'removed' : 'added'}:`, feature.name);
      console.log("- Updated hotelFeatures:", updatedFeatures);
      
      return updatedFeatures;
    });
  }, [form]);

  // Setup field arrays for related items
  const landmarksFieldArray = useFieldArray({
    control: form.control,
    name: "landmarks",
  });

  const restaurantsFieldArray = useFieldArray({
    control: form.control,
    name: "restaurants",
  });

  const faqsFieldArray = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  const roomTypesFieldArray = useFieldArray({
    control: form.control,
    name: "roomTypes",
  });

  // Fetch destinations
  const { data: destinations = [], isLoading: isLoadingDestinations } =
    useQuery({
      queryKey: ["/api/destinations"],
      queryFn: getQueryFn(),
    });

  // Fetch countries data for the dropdown
  const { data: countries = [] } = useQuery({
    queryKey: ["/api/countries"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch cities data for the dropdown
  const { data: cities = [] } = useQuery({
    queryKey: ["/api/cities"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch facilities
  const { data: facilities = [], isLoading: isLoadingFacilities } = useQuery({
    queryKey: ["/api/admin/hotel-facilities"],
    queryFn: getQueryFn(),
  });

  // Fetch highlights
  const { data: highlights = [], isLoading: isLoadingHighlights } = useQuery({
    queryKey: ["/api/admin/hotel-highlights"],
    queryFn: getQueryFn(),
  });

  // Fetch cleanliness features
  const {
    data: cleanlinessFeatures = [],
    isLoading: isLoadingCleanlinessFeatures,
  } = useQuery({
    queryKey: ["/api/admin/cleanliness-features"],
    queryFn: getQueryFn(),
  });



  // Function to search nearby landmarks with Google Places API
  const searchNearbyLandmarks = () => {
    setIsSearchingLandmarks(true);

    // This would typically call the Google Places API
    // For this implementation, we're simulating results
    setTimeout(() => {
      const mockLandmarks = [
        {
          name: "Great Pyramid of Giza",
          description: "Ancient Egyptian pyramid",
          distance: "1.2 km",
          placeId: "ChIJN8F_47w7WBQRUJGUzM6Fsks",
        },
        {
          name: "Egyptian Museum",
          description: "History museum",
          distance: "3.4 km",
          placeId: "ChIJ5y7_47R7WBQRuLZMSJXnDzs",
        },
        {
          name: "Khan el-Khalili",
          description: "Historic bazaar",
          distance: "5.8 km",
          placeId: "ChIJ9dSaz6s_WBQRam44QaRRdWQ",
        },
        {
          name: "Tahrir Square",
          description: "Public square",
          distance: "2.9 km",
          placeId: "ChIJLR2Vc8c_WBQRftgykvDG_PY",
        },
      ];

      setSuggestedLandmarks(mockLandmarks);
      setIsSearchingLandmarks(false);
    }, 1000);
  };

  // Handle adding a landmark from suggestions
  const addLandmarkFromSuggestion = (landmark: any) => {
    landmarksFieldArray.append({
      name: landmark.name,
      description: landmark.description,
      distance: landmark.distance,
      placeId: landmark.placeId,
    });
  };

  // Create hotel mutation
  const createHotelMutation = useMutation({
    mutationFn: async (data: HotelFormValues) => {
      return await fetch("/api/admin/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to create hotel");
        return res.json();
      });
    },
    onSuccess: () => {
      // Show success message
      toast({
        title: "Hotel Created",
        description: "The hotel was created successfully",
        duration: 5000,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hotels"] });

      // Navigate back to hotels list
      navigate("/admin/hotels");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create hotel",
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
      setIsUploadingImages(true);
      console.log("🚀 Starting hotel creation with image upload...");
      console.log("📝 FORM SUBMISSION DEBUG:");
      console.log("- Raw form data:", data);
      console.log("- Features from form:", data.features);
      console.log("- Features count:", data.features?.length || 0);
      console.log("- Local hotelFeatures state:", hotelFeatures);
      console.log("- Local hotelFeatures count:", hotelFeatures.length);
      console.log("- Current form features value:", form.getValues("features"));
      
      // Upload main image if file is selected
      let mainImageUrl = data.imageUrl || "";
      if (mainImageFile) {
        console.log("Uploading main image:", mainImageFile.name);
        toast({
          title: "Uploading Images",
          description: "Uploading main image...",
        });
        
        const formData = new FormData();
        formData.append("image", mainImageFile);
        
        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          mainImageUrl = result.url;
          console.log("Main image uploaded successfully:", mainImageUrl);
        } else {
          console.error("Failed to upload main image");
          setIsUploadingImages(false);
          toast({
            title: "Error",
            description: "Failed to upload main image",
            variant: "destructive",
          });
          return;
        }
      }

      // Upload gallery images
      let galleryUrls: string[] = [];
      if (galleryFiles.length > 0) {
        console.log("Uploading gallery images:", galleryFiles.length, "files");
        toast({
          title: "Uploading Images",
          description: `Uploading ${galleryFiles.length} gallery images...`,
        });
        
        for (let i = 0; i < galleryFiles.length; i++) {
          const file = galleryFiles[i];
          console.log(`Uploading gallery image ${i + 1}/${galleryFiles.length}:`, file.name);
          
          const formData = new FormData();
          formData.append("image", file);
          
          const response = await fetch("/api/upload/image", {
            method: "POST",
            body: formData,
          });
          
          if (response.ok) {
            const result = await response.json();
            galleryUrls.push(result.url);
            console.log(`Gallery image ${i + 1} uploaded:`, result.url);
          } else {
            console.error("Failed to upload gallery image:", file.name);
            // Continue with other images even if one fails
          }
        }
        console.log("All gallery images processed. Total URLs:", galleryUrls.length);
      }

      // Prepare hotel data with uploaded image URLs
      const hotelData = {
        ...data,
        // Use features from form data (already in correct format)
        features: data.features || [],
        // Use uploaded image URLs
        imageUrl: mainImageUrl,
        galleryUrls: galleryUrls.length > 0 ? galleryUrls : (data.galleryUrls || []),
        stars: data.stars,
      };

      console.log("Submitting hotel data with uploaded images:", {
        imageUrl: hotelData.imageUrl,
        galleryUrls: hotelData.galleryUrls,
        totalGalleryImages: hotelData.galleryUrls.length,
        features: hotelData.features,
        featuresCount: hotelData.features.length
      });

      toast({
        title: "Creating Hotel",
        description: "Saving hotel data to database...",
      });

      // Call the mutation with JSON data and wait for completion
      await createHotelMutation.mutateAsync(hotelData);
      
      setIsUploadingImages(false);
      console.log("Hotel created successfully with images!");
    } catch (error) {
      setIsUploadingImages(false);
      console.error("Error preparing form data:", error);
      toast({
        title: "Error",
        description: "Failed to process hotel data",
        variant: "destructive",
      });
    }
  };



  return (
    <div>
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Button variant="link" onClick={() => navigate("/admin")}>
              Dashboard
            </Button>
            <ChevronRight className="h-4 w-4" />
            <Button variant="link" onClick={() => navigate("/admin/hotels")}>
              Hotels
            </Button>
            <ChevronRight className="h-4 w-4" />
            <span>Create Hotel</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Hotel</CardTitle>
            <CardDescription>
              Enter comprehensive details to create a new hotel listing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid grid-cols-5 mb-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="transportation">
                      Transportation
                    </TabsTrigger>
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
                              defaultValue={field.value?.toString()}
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
                                field.onChange(countryId);
                                setSelectedCountryId(countryId);
                                // Reset cityId when country changes
                                form.setValue("cityId", null as any);
                              }}
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
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
                              disabled={!selectedCountryId}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      selectedCountryId
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
                                      (city: any) =>
                                        city.countryId === selectedCountryId,
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

                      {/* Postal Code */}
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="12345"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Star Rating */}
                      <FormField
                        control={form.control}
                        name="stars"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Star Rating{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Select
                                  onValueChange={(value) =>
                                    field.onChange(parseInt(value))
                                  }
                                  defaultValue={field.value?.toString() || "3"}
                                >
                                  <SelectTrigger className="pl-10">
                                    <SelectValue placeholder="Select stars" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5].map((stars) => (
                                      <SelectItem
                                        key={stars}
                                        value={stars.toString()}
                                      >
                                        {stars} {stars === 1 ? "Star" : "Stars"}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />


                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Phone */}
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="+1 (123) 456-7890"
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

                      {/* Email */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="info@hotelname.com"
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Website */}
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="https://www.hotelname.com"
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

                      {/* Image Management */}
                      <div className="md:col-span-2">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <Image className="h-5 w-5" />
                              Hotel Images
                            </h3>
                          </div>

                          {/* Main Image Section */}
                          <div className="border rounded-lg p-4 space-y-4">
                            <h4 className="font-medium flex items-center gap-2">
                              <Camera className="h-4 w-4" />
                              Main Image
                            </h4>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Upload Main Image
                              </label>
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleMainImageUpload}
                                    className="cursor-pointer"
                                  />
                                </div>
                                {mainImagePreview && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={removeMainImage}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              {mainImagePreview && (
                                <div className="mt-2">
                                  <img
                                    src={mainImagePreview}
                                    alt="Main image preview"
                                    className="w-32 h-24 object-cover rounded-md border"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Gallery Images Section */}
                          <div className="border rounded-lg p-4 space-y-4">
                            <h4 className="font-medium flex items-center gap-2">
                              <Image className="h-4 w-4" />
                              Gallery Images
                            </h4>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Upload Gallery Images
                              </label>
                              <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleGalleryImageUpload}
                                className="cursor-pointer"
                              />
                              {galleryPreviews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                                  {galleryPreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                      <img
                                        src={preview}
                                        alt={`Gallery image ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-md border"
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-1 right-1 w-6 h-6 p-0"
                                        onClick={() =>
                                          removeGalleryImage(index)
                                        }
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Check-in Time */}
                      <FormField
                        control={form.control}
                        name="checkInTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Check-in Time</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="14:00"
                                  {...field}
                                  value={field.value || ""}
                                  className="pl-10"
                                />
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Check-out Time */}
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Longitude */}
                      <FormField
                        control={form.control}
                        name="longitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longitude</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.0000"
                                step="0.000001"
                                {...field}
                                value={
                                  field.value === undefined ||
                                  field.value === null
                                    ? ""
                                    : field.value
                                }
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : parseFloat(e.target.value),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Latitude */}
                      <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.0000"
                                step="0.000001"
                                {...field}
                                value={
                                  field.value === undefined ||
                                  field.value === null
                                    ? ""
                                    : field.value
                                }
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : parseFloat(e.target.value),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Nearby Landmarks */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Nearby Landmarks
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Search for nearby landmarks"
                              value={locationSearchQuery}
                              onChange={(e) =>
                                setLocationSearchQuery(e.target.value)
                              }
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              onClick={searchNearbyLandmarks}
                              disabled={
                                isSearchingLandmarks ||
                                !locationSearchQuery.trim()
                              }
                            >
                              {isSearchingLandmarks ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Search className="h-4 w-4" />
                              )}
                              {isSearchingLandmarks ? "Searching..." : "Search"}
                            </Button>
                          </div>
                        </div>

                        <div className="md:col-span-1">
                          <FormDescription>
                            Search for landmarks near this hotel to help guests
                            know what's nearby.
                          </FormDescription>
                        </div>
                      </div>

                      {suggestedLandmarks.length > 0 && (
                        <Card className="mt-4">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">
                              Suggested Landmarks
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-48">
                              <div className="space-y-2">
                                {suggestedLandmarks.map((landmark, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center p-2 hover:bg-muted rounded-md"
                                  >
                                    <div>
                                      <p className="font-medium">
                                        {landmark.name}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {landmark.description} •{" "}
                                        {landmark.distance}
                                      </p>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        addLandmarkFromSuggestion(landmark)
                                      }
                                    >
                                      <Plus className="h-4 w-4 mr-1" /> Add
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      )}

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Added Landmarks</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              landmarksFieldArray.append({
                                name: "",
                                description: "",
                                distance: "",
                                placeId: "",
                              })
                            }
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Manually
                          </Button>
                        </div>

                        {landmarksFieldArray.fields.length > 0 ? (
                          <div className="border rounded-md divide-y">
                            {landmarksFieldArray.fields.map((field, index) => (
                              <div key={field.id} className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-medium">
                                    Landmark #{index + 1}
                                  </h5>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      landmarksFieldArray.remove(index)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name={`landmarks.${index}.name`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Name*</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Landmark name"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`landmarks.${index}.distance`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Distance</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="e.g. 1.2 km"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <div className="md:col-span-2">
                                    <FormField
                                      control={form.control}
                                      name={`landmarks.${index}.description`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Description</FormLabel>
                                          <FormControl>
                                            <Input
                                              placeholder="Brief description"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border rounded-md p-6 text-center">
                            <MapPin className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">
                              No landmarks added yet
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Featured */}
                    <div className="flex justify-between items-center">
                      <div>
                        <FormLabel className="text-base">
                          Featured Hotel
                        </FormLabel>
                        <FormDescription>
                          Feature this hotel on the homepage and search results
                        </FormDescription>
                      </div>
                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem>
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
                      <Star className="h-5 w-5" />
                      Hotel Features
                    </h3>
                    <FormDescription>
                      Select the features that your hotel offers to guests.
                    </FormDescription>

                    {/* Available Features Grid */}
                    <div className="border rounded-lg p-4 space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Available Features
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {predefinedFeatures.map((feature, index) => {
                          const isSelected = hotelFeatures.some(f => f.name === feature.name);
                          return (
                            <div 
                              key={`feature-${index}-${feature.name}`}
                              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                                isSelected 
                                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => toggleFeature(feature)}
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-blue-500 border-blue-500' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {React.createElement(getIconComponent(feature.icon), { 
                                  className: `h-4 w-4 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-500'}` 
                                })}
                                <span className={`text-sm capitalize truncate ${
                                  isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'
                                }`}>
                                  {feature.name}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Feature Addition */}
                    <div className="border rounded-lg p-4 space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Custom Feature
                      </h4>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Input
                            placeholder="Enter custom feature name"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addCustomFeature();
                              }
                            }}
                          />
                        </div>
                        
                        {/* Icon Selector Button */}
                        <div className="relative" ref={iconSelectorRef}>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowIconSelector(!showIconSelector)}
                            className="flex items-center gap-2 px-3 h-10"
                          >
                            {React.createElement(getIconComponent(selectedIcon), { className: "h-4 w-4" })}
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                          
                          {/* Icon Selector Dropdown */}
                          {showIconSelector && (
                            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 p-2">
                              <div className="grid grid-cols-4 gap-2 w-48">
                                {featureIconOptions.map((iconOption) => (
                                  <button
                                    key={iconOption.name}
                                    type="button"
                                    onClick={() => {
                                      setSelectedIcon(iconOption.name);
                                      setShowIconSelector(false);
                                    }}
                                    className={`p-2 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors ${
                                      selectedIcon === iconOption.name ? 'bg-blue-100 border border-blue-300' : ''
                                    }`}
                                    title={iconOption.name}
                                  >
                                    {React.createElement(iconOption.component, { className: "h-4 w-4" })}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Button
                          type="button"
                          onClick={addCustomFeature}
                          disabled={!newFeature.trim()}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                        >
                          ADD
                        </Button>
                      </div>
                    </div>

                    {/* Selected Features Summary */}
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Selected Features</h4>
                        <span className="text-sm text-muted-foreground">
                          {hotelFeatures.length} feature{hotelFeatures.length !== 1 ? 's' : ''} selected
                        </span>
                      </div>
                      
                      {hotelFeatures.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {hotelFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                              <div className="flex items-center gap-2">
                                {React.createElement(getIconComponent(feature.icon), { className: "h-4 w-4 text-green-600" })}
                                <span className="text-sm capitalize text-green-800 font-medium">{feature.name}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFeature(index)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No features selected yet</p>
                          <p className="text-sm">Click on features above to select them for your hotel</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Transportation Tab */}
                  <TabsContent value="transportation" className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Transportation Options
                    </h3>
                    <FormDescription>
                      Configure the transportation options available at this
                      hotel.
                    </FormDescription>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Airport Transfer */}
                      <div className="flex justify-between items-center p-4 border rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                            <Plane className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Airport Transfer</p>
                            <p className="text-sm text-muted-foreground">
                              Hotel offers airport transfer service
                            </p>
                          </div>
                        </div>
                        <FormField
                          control={form.control}
                          name="airportTransferAvailable"
                          render={({ field }) => (
                            <FormItem>
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

                      {/* Car Rental */}
                      <div className="flex justify-between items-center p-4 border rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                            <Car className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Car Rental</p>
                            <p className="text-sm text-muted-foreground">
                              Hotel provides car rental services
                            </p>
                          </div>
                        </div>
                        <FormField
                          control={form.control}
                          name="carRentalAvailable"
                          render={({ field }) => (
                            <FormItem>
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

                      {/* Shuttle Service */}
                      <div className="flex justify-between items-center p-4 border rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                            <Bus className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Shuttle Service</p>
                            <p className="text-sm text-muted-foreground">
                              Hotel offers shuttle or taxi services
                            </p>
                          </div>
                        </div>
                        <FormField
                          control={form.control}
                          name="shuttleAvailable"
                          render={({ field }) => (
                            <FormItem>
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

                      {/* Parking */}
                      <div className="flex justify-between items-center p-4 border rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                            <Car className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Parking</p>
                            <p className="text-sm text-muted-foreground">
                              Hotel has parking facilities
                            </p>
                          </div>
                        </div>
                        <FormField
                          control={form.control}
                          name="parkingAvailable"
                          render={({ field }) => (
                            <FormItem>
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
                    </div>
                  </TabsContent>

                  {/* Dining Tab */}
                  <TabsContent value="dining" className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Utensils className="h-5 w-5" />
                      Food and Dining
                    </h3>
                    <FormDescription>
                      Add information about restaurants and dining options at
                      this hotel.
                    </FormDescription>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Hotel Restaurants</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            restaurantsFieldArray.append({
                              name: "",
                              cuisineType: "",
                              breakfastOptions: [],
                            })
                          }
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Restaurant
                        </Button>
                      </div>

                      {restaurantsFieldArray.fields.length > 0 ? (
                        <div className="border rounded-md divide-y">
                          {restaurantsFieldArray.fields.map((field, index) => (
                            <div key={field.id} className="p-4">
                              <div className="flex justify-between items-start mb-4">
                                <h5 className="font-medium">
                                  Restaurant #{index + 1}
                                </h5>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    restaurantsFieldArray.remove(index)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`restaurants.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Restaurant Name*</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Restaurant name"
                                          {...field}
                                        />
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
                                        <Input
                                          placeholder="e.g. Italian, Middle Eastern"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="md:col-span-2">
                                  <FormField
                                    control={form.control}
                                    name={`restaurants.${index}.breakfastOptions`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Breakfast Options</FormLabel>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                          {breakfastOptions.map((option) => (
                                            <div
                                              key={option.id}
                                              className="flex items-center space-x-2"
                                            >
                                              <Checkbox
                                                id={`breakfast-${index}-${option.id}`}
                                                checked={field.value.includes(
                                                  option.id,
                                                )}
                                                onCheckedChange={(checked) => {
                                                  if (checked) {
                                                    field.onChange([
                                                      ...field.value,
                                                      option.id,
                                                    ]);
                                                  } else {
                                                    field.onChange(
                                                      field.value.filter(
                                                        (val: string) =>
                                                          val !== option.id,
                                                      ),
                                                    );
                                                  }
                                                }}
                                              />
                                              <label
                                                htmlFor={`breakfast-${index}-${option.id}`}
                                                className="text-sm cursor-pointer"
                                              >
                                                {option.label}
                                              </label>
                                            </div>
                                          ))}
                                        </div>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border rounded-md p-6 text-center">
                          <Utensils className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">
                            No restaurants added yet
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Rooms & FAQs Tab */}
                  <TabsContent value="rooms-faqs" className="space-y-6">
                    {/* Room Types */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <BedDouble className="h-5 w-5" />
                        Room Types
                      </h3>
                      <FormDescription>
                        Add information about room types available at this
                        hotel. You can add more detailed information after
                        creating the hotel.
                      </FormDescription>

                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Room Types</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            roomTypesFieldArray.append({
                              name: "",
                              description: "",
                              type: "",
                              maxOccupancy: 2,
                              maxAdults: 2,
                              maxChildren: 0,
                              maxInfants: 0,
                              price: 0,
                              discountedPrice: undefined,
                              bedType: "",
                              size: "",
                              view: "",
                              amenities: [],
                              available: true,
                            })
                          }
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Room Type
                        </Button>
                      </div>

                      {roomTypesFieldArray.fields.length > 0 ? (
                        <div className="border rounded-md divide-y">
                          {roomTypesFieldArray.fields.map((field, index) => (
                            <div key={field.id} className="p-4">
                              <div className="flex justify-between items-start mb-4">
                                <h5 className="font-medium">
                                  Room Type #{index + 1}
                                </h5>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    roomTypesFieldArray.remove(index)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Room Name - Required */}
                                <FormField
                                  control={form.control}
                                  name={`roomTypes.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Room Name <span className="text-red-500">*</span></FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="e.g. Deluxe Double Room"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Room Type - Required */}
                                <FormField
                                  control={form.control}
                                  name={`roomTypes.${index}.type`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Room Type <span className="text-red-500">*</span></FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select room type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {roomTypeOptions.map((type) => (
                                            <SelectItem key={type} value={type}>
                                              {type}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Max Occupancy - Required */}
                                <FormField
                                  control={form.control}
                                  name={`roomTypes.${index}.maxOccupancy`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Max Occupancy <span className="text-red-500">*</span></FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="10"
                                          placeholder="e.g. 4"
                                          {...field}
                                          value={field.value}
                                          onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Max Adults - Required */}
                                <FormField
                                  control={form.control}
                                  name={`roomTypes.${index}.maxAdults`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Max Adults <span className="text-red-500">*</span></FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="8"
                                          placeholder="e.g. 2"
                                          {...field}
                                          value={field.value}
                                          onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Max Children */}
                                <FormField
                                  control={form.control}
                                  name={`roomTypes.${index}.maxChildren`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Max Children</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="0"
                                          max="6"
                                          placeholder="e.g. 2"
                                          {...field}
                                          value={field.value}
                                          onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Max Infants */}
                                <FormField
                                  control={form.control}
                                  name={`roomTypes.${index}.maxInfants`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Max Infants</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="0"
                                          max="4"
                                          placeholder="e.g. 1"
                                          {...field}
                                          value={field.value}
                                          onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Price - Required */}
                                <FormField
                                  control={form.control}
                                  name={`roomTypes.${index}.price`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Price per Night (EGP) <span className="text-red-500">*</span></FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="1"
                                          placeholder="e.g. 2500"
                                          {...field}
                                          value={field.value}
                                          onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Discounted Price */}
                                <FormField
                                  control={form.control}
                                  name={`roomTypes.${index}.discountedPrice`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Discounted Price (EGP)</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="1"
                                          placeholder="e.g. 2000"
                                          {...field}
                                          value={field.value || ""}
                                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Bed Type */}
                                <FormField
                                  control={form.control}
                                  name={`roomTypes.${index}.bedType`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Bed Type</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select bed type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {bedTypeOptions.map((type) => (
                                            <SelectItem key={type} value={type}>
                                              {type}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Room Size */}
                                <FormField
                                  control={form.control}
                                  name={`roomTypes.${index}.size`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Room Size</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="e.g. 30 m²"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* View */}
                                <FormField
                                  control={form.control}
                                  name={`roomTypes.${index}.view`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>View</FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select view type" />
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

                                {/* Available Toggle */}
                                <FormField
                                  control={form.control}
                                  name={`roomTypes.${index}.available`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                      <div className="space-y-0.5">
                                        <FormLabel>Available for Booking</FormLabel>
                                        <FormDescription>
                                          Make this room available for booking
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

                                {/* Description */}
                                <div className="md:col-span-2">
                                  <FormField
                                    control={form.control}
                                    name={`roomTypes.${index}.description`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Room Description</FormLabel>
                                        <FormControl>
                                          <Textarea
                                            placeholder="Describe the room features and amenities..."
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <FormField
                                    control={form.control}
                                    name={`roomTypes.${index}.amenities`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Room Amenities</FormLabel>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                          {roomAmenityOptions.map((option) => (
                                            <div
                                              key={option.id}
                                              className="flex items-center space-x-2"
                                            >
                                              <Checkbox
                                                id={`room-amenity-${index}-${option.id}`}
                                                checked={field.value.includes(
                                                  option.id,
                                                )}
                                                onCheckedChange={(checked) => {
                                                  if (checked) {
                                                    field.onChange([
                                                      ...field.value,
                                                      option.id,
                                                    ]);
                                                  } else {
                                                    field.onChange(
                                                      field.value.filter(
                                                        (val: string) =>
                                                          val !== option.id,
                                                      ),
                                                    );
                                                  }
                                                }}
                                              />
                                              <label
                                                htmlFor={`room-amenity-${index}-${option.id}`}
                                                className="text-sm cursor-pointer"
                                              >
                                                {option.label}
                                              </label>
                                            </div>
                                          ))}
                                        </div>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border rounded-md p-6 text-center">
                          <BedDouble className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">
                            No room types added yet
                          </p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* FAQs */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileQuestion className="h-5 w-5" />
                        Frequently Asked Questions
                      </h3>
                      <FormDescription>
                        Add frequently asked questions about this hotel.
                      </FormDescription>

                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">FAQ Items</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            faqsFieldArray.append({ question: "", answer: "" })
                          }
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add FAQ
                        </Button>
                      </div>

                      {faqsFieldArray.fields.length > 0 ? (
                        <div className="border rounded-md divide-y">
                          {faqsFieldArray.fields.map((field, index) => (
                            <div key={field.id} className="p-4">
                              <div className="flex justify-between items-start mb-4">
                                <h5 className="font-medium">
                                  FAQ #{index + 1}
                                </h5>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => faqsFieldArray.remove(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                              <div className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name={`faqs.${index}.question`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Question*</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="e.g. What are the check-in and check-out times?"
                                          {...field}
                                        />
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
                                      <FormLabel>Answer*</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Provide an answer to the question"
                                          className="min-h-[100px]"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border rounded-md p-6 text-center">
                          <FileQuestion className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">
                            No FAQs added yet
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Google Map */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Map Location</h3>

                  <div className="aspect-video bg-slate-100 rounded-md flex items-center justify-center border">
                    {isLoaded &&
                    form.watch("latitude") !== undefined &&
                    form.watch("latitude") !== null &&
                    form.watch("longitude") !== undefined &&
                    form.watch("longitude") !== null ? (
                      <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        center={{
                          lat: Number(form.watch("latitude")),
                          lng: Number(form.watch("longitude")),
                        }}
                        zoom={15}
                      >
                        <Marker
                          position={{
                            lat: Number(form.watch("latitude")),
                            lng: Number(form.watch("longitude")),
                          }}
                        />
                      </GoogleMap>
                    ) : (
                      <div className="text-center p-4">
                        <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <h3 className="text-lg font-medium mb-1">
                          Map Integration
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          Enter latitude and longitude coordinates to see the
                          hotel location on the map.
                          {!apiKey && " (Google Maps API key required)"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/hotels")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border-yellow-200"
                    onClick={() => {
                      // Debug function to analyze current form state
                      const debugHotelData = () => {
                        const formValues = form.getValues();
                        const formErrors = form.formState.errors;
                        
                        console.group("🔍 HOTEL CREATION DEBUG ANALYSIS");
                        
                        // Basic Information Analysis
                        console.group("📋 Basic Information");
                        console.log("Name:", formValues.name || "❌ MISSING");
                        console.log("Description:", formValues.description || "⚠️ Empty");
                        console.log("Destination ID:", formValues.destinationId || "❌ MISSING");
                        console.log("Address:", formValues.address || "❌ MISSING");
                        console.log("City ID:", formValues.cityId || "⚠️ Not selected");
                        console.log("Country ID:", formValues.countryId || "⚠️ Not selected");
                        console.log("Stars:", formValues.stars || "❌ MISSING");
                        console.groupEnd();
                        
                        // Contact Information Analysis
                        console.group("📞 Contact Information");
                        console.log("Phone:", formValues.phone || "⚠️ Empty");
                        console.log("Email:", formValues.email || "⚠️ Empty");
                        console.log("Website:", formValues.website || "⚠️ Empty");
                        console.groupEnd();
                        
                        // Location Analysis
                        console.group("📍 Location Data");
                        console.log("Longitude:", formValues.longitude !== undefined ? formValues.longitude : "⚠️ Not set");
                        console.log("Latitude:", formValues.latitude !== undefined ? formValues.latitude : "⚠️ Not set");
                        console.groupEnd();
                        
                        // Features Analysis
                        console.group("✨ Features & Amenities");
                        console.log("Simplified Features:", formValues.features?.length > 0 ? formValues.features : "⚠️ None selected");
                        console.groupEnd();
                        
                        // Transportation Analysis
                        console.group("🚗 Transportation Options");
                        console.log("Parking Available:", formValues.parkingAvailable ? "✅ Yes" : "❌ No");
                        console.log("Airport Transfer:", formValues.airportTransferAvailable ? "✅ Yes" : "❌ No");
                        console.log("Car Rental:", formValues.carRentalAvailable ? "✅ Yes" : "❌ No");
                        console.log("Shuttle Service:", formValues.shuttleAvailable ? "✅ Yes" : "❌ No");
                        console.log("WiFi Available:", formValues.wifiAvailable ? "✅ Yes" : "❌ No");
                        console.log("Pet Friendly:", formValues.petFriendly ? "✅ Yes" : "❌ No");
                        console.log("Accessible Facilities:", formValues.accessibleFacilities ? "✅ Yes" : "❌ No");
                        console.groupEnd();
                        
                        // Images Analysis
                        console.group("🖼️ Images");
                        console.log("Main Image File:", mainImageFile ? `✅ ${mainImageFile.name}` : "⚠️ No file selected");
                        console.log("Main Image Preview:", mainImagePreview ? "✅ Available" : "⚠️ No preview");
                        console.log("Gallery Files:", galleryFiles.length > 0 ? `✅ ${galleryFiles.length} files` : "⚠️ No files");
                        console.log("Gallery Previews:", galleryPreviews.length > 0 ? `✅ ${galleryPreviews.length} previews` : "⚠️ No previews");
                        console.groupEnd();
                        
                        // Related Data Analysis
                        console.group("🏢 Related Data");
                        console.log("Landmarks:", formValues.landmarks?.length > 0 ? `✅ ${formValues.landmarks.length} landmarks` : "⚠️ None added");
                        console.log("Restaurants:", formValues.restaurants?.length > 0 ? `✅ ${formValues.restaurants.length} restaurants` : "⚠️ None added");
                        console.log("FAQs:", formValues.faqs?.length > 0 ? `✅ ${formValues.faqs.length} FAQs` : "⚠️ None added");
                        console.log("Room Types:", formValues.roomTypes?.length > 0 ? `✅ ${formValues.roomTypes.length} room types` : "⚠️ None added");
                        console.groupEnd();
                        
                        // Form Validation Analysis
                        console.group("⚠️ Form Validation Errors");
                        if (Object.keys(formErrors).length > 0) {
                          console.error("Validation Errors Found:", formErrors);
                        } else {
                          console.log("✅ No validation errors");
                        }
                        console.groupEnd();
                        
                        // Final Data Preview
                        console.group("📦 Final Hotel Data Preview");
                        const cleanGalleryUrls = galleryPreviews
                          .map(getCleanUrl)
                          .filter(Boolean) as string[];
                        const cleanMainImageUrl = getCleanUrl(
                          mainImagePreview || formValues.imageUrl || "",
                        );
                        
                        const finalHotelData = {
                          ...formValues,
                          // Note: Using simplified features array instead of complex junction tables
                          imageUrl: cleanMainImageUrl,
                          galleryUrls: cleanGalleryUrls.length > 0 ? cleanGalleryUrls : formValues.galleryUrls,
                          amenities: [
                            ...(formValues.wifiAvailable ? ['wifi'] : []),
                            ...(formValues.parkingAvailable ? ['parking'] : []),
                            ...(formValues.airportTransferAvailable ? ['airport_shuttle'] : []),
                            ...(formValues.carRentalAvailable ? ['car_rental'] : []),
                            ...(formValues.shuttleAvailable ? ['shuttle'] : []),
                            ...(formValues.petFriendly ? ['pet_friendly'] : []),
                            ...(formValues.accessibleFacilities ? ['wheelchair_accessible'] : []),
                          ],
                          stars: formValues.stars,

                        };
                        
                        console.log("📊 Complete Hotel Data Object:", finalHotelData);
                        console.groupEnd();
                        
                        // Missing Required Fields Check
                        console.group("🚨 Missing Required Fields Check");
                        const requiredFields = ['name', 'destinationId', 'address', 'stars'];
                        const missingFields = requiredFields.filter(field => !formValues[field as keyof typeof formValues]);
                        
                        if (missingFields.length > 0) {
                          console.error("❌ Missing Required Fields:", missingFields);
                        } else {
                          console.log("✅ All required fields are filled");
                        }
                        console.groupEnd();
                        
                        console.groupEnd();
                        
                        // Show toast notification
                        toast({
                          title: "🔍 Debug Analysis Complete",
                          description: `Check browser console for detailed analysis. ${missingFields.length > 0 ? `Missing: ${missingFields.join(', ')}` : 'All required fields OK!'}`,
                          duration: 5000,
                        });
                      };
                      
                      debugHotelData();
                    }}
                  >
                    🔍 Debug Hotel Data
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      // Get current form values without validation
                      const currentValues = form.getValues();
                      // Set status to draft
                      currentValues.status = "draft";

                      // Create mutation for saving draft without validation
                      const saveDraft = async () => {
                        try {
                          const response = await fetch(
                            "/api/admin/hotel-drafts",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(currentValues),
                              credentials: "include",
                            },
                          );

                          if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(
                              errorData.message || "Failed to save draft",
                            );
                          }

                          toast({
                            title: "Draft saved",
                            description: "Hotel has been saved as a draft",
                          });

                          // Refresh hotel list
                          queryClient.invalidateQueries({
                            queryKey: ["/api/admin/hotels"],
                          });

                          // Navigate back to hotel list
                          navigate("/admin/hotels");
                        } catch (error) {
                          toast({
                            title: "Error saving draft",
                            description:
                              error instanceof Error
                                ? error.message
                                : "There was a problem saving your draft",
                            variant: "destructive",
                          });
                          console.error("Error saving draft:", error);
                        }
                      };

                      // Execute the draft save
                      saveDraft();
                    }}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save as Draft
                  </Button>
                  <Button
                    type="submit"
                    disabled={createHotelMutation.isPending || isUploadingImages}
                    className="gap-1"
                  >
                    {(createHotelMutation.isPending || isUploadingImages) && (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    )}
                    <Save className="h-4 w-4 mr-1" />
                    {isUploadingImages ? "Uploading Images..." : createHotelMutation.isPending ? "Creating Hotel..." : "Save Hotel"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
