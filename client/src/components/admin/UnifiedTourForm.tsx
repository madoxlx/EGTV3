import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, Plus, X, Languages, Calendar as CalendarIcon } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

// Unified tour form schema
const tourFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  destinationId: z.number().optional(),
  duration: z.number().min(1, "Duration must be at least 1"),
  durationType: z.string().default("days"),
  price: z.number().min(0, "Price must be positive"),
  discountedPrice: z.number().min(0).optional(),
  maxCapacity: z.number().min(1).optional(),
  maxGroupSize: z.number().min(1).optional(),
  numPassengers: z.number().min(1).optional(),
  imageUrl: z.string().optional(),
  galleryUrls: z.array(z.string()).optional(),
  tripType: z.string().optional(),
  itinerary: z.string().optional(),
  included: z.array(z.string()).optional(),
  excluded: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  status: z.string().default("active"),
  currency: z.string().default("EGP"),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  categoryId: z.number().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  date: z.date().optional(),
  // Policy and Legal fields
  cancellationPolicy: z.string().optional(),
  termsAndConditions: z.string().optional(),
  // Arabic fields
  nameAr: z.string().optional(),
  descriptionAr: z.string().optional(),
  itineraryAr: z.string().optional(),
  includedAr: z.array(z.string()).optional(),
  excludedAr: z.array(z.string()).optional(),
  hasArabicVersion: z.boolean().default(false),
});

type TourFormValues = z.infer<typeof tourFormSchema>;

