import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Clock, 
  Edit, 
  Eye, 
  MoreVertical, 
  Package, 
  Plus, 
  Star, 
  Trash,
  CircleSlash,
  Check,
  Loader2,
  Globe,
  Hotel
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

type Package = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountedPrice?: number;
  duration: number;
  destinationId?: number;
  imageUrl?: string;
  featured?: boolean;
  type?: string;
  inclusions?: string | string[];
  rating?: number;
  reviewCount?: number;
  slug?: string;
};

export default function ManualPackagesManagement() {
  const [location, setLocation] = useLocation();
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const filterParam = urlParams.get('filter') || 'all';
  const [selectedTab, setSelectedTab] = useState(filterParam);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [slugPackageId, setSlugPackageId] = useState<number | null>(null);
  const [slugValue, setSlugValue] = useState("");
  const { toast } = useToast();
  const { t } = useLanguage();

  // Fetch packages
  const { data: allPackages = [], isLoading } = useQuery<Package[]>({
    queryKey: ['/api/packages'],
    retry: 1,
  });

  // Filter only manual packages
  const packages = allPackages.filter(pkg => {
    // Manual packages detection logic:
    // 1. Type is explicitly "manual"
    // 2. Title starts with "MANUAL:"
    // 3. Type is "tour package" (legacy manual packages)
    // 4. Has complex structure indicating manual creation
    return pkg.type?.toLowerCase() === "manual" || 
           pkg.title?.startsWith("MANUAL:") ||
           pkg.type?.toLowerCase() === "tour package" || 
           (pkg.type === null && (pkg.description?.length > 50 || pkg.inclusions));
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/packages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete package');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
      toast({
        title: "Manual Package Deleted",
        description: "The manual package was successfully deleted",
        variant: "default",
      });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update slug mutation
  const updateSlugMutation = useMutation({
    mutationFn: async ({ id, slug }: { id: number, slug: string }) => {
      const response = await fetch(`/api/packages/${id}/slug`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update package URL');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
      toast({
        title: "URL Updated",
        description: "The package URL was successfully updated",
        variant: "default",
      });
      setSlugPackageId(null);
      setSlugValue("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter packages based on tab
  const filteredPackages = packages.filter(pkg => {
    if (selectedTab === "all") return true;
    if (selectedTab === "featured") return pkg.featured;
    return pkg.type?.toLowerCase() === selectedTab;
  });

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const handleSlugEdit = (id: number, title: string) => {
    const pkg = packages.find(p => p.id === id);
    const suggestedSlug = pkg?.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    setSlugPackageId(id);
    setSlugValue(suggestedSlug);
  };

  const confirmSlugUpdate = () => {
    if (slugPackageId && slugValue.trim()) {
      updateSlugMutation.mutate({ 
        id: slugPackageId, 
        slug: slugValue.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') 
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Hotel className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-zinc-900">Manual Packages</h1>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1" onClick={() => setLocation("/admin/packages/create-manual")}>
            <Plus size={16} />
            <span>Create Manual Package</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Tabs defaultValue={selectedTab} className="w-full" onValueChange={(value) => {
              setSelectedTab(value);
              const newParams = new URLSearchParams(window.location.search);
              if (value === 'all') {
                newParams.delete('filter');
              } else {
                newParams.set('filter', value);
              }
              const newSearch = newParams.toString();
              const newPath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
              setLocation(newPath, { replace: true });
            }}>
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="text-sm">
                All Manual Packages
              </TabsTrigger>
              <TabsTrigger value="featured" className="text-sm">
                Featured
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPackages.map((pkg) => (
                  <Card key={pkg.id} className="group hover:shadow-md transition-shadow">
                    {/* Package Image */}
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                      {pkg.imageUrl ? (
                        <img
                          src={pkg.imageUrl}
                          alt={pkg.title || 'Package image'}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200">
                          <span className="text-black font-medium">No Image</span>
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg truncate">
                            {pkg.title?.replace('MANUAL:', '') || 'Untitled Package'}
                          </CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            {pkg.description || 'No description available'}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="opacity-100 transition-opacity">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setLocation(pkg.title?.startsWith('MANUAL:') ? `/packages/manual/${pkg.id}` : `/packages/${pkg.id}`)}
                              className="gap-2"
                            >
                              <Eye size={16} />
                              View Package
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setLocation(`/admin/packages/edit-manual/${pkg.id}`)}
                              className="gap-2"
                            >
                              <Edit size={16} />
                              Edit Package
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSlugEdit(pkg.id, pkg.title)}
                              className="gap-2"
                            >
                              <Globe size={16} />
                              Edit URL
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(pkg.id)}
                              className="gap-2 text-red-600 focus:text-red-600"
                            >
                              <Trash size={16} />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{pkg.duration} days</span>
                        </div>
                        {pkg.featured && (
                          <Badge variant="secondary" className="gap-1">
                            <Star size={12} />
                            Featured
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          {pkg.discountedPrice && pkg.discountedPrice < pkg.price ? (
                            <>
                              <span className="text-sm text-muted-foreground line-through">
                                ${pkg.price}
                              </span>
                              <span className="text-lg font-semibold text-green-600">
                                ${pkg.discountedPrice}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-semibold">
                              ${pkg.price}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            Manual
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredPackages.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No manual packages found
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first manual package to get started.
                  </p>
                  <Button onClick={() => setLocation("/admin/packages/create-manual")}>
                    <Plus size={16} className="mr-2" />
                    Create Manual Package
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="featured" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPackages.filter(pkg => pkg.featured).map((pkg) => (
                  <Card key={pkg.id} className="group hover:shadow-md transition-shadow">
                    {/* Package Image */}
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                      {pkg.imageUrl ? (
                        <img
                          src={pkg.imageUrl}
                          alt={pkg.title || 'Package image'}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200">
                          <span className="text-black font-medium">No Image</span>
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg truncate">
                            {pkg.title?.replace('MANUAL:', '') || 'Untitled Package'}
                          </CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            {pkg.description || 'No description available'}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="opacity-100 transition-opacity">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setLocation(pkg.title?.startsWith('MANUAL:') ? `/packages/manual/${pkg.id}` : `/packages/${pkg.id}`)}
                              className="gap-2"
                            >
                              <Eye size={16} />
                              View Package
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setLocation(`/admin/packages/edit-manual/${pkg.id}`)}
                              className="gap-2"
                            >
                              <Edit size={16} />
                              Edit Package
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSlugEdit(pkg.id, pkg.title)}
                              className="gap-2"
                            >
                              <Globe size={16} />
                              Edit URL
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(pkg.id)}
                              className="gap-2 text-red-600 focus:text-red-600"
                            >
                              <Trash size={16} />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{pkg.duration} days</span>
                        </div>
                        <Badge variant="secondary" className="gap-1">
                          <Star size={12} />
                          Featured
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          {pkg.discountedPrice && pkg.discountedPrice < pkg.price ? (
                            <>
                              <span className="text-sm text-muted-foreground line-through">
                                ${pkg.price}
                              </span>
                              <span className="text-lg font-semibold text-green-600">
                                ${pkg.discountedPrice}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-semibold">
                              ${pkg.price}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            Manual
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredPackages.filter(pkg => pkg.featured).length === 0 && (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No featured manual packages
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Mark some manual packages as featured to see them here.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Manual Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this manual package? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Package'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Slug Edit Dialog */}
      <AlertDialog open={slugPackageId !== null} onOpenChange={() => setSlugPackageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Package URL</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new URL slug for this package. Use lowercase letters, numbers, and hyphens only.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <input
              type="text"
              value={slugValue}
              onChange={(e) => setSlugValue(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="package-url-slug"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSlugValue("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSlugUpdate}
              disabled={updateSlugMutation.isPending || !slugValue.trim()}
            >
              {updateSlugMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update URL'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}