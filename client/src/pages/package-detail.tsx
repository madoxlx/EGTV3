import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import PackageLayout from "@/components/PackageLayout";
import { Button } from "@/components/ui/button";
import BookPackageButton from "@/components/BookPackageButton";
import IncludedTours from "@/components/IncludedTours";
import RoomDistributionWithStars from "@/components/RoomDistributionWithStars";
import EnhancedPriceCalculation from "@/components/EnhancedPriceCalculation";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Globe,
  Users,
  MapPin,
  Star,
  Check,
  X,
  ArrowLeft,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Coffee,
  Car,
  Mountain,
  Plane,
  Utensils,
  Edit,
  ShieldCheck,
} from "lucide-react";

type Package = {
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
  type?: string;
  inclusions?: string[] | null;
  excludedItems?: string[] | null;
  rating?: number;
  reviewCount?: number;
  slug?: string;
  // Real data fields from database
  itinerary?: Array<{
    day: number;
    title: string;
    description: string;
    image?: string;
  }> | null;
  includedFeatures?: string[] | null;
  excludedFeatures?: string[] | null;
  idealFor?: string[] | null;
  bestTimeToVisit?: string | null;
  whatToPack?: Array<{
    item: string;
    icon?: string;
    tooltip?: string;
  }> | null;
  selectedTourId?: number | null;
  tourSelection?: string | null;
  // Additional package creation form fields
  selectedHotels?: any[] | null;
  rooms?: any[] | null;
};

type Destination = {
  id: number;
  name: string;
  country: string;
  description?: string;
  imageUrl?: string;
};

type User = {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
};

