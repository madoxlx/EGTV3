import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

// Schema for hotel form
const hotelFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  destinationId: z.coerce.number().positive("Please select a destination"),
  address: z.string().optional(),
  cityId: z.coerce.number().optional().nullable(),
  countryId: z.coerce.number().optional().nullable(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  stars: z.coerce.number().min(1).max(5).default(3),
  featured: z.boolean().default(false),
  status: z.enum(["active", "inactive"]).default("active"),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  parkingAvailable: z.boolean().default(false),
  airportTransferAvailable: z.boolean().default(false),
  wifiAvailable: z.boolean().default(false),
  petFriendly: z.boolean().default(false),
  accessibleFacilities: z.boolean().default(false),
  imageUrl: z.string().optional(),
  galleryUrls: z.array(z.string()).default([]),
});

type HotelFormValues = z.infer<typeof hotelFormSchema>;

export default function FixedHotelEditPage() {
  const [, params] = useRoute("/admin/hotels/edit/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const hotelId = params?.id;

  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);

  // Fetch hotel data
  const {
    data: hotel,
    isLoading: isLoadingHotel,
    error: hotelError,
  } = useQuery({
    queryKey: [`hotel-${hotelId}`],
    queryFn: async () => {
      const response = await fetch(`/api/admin/hotels/${hotelId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch hotel');
      const data = await response.json();
      console.log('Fetched hotel data:', data);
      return data;
    },
    enabled: !!hotelId,
  });

  // Fetch destinations
  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const response = await fetch('/api/destinations');
      if (!response.ok) throw new Error('Failed to fetch destinations');
      return response.json();
    },
  });

  // Fetch countries
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await fetch('/api/countries');
      if (!response.ok) throw new Error('Failed to fetch countries');
      return response.json();
    },
  });

  // Fetch cities
  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await fetch('/api/cities');
      if (!response.ok) throw new Error('Failed to fetch cities');
      return response.json();
    },
  });

  // Initialize form
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
      featured: false,
      status: "active",
      checkInTime: "",
      checkOutTime: "",
      parkingAvailable: false,
      airportTransferAvailable: false,
      wifiAvailable: false,
      petFriendly: false,
      accessibleFacilities: false,
      imageUrl: "",
      galleryUrls: [],
    },
  });

  // Update form when hotel data loads
  useEffect(() => {
    if (hotel) {
      console.log('Setting form data with hotel:', hotel);
      form.reset({
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
        featured: hotel.featured || false,
        status: hotel.status || "active",
        checkInTime: hotel.checkInTime || "",
        checkOutTime: hotel.checkOutTime || "",
        parkingAvailable: hotel.parkingAvailable || false,
        airportTransferAvailable: hotel.airportTransferAvailable || false,
        wifiAvailable: hotel.wifiAvailable || false,
        petFriendly: hotel.petFriendly || false,
        accessibleFacilities: hotel.accessibleFacilities || false,
        imageUrl: hotel.imageUrl || "",
        galleryUrls: hotel.galleryUrls || [],
      });
      
      if (hotel.countryId) {
        setSelectedCountryId(hotel.countryId);
      }
    }
  }, [hotel, form]);

  // Update hotel mutation
  const updateHotelMutation = useMutation({
    mutationFn: async (data: HotelFormValues) => {
      return apiRequest(`/api/admin/hotels/${hotelId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Hotel updated successfully",
        description: "The hotel information has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: [`hotel-${hotelId}`] });
      setLocation("/admin/hotels");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update hotel",
        description: error?.message || "An error occurred while updating the hotel.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: HotelFormValues) => {
    console.log('Submitting hotel update:', data);
    updateHotelMutation.mutate(data);
  };

  // Filter cities based on selected country
  const filteredCities = selectedCountryId 
    ? cities.filter((city: any) => city.countryId === selectedCountryId)
    : [];

  if (isLoadingHotel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading hotel data...</span>
      </div>
    );
  }

  if (hotelError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error loading hotel</h2>
          <p className="text-muted-foreground mb-4">
            {hotelError.message || "Failed to load hotel data"}
          </p>
          <Button onClick={() => setLocation("/admin/hotels")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hotels
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/admin/hotels")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hotels
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Hotel</h1>
            <p className="text-muted-foreground">
              Update hotel information and settings
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotel Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter hotel name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stars"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Star Rating *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stars" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <SelectItem key={star} value={star.toString()}>
                              {star} Star{star > 1 ? "s" : ""}
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
                        placeholder="Enter hotel description"
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
                name="destinationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {destinations.map((dest: any) => (
                          <SelectItem key={dest.id} value={dest.id.toString()}>
                            {dest.name}
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter hotel address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          form.setValue("cityId", null);
                        }}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country: any) => (
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

                <FormField
                  control={form.control}
                  name="cityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || ""}
                        disabled={!selectedCountryId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue 
                              placeholder={selectedCountryId ? "Select city" : "Select country first"} 
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredCities.map((city: any) => (
                            <SelectItem key={city.id} value={city.id.toString()}>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
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
                        <Input placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter website URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings & Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="checkInTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Time</FormLabel>
                      <FormControl>
                        <Input placeholder="14:00" {...field} />
                      </FormControl>
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
                        <Input placeholder="12:00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Hotel Status</h4>
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Featured Hotel</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Display this hotel as featured
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
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Amenities</h4>
                  <FormField
                    control={form.control}
                    name="wifiAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>WiFi Available</FormLabel>
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
                    name="parkingAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Parking Available</FormLabel>
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
                    name="petFriendly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Pet Friendly</FormLabel>
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
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/admin/hotels")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateHotelMutation.isPending}
            >
              {updateHotelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Hotel
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}