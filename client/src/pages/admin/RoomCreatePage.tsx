import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useLocation, useParams } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ChevronRight, Save } from "lucide-react";
// Room form schema matching database schema
const roomFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  hotelId: z.string().min(1, "Hotel is required"),
  type: z.string().min(1, "Room type is required"),
  maxOccupancy: z.number().min(1, "Maximum occupancy must be at least 1"),
  maxAdults: z.number().min(1, "Must accommodate at least 1 adult"),
  maxChildren: z.number().min(0, "Must be a positive number"),
  maxInfants: z.number().min(0, "Must be a positive number"),
  price: z.number().min(0, "Price must be a positive number"),
  discountedPrice: z.number().min(0, "Discounted price must be positive").nullable().optional(),
  size: z.string().optional(),
  bedType: z.string().optional(),
  view: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  available: z.boolean().default(true),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

// Define room type options
const roomTypeOptions = [
  { value: "standard", label: "Standard Room" },
  { value: "deluxe", label: "Deluxe Room" },
  { value: "suite", label: "Suite" },
  { value: "family", label: "Family Room" },
  { value: "presidential", label: "Presidential Suite" },
  { value: "executive", label: "Executive Room" },
  { value: "junior_suite", label: "Junior Suite" },
  { value: "penthouse", label: "Penthouse" },
];

// Define bed type options
const bedTypeOptions = [
  { value: "single", label: "Single Bed" },
  { value: "double", label: "Double Bed" },
  { value: "queen", label: "Queen Bed" },
  { value: "king", label: "King Bed" },
  { value: "twin", label: "Twin Beds" },
  { value: "sofa_bed", label: "Sofa Bed" },
  { value: "bunk_bed", label: "Bunk Bed" },
];

// Define view options
const viewOptions = [
  { value: "city", label: "City View" },
  { value: "ocean", label: "Ocean View" },
  { value: "mountain", label: "Mountain View" },
  { value: "garden", label: "Garden View" },
  { value: "pool", label: "Pool View" },
  { value: "courtyard", label: "Courtyard View" },
  { value: "partial_ocean", label: "Partial Ocean View" },
  { value: "no_view", label: "No View" },
];

// Define amenities options
const amenitiesOptions = [
  { id: "wifi", label: "Wi-Fi" },
  { id: "ac", label: "Air Conditioning" },
  { id: "tv", label: "Television" },
  { id: "minibar", label: "Mini Bar" },
  { id: "safe", label: "In-room Safe" },
  { id: "balcony", label: "Balcony" },
  { id: "bathtub", label: "Bathtub" },
  { id: "shower", label: "Shower" },
  { id: "coffee_maker", label: "Coffee Maker" },
  { id: "room_service", label: "Room Service" },
  { id: "housekeeping", label: "Daily Housekeeping" },
  { id: "iron", label: "Iron & Ironing Board" },
];

