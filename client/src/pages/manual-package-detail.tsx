import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import PackageLayout from "@/components/PackageLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  Calendar,
  Users,
  Star,
  Phone,
  Mail,
  Clock,
  Edit,
  Share,
  Building,
  Car,
  FileText,
  Camera,
  Trash2,
  Copy,
  Eye,
  MoreVertical,
  Settings,
  Download,
  Heart,
  Bookmark,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Simplified Package type for manual packages
type ManualPackage = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountedPrice?: number;
  duration: number;
  destinationId?: number;
  imageUrl?: string;
  galleryUrls?: string[] | null;
  featured?: boolean;
  startDate?: string;
  endDate?: string;
  selectedHotels?: any[];
  rooms?: any[];
  transportation?: string;
  includedFeatures?: string[] | null;
  excludedFeatures?: string[] | null;
  selectedTourId?: number | null;
  tourSelection?: string | null;
  customText?: string | null;
  transportationDetails?: string | null;
  cancellationPolicy?: string | null;
  childrenPolicy?: string | null;
  termsAndConditions?: string | null;
  itinerary?: {
    day: number;
    title: string;
    description: string;
    accommodation: string;
    activities: string[];
    meals: string[];
  }[];
};

type Destination = {
  id: number;
  name: string;
  country: string;
  description?: string;
  imageUrl?: string;
};

