import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ImageUploadSection } from './ImageUploadSection';
import { queryClient } from '@/lib/queryClient';

const packageFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().min(5, 'Short description must be at least 5 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  discountedPrice: z.number().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 day'),
  destinationId: z.number(),
  categoryId: z.number(),
  rating: z.number().min(1).max(5).default(4),
  currency: z.string().default('EGP'),
  type: z.string().default('Tour Package'),
  featured: z.boolean().default(false),
});

type PackageFormValues = z.infer<typeof packageFormSchema>;

interface SimplifiedPackageFormProps {
  packageId?: string;
  onSuccess?: () => void;
}

export function SimplifiedPackageForm({ packageId, onSuccess }: SimplifiedPackageFormProps) {
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!packageId;

  // Queries for form data
  const { data: destinations = [] } = useQuery({
    queryKey: ['/api/destinations'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/package-categories'],
  });

  const { data: existingPackage } = useQuery({
    queryKey: ['/api/admin/packages', packageId],
    enabled: isEditMode,
  });

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      title: '',
      description: '',
      shortDescription: '',
      price: 0,
      discountedPrice: 0,
      duration: 1,
      destinationId: 0,
      categoryId: 0,
      rating: 4,
      currency: 'EGP',
      type: 'Tour Package',
      featured: false,
    },
  });

  // Initialize form with existing data in edit mode
  React.useEffect(() => {
    if (existingPackage && isEditMode) {
      form.reset({
        title: existingPackage.title || '',
        description: existingPackage.description || '',
        shortDescription: existingPackage.shortDescription || '',
        price: existingPackage.price || 0,
        discountedPrice: existingPackage.discountedPrice || 0,
        duration: existingPackage.duration || 1,
        destinationId: existingPackage.destinationId || 0,
        categoryId: existingPackage.categoryId || 0,
        rating: existingPackage.rating || 4,
        currency: existingPackage.currency || 'EGP',
        type: existingPackage.type || 'Tour Package',
        featured: existingPackage.featured || false,
      });

      // Set existing images (only if they are uploaded images)
      if (existingPackage.imageUrl && existingPackage.imageUrl.startsWith('/uploads/')) {
        setMainImage(existingPackage.imageUrl);
      }
      
      if (existingPackage.galleryUrls && Array.isArray(existingPackage.galleryUrls)) {
        const uploadedGalleryImages = existingPackage.galleryUrls.filter(
          (url: string) => url && url.startsWith('/uploads/')
        );
        setGalleryImages(uploadedGalleryImages);
      }
    }
  }, [existingPackage, isEditMode, form]);

  // Package mutation for create/update
  const packageMutation = useMutation({
    mutationFn: async (formData: PackageFormValues) => {
      // Validate that we have uploaded images
      if (!mainImage || !mainImage.startsWith('/uploads/')) {
        throw new Error('Please upload a main image');
      }

      // Only use uploaded gallery images
      const uploadedGalleryImages = galleryImages.filter(url => url.startsWith('/uploads/'));

      const packageData = {
        ...formData,
        imageUrl: mainImage,
        galleryUrls: uploadedGalleryImages,
      };

      const url = isEditMode ? `/api/admin/packages/${packageId}` : '/api/admin/packages';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save package' }));
        throw new Error(errorData.message || 'Failed to save package');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Package ${isEditMode ? 'updated' : 'created'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/packages'] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: PackageFormValues) => {
    setIsSubmitting(true);
    try {
      await packageMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Package' : 'Create New Package'}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cairo & Pyramids Adventure" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief overview of the package..."
                            rows={3}
                            {...field} 
                          />
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
                        <FormLabel>Full Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed description of the package..."
                            rows={5}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
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
                          <FormLabel>Category *</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                          >
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

                  <div className="grid grid-cols-3 gap-4">
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
                              placeholder="Optional"
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
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (Days) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="1"
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating (1-5)</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <SelectItem key={rating} value={rating.toString()}>
                                {rating} Star{rating > 1 ? 's' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Images */}
            <div className="space-y-6">
              <ImageUploadSection
                mainImage={mainImage}
                galleryImages={galleryImages}
                onMainImageChange={setMainImage}
                onGalleryImagesChange={setGalleryImages}
                maxImages={10}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={isSubmitting || packageMutation.isPending}
              className="min-w-[150px]"
            >
              {isSubmitting || packageMutation.isPending
                ? (isEditMode ? 'Updating...' : 'Creating...')
                : (isEditMode ? 'Update Package' : 'Create Package')
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export const SimplePackageForm = SimplifiedPackageForm;