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
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  Copy,
} from "lucide-react";

type Package = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountedPrice?: number;
  currency: string;
  duration: number;
  durationType?: string;
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
  // Arabic translation fields
  hasArabicVersion?: boolean;
  titleAr?: string | null;
  descriptionAr?: string | null;
  shortDescription?: string | null;
  shortDescriptionAr?: string | null;
  overview?: string | null;
  overviewAr?: string | null;
  bestTimeToVisitAr?: string | null;
  includedFeaturesAr?: string[] | null;
  excludedFeaturesAr?: string[] | null;
  idealForAr?: string[] | null;
  itineraryAr?: Array<{
    day: number;
    title: string;
    description: string;
    image?: string;
  }> | null;
  whatToPackAr?: Array<{
    item: string;
    icon?: string;
    tooltip?: string;
  }> | null;
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
  const { currentLanguage, isRTL, t } = useLanguage();

  // Helper functions to get localized content
  const getLocalizedTitle = (pkg: Package) => {
    if (currentLanguage === 'ar' && pkg.titleAr) {
      return pkg.titleAr;
    }
    return pkg.title;
  };

  const getLocalizedDescription = (pkg: Package) => {
    if (currentLanguage === 'ar' && pkg.descriptionAr) {
      return pkg.descriptionAr;
    }
    return pkg.description;
  };

  const getLocalizedShortDescription = (pkg: Package) => {
    if (currentLanguage === 'ar' && pkg.shortDescriptionAr) {
      return pkg.shortDescriptionAr;
    }
    return pkg.shortDescription;
  };

  const getLocalizedOverview = (pkg: Package) => {
    if (currentLanguage === 'ar' && pkg.overviewAr) {
      return pkg.overviewAr;
    }
    return pkg.overview;
  };

  const getLocalizedIncludedFeatures = (pkg: Package) => {
    if (currentLanguage === 'ar' && pkg.includedFeaturesAr) {
      return pkg.includedFeaturesAr;
    }
    return pkg.includedFeatures;
  };

  const getLocalizedExcludedFeatures = (pkg: Package) => {
    if (currentLanguage === 'ar' && pkg.excludedFeaturesAr) {
      return pkg.excludedFeaturesAr;
    }
    return pkg.excludedFeatures;
  };

  const getLocalizedItinerary = (pkg: Package) => {
    if (currentLanguage === 'ar' && pkg.itineraryAr) {
      return pkg.itineraryAr;
    }
    return pkg.itinerary;
  };

  const getLocalizedIdealFor = (pkg: Package) => {
    if (currentLanguage === 'ar' && pkg.idealForAr) {
      return pkg.idealForAr;
    }
    return pkg.idealFor;
  };

  const getLocalizedWhatToPack = (pkg: Package) => {
    if (currentLanguage === 'ar' && pkg.whatToPackAr) {
      return pkg.whatToPackAr;
    }
    return pkg.whatToPack;
  };

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
  const [dateMode, setDateMode] = useState<"single" | "range">("range");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  
  // For booking status management
  const [isBookingDisabled, setIsBookingDisabled] = useState(false);
  const [bookingDisabledReason, setBookingDisabledReason] = useState<string | undefined>(undefined);
  
  // Callback to handle booking status changes from RoomDistributionWithStars
  const handleBookingStatusChange = (disabled: boolean, reason?: string) => {
    setIsBookingDisabled(disabled);
    setBookingDisabledReason(reason);
  };
  const [showAvailability, setShowAvailability] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    startDate?: string;
    endDate?: string;
    adults?: string;
    room?: string;
  }>({});

  // Gallery lightbox state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Gallery helper functions
  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  const nextImage = () => {
    if (packageData?.galleryUrls && currentImageIndex < packageData.galleryUrls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isGalleryOpen) return;
      
      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'Escape') {
        closeGallery();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isGalleryOpen, currentImageIndex]);

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

  // Fetch rooms data for accurate pricing calculation (same as EnhancedPriceCalculation)
  const { data: allRooms = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/rooms"],
    retry: 1,
  });

  // Fetch tours data for accurate pricing calculation (same as EnhancedPriceCalculation)
  const { data: allTours = [] } = useQuery<any[]>({
    queryKey: ["/api/tours"],
    retry: 1,
  });

  // Detect manual packages and redirect to manual package detail page
  React.useEffect(() => {
    if (packageData && packageData.title && packageData.title.startsWith("MANUAL:")) {
      // This is a manual package, redirect to manual package detail page
      setLocation(`/packages/manual/${packageSlug}`, { replace: true });
    }
  }, [packageData, packageSlug, setLocation]);

  // Automatically set start and end dates based on package duration
  React.useEffect(() => {
    if (packageData && packageData.duration && !startDate && !endDate) {
      // Set start date to 7 days from now (default booking lead time)
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() + 7);
      
      // Set end date based on package duration
      const defaultEndDate = new Date(defaultStartDate);
      defaultEndDate.setDate(defaultEndDate.getDate() + (packageData.duration || 7));
      
      setStartDate(defaultStartDate.toISOString().split("T")[0]);
      setEndDate(defaultEndDate.toISOString().split("T")[0]);
    }
  }, [packageData, startDate, endDate]);

  // Validation function
  const validateBookingForm = () => {
    const errors: { 
      startDate?: string; 
      endDate?: string; 
      adults?: string; 
      room?: string; 
    } = {};

    if (!startDate) {
      errors.startDate = t("please_select_start_date", "Please select a start date");
    }
    if (!endDate) {
      errors.endDate = t("please_select_end_date", "Please select an end date");
    }
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      errors.endDate = t("end_date_after_start_date", "End date must be after start date");
    }

    if (adults === 0) {
      errors.adults = t("at_least_one_adult_required", "At least 1 adult is required");
    }

    if (selectedRooms.length === 0) {
      errors.room = t("please_select_at_least_one_room", "Please select at least one room");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear validation errors when user interacts with form
  const clearValidationError = (field: "startDate" | "endDate" | "adults" | "room") => {
    setValidationErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  // Handle start date change with automatic end date adjustment
  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate);
    clearValidationError("startDate");
    
    // Automatically adjust end date based on package duration
    if (newStartDate && packageData?.duration) {
      const startDateObj = new Date(newStartDate);
      const newEndDate = new Date(startDateObj);
      newEndDate.setDate(newEndDate.getDate() + packageData.duration);
      setEndDate(newEndDate.toISOString().split("T")[0]);
    }
    
    // Reset availability when dates change
    setShowAvailability(false);
    
    // Clear end date validation if it was previously invalid
    if (validationErrors.endDate && endDate) {
      clearValidationError("endDate");
    }
  };

  // Handle end date change
  const handleEndDateChange = (newEndDate: string) => {
    setEndDate(newEndDate);
    clearValidationError("endDate");
    
    // Reset availability when dates change
    setShowAvailability(false);
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

  // Handle "See Availability" button click
  const handleSeeAvailability = () => {
    // Validate travelers first
    if (adults === 0) {
      setValidationErrors({ adults: t("at_least_one_adult_required", "At least 1 adult is required") });
      return;
    }
    setShowAvailability(true);
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
            <h1 className="text-3xl font-bold mb-4">{t("package_not_found", "Package Not Found")}</h1>
            <p className="text-muted-foreground mb-8">
{t("package_not_exist_or_removed", `The package with slug "${packageSlug}" doesn't exist or has been removed.`)}
            </p>
            <Button onClick={() => setLocation("/packages")} className="mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
{t("back_to_packages", "Back to Packages")}
            </Button>
            <Button onClick={() => setLocation("/")} className="mr-2">
{t("return_home", "Return Home")}
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
          title: t("duration", "Duration"),
          desc: `${packageData.duration} ${t("days", "Days")}`,
        },
        {
          icon: <Globe className="h-8 w-8 mb-2 text-primary" />,
          title: t("language", "Language"),
          desc: t("english_arabic", "English, Arabic"),
        },
        {
          icon: <Users className="h-8 w-8 mb-2 text-primary" />,
          title: t("group_size", "Group Size"),
          desc: t("max_20_people", "Max 20 People"),
        },
        {
          icon: <Star className="h-8 w-8 mb-2 text-primary" />,
          title: t("starting_price", "Starting Price"),
          desc: `${(packageData.discountedPrice || packageData.price).toLocaleString("en-US")} EGP`,
        },
        {
          icon: <MapPin className="h-8 w-8 mb-2 text-primary" />,
          title: t("location", "Location"),
          desc: destination
            ? `${destination.name}, ${destination.country}`
            : t("multiple_locations", "Multiple Locations"),
        },
      ]
    : [];

  // --- أضف دالة نسخ الرابط ---
  const handleCopyLink = async () => {
    try {
      let url = null;
      if (packageData?.slug) {
        url = `${window.location.origin}/packages/${packageData.slug}`;
      } else if (packageData?.id) {
        url = `${window.location.origin}/packages/${packageData.id}`;
      }
      if (!url) {
        toast({
          title: t("copy_failed", "فشل النسخ"),
          description: t("could_not_copy", "تعذر نسخ الرابط: لا يوجد معرف للباقة"),
          variant: "destructive",
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast({
        title: t("copied", "تم نسخ الرابط"),
        description: t("package_link_copied", "تم نسخ رابط الباقة إلى الحافظة"),
      });
    } catch (err) {
      toast({
        title: t("copy_failed", "فشل النسخ"),
        description: t("could_not_copy", "تعذر نسخ الرابط إلى الحافظة"),
        variant: "destructive",
      });
    }
  };

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
        <div className={isRTL ? "rtl" : ""}>
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
{t("home", "Home")}
                      </a>
                      <span className="mx-2">/</span>
                      <a
                        href="/packages"
                        className="hover:text-primary-foreground/90 transition-colors"
                      >
{t("packages", "Packages")}
                      </a>
                      <span className="mx-2">/</span>
                      <span className="font-medium">{destination?.name || getLocalizedTitle(packageData)}</span>
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
                          <span className="text-xs">{t("friendly_url", "Friendly URL")}</span>
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex items-center gap-1.5"
                          onClick={handleCopyLink}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span className="text-xs">{t("copy_link", "نسخ الرابط")}</span>
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
                      <span>{t("edit_package", "Edit Package")}</span>
                    </Button>
                  )}
                </div>

                {/* Hero content - left aligned */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-0 sm:mb-2">
                      {getLocalizedTitle(packageData)}
                    </h1>
                    {userData?.role === "admin" && (
                      <Badge
                        variant="outline"
                        className="text-white border-white bg-black/30 flex items-center gap-1"
                      >
                        <ShieldCheck className="h-3 w-3" />
                        <span className="text-xs">{t("admin_view", "Admin View")}</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl">
                    {destination ? `Experience ${destination?.name} with our exclusive package` : "Experience the beauty of this destination with our exclusive package"}
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
                {/* Package Photos */}
                <section
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                  id="package-gallary"
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">{t("package_photos", "Package Photos")}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {packageData.galleryUrls &&
                      packageData.galleryUrls.length > 0 ? (
                        packageData.galleryUrls.map((url, index) => (
                          <div
                            key={index}
                            className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
                            onClick={() => openGallery(index)}
                          >
                            <img
                              src={url}
                              alt={`${packageData.title} - ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white bg-black bg-opacity-50 rounded-full p-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full bg-gray-100 rounded-lg p-8 text-center">
                          <p className="text-muted-foreground">
{t("gallery_images_coming_soon", "Gallery images coming soon")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Package Overview */}
                <section className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">
{(packageData.selectedTourId || packageData.tourSelection) ? t("tour_overview", "Tour Overview") : t("package_overview", "Package Overview")}
                    </h2>
                    <p className="text-neutral-700 mb-4">
                      {getLocalizedDescription(packageData)}
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
{t("best_time_to_visit", "Best Time to Visit")}
                        </h3>
                        <p className="text-xs text-neutral-600">
                          {packageData.bestTimeToVisit ||
                            t("available_year_round", "Available year-round")}
                        </p>
                      </div>
                      <div className="bg-white border border-[#F1F1F1] p-4 rounded-lg flex flex-col items-center text-center shadow-inner shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_0_30px_rgba(0,0,0,0.15)] transition-all duration-200">
                        <Users className="h-6 w-6 text-primary mb-2" />
                        <h3 className="font-medium text-sm mb-1">{t("ideal_for", "Ideal For")}</h3>
                        <p className="text-xs text-neutral-600">
                          {(() => {
                            const idealFor = getLocalizedIdealFor(packageData);
                            return idealFor && idealFor.length > 0
                              ? idealFor.join(", ")
                              : t("all_traveler_types", "All traveler types");
                          })()}
                        </p>
                      </div>
                      <div className="bg-white border border-[#F1F1F1] p-4 rounded-lg flex flex-col items-center text-center shadow-inner shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_0_30px_rgba(0,0,0,0.15)] transition-all duration-200">
                        <Globe className="h-6 w-6 text-primary mb-2" />
                        <h3 className="font-medium text-sm mb-1">
{t("what_to_pack", "What to Pack")}
                        </h3>
                        <p className="text-xs text-neutral-600">
                          {(() => {
                            const whatToPack = getLocalizedWhatToPack(packageData);
                            return whatToPack && whatToPack.length > 0
                              ? whatToPack.map((item) => item.item).join(", ")
                              : t("standard_travel_essentials", "Standard travel essentials");
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Itinerary Section with Tabs - Styled like sailing-cruise.tsx */}
                <section className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
{t("package_itinerary", "Package Itinerary")}
                    </h2>
                    {(() => {
                      const localizedItinerary = getLocalizedItinerary(packageData);
                      return localizedItinerary && localizedItinerary.length > 0 ? (
                        <Tabs
                          defaultValue={`day${localizedItinerary[0]?.day || 1}`}
                        >
                          <TabsList className={`grid w-full text-xs sm:text-sm`} style={{gridTemplateColumns: `repeat(${localizedItinerary.length}, minmax(0, 1fr))`}}>
                            {localizedItinerary.map((day, index) => (
                              <TabsTrigger key={index} value={`day${day.day}`}>
                                {t("day", "Day")} {day.day}
                              </TabsTrigger>
                            ))}
                          </TabsList>

                          {localizedItinerary.map((day, index) => (
                            <TabsContent
                              key={index}
                              value={`day${day.day}`}
                              className="p-3 sm:p-4"
                            >
                              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                                {t("day", "Day")} {day.day}: {day.title}
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
                            {t("detailed_itinerary_coming_soon", "Detailed Itinerary Coming Soon")}
                          </h3>
                          <p className="text-gray-600">
                            {t("itinerary_preparation_message", "Our team is preparing a comprehensive day-by-day itinerary for this package. Please contact us for more details about the planned activities.")}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </section>

                {/* What's Included/Excluded - Real Data */}
                <section className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h2 className="text-xl font-bold mb-4">
{t("whats_included", "What's Included")}
                        </h2>
                        <ul className="space-y-3">
                          {(() => {
                            // Get included features from multiple possible data sources
                            let includedItems: string[] = [];
                            
                            // Priority 1: includedFeatures array (localized)
                            const localizedIncluded = getLocalizedIncludedFeatures(packageData);
                            if (localizedIncluded && localizedIncluded.length > 0) {
                              includedItems = localizedIncluded;
                            }
                            // Priority 2: inclusions array
                            else if (packageData.inclusions && packageData.inclusions.length > 0) {
                              includedItems = packageData.inclusions;
                            }
                            // Priority 3: Extract from hotels and tours if available
                            else if (packageData.selectedHotels || packageData.rooms) {
                              const hotelInclusions: string[] = [];
                              if (packageData.selectedHotels && Array.isArray(packageData.selectedHotels)) {
                                hotelInclusions.push(t("hotel_accommodation", "Hotel accommodation"));
                                hotelInclusions.push(t("daily_breakfast", "Daily breakfast"));
                              }
                              if (packageData.rooms && Array.isArray(packageData.rooms)) {
                                hotelInclusions.push(t("room_service", "Room service"));
                              }
                              // Add basic travel inclusions
                              hotelInclusions.push(t("professional_tour_guide", "Professional tour guide"));
                              hotelInclusions.push(t("transportation_during_tour", "Transportation during tour"));
                              hotelInclusions.push(t("entrance_fees_to_attractions", "Entrance fees to attractions"));
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
                                      ? t("no_included_features_admin", "No included features defined for this package. Edit to add inclusions.")
                                      : t("inclusion_details_on_inquiry", "Inclusion details will be provided upon inquiry")}
                                  </p>
                                </div>
                              </li>
                            );
                          })()}
                        </ul>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold mb-4">
{t("whats_excluded", "What's Excluded")}
                        </h2>
                        <ul className="space-y-3">
                          {(() => {
                            // Get excluded features from multiple possible data sources
                            let excludedItems: string[] = [];
                            
                            // Priority 1: excludedFeatures array (localized)
                            const localizedExcluded = getLocalizedExcludedFeatures(packageData);
                            if (localizedExcluded && localizedExcluded.length > 0) {
                              excludedItems = localizedExcluded;
                            }
                            // Priority 2: excludedItems array
                            else if (packageData.excludedItems && packageData.excludedItems.length > 0) {
                              excludedItems = packageData.excludedItems;
                            }
                            // Priority 3: Add common exclusions if no data
                            else {
                              excludedItems = [
                                t("international_flights", "International flights"),
                                t("travel_insurance", "Travel insurance"), 
                                t("personal_expenses", "Personal expenses"),
                                t("tips_and_gratuities", "Tips and gratuities"),
                                t("alcoholic_beverages", "Alcoholic beverages"),
                                t("optional_activities_not_mentioned", "Optional activities not mentioned"),
                                t("visa_fees", "Visa fees")
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
                                      ? t("no_excluded_features_admin", "No excluded features defined for this package. Edit to add exclusions.")
                                      : t("no_specific_exclusions", "No specific exclusions listed for this package.")}
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


              </div>

              {/* Booking Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  {/* Booking Form Card */}
                  <Card className="mb-6 shadow-lg border-t-4 border-t-primary">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">{t("book_this_package", "Book This Package")}</h3>

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
                            <span>{t("edit", "Edit")}</span>
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Date Range Selection */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">
{t("travel_dates", "Travel Dates")} *
                          </label>
                          
                          {/* Duration Information */}
                          {packageData?.duration && (
                            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-xs text-blue-800 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {t("package_duration", "Package Duration")}: {packageData.duration} {packageData.durationType || 'days'}
                                <span className="text-blue-600 text-xs ml-2">
                                  ({t("end_date_auto_adjusts", "End date adjusts automatically")})
                                </span>
                              </p>
                            </div>
                          )}
                          
                          {/* Date Range Inputs */}
                          <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs text-gray-600 mb-1 block">
{t("start_date", "Start Date")}
                                  </label>
                                  <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => handleStartDateChange(e.target.value)}
                                    className={`w-full rounded-md border px-3 py-2 text-sm ring-offset-background ${
                                      validationErrors.startDate
                                        ? "border-red-500"
                                        : "border-input"
                                    }`}
                                    min={(() => {
                                      const minDate = new Date();
                                      minDate.setDate(minDate.getDate() + 4);
                                      return minDate.toISOString().split("T")[0];
                                    })()}
                                    placeholder={t("start_date", "Start date")}
                                  />
                                  {validationErrors.startDate && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {validationErrors.startDate}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600 mb-1 block">
{t("end_date", "End Date")}
                                  </label>
                                  <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => handleEndDateChange(e.target.value)}
                                    className={`w-full rounded-md border px-3 py-2 text-sm ring-offset-background ${
                                      validationErrors.endDate
                                        ? "border-red-500"
                                        : "border-input"
                                    }`}
                                    min={startDate || (() => {
                                      const minDate = new Date();
                                      minDate.setDate(minDate.getDate() + 4);
                                      return minDate.toISOString().split("T")[0];
                                    })()}
                                    placeholder={t("end_date", "End date")}
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
                                      return t("trip_duration_summary", `${diffDays} day${diffDays !== 1 ? 's' : ''}, ${nights} night${nights !== 1 ? 's' : ''} trip (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`);
                                    })()}
                                  </p>
                                </div>
                              )}
                            </div>
                        </div>

                        {/* Step 1: Traveler Selection */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                              1
                            </div>
                            <h3 className="text-lg font-semibold">
                              {t("select_travelers", "Select Travelers")}
                            </h3>
                          </div>
                          
                          {validationErrors.adults && (
                            <p className="text-red-500 text-xs">
                              {validationErrors.adults}
                            </p>
                          )}

                          <div className="space-y-3 pl-10">
                            {/* Adults */}
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-sm ${adults === 0 && validationErrors.adults ? "text-red-500" : ""}`}
                              >
                                {t("adults_required", "Adults (required)")}
                              </span>
                              <div className="flex items-center">
                                <button
                                  className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted disabled:opacity-50"
                                  onClick={() => {
                                    handleDecrement(setAdults, adults);
                                    setShowAvailability(false); // Reset availability when changing travelers
                                  }}
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
                                    setShowAvailability(false); // Reset availability when changing travelers
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Children */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{t("children_2_12_yrs", "Children (2-12 yrs)")}</span>
                              <div className="flex items-center">
                                <button
                                  className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted"
                                  onClick={() => {
                                    handleDecrement(setChildren, children);
                                    setShowAvailability(false); // Reset availability when changing travelers
                                  }}
                                >
                                  -
                                </button>
                                <span className="w-8 text-center">
                                  {children}
                                </span>
                                <button
                                  className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted"
                                  onClick={() => {
                                    handleIncrement(setChildren, children);
                                    setShowAvailability(false); // Reset availability when changing travelers
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Infants */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{t("infants_0_2_yrs", "Infants (0-2 yrs)")}</span>
                              <div className="flex items-center">
                                <button
                                  className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted"
                                  onClick={() => {
                                    handleDecrement(setInfants, infants);
                                    setShowAvailability(false); // Reset availability when changing travelers
                                  }}
                                >
                                  -
                                </button>
                                <span className="w-8 text-center">{infants}</span>
                                <button
                                  className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted"
                                  onClick={() => {
                                    handleIncrement(setInfants, infants);
                                    setShowAvailability(false); // Reset availability when changing travelers
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Total travelers summary */}
                          {(adults > 0 || children > 0 || infants > 0) && (
                            <div className="pl-10 bg-blue-50 border border-blue-200 rounded-md p-3">
                              <p className="text-sm text-blue-800">
                                <Users className="w-4 h-4 inline mr-1" />
                                {t("total_travelers", "Total travelers")}: {adults + children + infants}
                                {adults > 0 && ` (${adults} ${t("adults", "adults")}${children > 0 ? `, ${children} ${t("children", "children")}` : ''}${infants > 0 ? `, ${infants} ${t("infants", "infants")}` : ''})`}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Step 2: See Availability Button */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${showAvailability ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                              2
                            </div>
                            <h3 className="text-lg font-semibold">
                              {t("check_availability", "Check Availability")}
                            </h3>
                          </div>
                          
                          <div className="pl-10">
                            {!showAvailability ? (
                              <Button
                                onClick={handleSeeAvailability}
                                className="w-full bg-primary hover:bg-primary/90 text-white"
                                disabled={adults === 0}
                              >
                                {t("see_availability", "See Availability")}
                              </Button>
                            ) : (
                              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                                <p className="text-sm text-green-800">
                                  ✓ {t("availability_checked", "Availability checked for")} {adults + children + infants} {t("travelers", "travelers")}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Step 3: Room Distribution (shown after clicking See Availability) */}
                        
                        {showAvailability && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                                3
                              </div>
                              <h3 className="text-lg font-semibold">
                                {t("room_distribution", "Room Distribution")}
                              </h3>
                            </div>
                            
                            <div className="pl-10 space-y-4">
                              {/* Room Distribution Component */}
                              <RoomDistributionWithStars 
                                packageData={packageData}
                                selectedRooms={selectedRooms}
                                onRoomSelect={(rooms: string[]) => {
                                  setSelectedRooms(rooms);
                                  clearValidationError("room");
                                }}
                                validationError={validationErrors.room}
                                adults={adults}
                                children={children}
                                infants={infants}
                                startDate={startDate}
                                endDate={endDate}
                                onBookingStatusChange={handleBookingStatusChange}
                                roomDistributionOrder={(packageData as any).roomDistributionOrder || 1}
                              />

                              {/* Included Tours */}
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  {t("tours_included_in_package", "Tours Included in Package")}
                                </label>
                                <IncludedTours packageData={packageData} />
                                {/* Enhanced Price Calculation - تحت الجولات المضمنة */}
                                <EnhancedPriceCalculation 
                                  packageData={packageData}
                                  adults={adults}
                                  children={children}
                                  infants={infants}
                                  hotelPackage=""
                                  selectedRooms={selectedRooms}
                                  dateMode="range"
                                  startDate={startDate}
                                  endDate={endDate}
                                />
                              </div>

                              {/* Book Package Button */}
                              <BookPackageButton
                                package={packageData}
                                className="w-full bg-primary hover:bg-primary/90 text-white"
                                disabled={isBookingDisabled}
                                disabledReason={bookingDisabledReason}
                                onClick={() => {
                                  // Validate form before booking
                                  return validateBookingForm();
                                }}
                                formData={{
                                  startDate,
                                  endDate,
                                  dateMode: "range",
                                  adults,
                                  children,
                                  infants,
                                  selectedRooms,
                                  hotelPackage: "",
                                }}
                                allRooms={allRooms}
                                allTours={allTours}
                              />
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-center text-muted-foreground">
{t("no_payment_required_to_book", "No payment required to book. You'll only pay when finalizing your reservation.")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* What's Included/Excluded - Separate box */}
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold mb-4">
{t("package_summary", "Package Summary")}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold mb-2">
{t("whats_included_colon", "What's Included:")}
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
                                  <span>{t("accommodation", "Accommodation")}</span>
                                </li>
                                <li className="flex items-start text-sm">
                                  <Check className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                                  <span>{t("meals_as_per_itinerary", "Meals as per itinerary")}</span>
                                </li>
                                <li className="flex items-start text-sm">
                                  <Check className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                                  <span>{t("transportation", "Transportation")}</span>
                                </li>
                                <li className="flex items-start text-sm">
                                  <Check className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                                  <span>{t("english_speaking_guide", "English-speaking guide")}</span>
                                </li>
                                <li className="flex items-start text-sm">
                                  <Check className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                                  <span>{t("entrance_fees", "Entrance fees")}</span>
                                </li>
                              </>
                            )}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold mb-2">
{t("highlights_colon", "Highlights:")}
                          </h4>
                          <ul className="space-y-1.5">
                            <li className="flex items-start text-sm">
                              <span className="text-primary font-bold mr-2">
                                •
                              </span>
                              <span>
{t("professional_guides_quality_service", "Professional guides and quality service")}
                              </span>
                            </li>
                            <li className="flex items-start text-sm">
                              <span className="text-primary font-bold mr-2">
                                •
                              </span>
                              <span>{t("authentic_local_experiences", "Authentic local experiences")}</span>
                            </li>
                            <li className="flex items-start text-sm">
                              <span className="text-primary font-bold mr-2">
                                •
                              </span>
                              <span>{t("comfortable_accommodations", "Comfortable accommodations")}</span>
                            </li>
                            <li className="flex items-start text-sm">
                              <span className="text-primary font-bold mr-2">
                                •
                              </span>
                              <span>{t("well_planned_itinerary", "Well-planned itinerary")}</span>
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
{t("destination_tips", "Destination Tips")}
                      </h3>

                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">
{t("best_time_to_visit", "Best Time to Visit")}
                            </p>
                            <p className="text-xs text-muted-foreground">
{t("october_to_april_pleasant_weather", "October to April offers the most pleasant weather.")}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Coffee className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{t("local_cuisine", "Local Cuisine")}</p>
                            <p className="text-xs text-muted-foreground">
{t("try_traditional_dishes_authentic_experience", "Try the traditional dishes for an authentic experience.")}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Car className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">
{t("getting_around", "Getting Around")}
                            </p>
                            <p className="text-xs text-muted-foreground">
{t("transportation_included_in_package", "Transportation is included in your package.")}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Mountain className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">
{t("must_see_attractions", "Must-See Attractions")}
                            </p>
                            <p className="text-xs text-muted-foreground">
{t("major_attractions_covered_in_itinerary", "All the major attractions are covered in your itinerary.")}
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

      {/* Photo Gallery Lightbox Modal */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black/90 border-0">
          <DialogTitle className="sr-only">
            {packageData?.title} Gallery - Image {currentImageIndex + 1}
          </DialogTitle>
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Previous button */}
            {packageData?.galleryUrls && currentImageIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronLeft className="w-12 h-12" />
              </button>
            )}

            {/* Next button */}
            {packageData?.galleryUrls && currentImageIndex < packageData.galleryUrls.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronRight className="w-12 h-12" />
              </button>
            )}

            {/* Current image */}
            {packageData?.galleryUrls && packageData.galleryUrls[currentImageIndex] && (
              <img
                src={packageData.galleryUrls[currentImageIndex]}
                alt={`${packageData.title} - Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Image counter */}
            {packageData?.galleryUrls && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-black/50 text-white px-4 py-2 rounded-lg">
                {currentImageIndex + 1} of {packageData.galleryUrls.length}
              </div>
            )}

            {/* Thumbnail navigation */}
            {packageData?.galleryUrls && packageData.galleryUrls.length > 1 && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-40 flex gap-2 max-w-md overflow-x-auto py-2">
                {packageData.galleryUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-white' 
                        : 'border-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PackageLayout>
  );
}
