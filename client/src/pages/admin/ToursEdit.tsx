import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TourForm } from "@/components/admin/TourForm";

// Tour form schema
const tourEditSchema = z.object({
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
  // Arabic fields
  nameAr: z.string().optional(),
  descriptionAr: z.string().optional(),
  itineraryAr: z.string().optional(),
  includedAr: z.array(z.string()).optional(),
  excludedAr: z.array(z.string()).optional(),
  hasArabicVersion: z.boolean().default(false),
});

type TourFormValues = z.infer<typeof tourEditSchema>;

export default function ToursEdit() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [tourId, setTourId] = useState<number | null>(null);

  // Get tour ID from URL search params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setTourId(parseInt(id));
    } else {
      toast({
        title: "Error",
        description: "Tour ID is required",
        variant: "destructive",
      });
      setLocation('/admin/tours');
    }
  }, []);

  // Fetch existing tour data
  const { data: tour, isLoading: tourLoading } = useQuery({
    queryKey: ['/api/admin/tours', tourId],
    queryFn: () => tourId ? apiRequest(`/api/admin/tours/${tourId}`) : null,
    enabled: !!tourId,
  });

  // Fetch categories and destinations
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/admin/tour-categories'],
    queryFn: () => apiRequest('/api/admin/tour-categories'),
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ['/api/destinations'],
    queryFn: () => apiRequest('/api/destinations'),
  });

  // Initialize form with tour data
  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourEditSchema),
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
      // Arabic fields
      nameAr: "",
      descriptionAr: "",
      itineraryAr: "",
      includedAr: [],
      excludedAr: [],
      hasArabicVersion: false,
    },
  });

  // Update form when tour data is loaded
  useEffect(() => {
    if (tour) {
      form.reset({
        name: tour.name || "",
        description: tour.description || "",
        destinationId: tour.destinationId || 0,
        duration: tour.duration || 1,
        durationType: tour.durationType || "days",
        price: tour.price ? (tour.price / 100) : 0, // Convert from cents to EGP
        discountedPrice: tour.discountedPrice ? (tour.discountedPrice / 100) : 0, // Convert from cents to EGP
        maxCapacity: tour.maxCapacity || 10,
        maxGroupSize: tour.maxGroupSize || 10,
        numPassengers: tour.numPassengers || 1,
        imageUrl: tour.imageUrl || "",
        galleryUrls: tour.galleryUrls || [],
        tripType: tour.tripType || "",
        itinerary: tour.itinerary || "",
        included: Array.isArray(tour.included) ? tour.included : [],
        excluded: Array.isArray(tour.excluded) ? tour.excluded : [],
        featured: tour.featured || false,
        active: tour.active !== false,
        status: tour.status || "active",
        currency: tour.currency || "EGP",
        rating: tour.rating || 0,
        reviewCount: tour.reviewCount || 0,
        categoryId: tour.categoryId || 0,
        startDate: tour.startDate ? new Date(tour.startDate) : undefined,
        endDate: tour.endDate ? new Date(tour.endDate) : undefined,
        date: tour.date ? new Date(tour.date) : undefined,
        // Arabic fields
        nameAr: tour.nameAr || "",
        descriptionAr: tour.descriptionAr || "",
        itineraryAr: tour.itineraryAr || "",
        includedAr: Array.isArray(tour.includedAr) ? tour.includedAr : [],
        excludedAr: Array.isArray(tour.excludedAr) ? tour.excludedAr : [],
        hasArabicVersion: tour.hasArabicVersion || false,
      });
    }
  }, [tour, form]);

  // Prepare form data for submission
  const prepareFormData = (data: TourFormValues) => {
    const formData = { 
      ...data,
      price: Math.round(data.price * 100), // Convert EGP to cents
      discountedPrice: data.discountedPrice ? Math.round(data.discountedPrice * 100) : null, // Convert EGP to cents
    };
    
    // Convert arrays to proper format if they're strings
    if (formData.included && typeof formData.included === 'string') {
      try {
        formData.included = JSON.parse(formData.included);
      } catch {
        formData.included = formData.included.split('\n').filter(item => item.trim());
      }
    }
    
    if (formData.excluded && typeof formData.excluded === 'string') {
      try {
        formData.excluded = JSON.parse(formData.excluded);
      } catch {
        formData.excluded = formData.excluded.split('\n').filter(item => item.trim());
      }
    }
    
    if (formData.includedAr && typeof formData.includedAr === 'string') {
      try {
        formData.includedAr = JSON.parse(formData.includedAr);
      } catch {
        formData.includedAr = formData.includedAr.split('\n').filter(item => item.trim());
      }
    }
    
    if (formData.excludedAr && typeof formData.excludedAr === 'string') {
      try {
        formData.excludedAr = JSON.parse(formData.excludedAr);
      } catch {
        formData.excludedAr = formData.excludedAr.split('\n').filter(item => item.trim());
      }
    }
    
    return formData;
  };

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
      setLocation('/admin/tours');
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
    updateTourMutation.mutate(data);
  };

  const handleCancel = () => {
    setLocation('/admin/tours');
  };

  if (tourLoading) {
    return (
      <DashboardLayout location="/admin/tours/edit">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!tour) {
    return (
      <DashboardLayout location="/admin/tours/edit">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Tour not found</h2>
            <Button onClick={() => setLocation('/admin/tours')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tours
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout location="/admin/tours/edit">
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
              <h1 className="text-2xl font-bold">Edit Tour</h1>
              <p className="text-muted-foreground">
                Update tour details and settings
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Tour Information</CardTitle>
          </CardHeader>
          <CardContent>
            <TourForm
              form={form}
              onSubmit={onSubmit}
              isSubmitting={updateTourMutation.isPending}
              categories={categories}
              destinations={destinations}
              submitLabel="Update Tour"
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}