import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { queryClient } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import {
  FormRequiredFieldsNote,
  FormValidationAlert,
} from "@/components/dashboard/FormValidationAlert";
import {
  Home,
  Map,
  ArrowLeft,
  Loader2,
  Clock,
  Calendar,
  Plus,
  X,
  Languages,
  MapPin,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

const formSchema = z.object({
  // Basic Information
  name: z.string().min(3, "Tour name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  destinationId: z.string().min(1, "Please select a destination"),
  categoryId: z.string().optional(),

  // Duration and Timing
  duration: z.string().min(1, "Duration is required"),
  durationType: z.enum(["days", "hours"]).default("days"),

  // Pricing
  price: z.string().min(1, "Price is required"),
  currency: z.string().default("EGP"),
  discountedPrice: z.string().optional(),
  
  // Individual Pricing Rules
  adultPrice: z.string().optional(),
  childPrice: z.string().optional(),
  infantPrice: z.string().optional(),

  // Capacity and Group Size
  maxCapacity: z.string().optional(),
  maxGroupSize: z.string().optional(),
  numPassengers: z.string().optional(),

  // Content Details
  itinerary: z.string().optional(),
  included: z.array(z.string()).default([]),
  excluded: z.array(z.string()).default([]),

  // Media
  imageUrl: z.string().optional(),
  galleryUrls: z.array(z.string()).default([]),

  // Settings
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  tripType: z.string().optional(),

  // Ratings
  rating: z.string().optional(),
  reviewCount: z.string().optional(),

  // Arabic Version
  nameAr: z.string().optional(),
  descriptionAr: z.string().optional(),
  itineraryAr: z.string().optional(),
  includedAr: z.array(z.string()).default([]),
  excludedAr: z.array(z.string()).default([]),
  hasArabicVersion: z.boolean().default(false),
});

type TourFormValues = z.infer<typeof formSchema>;

export default function CreateTour() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [includedItems, setIncludedItems] = useState<string[]>([]);
  const [excludedItems, setExcludedItems] = useState<string[]>([]);
  const [includedItemsAr, setIncludedItemsAr] = useState<string[]>([]);
  const [excludedItemsAr, setExcludedItemsAr] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const form = useForm<TourFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      destinationId: "",
      categoryId: "",
      duration: "",
      durationType: "days",
      price: "",
      currency: "EGP",
      discountedPrice: "",
      adultPrice: "",
      childPrice: "",
      infantPrice: "",
      maxCapacity: "",
      maxGroupSize: "",
      numPassengers: "",
      itinerary: "",
      included: [],
      excluded: [],
      imageUrl: "",
      galleryUrls: [],
      active: true,
      featured: false,
      tripType: "",
      rating: "",
      reviewCount: "",
      nameAr: "",
      descriptionAr: "",
      itineraryAr: "",
      includedAr: [],
      excludedAr: [],
      hasArabicVersion: false,
    },
  });

  // Fetch destinations
  const destinationsQuery = useQuery({
    queryKey: ["/api/destinations"],
    queryFn: () => fetch("/api/destinations").then((res) => res.json()),
  });

  // Fetch tour categories
  const tourCategoriesQuery = useQuery({
    queryKey: ["/api/tour-categories"],
    queryFn: async () => {
      const response = await fetch("/api/tour-categories");
      if (!response.ok) {
        throw new Error("Failed to fetch tour categories");
      }
      const data = await response.json();
      console.log("Tour categories fetched:", data);
      return data;
    },
    staleTime: 0, // Always fetch fresh data
  });

  // Add debugging for tour categories
  React.useEffect(() => {
    console.log("Tour categories query state:", {
      isLoading: tourCategoriesQuery.isLoading,
      error: tourCategoriesQuery.error,
      data: tourCategoriesQuery.data,
      isSuccess: tourCategoriesQuery.isSuccess,
    });
  }, [tourCategoriesQuery.isLoading, tourCategoriesQuery.error, tourCategoriesQuery.data]);

  // Create tour mutation
  const createTourMutation = useMutation({
    mutationFn: async (data: TourFormValues) => {
      // Convert form data to proper types
      const tourData = {
        ...data,
        title: data.name, // CRITICAL FIX: Set title from name field
        destinationId: parseInt(data.destinationId),
        duration: parseInt(data.duration),
        price: Math.round(parseFloat(data.price) * 100), // Convert to cents
        maxCapacity:
          data.maxCapacity && data.maxCapacity.trim()
            ? parseInt(data.maxCapacity)
            : undefined,
        numPassengers:
          data.numPassengers && data.numPassengers.trim()
            ? parseInt(data.numPassengers)
            : undefined,
        discountedPrice:
          data.discountedPrice && data.discountedPrice.trim()
            ? Math.round(parseFloat(data.discountedPrice) * 100)
            : undefined,
        adultPrice:
          data.adultPrice && data.adultPrice.trim()
            ? Math.round(parseFloat(data.adultPrice) * 100)
            : undefined,
        childPrice:
          data.childPrice && data.childPrice.trim()
            ? Math.round(parseFloat(data.childPrice) * 100)
            : undefined,
        infantPrice:
          data.infantPrice && data.infantPrice.trim()
            ? Math.round(parseFloat(data.infantPrice) * 100)
            : undefined,
        maxGroupSize:
          data.maxGroupSize && data.maxGroupSize.trim()
            ? parseInt(data.maxGroupSize)
            : undefined,
        rating:
          data.rating && data.rating.trim()
            ? parseFloat(data.rating)
            : undefined,
        reviewCount:
          data.reviewCount && data.reviewCount.trim()
            ? parseInt(data.reviewCount)
            : undefined,
        categoryId:
          data.categoryId && data.categoryId.trim()
            ? parseInt(data.categoryId)
            : undefined,
        included: includedItems,
        excluded: excludedItems,
        includedAr: includedItemsAr,
        excludedAr: excludedItemsAr,
        gallery: galleryImages, // Send as gallery, will be processed on server
        galleryUrls: [], // Reset galleryUrls to avoid conflicts
      };

      const response = await fetch("/api/admin/tours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tourData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw error;
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tour created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tours"] });
      setLocation("/admin/tours");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.field && error?.required
          ? `Required field missing: ${error.message}`
          : error?.constraint
            ? error.message
            : error.message || "Failed to create tour";

      toast({
        title: "Error creating tour",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Helper functions for managing included/excluded items
  const addIncludedItem = (item: string) => {
    if (item.trim() && !includedItems.includes(item.trim())) {
      setIncludedItems([...includedItems, item.trim()]);
    }
  };

  const removeIncludedItem = (index: number) => {
    setIncludedItems(includedItems.filter((_, i) => i !== index));
  };

  const addExcludedItem = (item: string) => {
    if (item.trim() && !excludedItems.includes(item.trim())) {
      setExcludedItems([...excludedItems, item.trim()]);
    }
  };

  const removeExcludedItem = (index: number) => {
    setExcludedItems(excludedItems.filter((_, i) => i !== index));
  };

  const addIncludedItemAr = (item: string) => {
    if (item.trim() && !includedItemsAr.includes(item.trim())) {
      setIncludedItemsAr([...includedItemsAr, item.trim()]);
    }
  };

  const removeIncludedItemAr = (index: number) => {
    setIncludedItemsAr(includedItemsAr.filter((_, i) => i !== index));
  };

  const addExcludedItemAr = (item: string) => {
    if (item.trim() && !excludedItemsAr.includes(item.trim())) {
      setExcludedItemsAr([...excludedItemsAr, item.trim()]);
    }
  };

  const removeExcludedItemAr = (index: number) => {
    setExcludedItemsAr(excludedItemsAr.filter((_, i) => i !== index));
  };

  // Gallery image management
  const addGalleryImage = (url: string) => {
    if (url.trim() && !galleryImages.includes(url.trim())) {
      setGalleryImages([...galleryImages, url.trim()]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  // File upload handlers
  const uploadFile = async (file: File): Promise<string> => {
    // Create a unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `tour-${timestamp}-${randomId}.${extension}`;

    // Create a blob URL for immediate preview
    const blobUrl = URL.createObjectURL(file);

    // Store file info for form submission
    if (!(window as any).tempUploads) (window as any).tempUploads = [];
    (window as any).tempUploads.push({
      file,
      blobUrl,
      filename,
      originalName: file.name,
      size: file.size,
    });

    return blobUrl;
  };

  const handleMainImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingMain(true);
    try {
      const url = await uploadFile(file);
      form.setValue("imageUrl", url);
      setMainImageFile(file);
      toast({
        title: "Success",
        description: "Main image uploaded successfully",
      });
    } catch (error) {
      console.error("Main image upload error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload main image",
        variant: "destructive",
      });
    } finally {
      setUploadingMain(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    // Validate files
    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingGallery(true);
    try {
      const uploadPromises = validFiles.map((file) => uploadFile(file));
      const urls = await Promise.all(uploadPromises);

      setGalleryImages([...galleryImages, ...urls]);
      setGalleryFiles([...galleryFiles, ...validFiles]);

      toast({
        title: "Success",
        description: `${urls.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      console.error("Gallery upload error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload gallery images",
        variant: "destructive",
      });
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryFile = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
    setGalleryFiles(galleryFiles.filter((_, i) => i !== index));
  };

  const clearMainImage = () => {
    setMainImageFile(null);
    form.setValue("imageUrl", "");
  };

  const onSubmit = async (data: TourFormValues) => {
    try {
      // Convert blob URLs to proper file paths for storage
      let finalImageUrl = data.imageUrl;
      let finalGallery = [...galleryImages];

      // Handle main image
      if (data.imageUrl && data.imageUrl.startsWith("blob:")) {
        const tempFile = (window as any).tempUploads?.find(
          (upload: any) => upload.blobUrl === data.imageUrl,
        );
        if (tempFile) {
          finalImageUrl = `/uploads/${tempFile.filename}`;
        }
      }

      // Handle gallery images
      finalGallery = finalGallery.map((url) => {
        if (url.startsWith("blob:")) {
          const tempFile = (window as any).tempUploads?.find(
            (upload: any) => upload.blobUrl === url,
          );
          return tempFile ? `/uploads/${tempFile.filename}` : url;
        }
        return url;
      });

      const tourData = {
        ...data,
        imageUrl: finalImageUrl,
        gallery: finalGallery,
      };

      createTourMutation.mutate(tourData);
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit tour. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (destinationsQuery.isLoading || tourCategoriesQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin" className="flex items-center gap-1">
              <Home size={16} />
              <span>Dashboard</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/admin/tours"
              className="flex items-center gap-1"
            >
              <Map size={16} />
              <span>Tours</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <span>Create New Tour</span>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-zinc-800">{t('admin.tours.create_title', 'Create New Tour')}</h1>
          <Button
            variant="outline"
            className="gap-1"
            onClick={() => setLocation("/admin/tours")}
          >
            <ArrowLeft size={16} />
            <span>Back to Tours</span>
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormRequiredFieldsNote />

            {createTourMutation.isError && (
              <FormValidationAlert
                status="error"
                title="Tour Creation Failed"
                message={
                  createTourMutation.error?.message ||
                  "An error occurred while creating the tour."
                }
                className="mb-6"
              />
            )}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="arabic">Arabic Version</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                        name="destinationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destination *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select destination" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {destinationsQuery.data?.map((destination) => (
                                  <SelectItem
                                    key={destination.id}
                                    value={destination.id.toString()}
                                  >
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
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Category
                              <button
                                type="button"
                                onClick={() => {
                                  console.log("Refreshing categories...");
                                  tourCategoriesQuery.refetch();
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                Refresh
                              </button>
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                console.log("Category selected:", value);
                                field.onChange(value);
                              }}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {tourCategoriesQuery.isLoading ? (
                                  <SelectItem value="loading" disabled>
                                    Loading categories...
                                  </SelectItem>
                                ) : tourCategoriesQuery.error ? (
                                  <SelectItem value="error" disabled>
                                    Error loading categories: {tourCategoriesQuery.error.message}
                                  </SelectItem>
                                ) : tourCategoriesQuery.data && tourCategoriesQuery.data.length > 0 ? (
                                  tourCategoriesQuery.data.map((category) => {
                                    console.log("Rendering category:", category);
                                    return (
                                      <SelectItem
                                        key={`category-${category.id}`}
                                        value={category.id.toString()}
                                      >
                                        {category.name}
                                      </SelectItem>
                                    );
                                  })
                                ) : (
                                  <SelectItem value="no-data" disabled>
                                    No categories available (Data: {JSON.stringify(tourCategoriesQuery.data)})
                                  </SelectItem>
                                )}
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
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter detailed tour description"
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center space-x-6">
                      <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Active</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Featured</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Duration & Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="Enter duration"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="durationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="days">Days</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="EGP">EGP</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                              </SelectContent>
                            </Select>
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
                            <FormLabel>Regular Price *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Enter price"
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
                            <FormLabel>Discounted Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Enter discounted price"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator className="my-6" />
                    
                    {/* Individual Pricing Rules */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          Individual Pricing Rules
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Set specific prices for different traveler types. Leave empty to use the regular price for all.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="adultPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adult Price</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Enter adult price"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="childPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Child Price</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Enter child price"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="infantPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Infant Price</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Enter infant price"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Images & Media
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium">Main Image</Label>
                      <FormDescription className="mb-4">
                        Upload the primary image for your tour
                      </FormDescription>

                      {!mainImageFile && !form.watch("imageUrl") ? (
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                          onDrop={(e) => {
                            e.preventDefault();
                            const files = e.dataTransfer.files;
                            if (files.length > 0) {
                              handleMainImageUpload(files[0]);
                            }
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) {
                                console.log(
                                  "Selected file:",
                                  file.name,
                                  file.type,
                                  file.size,
                                );
                                handleMainImageUpload(file);
                              }
                            };
                            input.click();
                          }}
                        >
                          {uploadingMain ? (
                            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                          ) : (
                            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          )}
                          <p className="text-gray-600">
                            {uploadingMain
                              ? "Uploading..."
                              : "Click to upload or drag and drop"}
                          </p>
                          <p className="text-sm text-gray-400">
                            PNG, JPG, JPEG up to 10MB
                          </p>
                        </div>
                      ) : (
                        <div className="relative border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">
                                Main Image
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={clearMainImage}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {form.watch("imageUrl") && (
                            <div className="mt-2">
                              <img
                                src={form.watch("imageUrl")}
                                alt="Main image preview"
                                className="w-full h-48 object-cover rounded border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-sm font-medium">
                        Gallery Images
                      </Label>
                      <FormDescription className="mb-4">
                        Upload additional images to showcase your tour
                      </FormDescription>
                      t
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer mb-4"
                        onDrop={(e) => {
                          e.preventDefault();
                          const files = e.dataTransfer.files;
                          if (files.length > 0) {
                            handleGalleryUpload(files);
                          }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.multiple = true;
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files;
                            if (files) handleGalleryUpload(files);
                          };
                          input.click();
                        }}
                      >
                        {uploadingGallery ? (
                          <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />
                        ) : (
                          <Plus className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                        )}
                        <p className="text-gray-600">
                          {uploadingGallery
                            ? "Uploading..."
                            : "Click to upload or drag and drop multiple images"}
                        </p>
                        <p className="text-sm text-gray-400">
                          PNG, JPG, JPEG up to 10MB each
                        </p>
                      </div>
                      {galleryImages.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {galleryImages.map((imageUrl, index) => (
                            <div
                              key={index}
                              className="relative group border rounded-lg overflow-hidden bg-gray-50"
                            >
                              <div className="aspect-video relative">
                                <img
                                  src={imageUrl}
                                  alt={`Gallery image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeGalleryFile(index)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="p-2">
                                <p className="text-xs text-gray-500 truncate">
                                  Image {index + 1}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {galleryImages.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No gallery images uploaded yet</p>
                          <p className="text-sm">
                            Upload images to create a gallery
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Capacity & Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="maxCapacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Capacity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="Enter max capacity"
                                {...field}
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
                                min="1"
                                placeholder="Enter max group size"
                                {...field}
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
                            <FormLabel>Number of Passengers</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="Enter number of passengers"
                                {...field}
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
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating (0-5)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="5"
                                step="0.1"
                                placeholder="Enter rating"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reviewCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Review Count</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Enter review count"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Itinerary & Inclusions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="itinerary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Itinerary</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter detailed itinerary"
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium">
                          Included Items
                        </Label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add included item"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const target = e.target as HTMLInputElement;
                                  addIncludedItem(target.value);
                                  target.value = "";
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={(e) => {
                                const input = (e.target as HTMLElement)
                                  .previousElementSibling as HTMLInputElement;
                                addIncludedItem(input.value);
                                input.value = "";
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {includedItems.map((item, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="gap-1"
                              >
                                {item}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() => removeIncludedItem(index)}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Excluded Items
                        </Label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add excluded item"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const target = e.target as HTMLInputElement;
                                  addExcludedItem(target.value);
                                  target.value = "";
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={(e) => {
                                const input = (e.target as HTMLElement)
                                  .previousElementSibling as HTMLInputElement;
                                addExcludedItem(input.value);
                                input.value = "";
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {excludedItems.map((item, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="gap-1"
                              >
                                {item}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() => removeExcludedItem(index)}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="arabic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="h-5 w-5" />
                      Arabic Version
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="hasArabicVersion"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Enable Arabic Version</FormLabel>
                            <FormDescription>
                              Create an Arabic version of this tour
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch("hasArabicVersion") && (
                      <div className="space-y-4 pt-4 border-t">
                        <FormField
                          control={form.control}
                          name="nameAr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tour Name (Arabic)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="أدخل اسم الجولة"
                                  dir="rtl"
                                  {...field}
                                />
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
                                  placeholder="أدخل وصف الجولة"
                                  className="min-h-32"
                                  dir="rtl"
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
                                  placeholder="أدخل برنامج الجولة"
                                  className="min-h-32"
                                  dir="rtl"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label className="text-sm font-medium">
                              العناصر المشمولة
                            </Label>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="أضف عنصر مشمول"
                                  dir="rtl"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const target =
                                        e.target as HTMLInputElement;
                                      addIncludedItemAr(target.value);
                                      target.value = "";
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={(e) => {
                                    const input = (e.target as HTMLElement)
                                      .previousElementSibling as HTMLInputElement;
                                    addIncludedItemAr(input.value);
                                    input.value = "";
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {includedItemsAr.map((item, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="gap-1"
                                  >
                                    {item}
                                    <X
                                      className="h-3 w-3 cursor-pointer"
                                      onClick={() =>
                                        removeIncludedItemAr(index)
                                      }
                                    />
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">
                              العناصر غير المشمولة
                            </Label>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="أضف عنصر غير مشمول"
                                  dir="rtl"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const target =
                                        e.target as HTMLInputElement;
                                      addExcludedItemAr(target.value);
                                      target.value = "";
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={(e) => {
                                    const input = (e.target as HTMLElement)
                                      .previousElementSibling as HTMLInputElement;
                                    addExcludedItemAr(input.value);
                                    input.value = "";
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {excludedItemsAr.map((item, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="gap-1"
                                  >
                                    {item}
                                    <X
                                      className="h-3 w-3 cursor-pointer"
                                      onClick={() =>
                                        removeExcludedItemAr(index)
                                      }
                                    />
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Separator />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/admin/tours")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTourMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createTourMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Tour...
                  </>
                ) : (
                  "Create Tour"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
