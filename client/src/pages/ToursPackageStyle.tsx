import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";
import BookTourButton from "@/components/BookTourButton";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Filter,
  Heart,
  Clock
} from "lucide-react";

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
  active?: boolean | number;
  included?: string[];
  excluded?: string[];
  itinerary?: string[];
  difficulty?: string;
  bestTime?: string;
  slug?: string;
  destination?: {
    id: number;
    name: string;
    country?: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

const ToursPackageStyle: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDuration, setFilterDuration] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('tour-favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Fetch tours
  const { data: tours = [], isLoading, error } = useQuery({
    queryKey: ['/api/tours'],
    queryFn: async () => {
      const response = await fetch('/api/tours');
      if (!response.ok) {
        throw new Error('Failed to fetch tours');
      }
      return response.json();
    },
  });

  // Toggle favorite
  const toggleFavorite = (tourId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(tourId)) {
      newFavorites.delete(tourId);
    } else {
      newFavorites.add(tourId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('tour-favorites', JSON.stringify(Array.from(newFavorites)));
  };

  // Filter and sort tours
  const filteredTours = tours
    .filter((tour: Tour) => {
      // Only show active tours
      const isActive = tour.active === true || tour.active === 1 || tour.status === 'active';
      if (!isActive) return false;

      // Search filter
      if (searchTerm && !tour.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !tour.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filterCategory !== "all" && tour.category?.name !== filterCategory) {
        return false;
      }

      // Duration filter
      if (filterDuration !== "all") {
        const duration = typeof tour.duration === 'string' ? parseInt(tour.duration) : tour.duration;
        switch (filterDuration) {
          case "short":
            return duration <= 3;
          case "medium":
            return duration >= 4 && duration <= 7;
          case "long":
            return duration >= 8;
          default:
            return true;
        }
      }

      // Price filter
      if (filterPrice !== "all") {
        const price = tour.discountedPrice || tour.price;
        switch (filterPrice) {
          case "budget":
            return price <= 15000;
          case "mid":
            return price > 15000 && price <= 40000;
          case "luxury":
            return price > 40000;
          default:
            return true;
        }
      }

      return true;
    })
    .sort((a: Tour, b: Tour) => {
      switch (sortBy) {
        case "price-low":
          return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
        case "price-high":
          return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
        case "duration-short":
          const aDuration = typeof a.duration === 'string' ? parseInt(a.duration) : a.duration;
          const bDuration = typeof b.duration === 'string' ? parseInt(b.duration) : b.duration;
          return aDuration - bDuration;
        case "duration-long":
          const aDur = typeof a.duration === 'string' ? parseInt(a.duration) : a.duration;
          const bDur = typeof b.duration === 'string' ? parseInt(b.duration) : b.duration;
          return bDur - aDur;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "featured":
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });

  // Get unique categories for filter with deduplication
  const categories = Array.from(new Set(tours.map((tour: Tour) => tour.category?.name).filter(Boolean)));

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Tours</h1>
            <p className="text-gray-600">Unable to load tours. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tours & Experiences</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Explore our handpicked collection of tours and experiences across the most stunning destinations in the Middle East and North Africa.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search tours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="duration-short">Duration: Short to Long</SelectItem>
                <SelectItem value="duration-long">Duration: Long to Short</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category, index) => {
                  const uniqueKey = `category-filter-${category?.toString().replace(/\s+/g, '-').toLowerCase()}-${index}`;
                  return (
                    <SelectItem key={uniqueKey} value={category as string}>
                      {category as string}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select value={filterDuration} onValueChange={setFilterDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Duration</SelectItem>
                <SelectItem value="short">1-3 Days</SelectItem>
                <SelectItem value="medium">4-7 Days</SelectItem>
                <SelectItem value="long">8+ Days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPrice} onValueChange={setFilterPrice}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                <SelectItem value="budget">Under 15,000 EGP</SelectItem>
                <SelectItem value="mid">15,000 - 40,000 EGP</SelectItem>
                <SelectItem value="luxury">40,000+ EGP</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setSortBy("featured");
              setFilterCategory("all");
              setFilterDuration("all");
              setFilterPrice("all");
            }}>
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {isLoading ? "Loading..." : `${filteredTours.length} tour${filteredTours.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Tours Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <Search className="h-full w-full" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tours found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
            <Button onClick={() => {
              setSearchTerm("");
              setFilterCategory("all");
              setFilterDuration("all");
              setFilterPrice("all");
            }}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTours.map((tour: Tour) => (
              <Card key={`tour-card-${tour.id}`} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer">
                <Link href={`/tours/${tour.slug || tour.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `tour-${tour.id}`}`} className="block">
                  <div className="relative">
                    <img
                      src={tour.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'}
                      alt={tour.name}
                      className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80';
                      }}
                    />
                  
                  {/* Featured Badge */}
                  {tour.featured && (
                    <Badge className="absolute top-3 left-3 bg-primary text-white">
                      Featured
                    </Badge>
                  )}
                  
                  {/* Discount Badge */}
                  {tour.discountedPrice && (
                    <Badge className="absolute top-3 right-12 bg-red-500 text-white">
                      {Math.round((1 - tour.discountedPrice / tour.price) * 100)}% OFF
                    </Badge>
                  )}
                  
                  {/* Favorite Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute top-3 right-3 h-8 w-8 rounded-full ${
                      favorites.has(tour.id) 
                        ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' 
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(tour.id);
                    }}
                  >
                    <Heart className={`h-4 w-4 ${favorites.has(tour.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {tour.name}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mt-2">
                    {tour.description}
                  </p>

                  {/* Tour Details */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="mr-1 h-3 w-3" />
                      {typeof tour.duration === 'string' ? tour.duration : tour.duration} day{tour.duration !== 1 ? 's' : ''}
                    </Badge>
                    {tour.maxGroupSize && (
                      <Badge variant="secondary" className="text-xs">
                        <Users className="mr-1 h-3 w-3" />
                        Max {tour.maxGroupSize}
                      </Badge>
                    )}
                    {tour.destination && (
                      <Badge variant="secondary" className="text-xs">
                        <MapPin className="mr-1 h-3 w-3" />
                        {tour.destination.name}
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  {tour.rating && (
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={`star-${tour.id}-${i}`}
                            className={`h-4 w-4 ${
                              i < Math.floor(tour.rating!) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {tour.rating} ({tour.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  {/* Price */}
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      {tour.discountedPrice ? (
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-primary">
                            {tour.discountedPrice.toLocaleString('en-US')} EGP
                          </span>
                          <span className="text-lg text-gray-500 line-through">
                            {tour.price.toLocaleString('en-US')} EGP
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-primary">
                          {tour.price.toLocaleString('en-US')} EGP
                        </span>
                      )}
                      <p className="text-sm text-gray-600">per person</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <BookTourButton 
                      tour={tour}
                      className="flex-1"
                    />
                  </div>
                </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToursPackageStyle;