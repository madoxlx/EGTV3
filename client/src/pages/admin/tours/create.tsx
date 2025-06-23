import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Form validation schema
const TourFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  destinationId: z.string().min(1, "Please select a destination"),
  duration: z.string().min(1, "Duration is required"),
  price: z.string().min(1, "Price is required"),
  maxCapacity: z.string().optional(),
  imageUrl: z.string().optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  currency: z.string().default("EGP"),
  tripType: z.string().optional(),
  numPassengers: z.string().optional(),
  discountedPrice: z.string().optional(),
  included: z.string().optional(),
  excluded: z.string().optional(),
  itinerary: z.string().optional(),
  maxGroupSize: z.string().optional(),
  rating: z.string().optional(),
  reviewCount: z.string().optional(),
  status: z.string().default("active"),
  categoryId: z.string().optional(),
  durationType: z.enum(["days", "hours"]).default("days"),
  nameAr: z.string().optional(),
  descriptionAr: z.string().optional(),
  itineraryAr: z.string().optional(),
  includedAr: z.string().optional(),
  excludedAr: z.string().optional(),
  hasArabicVersion: z.boolean().default(false),
});

type TourFormValues = z.infer<typeof TourFormSchema>;

export default function CreateTour() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch destinations
  const { data: destinations = [] } = useQuery({
    queryKey: ["/api/destinations"],
  });

  // Fetch tour categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/tour-categories"],
  });

  // Form setup
  const form = useForm<TourFormValues>({
    resolver: zodResolver(TourFormSchema),
    defaultValues: {
      name: "",
      description: "",
      destinationId: "",
      duration: "",
      price: "",
      maxCapacity: "",
      imageUrl: "",
      active: true,
      featured: false,
      currency: "EGP",
      tripType: "",
      numPassengers: "",
      discountedPrice: "",
      included: "",
      excluded: "",
      itinerary: "",
      maxGroupSize: "",
      rating: "",
      reviewCount: "",
      status: "active",
      categoryId: "",
      durationType: "days",
      nameAr: "",
      descriptionAr: "",
      itineraryAr: "",
      includedAr: "",
      excludedAr: "",
      hasArabicVersion: false,
    },
  });

  // Create tour mutation
  const createTourMutation = useMutation({
    mutationFn: async (data: TourFormValues) => {
      // Convert form data to proper types
      const tourData = {
        ...data,
        destinationId: parseInt(data.destinationId),
        duration: parseInt(data.duration),
        price: Math.round(parseFloat(data.price) * 100), // Convert to cents
        maxCapacity: data.maxCapacity && data.maxCapacity.trim() ? parseInt(data.maxCapacity) : undefined,
        numPassengers: data.numPassengers && data.numPassengers.trim() ? parseInt(data.numPassengers) : undefined,
        discountedPrice: data.discountedPrice && data.discountedPrice.trim() ? Math.round(parseFloat(data.discountedPrice) * 100) : undefined,
        maxGroupSize: data.maxGroupSize && data.maxGroupSize.trim() ? parseInt(data.maxGroupSize) : undefined,
        rating: data.rating && data.rating.trim() ? parseFloat(data.rating) : undefined,
        reviewCount: data.reviewCount && data.reviewCount.trim() ? parseInt(data.reviewCount) : undefined,
        categoryId: data.categoryId && data.categoryId.trim() ? parseInt(data.categoryId) : undefined,
        // Parse JSON arrays for included/excluded
        included: data.included ? data.included.split('\n').filter(item => item.trim()) : null,
        excluded: data.excluded ? data.excluded.split('\n').filter(item => item.trim()) : null,
        includedAr: data.includedAr ? data.includedAr.split('\n').filter(item => item.trim()) : null,
        excludedAr: data.excludedAr ? data.excludedAr.split('\n').filter(item => item.trim()) : null,
      };

      return await apiRequest("/api/admin/tours", {
        method: "POST",
        body: JSON.stringify(tourData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tour created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tours"] });
      setLocation("/admin/tours");
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating tour",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TourFormValues) => {
    createTourMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation("/admin/tours")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tours
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Tour</h1>
          <p className="text-muted-foreground">
            Add a new tour to your travel offerings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tour Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the tour"
                            rows={4}
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
                        <FormLabel>Destination *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a destination" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {destinations.map((destination: any) => (
                              <SelectItem key={destination.id} value={destination.id.toString()}>
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
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category: any) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
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

                {/* Pricing and Duration */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Duration"
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
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
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maxCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Capacity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Max capacity"
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
                              placeholder="Max group size"
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

              {/* Additional Details */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="included"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Included Items</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter each included item on a new line"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excluded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excluded Items</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter each excluded item on a new line"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="itinerary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Itinerary</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the tour itinerary"
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status and Features */}
              <div className="flex items-center space-x-6">
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <div className="text-[13px] text-muted-foreground">
                          Tour is visible to customers
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

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured</FormLabel>
                        <div className="text-[13px] text-muted-foreground">
                          Show in featured tours section
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

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/admin/tours")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createTourMutation.isPending}>
                  {createTourMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  Create Tour
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}