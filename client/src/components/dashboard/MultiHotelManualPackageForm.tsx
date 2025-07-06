import React, { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  ImagePlus,
  Loader2,
  Plus,
  Trash,
  Star,
  X,
  Edit,
  PlusCircle,
  Hotel,
  Building,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  validateForm,
  validateRequiredFields,
  validateNumericFields,
} from "@/lib/validateForm";
import {
  FormRequiredFieldsNote,
  FormValidationAlert,
} from "@/components/dashboard/FormValidationAlert";

// Define the room entry schema
const roomEntrySchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1, { message: "Room type is required" }),
  pricePerNight: z.coerce.number().positive({ message: "Price must be positive" }),
  maxOccupancy: z.coerce.number().min(1).max(10).default(2),
  amenities: z.array(z.string()).default([]),
});

// Define the hotel entry schema with rooms array
const hotelEntrySchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, { message: "Hotel name must be at least 2 characters" }),
  stars: z.coerce.number().min(1).max(5),
  rooms: z
    .array(roomEntrySchema)
    .min(1, { message: "At least one room is required" }),
});

// Validation schema for manual package form
const manualPackageFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Package title must be at least 3 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce
    .number()
    .positive({ message: "Price must be a positive number" }),
  discountedPrice: z.coerce.number().optional(),
  discountType: z.enum(["percentage", "fixed"]).optional(),
  discountValue: z.coerce.number().optional(),
  markup: z.coerce.number().optional(),
  hotels: z
    .array(hotelEntrySchema)
    .min(1, { message: "At least one hotel is required" }),
  transportationDetails: z
    .string()
    .min(3, {
      message: "Transportation details must be at least 3 characters",
    }),
  tourDetails: z.string().optional(),
  selectedTourIds: z
    .array(z.number())
    .optional(),
  duration: z.coerce
    .number()
    .positive({ message: "Duration must be a positive number" }),
  destinationId: z.coerce.number({
    required_error: "Please select a destination",
  }),
  countryId: z.coerce.number().optional(),
  cityId: z.coerce.number().optional(),
  categoryId: z.coerce.number({ required_error: "Please select a category" }),
  type: z.string().min(2, { message: "Type must be at least 2 characters" }),
  featured: z.boolean().default(false),
  inclusions: z
    .array(z.string())
    .min(1, { message: "At least one inclusion is required" }),
  excludedItems: z.array(z.string()).optional(),
  cancellationPolicy: z.string().optional(),
  childrenPolicy: z.string().optional(),
  termsAndConditions: z.string().optional(),
  customText: z.string().optional(),
});

type ManualPackageFormValues = z.infer<typeof manualPackageFormSchema>;

interface MultiHotelManualPackageFormProps {
  isEditMode?: boolean;
  packageId?: number;
}

