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
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Filter,
  Heart,
  ShoppingCart
} from "lucide-react";

interface Package {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  currency: string;
  imageUrl: string;
  galleryUrls?: string[];
  duration: number;
  rating?: number;
  reviewCount: number;
  destinationId?: number;
  countryId?: number;
  cityId?: number;
  categoryId?: number;
  featured: boolean;
  type?: string;
  inclusions: string[];
  slug: string;
  maxGroupSize?: number;
  language?: string;
  bestTimeToVisit?: string;
  destination?: {
    id: number;
    name: string;
    country: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

const PackagesPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDuration, setFilterDuration] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('sahara-favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Fetch packages
  const { data: packages = [], isLoading, error } = useQuery({
    queryKey: ['/api/packages'],
    queryFn: async () => {
      const response = await fetch('/api/packages');
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      return response.json();
    },
  });

  // Toggle favorite
  const toggleFavorite = (packageId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(packageId)) {
      newFavorites.delete(packageId);
    } else {
      newFavorites.add(packageId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('sahara-favorites', JSON.stringify(Array.from(newFavorites)));
  };

  // Filter and sort packages
  const filteredPackages = packages
    .filter((pkg: Package) => {
      // Search filter
      if (searchTerm && !pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !pkg.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filterCategory !== "all" && pkg.category?.name !== filterCategory) {
        return false;
      }

      // Duration filter
      if (filterDuration !== "all") {
        const duration = pkg.duration;
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
        const price = pkg.discountedPrice || pkg.price;
        switch (filterPrice) {
          case "budget":
            return price <= 30000;
          case "mid":
            return price > 30000 && price <= 80000;
          case "luxury":
            return price > 80000;
          default:
            return true;
        }
      }

      return true;
    })
    .sort((a: Package, b: Package) => {
      switch (sortBy) {
        case "price-low":
          return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
        case "price-high":
          return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
        case "duration-short":
          return a.duration - b.duration;
        case "duration-long":
          return b.duration - a.duration;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "featured":
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });

  // Get unique categories for filter
  const categories = Array.from(new Set(packages.map((pkg: Package) => pkg.category?.name).filter(Boolean)));

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {t('packages.error', 'Error Loading Packages')}
            </h1>
            <p className="text-gray-600">
              {t('packages.errorMessage', 'Unable to load travel packages. Please try again later.')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('packages.title', 'Travel Packages')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            {t('packages.subtitle', 'Discover our carefully curated travel packages to the most beautiful destinations in the Middle East and North Africa.')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder={t('packages.searchPlaceholder', 'Search packages...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder={t('packages.sortBy', 'Sort by')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{t('packages.featured', 'Featured First')}</SelectItem>
                <SelectItem value="price-low">{t('packages.priceLowHigh', 'Price: Low to High')}</SelectItem>
                <SelectItem value="price-high">{t('packages.priceHighLow', 'Price: High to Low')}</SelectItem>
                <SelectItem value="duration-short">{t('packages.durationShort', 'Duration: Short to Long')}</SelectItem>
                <SelectItem value="duration-long">{t('packages.durationLong', 'Duration: Long to Short')}</SelectItem>
                <SelectItem value="rating">{t('packages.highestRated', 'Highest Rated')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t('packages.category', 'Category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('packages.allCategories', 'All Categories')}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category as string} value={category as string}>
                    {category as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDuration} onValueChange={setFilterDuration}>
              <SelectTrigger>
                <SelectValue placeholder={t('packages.duration', 'Duration')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('packages.anyDuration', 'Any Duration')}</SelectItem>
                <SelectItem value="short">{t('packages.shortDays', '1-3 Days')}</SelectItem>
                <SelectItem value="medium">{t('packages.mediumDays', '4-7 Days')}</SelectItem>
                <SelectItem value="long">{t('packages.longDays', '8+ Days')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPrice} onValueChange={setFilterPrice}>
              <SelectTrigger>
                <SelectValue placeholder={t('packages.priceRange', 'Price Range')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('packages.anyPrice', 'Any Price')}</SelectItem>
                <SelectItem value="budget">{t('packages.budget', 'Under 30,000 EGP')}</SelectItem>
                <SelectItem value="mid">{t('packages.midRange', '30,000 - 80,000 EGP')}</SelectItem>
                <SelectItem value="luxury">{t('packages.luxury', '80,000+ EGP')}</SelectItem>
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
              {t('packages.clearFilters', 'Clear Filters')}
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {isLoading ? t('packages.loading', 'Loading...') : `${filteredPackages.length} ${t('packages.packageCount', filteredPackages.length === 1 ? 'package found' : 'packages found')}`}
          </p>
        </div>

        {/* Packages Grid */}
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
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <Search className="h-full w-full" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No packages found</h3>
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
            {filteredPackages.map((pkg: Package) => (
              <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                <div className="relative">
                  {pkg.imageUrl ? (
                    <img
                      src={pkg.imageUrl}
                      alt={pkg.title}
                      className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-black font-medium">No Image</span>
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  {pkg.featured && (
                    <Badge className="absolute top-3 left-3 bg-primary text-white">
                      {t('packages.featured', 'Featured')}
                    </Badge>
                  )}
                  
                  {/* Discount Badge */}
                  {pkg.discountedPrice && (
                    <Badge className="absolute top-3 right-12 bg-red-500 text-white">
                      {Math.round((1 - pkg.discountedPrice / pkg.price) * 100)}% OFF
                    </Badge>
                  )}
                  
                  {/* Favorite Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute top-3 right-3 h-8 w-8 rounded-full ${
                      favorites.has(pkg.id) 
                        ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' 
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(pkg.id);
                    }}
                  >
                    <Heart className={`h-4 w-4 ${favorites.has(pkg.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {pkg.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mt-2">
                    {pkg.shortDescription || pkg.description}
                  </p>

                  {/* Package Details */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs">
                      <Calendar className="mr-1 h-3 w-3" />
                      {pkg.duration} {t('packages.days', 'days')}
                    </Badge>
                    {pkg.maxGroupSize && (
                      <Badge variant="secondary" className="text-xs">
                        <Users className="mr-1 h-3 w-3" />
                        {t('packages.max', 'Max')} {pkg.maxGroupSize}
                      </Badge>
                    )}
                    {pkg.destination && (
                      <Badge variant="secondary" className="text-xs">
                        <MapPin className="mr-1 h-3 w-3" />
                        {pkg.destination.name}
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  {pkg.rating && (
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(pkg.rating!) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {pkg.rating} ({pkg.reviewCount} {t('packages.reviews', 'reviews')})
                      </span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  {/* Price */}
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      {pkg.discountedPrice ? (
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-primary">
                            {pkg.discountedPrice.toLocaleString('en-US')} {pkg.currency}
                          </span>
                          <span className="text-lg text-gray-500 line-through">
                            {pkg.price.toLocaleString('en-US')} {pkg.currency}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-primary">
                          {pkg.price.toLocaleString('en-US')} {pkg.currency}
                        </span>
                      )}
                      <p className="text-sm text-gray-600">per person</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link href={`/packages/${pkg.slug || pkg.id}`} className="flex-1">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        {t('packages.viewDetails', 'View Details')}
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="hover:bg-primary hover:text-white"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button (if needed for pagination) */}
        {!isLoading && filteredPackages.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              {t('packages.showingAll', 'Showing all')} {filteredPackages.length} {t('packages.packagesText', 'packages')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackagesPage;