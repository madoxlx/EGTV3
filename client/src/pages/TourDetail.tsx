import React, { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Heart,
  Calendar,
  CheckCircle,
  XCircle,
  Camera,
  Share2,
  ArrowLeft,
  Plus,
  Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";

interface Tour {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  galleryUrls?: string[];
  destinationId: number;
  categoryId?: number;
  tripType?: string;
  duration: number;
  price: number;
  discountedPrice?: number;
  maxGroupSize: number;
  featured: boolean;
  rating: number;
  reviewCount: number;
  status: string;
  included?: string[];
  excluded?: string[];
  itinerary?: string[];
  difficulty?: string;
  bestTime?: string;
  destination?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

const TourDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Fetch tour data
  const { data: tour, isLoading, error } = useQuery({
    queryKey: ['/api/tours', id],
    queryFn: async () => {
      const response = await fetch(`/api/tours/${id}`);
      if (!response.ok) {
        throw new Error('Tour not found');
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('tour-favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  const toggleFavorite = (tourId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(tourId)) {
      newFavorites.delete(tourId);
      toast({
        title: t('tours.favoriteRemoved', 'Removed from favorites'),
        description: t('tours.favoriteRemovedDesc', 'Tour removed from your favorites'),
      });
    } else {
      newFavorites.add(tourId);
      toast({
        title: t('tours.favoriteAdded', 'Added to favorites'),
        description: t('tours.favoriteAddedDesc', 'Tour added to your favorites'),
      });
    }
    setFavorites(newFavorites);
    localStorage.setItem('tour-favorites', JSON.stringify([...newFavorites]));
  };

  const handleBookNow = () => {
    toast({
      title: t('tours.bookingInitiated', 'Booking Initiated'),
      description: t('tours.bookingDesc', 'Redirecting to booking process...'),
    });
    // Here you would typically redirect to booking/checkout
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(price).replace('EGP', '') + ' EGP';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">{t('common.loading', 'Loading...')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('tours.notFound', 'Tour Not Found')}</h1>
          <p className="text-muted-foreground mb-4">
            {t('tours.notFoundDesc', 'The tour you are looking for does not exist.')}
          </p>
          <Link href="/tours">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('tours.backToTours', 'Back to Tours')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const gallery = tour.galleryUrls ? 
    (typeof tour.galleryUrls === 'string' ? JSON.parse(tour.galleryUrls) : tour.galleryUrls) : 
    [];
  const allImages = [tour.imageUrl, ...gallery].filter(Boolean);

  const included = tour.included ? 
    (typeof tour.included === 'string' ? JSON.parse(tour.included) : tour.included) : 
    [];
  const excluded = tour.excluded ? 
    (typeof tour.excluded === 'string' ? JSON.parse(tour.excluded) : tour.excluded) : 
    [];
  const itinerary = tour.itinerary ? 
    (typeof tour.itinerary === 'string' ? JSON.parse(tour.itinerary) : tour.itinerary) : 
    [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link href="/tours">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('tours.backToTours', 'Back to Tours')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images and Details */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-8">
            <div className="relative mb-4">
              <img
                src={allImages[selectedImage] || '/placeholder-tour.jpg'}
                alt={tour.name}
                className="w-full h-96 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-tour.jpg';
                }}
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => toggleFavorite(tour.id)}
                >
                  <Heart 
                    className={`h-4 w-4 ${favorites.has(tour.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                  />
                </Button>
                <Button variant="secondary" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {tour.featured && (
                <Badge className="absolute top-4 left-4 bg-yellow-500 text-white">
                  {t('tours.featured', 'Featured')}
                </Badge>
              )}
            </div>
            
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image || '/placeholder-tour.jpg'}
                      alt={`${tour.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-tour.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tour Details Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">{t('tours.overview', 'Overview')}</TabsTrigger>
              <TabsTrigger value="itinerary">{t('tours.itinerary', 'Itinerary')}</TabsTrigger>
              <TabsTrigger value="included">{t('tours.included', 'Included')}</TabsTrigger>
              <TabsTrigger value="reviews">{t('tours.reviews', 'Reviews')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('tours.tourOverview', 'Tour Overview')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {tour.description}
                  </p>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-primary mr-2" />
                      <div>
                        <p className="font-medium">{t('tours.destination', 'Destination')}</p>
                        <p className="text-sm text-muted-foreground">
                          {tour.destination?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-primary mr-2" />
                      <div>
                        <p className="font-medium">{t('tours.duration', 'Duration')}</p>
                        <p className="text-sm text-muted-foreground">
                          {tour.duration} {tour.duration === 1 ? 'day' : 'days'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-primary mr-2" />
                      <div>
                        <p className="font-medium">{t('tours.groupSize', 'Max Group Size')}</p>
                        <p className="text-sm text-muted-foreground">
                          {tour.maxGroupSize} {t('tours.people', 'people')}
                        </p>
                      </div>
                    </div>
                    
                    {tour.difficulty && (
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-primary mr-2" />
                        <div>
                          <p className="font-medium">{t('tours.difficulty', 'Difficulty')}</p>
                          <p className="text-sm text-muted-foreground">{tour.difficulty}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="itinerary" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('tours.itinerary', 'Itinerary')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {itinerary.length > 0 ? (
                    <div className="space-y-4">
                      {itinerary.map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                            {index + 1}
                          </div>
                          <p className="text-muted-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      {t('tours.noItinerary', 'Detailed itinerary will be provided upon booking.')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="included" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {t('tours.included', 'Included')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {included.length > 0 ? (
                      <ul className="space-y-2">
                        {included.map((item, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {t('tours.noIncluded', 'Inclusions will be detailed during booking.')}
                      </p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600 flex items-center">
                      <XCircle className="w-5 h-5 mr-2" />
                      {t('tours.excluded', 'Not Included')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {excluded.length > 0 ? (
                      <ul className="space-y-2">
                        {excluded.map((item, index) => (
                          <li key={index} className="flex items-center">
                            <XCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {t('tours.noExcluded', 'Exclusions will be detailed during booking.')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('tours.reviews', 'Reviews')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-4">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-lg font-semibold ml-1">{tour.rating}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {t('tours.reviewsCount', '{{count}} reviews', { count: tour.reviewCount })}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {t('tours.reviewsComingSoon', 'Detailed reviews coming soon.')}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Booking Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-xl">{tour.name}</CardTitle>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{tour.rating}</span>
                <span className="text-sm text-muted-foreground ml-1">
                  ({tour.reviewCount} reviews)
                </span>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Pricing */}
                <div>
                  {tour.discountedPrice ? (
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(tour.discountedPrice)}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {t('tours.perPerson', 'per person')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground line-through mr-2">
                          {formatPrice(tour.price)}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          {Math.round(((tour.price - tour.discountedPrice) / tour.price) * 100)}% OFF
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(tour.price)}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {t('tours.perPerson', 'per person')}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Quantity Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('tours.travelers', 'Number of Travelers')}
                  </label>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="mx-4 font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(tour.maxGroupSize, quantity + 1))}
                      disabled={quantity >= tour.maxGroupSize}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('tours.maxTravelers', 'Maximum {{max}} travelers', { max: tour.maxGroupSize })}
                  </p>
                </div>

                <Separator />

                {/* Total Price */}
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t('tours.total', 'Total')}</span>
                  <span className="text-xl font-bold">
                    {formatPrice((tour.discountedPrice || tour.price) * quantity)}
                  </span>
                </div>

                {/* Book Now Button */}
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleBookNow}
                >
                  {t('tours.bookNow', 'Book Now')}
                </Button>

                {/* Additional Info */}
                <div className="text-center text-xs text-muted-foreground">
                  <p>{t('tours.freeBooking', 'Free booking - no credit card required')}</p>
                  <p>{t('tours.instantConfirmation', 'Instant confirmation')}</p>
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