interface UnifiedTourFormProps {
  mode: 'create' | 'edit';
  tourId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UnifiedTourForm({ mode, tourId, onSuccess, onCancel }: UnifiedTourFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basic");
  const [isArabicDialogOpen, setIsArabicDialogOpen] = useState(false);
  const [newIncluded, setNewIncluded] = useState("");
  const [newExcluded, setNewExcluded] = useState("");
  const [newIncludedAr, setNewIncludedAr] = useState("");
  const [newExcludedAr, setNewExcludedAr] = useState("");
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  // Fetch existing tour data for edit mode
  const { data: tour, isLoading: tourLoading } = useQuery({
    queryKey: ['/api/admin/tours', tourId],
    queryFn: () => tourId ? apiRequest(`/api/admin/tours/${tourId}`) : null,
    enabled: mode === 'edit' && !!tourId,
  });

  // Fetch categories and destinations
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/tour-categories'],
    queryFn: () => apiRequest('/api/tour-categories'),
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ['/api/destinations'],
    queryFn: () => apiRequest('/api/destinations'),
  });

  // Initialize form
  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: {
      name: "",
      description: "",
      destinationId: 0,
      duration: 1,
      durationType: "days",
      price: 0,
      discountedPrice: 0,
      maxCapacity: 10,
      maxGroupSize: 10,
      numPassengers: 1,
      imageUrl: "",
      galleryUrls: [],
      tripType: "",
      itinerary: "",
      included: [],
      excluded: [],
      featured: false,
      active: true,
      status: "active",
      currency: "EGP",
      rating: 0,
      reviewCount: 0,
      categoryId: 0,
      cancellationPolicy: "",
      termsAndConditions: "",
      nameAr: "",
      descriptionAr: "",
      itineraryAr: "",
      includedAr: [],
      excludedAr: [],
      hasArabicVersion: false,
    },
  });

  // Update form when tour data is loaded in edit mode
  useEffect(() => {
    if (mode === 'edit' && tour) {
      console.log('Loading tour data into form:', tour);
      
      // Ensure proper type conversion for numeric fields
      const destinationId = tour.destinationId ? Number(tour.destinationId) : 0;
      const categoryId = tour.categoryId ? Number(tour.categoryId) : 0;
      const duration = tour.duration ? Number(tour.duration) : 1;
      
      // Convert prices from cents to EGP for display
      const priceInEGP = tour.price ? Number(tour.price) / 100 : 0;
      const discountedPriceInEGP = tour.discountedPrice ? Number(tour.discountedPrice) / 100 : 0;
      
      // Parse JSON fields safely
      let included = [];
      let excluded = [];
      let includedAr = [];
      let excludedAr = [];
      
      if (tour.included) {
        included = Array.isArray(tour.included) ? tour.included : 
                  typeof tour.included === 'string' ? JSON.parse(tour.included) : [];
      }
      
      if (tour.excluded) {
        excluded = Array.isArray(tour.excluded) ? tour.excluded : 
                  typeof tour.excluded === 'string' ? JSON.parse(tour.excluded) : [];
      }
      
      if (tour.includedAr) {
        includedAr = Array.isArray(tour.includedAr) ? tour.includedAr : 
                    typeof tour.includedAr === 'string' ? JSON.parse(tour.includedAr) : [];
      }
      
      if (tour.excludedAr) {
        excludedAr = Array.isArray(tour.excludedAr) ? tour.excludedAr : 
                    typeof tour.excludedAr === 'string' ? JSON.parse(tour.excludedAr) : [];
      }

      const formData = {
        name: tour.name || "",
        description: tour.description || "",
        destinationId: destinationId,
        duration: duration,
        durationType: tour.durationType || "days",
        price: priceInEGP,
        discountedPrice: discountedPriceInEGP,
        maxCapacity: tour.maxCapacity || 10,
        maxGroupSize: tour.maxGroupSize || 10,
        numPassengers: tour.numPassengers || 1,
        imageUrl: tour.imageUrl || "",
        galleryUrls: tour.galleryUrls || [],
        tripType: tour.tripType || "",
        itinerary: tour.itinerary || "",
        included: included,
        excluded: excluded,
        featured: tour.featured || false,
        active: tour.active !== false,
        status: tour.status || "active",
        currency: tour.currency || "EGP",
        rating: tour.rating || 0,
        reviewCount: tour.reviewCount || 0,
        categoryId: categoryId,
        startDate: tour.startDate ? new Date(tour.startDate) : undefined,
        endDate: tour.endDate ? new Date(tour.endDate) : undefined,
        date: tour.date ? new Date(tour.date) : undefined,
        cancellationPolicy: tour.cancellationPolicy || "",
        termsAndConditions: tour.termsAndConditions || "",
        nameAr: tour.nameAr || "",
        descriptionAr: tour.descriptionAr || "",
        itineraryAr: tour.itineraryAr || "",
        includedAr: includedAr,
        excludedAr: excludedAr,
        hasArabicVersion: tour.hasArabicVersion || false,
      };
      
      form.reset(formData);
    }
  }, [mode, tour, form]);

  // Prepare form data for submission
  const prepareFormData = (data: TourFormValues) => {
    const formData = { 
      ...data,
      price: Math.round(data.price * 100), // Convert EGP to cents
      discountedPrice: data.discountedPrice ? Math.round(data.discountedPrice * 100) : null,
    };
    
    // Ensure arrays are properly formatted (normally they should already be arrays from the form)
    formData.included = formData.included || [];
    formData.excluded = formData.excluded || [];
    formData.includedAr = formData.includedAr || [];
    formData.excludedAr = formData.excludedAr || [];
    
    return formData;
  };

  // Create tour mutation
  const createTourMutation = useMutation({
    mutationFn: async (data: TourFormValues) => {
      const preparedData = prepareFormData(data);
      return await apiRequest("/api/admin/tours", {
        method: "POST",
        body: JSON.stringify(preparedData),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tour created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tours"] });
      if (onSuccess) {
        onSuccess();
      } else {
        setLocation('/admin/tours');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tour",
        variant: "destructive",
      });
    },
  });

  // Update tour mutation
  const updateTourMutation = useMutation({
    mutationFn: async (data: TourFormValues) => {
      const preparedData = prepareFormData(data);
      return await apiRequest(`/api/admin/tours/${tourId}`, {
        method: "PUT",
        body: JSON.stringify(preparedData),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tour updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tours"] });
      if (onSuccess) {
        onSuccess();
      } else {
        setLocation('/admin/tours');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tour",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TourFormValues) => {
    if (mode === 'create') {
      createTourMutation.mutate(data);
    } else {
      updateTourMutation.mutate(data);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setLocation('/admin/tours');
    }
  };

  // Helper functions for managing included/excluded items
  const addIncluded = () => {
    if (newIncluded.trim()) {
      const current = form.getValues("included") || [];
      form.setValue("included", [...current, newIncluded.trim()]);
      setNewIncluded("");
    }
  };

  const removeIncluded = (index: number) => {
    const current = form.getValues("included") || [];
    form.setValue("included", current.filter((_: any, i: number) => i !== index));
  };

  const addExcluded = () => {
    if (newExcluded.trim()) {
      const current = form.getValues("excluded") || [];
      form.setValue("excluded", [...current, newExcluded.trim()]);
      setNewExcluded("");
    }
  };

  const removeExcluded = (index: number) => {
    const current = form.getValues("excluded") || [];
    form.setValue("excluded", current.filter((_: any, i: number) => i !== index));
  };

  const addIncludedAr = () => {
    if (newIncludedAr.trim()) {
      const current = form.getValues("includedAr") || [];
      form.setValue("includedAr", [...current, newIncludedAr.trim()]);
      setNewIncludedAr("");
    }
  };

  const removeIncludedAr = (index: number) => {
    const current = form.getValues("includedAr") || [];
    form.setValue("includedAr", current.filter((_: any, i: number) => i !== index));
  };

  const addExcludedAr = () => {
    if (newExcludedAr.trim()) {
      const current = form.getValues("excludedAr") || [];
      form.setValue("excludedAr", [...current, newExcludedAr.trim()]);
      setNewExcludedAr("");
    }
  };

  const removeExcludedAr = (index: number) => {
    const current = form.getValues("excludedAr") || [];
    form.setValue("excludedAr", current.filter((_: any, i: number) => i !== index));
  };

  const addGalleryUrl = () => {
    if (newGalleryUrl.trim()) {
      const current = form.getValues("galleryUrls") || [];
      form.setValue("galleryUrls", [...current, newGalleryUrl.trim()]);
      setNewGalleryUrl("");
    }
  };

  const removeGalleryUrl = (index: number) => {
    const current = form.getValues("galleryUrls") || [];
    form.setValue("galleryUrls", current.filter((_: any, i: number) => i !== index));
  };

  if (mode === 'edit' && tourLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (mode === 'edit' && !tour && tourId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Tour not found</h2>
          <Button onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tours
          </Button>
        </div>
      </div>
    );
  }

  const isSubmitting = mode === 'create' ? createTourMutation.isPending : updateTourMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tours
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {mode === 'create' ? 'Create New Tour' : 'Edit Tour'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'create' ? 'Create a new tour experience' : 'Update tour details and settings'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Tour Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="policies">Policies</TabsTrigger>
                  <TabsTrigger value="arabic">Arabic</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tour Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter tour name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category: any, index: number) => (
                                <SelectItem key={`category-${category.id}-${index}`} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter tour description" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="destinationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select destination" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {destinations.map((destination: any, index: number) => (
                                <SelectItem key={`destination-${destination.id}-${index}`} value={destination.id.toString()}>
                                  {destination.name}
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
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (EGP) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                              placeholder="0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="maxCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Capacity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="10" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxGroupSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Group Size</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="10" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numPassengers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Passengers</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-6">
                  {/* Itinerary */}
                  <FormField
                    control={form.control}
                    name="itinerary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Itinerary</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter detailed itinerary" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Included Items */}
                  <div>
                    <Label htmlFor="included-items">Included Items</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add included item"
                          value={newIncluded}
                          onChange={(e) => setNewIncluded(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncluded())}
                        />
                        <Button type="button" onClick={addIncluded} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {form.watch("included")?.map((item: string, index: number) => (
                        <div key={`included-${index}`} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                          <span className="flex-1 text-sm">{item}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeIncluded(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Excluded Items */}
                  <div>
                    <Label htmlFor="excluded-items">Excluded Items</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add excluded item"
                          value={newExcluded}
                          onChange={(e) => setNewExcluded(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExcluded())}
                        />
                        <Button type="button" onClick={addExcluded} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {form.watch("excluded")?.map((item: string, index: number) => (
                        <div key={`excluded-${index}`} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                          <span className="flex-1 text-sm">{item}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeExcluded(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Tour is visible to customers
                            </div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Featured</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Show in featured tours
                            </div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hasArabicVersion"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Arabic Version</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Tour has Arabic content
                            </div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-6">
                  {/* Main Image */}
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter image URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Gallery URLs */}
                  <div>
                    <Label htmlFor="gallery-urls">Gallery Images</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add gallery image URL"
                          value={newGalleryUrl}
                          onChange={(e) => setNewGalleryUrl(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGalleryUrl())}
                        />
                        <Button type="button" onClick={addGalleryUrl} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {form.watch("galleryUrls")?.map((url: string, index: number) => (
                        <div key={`gallery-${index}`} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                          <span className="flex-1 text-sm truncate">{url}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeGalleryUrl(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="policies" className="space-y-6">
                  {/* Policies and Legal Information */}
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="cancellationPolicy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cancellation Policy</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter cancellation policy details (e.g., Free cancellation up to 24 hours before tour, 50% refund within 48 hours, etc.)" 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
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
                              placeholder="Enter detailed terms and conditions for this tour including participant requirements, safety guidelines, liability terms, etc." 
                              className="min-h-[200px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="arabic" className="space-y-6">
                  {/* Arabic Content */}
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="nameAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tour Name (Arabic)</FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل اسم الجولة بالعربية" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="descriptionAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Arabic)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="أدخل وصف الجولة بالعربية" 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="itineraryAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Itinerary (Arabic)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="أدخل برنامج الجولة بالعربية" 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Arabic Included Items */}
                    <div>
                      <Label htmlFor="included-items-ar">Included Items (Arabic)</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="أضف عنصر مشمول"
                            value={newIncludedAr}
                            onChange={(e) => setNewIncludedAr(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncludedAr())}
                          />
                          <Button type="button" onClick={addIncludedAr} variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {form.watch("includedAr")?.map((item: string, index: number) => (
                          <div key={`included-ar-${index}`} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                            <span className="flex-1 text-sm">{item}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeIncludedAr(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Arabic Excluded Items */}
                    <div>
                      <Label htmlFor="excluded-items-ar">Excluded Items (Arabic)</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="أضف عنصر غير مشمول"
                            value={newExcludedAr}
                            onChange={(e) => setNewExcludedAr(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExcludedAr())}
                          />
                          <Button type="button" onClick={addExcludedAr} variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {form.watch("excludedAr")?.map((item: string, index: number) => (
                          <div key={`excluded-ar-${index}`} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                            <span className="flex-1 text-sm">{item}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeExcludedAr(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === 'create' ? 'Create Tour' : 'Update Tour'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default UnifiedTourForm;