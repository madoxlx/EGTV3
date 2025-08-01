import React from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import BookTourButton from "@/components/BookTourButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Heart,
  Calendar,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Globe,
  Camera,
  Route,
  Info,
  Banknote,
  Shield,
  Award,
  MapPinIcon,
  PhoneCall,
  Mail,
  Share2
} from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { tours } from "@shared/schema";

type Tour = typeof tours.$inferSelect & {
  destination?: {
    id: number;
    name: string;
  };
  slug?: string;
};

const TourDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();

  const { data: tour, isLoading, error } = useQuery<Tour>({
    queryKey: ['/api/tours', slug],
    queryFn: async () => {
      // Try individual tour endpoint first
      const response = await fetch(`/api/tours/${slug}`);
      if (!response.ok) {
        // If individual tour endpoint doesn't exist, fetch from tours list
        const allToursResponse = await fetch('/api/tours');
        if (!allToursResponse.ok) {
          throw new Error('Failed to fetch tours');
        }
        const allTours = await allToursResponse.json();
        
        // Try multiple strategies to find the tour
        let foundTour = null;
        
        // 1. Try exact slug match
        foundTour = allTours.find((t: Tour) => t.slug === slug);
        
        // 2. Try generated slug from name
        if (!foundTour) {
          foundTour = allTours.find((t: Tour) => {
            const generatedSlug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            return generatedSlug === slug;
          });
        }
        
        // 3. Try parsing as numeric ID
        if (!foundTour) {
          const numericId = parseInt(slug!);
          if (!isNaN(numericId)) {
            foundTour = allTours.find((t: Tour) => t.id === numericId);
          }
        }
        
        // 4. Try slug patterns like "tour-123"
        if (!foundTour && slug!.startsWith('tour-')) {
          const idFromSlug = parseInt(slug!.replace('tour-', ''));
          if (!isNaN(idFromSlug)) {
            foundTour = allTours.find((t: Tour) => t.id === idFromSlug);
          }
        }
        
        if (!foundTour) {
          throw new Error('Tour not found');
        }
        return foundTour;
      }
      return response.json();
    },
    enabled: !!slug,
  });

  // Helper function to get localized content
  const getLocalizedContent = (enContent: string | null | undefined, arContent: string | null | undefined) => {
    if (currentLanguage === 'ar' && arContent) {
      return arContent;
    }
    return enContent || '';
  };

  // Helper function to get localized array content
  const getLocalizedArray = (enArray: unknown, arArray: unknown) => {
    const processArray = (arr: unknown): string[] => {
      if (Array.isArray(arr)) return arr as string[];
      if (typeof arr === 'string') {
        try {
          const parsed = JSON.parse(arr);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [arr];
        }
      }
      return [];
    };

    if (currentLanguage === 'ar' && arArray) {
      const processed = processArray(arArray);
      if (processed.length > 0) return processed;
    }
    return processArray(enArray);
  };

  const formatPrice = (price: number) => {
    // Convert from cents to EGP (divide by 100)
    const priceInEGP = price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(priceInEGP).replace('EGP', '') + ' EGP';
  };

  const parseItinerary = (itinerary: string[] | string | undefined): string[] => {
    if (!itinerary) return [];
    if (Array.isArray(itinerary)) return itinerary;
    try {
      return JSON.parse(itinerary);
    } catch {
      return [itinerary];
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">{t('tour.loading', 'Loading tour details...')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('tour.not_found', 'Tour Not Found')}</h1>
          <p className="text-gray-600 mb-6">{t('tour.not_found_description', 'The tour you\'re looking for doesn\'t exist or has been removed.')}</p>
          <Link href="/tours">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('tour.back_to_tours', 'Back to Tours')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/tours">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('tour.back_to_tours', 'Back to Tours')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image */}
          <div className="relative">
            <img
              src={tour.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'}
              alt={getLocalizedContent(tour.name, tour.nameAr)}
              className="w-full h-96 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';
              }}
            />
            {tour.featured && (
              <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                <Star className="w-3 h-3 mr-1" />
                {t('tour.featured', 'Featured')}
              </Badge>
            )}
          </div>

          {/* Tour Info */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {getLocalizedContent(tour.name, tour.nameAr)}
                  </CardTitle>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{tour.destination?.name || 'Egypt'}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-6">
                {getLocalizedContent(tour.description, tour.descriptionAr)}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center bg-blue-50 rounded-lg p-4">
                  <Clock className="w-5 h-5 text-blue-500 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">{t('tour.duration', 'Duration')}</div>
                    <div className="text-sm text-gray-600">
                      {tour.duration} {tour.duration === 1 ? t('tour.day', 'day') : t('tour.days', 'days')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center bg-green-50 rounded-lg p-4">
                  <Users className="w-5 h-5 text-green-500 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">{t('tour.group_size', 'Group Size')}</div>
                    <div className="text-sm text-gray-600">{t('tour.max', 'Max')} {tour.maxCapacity}</div>
                  </div>
                </div>
                <div className="flex items-center bg-yellow-50 rounded-lg p-4">
                  <Star className="w-5 h-5 text-yellow-500 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-900">{t('tour.rating', 'Rating')}</div>
                    <div className="text-sm text-gray-600">
                      {tour.rating || 4.5} ({tour.reviewCount || 125} {t('tour.reviews', 'reviews')})
                    </div>
                  </div>
                </div>
              </div>

              {/* Included/Excluded */}
              {(getLocalizedArray(tour.included, tour.includedAr).length > 0 || getLocalizedArray(tour.excluded, tour.excludedAr).length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {getLocalizedArray(tour.included, tour.includedAr).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {t('tour.whats_included', 'What\'s Included')}
                      </h3>
                      <ul className="space-y-2">
                        {getLocalizedArray(tour.included, tour.includedAr).map((item, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {getLocalizedArray(tour.excluded, tour.excludedAr).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <XCircle className="w-4 h-4 text-red-500 mr-2" />
                        {t('tour.whats_not_included', 'What\'s Not Included')}
                      </h3>
                      <ul className="space-y-2">
                        {getLocalizedArray(tour.excluded, tour.excludedAr).map((item, index) => (
                          <li key={index} className="flex items-start">
                            <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-center">{t('tour.book_this_tour', 'Book This Tour')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                {tour.discountedPrice ? (
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(tour.discountedPrice)}
                    </div>
                    <div className="text-lg text-gray-400 line-through">
                      {formatPrice(tour.price)}
                    </div>
                    <Badge className="bg-red-100 text-red-800">
                      {t('tour.save', 'Save')} {formatPrice(tour.price - tour.discountedPrice)}
                    </Badge>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(tour.price)}
                  </div>
                )}
                <div className="text-sm text-gray-500 mt-1">{t('tour.per_person', 'per person')}</div>
              </div>

              <div className="space-y-4">
                <BookTourButton 
                  tour={tour}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  {t('tour.book_now', 'Book Now')}
                </BookTourButton>
                <Button variant="outline" className="w-full">
                  <Heart className="w-4 h-4 mr-2" />
                  {t('tour.add_to_favorites', 'Add to Favorites')}
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('tour.free_cancellation', 'Free cancellation')}</span>
                  <span className="text-green-600 font-medium">{t('tour.available', 'Available')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('tour.instant_confirmation', 'Instant confirmation')}</span>
                  <span className="text-green-600 font-medium">{t('tour.yes', 'Yes')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('tour.mobile_voucher', 'Mobile voucher')}</span>
                  <span className="text-green-600 font-medium">{t('tour.accepted', 'Accepted')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;