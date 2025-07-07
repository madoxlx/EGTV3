import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Destination } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Loader2, Heart, Map, MapPin, GlobeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

export default function DestinationsPage() {
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const [filter, setFilter] = useState<string>("all");
  
  // Favorites state management (localStorage-based)
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  
  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('destinationFavorites');
    if (savedFavorites) {
      try {
        const favoriteIds = JSON.parse(savedFavorites);
        setFavorites(new Set(favoriteIds));
      } catch (error) {
        console.error('Error loading destination favorites:', error);
      }
    }
  }, []);
  
  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('destinationFavorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);
  
  // Fetch all destinations
  const { data: destinations, isLoading } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Toggle favorite status
  const toggleFavorite = (destinationId: number, destinationName: string) => {
    const isCurrentlyFavorited = favorites.has(destinationId);
    
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(destinationId)) {
        newFavorites.delete(destinationId);
      } else {
        newFavorites.add(destinationId);
      }
      return newFavorites;
    });

    // Show toast notification outside of state update
    setTimeout(() => {
      if (isCurrentlyFavorited) {
        toast({
          title: "Removed from favorites",
          description: `${destinationName} has been removed from your favorites.`,
        });
      } else {
        toast({
          title: "Added to favorites",
          description: `${destinationName} has been added to your favorites.`,
        });
      }
    }, 0);
  };
  
  // Filter destinations
  const filteredDestinations = () => {
    if (!destinations) return [];
    if (filter === "favorites") {
      return destinations.filter(dest => favorites.has(dest.id));
    }
    return destinations;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className={`container mx-auto px-4 py-12 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">
          {t('destinations.title', 'Explore Destinations')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('destinations.subtitle', 'Discover the most breathtaking destinations across the Middle East and find your next adventure')}
        </p>
      </div>
      
      {/* Filter tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-muted inline-flex rounded-lg p-1">
          <button
            className={`px-4 py-2 rounded-md ${
              filter === "all" ? "bg-white shadow-sm" : ""
            }`}
            onClick={() => setFilter("all")}
          >
            <GlobeIcon className="w-4 h-4 inline mr-2" />
            {t('destinations.all', 'All Destinations')}
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              filter === "favorites" ? "bg-white shadow-sm" : ""
            }`}
            onClick={() => setFilter("favorites")}
          >
            <Heart className="w-4 h-4 inline mr-2" /> 
            {t('destinations.favorites', 'My Favorites')} ({favorites.size})
          </button>
        </div>
      </div>
      
      {filter === "favorites" && favorites.size === 0 && (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium mb-2">
            {t('destinations.noFavorites', 'No favorites yet')}
          </h3>
          <p className="text-muted-foreground mb-6">
            {t('destinations.noFavoritesDesc', 'Start adding destinations to your favorites to see them here')}
          </p>
          <Button onClick={() => setFilter("all")}>
            {t('destinations.explore', 'Explore Destinations')}
          </Button>
        </div>
      )}
      
      {/* Destinations grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations().map((destination) => (
          <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={destination.imageUrl || "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=800"} 
                alt={destination.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <Badge className="bg-primary text-white mb-2">{destination.country}</Badge>
                <h3 className="text-xl font-bold">{destination.name}</h3>
              </div>
              
              {/* Favorite button */}
              <button 
                onClick={() => toggleFavorite(destination.id, destination.name)}
                className={`absolute top-4 right-4 p-2 rounded-full shadow-md transition-colors ${
                  favorites.has(destination.id) 
                    ? 'bg-rose-100 hover:bg-rose-200' 
                    : 'bg-white/80 hover:bg-rose-50'
                }`}
              >
                <Heart 
                  size={20} 
                  className={`transition-colors ${
                    favorites.has(destination.id) 
                      ? 'text-rose-500 fill-rose-500' 
                      : 'text-rose-500'
                  }`} 
                />
              </button>
            </div>
            
            <CardContent className="pt-6">
              <p className="text-muted-foreground line-clamp-3">{destination.description}</p>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="w-full">
                <MapPin className="mr-2 h-4 w-4" /> Explore Packages
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}