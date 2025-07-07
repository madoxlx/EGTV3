import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Heart,
  Calendar,
  DollarSign,
  Grid3X3,
  List,
  SlidersHorizontal,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

interface Destination {
  id: number;
  name: string;
}

interface TourCategory {
  id: number;
  name: string;
}

const Tours: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestinations, setSelectedDestinations] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [durationRange, setDurationRange] = useState([1, 30]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Fetch data with proper error handling
  const { data: tours = [], isLoading: toursLoading, error: toursError } = useQuery({
    queryKey: ['/api/tours'],
    retry: 3,
    refetchOnWindowFocus: false,
  });

  const { data: destinations = [], isLoading: destinationsLoading } = useQuery({
    queryKey: ['/api/destinations'],
    retry: 3,
    refetchOnWindowFocus: false,
  });

  const { data: tourCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/tour-categories'],
    retry: 3,
    refetchOnWindowFocus: false,
  });

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('tour-favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Filter and sort tours
  const filteredTours = React.useMemo(() => {
    console.log('Raw tours data:', tours);
    console.log('Tours length:', tours.length);
    
    if (!tours || tours.length === 0) {
      console.log('No tours data available');
      return [];
    }

    let filtered = tours.filter((tour: Tour) => {
      console.log('Filtering tour:', tour.name, 'active:', tour.active);
      
      // Search filter
      const matchesSearch = !searchQuery || 
                           tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tour.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (tour.destination && tour.destination.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Destination filter
      const matchesDestination = selectedDestinations.length === 0 || 
                                (tour.destinationId && selectedDestinations.includes(tour.destinationId));
      
      // Category filter
      const matchesCategory = selectedCategories.length === 0 || 
                             (tour.categoryId && selectedCategories.includes(tour.categoryId));
      
      // Price filter - ensure we have valid prices
      const currentPrice = tour.discountedPrice || tour.price || 0;
      const matchesPrice = currentPrice >= priceRange[0] && currentPrice <= priceRange[1];
      
      // Duration filter - handle both number and string duration
      const tourDuration = typeof tour.duration === 'string' ? parseInt(tour.duration) : tour.duration || 1;
      const matchesDuration = tourDuration >= durationRange[0] && tourDuration <= durationRange[1];
      
      // Difficulty filter
      const matchesDifficulty = selectedDifficulty.length === 0 || 
                               (tour.difficulty && selectedDifficulty.includes(tour.difficulty));
      
      // Featured filter
      const matchesFeatured = !featuredOnly || tour.featured;
      
      // Status filter (only show active tours) - be more flexible with active check
      const isActive = tour.active === true || tour.active === 1 || tour.status === 'active';
      
      const result = matchesSearch && matchesDestination && matchesCategory && 
                    matchesPrice && matchesDuration && matchesDifficulty && 
                    matchesFeatured && isActive;
      
      console.log('Tour filter result:', tour.name, {
        matchesSearch,
        matchesDestination, 
        matchesCategory,
        matchesPrice,
        matchesDuration,
        matchesDifficulty,
        matchesFeatured,
        isActive,
        finalResult: result
      });
      
      return result;
    });

    // Sort tours
    return filtered.sort((a: Tour, b: Tour) => {
      switch (sortBy) {
        case "price-low":
          return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
        case "price-high":
          return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
        case "duration":
          return a.duration - b.duration;
        case "rating":
          return b.rating - a.rating;
        case "name":
          return a.name.localeCompare(b.name);
        case "featured":
        default:
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating - a.rating;
      }
    });
  }, [tours, searchQuery, selectedDestinations, selectedCategories, priceRange, 
      durationRange, selectedDifficulty, featuredOnly, sortBy]);

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

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDestinations([]);
    setSelectedCategories([]);
    setPriceRange([0, 50000]);
    setDurationRange([1, 30]);
    setSelectedDifficulty([]);
    setFeaturedOnly(false);
  };

  const handleDestinationToggle = (destinationId: number) => {
    setSelectedDestinations(prev => 
      prev.includes(destinationId) 
        ? prev.filter(id => id !== destinationId)
        : [...prev, destinationId]
    );
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDifficultyToggle = (difficulty: string) => {
    setSelectedDifficulty(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const formatPrice = (price: number) => {
    if (!price || price === 0) return '0 EGP';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(price).replace('EGP', '') + ' EGP';
  };

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">{t('tours.priceRange', 'Price Range')}</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={50000}
          min={0}
          step={1000}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Duration */}
      <div>
        <h3 className="font-semibold mb-3">{t('tours.duration', 'Duration (Days)')}</h3>
        <Slider
          value={durationRange}
          onValueChange={setDurationRange}
          max={30}
          min={1}
          step={1}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{durationRange[0]} {durationRange[0] === 1 ? 'day' : 'days'}</span>
          <span>{durationRange[1]} {durationRange[1] === 1 ? 'day' : 'days'}</span>
        </div>
      </div>

      {/* Destinations */}
      <div>
        <h3 className="font-semibold mb-3">{t('tours.destinations', 'Destinations')}</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {destinations.map((destination: Destination, index: number) => (
            <div key={`dest-${destination.id}-${index}`} className="flex items-center space-x-2">
              <Checkbox
                id={`dest-${destination.id}-${index}`}
                checked={selectedDestinations.includes(destination.id)}
                onCheckedChange={() => handleDestinationToggle(destination.id)}
              />
              <label 
                htmlFor={`dest-${destination.id}-${index}`} 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {destination.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">{t('tours.categories', 'Categories')}</h3>
        <div className="space-y-2">
          {React.useMemo(() => {
            // Create a map to track unique category names and their first occurrence
            const uniqueCategories = new Map();
            tourCategories.forEach(category => {
              if (!uniqueCategories.has(category.name)) {
                uniqueCategories.set(category.name, category);
              }
            });
            return Array.from(uniqueCategories.values());
          }, [tourCategories]).map((category: TourCategory) => {
            const uniqueKey = `category-${category.id}-${category.name.replace(/\s+/g, '-').toLowerCase()}`;
            return (
              <div key={uniqueKey} className="flex items-center space-x-2">
                <Checkbox
                  id={uniqueKey}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => handleCategoryToggle(category.id)}
                />
                <label 
                  htmlFor={uniqueKey} 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category.name}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <h3 className="font-semibold mb-3">{t('tours.difficulty', 'Difficulty')}</h3>
        <div className="space-y-2">
          {['Easy', 'Moderate', 'Challenging'].map((difficulty) => (
            <div key={difficulty} className="flex items-center space-x-2">
              <Checkbox
                id={`diff-${difficulty}`}
                checked={selectedDifficulty.includes(difficulty)}
                onCheckedChange={() => handleDifficultyToggle(difficulty)}
              />
              <label 
                htmlFor={`diff-${difficulty}`} 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {difficulty}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Only */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="featured"
          checked={featuredOnly}
          onCheckedChange={setFeaturedOnly}
        />
        <label 
          htmlFor="featured" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t('tours.featuredOnly', 'Featured Tours Only')}
        </label>
      </div>

      {/* Clear Filters */}
      <Button 
        variant="outline" 
        onClick={clearFilters}
        className="w-full"
      >
        <X className="w-4 h-4 mr-2" />
        {t('tours.clearFilters', 'Clear Filters')}
      </Button>
    </div>
  );

  const TourCard = ({ tour }: { tour: Tour }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md bg-gradient-to-b from-white to-gray-50/50">
      <div className="relative overflow-hidden">
        <img
          src={tour.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'}
          alt={tour.name}
          className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
          onClick={() => toggleFavorite(tour.id)}
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${favorites.has(tour.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </Button>
        
        {tour.featured && (
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
            <Star className="w-3 h-3 mr-1" />
            {t('tours.featured', 'Featured')}
          </Badge>
        )}
        
        {tour.discountedPrice && (
          <Badge className="absolute bottom-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
            {Math.round(((tour.price - tour.discountedPrice) / tour.price) * 100)}% OFF
          </Badge>
        )}
      </div>
      
      <CardContent className="p-5">
        <div className="mb-3">
          <h3 className="font-bold text-xl text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {tour.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {tour.description}
          </p>
        </div>
        
        <div className="space-y-3 mb-5">
          <div className="flex items-center text-sm text-gray-500">
            <div className="flex items-center bg-blue-50 rounded-full px-3 py-1">
              <MapPin className="w-4 h-4 mr-2 text-blue-500" />
              <span className="font-medium">{tour.destination?.name || 'Egypt'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-green-50 rounded-full px-3 py-1">
              <Clock className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-sm font-medium text-gray-700">
                {typeof tour.duration === 'string' ? tour.duration : `${tour.duration || 1} ${(tour.duration || 1) === 1 ? 'day' : 'days'}`}
              </span>
            </div>
            <div className="flex items-center bg-purple-50 rounded-full px-3 py-1">
              <Users className="w-4 h-4 mr-2 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Max {tour.maxGroupSize || tour.maxCapacity || 10}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center bg-yellow-50 rounded-full px-3 py-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
            <span className="text-sm font-bold text-gray-700">{tour.rating || 4.5}</span>
            <span className="text-xs text-gray-500 ml-1">
              ({tour.reviewCount || 125} reviews)
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            {tour.discountedPrice ? (
              <div className="space-y-1">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(tour.discountedPrice)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(tour.price)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-primary">
                {formatPrice(tour.price)}
              </span>
            )}
            <span className="text-xs text-gray-500">per person</span>
          </div>
          
          <Link href={`/tours/${tour.id}`}>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {t('tours.viewDetails', 'View Details')}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  if (toursLoading || destinationsLoading || categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">{t('common.loading', 'Loading tours...')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Debug information
  console.log('Tours data:', tours);
  console.log('Destinations data:', destinations);
  console.log('Categories data:', tourCategories);
  console.log('Tours error:', toursError);

  return (
    <div className={`container mx-auto px-4 py-8 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('tours.title', 'Discover Amazing Tours')}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t('tours.subtitle', 'Explore our carefully curated selection of tours and experiences across Egypt')}
        </p>
        <div className="mt-4 inline-flex items-center space-x-2 bg-blue-50 rounded-full px-4 py-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            {tours.length} tours available in Egypt
          </span>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t('tours.searchPlaceholder', 'Search tours, destinations...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">{t('tours.sortFeatured', 'Featured First')}</SelectItem>
              <SelectItem value="price-low">{t('tours.sortPriceLow', 'Price: Low to High')}</SelectItem>
              <SelectItem value="price-high">{t('tours.sortPriceHigh', 'Price: High to Low')}</SelectItem>
              <SelectItem value="duration">{t('tours.sortDuration', 'Duration')}</SelectItem>
              <SelectItem value="rating">{t('tours.sortRating', 'Highest Rated')}</SelectItem>
              <SelectItem value="name">{t('tours.sortName', 'Name A-Z')}</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Mobile Filters */}
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                {t('tours.filters', 'Filters')}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>{t('tours.filterTours', 'Filter Tours')}</SheetTitle>
                <SheetDescription>
                  {t('tours.filterDescription', 'Refine your search to find the perfect tour')}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <FilterSection />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block w-80 shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('tours.filters', 'Filters')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FilterSection />
            </CardContent>
          </Card>
        </div>

        {/* Tours Grid/List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('tours.showingResults', 'Showing {{count}} tours', { count: filteredTours.length })}
              </h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-0">
                {filteredTours.length} {filteredTours.length === 1 ? 'tour' : 'tours'} found
              </Badge>
            </div>
            {toursError && (
              <p className="text-red-500 text-sm bg-red-50 px-3 py-1 rounded-lg">
                Error loading tours: {toursError.message}
              </p>
            )}
          </div>

          {filteredTours.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
                <Search className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {t('tours.noResults', 'No tours found')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('tours.noResultsDesc', 'Try adjusting your filters or search terms to find the perfect tour')}
                </p>
                <Button 
                  onClick={clearFilters} 
                  variant="outline"
                  className="bg-white hover:bg-gray-50 border-gray-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('tours.clearFilters', 'Clear All Filters')}
                </Button>
              </div>
            </div>
          ) : (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" 
                : "space-y-8"
            }>
              {filteredTours.map((tour: Tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tours;