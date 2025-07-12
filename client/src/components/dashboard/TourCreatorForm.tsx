import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { queryClient, apiRequest, getQueryFn } from "@/lib/queryClient";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { AlertCircle, Calendar as CalendarIcon, Loader2, Upload, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormRequiredFieldsNote } from "./FormRequiredFieldsNote";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const tourSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  description: z.string().min(20, { message: "Description should be at least 20 characters" }),
  destinationId: z.coerce.number().positive({ message: "Please select a destination" }),
  tripType: z.string().min(1, { message: "Please select a trip type" }),
  duration: z.coerce.number().min(1, { message: "Duration is required" }),
  durationType: z.enum(["days", "hours"], { message: "Please select duration type" }),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  numPassengers: z.coerce.number().min(1, { message: "At least 1 passenger is required" }),
  price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
  discountedPrice: z.coerce.number().min(0, { message: "Discounted price must be a positive number" }).optional().nullable(),
  included: z.array(z.string()).default([]),
  excluded: z.array(z.string()).default([]),
  itinerary: z.string().min(20, { message: "Itinerary should provide sufficient details" }),
  maxGroupSize: z.coerce.number().min(1, { message: "Group size must be at least 1" }).optional().nullable(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  status: z.string().default("active"),
  imageUrl: z.string().optional(),
  galleryUrls: z.array(z.string()).optional(),
  currency: z.string().default("EGP"),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
  reviewCount: z.coerce.number().min(0).optional().nullable(),
  categoryId: z.coerce.number().positive().optional().nullable(),
  nameAr: z.string().optional(),
  descriptionAr: z.string().optional(),
  itineraryAr: z.string().optional(),
  includedAr: z.array(z.string()).optional(),
  excludedAr: z.array(z.string()).optional(),
  hasArabicVersion: z.boolean().default(false),
});

type TourFormValues = z.infer<typeof tourSchema>;

export interface TourCreatorFormProps {
  tourId?: string;
}

