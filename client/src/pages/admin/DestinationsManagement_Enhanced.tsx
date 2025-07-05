import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Search, Edit, Trash2, Loader2, MapPin, GlobeIcon, AlertCircle, Camera, ImageIcon, Upload } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { validateForm, validateRequiredFields } from "@/lib/validateForm";
import { FormRequiredFieldsNote, FormValidationAlert } from "@/components/dashboard/FormValidationAlert";

// Interfaces matching our schema
interface Destination {
  id: number;
  name: string;
  country: string;
  countryId: number;
  cityId: number;
  description?: string;
  imageUrl?: string;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface Country {
  id: number;
  name: string;
  code: string;
}

interface City {
  id: number;
  name: string;
  countryId: number;
}

// Zod schema for destination form validation
const destinationSchema = z.object({
  name: z.string().min(1, "Destination name is required"),
  country: z.string().optional(),
  countryId: z.number().min(1, "Country is required"),
  cityId: z.number().min(1, "City is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  featured: z.boolean().default(false),
});

type DestinationFormValues = z.infer<typeof destinationSchema>;

export default function DestinationsManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [imageUploadMode, setImageUploadMode] = useState<'url' | 'upload'>('url');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Query destinations
  const { data: destinations = [], isLoading: isLoadingDestinations } = useQuery<Destination[]>({
    queryKey: ['/api/destinations'],
  });

  // Query countries
  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ['/api/admin/countries'],
  });

  // Query cities
  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ['/api/admin/cities'],
  });

  // Filter destinations based on search
  const filteredDestinations = destinations.filter(
    destination => 
      destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get filtered cities based on selected country
  const filteredCities = cities.filter(
    city => selectedCountryId ? city.countryId === selectedCountryId : true
  );

  // Destination form
  const destinationForm = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      name: "",
      country: "",
      countryId: 0,
      cityId: 0,
      description: "",
      imageUrl: "",
      featured: false,
    },
  });

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Image upload failed');
      }

      const result = await response.json();
      const imageUrl = result.url || result.imageUrl;
      
      // Update the form field with the uploaded image URL
      destinationForm.setValue('imageUrl', imageUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Create Destination Mutation
  const createDestinationMutation = useMutation({
    mutationFn: async (destination: DestinationFormValues) => {
      const response = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(destination),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create destination');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/destinations'] });
      setIsCreateDialogOpen(false);
      destinationForm.reset();
      setImageUploadMode('url');
      toast({
        title: "Success",
        description: "Destination created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update Destination Mutation - using different bypass endpoint
  const updateDestinationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DestinationFormValues }) => {
      return await apiRequest(`/admin-api/destinations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/destinations'] });
      queryClient.invalidateQueries({ queryKey: ['/admin-api/destinations'] });
      setIsEditDialogOpen(false);
      destinationForm.reset();
      setSelectedDestination(null);
      setImageUploadMode('url');
      toast({
        title: "Success",
        description: "Destination updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete Destination Mutation - using bypass endpoint
  const deleteDestinationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/admin-api/destinations/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/destinations'] });
      queryClient.invalidateQueries({ queryKey: ['/admin-api/destinations'] });
      setDeleteConfirmOpen(false);
      setSelectedDestination(null);
      toast({
        title: "Success",
        description: "Destination deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submissions
  const onCreateSubmit = (values: DestinationFormValues) => {
    // Validate required fields
    const requiredFieldsValid = validateRequiredFields(
      values,
      ['name', 'countryId', 'cityId'],
      {
        name: "Destination name",
        countryId: "Country",
        cityId: "City"
      }
    );

    if (!requiredFieldsValid.isValid) {
      toast({
        title: "Validation Error",
        description: requiredFieldsValid.message,
        variant: "destructive",
      });
      return;
    }

    createDestinationMutation.mutate(values);
  };

  const onUpdateSubmit = (values: DestinationFormValues) => {
    if (!selectedDestination) return;

    // Validate required fields
    const requiredFieldsValid = validateRequiredFields(
      values,
      ['name', 'countryId', 'cityId'],
      {
        name: "Destination name",
        countryId: "Country",
        cityId: "City"
      }
    );

    if (!requiredFieldsValid.isValid) {
      toast({
        title: "Validation Error",
        description: requiredFieldsValid.message,
        variant: "destructive",
      });
      return;
    }

    updateDestinationMutation.mutate({ 
      id: selectedDestination.id, 
      data: values 
    });
  };

  const handleEditClick = (destination: Destination) => {
    setSelectedDestination(destination);
    setSelectedCountryId(destination.countryId);
    destinationForm.reset({
      name: destination.name,
      country: destination.country,
      countryId: destination.countryId,
      cityId: destination.cityId,
      description: destination.description || "",
      imageUrl: destination.imageUrl || "",
      featured: destination.featured,
    });
    setImageUploadMode('url');
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (destination: Destination) => {
    setSelectedDestination(destination);
    setDeleteConfirmOpen(true);
  };

  // Enhanced Image Field Component
  const ImageField = ({ field, fieldId }: { field: any; fieldId: string }) => (
    <FormItem>
      <FormLabel>Destination Image</FormLabel>
      <div className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex space-x-2">
          <Button
            type="button"
            variant={imageUploadMode === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setImageUploadMode('url')}
            className="flex items-center gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Image URL
          </Button>
          <Button
            type="button"
            variant={imageUploadMode === 'upload' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setImageUploadMode('upload')}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Photo
          </Button>
        </div>

        {/* URL Input Mode */}
        {imageUploadMode === 'url' && (
          <FormControl>
            <Input 
              placeholder="Enter image URL" 
              {...field} 
            />
          </FormControl>
        )}

        {/* File Upload Mode */}
        {imageUploadMode === 'upload' && (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById(`${fieldId}-upload`)?.click()}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Choose Photo
                      </>
                    )}
                  </Button>
                  <input
                    id={`${fieldId}-upload`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Upload a photo or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, JPEG up to 10MB
                </p>
              </div>
            </div>
            {field.value && (
              <FormControl>
                <Input 
                  placeholder="Uploaded image URL will appear here" 
                  {...field} 
                  disabled
                />
              </FormControl>
            )}
          </div>
        )}

        {/* Image Preview */}
        {field.value && (
          <div className="mt-4">
            <img 
              src={field.value} 
              alt="Destination preview" 
              className="w-full h-48 object-cover rounded-lg border"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      <FormDescription>
        Choose an image URL or upload a photo for this destination
      </FormDescription>
      <FormMessage />
    </FormItem>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Destinations Management</h1>
            <p className="text-muted-foreground">
              Manage travel destinations including creation, editing, and organization.
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Destination
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        {/* Search and Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search destinations by name or country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingDestinations ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredDestinations.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No destinations found</h3>
                <p className="text-muted-foreground text-center">
                  {searchQuery ? "No destinations match your search criteria." : "Start by adding your first destination."}
                </p>
                {!searchQuery && (
                  <Button
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Destination
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredDestinations.map((destination) => (
              <Card key={destination.id} className="group hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {destination.name}
                        {destination.featured && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <GlobeIcon className="h-3 w-3" />
                        {destination.country}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditClick(destination)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(destination)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {destination.imageUrl && (
                  <CardContent className="pt-0">
                    <img
                      src={destination.imageUrl}
                      alt={destination.name}
                      className="w-full h-32 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </CardContent>
                )}
                {destination.description && (
                  <CardFooter className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {destination.description}
                    </p>
                  </CardFooter>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Create Destination Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Destination</DialogTitle>
              <DialogDescription>
                Create a new travel destination. Fill in the required information below.
              </DialogDescription>
            </DialogHeader>
            <FormRequiredFieldsNote />
            {createDestinationMutation.isError && (
              <FormValidationAlert 
                status="error" 
                title="Failed to Create Destination" 
                message={createDestinationMutation.error?.message || "An error occurred while creating the destination."}
                className="mt-3" 
              />
            )}
            <Form {...destinationForm}>
              <form onSubmit={destinationForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={destinationForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Destination Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter destination name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={destinationForm.control}
                    name="countryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Country <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            const countryId = parseInt(value);
                            field.onChange(countryId);
                            setSelectedCountryId(countryId);
                            // Reset city when country changes
                            destinationForm.setValue('cityId', 0);
                          }} 
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
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
                    control={destinationForm.control}
                    name="cityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          City <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value?.toString()}
                          disabled={!selectedCountryId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedCountryId ? "Select a city" : "Select country first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredCities.map((city) => (
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

                <FormField
                  control={destinationForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter destination description" 
                          {...field} 
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={destinationForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <ImageField field={field} fieldId="create-destination" />
                  )}
                />

                <FormField
                  control={destinationForm.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Destination</FormLabel>
                        <FormDescription>
                          Featured destinations appear prominently on the home page
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

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      destinationForm.reset();
                      setImageUploadMode('url');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createDestinationMutation.isPending}
                  >
                    {createDestinationMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Destination
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Destination Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Destination</DialogTitle>
              <DialogDescription>
                Update the destination information. Modify the fields below as needed.
              </DialogDescription>
            </DialogHeader>
            <FormRequiredFieldsNote />
            {updateDestinationMutation.isError && (
              <FormValidationAlert 
                status="error" 
                title="Failed to Update Destination" 
                message={updateDestinationMutation.error?.message || "An error occurred while updating the destination."}
                className="mt-3" 
              />
            )}
            <Form {...destinationForm}>
              <form onSubmit={destinationForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                <FormField
                  control={destinationForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Destination Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter destination name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={destinationForm.control}
                    name="countryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Country <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            const countryId = parseInt(value);
                            field.onChange(countryId);
                            setSelectedCountryId(countryId);
                            // Reset city when country changes
                            destinationForm.setValue('cityId', 0);
                          }} 
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
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
                    control={destinationForm.control}
                    name="cityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          City <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value?.toString()}
                          disabled={!selectedCountryId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedCountryId ? "Select a city" : "Select country first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredCities.map((city) => (
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

                <FormField
                  control={destinationForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter destination description" 
                          {...field} 
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={destinationForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <ImageField field={field} fieldId="edit-destination" />
                  )}
                />

                <FormField
                  control={destinationForm.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Destination</FormLabel>
                        <FormDescription>
                          Featured destinations appear prominently on the home page
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

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      destinationForm.reset();
                      setSelectedDestination(null);
                      setImageUploadMode('url');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateDestinationMutation.isPending}
                  >
                    {updateDestinationMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Destination
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Delete Destination
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedDestination?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedDestination) {
                    deleteDestinationMutation.mutate(selectedDestination.id);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteDestinationMutation.isPending}
              >
                {deleteDestinationMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}