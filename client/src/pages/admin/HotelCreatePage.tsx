import React, { useState, useEffect, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import InlineFeatureManager from "@/components/hotel/InlineFeatureManager";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronRight,
  Save,
  MapPin,
  Star,
  Clock,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Tag,
  Building,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

// Define the schema for hotel form validation  
const hotelFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }), // Required
  description: z.string().optional().nullable(),
  destinationId: z.coerce.number().positive({ message: "Please select a destination" }), // Required
  address: z.string().min(1, { message: "Address is required" }), // Required
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  cityId: z.coerce.number().positive({ message: "Please select a city" }).nullable(), // Optional now
  countryId: z.coerce.number().positive({ message: "Please select a country" }).nullable(), // Optional now
  postalCode: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email({ message: "Please enter a valid email" }).optional().nullable(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().nullable(),
  imageUrl: z.string().url({ message: "Please enter a valid URL" }).optional().nullable(),
  stars: z.coerce.number().min(1).max(5).default(3), // Required
  amenities: z.array(z.string()).default([]),
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
  longitude: z.coerce.number().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  featured: z.boolean().default(false),
  status: z.string().default("active"),
  // Complex data fields
  restaurants: z.array(z.object({
    name: z.string(),
    cuisineType: z.string(),
    breakfastOptions: z.array(z.string()).default([])
  })).default([]),
  landmarks: z.array(z.object({
    name: z.string(),
    distance: z.string(),
    description: z.string()
  })).default([]),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).default([]),
  roomTypes: z.array(z.object({
    name: z.string(),
    capacity: z.number(),
    price: z.number(),
    description: z.string()
  })).default([]),
});

type HotelFormValues = z.infer<typeof hotelFormSchema>;

// Common hotel amenities
const hotelAmenitiesOptions = [
  { id: "wifi", label: "Wi-Fi" },
  { id: "parking", label: "Parking" },
  { id: "pool", label: "Swimming Pool" },
  { id: "spa", label: "Spa & Wellness" },
  { id: "restaurant", label: "Restaurant" },
  { id: "bar", label: "Bar/Lounge" },
  { id: "gym", label: "Fitness Center" },
  { id: "roomService", label: "Room Service" },
  { id: "airportShuttle", label: "Airport Shuttle" },
  { id: "businessCenter", label: "Business Center" },
  { id: "conferenceRoom", label: "Conference Room" },
  { id: "childcare", label: "Childcare Services" },
  { id: "laundry", label: "Laundry Service" },
  { id: "wheelchairAccessible", label: "Wheelchair Accessible" },
  { id: "petFriendly", label: "Pet Friendly" },
];