export default function ManualPackageDetail() {
  const params = useParams();
  const packageId = params?.id;
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Check if user is admin
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
  });
  const isAdmin = currentUser?.role === "admin";

  const { data: allPackages = [], isLoading } = useQuery<ManualPackage[]>({
    queryKey: ["/api/packages"],
  });

  const packageData = allPackages.find(
    (pkg: ManualPackage) => pkg.id.toString() === packageId,
  );

  // Debug package data to understand gallery structure
  console.log("Package data galleryUrls:", packageData?.galleryUrls);
  console.log("Type of galleryUrls:", typeof packageData?.galleryUrls);
  console.log("Is array?", Array.isArray(packageData?.galleryUrls));

  const { data: destinations = [] } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
  });

  const destination = destinations.find(
    (dest: Destination) => dest.id === packageData?.destinationId,
  );

  if (isLoading) {
    return (
      <PackageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </PackageLayout>
    );
  }

  if (!packageData) {
    return (
      <PackageLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Package Not Found</h1>
          <p className="text-gray-600 mb-4">
            The package you're looking for doesn't exist.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </PackageLayout>
    );
  }

  const hasIncludedTours =
    packageData.selectedTourId || packageData.tourSelection;

  // Handle edit navigation
  const handleEdit = () => {
    navigate(`/admin/packages/edit-manual/${packageId}`);
  };

  // Handle share functionality
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: packageData.title,
          text: packageData.description,
          url: window.location.href,
        });
      } else {
        // Fallback to copying URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Package link has been copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Share Error",
        description: "Could not share the package",
        variant: "destructive",
      });
    }
  };

  // Admin-only functions
  const handleDeletePackage = async () => {
    if (window.confirm("Are you sure you want to delete this package? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/admin/packages/${packageId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          toast({
            title: "Package Deleted",
            description: "Package has been successfully deleted",
          });
          navigate("/admin/packages");
        } else {
          throw new Error("Failed to delete package");
        }
      } catch (error) {
        toast({
          title: "Delete Error",
          description: "Failed to delete package",
          variant: "destructive",
        });
      }
    }
  };

  const handleDuplicatePackage = async () => {
    try {
      const response = await fetch(`/api/admin/packages/${packageId}/duplicate`, {
        method: "POST",
      });
      if (response.ok) {
        const newPackage = await response.json();
        toast({
          title: "Package Duplicated",
          description: "Package has been successfully duplicated",
        });
        navigate(`/admin/packages/edit-manual/${newPackage.id}`);
      } else {
        throw new Error("Failed to duplicate package");
      }
    } catch (error) {
      toast({
        title: "Duplicate Error",
        description: "Failed to duplicate package",
        variant: "destructive",
      });
    }
  };

  const handleToggleFeatured = async () => {
    try {
      const response = await fetch(`/api/admin/packages/${packageId}/toggle-featured`, {
        method: "PATCH",
      });
      if (response.ok) {
        toast({
          title: "Package Updated",
          description: `Package ${packageData.featured ? 'removed from' : 'added to'} featured`,
        });
        // Refresh the data
        window.location.reload();
      } else {
        throw new Error("Failed to toggle featured status");
      }
    } catch (error) {
      toast({
        title: "Update Error",
        description: "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  const handleExportPackage = async () => {
    try {
      const response = await fetch(`/api/admin/packages/${packageId}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `package-${packageData.title.replace(/\s+/g, '-').toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast({
          title: "Export Successful",
          description: "Package data has been exported",
        });
      } else {
        throw new Error("Failed to export package");
      }
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to export package data",
        variant: "destructive",
      });
    }
  };

  return (
    <PackageLayout>
      {/* Dynamic Hero Header Section */}
      <div className="relative">
        {/* Hero Background */}
        <div className="relative h-96 overflow-hidden">
          {packageData.imageUrl ? (
            <div className="absolute inset-0">
              <img
                src={`${packageData.imageUrl}?v=${packageData.updatedAt || Date.now()}`}
                alt={packageData.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700"></div>
          )}
          
          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-end">
            <div className="container mx-auto px-4 pb-8">
              {/* Admin Controls Bar */}
              {isAdmin && (
                <div className="absolute top-4 right-4 z-20">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleEdit}
                      className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                        >
                          <MoreVertical className="h-4 w-4" />
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handleShare} className="flex items-center gap-2">
                          <Share className="h-4 w-4" />
                          Share Package
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDuplicatePackage} className="flex items-center gap-2">
                          <Copy className="h-4 w-4" />
                          Duplicate Package
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleToggleFeatured} className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          {packageData.featured ? 'Remove Featured' : 'Mark Featured'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportPackage} className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Export Data
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={handleDeletePackage} 
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Package
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}

              {/* Badges and Metadata */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  Manual Package
                </Badge>
                {packageData.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {destination && (
                  <Badge variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/30 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {destination.name}, {destination.country}
                  </Badge>
                )}
                <Badge variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/30 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {packageData.duration} days
                </Badge>
              </div>

              {/* Title and Description */}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {packageData.title}
              </h1>
              
              {/* Package Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-white/90 mb-6">
                {packageData.startDate && packageData.endDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span className="text-lg">
                      {new Date(packageData.startDate).toLocaleDateString()} - {new Date(packageData.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="text-lg">Group Tour</span>
                </div>
              </div>

              {/* Price Section */}
              <div className="flex items-center gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {packageData.discountedPrice || packageData.price} LE
                    {packageData.discountedPrice && (
                      <span className="text-xl text-white/70 line-through ml-3">
                        {packageData.price} LE
                      </span>
                    )}
                  </div>
                  <p className="text-white/80 text-lg">per person</p>
                </div>
                
                {/* User Action Buttons */}
                {!isAdmin && (
                  <div className="flex items-center gap-3">
                    <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8">
                      Book Now
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                      onClick={handleShare}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Gallery */}
            {packageData.galleryUrls && packageData.galleryUrls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Package Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {packageData.galleryUrls.map(
                      (imageUrl: string, index: number) => (
                        <div
                          key={index}
                          className="aspect-square overflow-hidden rounded-lg"
                        >
                          <img
                            src={`${imageUrl}?v=${packageData.updatedAt || Date.now()}`}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = "none";
                            }}
                          />
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {hasIncludedTours ? "Tour Overview" : "Package Overview"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {packageData.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Package Itinerary */}
            {packageData.itinerary && packageData.itinerary.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Package Itinerary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs
                    defaultValue={`day${packageData.itinerary[0]?.day || 1}`}
                  >
                    <TabsList
                      className={`grid w-full text-xs sm:text-sm`}
                      style={{
                        gridTemplateColumns: `repeat(${packageData.itinerary.length}, minmax(0, 1fr))`,
                      }}
                    >
                      {packageData.itinerary.map((day, index) => (
                        <TabsTrigger key={index} value={`day${day.day}`}>
                          Day {day.day}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {packageData.itinerary.map((day, index) => (
                      <TabsContent
                        key={index}
                        value={`day${day.day}`}
                        className="p-3 sm:p-4"
                      >
                        <div className="space-y-4">
                          <h3 className="text-lg sm:text-xl font-semibold">
                            Day {day.day}: {day.title}
                          </h3>
                          {day.accommodation && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Building className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-blue-900">
                                  Accommodation
                                </span>
                              </div>
                              <p className="text-sm text-blue-800">
                                {day.accommodation}
                              </p>
                            </div>
                          )}
                          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                            {day.description}
                          </p>
                          {day.activities && day.activities.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Activities:</h4>
                              <ul className="space-y-1">
                                {day.activities.map((activity, actIndex) => (
                                  <li
                                    key={actIndex}
                                    className="flex items-start gap-2 text-sm"
                                  >
                                    <span className="text-blue-600 font-bold">
                                      •
                                    </span>
                                    <span>{activity}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {day.meals && day.meals.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Meals:</h4>
                              <div className="flex flex-wrap gap-2">
                                {day.meals.map((meal, mealIndex) => (
                                  <Badge
                                    key={mealIndex}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {meal}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Cancellation Policy */}
            {packageData.cancellationPolicy && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Cancellation Policy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {packageData.cancellationPolicy}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Children Policy */}
            {packageData.childrenPolicy && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Children Policy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {packageData.childrenPolicy}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Terms and Conditions */}
            {packageData.termsAndConditions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Terms and Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {packageData.termsAndConditions}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Hotels & Rooms Section */}
            {packageData.selectedHotels &&
              packageData.selectedHotels.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Accommodation Details
                    </CardTitle>
                    <CardDescription>
                      Your stay includes {packageData.selectedHotels.length}{" "}
                      hotel{packageData.selectedHotels.length > 1 ? "s" : ""}{" "}
                      with premium accommodations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {packageData.selectedHotels.map(
                        (hotel: any, index: number) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50"
                          >
                            {/* Hotel Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                  {hotel.name?.charAt(0) || "H"}
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {hotel.name}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      {Array.from({
                                        length: hotel.stars || 5,
                                      }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                        />
                                      ))}
                                      {Array.from({
                                        length: 5 - (hotel.stars || 5),
                                      }).map((_, i) => (
                                        <Star
                                          key={i + (hotel.stars || 5)}
                                          className="h-4 w-4 text-gray-300"
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">
                                      ({hotel.stars || 5} Star Hotel)
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-800"
                              >
                                Hotel {index + 1}
                              </Badge>
                            </div>

                            {/* Room Information */}
                            {packageData.rooms &&
                              packageData.rooms.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Available Rooms (
                                    {
                                      packageData.rooms.filter(
                                        (room: any) =>
                                          room.hotelId === hotel.id,
                                      ).length
                                    }
                                    )
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {packageData.rooms
                                      .filter(
                                        (room: any) =>
                                          room.hotelId === hotel.id,
                                      )
                                      .map((room: any, roomIndex: number) => (
                                        <div
                                          key={roomIndex}
                                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-semibold text-gray-900">
                                              {room.type}
                                            </h5>
                                            <Badge
                                              variant="outline"
                                              className="text-green-700 border-green-300"
                                            >
                                              {Math.round(
                                                room.customPrice ||
                                                  room.originalPrice ||
                                                  room.pricePerNight ||
                                                  0,
                                              )}{" "}
                                              LE/night
                                            </Badge>
                                          </div>
                                          <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                              <Users className="h-3 w-3" />
                                              <span>
                                                Max: {room.maxOccupancy || 2}{" "}
                                                guests
                                              </span>
                                            </div>
                                            {room.amenities &&
                                              room.amenities.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                  <Star className="h-3 w-3" />
                                                  <span>
                                                    {room.amenities.length}{" "}
                                                    amenities
                                                  </span>
                                                </div>
                                              )}
                                          </div>
                                          {room.amenities &&
                                            room.amenities.length > 0 && (
                                              <div className="mt-2">
                                                <div className="flex flex-wrap gap-1">
                                                  {room.amenities
                                                    .slice(0, 3)
                                                    .map(
                                                      (
                                                        amenity: string,
                                                        amenityIndex: number,
                                                      ) => (
                                                        <Badge
                                                          key={amenityIndex}
                                                          variant="secondary"
                                                          className="text-xs"
                                                        >
                                                          {amenity}
                                                        </Badge>
                                                      ),
                                                    )}
                                                  {room.amenities.length >
                                                    3 && (
                                                    <Badge
                                                      variant="secondary"
                                                      className="text-xs"
                                                    >
                                                      +
                                                      {room.amenities.length -
                                                        3}{" "}
                                                      more
                                                    </Badge>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Transportation */}
            {packageData.transportation && (
              <Card>
                <CardHeader>
                  <CardTitle>Transportation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{packageData.transportation}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle>Book This Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {packageData.discountedPrice || packageData.price} LE
                  </div>
                  <p className="text-sm text-gray-600">per person</p>
                </div>

                <Button className="w-full" size="lg">
                  Book Now
                </Button>

                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>Call Us</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custom Text Section */}
            {packageData.customText && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <p className="text-center text-sm font-medium text-blue-800">
                    {packageData.customText}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Included Features */}
            {packageData.includedFeatures &&
              packageData.includedFeatures.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>What's Included</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {packageData.includedFeatures.map(
                        (feature: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {feature}
                          </li>
                        ),
                      )}
                    </ul>
                  </CardContent>
                </Card>
              )}

            {/* Excluded Features */}
            {packageData.excludedFeatures &&
              packageData.excludedFeatures.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>What's Not Included</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {packageData.excludedFeatures.map(
                        (feature: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            {feature}
                          </li>
                        ),
                      )}
                    </ul>
                  </CardContent>
                </Card>
              )}

            {/* Transportation Details */}
            {packageData.transportationDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Transportation Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {packageData.transportationDetails}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Package Information */}
            <Card>
              <CardHeader>
                <CardTitle>Package Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="font-medium">
                    {packageData.duration} days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price</span>
                  <span className="font-medium text-green-600">
                    {packageData.discountedPrice || packageData.price} LE
                  </span>
                </div>
                {packageData.discountedPrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Original Price
                    </span>
                    <span className="font-medium text-gray-500 line-through">
                      {packageData.price} LE
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  <Badge variant="outline">Manual Package</Badge>
                </div>
                {destination && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Destination</span>
                    <span className="font-medium">{destination.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">+201152117102</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">info@egyptexpress.com</span>
                </div>
                <Button className="w-full mt-4">Contact Us</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PackageLayout>
  );
}