export default function PackageDetail() {
  const params = useParams();
  const packageSlug = params?.id; // This is actually the slug, not an ID
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // For quick info scroll functionality
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // For traveler selection in the booking form
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateMode, setDateMode] = useState<"single" | "range">("single");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [hotelPackage, setHotelPackage] = useState("standard");
  const [validationErrors, setValidationErrors] = useState<{
    date?: string;
    startDate?: string;
    endDate?: string;
    adults?: string;
    room?: string;
  }>({});

  // Check if user is authenticated and is an admin
  const { data: userData } = useQuery<User | null>({
    queryKey: ["/api/user"],
    retry: 0, // Don't retry on 401
  });

  // Fetch all packages
  const { data: allPackages = [], isLoading: isLoadingPackages } = useQuery<
    Package[]
  >({
    queryKey: ["/api/packages"],
    retry: 1,
  });

  // Find the package matching either slug or ID
  const packageData = allPackages.find((p) => {
    // First try to match by slug if it exists
    if (p.slug && p.slug === packageSlug) {
      return true;
    }
    // Then try to match by ID
    if (p.id.toString() === packageSlug) {
      return true;
    }
    return false;
  });

  // Fetch destinations to get destination info
  const { data: destinations = [], isLoading: isLoadingDestinations } =
    useQuery<Destination[]>({
      queryKey: ["/api/destinations"],
      retry: 1,
    });

  // Find the destination for this package
  const destination = packageData?.destinationId
    ? destinations.find((d) => d.id === packageData.destinationId)
    : null;

  // Detect manual packages and redirect to manual package detail page
  React.useEffect(() => {
    if (packageData && packageData.title && packageData.title.startsWith("MANUAL:")) {
      // This is a manual package, redirect to manual package detail page
      setLocation(`/packages/manual/${packageSlug}`, { replace: true });
    }
  }, [packageData, packageSlug, setLocation]);

  // Validation function
  const validateBookingForm = () => {
    const errors: { 
      date?: string; 
      startDate?: string; 
      endDate?: string; 
      adults?: string; 
      room?: string; 
    } = {};

    if (dateMode === "single") {
      if (!selectedDate) {
        errors.date = "Please select a travel date";
      }
    } else {
      if (!startDate) {
        errors.startDate = "Please select a start date";
      }
      if (!endDate) {
        errors.endDate = "Please select an end date";
      }
      if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
        errors.endDate = "End date must be after start date";
      }
    }

    if (adults === 0) {
      errors.adults = "At least 1 adult is required";
    }

    if (selectedRooms.length === 0) {
      errors.room = "Please select at least one room";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear validation errors when user interacts with form
  const clearValidationError = (field: "date" | "startDate" | "endDate" | "adults" | "room") => {
    setValidationErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  // Handler functions for traveler counts
  const handleIncrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number,
  ) => {
    setter(value + 1);
  };

  const handleDecrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number,
  ) => {
    if (value > 0) {
      setter(value - 1);
    }
  };

  // Scroll container for quick info items
  const scrollContainer = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = 250;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Update scroll buttons visibility
  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);

  // Add debugging to identify what's happening with package loading
  console.log("Package Slug:", packageSlug);
  console.log("All Packages:", allPackages);
  console.log("Package Data:", packageData);
  console.log("Is Loading Packages:", isLoadingPackages);

  // Handle if package is not found
  if (!isLoadingPackages && !packageData) {
    return (
      <PackageLayout>
        <div className="container py-12 px-4">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Package Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The package with slug "{packageSlug}" doesn't exist or has been
              removed.
            </p>
            <Button onClick={() => setLocation("/packages")} className="mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Packages
            </Button>
            <Button onClick={() => setLocation("/")} className="mr-2">
              Return Home
            </Button>
          </div>
        </div>
      </PackageLayout>
    );
  }

  // Define quick info items based on package data
  const quickInfoItems = packageData
    ? [
        {
          icon: <Calendar className="h-8 w-8 mb-2 text-primary" />,
          title: "Duration",
          desc: `${packageData.duration} Days`,
        },
        {
          icon: <Globe className="h-8 w-8 mb-2 text-primary" />,
          title: "Language",
          desc: "English, Arabic",
        },
        {
          icon: <Users className="h-8 w-8 mb-2 text-primary" />,
          title: "Group Size",
          desc: "Max 20 People",
        },
        {
          icon: <Star className="h-8 w-8 mb-2 text-primary" />,
          title: "Starting Price",
          desc: `${(packageData.discountedPrice || packageData.price).toLocaleString("en-US")} EGP`,
        },
        {
          icon: <MapPin className="h-8 w-8 mb-2 text-primary" />,
          title: "Location",
          desc: destination
            ? `${destination.name}, ${destination.country}`
            : "Multiple Locations",
        },
      ]
    : [];

  return (
    <PackageLayout>
      {isLoadingPackages ? (
        <div className="animate-pulse container py-8 px-4">
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-8 w-3/4"></div>
            </div>
            <div>
              <div className="h-64 bg-gray-200 rounded mb-4"></div>
            </div>
          </div>
        </div>
      ) : packageData ? (
        <div>
          {/* Hero Section */}
          <section className="relative h-[50vh] md:h-[60vh] flex items-center">
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: packageData.imageUrl
                  ? `url('${packageData.imageUrl}')`
                  : "url('https://images.unsplash.com/photo-1568322445389-f64ac2515099?q=80&w=2070&auto=format&fit=crop')",
              }}
            ></div>
            <div className="container relative z-20 text-white px-4 sm:px-10">
              {/* Content in semi-transparent gray box */}
              <div className="bg-gray-800/75 rounded-xl p-4 sm:p-8 max-w-2xl backdrop-blur-sm">
                {/* Breadcrumbs */}
                <div className="mb-4 sm:mb-6 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <a
                        href="/"
                        className="hover:text-primary-foreground/90 transition-colors"
                      >
                        Home
                      </a>
                      <span className="mx-2">/</span>
                      <a
                        href="/packages"
                        className="hover:text-primary-foreground/90 transition-colors"
                      >
                        Packages
                      </a>
                      <span className="mx-2">/</span>
                      <span className="font-medium">{packageData.title}</span>
                    </div>
                    {userData?.role === "admin" && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex items-center gap-1.5"
                          onClick={() => {
                            const slugUrl = prompt(
                              "Enter a friendly URL for this package:",
                              packageData.title
                                ?.toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-") || "",
                            );

                            if (slugUrl) {
                              // This would typically send a request to update the package's slug/URL
                              toast({
                                title: "URL updated",
                                description: `Package URL would be set to: ${slugUrl}`,
                              });
                            }
                          }}
                        >
                          <Globe className="h-3.5 w-3.5" />
                          <span className="text-xs">Friendly URL</span>
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex items-center gap-1.5"
                          onClick={() =>
                            window.open(
                              `/packages/${packageData.slug}`,
                              "_blank",
                            )
                          }
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span className="text-xs">View</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Admin Edit Button - Only visible to admins */}
                  {userData?.role === "admin" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-1.5"
                      onClick={() =>
                        setLocation(`/admin/packages/edit/${packageData.id}`)
                      }
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit Package</span>
                    </Button>
                  )}
                </div>

                {/* Hero content - left aligned */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-0 sm:mb-2">
                      {packageData.title}
                    </h1>
                    {userData?.role === "admin" && (
                      <Badge
                        variant="outline"
                        className="text-white border-white bg-black/30 flex items-center gap-1"
                      >
                        <ShieldCheck className="h-3 w-3" />
                        <span className="text-xs">Admin View</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl">
                    {destination
                      ? `Experience ${destination.name} with our exclusive package`
                      : "Experience the beauty of this destination with our exclusive package"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Info Bar */}
          <section className="relative bg-white mx-auto py-4 sm:py-6">
            {/* Arrows */}
            <ChevronLeft
              onClick={() => scrollContainer("left")}
              className={`absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 p-1 sm:p-2 rounded-full bg-white border shadow-md hover:bg-gray-100 cursor-pointer transition-opacity duration-300 ease-in-out ${
                canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            />

            <ChevronRight
              onClick={() => scrollContainer("right")}
              className={`absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 p-1 sm:p-2 rounded-full bg-white border shadow-md hover:bg-gray-100 cursor-pointer transition-opacity duration-300 ease-in-out ${
                canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            />

            <div
              ref={scrollRef}
              className="overflow-x-auto scrollbar-hide scroll-smooth"
            >
              <div className="flex gap-2 sm:gap-4 px-8 sm:px-12 min-w-fit">
                {quickInfoItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-36 sm:w-48 flex flex-col items-center p-3 sm:p-4 bg-white border border-[#F1F1F1] rounded-lg shadow-inner shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_0_30px_rgba(0,0,0,0.15)] transition-all duration-200 text-center"
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2">
                      {item.icon}
                    </div>
                    <h3 className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="container py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Package Overview */}
                <section className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">
                      {(packageData.selectedTourId || packageData.tourSelection) ? "Tour Overview" : "Package Overview"}
                    </h2>
                    <p className="text-neutral-700 mb-4">
                      {packageData.description}
                    </p>
                    {destination && destination.description && (
                      <p className="text-neutral-700 mb-4">
                        {destination.description}
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="bg-white border border-[#F1F1F1] p-4 rounded-lg flex flex-col items-center text-center shadow-inner shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_0_30px_rgba(0,0,0,0.15)] transition-all duration-200">
                        <Calendar className="h-6 w-6 text-primary mb-2" />
                        <h3 className="font-medium text-sm mb-1">
                          Best Time to Visit
                        </h3>
                        <p className="text-xs text-neutral-600">
                          {packageData.bestTimeToVisit ||
                            "Available year-round"}
                        </p>
                      </div>
                      <div className="bg-white border border-[#F1F1F1] p-4 rounded-lg flex flex-col items-center text-center shadow-inner shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_0_30px_rgba(0,0,0,0.15)] transition-all duration-200">
                        <Users className="h-6 w-6 text-primary mb-2" />
                        <h3 className="font-medium text-sm mb-1">Ideal For</h3>
                        <p className="text-xs text-neutral-600">
                          {packageData.idealFor &&
                          packageData.idealFor.length > 0
                            ? packageData.idealFor.join(", ")
                            : "All traveler types"}
                        </p>
                      </div>
                      <div className="bg-white border border-[#F1F1F1] p-4 rounded-lg flex flex-col items-center text-center shadow-inner shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_0_30px_rgba(0,0,0,0.15)] transition-all duration-200">
                        <Globe className="h-6 w-6 text-primary mb-2" />
                        <h3 className="font-medium text-sm mb-1">
                          What to Pack
                        </h3>
                        <p className="text-xs text-neutral-600">
                          {packageData.whatToPack &&
                          packageData.whatToPack.length > 0
                            ? packageData.whatToPack
                                .map((item) => item.item)
                                .join(", ")
                            : "Standard travel essentials"}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Itinerary Section with Tabs - Styled like sailing-cruise.tsx */}
                <section className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                      Package Itinerary
                    </h2>
                    {packageData.itinerary &&
                    packageData.itinerary.length > 0 ? (
                      <Tabs
                        defaultValue={`day${packageData.itinerary[0]?.day || 1}`}
                      >
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
                            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                              Day {day.day}: {day.title}
                            </h3>
                            <p className="text-sm sm:text-base mb-3 sm:mb-4 text-neutral-700 leading-relaxed">
                              {day.description}
                            </p>
                            {day.image && (
                              <div className="mt-3 sm:mt-4">
                                <img
                                  src={day.image}
                                  alt={day.title}
                                  className="rounded-lg h-36 sm:h-48 w-full max-w-md object-cover"
                                />
                              </div>
                            )}
                          </TabsContent>
                        ))}
                      </Tabs>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Detailed Itinerary Coming Soon
                        </h3>
                        <p className="text-gray-600">
                          Our team is preparing a comprehensive day-by-day
                          itinerary for this package. Please contact us for more
                          details about the planned activities.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* What's Included/Excluded - Real Data */}
                <section className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h2 className="text-xl font-bold mb-4">
                          What's Included
                        </h2>
                        <ul className="space-y-3">
                          {(() => {
                            // Get included features from multiple possible data sources
                            let includedItems: string[] = [];
                            
                            // Priority 1: includedFeatures array
                            if (packageData.includedFeatures && packageData.includedFeatures.length > 0) {
                              includedItems = packageData.includedFeatures;
                            }
                            // Priority 2: inclusions array
                            else if (packageData.inclusions && packageData.inclusions.length > 0) {
                              includedItems = packageData.inclusions;
                            }
                            // Priority 3: Extract from hotels and tours if available
                            else if (packageData.selectedHotels || packageData.rooms) {
                              const hotelInclusions: string[] = [];
                              if (packageData.selectedHotels && Array.isArray(packageData.selectedHotels)) {
                                hotelInclusions.push("Hotel accommodation");
                                hotelInclusions.push("Daily breakfast");
                              }
                              if (packageData.rooms && Array.isArray(packageData.rooms)) {
                                hotelInclusions.push("Room service");
                              }
                              // Add basic travel inclusions
                              hotelInclusions.push("Professional tour guide");
                              hotelInclusions.push("Transportation during tour");
                              hotelInclusions.push("Entrance fees to attractions");
                              includedItems = hotelInclusions;
                            }
                            
                            // Render included items
                            if (includedItems.length > 0) {
                              return includedItems.map((item, index) => (
                                <li key={index} className="flex items-start">
                                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{item}</span>
                                </li>
                              ));
                            }
                            
                            // Fallback when no data available
                            return (
                              <li className="flex items-center justify-center py-8">
                                <div className="text-center">
                                  <Check className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                  <p className="text-gray-500 text-sm">
                                    {userData?.role === "admin" 
                                      ? "No included features defined for this package. Edit to add inclusions."
                                      : "Inclusion details will be provided upon inquiry"}
                                  </p>
                                </div>
                              </li>
                            );
                          })()}
                        </ul>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold mb-4">
                          What's Excluded
                        </h2>
                        <ul className="space-y-3">
                          {(() => {
                            // Get excluded features from multiple possible data sources
                            let excludedItems: string[] = [];
                            
                            // Priority 1: excludedFeatures array
                            if (packageData.excludedFeatures && packageData.excludedFeatures.length > 0) {
                              excludedItems = packageData.excludedFeatures;
                            }
                            // Priority 2: excludedItems array
                            else if (packageData.excludedItems && packageData.excludedItems.length > 0) {
                              excludedItems = packageData.excludedItems;
                            }
                            // Priority 3: Add common exclusions if no data
                            else {
                              excludedItems = [
                                "International flights",
                                "Travel insurance", 
                                "Personal expenses",
                                "Tips and gratuities",
                                "Alcoholic beverages",
                                "Optional activities not mentioned",
                                "Visa fees"
                              ];
                            }
                            
                            // Render excluded items
                            if (excludedItems.length > 0) {
                              return excludedItems.map((item, index) => (
                                <li key={index} className="flex items-start">
                                  <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{item}</span>
                                </li>
                              ));
                            }
                            
                            // Fallback when no data available
                            return (
                              <li className="flex items-center justify-center py-8">
                                <div className="text-center">
                                  <X className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                  <p className="text-gray-500 text-sm">
                                    {userData?.role === "admin"
                                      ? "No excluded features defined for this package. Edit to add exclusions."
                                      : "No specific exclusions listed for this package."}
                                  </p>
                                </div>
                              </li>
                            );
                          })()}
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Photos placeholder - would be replaced with actual gallery */}
                <section
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                  id="package-gallary"
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Package Photos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {packageData.galleryUrls &&
                      packageData.galleryUrls.length > 0 ? (
                        packageData.galleryUrls.map((url, index) => (
                          <div
                            key={index}
                            className="aspect-square rounded-lg overflow-hidden"
                          >
                            <img
                              src={url}
                              alt={`${packageData.title} - ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full bg-gray-100 rounded-lg p-8 text-center">
                          <p className="text-muted-foreground">
                            Gallery images coming soon
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              {/* Booking Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  {/* Booking Form Card */}
                  <Card className="mb-6 shadow-lg border-t-4 border-t-primary">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">Book This Package</h3>

                        {/* Admin Edit Button in card */}
                        {userData?.role === "admin" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() =>
                              setLocation(
                                `/admin/packages/edit/${packageData.id}`,
                              )
                            }
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Date Selection Mode */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Travel Dates *
                          </label>
                          
                          {/* Date Mode Toggle */}
                          <div className="flex gap-2 mb-3">
                            <button
                              type="button"
                              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                dateMode === "single"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                              onClick={() => {
                                setDateMode("single");
                                setStartDate("");
                                setEndDate("");
                                clearValidationError("startDate");
                                clearValidationError("endDate");
                              }}
                            >
                              <Calendar className="w-3 h-3 inline mr-1" />
                              Single Date
                            </button>
                            <button
                              type="button"
                              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                dateMode === "range"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                              onClick={() => {
                                setDateMode("range");
                                setSelectedDate("");
                                clearValidationError("date");
                              }}
                            >
                              <Calendar className="w-3 h-3 inline mr-1" />
                              Date Range
                            </button>
                          </div>

                          {/* Single Date Input */}
                          {dateMode === "single" ? (
                            <div className="relative">
                              <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => {
                                  setSelectedDate(e.target.value);
                                  clearValidationError("date");
                                }}
                                className={`w-full rounded-md border px-3 py-2 text-sm ring-offset-background ${
                                  validationErrors.date
                                    ? "border-red-500"
                                    : "border-input"
                                }`}
                                min={new Date().toISOString().split("T")[0]}
                                placeholder="Select travel date"
                              />
                              {validationErrors.date && (
                                <p className="text-red-500 text-xs mt-1">
                                  {validationErrors.date}
                                </p>
                              )}
                            </div>
                          ) : (
                            /* Date Range Inputs */
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs text-gray-600 mb-1 block">
                                    Start Date
                                  </label>
                                  <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                      setStartDate(e.target.value);
                                      clearValidationError("startDate");
                                      // Auto-clear end date validation if start date is fixed
                                      if (validationErrors.endDate && endDate) {
                                        clearValidationError("endDate");
                                      }
                                    }}
                                    className={`w-full rounded-md border px-3 py-2 text-sm ring-offset-background ${
                                      validationErrors.startDate
                                        ? "border-red-500"
                                        : "border-input"
                                    }`}
                                    min={new Date().toISOString().split("T")[0]}
                                    placeholder="Start date"
                                  />
                                  {validationErrors.startDate && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {validationErrors.startDate}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600 mb-1 block">
                                    End Date
                                  </label>
                                  <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                      setEndDate(e.target.value);
                                      clearValidationError("endDate");
                                    }}
                                    className={`w-full rounded-md border px-3 py-2 text-sm ring-offset-background ${
                                      validationErrors.endDate
                                        ? "border-red-500"
                                        : "border-input"
                                    }`}
                                    min={startDate || new Date().toISOString().split("T")[0]}
                                    placeholder="End date"
                                  />
                                  {validationErrors.endDate && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {validationErrors.endDate}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Date Range Summary */}
                              {startDate && endDate && (
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                                  <p className="text-xs text-blue-800">
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    {(() => {
                                      const start = new Date(startDate);
                                      const end = new Date(endDate);
                                      const diffTime = Math.abs(end.getTime() - start.getTime());
                                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                      const nights = Math.max(0, diffDays - 1); // Nights = days - 1
                                      return `${diffDays} day${diffDays !== 1 ? 's' : ''}, ${nights} night${nights !== 1 ? 's' : ''} trip (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`;
                                    })()}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Travelers */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium block">
                            Travelers *
                          </label>
                          {validationErrors.adults && (
                            <p className="text-red-500 text-xs">
                              {validationErrors.adults}
                            </p>
                          )}

                          {/* Adults */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm ${adults === 0 && validationErrors.adults ? "text-red-500" : ""}`}
                            >
                              Adults (required)
                            </span>
                            <div className="flex items-center">
                              <button
                                className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted disabled:opacity-50"
                                onClick={() =>
                                  handleDecrement(setAdults, adults)
                                }
                                disabled={adults <= 0}
                              >
                                -
                              </button>
                              <span
                                className={`w-8 text-center ${adults === 0 && validationErrors.adults ? "text-red-500 font-bold" : ""}`}
                              >
                                {adults}
                              </span>
                              <button
                                className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted"
                                onClick={() => {
                                  handleIncrement(setAdults, adults);
                                  clearValidationError("adults");
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Children */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Children (2-12 yrs)</span>
                            <div className="flex items-center">
                              <button
                                className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted"
                                onClick={() =>
                                  handleDecrement(setChildren, children)
                                }
                              >
                                -
                              </button>
                              <span className="w-8 text-center">
                                {children}
                              </span>
                              <button
                                className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted"
                                onClick={() =>
                                  handleIncrement(setChildren, children)
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Infants */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Infants (0-2 yrs)</span>
                            <div className="flex items-center">
                              <button
                                className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted"
                                onClick={() =>
                                  handleDecrement(setInfants, infants)
                                }
                              >
                                -
                              </button>
                              <span className="w-8 text-center">{infants}</span>
                              <button
                                className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted"
                                onClick={() =>
                                  handleIncrement(setInfants, infants)
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Included Tours */}
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Tours Included in Package
                          </label>
                          <IncludedTours packageData={packageData} />
                        </div>

                        {/* Room Distribution with Star Ratings */}
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Room Distribution *
                          </label>
                          <RoomDistributionWithStars 
                            packageData={packageData}
                            selectedRooms={selectedRooms}
                            onRoomSelect={(rooms: string[]) => {
                              setSelectedRooms(rooms);
                              clearValidationError("room");
                            }}
                            validationError={validationErrors.room}
                          />
                        </div>

                        {/* Hotel Package */}
                        <div>
                          <label className="text-sm font-medium mb-1 block">
                            Hotel Package
                          </label>
                          <div className="space-y-2">
                            <div
                              className={`border rounded-md p-2 cursor-pointer transition-colors ${
                                hotelPackage === "standard"
                                  ? "border-primary bg-primary/10"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => setHotelPackage("standard")}
                            >
                              <div className="flex justify-between">
                                <p className="text-sm font-medium">Standard</p>
                                <p className="text-sm font-medium">
                                  {(packageData.price / 100).toLocaleString("en-US")}{" "}
                                  EGP
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                4-star accommodation
                              </p>
                            </div>
                            <div
                              className={`border rounded-md p-2 cursor-pointer transition-colors ${
                                hotelPackage === "deluxe"
                                  ? "border-primary bg-primary/10"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => setHotelPackage("deluxe")}
                            >
                              <div className="flex justify-between">
                                <p className="text-sm font-medium">Deluxe</p>
                                <p className="text-sm font-medium">
                                  {Math.round(
                                    (packageData.price / 100) * 1.3,
                                  ).toLocaleString("en-US")}{" "}
                                  EGP
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                5-star accommodation
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Enhanced Price Calculation */}
                        <EnhancedPriceCalculation 
                          packageData={packageData}
                          adults={adults}
                          children={children}
                          infants={infants}
                          hotelPackage={hotelPackage}
                          selectedRooms={selectedRooms}
                          dateMode={dateMode}
                          selectedDate={selectedDate}
                          startDate={startDate}
                          endDate={endDate}
                        />

                        <BookPackageButton
                          package={packageData}
                          className="w-full bg-primary hover:bg-primary/90 text-white"
                          onClick={() => {
                            // Validate form before booking
                            return validateBookingForm();
                          }}
                          formData={{
                            selectedDate: dateMode === "single" ? selectedDate : "",
                            startDate: dateMode === "range" ? startDate : "",
                            endDate: dateMode === "range" ? endDate : "",
                            dateMode,
                            adults,
                            children,
                            infants,
                            selectedRooms,
                            hotelPackage,
                          }}
                        />

                        <p className="text-xs text-center text-muted-foreground">
                          No payment required to book. You'll only pay when
                          finalizing your reservation.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* What's Included/Excluded - Separate box */}
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold mb-4">
                        Package Summary
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold mb-2">
                            What's Included:
                          </h4>
                          <ul className="space-y-1.5">
                            {packageData.inclusions &&
                            packageData.inclusions.length > 0 ? (
                              packageData.inclusions
                                .slice(0, 5)
                                .map((inclusion, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start text-sm"
                                  >
                                    <Check className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                                    <span>{inclusion}</span>
                                  </li>
                                ))
                            ) : (
                              <>
                                <li className="flex items-start text-sm">
                                  <Check className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                                  <span>Accommodation</span>
                                </li>
                                <li className="flex items-start text-sm">
                                  <Check className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                                  <span>Meals as per itinerary</span>
                                </li>
                                <li className="flex items-start text-sm">
                                  <Check className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                                  <span>Transportation</span>
                                </li>
                                <li className="flex items-start text-sm">
                                  <Check className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                                  <span>English-speaking guide</span>
                                </li>
                                <li className="flex items-start text-sm">
                                  <Check className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                                  <span>Entrance fees</span>
                                </li>
                              </>
                            )}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold mb-2">
                            Highlights:
                          </h4>
                          <ul className="space-y-1.5">
                            <li className="flex items-start text-sm">
                              <span className="text-primary font-bold mr-2">
                                •
                              </span>
                              <span>
                                Professional guides and quality service
                              </span>
                            </li>
                            <li className="flex items-start text-sm">
                              <span className="text-primary font-bold mr-2">
                                •
                              </span>
                              <span>Authentic local experiences</span>
                            </li>
                            <li className="flex items-start text-sm">
                              <span className="text-primary font-bold mr-2">
                                •
                              </span>
                              <span>Comfortable accommodations</span>
                            </li>
                            <li className="flex items-start text-sm">
                              <span className="text-primary font-bold mr-2">
                                •
                              </span>
                              <span>Well-planned itinerary</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Travel Tips */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold mb-4">
                        Destination Tips
                      </h3>

                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">
                              Best Time to Visit
                            </p>
                            <p className="text-xs text-muted-foreground">
                              October to April offers the most pleasant weather.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Coffee className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Local Cuisine</p>
                            <p className="text-xs text-muted-foreground">
                              Try the traditional dishes for an authentic
                              experience.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Car className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">
                              Getting Around
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Transportation is included in your package.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Mountain className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">
                              Must-See Attractions
                            </p>
                            <p className="text-xs text-muted-foreground">
                              All the major attractions are covered in your
                              itinerary.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </PackageLayout>
  );
}