export default function HotelCreatePage() {
  // const { t } = useLanguage();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [formInitialized, setFormInitialized] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);

  // Get saved form data from localStorage or use defaults
  const getSavedFormData = (): Partial<HotelFormValues> => {
    const savedData = localStorage.getItem('hotelCreateFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setIsDraft(true);
        return parsed;
      } catch (e) {
        console.error('Error parsing saved form data:', e);
      }
    }
    return {};
  };
  
  // Save form data to localStorage as draft
  const saveFormAsDraft = () => {
    const formValues = form.getValues();
    localStorage.setItem('hotelCreateFormData', JSON.stringify(formValues));
    setIsDraft(true);
    toast({
      title: "Draft Saved",
      description: "Your hotel information has been saved as a draft.",
    });
  };
  
  // Navigation helper function
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Query to fetch destinations data for the dropdown
  const { data: destinations = [] } = useQuery({
    queryKey: ["/api/destinations"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query to fetch countries data for the dropdown
  const { data: countries = [] } = useQuery<any[]>({
    queryKey: ["/api/countries"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query to fetch cities data for the dropdown
  const { data: cities = [] } = useQuery<any[]>({
    queryKey: ["/api/cities"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Merge default values with saved values from localStorage
  const savedFormData = getSavedFormData();
  
  // Form setup with default values
  const form = useForm<HotelFormValues>({
    resolver: zodResolver(hotelFormSchema),
    defaultValues: {
      name: savedFormData.name || "",
      description: savedFormData.description || "",
      destinationId: savedFormData.destinationId || undefined,
      address: savedFormData.address || "",
      cityId: savedFormData.cityId || undefined,
      countryId: savedFormData.countryId || undefined,
      postalCode: savedFormData.postalCode || "",
      phone: savedFormData.phone || "",
      email: savedFormData.email || "",
      website: savedFormData.website || "",
      imageUrl: savedFormData.imageUrl || "",
      stars: savedFormData.stars || 3,
      amenities: savedFormData.amenities || [],
      checkInTime: savedFormData.checkInTime || "14:00",
      checkOutTime: savedFormData.checkOutTime || "11:00",
      longitude: savedFormData.longitude || undefined,
      latitude: savedFormData.latitude || undefined,
      featured: savedFormData.featured || false,
      status: savedFormData.status || "active",
      // Complex data fields
      restaurants: savedFormData.restaurants || [],
      landmarks: savedFormData.landmarks || [],
      faqs: savedFormData.faqs || [],
      roomTypes: savedFormData.roomTypes || [],
    },
  });

  // Setup field arrays for restaurants and other complex data
  const {
    fields: restaurantFields,
    append: appendRestaurant,
    remove: removeRestaurant,
  } = useFieldArray({
    control: form.control,
    name: "restaurants",
  });

  const {
    fields: landmarkFields,
    append: appendLandmark,
    remove: removeLandmark,
  } = useFieldArray({
    control: form.control,
    name: "landmarks",
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

  // Check for drafts on component mount
  useEffect(() => {
    const draftExists = localStorage.getItem('hotelDraft');
    if (draftExists) {
      setIsDraft(true);
    }
    
    // Initialize selectedAmenities from saved data if available
    if (!formInitialized && savedFormData.amenities && Array.isArray(savedFormData.amenities)) {
      setSelectedAmenities(savedFormData.amenities);
      setFormInitialized(true);
    }

    // Initialize selectedCountryId from saved data if available
    if (savedFormData.countryId) {
      setSelectedCountryId(savedFormData.countryId);
    }
  }, [formInitialized, savedFormData.amenities, savedFormData.countryId]);
  
  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem('hotelCreateFormData', JSON.stringify({
        ...value,
        amenities: selectedAmenities
      }));
    });
    
    return () => subscription.unsubscribe();
  }, [form, selectedAmenities]);
  
  // Save as draft function
  const saveAsDraft = () => {
    const formData = form.getValues();
    const draftData = {
      ...formData,
      amenities: selectedAmenities,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('hotelDraft', JSON.stringify(draftData));
    setIsDraft(true);
    
    toast({
      title: "Draft Saved",
      description: "Your hotel data has been saved as a draft",
      duration: 3000,
    });
  };
  
  // Load draft function
  const loadDraft = () => {
    const draftData = localStorage.getItem('hotelDraft');
    if (draftData) {
      try {
        const parsedData = JSON.parse(draftData);
        form.reset(parsedData);
        if (parsedData.amenities && Array.isArray(parsedData.amenities)) {
          setSelectedAmenities(parsedData.amenities);
        }
        
        toast({
          title: "Draft Loaded",
          description: "Your saved hotel draft has been loaded",
          duration: 3000,
        });
        
        // Keep the draft but mark it as viewed
        setIsDraft(false);
      } catch (e) {
        console.error('Error loading draft data:', e);
        toast({
          title: "Error",
          description: "Failed to load draft data",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };
  
  // Define the clearDraft function
  const clearDraft = () => {
    localStorage.removeItem('hotelDraft');
    setIsDraft(false);
    toast({
      title: "Draft Cleared",
      description: "Your saved hotel draft has been deleted",
      duration: 3000,
    });
  };
  
  // Create hotel mutation
  const createHotelMutation = useMutation({
    mutationFn: async (data: HotelFormValues) => {
      console.log('Form data before submission:', data);
      console.log('Selected amenities:', selectedAmenities);
      console.log('Restaurants data:', data.restaurants);
      console.log('Landmarks data:', data.landmarks);
      
      // Map form fields to database schema with proper field mapping
      const formData = {
        name: data.name,
        description: data.description,
        destinationId: data.destinationId,
        address: data.address,
        city: data.city || null,
        country: data.country || null,
        cityId: data.cityId || null,
        countryId: data.countryId || null,
        postalCode: data.postalCode,
        phone: data.phone,
        email: data.email,
        website: data.website,
        imageUrl: data.imageUrl,
        stars: data.stars, // This should be properly passed
        amenities: selectedAmenities.length > 0 ? JSON.stringify(selectedAmenities) : null,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        longitude: data.longitude || null,
        latitude: data.latitude || null,
        featured: data.featured || false,
        status: data.status || "active",
        // Include complex data fields
        restaurants: data.restaurants || [],
        landmarks: data.landmarks || [],
        faqs: data.faqs || [],
        roomTypes: data.roomTypes || [],
      };
      
      console.log('Mapped form data for API:', formData);
      
      // Clear form data and draft from localStorage on successful submission
      localStorage.removeItem('hotelCreateFormData');
      localStorage.removeItem('hotelDraft');
      
      // Fix API request to match expected format
      return await apiRequest("/api/admin/hotels", {
        method: 'POST', 
        body: JSON.stringify(formData)
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

  // Form submission handler
  const onSubmit = (data: HotelFormValues) => {
    createHotelMutation.mutate(data);
  };

  // Handle amenity selection
  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities((prev) => [...prev, amenityId]);
    } else {
      setSelectedAmenities((prev) => prev.filter((id) => id !== amenityId));
    }
  };

  // Check if the form is dirty
  const isDirtyCheck = () => {
    return form.formState.isDirty;
  };

  // Use the shared hook for handling unsaved changes
  const {
    showConfirmDialog: confirmDialogOpen,
    setShowConfirmDialog: setConfirmDialogOpen,
    handleNavigation: navigateWithConfirmation,
    handleSaveAsDraft,
    handleContinue,
    handleDiscard
  } = useUnsavedChanges({
    isDirtyFn: isDirtyCheck,
    onSaveAsDraft: saveAsDraft,
    onDiscard: clearDraft
  });

  return (
    <div>
      {/* Confirmation Dialog for Unsaved Changes */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in your hotel form. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleDiscard}
              className="sm:order-1 w-full sm:w-auto"
            >
              Discard Changes
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSaveAsDraft}
              className="sm:order-2 w-full sm:w-auto"
            >
              Save as Draft
            </Button>
            <Button 
              onClick={handleContinue}
              className="sm:order-3 w-full sm:w-auto"
            >
              Continue Editing
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Button variant="link" onClick={() => navigateWithConfirmation("/admin")}>Dashboard</Button>
            <ChevronRight className="h-4 w-4" />
            <Button variant="link" onClick={() => navigateWithConfirmation("/admin/hotels")}>Hotels</Button>
            <ChevronRight className="h-4 w-4" />
            <span>Create Hotel</span>
          </div>
        </div>
        
        {/* Draft notice banner */}
        {isDraft && (
          <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-800">Draft Available</h3>
              <p className="text-blue-600">You have a saved hotel draft. Would you like to continue where you left off?</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearDraft}>
                Discard Draft
              </Button>
              <Button onClick={loadDraft}>
                Load Draft
              </Button>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Create New Hotel</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hotel Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hotel Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            id="hotel-name"
                            className="hotel-name-input admin-input"
                            placeholder="Grand Hotel" 
                            {...field} 
                          />
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
                        <FormLabel>Destination <span className="text-red-500">*</span></FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger 
                              id="hotel-destination"
                              className="destination-select admin-select"
                            >
                              <SelectValue placeholder="Select a destination" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(destinations) && destinations.map((destination: any) => (
                              <SelectItem key={destination.id} value={destination.id.toString()}>
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
                          id="hotel-description"
                          className="min-h-[120px] hotel-description-input admin-textarea"
                          placeholder="Describe the hotel and its unique features"
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
                        <FormLabel>Address <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="hotel-address"
                              className="pl-10 hotel-address-input admin-input"
                              placeholder="123 Hotel Street"
                              {...field}
                              value={field.value || ""}
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
                            <SelectTrigger 
                              id="hotel-country"
                              className="country-select admin-select"
                            >
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(countries) && countries.map((country: any) => (
                              <SelectItem key={country.id} value={country.id.toString()}>
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
                            <SelectTrigger 
                              id="hotel-city"
                              className="city-select admin-select"
                            >
                              <SelectValue placeholder={selectedCountryId ? "Select a city" : "Select a country first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(cities) && cities
                              .filter((city: any) => city.countryId === selectedCountryId)
                              .map((city: any) => (
                                <SelectItem key={city.id} value={city.id.toString()}>
                                  {city.name}
                                </SelectItem>
                              ))
                            }
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
                            id="hotel-postal-code"
                            className="hotel-postal-code-input admin-input"
                            placeholder="12345"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                              id="hotel-phone"
                              className="pl-10 hotel-phone-input admin-phone-input"
                              placeholder="+1 (123) 456-7890"
                              {...field}
                              value={field.value || ""}
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
                              id="hotel-email"
                              className="pl-10 hotel-email-input admin-email-input"
                              placeholder="info@hotelname.com"
                              {...field}
                              value={field.value || ""}
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                              id="hotel-website"
                              className="pl-10 hotel-website-input admin-url-input"
                              placeholder="https://www.hotelname.com"
                              {...field}
                              value={field.value || ""}
                            />
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image URL */}
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input
                            id="hotel-image-url"
                            className="hotel-image-url-input admin-url-input"
                            placeholder="https://example.com/hotel-image.jpg"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Stars */}
                  <FormField
                    control={form.control}
                    name="stars"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Star Rating <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Select
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              defaultValue={field.value?.toString() || "3"}
                            >
                              <SelectTrigger 
                                id="hotel-stars"
                                className="pl-10 hotel-stars-select admin-select"
                              >
                                <SelectValue placeholder="Select stars" />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5].map((stars) => (
                                  <SelectItem key={stars} value={stars.toString()}>
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
                            value={field.value == null ? "" : String(field.value)}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
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
                            value={field.value == null ? "" : String(field.value)}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Featured */}
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Hotel</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Feature this hotel on the homepage
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

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="maintenance">Under Maintenance</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amenities */}
                <div className="space-y-3">
                  <FormLabel>Amenities</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {hotelAmenitiesOptions.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`amenity-${amenity.id}`}
                          checked={selectedAmenities.includes(amenity.id)}
                          onCheckedChange={(checked) => 
                            handleAmenityChange(amenity.id, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`amenity-${amenity.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {amenity.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restaurants Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Hotel Restaurants</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendRestaurant({ name: "", cuisineType: "", breakfastOptions: [] })}
                    >
                      Add Restaurant
                    </Button>
                  </div>
                  
                  {restaurantFields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Restaurant {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRestaurant(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`restaurants.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Restaurant Name</FormLabel>
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
                                  placeholder="e.g., Italian, International, Arabic"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Landmarks Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Nearby Landmarks</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendLandmark({ name: "", distance: "", description: "" })}
                    >
                      Add Landmark
                    </Button>
                  </div>
                  
                  {landmarkFields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Landmark {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLandmark(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`landmarks.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Landmark Name</FormLabel>
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
                                  placeholder="e.g., 2.5 km"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
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
                    </Card>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleNavigation("/admin/hotels")}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={saveFormAsDraft}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save as Draft
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={createHotelMutation.isPending}
                  >
                    {createHotelMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        Creating...
                      </div>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Hotel
                      </>
                    )}
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