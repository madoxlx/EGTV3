import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import PackageLayout from "@/components/PackageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Users, Star, Phone, Mail, Clock, Edit, Share, Building, Car, FileText } from "lucide-react";
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

  const packageData = allPackages.find((pkg: ManualPackage) => pkg.id.toString() === packageId);

  const { data: destinations = [] } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
  });

  const destination = destinations.find((dest: Destination) => dest.id === packageData?.destinationId);

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
          <p className="text-gray-600 mb-4">The package you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </PackageLayout>
    );
  }

  const hasIncludedTours = packageData.selectedTourId || packageData.tourSelection;

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
      console.error('Error sharing:', error);
      toast({
        title: "Share Error",
        description: "Could not share the package",
        variant: "destructive",
      });
    }
  };

  return (
    <PackageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Manual Package</Badge>
              {packageData.featured && <Badge variant="default">Featured</Badge>}
              {destination && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {destination.name}, {destination.country}
                </Badge>
              )}
            </div>
            
            {/* Admin Edit/Share Buttons */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share className="h-4 w-4" />
                  Share
                </Button>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-2">{packageData.title}</h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {packageData.duration} days
            </div>
            {packageData.startDate && packageData.endDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(packageData.startDate).toLocaleDateString()} - {new Date(packageData.endDate).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="text-2xl font-bold text-green-600">
              {packageData.discountedPrice || packageData.price} LE
              {packageData.discountedPrice && (
                <span className="text-lg text-gray-500 line-through ml-2">
                  {packageData.price} LE
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">per person</span>
          </div>
        </div>

        {/* Main Image */}
        {packageData.imageUrl && (
          <div className="mb-8">
            <img
              src={packageData.imageUrl}
              alt={packageData.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* Enhanced Hotels & Rooms Section */}
            {packageData.selectedHotels && packageData.selectedHotels.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Accommodation Details
                  </CardTitle>
                  <CardDescription>
                    Your stay includes {packageData.selectedHotels.length} hotel{packageData.selectedHotels.length > 1 ? 's' : ''} with premium accommodations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {packageData.selectedHotels.map((hotel: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                        {/* Hotel Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                              {hotel.name?.charAt(0) || 'H'}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{hotel.name}</h3>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: hotel.stars || 5 }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  ))}
                                  {Array.from({ length: 5 - (hotel.stars || 5) }).map((_, i) => (
                                    <Star key={i + (hotel.stars || 5)} className="h-4 w-4 text-gray-300" />
                                  ))}
                                </div>
                                <span className="text-sm font-medium text-gray-600">
                                  ({hotel.stars || 5} Star Hotel)
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Hotel {index + 1}
                          </Badge>
                        </div>
                        
                        {/* Room Information */}
                        {packageData.rooms && packageData.rooms.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Available Rooms ({packageData.rooms.filter((room: any) => room.hotelId === hotel.id).length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {packageData.rooms
                                .filter((room: any) => room.hotelId === hotel.id)
                                .map((room: any, roomIndex: number) => (
                                  <div key={roomIndex} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-semibold text-gray-900">{room.type}</h5>
                                      <Badge variant="outline" className="text-green-700 border-green-300">
                                        {Math.round(room.customPrice || room.originalPrice || room.pricePerNight || 0)} LE/night
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        <span>Max: {room.maxOccupancy || 2} guests</span>
                                      </div>
                                      {room.amenities && room.amenities.length > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Star className="h-3 w-3" />
                                          <span>{room.amenities.length} amenities</span>
                                        </div>
                                      )}
                                    </div>
                                    {room.amenities && room.amenities.length > 0 && (
                                      <div className="mt-2">
                                        <div className="flex flex-wrap gap-1">
                                          {room.amenities.slice(0, 3).map((amenity: string, amenityIndex: number) => (
                                            <Badge key={amenityIndex} variant="secondary" className="text-xs">
                                              {amenity}
                                            </Badge>
                                          ))}
                                          {room.amenities.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                              +{room.amenities.length - 3} more
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
                    ))}
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
                    ${packageData.discountedPrice || packageData.price}
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
            {packageData.includedFeatures && packageData.includedFeatures.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {packageData.includedFeatures.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Excluded Features */}
            {packageData.excludedFeatures && packageData.excludedFeatures.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What's Not Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {packageData.excludedFeatures.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
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
                  <p className="text-gray-700 whitespace-pre-wrap">{packageData.transportationDetails}</p>
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
                  <span className="font-medium">{packageData.duration} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price</span>
                  <span className="font-medium text-green-600">{packageData.discountedPrice || packageData.price} LE</span>
                </div>
                {packageData.discountedPrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Original Price</span>
                    <span className="font-medium text-gray-500 line-through">{packageData.price} LE</span>
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
                  <Tabs defaultValue={`day${packageData.itinerary[0]?.day || 1}`}>
                    <TabsList className={`grid w-full text-xs sm:text-sm`} style={{gridTemplateColumns: `repeat(${packageData.itinerary.length}, minmax(0, 1fr))`}}>
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
                                <span className="font-medium text-blue-900">Accommodation</span>
                              </div>
                              <p className="text-sm text-blue-800">{day.accommodation}</p>
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
                                  <li key={actIndex} className="flex items-start gap-2 text-sm">
                                    <span className="text-blue-600 font-bold">•</span>
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
                                  <Badge key={mealIndex} variant="outline" className="text-xs">
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
                  <p className="text-gray-700 whitespace-pre-wrap">{packageData.cancellationPolicy}</p>
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
                  <p className="text-gray-700 whitespace-pre-wrap">{packageData.childrenPolicy}</p>
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
                  <p className="text-gray-700 whitespace-pre-wrap">{packageData.termsAndConditions}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Content */}
          <div className="lg:col-span-1 space-y-6">
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
                <Button className="w-full mt-4">
                  Book This Package
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PackageLayout>
  );
}