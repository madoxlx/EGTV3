import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Form,
  FormControl,
  FormDescription,
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
import { ArrowDownUp, ArrowUpDown, ClockIcon, Loader2, Pencil, Plus, Search, Trash2, Calendar, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Form validation schema matching database structure
const TourFormSchema = z.object({
  // Required fields
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  destinationId: z.string().transform(val => parseInt(val)).refine(val => val > 0, "Please select a destination"),
  duration: z.string().transform(val => parseInt(val)).refine(val => val > 0, "Duration must be greater than 0"),
  price: z.string().transform(val => parseFloat(val)).refine(val => val > 0, "Price must be greater than 0"),
  
  // Optional fields matching database schema
  maxCapacity: z.string().transform(val => val ? parseInt(val) : null).optional(),
  imageUrl: z.string().optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  currency: z.string().default("EGP"),
  galleryUrls: z.array(z.string()).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  tripType: z.string().optional(),
  numPassengers: z.string().transform(val => val ? parseInt(val) : null).optional(),
  discountedPrice: z.string().transform(val => val ? parseFloat(val) : null).optional(),
  included: z.string().optional(), // Will be parsed to JSON
  excluded: z.string().optional(), // Will be parsed to JSON
  itinerary: z.string().optional(),
  maxGroupSize: z.string().transform(val => val ? parseInt(val) : null).optional(),
  rating: z.string().transform(val => val ? parseFloat(val) : null).optional(),
  reviewCount: z.string().transform(val => val ? parseInt(val) : null).optional(),
  status: z.string().default("active"),
  
  // Arabic version fields
  nameAr: z.string().optional(),
  descriptionAr: z.string().optional(),
  itineraryAr: z.string().optional(),
  includedAr: z.string().optional(), // Will be parsed to JSON
  excludedAr: z.string().optional(), // Will be parsed to JSON
  hasArabicVersion: z.boolean().default(false),
  
  // Category and duration type
  categoryId: z.string().transform(val => val ? parseInt(val) : null).optional(),
  durationType: z.enum(["days", "hours"], { required_error: "Please select duration type" }),
  date: z.date().optional(),
});

type TourFormValues = z.infer<typeof TourFormSchema>;

export default function ToursManagement() {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTour, setDeletingTour] = useState<any>(null);

  // Fetch tours data
  const { data: tours = [], isLoading } = useQuery({
    queryKey: ["/api/admin/tours"],
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/tour-categories"],
  });

  // Fetch destinations
  const { data: destinations = [] } = useQuery({
    queryKey: ["/api/destinations"],
  });





  // Create form
  const form = useForm<TourFormValues>({
    resolver: zodResolver(TourFormSchema),
    defaultValues: {
      name: "",
      description: "",
      destinationId: "",
      duration: "",
      price: "",
      active: true,
      featured: false,
      currency: "EGP",
      status: "active",
      durationType: "days",
      hasArabicVersion: false,
    },
  });





  // Helper function to prepare form data for API
  const prepareFormData = (data: TourFormValues) => {
    const formData = {
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
    };
    
    // Parse JSON fields for included/excluded items
    if (formData.included) {
      try {
        formData.included = JSON.parse(formData.included);
      } catch {
        formData.included = formData.included.split('\n').filter(item => item.trim());
      }
    }
    
    if (formData.excluded) {
      try {
        formData.excluded = JSON.parse(formData.excluded);
      } catch {
        formData.excluded = formData.excluded.split('\n').filter(item => item.trim());
      }
    }
    
    if (formData.includedAr) {
      try {
        formData.includedAr = JSON.parse(formData.includedAr);
      } catch {
        formData.includedAr = formData.includedAr.split('\n').filter(item => item.trim());
      }
    }
    
    if (formData.excludedAr) {
      try {
        formData.excludedAr = JSON.parse(formData.excludedAr);
      } catch {
        formData.excludedAr = formData.excludedAr.split('\n').filter(item => item.trim());
      }
    }
    
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
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tour",
        variant: "destructive",
      });
    },
  });



  // Delete tour mutation
  const deleteTourMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/tours/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tour deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tours"] });
      setIsDeleteDialogOpen(false);
      setDeletingTour(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tour",
        variant: "destructive",
      });
    },
  });

  // Handle form submissions
  const onCreateSubmit = (data: TourFormValues) => {
    createTourMutation.mutate(data);
  };



  // Handle edit tour - navigate to dedicated edit page
  const handleEdit = (tour: any) => {
    setLocation(`/admin/tours/edit/${tour.id}`);
  };

  // Handle delete tour
  const handleDelete = (tour: any) => {
    setDeletingTour(tour);
    setIsDeleteDialogOpen(true);
  };

  // Handle view on site
  const handleViewOnSite = (tour: any) => {
    const url = `/tours/${tour.id}`;
    window.open(url, '_blank');
  };

  const confirmDelete = () => {
    if (deletingTour) {
      deleteTourMutation.mutate(deletingTour.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tours Management</h1>
          <p className="text-muted-foreground">
            Manage your tour offerings with complete CRUD operations
          </p>
        </div>
        <Button onClick={() => setLocation("/admin/tours/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tour
        </Button>
      </div>

      {/* Tours Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tours ({tours.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 text-center">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tours found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tours.map((tour: any) => {
                    const category = categories.find((cat: any) => 
                      cat.id === tour.category_id || cat.id === tour.categoryId
                    );
                    // Find destination with comprehensive type handling
                    const findDestinationById = (tour: any, destinations: any[]) => {
                      const tourDestId = tour.destination_id || tour.destinationId;
                      if (!tourDestId) return null;
                      
                      return destinations.find((dest: any) => {
                        // Convert both to numbers for comparison
                        const destId = Number(dest.id);
                        const tDestId = Number(tourDestId);
                        
                        // Check if both are valid numbers and equal
                        if (!isNaN(destId) && !isNaN(tDestId) && destId === tDestId) {
                          return true;
                        }
                        
                        // Fallback: string comparison
                        return String(dest.id) === String(tourDestId);
                      });
                    };
                    
                    const destination = findDestinationById(tour, destinations);

                    
                    // Determine duration display
                    const durationType = tour.duration_type || tour.durationType || 'days';
                    const durationValue = tour.duration || 0;
                    const durationText = durationType === 'hours' ? 
                      `${durationValue} Hour${durationValue !== 1 ? 's' : ''}` : 
                      `${durationValue} Day${durationValue !== 1 ? 's' : ''}`;
                    
                    return (
                      <TableRow key={tour.id}>
                        <TableCell className="font-mono text-sm">{tour.id}</TableCell>
                        <TableCell className="font-medium">{tour.name}</TableCell>
                        <TableCell>{category?.name || "No Category"}</TableCell>
                        <TableCell>{destination?.name || "No Destination"}</TableCell>
                        <TableCell>{((tour.price || 0) / 100).toLocaleString('en-US')} EGP</TableCell>
                        <TableCell>
                          {tour.discountedPrice ? (
                            <span className="text-green-600 font-medium">
                              {((tour.discountedPrice || 0) / 100).toLocaleString('en-US')} EGP
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>{durationText}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            tour.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {tour.active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOnSite(tour)}
                              title="View on Site"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(tour)}
                              title="Edit Tour"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(tour)}
                              title="Delete Tour"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Tour Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Tour</DialogTitle>
            <DialogDescription>
              Add a new tour with all the required details
            </DialogDescription>
          </DialogHeader>
          <TourForm
            form={form}
            onSubmit={onCreateSubmit}
            isSubmitting={createTourMutation.isPending}
            categories={categories}
            destinations={destinations}
            submitLabel="Create Tour"
          />
        </DialogContent>
      </Dialog>



      {/* Delete Tour Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tour</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingTour?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={deleteTourMutation.isPending}
            >
              {deleteTourMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Tour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Tour Form Component
interface TourFormProps {
  form: any;
  onSubmit: (data: TourFormValues) => void;
  isSubmitting: boolean;
  categories: any[];
  destinations: any[];
  submitLabel: string;
}

function TourForm({ form, onSubmit, isSubmitting, categories, destinations, submitLabel }: TourFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
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

        {/* Location and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="destinationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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

        {/* Duration and Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Duration" {...field} />
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
                <FormLabel>Duration Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Price" {...field} />
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
                  <Input type="number" step="0.01" placeholder="Discounted price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Capacity and Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="maxCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Capacity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Max capacity" {...field} />
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
                  <Input type="number" placeholder="Max group size" {...field} />
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
                  <Input type="number" placeholder="Number of passengers" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tour Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick start date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick end date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Media */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="Enter image URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tripType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trip Type</FormLabel>
                <FormControl>
                  <Input placeholder="Enter trip type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="included"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Included (one per line)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter included items, one per line" 
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
            name="excluded"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excluded (one per line)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter excluded items, one per line" 
                    className="min-h-[100px]"
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
          name="itinerary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Itinerary</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter tour itinerary" 
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
          name="itineraryAr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Itinerary (Arabic)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="أدخل برنامج الجولة بالعربية" 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Arabic Included/Excluded */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="includedAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Included (Arabic)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="أدخل العناصر المشمولة بالعربية" 
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
            name="excludedAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excluded (Arabic)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="أدخل العناصر المستثناة بالعربية" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Rating and Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="0" max="5" placeholder="Rating (0-5)" {...field} />
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
                  <Input type="number" placeholder="Number of reviews" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Status and Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <SelectItem value="draft">Draft</SelectItem>
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
                <Select onValueChange={field.onChange} value={field.value}>
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

        {/* Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active</FormLabel>
                  <FormDescription>
                    Make this tour visible to customers
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

          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Featured</FormLabel>
                  <FormDescription>
                    Highlight this tour on the homepage
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

          <FormField
            control={form.control}
            name="hasArabicVersion"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Has Arabic Version</FormLabel>
                  <FormDescription>
                    This tour has Arabic content
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

        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}