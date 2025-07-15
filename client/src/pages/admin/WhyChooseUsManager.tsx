import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

// Schema for form validation
const whyChooseUsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  titleAr: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  descriptionAr: z.string().optional(),
  icon: z.string().optional(),
  active: z.boolean().default(true),
  orderPosition: z.number().min(0).default(0),
});

type WhyChooseUsFormData = z.infer<typeof whyChooseUsSchema>;

interface WhyChooseUsSection {
  id: number;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  icon?: string;
  active: boolean;
  orderPosition: number;
  createdAt: string;
  updatedAt: string;
}

export default function WhyChooseUsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<WhyChooseUsSection | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<WhyChooseUsFormData>({
    resolver: zodResolver(whyChooseUsSchema),
    defaultValues: {
      title: '',
      titleAr: '',
      description: '',
      descriptionAr: '',
      icon: '',
      active: true,
      orderPosition: 0,
    },
  });

  // Fetch why choose us sections
  const { data: sections = [], isLoading } = useQuery<WhyChooseUsSection[]>({
    queryKey: ['/api/why-choose-us-sections'],
    queryFn: async () => {
      const response = await fetch('/api/why-choose-us-sections');
      if (!response.ok) {
        throw new Error('Failed to fetch why choose us sections');
      }
      return response.json();
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: WhyChooseUsFormData) => {
      return apiRequest('/api/why-choose-us-sections', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/why-choose-us-sections'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: 'Success',
        description: 'Why Choose Us section created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create section',
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: WhyChooseUsFormData }) => {
      return apiRequest(`/api/why-choose-us-sections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/why-choose-us-sections'] });
      setIsDialogOpen(false);
      setEditingSection(null);
      form.reset();
      toast({
        title: 'Success',
        description: 'Why Choose Us section updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update section',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/why-choose-us-sections/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/why-choose-us-sections'] });
      toast({
        title: 'Success',
        description: 'Why Choose Us section deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete section',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (data: WhyChooseUsFormData) => {
    if (editingSection) {
      updateMutation.mutate({ id: editingSection.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (section: WhyChooseUsSection) => {
    setEditingSection(section);
    form.reset({
      title: section.title,
      titleAr: section.titleAr || '',
      description: section.description,
      descriptionAr: section.descriptionAr || '',
      icon: section.icon || '',
      active: section.active,
      orderPosition: section.orderPosition,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditingSection(null);
    form.reset({
      title: '',
      titleAr: '',
      description: '',
      descriptionAr: '',
      icon: '',
      active: true,
      orderPosition: sections.length,
    });
    setIsDialogOpen(true);
  };

  const sortedSections = [...sections].sort((a, b) => a.orderPosition - b.orderPosition);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Why Choose Us Management</h1>
        <p className="text-gray-600">
          Manage the "Why Choose Us" sections that appear on your website
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add New Section
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading sections...</div>
      ) : (
        <div className="grid gap-4">
          {sortedSections.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No "Why Choose Us" sections found.</p>
                <Button onClick={handleAddNew} className="mt-4">
                  Create Your First Section
                </Button>
              </CardContent>
            </Card>
          ) : (
            sortedSections.map((section) => (
              <Card key={section.id} className={`${!section.active ? 'opacity-50' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      {section.titleAr && (
                        <CardDescription className="text-right font-arabic mt-1">
                          {section.titleAr}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(section)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(section.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-2">{section.description}</p>
                  {section.descriptionAr && (
                    <p className="text-gray-700 text-right font-arabic mb-2">
                      {section.descriptionAr}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Order: {section.orderPosition}</span>
                    <span>Status: {section.active ? 'Active' : 'Inactive'}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSection ? 'Edit Section' : 'Add New Section'}
            </DialogTitle>
            <DialogDescription>
              {editingSection
                ? 'Update the section details below'
                : 'Create a new "Why Choose Us" section'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (English)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter section title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="titleAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (Arabic)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="أدخل عنوان القسم" 
                          {...field} 
                          dir="rtl"
                          className="font-arabic text-right"
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (English)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter section description" 
                          {...field}
                          rows={3}
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
                          placeholder="أدخل وصف القسم" 
                          {...field}
                          dir="rtl"
                          className="font-arabic text-right"
                          rows={3}
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
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <FormControl>
                        <Input placeholder="lucide-icon-name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter a Lucide icon name (e.g., "star", "check-circle")
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Position</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
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
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Show this section on the website
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

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingSection
                    ? 'Update Section'
                    : 'Create Section'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}