export default function RoomCreatePage() {
  const { t } = useLanguage();
  const [_, navigate] = useLocation();
  const params = useParams();
  const roomId = params.id; // Get room ID from URL if in edit mode
  const isEditMode = !!roomId;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>([]);
  const [isDraft, setIsDraft] = useState(false);

  // Query to fetch room data for editing
  const { data: roomData, isLoading: isLoadingRoom } = useQuery({
    queryKey: [`/api/admin/rooms/${roomId}`],
    enabled: !!roomId, // Only run the query if we have a roomId (edit mode)
    staleTime: 1000 * 60 * 5, // 5 minutes
  });



  // Save form data to localStorage as draft
  const saveAsDraft = () => {
    const formData = form.getValues();
    const draftData = {
      ...formData,
      images,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('roomDraft', JSON.stringify(draftData));
    setIsDraft(true);
    
    toast({
      title: "Draft Saved",
      description: "Your room data has been saved as a draft",
      duration: 3000,
    });
  };
  
  // Load draft from localStorage
  const loadDraft = () => {
    const draftData = localStorage.getItem('roomDraft');
    if (draftData) {
      try {
        const parsedData = JSON.parse(draftData);
        form.reset(parsedData);
        if (parsedData.images && Array.isArray(parsedData.images)) {
          setImages(parsedData.images);
        }
        
        toast({
          title: "Draft Loaded",
          description: "Your saved room draft has been loaded",
          duration: 3000,
        });
        
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
  
  // Clear draft data
  const clearDraft = () => {
    localStorage.removeItem('roomDraft');
    setIsDraft(false);
    toast({
      title: "Draft Cleared",
      description: "Your saved room draft has been deleted",
      duration: 3000,
    });
  };

  // Form setup with default values matching new schema
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      name: "",
      description: "",
      hotelId: "",
      type: "",
      maxOccupancy: 2,
      maxAdults: 2,
      maxChildren: 0,
      maxInfants: 0,
      price: 0,
      discountedPrice: 0,
      size: "",
      bedType: "",
      view: "",
      amenities: [],
      available: true,
    },
  });

  // Use the shared hook for handling unsaved changes
  const {
    showConfirmDialog: confirmDialogOpen,
    setShowConfirmDialog: setConfirmDialogOpen,
    handleNavigation: navigateWithConfirmation,
    handleSaveAsDraft,
    handleContinue,
    handleDiscard
  } = useUnsavedChanges({
    isDirtyFn: () => form.formState.isDirty || images.length > 0,
    onSaveAsDraft: saveAsDraft,
    onDiscard: clearDraft
  });

  // Query to fetch hotel data for the dropdown
  const { data: hotels = [] } = useQuery({
    queryKey: ["/api/admin/hotels"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Check for draft on component mount and populate form with room data when in edit mode
  React.useEffect(() => {
    // Check for draft (only in create mode)
    if (!isEditMode) {
      const draftExists = localStorage.getItem('roomDraft');
      if (draftExists) {
        setIsDraft(true);
      }
    }
    
    // Populate form with room data when in edit mode and data is loaded
    if (isEditMode && roomData) {
      console.log("Loading room data for editing:", roomData);
      const amenitiesArray = roomData.amenities ? 
        (typeof roomData.amenities === 'string' ? 
          roomData.amenities.split(',').map((a: any) => a.trim()) : 
          Array.isArray(roomData.amenities) ? roomData.amenities : []
        ) : [];
      
      // Set images if available
      if (roomData.images && Array.isArray(roomData.images)) {
        setImages(roomData.images);
      } else if (roomData.imageUrl) {
        setImages([roomData.imageUrl]);
      }
      
      // Reset form with room data matching new schema
      form.reset({
        name: roomData.name || "",
        description: roomData.description || "",
        hotelId: roomData.hotelId ? roomData.hotelId.toString() : "",
        type: roomData.type || "",
        maxOccupancy: roomData.maxOccupancy || 2,
        maxAdults: roomData.maxAdults || 2,
        maxChildren: roomData.maxChildren || 0,
        maxInfants: roomData.maxInfants || 0,
        price: roomData.price ? roomData.price / 100 : 0, // Convert from cents
        discountedPrice: roomData.discountedPrice ? roomData.discountedPrice / 100 : undefined,
        size: roomData.size || "",
        bedType: roomData.bedType || "",
        view: roomData.view || "",
        amenities: amenitiesArray,
        available: roomData.available !== false,
      });
    }
  }, [isEditMode, roomData, form]);

  // Create room mutation with proper data transformation
  const createRoomMutation = useMutation({
    mutationFn: async (data: RoomFormValues) => {
      // Validate required fields first
      if (!data.name?.trim()) {
        throw new Error("Room name is required");
      }
      if (!data.hotelId) {
        throw new Error("Hotel selection is required");
      }
      if (!data.type) {
        throw new Error("Room type is required");
      }

      // Transform form data to match database schema exactly
      const roomData = {
        name: data.name.trim(),
        description: data.description?.trim(),
        hotelId: parseInt(data.hotelId),
        type: data.type,
        maxOccupancy: Number(data.maxOccupancy),
        maxAdults: Number(data.maxAdults),
        maxChildren: Number(data.maxChildren),
        maxInfants: Number(data.maxInfants),
        price: Math.round(Number(data.price) * 100), // Convert to cents
        discountedPrice: data.discountedPrice && data.discountedPrice > 0 ? Math.round(Number(data.discountedPrice) * 100) : undefined,
        currency: "EGP",
        imageUrl: images.length > 0 ? images[0] : undefined,
        size: data.size?.trim(),
        bedType: data.bedType,
        amenities: data.amenities?.length > 0 ? data.amenities : undefined,
        view: data.view,
        available: Boolean(data.available),
        status: data.available ? "active" : "inactive",
      };

      console.log("Sending room data:", roomData);

      return await apiRequest(
        isEditMode ? `/api/admin/rooms/${roomId}` : "/api/admin/rooms",
        {
          method: isEditMode ? "PUT" : "POST",
          body: JSON.stringify(roomData),
        }
      );
    },
    onSuccess: () => {
      toast({
        title: isEditMode ? "Room Updated" : "Room Created",
        description: `The room was ${isEditMode ? 'updated' : 'created'} successfully`,
        duration: 5000,
      });
      
      // Clear draft on successful submission
      localStorage.removeItem('roomDraft');
      setIsDraft(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["rooms-admin"] });
      queryClient.invalidateQueries({ queryKey: ["hotels-admin"] });
      
      // Navigate back to rooms list
      navigate("/admin/rooms");
    },
    onError: (error: Error) => {
      console.error("Room creation error:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} room`,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Form submission handler with validation
  const onSubmit = async (data: RoomFormValues) => {
    try {
      // Validate max occupancy matches capacity
      const totalCapacity = data.maxAdults + data.maxChildren + data.maxInfants;
      if (data.maxOccupancy < totalCapacity) {
        toast({
          title: "Validation Error",
          description: "Maximum occupancy cannot be less than the sum of adults, children, and infants",
          variant: "destructive",
        });
        return;
      }

      // Validate pricing
      if (data.discountedPrice && data.discountedPrice >= data.price) {
        toast({
          title: "Validation Error", 
          description: "Discounted price must be less than the regular price",
          variant: "destructive",
        });
        return;
      }

      createRoomMutation.mutate(data);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Validation Error",
        description: "Please check all fields and try again",
        variant: "destructive",
      });
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Mock image upload - in a real app, you would upload to server
    // For now, we'll just store the file names
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImages]);
  };

  return (
    <div>
      {/* Confirmation Dialog for Unsaved Changes */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in your room form. What would you like to do?
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
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Button variant="link" onClick={() => navigateWithConfirmation("/admin")}>Dashboard</Button>
            <ChevronRight className="h-4 w-4" />
            <Button variant="link" onClick={() => navigateWithConfirmation("/admin/rooms")}>Rooms</Button>
            <ChevronRight className="h-4 w-4" />
            <span>Create Room</span>
          </div>
        </div>
        
        {/* Draft notice banner */}
        {isDraft && (
          <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-800">Draft Available</h3>
              <p className="text-blue-600">You have a saved room draft. Would you like to continue where you left off?</p>
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
            <CardTitle>{isEditMode ? 'Edit Room' : 'Create New Room'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Room Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Name*</FormLabel>
                          <FormControl>
                            <Input 
                              id="room-name"
                              className="room-name-input admin-input"
                              placeholder="e.g., Deluxe Ocean View Room" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Hotel Selection */}
                    <FormField
                      control={form.control}
                      name="hotelId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hotel*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger 
                                id="hotel-select"
                                className="hotel-select admin-select"
                              >
                                <SelectValue placeholder="Select a hotel" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(hotels) && hotels.map((hotel: any) => (
                                <SelectItem key={hotel.id} value={hotel.id.toString()}>
                                  {hotel.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Room Type */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Type*</FormLabel>
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
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
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
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room Size</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 35 sqm" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Room size (e.g., "35 sqm", "400 sq ft")
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Bed Type */}
                    <FormField
                      control={form.control}
                      name="bedType"
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
                              {bedTypeOptions.map((bed) => (
                                <SelectItem key={bed.value} value={bed.value}>
                                  {bed.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* View */}
                    <FormField
                      control={form.control}
                      name="view"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room View</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select view" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {viewOptions.map((view) => (
                                <SelectItem key={view.value} value={view.value}>
                                  {view.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Room Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            id="room-description"
                            className="min-h-[120px] room-description-input admin-textarea"
                            placeholder="Describe the room features, amenities, and what makes it special..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed description of the room for guests
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Capacity and Occupancy Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Room Capacity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Maximum Occupancy */}
                    <FormField
                      control={form.control}
                      name="maxOccupancy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Occupancy*</FormLabel>
                          <FormControl>
                            <Input 
                              id="max-occupancy"
                              className="admin-number-input"
                              type="number" 
                              min="1" 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                              value={field.value}
                            />
                          </FormControl>
                          <FormDescription>Total guests allowed</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Adults */}
                    <FormField
                      control={form.control}
                      name="maxAdults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Adults*</FormLabel>
                          <FormControl>
                            <Input 
                              id="max-adults"
                              className="max-adults-input admin-number-input"
                              type="number" 
                              min="1" 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                              value={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Children */}
                    <FormField
                      control={form.control}
                      name="maxChildren"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Children</FormLabel>
                          <FormControl>
                            <Input 
                              id="max-children"
                              className="max-children-input admin-number-input"
                              type="number" 
                              min="0" 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              value={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Infants */}
                    <FormField
                      control={form.control}
                      name="maxInfants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Infants</FormLabel>
                          <FormControl>
                            <Input 
                              id="max-infants"
                              className="max-infants-input admin-number-input"
                              type="number" 
                              min="0" 
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              value={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Regular Price */}
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Night (EGP)*</FormLabel>
                          <FormControl>
                            <Input 
                              id="room-price"
                              className="room-price-input admin-currency-input"
                              type="number" 
                              min="0" 
                              step="0.01"
                              placeholder="1500.00" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              value={field.value}
                            />
                          </FormControl>
                          <FormDescription>Base rate per night</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Discounted Price */}
                    <FormField
                      control={form.control}
                      name="discountedPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discounted Price (EGP)</FormLabel>
                          <FormControl>
                            <Input 
                              id="room-discounted-price"
                              className="admin-currency-input"
                              type="number" 
                              min="0" 
                              step="0.01"
                              placeholder="1200.00" 
                              {...field}
                              onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>Optional promotional price</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                  <FormLabel>Amenities</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {amenitiesOptions.map((amenity) => (
                      <FormField
                        key={amenity.id}
                        control={form.control}
                        name="amenities"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(amenity.id)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  return checked
                                    ? field.onChange([...currentValues, amenity.id])
                                    : field.onChange(
                                        currentValues.filter((value) => value !== amenity.id)
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {amenity.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Room Images */}
                <div className="space-y-4">
                  <FormLabel>Room Images</FormLabel>
                  <div className="flex flex-col space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                    <FormDescription>
                      Upload images of the room (up to 5)
                    </FormDescription>
                  </div>

                  {/* Display uploaded images */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={image}
                            alt={`Room preview ${index + 1}`}
                            className="object-cover rounded-md w-full h-full"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => {
                              setImages((prev) => prev.filter((_, i) => i !== index));
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Availability Status */}
                <FormField
                  control={form.control}
                  name="available"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel>Room is Available</FormLabel>
                        <FormDescription>
                          Unavailable rooms won't be shown to guests for booking
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigateWithConfirmation("/admin/rooms")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveAsDraft}
                  >
                    Save as Draft
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createRoomMutation.isPending}
                  >
                    {createRoomMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        Creating...
                      </div>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Room
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      {/* Confirmation Dialog for Unsaved Changes */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="destructive" onClick={handleDiscard}>Discard Changes</Button>
            <Button variant="outline" onClick={handleContinue}>Continue Editing</Button>
            <Button onClick={handleSaveAsDraft}>Save as Draft</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}