export function MultiHotelManualPackageForm({ 
  isEditMode = false, 
  packageId 
}: MultiHotelManualPackageFormProps = {}) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [_, navigate] = useLocation();
  const [images, setImages] = useState<
    { id: string; file: File | null; preview: string; isMain: boolean }[]
  >([]);
  const [newHotelName, setNewHotelName] = useState("");
  const [newInclusion, setNewInclusion] = useState("");
  const [newExcludedItem, setNewExcludedItem] = useState("");
  const [editingHotelIndex, setEditingHotelIndex] = useState<number | null>(
    null,
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );
  const [isDraft, setIsDraft] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);

  // Used for autocomplete suggestion functionality
  const [hotelSuggestions, setHotelSuggestions] = useState<string[]>([]);
  const [transportationSuggestions, setTransportationSuggestions] = useState<
    string[]
  >([]);
  const [tourSuggestions, setTourSuggestions] = useState<string[]>([]);
  const [inclusionSuggestions, setInclusionSuggestions] = useState<string[]>(
    [],
  );
  const [roomTypeSuggestions, setRoomTypeSuggestions] = useState<string[]>([
    "Standard Room",
    "Deluxe Room",
    "Suite",
    "Executive Suite",
    "Family Room",
  ]);

  // Control displaying the suggestion dropdowns
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false);
  const [showTransportationSuggestions, setShowTransportationSuggestions] =
    useState(false);
  // State for tour selection
  const [tourSearchQuery, setTourSearchQuery] = useState("");
  const [showTourDropdown, setShowTourDropdown] = useState(false);
  const tourDropdownRef = useRef<HTMLDivElement>(null);
  const [showInclusionSuggestions, setShowInclusionSuggestions] =
    useState(false);
  
  // State for selected tours with editable prices
  const [selectedToursWithPrices, setSelectedToursWithPrices] = useState<Array<{
    id: number;
    name: string;
    description: string;
    duration: string;
    originalPrice: number;
    customPrice: number; // Editable price
  }>>([]);
  
  // Debug log for selected tours
  useEffect(() => {
    console.log('Selected tours with prices:', selectedToursWithPrices);
  }, [selectedToursWithPrices]);

  // Dialog state for adding/editing hotels
  const [isHotelDialogOpen, setIsHotelDialogOpen] = useState(false);
  const [hotelFormData, setHotelFormData] = useState({
    name: "",
    stars: 3,
    rooms: [] as Array<{
      id: string;
      type: string;
      pricePerNight: number;
      maxOccupancy: number;
      amenities: string[];
    }>,
  });

  // Room dialog state
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);
  const [roomFormData, setRoomFormData] = useState({
    type: "",
    pricePerNight: 0,
    maxOccupancy: 2,
    amenities: [] as string[],
  });

  // Fetch destinations for the dropdown
  const { data: destinations = [] } = useQuery<any[]>({
    queryKey: ["/api/destinations"],
  });

  // Fetch package categories for the dropdown
  const { data: packageCategories = [] } = useQuery<any[]>({
    queryKey: ["/api/package-categories"],
  });

  // Fetch existing packages to extract suggestions
  const { data: packages = [] } = useQuery<any[]>({
    queryKey: ["/api/packages"],
  });

  // Fetch hotels for the hotel name suggestions
  const { data: hotels = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/hotels"],
  });

  // Fetch countries and cities for location selection
  const { data: countries = [] } = useQuery<any[]>({
    queryKey: ["/api/countries"],
  });

  const { data: cities = [] } = useQuery<any[]>({
    queryKey: ["/api/cities"],
  });

  // Fetch tours for the tour selection feature
  const { data: tours = [] } = useQuery<any[]>({
    queryKey: ["/api/tours"],
  });
  
  // Debug log for tours data
  useEffect(() => {
    console.log('Tours loaded:', tours.length, tours);
  }, [tours]);

  // Fetch package data for edit mode - try both admin and public endpoints
  const { data: packageDataResponse, isLoading: isLoadingPackage, error: packageError } = useQuery({
    queryKey: ["/api/admin/packages", packageId],
    enabled: isEditMode && !!packageId,
    retry: 1,
    queryFn: async () => {
      // Try admin endpoint first
      try {
        const response = await fetch(`/api/admin/packages/${packageId}`, {
          credentials: 'include',
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn('Admin endpoint failed, trying public endpoint');
      }
      
      // Fallback to public endpoint
      const response = await fetch(`/api/packages/${packageId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch package: ${response.statusText}`);
      }
      return await response.json();
    }
  });

  // Extract package data from response (handle both array and object responses)
  const packageData = React.useMemo(() => {
    if (!packageDataResponse) return null;
    
    console.log('Raw package data response:', packageDataResponse);
    
    // If it's an array, get the first item (or find by ID)
    if (Array.isArray(packageDataResponse)) {
      const foundPackage = packageDataResponse.find(pkg => pkg.id === packageId || pkg.id === String(packageId));
      return foundPackage || packageDataResponse[0] || null;
    }
    
    // If it's an object, use it directly
    return packageDataResponse;
  }, [packageDataResponse, packageId]);

  const form = useForm<ManualPackageFormValues>({
    resolver: zodResolver(manualPackageFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      discountedPrice: 0,
      discountType: "percentage",
      discountValue: 0,
      markup: 0,
      hotels: [],
      transportationDetails: "",
      tourDetails: "",
      selectedTourIds: [],
      duration: 1,
      destinationId: undefined,
      countryId: undefined,
      cityId: undefined,
      categoryId: undefined,
      type: "manual",
      featured: false,
      inclusions: [],
      excludedItems: [],
      cancellationPolicy: "",
      childrenPolicy: "",
      termsAndConditions: "",
      customText: "",
    },
  });

  // Setup field array for hotels
  const {
    fields: hotelFields,
    append: appendHotel,
    remove: removeHotel,
    update: updateHotel,
  } = useFieldArray({
    control: form.control,
    name: "hotels",
  });

  // Populate suggestion data from existing packages and hotels when data is fetched
  useEffect(() => {
    // Extract unique values for autocomplete suggestions
    const hotelNames = new Set<string>();
    const types = new Set<string>();
    const inclusions = new Set<string>();

    // Add hotel names from the hotel database
    if (hotels && hotels.length > 0) {
      hotels.forEach((hotel: any) => {
        if (hotel.name) {
          hotelNames.add(hotel.name);
        }
      });
    }

    // Extract data from packages if available
    if (packages && packages.length > 0) {
      packages.forEach((pkg: any) => {
        // Extract hotel names from package descriptions
        if (pkg.description && pkg.description.includes("Hotel:")) {
          const hotelMatch = pkg.description.match(/Hotel:\s*([\w\s]+)/);
          if (hotelMatch && hotelMatch[1]) {
            hotelNames.add(hotelMatch[1].trim());
          }
        }

        // Note: Package type field removed as requested

        // Extract inclusions
        if (pkg.inclusions && Array.isArray(pkg.inclusions)) {
          pkg.inclusions.forEach((inclusion: string) => {
            inclusions.add(inclusion);
          });
        }
      });
    }

    // Example data for transportation and tours - starting with some common options
    // In a real implementation, these would be fetched from specific API endpoints
    const transportations = new Set<string>([
      "Private car transfer",
      "Airport shuttle",
      "Luxury vehicle",
      "Group bus tour",
      "Private SUV with driver",
    ]);

    const tours = new Set<string>([
      "Pyramids guided tour",
      "Museum visit with expert",
      "Nile dinner cruise",
      "Desert safari experience",
      "Historical sites tour",
    ]);

    // Update state with suggestions
    setHotelSuggestions(Array.from(hotelNames));
    setInclusionSuggestions(Array.from(inclusions));
    setTransportationSuggestions(Array.from(transportations));
    setTourSuggestions(Array.from(tours));
  }, [packages, hotels]);

  // Populate form with package data for edit mode
  useEffect(() => {
    if (isEditMode && packageData && !isLoadingPackage) {
      console.log('Loading package data for edit:', packageData);
      
      // Parse JSON fields safely
      const parseJSONField = (field: any, fallback: any = []) => {
        if (!field) return fallback;
        if (typeof field === 'string') {
          try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : fallback;
          } catch (e) {
            console.warn('Failed to parse JSON field:', field, e);
            return fallback;
          }
        }
        return Array.isArray(field) ? field : fallback;
      };

      // Extract hotel/room data from description if not in proper fields
      let hotelsData = parseJSONField(packageData?.selectedHotels, []);
      if (hotelsData.length === 0) {
        hotelsData = parseJSONField(packageData?.rooms, []);
      }
      
      // If no structured data, try to extract from description
      if (hotelsData.length === 0 && packageData?.description) {
        const hotelMatches = packageData.description.match(/Hotels:\n([\s\S]*?)(?:\n\nTransportation:|$)/);
        if (hotelMatches) {
          const hotelText = hotelMatches[1];
          const hotelBlocks = hotelText.split(/\n\n(?=\S)/);
          
          hotelsData = hotelBlocks.map(block => {
            const lines = block.split('\n');
            const hotelLine = lines[0];
            const hotelMatch = hotelLine.match(/^(.*?)\s*\((\d+)★\)$/);
            
            if (hotelMatch) {
              const hotelName = hotelMatch[1].trim();
              const stars = parseInt(hotelMatch[2]);
              
              const rooms = [];
              for (let i = 1; i < lines.length; i++) {
                const roomMatch = lines[i].match(/^\s*•\s*(.*?)\s*-\s*\$(\d+)\/night\s*\(Max:\s*(\d+)\s*guests\)$/);
                if (roomMatch) {
                  rooms.push({
                    id: `room-${i}`,
                    type: roomMatch[1].trim(),
                    pricePerNight: parseInt(roomMatch[2]),
                    maxOccupancy: parseInt(roomMatch[3]),
                    amenities: []
                  });
                }
              }
              
              return {
                id: `hotel-${hotelName.replace(/\s+/g, '-').toLowerCase()}`,
                name: hotelName,
                stars: stars,
                rooms: rooms
              };
            }
            return null;
          }).filter(Boolean);
        }
      }
      
      console.log('Parsed hotels data:', hotelsData);

      // Extract tour data from description or fields
      let selectedTourIds = parseJSONField(packageData?.tourSelection, []);
      if (selectedTourIds.length === 0) {
        selectedTourIds = parseJSONField(packageData?.selectedTourIds, []);
      }
      
      // If no structured tour data, extract from description
      let toursFromDescription = [];
      if (selectedTourIds.length === 0 && packageData?.description) {
        const tourMatches = packageData.description.match(/Tours:\s*(.*?)(?:\n|$)/);
        if (tourMatches) {
          const tourText = tourMatches[1];
          const tourParts = tourText.split(', ');
          toursFromDescription = tourParts.map(part => {
            const match = part.match(/^(.*?)\s*\((\d+)\s*EGP\)$/);
            if (match) {
              return {
                name: match[1].trim(),
                customPrice: parseInt(match[2])
              };
            }
            return { name: part.trim(), customPrice: 0 };
          });
        }
      }
      
      console.log('Tours from description:', toursFromDescription);

      // Extract transportation from description
      let transportationDetails = packageData?.transportationDetails || "";
      if (!transportationDetails && packageData?.description) {
        const transportMatch = packageData.description.match(/Transportation:\s*(.*?)(?:\n\n|$)/);
        if (transportMatch) {
          transportationDetails = transportMatch[1].trim();
        }
      }

      // Clean description by removing auto-generated content
      let cleanDescription = packageData?.description || "";
      if (cleanDescription) {
        // Remove hotel, transportation, and tour sections that were auto-added
        cleanDescription = cleanDescription
          .replace(/\n\nHotels:\n[\s\S]*?(?=\n\nTransportation:|$)/, '')
          .replace(/\n\nTransportation:\s*.*?(?=\n\nTours:|$)/, '')
          .replace(/\n\nTours:\s*.*?$/, '')
          .trim();
      }

      // Set form values with proper data conversion
      const formData = {
        title: packageData?.title?.replace('MANUAL:', '') || "",
        description: cleanDescription,
        price: packageData?.price ? Math.round(packageData.price / 100) : 0, // Convert from cents
        discountedPrice: packageData?.discountedPrice ? Math.round(packageData.discountedPrice / 100) : 0,
        discountType: packageData?.discountType || "percentage",
        discountValue: packageData?.discountValue || 0,
        markup: packageData?.markup || 0,
        hotels: hotelsData,
        transportationDetails: transportationDetails,
        tourDetails: packageData?.tourDetails || "",
        selectedTourIds: selectedTourIds,
        duration: packageData?.duration || 1,
        destinationId: packageData?.destinationId || undefined,
        countryId: packageData?.countryId || undefined,
        cityId: packageData?.cityId || undefined,
        categoryId: packageData?.categoryId || undefined,
        type: "manual",
        featured: Boolean(packageData?.featured),
        inclusions: parseJSONField(packageData?.inclusions, []),
        excludedItems: parseJSONField(packageData?.excludedItems, []),
        cancellationPolicy: packageData?.cancellationPolicy || "",
        childrenPolicy: packageData?.childrenPolicy || "",
        termsAndConditions: packageData?.termsAndConditions || "",
        customText: packageData?.customText || "",
      };

      console.log('Form data to populate:', formData);
      form.reset(formData);

      // Set selected tours with prices from description data
      if (toursFromDescription.length > 0 && tours.length > 0) {
        const matchedTours = toursFromDescription.map(tourFromDesc => {
          // Try to find matching tour by name
          const matchedTour = tours.find(dbTour => 
            dbTour.name.toLowerCase().includes(tourFromDesc.name.toLowerCase()) ||
            tourFromDesc.name.toLowerCase().includes(dbTour.name.toLowerCase())
          );
          
          if (matchedTour) {
            return {
              id: matchedTour.id,
              name: matchedTour.name,
              description: matchedTour.description || "",
              duration: `${matchedTour.duration} days` || "",
              originalPrice: matchedTour.price || 0,
              customPrice: tourFromDesc.customPrice
            };
          } else {
            // If no match found, create a temporary entry
            return {
              id: Math.random() * 1000, // Temporary ID for unmatched tours
              name: tourFromDesc.name,
              description: "",
              duration: "",
              originalPrice: tourFromDesc.customPrice * 100,
              customPrice: tourFromDesc.customPrice
            };
          }
        });
        
        console.log('Matched tours:', matchedTours);
        setSelectedToursWithPrices(matchedTours);
        
        // Update form with matched tour IDs
        const tourIds = matchedTours.filter(tour => tour.id < 1000).map(tour => tour.id);
        form.setValue("selectedTourIds", tourIds);
      }

      // Set gallery images if available
      const galleryUrls = parseJSONField(packageData?.galleryUrls, []);
      if (galleryUrls.length > 0) {
        const imageData = galleryUrls.map((url: string, index: number) => ({
          id: `existing-${index}`,
          file: null,
          preview: url,
          isMain: false
        }));
        setImages(imageData);
      }

      // Set main image
      if (packageData?.imageUrl) {
        setImages(prev => [
          { id: 'main-existing', file: null, preview: packageData.imageUrl, isMain: true },
          ...prev.map(img => ({ ...img, isMain: false }))
        ]);
      }

      // Set location states
      if (packageData?.countryId) {
        setSelectedCountry(packageData.countryId);
        console.log('Updated selectedCountryId state to:', packageData.countryId);
      }
      if (packageData?.cityId) {
        setSelectedCity(packageData.cityId);
        console.log('Updated selectedCityId state to:', packageData.cityId);
      }

      // Set selected tours with prices when tours are loaded
      if (selectedTourIds.length > 0 && tours.length > 0) {
        const selectedToursData = selectedTourIds.map((tourId: number) => {
          const tour = tours.find(t => t.id === tourId);
          if (tour) {
            return {
              id: tour.id,
              name: tour.name,
              description: tour.description || "",
              duration: `${tour.duration} days` || "",
              originalPrice: tour.price || 0,
              customPrice: Math.round((tour.price || 0) / 100), // Convert to EGP
            };
          }
          return null;
        }).filter(Boolean);
        
        console.log('Setting selected tours with prices:', selectedToursData);
        setSelectedToursWithPrices(selectedToursData);
      }

      console.log('Form populated with package data');
    }
  }, [isEditMode, packageData, isLoadingPackage, form, tours]);

  // Handle click outside tour dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      
      // Don't close if clicking on the search input or dropdown content
      if (tourDropdownRef.current && !tourDropdownRef.current.contains(target)) {
        console.log('Clicked outside tour dropdown, closing');
        setShowTourDropdown(false);
      }
    }
    
    // Only add listener when dropdown is open
    if (showTourDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTourDropdown]);

  // Tour selection functions
  const handleTourSelection = (tourId: number) => {
    console.log('Attempting to select tour with ID:', tourId);
    
    const selectedTour = tours.find(tour => tour.id === tourId);
    console.log('Found tour:', selectedTour);
    
    if (!selectedTour) {
      console.log('Tour not found!');
      return;
    }

    // Check if tour is already selected
    const isAlreadySelected = selectedToursWithPrices.some(tour => tour.id === tourId);
    if (isAlreadySelected) {
      console.log('Tour already selected');
      toast({
        title: "Tour Already Selected",
        description: "This tour is already added to your package",
        variant: "default",
      });
      return;
    }

    // Add tour to selected tours with editable price
    const newSelectedTour = {
      id: selectedTour.id,
      name: selectedTour.name,
      description: selectedTour.description || "",
      duration: selectedTour.duration || "",
      originalPrice: selectedTour.price || 0,
      customPrice: Math.round((selectedTour.price || 0) / 100), // Convert to EGP and make editable
    };

    const updatedSelectedTours = [...selectedToursWithPrices, newSelectedTour];
    console.log('About to update selected tours state...');
    setSelectedToursWithPrices(updatedSelectedTours);
    console.log('Updated selected tours:', updatedSelectedTours);

    // Update form field
    const tourIds = updatedSelectedTours.map(tour => tour.id);
    console.log('About to update form field...');
    form.setValue("selectedTourIds", tourIds);
    console.log('Updated form selectedTourIds:', tourIds);
    console.log('Tour selection process completed successfully!');

    // Show success message
    toast({
      title: "Tour Added",
      description: `${selectedTour.name} has been added to your package`,
      variant: "default",
    });

    setTourSearchQuery("");
    // Don't close dropdown immediately to allow multiple selections
  };

  const removeTour = (tourIdToRemove: number) => {
    const updatedSelectedTours = selectedToursWithPrices.filter(tour => tour.id !== tourIdToRemove);
    setSelectedToursWithPrices(updatedSelectedTours);

    // Update form field
    const tourIds = updatedSelectedTours.map(tour => tour.id);
    form.setValue("selectedTourIds", tourIds);
  };

  const updateTourPrice = (tourId: number, newPrice: number) => {
    setSelectedToursWithPrices(prev => 
      prev.map(tour => 
        tour.id === tourId 
          ? { ...tour, customPrice: newPrice }
          : tour
      )
    );
  };

  const filteredTours = React.useMemo(() => {
    return tours.filter(tour => {
      const matchesSearch = tour.name.toLowerCase().includes(tourSearchQuery.toLowerCase());
      const notAlreadySelected = !selectedToursWithPrices.some(selected => selected.id === tour.id);
      return matchesSearch && notAlreadySelected;
    });
  }, [tours, tourSearchQuery, selectedToursWithPrices]);

  // Create manual package mutation
  const createManualPackageMutation = useMutation({
    mutationFn: async (formData: ManualPackageFormValues) => {
      // Get the main image URL (or a default if none is set)
      const mainImage = images.find((img) => img.isMain);
      const mainImageUrl = mainImage
        ? mainImage.preview
        : "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800";

      // Get all gallery image URLs
      const galleryUrls = images.map((img) => img.preview);
      
      // Prepare tour data with custom prices for storage
      const tourPriceData = selectedToursWithPrices.map(tour => ({
        id: tour.id,
        name: tour.name,
        customPrice: tour.customPrice * 100, // Convert back to cents for storage
        originalPrice: tour.originalPrice
      }));

      // Transform the form data to match the API schema
      const packageData = {
        title: "MANUAL:" + formData.title, // Prefix with MANUAL: to identify manual packages
        description: formData.description, // Keep description clean without auto-generated content
        price: formData.price,
        discountedPrice:
          formData.discountedPrice || Math.round(formData.price * 0.9), // Use provided discounted price or 10% off
        imageUrl: mainImageUrl,
        galleryUrls: galleryUrls,
        duration: formData.duration,
        rating: 45, // Default 4.5 stars (stored as 45 in DB)
        destinationId: formData.destinationId,
        featured: formData.featured,
        inclusions: formData.inclusions,
        excludedItems: formData.excludedItems,
        cancellationPolicy: formData.cancellationPolicy,
        childrenPolicy: formData.childrenPolicy,
        termsAndConditions: formData.termsAndConditions,
        markup: formData.markup,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        countryId: formData.countryId,
        cityId: formData.cityId,
        categoryId: formData.categoryId,
        selectedTourIds: formData.selectedTourIds || [],
        selectedHotels: formData.hotels, // Store hotels in proper field
        rooms: formData.hotels.flatMap(hotel => hotel.rooms), // Store all rooms
        transportationDetails: formData.transportationDetails, // Store in proper field
        tourPriceData: tourPriceData, // Custom tour prices
        type: formData.type,
        customText: formData.customText,
      };

      const response = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create package");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });

      // Show success message
      toast({
        title: "Manual Package Created",
        description: "The manual package was created successfully",
        variant: "default",
      });

      // Reset form and state
      form.reset();
      setImages([]);
      setNewInclusion("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating manual package",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update manual package mutation
  const updateManualPackageMutation = useMutation({
    mutationFn: async (formData: ManualPackageFormValues) => {
      if (!packageId) throw new Error("Package ID is required for update");

      // Get the main image URL (or keep existing if none is set)
      const mainImage = images.find((img) => img.isMain);
      const mainImageUrl = mainImage ? mainImage.preview : packageData?.imageUrl || "";

      // Get all gallery image URLs
      const galleryUrls = images.map((img) => img.preview);
      
      // Prepare tour data with custom prices for storage
      const tourPriceData = selectedToursWithPrices.map(tour => ({
        id: tour.id,
        name: tour.name,
        customPrice: tour.customPrice * 100, // Convert back to cents for storage
        originalPrice: tour.originalPrice
      }));

      const payload = {
        title: "MANUAL:" + formData.title,
        description: formData.description, // Keep description clean without auto-generated content
        price: formData.price * 100, // Convert to cents
        discountedPrice: formData.discountedPrice ? formData.discountedPrice * 100 : null,
        imageUrl: mainImageUrl,
        galleryUrls,
        duration: formData.duration,
        destinationId: formData.destinationId,
        countryId: formData.countryId,
        cityId: formData.cityId,
        categoryId: formData.categoryId,
        featured: formData.featured,
        inclusions: formData.inclusions,
        excludedItems: formData.excludedItems,
        cancellationPolicy: formData.cancellationPolicy,
        childrenPolicy: formData.childrenPolicy,
        termsAndConditions: formData.termsAndConditions,
        markup: formData.markup,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        selectedTourIds: formData.selectedTourIds || [],
        selectedHotels: formData.hotels, // Store hotels in proper field
        rooms: formData.hotels.flatMap(hotel => hotel.rooms), // Store all rooms
        transportationDetails: formData.transportationDetails, // Store in proper field
        tourPriceData: tourPriceData, // Custom tour prices
        type: "manual",
        customText: formData.customText,
      };

      console.log("Updating package with payload:", payload);

      const response = await apiRequest(`/api/admin/packages/${packageId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Update error response:", errorData);
        
        try {
          const errorJson = JSON.parse(errorData);
          throw new Error(errorJson.message || "Failed to update package");
        } catch {
          throw new Error(errorData || "Failed to update package");
        }
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packages", packageId] });

      toast({
        title: "Manual Package Updated",
        description: "The manual package was updated successfully",
        variant: "default",
      });

      // Navigate back to package detail or packages list
      navigate(`/packages/manual/${packageId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating manual package",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ManualPackageFormValues) => {
    // Validation for hotels
    if (data.hotels.length === 0) {
      toast({
        title: "No Hotels Added",
        description: "Please add at least one hotel to the package",
        variant: "destructive",
      });
      return;
    }

    // Validation
    const requiredFieldsValid = validateRequiredFields(
      data,
      [
        "title",
        "description",
        "price",
        "transportationDetails",
        "tourDetails",
        "duration",
        "destinationId",
        "categoryId",

      ],
      {
        title: "Package Title",
        description: "Description",
        price: "Price",
        transportationDetails: "Transportation Details",
        tourDetails: "Tour Details",
        duration: "Duration",
        destinationId: "Destination",
        categoryId: "Package Category",

      },
    );

    if (!requiredFieldsValid) return;

    // Numeric fields validation
    const numericFieldsValid = validateNumericFields(data, [
      { field: "price", label: "Price", min: 0.01 },
      { field: "discountedPrice", label: "Discounted Price", min: 0 },
      { field: "duration", label: "Duration", min: 1, integer: true },
    ]);

    if (!numericFieldsValid) return;

    // Custom validations
    const customValidationsValid = validateForm(data, [
      {
        condition: data.inclusions.length === 0,
        errorMessage: {
          title: "No Inclusions Added",
          description: "Please add at least one inclusion for the package",
        },
        variant: "destructive",
      },
    ]);

    if (!customValidationsValid) return;

    // All validations passed, proceed with submission
    // Call appropriate mutation based on mode
    if (isEditMode) {
      updateManualPackageMutation.mutate(data);
    } else {
      createManualPackageMutation.mutate(data);
    }
  };

  // Hotel dialog handlers
  const openAddHotelDialog = () => {
    setEditingHotelIndex(null);
    setHotelFormData({
      name: "",
      stars: 3,
      rooms: [],
    });
    setIsHotelDialogOpen(true);
  };

  const openEditHotelDialog = (index: number) => {
    const hotel = form.getValues().hotels[index];
    setEditingHotelIndex(index);
    setHotelFormData({
      name: hotel.name,
      stars: hotel.stars,
      rooms: (hotel.rooms || []).map(room => ({
        ...room,
        id: room.id || Math.random().toString(36).substring(7),
      })),
    });
    setIsHotelDialogOpen(true);
  };

  const handleHotelFormChange = (field: string, value: any) => {
    setHotelFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Room dialog handlers
  const openAddRoomDialog = () => {
    setEditingRoomIndex(null);
    setRoomFormData({
      type: "",
      pricePerNight: 0,
      maxOccupancy: 2,
      amenities: [],
    });
    setIsRoomDialogOpen(true);
  };

  const openEditRoomDialog = (index: number) => {
    const room = hotelFormData.rooms[index];
    setEditingRoomIndex(index);
    setRoomFormData({
      type: room.type,
      pricePerNight: room.pricePerNight,
      maxOccupancy: room.maxOccupancy,
      amenities: [...room.amenities],
    });
    setIsRoomDialogOpen(true);
  };

  const handleRoomFormChange = (field: string, value: any) => {
    setRoomFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRoomSave = () => {
    // Validate room data
    if (!roomFormData.type || roomFormData.type.length < 1) {
      toast({
        title: "Invalid Room Type",
        description: "Room type is required",
        variant: "destructive",
      });
      return;
    }

    if (roomFormData.pricePerNight <= 0) {
      toast({
        title: "Invalid Price",
        description: "Price per night must be positive",
        variant: "destructive",
      });
      return;
    }

    const roomEntry = {
      id: Math.random().toString(36).substring(7),
      type: roomFormData.type,
      pricePerNight: roomFormData.pricePerNight,
      maxOccupancy: roomFormData.maxOccupancy,
      amenities: [...roomFormData.amenities],
    };

    if (editingRoomIndex !== null) {
      // Update existing room
      const updatedRooms = [...hotelFormData.rooms];
      updatedRooms[editingRoomIndex] = roomEntry;
      setHotelFormData((prev) => ({ ...prev, rooms: updatedRooms }));
    } else {
      // Add new room
      setHotelFormData((prev) => ({
        ...prev,
        rooms: [...prev.rooms, roomEntry],
      }));
    }

    setIsRoomDialogOpen(false);
  };

  const removeRoom = (index: number) => {
    const updatedRooms = hotelFormData.rooms.filter((_, i) => i !== index);
    setHotelFormData((prev) => ({ ...prev, rooms: updatedRooms }));
  };

  const handleHotelSave = () => {
    // Validate hotel data
    if (!hotelFormData.name || hotelFormData.name.length < 2) {
      toast({
        title: "Invalid Hotel Name",
        description: "Hotel name must be at least 2 characters",
        variant: "destructive",
      });
      return;
    }

    if (hotelFormData.rooms.length === 0) {
      toast({
        title: "No Rooms Added",
        description: "Please add at least one room to the hotel",
        variant: "destructive",
      });
      return;
    }

    const hotelEntry = {
      id: Math.random().toString(36).substring(7),
      name: hotelFormData.name,
      stars: hotelFormData.stars,
      rooms: hotelFormData.rooms.map(room => ({
        id: room.id,
        type: room.type,
        pricePerNight: room.pricePerNight,
        maxOccupancy: room.maxOccupancy,
        amenities: room.amenities,
      })),
    };

    if (editingHotelIndex !== null) {
      // Update existing hotel
      updateHotel(editingHotelIndex, hotelEntry);
    } else {
      // Add new hotel
      appendHotel(hotelEntry);
    }

    setIsHotelDialogOpen(false);
  };

  // Reference to hidden file input
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      // Process each selected file
      files.forEach((file, index) => {
        // Create URL for preview
        const preview = URL.createObjectURL(file);

        // Set as main image if this is the first image overall
        const isFirstImage = images.length === 0 && index === 0;

        // Add to images array with the isMain property
        const newImage = {
          id: Math.random().toString(36).substring(7),
          file: file,
          preview: preview,
          isMain: isFirstImage,
        };

        setImages((prev) => [...prev, newImage]);
      });

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

  const removeImage = (id: string) => {
    // Find the image to remove
    const imageToRemove = images.find((img) => img.id === id);
    const wasMainImage = imageToRemove?.isMain || false;

    // Revoke object URL to prevent memory leaks
    if (
      imageToRemove &&
      imageToRemove.preview &&
      !imageToRemove.preview.startsWith("https://")
    ) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    // Remove from state
    const newImages = images.filter((img) => img.id !== id);

    // If removed image was the main image, set a new main image
    if (wasMainImage && newImages.length > 0) {
      newImages[0].isMain = true;
    }

    setImages(newImages);
  };

  // Handle adding a new inclusion
  const addInclusion = () => {
    if (!newInclusion.trim()) return;

    form.setValue("inclusions", [
      ...form.getValues("inclusions"),
      newInclusion,
    ]);
    setNewInclusion("");
    setShowInclusionSuggestions(false);
  };

  // Handle removing an inclusion
  const removeInclusion = (index: number) => {
    const currentInclusions = form.getValues("inclusions");
    form.setValue(
      "inclusions",
      currentInclusions.filter((_, i) => i !== index),
    );
  };

  // Handle adding excluded items
  const addExcludedItem = () => {
    if (newExcludedItem.trim()) {
      const currentExcluded = form.getValues("excludedItems") || [];
      form.setValue("excludedItems", [
        ...currentExcluded,
        newExcludedItem.trim(),
      ]);
      setNewExcludedItem("");
    }
  };

  // Handle removing an excluded item
  const removeExcludedItem = (index: number) => {
    const currentExcluded = form.getValues("excludedItems") || [];
    form.setValue(
      "excludedItems",
      currentExcluded.filter((_, i) => i !== index),
    );
  };

  // Handle destination change to automatically set country and city
  const handleDestinationChange = (destinationId: number) => {
    form.setValue("destinationId", destinationId);

    // Find the selected destination
    const selectedDestination = destinations.find(
      (dest) => dest.id === destinationId,
    );
    if (selectedDestination) {
      // Auto-populate country and city if available
      if (selectedDestination.countryId) {
        form.setValue("countryId", selectedDestination.countryId);
        setSelectedCountry(selectedDestination.countryId);
      }
      if (selectedDestination.cityId) {
        form.setValue("cityId", selectedDestination.cityId);
        setSelectedCity(selectedDestination.cityId);
      }
    }
  };

  // Filter suggestions based on input
  const filterSuggestions = (input: string, suggestions: string[]) => {
    if (!input) return suggestions;
    const lowerInput = input.toLowerCase();
    return suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(lowerInput),
    );
  };

  // Autocomplete handlers
  const handleNewHotelInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setHotelFormData((prev) => ({ ...prev, name: value }));
    setShowHotelSuggestions(value.length >= 2);
  };

  // Removed type field as requested by user

  const handleTransportationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    form.setValue("transportationDetails", value);
    setShowTransportationSuggestions(value.length >= 3);
  };



  const handleInclusionInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setNewInclusion(value);
    setShowInclusionSuggestions(value.length >= 2);
  };

  // Click outside handlers to close suggestion dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".suggestion-dropdown")) {
        setShowHotelSuggestions(false);
        setShowTransportationSuggestions(false);
        setShowTourDropdown(false);
        setShowInclusionSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generate star emoji based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push("★");
    }
    for (let i = rating; i < 5; i++) {
      stars.push("☆");
    }
    return stars.join("");
  };

  // Show loading state while fetching package data in edit mode
  if (isEditMode && isLoadingPackage) {
    return (
      <Card className="border-none shadow-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading package data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state if package data failed to load
  if (isEditMode && packageError) {
    return (
      <Card className="border-none shadow-none">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Failed to load package data: {packageError.message}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0">
        {/* Show edit mode info */}
        {isEditMode && packageData && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Editing Manual Package</h3>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Package ID: {packageData.id} | All existing data has been loaded into the form fields.
            </p>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Information */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold border-b pb-2">
                  Basic Information
                </h2>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Package Title{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Luxor & Cairo Historical Tour"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Description <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter package description..."
                          rows={18}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a detailed description of the package, including
                        key highlights
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Display Text</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Cairo hotel or smaller"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Custom text to display on the package detail page below "Book This Package"
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Price (EGP){" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 1299"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountedPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discounted Price (EGP)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 999"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional. Leave at 0 for no discount
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Enhanced Discount Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name="discountType"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Discount Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select discount type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="percentage">
                                Percentage (%)
                              </SelectItem>
                              <SelectItem value="fixed">
                                Fixed Amount (EGP)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountValue"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>
                            Discount{" "}
                            {form.watch("discountType") === "percentage"
                              ? "(%)"
                              : "(EGP)"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={
                                form.watch("discountType") === "percentage"
                                  ? "e.g., 15"
                                  : "e.g., 200"
                              }
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? parseInt(e.target.value) : 0,
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            {form.watch("discountType") === "percentage"
                              ? "Enter percentage (0-100)"
                              : "Enter fixed amount in EGP"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Markup Field */}
                  <FormField
                    control={form.control}
                    name="markup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Markup (EGP)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 150"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Additional markup amount in EGP (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Duration (days){" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 7"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="destinationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Destination{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) =>
                            handleDestinationChange(parseInt(value))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {destinations.map((dest: any) => (
                              <SelectItem
                                key={dest.id}
                                value={dest.id.toString()}
                              >
                                {dest.name}, {dest.country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location Fields - Auto-populated from destination */}
                <div className="grid grid-cols-2 gap-4">
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
                            setSelectedCountry(countryId);
                          }}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem
                                key={country.id}
                                value={country.id.toString()}
                              >
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Auto-populated from destination selection
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cities
                              .filter(
                                (city) =>
                                  !selectedCountry ||
                                  city.countryId === selectedCountry,
                              )
                              .map((city) => (
                                <SelectItem
                                  key={city.id}
                                  value={city.id.toString()}
                                >
                                  {city.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Auto-populated from destination selection
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
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

                {/* Package Type field removed as requested */}

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Featured Package
                        </FormLabel>
                        <FormDescription>
                          Mark this package as featured to highlight it on the
                          homepage
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

              {/* Right Column - Hotels, Details & Images */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold border-b pb-2">
                  Hotels & Details
                </h2>

                {/* Hotels Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FormLabel>
                      Hotels <span className="text-destructive">*</span>
                    </FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openAddHotelDialog}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Hotel
                    </Button>
                  </div>

                  {hotelFields.length === 0 ? (
                    <div className="text-center p-6 border border-dashed rounded-md">
                      <Hotel className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-4">
                        No hotels added yet
                      </p>
                      <Button
                        type="button"
                        onClick={openAddHotelDialog}
                        size="sm"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add First Hotel
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {hotelFields.map((hotel, index) => (
                        <div
                          key={hotel.id}
                          className="p-3 border rounded-md flex justify-between items-center"
                        >
                          <div>
                            <h4 className="font-medium">{hotel.name}</h4>
                            <div className="flex text-sm text-muted-foreground gap-3">
                              <span className="text-amber-500">
                                {renderStars(hotel.stars)}
                              </span>
                              <span>
                                {hotel.rooms.length} room{hotel.rooms.length !== 1 ? 's' : ''}
                              </span>
                              {hotel.rooms.length > 0 && (
                                <span>
                                  ${Math.min(...hotel.rooms.map(r => r.pricePerNight))} - 
                                  ${Math.max(...hotel.rooms.map(r => r.pricePerNight))}/night
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={() => openEditHotelDialog(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              className="text-destructive"
                              onClick={() => removeHotel(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="transportationDetails"
                  render={({ field }) => (
                    <FormItem className="suggestion-dropdown">
                      <FormLabel>
                        Transportation Details{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="e.g., Private car transfer"
                            {...field}
                            onChange={(e) => handleTransportationInputChange(e)}
                          />
                          {showTransportationSuggestions &&
                            transportationSuggestions.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border rounded-md shadow-lg">
                                {filterSuggestions(
                                  field.value,
                                  transportationSuggestions,
                                ).map((suggestion, index) => (
                                  <div
                                    key={index}
                                    className="px-4 py-2 cursor-pointer hover:bg-zinc-100"
                                    onClick={() => {
                                      form.setValue(
                                        "transportationDetails",
                                        suggestion,
                                      );
                                      setShowTransportationSuggestions(false);
                                    }}
                                  >
                                    {suggestion}
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tour Selection Section */}
                <div className="space-y-3">
                  <FormLabel>
                    Select Tours <span className="text-destructive">*</span>
                  </FormLabel>
                  
                  {/* Tour Search Input */}
                  <div className="relative" ref={tourDropdownRef}>
                    <Input
                      placeholder="Search tours... (double-click to see all tours)"
                      value={tourSearchQuery}
                      onChange={(e) => {
                        setTourSearchQuery(e.target.value);
                        setShowTourDropdown(true);
                      }}
                      onFocus={() => setShowTourDropdown(true)}
                      onDoubleClick={() => {
                        setTourSearchQuery("");
                        setShowTourDropdown(true);
                      }}
                    />
                    
                    {/* Tour Dropdown */}
                    {showTourDropdown && (
                      tourSearchQuery.length > 0 ? filteredTours.length > 0 : tours.filter(tour => 
                        !selectedToursWithPrices.some(selected => selected.id === tour.id)
                      ).length > 0
                    ) && (
                      <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border rounded-md shadow-lg">
                        {/* Close Button */}
                        <div className="flex justify-between items-center p-2 border-b bg-gray-50">
                          <span className="text-sm font-medium text-gray-700">Select Tours</span>
                          <button
                            type="button"
                            onClick={() => setShowTourDropdown(false)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                        {(tourSearchQuery.length > 0 ? filteredTours : tours.filter(tour => 
                          !selectedToursWithPrices.some(selected => selected.id === tour.id)
                        ).slice(0, 10)).map((tour) => (
                          <button
                            key={tour.id}
                            type="button"
                            className="w-full px-4 py-3 text-left cursor-pointer hover:bg-zinc-100 border-b last:border-b-0 focus:bg-zinc-100 focus:outline-none"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Tour clicked:', tour.id, tour.name);
                              handleTourSelection(tour.id);
                            }}
                          >
                            <div className="font-medium">{tour.name}</div>
                            <div className="text-sm text-gray-600 truncate">
                              {tour.description}
                            </div>
                            <div className="text-sm text-blue-600">
                              ${(tour.price / 100).toFixed(2)} • {tour.duration} duration
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Tours Display */}
                  {selectedToursWithPrices.length > 0 && (
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-green-700">
                          Selected Tours ({selectedToursWithPrices.length})
                        </h4>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Total: {selectedToursWithPrices.reduce((sum, tour) => sum + tour.customPrice, 0).toFixed(2)} EGP
                        </Badge>
                      </div>
                      
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {selectedToursWithPrices.map((tour) => (
                          <div
                            key={tour.id}
                            className="p-4 bg-green-50 border border-green-200 rounded-md"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="font-medium text-green-800">{tour.name}</div>
                                  <Badge variant="secondary" className="text-xs">
                                    ID: {tour.id}
                                  </Badge>
                                </div>
                                <div className="text-sm text-green-600 mt-1">
                                  {tour.description}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Duration: {tour.duration}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTour(tour.id)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-100"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {/* Editable Price Section */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-2 bg-white rounded border">
                                <label className="text-xs font-medium text-gray-700">
                                  Original Price
                                </label>
                                <div className="text-sm font-semibold text-gray-800 mt-1">
                                  {(tour.originalPrice / 100).toFixed(2)} EGP
                                </div>
                              </div>
                              <div className="p-2 bg-white rounded border">
                                <label className="text-xs font-medium text-gray-700">
                                  Custom Price <span className="text-red-500">*</span>
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={tour.customPrice}
                                  onChange={(e) => updateTourPrice(tour.id, parseFloat(e.target.value) || 0)}
                                  className="mt-1 text-sm h-8"
                                  placeholder="Enter price"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {selectedToursWithPrices.length === 0 && (
                    <div className="mt-4 p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
                      <p className="text-sm text-gray-500">No tours selected yet. Search and click on tours above to add them to your package.</p>
                    </div>
                  )}

                  {/* Validation Error for Tours */}
                  {form.formState.errors.selectedTourIds && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.selectedTourIds.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Package Images
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className={cn(
                          "relative aspect-square border rounded overflow-hidden bg-zinc-50",
                          image.isMain && "ring-2 ring-primary",
                        )}
                      >
                        <img
                          src={image.preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1 space-x-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className={cn(
                              "h-7 w-7 bg-white rounded-full shadow-sm hover:scale-110 transition-transform",
                              image.isMain
                                ? "text-amber-500"
                                : "text-muted-foreground",
                            )}
                            onClick={() => setMainImage(image.id)}
                          >
                            <Star
                              className={`h-3.5 w-3.5 ${image.isMain ? "fill-amber-500" : ""}`}
                            />
                            <span className="sr-only">Set as main image</span>
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 bg-white rounded-full shadow-sm hover:scale-110 transition-transform"
                            onClick={() => removeImage(image.id)}
                          >
                            <Trash className="h-3.5 w-3.5" />
                            <span className="sr-only">Remove image</span>
                          </Button>
                        </div>
                        {image.isMain && (
                          <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            {t("main_image", "Main Image")}
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImage}
                      className="aspect-square border border-dashed rounded flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 cursor-pointer"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <ImagePlus className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {t("add_image", "Add Image")}
                        </span>
                      </div>
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <FormDescription>
                    <span className="text-destructive">*</span> ارفع صور الحزمة.
                    يجب رفع صورة واحدة على الأقل. الصورة الأولى أو المميزة
                    ستُستخدم كصورة رئيسية.
                  </FormDescription>
                </div>

                {/* Policy Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Policies & Terms
                  </h3>

                  <FormField
                    control={form.control}
                    name="cancellationPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cancellation Policy</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter cancellation policy details..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Specify cancellation terms and conditions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="childrenPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Children Policy</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter children policy details..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Specify policies for children, pricing, and age
                          restrictions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="termsAndConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms & Conditions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter terms and conditions..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Specify general terms and conditions for this package
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Excluded Items Section */}
                  <div className="space-y-4">
                    <FormLabel>Excluded Items</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter excluded item..."
                        value={newExcludedItem}
                        onChange={(e) => setNewExcludedItem(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addExcludedItem();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addExcludedItem}
                        disabled={!newExcludedItem.trim()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    {(form.watch("excludedItems")?.length || 0) > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {(form.watch("excludedItems") || []).map(
                          (item, index) => (
                            <Badge
                              key={index}
                              variant="destructive"
                              className="flex items-center gap-1"
                            >
                              {item}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-red-100"
                                onClick={() => removeExcludedItem(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ),
                        )}
                      </div>
                    )}
                    <FormDescription>
                      Add items that are not included in this package
                    </FormDescription>
                  </div>

                  {/* Included Items Section */}
                  <FormField
                    control={form.control}
                    name="inclusions"
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          Included Items{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <div className="space-y-3">
                          <div className="flex gap-2 suggestion-dropdown">
                            <div className="relative flex-1">
                              <Input
                                placeholder="Add an inclusion..."
                                value={newInclusion}
                                onChange={handleInclusionInputChange}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addInclusion();
                                  }
                                }}
                              />
                              {showInclusionSuggestions &&
                                inclusionSuggestions.length > 0 && (
                                  <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border rounded-md shadow-lg">
                                    {filterSuggestions(
                                      newInclusion,
                                      inclusionSuggestions,
                                    ).map((suggestion, index) => (
                                      <div
                                        key={index}
                                        className="px-4 py-2 cursor-pointer hover:bg-zinc-100"
                                        onClick={() => {
                                          setNewInclusion(suggestion);
                                          setShowInclusionSuggestions(false);
                                        }}
                                      >
                                        {suggestion}
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </div>
                            <Button
                              type="button"
                              onClick={addInclusion}
                              className="w-[120px]"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-2">
                            {form
                              .watch("inclusions")
                              .map((inclusion, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="flex items-center gap-1 px-3 py-1.5"
                                >
                                  {inclusion}
                                  <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => removeInclusion(index)}
                                  />
                                </Badge>
                              ))}
                          </div>
                        </div>
                        <FormDescription>
                          Add what's included in this package (e.g., breakfast,
                          airport transfer)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <FormRequiredFieldsNote />

            {/* Package Cost Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-200 pb-2">
                Package Cost Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hotels & Rooms Section */}
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-700">Hotels & Accommodation</h4>
                  {form.watch("hotels")?.length > 0 ? (
                    <div className="space-y-2">
                      {form.watch("hotels").map((hotel, index) => {
                        const hotelTotal = hotel.rooms?.reduce((sum, room) => {
                          return sum + (room.pricePerNight || 0);
                        }, 0) || 0;
                        
                        return (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="font-medium text-sm">{hotel.name}</div>
                            <div className="text-xs text-gray-600 mb-2">
                              ⭐ {hotel.stars} stars • {hotel.rooms?.length || 0} room(s)
                            </div>
                            {hotel.rooms?.map((room, roomIndex) => (
                              <div key={roomIndex} className="flex justify-between text-xs text-gray-700">
                                <span>{room.type}</span>
                                <span>{room.pricePerNight.toFixed(2)} EGP/night</span>
                              </div>
                            ))}
                            <div className="flex justify-between font-medium text-sm border-t pt-1 mt-1">
                              <span>Hotel Total:</span>
                              <span className="text-blue-600">{hotelTotal.toFixed(2)} EGP</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No hotels added yet</p>
                  )}
                </div>

                {/* Tours Section */}
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-700">Tours & Activities</h4>
                  {selectedToursWithPrices.length > 0 ? (
                    <div className="space-y-2">
                      {selectedToursWithPrices.map((tour) => (
                        <div key={tour.id} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{tour.name}</div>
                              <div className="text-xs text-gray-600">Duration: {tour.duration}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-blue-600">
                                {tour.customPrice.toFixed(2)} EGP
                              </div>
                              {tour.originalPrice !== (tour.customPrice * 100) && (
                                <div className="text-xs text-gray-500 line-through">
                                  {(tour.originalPrice / 100).toFixed(2)} EGP
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No tours selected yet</p>
                  )}
                </div>
              </div>

              {/* Total Summary */}
              <div className="border-t border-blue-200 pt-4">
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Accommodation Cost:</span>
                    <span className="font-medium">
                      {(form.watch("hotels")?.reduce((total, hotel) => {
                        return total + (hotel.rooms?.reduce((sum, room) => sum + (room.pricePerNight || 0), 0) || 0);
                      }, 0) || 0).toFixed(2)} EGP
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Tours Cost:</span>
                    <span className="font-medium">
                      {selectedToursWithPrices.reduce((sum, tour) => sum + tour.customPrice, 0).toFixed(2)} EGP
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-blue-800 border-t pt-2">
                    <span>Package Total:</span>
                    <span>
                      {(
                        (form.watch("hotels")?.reduce((total, hotel) => {
                          return total + (hotel.rooms?.reduce((sum, room) => sum + (room.pricePerNight || 0), 0) || 0);
                        }, 0) || 0) + 
                        selectedToursWithPrices.reduce((sum, tour) => sum + tour.customPrice, 0)
                      ).toFixed(2)} EGP
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 text-center mt-2">
                    *Final package price may include additional markup as configured in package settings
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isEditMode 
                    ? updateManualPackageMutation.isPending || isLoadingPackage
                    : createManualPackageMutation.isPending
                }
              >
                {isEditMode ? (
                  updateManualPackageMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Manual Package"
                  )
                ) : (
                  createManualPackageMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Manual Package"
                  )
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>

      {/* Hotel Dialog */}
      <AlertDialog open={isHotelDialogOpen} onOpenChange={setIsHotelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingHotelIndex !== null ? "Edit Hotel" : "Add Hotel"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Enter the hotel details below.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2 suggestion-dropdown">
              <label
                htmlFor="hotelName"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Hotel Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  id="hotelName"
                  placeholder="e.g., Sharm El Sheikh Resort"
                  value={hotelFormData.name}
                  onChange={handleNewHotelInputChange}
                />
                {showHotelSuggestions && hotelSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border rounded-md shadow-lg">
                    {filterSuggestions(
                      hotelFormData.name,
                      hotelSuggestions,
                    ).map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 cursor-pointer hover:bg-zinc-100"
                        onClick={() => {
                          setHotelFormData((prev) => ({
                            ...prev,
                            name: suggestion,
                          }));
                          setShowHotelSuggestions(false);
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="hotelStars"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Stars <span className="text-destructive">*</span>
              </label>
              <Select
                value={hotelFormData.stars.toString()}
                onValueChange={(value) =>
                  handleHotelFormChange("stars", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select star rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Star ★</SelectItem>
                  <SelectItem value="2">2 Stars ★★</SelectItem>
                  <SelectItem value="3">3 Stars ★★★</SelectItem>
                  <SelectItem value="4">4 Stars ★★★★</SelectItem>
                  <SelectItem value="5">5 Stars ★★★★★</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rooms Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium leading-none">
                  Rooms <span className="text-destructive">*</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openAddRoomDialog}
                  className="h-8"
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Add Room
                </Button>
              </div>
              
              {hotelFormData.rooms.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                  No rooms added yet. Click "Add Room" to get started.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {hotelFormData.rooms.map((room, index) => (
                    <div
                      key={room.id}
                      className="p-3 border rounded-md flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{room.type}</div>
                        <div className="text-xs text-muted-foreground">
                          ${room.pricePerNight}/night • Max {room.maxOccupancy} guests
                        </div>
                        {room.amenities.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {room.amenities.join(", ")}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditRoomDialog(index)}
                          className="h-6 w-6"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRoom(index)}
                          className="h-6 w-6 text-destructive hover:text-destructive"
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleHotelSave}>
              {editingHotelIndex !== null ? "Update" : "Add"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Room Dialog */}
      <AlertDialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingRoomIndex !== null ? "Edit Room" : "Add Room"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Enter the room details below.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2 suggestion-dropdown">
              <label
                htmlFor="roomType"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Room Type <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  id="roomType"
                  placeholder="e.g., Deluxe Room"
                  value={roomFormData.type}
                  onChange={(e) => {
                    handleRoomFormChange("type", e.target.value);
                  }}
                />
                {roomTypeSuggestions.length > 0 && roomFormData.type && (
                  <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border rounded-md shadow-lg">
                    {filterSuggestions(
                      roomFormData.type,
                      roomTypeSuggestions,
                    ).map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 cursor-pointer hover:bg-zinc-100"
                        onClick={() => {
                          handleRoomFormChange("type", suggestion);
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="pricePerNight"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Price Per Night ($) <span className="text-destructive">*</span>
                </label>
                <Input
                  id="pricePerNight"
                  type="number"
                  placeholder="e.g., 120"
                  value={roomFormData.pricePerNight || ""}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : 0;
                    handleRoomFormChange("pricePerNight", value);
                  }}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="maxOccupancy"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Max Occupancy <span className="text-destructive">*</span>
                </label>
                <Select
                  value={roomFormData.maxOccupancy.toString()}
                  onValueChange={(value) =>
                    handleRoomFormChange("maxOccupancy", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Guest</SelectItem>
                    <SelectItem value="2">2 Guests</SelectItem>
                    <SelectItem value="3">3 Guests</SelectItem>
                    <SelectItem value="4">4 Guests</SelectItem>
                    <SelectItem value="5">5 Guests</SelectItem>
                    <SelectItem value="6">6 Guests</SelectItem>
                    <SelectItem value="8">8 Guests</SelectItem>
                    <SelectItem value="10">10 Guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Amenities (Optional)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["WiFi", "AC", "TV", "Minibar", "Safe", "Balcony", "Ocean View", "City View", "Kitchenette"].map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      checked={roomFormData.amenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleRoomFormChange("amenities", [...roomFormData.amenities, amenity]);
                        } else {
                          handleRoomFormChange("amenities", roomFormData.amenities.filter(a => a !== amenity));
                        }
                      }}
                      className="h-4 w-4 text-primary border-gray-300 rounded"
                    />
                    <label htmlFor={`amenity-${amenity}`} className="text-sm">
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoomSave}>
              {editingRoomIndex !== null ? "Update" : "Add"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default MultiHotelManualPackageForm;
