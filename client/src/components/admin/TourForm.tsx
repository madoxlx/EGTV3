import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useLanguage } from "@/hooks/use-language";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Plus, X, Languages } from "lucide-react";

interface TourFormProps {
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  categories: any[];
  destinations: any[];
  submitLabel: string;
  onCancel?: () => void;
}

export function TourForm({
  form,
  onSubmit,
  isSubmitting,
  categories,
  destinations,
  submitLabel,
  onCancel,
}: TourFormProps) {
  const { t } = useLanguage();
  const [isArabicDialogOpen, setIsArabicDialogOpen] = useState(false);
  const [newIncluded, setNewIncluded] = useState("");
  const [newExcluded, setNewExcluded] = useState("");
  const [newIncludedAr, setNewIncludedAr] = useState("");
  const [newExcludedAr, setNewExcludedAr] = useState("");
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

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
            name="tripType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trip Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Adventure, Cultural, Relaxation" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Tour description" rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category and Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {categories.map((category: any) => (
                      <SelectItem key={`category-${category.id}`} value={category.id.toString()}>
                        {category.name}
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
                    {destinations.map((destination: any) => (
                      <SelectItem key={`destination-${destination.id}`} value={destination.id.toString()}>
                        {destination.name}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Duration" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
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
                      <SelectValue placeholder="Select duration type" />
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
                  <Input type="number" step="0.01" placeholder="Price" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discountedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discounted Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Discounted price" {...field} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                </FormControl>
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

        {/* Capacity and Group Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="maxCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Capacity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Max capacity" {...field} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
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
                  <Input type="number" placeholder="Max group size" {...field} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
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
                  <Input type="number" placeholder="Number of passengers" {...field} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image URL */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Main Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gallery URLs */}
        <FormField
          control={form.control}
          name="galleryUrls"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gallery Images</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Image URL"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                  />
                  <Button type="button" onClick={addGalleryUrl}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {field.value && field.value.length > 0 && (
                  <div className="space-y-1">
                    {field.value.map((url: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="flex-1 text-sm truncate">{url}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGalleryUrl(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Itinerary */}
        <FormField
          control={form.control}
          name="itinerary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Itinerary</FormLabel>
              <FormControl>
                <Textarea placeholder="Detailed itinerary" rows={6} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Included Items */}
        <FormField
          control={form.control}
          name="included"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What's Included</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add included item"
                    value={newIncluded}
                    onChange={(e) => setNewIncluded(e.target.value)}
                  />
                  <Button type="button" onClick={addIncluded}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {field.value && field.value.length > 0 && (
                  <div className="space-y-1">
                    {field.value.map((item: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                        <span className="flex-1">{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIncluded(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Excluded Items */}
        <FormField
          control={form.control}
          name="excluded"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What's Not Included</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add excluded item"
                    value={newExcluded}
                    onChange={(e) => setNewExcluded(e.target.value)}
                  />
                  <Button type="button" onClick={addExcluded}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {field.value && field.value.length > 0 && (
                  <div className="space-y-1">
                    {field.value.map((item: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                        <span className="flex-1">{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExcluded(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rating and Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating (0-5)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="5" step="0.1" placeholder="4.5" {...field} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
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
                  <Input type="number" placeholder="Number of reviews" {...field} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
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
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Featured Tour</FormLabel>
                  <FormDescription>Display this tour prominently</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active</FormLabel>
                  <FormDescription>Tour is available for booking</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Arabic Version Toggle */}
        <FormField
          control={form.control}
          name="hasArabicVersion"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Arabic Version</FormLabel>
                <FormDescription>Enable Arabic language support for this tour</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Arabic Dialog Button */}
        {form.watch("hasArabicVersion") && (
          <div className="flex justify-center">
            <Dialog open={isArabicDialogOpen} onOpenChange={setIsArabicDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="gap-2">
                  <Languages className="h-4 w-4" />
                  Edit Arabic Version
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Arabic Version</DialogTitle>
                  <DialogDescription>
                    Add Arabic translations for this tour
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Arabic Name */}
                  <FormField
                    control={form.control}
                    name="nameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arabic Name</FormLabel>
                        <FormControl>
                          <Input placeholder="اسم الجولة بالعربية" {...field} dir="rtl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Arabic Description */}
                  <FormField
                    control={form.control}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arabic Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="وصف الجولة بالعربية" rows={4} {...field} dir="rtl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Arabic Itinerary */}
                  <FormField
                    control={form.control}
                    name="itineraryAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arabic Itinerary</FormLabel>
                        <FormControl>
                          <Textarea placeholder="برنامج الجولة بالعربية" rows={6} {...field} dir="rtl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Arabic Included Items */}
                  <FormField
                    control={form.control}
                    name="includedAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What's Included (Arabic)</FormLabel>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="أضف عنصر مشمول"
                              value={newIncludedAr}
                              onChange={(e) => setNewIncludedAr(e.target.value)}
                              dir="rtl"
                            />
                            <Button type="button" onClick={addIncludedAr}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {field.value && field.value.length > 0 && (
                            <div className="space-y-1">
                              {field.value.map((item: string, index: number) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                                  <span className="flex-1" dir="rtl">{item}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeIncludedAr(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Arabic Excluded Items */}
                  <FormField
                    control={form.control}
                    name="excludedAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What's Not Included (Arabic)</FormLabel>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="أضف عنصر غير مشمول"
                              value={newExcludedAr}
                              onChange={(e) => setNewExcludedAr(e.target.value)}
                              dir="rtl"
                            />
                            <Button type="button" onClick={addExcludedAr}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {field.value && field.value.length > 0 && (
                            <div className="space-y-1">
                              {field.value.map((item: string, index: number) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                                  <span className="flex-1" dir="rtl">{item}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeExcludedAr(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsArabicDialogOpen(false)}>
                    Done
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}