export function TourCreatorForm({ tourId }: TourCreatorFormProps) {
  const isEditMode = !!tourId;
  const { toast } = useToast();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [newInclusion, setNewInclusion] = useState("");
  const [newExclusion, setNewExclusion] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // All hooks defined consistently at the top
  const { data: destinations = [] } = useQuery<any[]>({
    queryKey: ['/api/destinations'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  const { data: tourCategories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery<any[]>({
    queryKey: ['/api/tour-categories'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/tour-categories');
        console.log('Raw tour categories response:', response);
        return response;
      } catch (error) {
        console.error('Error fetching tour categories:', error);
        throw error;
      }
    },
    select: (data) => {
      console.log('Processing tour categories data:', data);
      if (!Array.isArray(data)) {
        console.warn('Tour categories data is not an array:', data);
        return [];
      }
      return data
        .filter((category) => category.active)
        .map((category) => ({
          value: category.name,
          label: category.name,
          id: category.id
        }));
    }
  });

  const { data: existingTour, isLoading: tourLoading } = useQuery({
    queryKey: ['/api/tours', tourId],
    queryFn: async () => {
      if (!tourId) return null;
      try {
        // Try admin endpoint first
        const adminResult = await apiRequest('GET', `/api/admin/tours/${tourId}`);
        console.log('Admin tour data loaded:', adminResult);
        return adminResult;
      } catch (error) {
        console.log('Admin endpoint failed, trying public endpoint:', error);
        // Fallback to public endpoint
        const publicResult = await apiRequest('GET', `/api/tours/${tourId}`);
        console.log('Public tour data loaded:', publicResult);
        return publicResult;
      }
    },
    enabled: isEditMode,
  });

  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      name: "",
      description: "",
      destinationId: 0,
      tripType: "",
      duration: 1,
      durationType: "days",
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      numPassengers: 1,
      price: 0,
      discountedPrice: null,
      included: [],
      excluded: [],
      itinerary: "",
      maxGroupSize: 10,
      featured: false,
      active: true,
      status: "active",
      imageUrl: "",
      galleryUrls: [],
      currency: "EGP",
      rating: null,
      reviewCount: 0,
      categoryId: null,
      nameAr: "",
      descriptionAr: "",
      itineraryAr: "",
      includedAr: [],
      excludedAr: [],
      hasArabicVersion: false,
    },
  });

  const tourMutation = useMutation({
    mutationFn: async (data: any) => {
      setIsSubmitting(true);
      
      let imageUrl = "";
      const mainImage = images.find(img => img.isMain && img.file);
      
      if (mainImage?.file) {
        const formData = new FormData();
        formData.append('image', mainImage.file);
        
        try {
          const uploadResponse = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData,
          });
          
          const responseText = await uploadResponse.text();
          
          if (!uploadResponse.ok) {
            throw new Error('Failed to upload main image');
          }
          
          const uploadResult = JSON.parse(responseText);
          imageUrl = uploadResult.url;
          console.log('Main image upload successful:', { uploadResult, imageUrl });
          
          // Immediately update the preview with the new uploaded image
          setImages(prev => {
            const filtered = prev.filter(img => !img.isMain);
            return [...filtered, {
              id: `uploaded-main-${Date.now()}`,
              preview: formatImageUrl(imageUrl),
              isMain: true,
              file: null
            }];
          });
        } catch (error) {
          throw new Error('Failed to upload image');
        }
      }
      
      let galleryUrls: string[] = [];
      
      if (galleryImages.length > 0) {
        const galleryUploadPromises = galleryImages
          .filter(img => img.file)
          .map(async (img) => {
            if (!img.file) return null;
            
            const formData = new FormData();
            formData.append('image', img.file);
            
            try {
              const uploadResponse = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData,
              });
              
              const responseText = await uploadResponse.text();
              
              if (!uploadResponse.ok) {
                throw new Error('Failed to upload gallery image');
              }
              
              const uploadResult = JSON.parse(responseText);
              return uploadResult.url;
            } catch (error) {
              return null;
            }
          });
        
        const uploadedUrls = await Promise.all(galleryUploadPromises);
        galleryUrls = uploadedUrls.filter(Boolean) as string[];
      }
      
      // Get existing URLs only if they're proper server URLs (not blob URLs)
      const getCleanUrl = (url: string) => {
        if (!url || url.includes('blob:')) return '';
        // Fix double /uploads paths
        if (url.includes('/uploads/public/uploads/')) {
          return url.replace('/uploads/public/uploads/', '/uploads/');
        }
        if (url.includes('/public/uploads/')) {
          return url.replace('/public/uploads/', '/uploads/');
        }
        return url.startsWith('/uploads') ? url : '';
      };

      const existingImageUrl = getCleanUrl(existingTour?.imageUrl || existingTour?.image_url || '');
      
      // Get existing images that are still present in the current images state (not deleted by user)
      const currentExistingImages = images
        .filter(img => !img.file && !img.isMain && img.preview.startsWith('/uploads'))
        .map(img => getCleanUrl(img.preview))
        .filter(Boolean);

      // Also get existing gallery images from the separate gallery state
      const currentExistingGalleryImages = galleryImages
        .filter(img => !img.file && img.preview.startsWith('/uploads'))
        .map(img => getCleanUrl(img.preview))
        .filter(Boolean);

      // Combine all existing images with newly uploaded ones
      const allExistingImages = [...currentExistingImages, ...currentExistingGalleryImages];
      const combinedGalleryUrls = [...allExistingImages, ...galleryUrls].filter(Boolean);
      
      // Ensure clean URLs in final data
      const cleanImageUrl = imageUrl || existingImageUrl;
      const cleanGalleryUrls = combinedGalleryUrls;
      
      console.log('Final image data:', { 
        newImageUrl: imageUrl, 
        existingImageUrl, 
        finalImageUrl: cleanImageUrl,
        newGalleryCount: galleryUrls.length,
        existingGalleryCount: allExistingImages.length,
        totalGalleryCount: cleanGalleryUrls.length,
        combinedGallery: cleanGalleryUrls
      });

      const finalData = {
        ...data,
        imageUrl: cleanImageUrl,
        galleryUrls: cleanGalleryUrls,
        date: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        price: Math.round(data.price * 100), // Convert EGP to cents
        discountedPrice: data.discountedPrice ? Math.round(data.discountedPrice * 100) : null, // Convert EGP to cents
      };
      
      const url = isEditMode 
        ? `/api/admin/tours/${tourId}` 
        : '/api/admin/tours';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(finalData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || 'An error occurred');
        } catch (parseError) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }
      
      return await response.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tours'] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/tours/${tourId}`] });
      
      toast({
        title: t(isEditMode ? 'tour_updated' : 'tour_created'),
        description: t(isEditMode ? 'tour_updated_successfully' : 'tour_created_successfully'),
      });
      
      if (!isEditMode) {
        setLocation('/admin/tours');
      }
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  // Helper function to ensure proper image URL format
  const formatImageUrl = (url: string) => {
    if (!url) return '';
    // If URL already starts with http/https, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If URL starts with /uploads, prepend the current origin
    if (url.startsWith('/uploads')) {
      return `${window.location.origin}${url}`;
    }
    // If URL doesn't start with /, add it and prepend origin
    if (!url.startsWith('/')) {
      return `${window.location.origin}/uploads/${url}`;
    }
    return `${window.location.origin}${url}`;
  };

  useEffect(() => {
    if (existingTour && isEditMode) {
      console.log('Loading existing tour data:', { 
        tourId, 
        imageUrl: existingTour.imageUrl || existingTour.image_url,
        galleryUrls: existingTour.galleryUrls || existingTour.gallery_urls 
      });
      form.reset({
        name: existingTour.name || "",
        description: existingTour.description || "",
        destinationId: existingTour.destination_id || existingTour.destinationId || 0,
        tripType: existingTour.trip_type || existingTour.tripType || "",
        duration: existingTour.duration || 1,
        durationType: existingTour.duration_type || existingTour.durationType || "days",
        startDate: existingTour.start_date ? new Date(existingTour.start_date) : (existingTour.date ? new Date(existingTour.date) : new Date()),
        endDate: existingTour.end_date ? new Date(existingTour.end_date) : new Date(),
        numPassengers: existingTour.num_passengers || existingTour.numPassengers || 1,
        price: existingTour.price ? (existingTour.price / 100) : 0, // Convert from cents to EGP
        discountedPrice: existingTour.discounted_price ? (existingTour.discounted_price / 100) : (existingTour.discountedPrice ? (existingTour.discountedPrice / 100) : null), // Convert from cents to EGP
        included: Array.isArray(existingTour.included) ? existingTour.included : [],
        excluded: Array.isArray(existingTour.excluded) ? existingTour.excluded : [],
        itinerary: existingTour.itinerary || "",
        maxGroupSize: existingTour.max_group_size || existingTour.maxGroupSize || 10,
        featured: existingTour.featured || false,
        status: existingTour.status || "active",
        active: existingTour.active ?? true,
        categoryId: existingTour.category_id || existingTour.categoryId || null,
      });

      // Initialize images array
      let allImages: any[] = [];
      
      // Load main image
      const mainImageUrl = existingTour.image_url || existingTour.imageUrl;
      if (mainImageUrl && mainImageUrl !== '' && !mainImageUrl.includes('blob:')) {
        const formattedUrl = formatImageUrl(mainImageUrl);
        console.log('Setting existing main image:', { original: mainImageUrl, formatted: formattedUrl });
        allImages.push({
          id: 'main-existing',
          preview: formattedUrl,
          isMain: true,
          file: null
        });
      } else {
        console.log('No main image found for tour');
      }

      // Load gallery images
      const galleryUrls = existingTour.gallery_urls || existingTour.galleryUrls || [];
      if (Array.isArray(galleryUrls) && galleryUrls.length > 0) {
        const validGalleryUrls = galleryUrls.filter((url: string) => 
          url && 
          url !== '' && 
          !url.includes('blob:') && 
          (url.includes('/uploads') || url.startsWith('http'))
        );
        
        console.log('Found gallery URLs:', { total: galleryUrls.length, valid: validGalleryUrls.length, urls: validGalleryUrls });
        
        const galleryImgs = validGalleryUrls.map((url: string, index: number) => ({
          id: `gallery-existing-${index}`,
          preview: formatImageUrl(url),
          file: null,
          isMain: false
        }));
        
        allImages.push(...galleryImgs);
        console.log('Added gallery images:', galleryImgs);
        console.log('Total images to set:', allImages.length);
      } else {
        console.log('No gallery URLs found or invalid format');
      }
      
      // Set all images at once
      console.log('Setting all images:', allImages);
      setImages(allImages);
      
      // Clear gallery images state since we're using unified state
      setGalleryImages([]);
    }
  }, [existingTour, isEditMode, form]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'startDate' || name === 'endDate') {
        const startDate = value.startDate as Date;
        const endDate = value.endDate as Date;
        
        if (startDate && endDate && startDate <= endDate) {
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          form.setValue('duration', diffDays + 1);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const id = `main-${Date.now()}`;
      const preview = URL.createObjectURL(file);
      
      // Clear any existing main images and add the new one
      setImages(prev => [
        ...prev.filter(img => !img.isMain),
        { id, file, preview, isMain: true }
      ]);
      
      console.log('New main image uploaded:', { id, preview, fileName: file.name });
    }
  };

  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      const newGalleryImages = files.map((file, index) => {
        const id = `gallery-new-${Date.now()}-${index}`;
        const preview = URL.createObjectURL(file);
        console.log('New gallery image uploaded:', { id, preview, fileName: file.name });
        return { id, file, preview };
      });
      
      setGalleryImages(prev => [...prev, ...newGalleryImages]);
    }
  };

  const handleRemoveGalleryImage = (id: string) => {
    const imageToRemove = galleryImages.find(img => img.id === id);
    console.log('Removing gallery image:', { id, imageToRemove });
    
    setGalleryImages(prev => prev.filter(img => img.id !== id));
    
    // If it's a blob URL, revoke it to free memory
    if (imageToRemove?.preview && imageToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
  };

  const handleRemoveImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    console.log('Removing main/gallery image:', { id, imageToRemove });
    
    setImages(prev => prev.filter(img => img.id !== id));
    
    // If it's a blob URL, revoke it to free memory
    if (imageToRemove?.preview && imageToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
  };

  const handleAddInclusion = () => {
    if (newInclusion.trim()) {
      const currentInclusions = form.getValues().included || [];
      form.setValue('included', [...currentInclusions, newInclusion.trim()]);
      setNewInclusion("");
    }
  };

  const handleAddExclusion = () => {
    if (newExclusion.trim()) {
      const currentExclusions = form.getValues().excluded || [];
      form.setValue('excluded', [...currentExclusions, newExclusion.trim()]);
      setNewExclusion("");
    }
  };

  const removeInclusion = (index: number) => {
    const currentInclusions = form.getValues().included || [];
    form.setValue('included', currentInclusions.filter((_, i) => i !== index));
  };

  const removeExclusion = (index: number) => {
    const currentExclusions = form.getValues().excluded || [];
    form.setValue('excluded', currentExclusions.filter((_, i) => i !== index));
  };

  const onSubmit = (data: TourFormValues) => {
    tourMutation.mutate(data);
  };

  if (isEditMode && tourLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">جاري تحميل بيانات الرحلة...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {tourMutation.isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>
              {tourMutation.error?.message || `حدث خطأ أثناء ${isEditMode ? 'تحديث' : 'إنشاء'} الرحلة.`} 
            </AlertDescription>
          </Alert>
        )}
        
        <FormRequiredFieldsNote />
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">{t('tour_basic_info', 'Basic Information')}</TabsTrigger>
            <TabsTrigger value="dates">{t('tour_dates_pricing', 'Dates & Pricing')}</TabsTrigger>
            <TabsTrigger value="itinerary">{t('tour_itinerary', 'Itinerary')}</TabsTrigger>
            <TabsTrigger value="media">{t('tour_media_features', 'Media & Features')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">
                        اسم الرحلة <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="أدخل اسم الرحلة"
                        {...field}
                        className={error ? "border-red-500" : ""}
                      />
                      {error && (
                        <p className="text-red-500 text-sm mt-1">{error.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="destinationId"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Label htmlFor="destination" className="text-sm font-medium">
                        الوجهة <span className="text-red-500">*</span>
                      </Label>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || ""}>
                        <SelectTrigger className={error ? "border-red-500" : ""}>
                          <SelectValue placeholder="اختر الوجهة" />
                        </SelectTrigger>
                        <SelectContent>
                          {destinations.map((dest) => (
                            <SelectItem key={dest.id} value={dest.id.toString()}>
                              {dest.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {error && (
                        <p className="text-red-500 text-sm mt-1">{error.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="tripType"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Label htmlFor="tripType" className="text-sm font-medium">
                        نوع الرحلة <span className="text-red-500">*</span>
                      </Label>
                      <Select onValueChange={field.onChange} value={field.value || ""} disabled={categoriesLoading}>
                        <SelectTrigger className={error ? "border-red-500" : ""}>
                          <SelectValue placeholder={categoriesLoading ? "جاري التحميل..." : "اختر نوع الرحلة"} />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesLoading ? (
                            <SelectItem value="loading" disabled>جاري تحميل الفئات...</SelectItem>
                          ) : tourCategories.length > 0 ? (
                            tourCategories.map((category) => (
                              <SelectItem key={category.id} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-categories" disabled>لا توجد فئات متاحة</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {error && (
                        <p className="text-red-500 text-sm mt-1">{error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-6">
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium">
                        الوصف <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="أدخل وصف الرحلة"
                        rows={6}
                        {...field}
                        className={error ? "border-red-500" : ""}
                      />
                      {error && (
                        <p className="text-red-500 text-sm mt-1">{error.message}</p>
                      )}
                    </div>
                  )}
                />

                <div className="flex items-center space-x-4">
                  <Controller
                    name="featured"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="featured"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="featured" className="text-sm font-medium">
                          رحلة مميزة
                        </Label>
                      </div>
                    )}
                  />

                  <Controller
                    name="active"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="active" className="text-sm font-medium">
                          {field.value ? "نشط" : "غير نشط"}
                        </Label>
                      </div>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <Controller
                    name="status"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="status"
                          checked={field.value === "active"}
                          onCheckedChange={(checked) => field.onChange(checked ? "active" : "inactive")}
                        />
                        <Label htmlFor="status" className="text-sm font-medium">
                          {field.value === "active" ? "نشط" : "غير نشط"}
                        </Label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dates" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Controller
                  name="startDate"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Label className="text-sm font-medium">
                        تاريخ البداية <span className="text-red-500">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                              error && "border-red-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "اختر التاريخ"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {error && (
                        <p className="text-red-500 text-sm mt-1">{error.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="endDate"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Label className="text-sm font-medium">
                        تاريخ النهاية <span className="text-red-500">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                              error && "border-red-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "اختر التاريخ"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {error && (
                        <p className="text-red-500 text-sm mt-1">{error.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="price"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Label htmlFor="price" className="text-sm font-medium">
                        السعر ($) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="أدخل السعر"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className={error ? "border-red-500" : ""}
                      />
                      {error && (
                        <p className="text-red-500 text-sm mt-1">{error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-6">
                <Controller
                  name="durationType"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Label className="text-sm font-medium">
                        نوع المدة <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center space-x-6 mt-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="duration-days"
                            name="durationType"
                            value="days"
                            checked={field.value === "days"}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                          />
                          <Label htmlFor="duration-days" className="text-sm font-medium">
                            أيام
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="duration-hours"
                            name="durationType"
                            value="hours"
                            checked={field.value === "hours"}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                          />
                          <Label htmlFor="duration-hours" className="text-sm font-medium">
                            ساعات
                          </Label>
                        </div>
                      </div>
                      {error && (
                        <p className="text-red-500 text-sm mt-1">{error.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="duration"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Label htmlFor="duration" className="text-sm font-medium">
                        المدة ({form.watch('durationType') === 'hours' ? 'ساعات' : 'أيام'}) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        placeholder={`أدخل المدة بال${form.watch('durationType') === 'hours' ? 'ساعات' : 'أيام'}`}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className={error ? "border-red-500" : ""}
                      />
                      {error && (
                        <p className="text-red-500 text-sm mt-1">{error.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="numPassengers"
                  control={form.control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Label htmlFor="numPassengers" className="text-sm font-medium">
                        عدد المسافرين <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="numPassengers"
                        type="number"
                        min="1"
                        placeholder="أدخل عدد المسافرين"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className={error ? "border-red-500" : ""}
                      />
                      {error && (
                        <p className="text-red-500 text-sm mt-1">{error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="itinerary" className="space-y-4 pt-4">
            <Controller
              name="itinerary"
              control={form.control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label htmlFor="itinerary" className="text-sm font-medium">
                    برنامج الرحلة التفصيلي <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="itinerary"
                    placeholder="أدخل البرنامج التفصيلي للرحلة"
                    rows={10}
                    {...field}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                  )}
                </div>
              )}
            />

            <div>
              <Label className="text-sm font-medium">ما يشمله</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="أضف ما يشمله"
                  value={newInclusion}
                  onChange={(e) => setNewInclusion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddInclusion()}
                />
                <Button type="button" onClick={handleAddInclusion}>إضافة</Button>
              </div>
              <div className="mt-2 space-y-1">
                {form.watch('included')?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                    <span className="text-sm">{item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInclusion(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">ما لا يشمله</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="أضف ما لا يشمله"
                  value={newExclusion}
                  onChange={(e) => setNewExclusion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddExclusion()}
                />
                <Button type="button" onClick={handleAddExclusion}>إضافة</Button>
              </div>
              <div className="mt-2 space-y-1">
                {form.watch('excluded')?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-red-50 p-2 rounded">
                    <span className="text-sm">{item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExclusion(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4 pt-4">
            <div>
              <Label className="text-sm font-medium">الصورة الرئيسية للرحلة</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="main-image-upload"
                />
                <Label htmlFor="main-image-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">انقر لرفع الصورة الرئيسية</p>
                  </div>
                </Label>
                {images.find(img => img.isMain) && (
                  <div className="mt-4 relative">
                    <img
                      src={images.find(img => img.isMain)?.preview}
                      alt="Main tour image"
                      className="w-32 h-32 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error('Failed to load main image:', target.src);
                        target.src = '/api/placeholder/150/150';
                      }}
                      onLoad={() => console.log('Main image loaded successfully')}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => {
                        const mainImage = images.find(img => img.isMain);
                        if (mainImage) {
                          handleRemoveImage(mainImage.id);
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                {/* Show current images count for debugging */}
                {images.length > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    Current images: {images.length} (Main: {images.filter(img => img.isMain).length}, Gallery: {images.filter(img => !img.isMain).length})
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">معرض الصور</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImageUpload}
                  className="hidden"
                  id="gallery-images-upload"
                />
                <Label htmlFor="gallery-images-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">انقر لرفع صور معرض الصور</p>
                  </div>
                </Label>
                {/* Show gallery images from both states */}
                {(galleryImages.length > 0 || images.filter(img => !img.isMain).length > 0) && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">
                      Gallery Images ({galleryImages.length + images.filter(img => !img.isMain).length})
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {/* Display new gallery images from galleryImages state */}
                      {galleryImages.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.preview}
                            alt="Gallery image"
                            className="w-full h-24 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              console.error('Failed to load gallery image:', target.src);
                            }}
                            onLoad={() => console.log('Gallery image loaded successfully:', image.preview)}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => handleRemoveGalleryImage(image.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {/* Display existing gallery images from unified images state */}
                      {images.filter(img => !img.isMain).map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.preview}
                            alt="Gallery image"
                            className="w-full h-24 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              console.error('Failed to load gallery image:', target.src);
                            }}
                            onLoad={() => console.log('Gallery image loaded successfully:', image.preview)}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => handleRemoveImage(image.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation('/admin/tours')}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || tourMutation.isPending}
          >
            {isSubmitting || tourMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "جاري التحديث..." : "جاري الإنشاء..."}
              </>
            ) : isEditMode ? "تحديث الرحلة" : "إنشاء الرحلة"}
          </Button>
        </div>
      </form>
    </Form>
  );
}