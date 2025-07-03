import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Star, Users } from 'lucide-react';
import BookTourButton from '@/components/BookTourButton';

type TourItem = {
  id: number;
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  duration: string | number;
  destinationId?: number;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  slug?: string;
  difficulty?: string;
  maxGroupSize?: number;
};

type Destination = {
  id: number;
  name: string;
  country: string;
};

interface AvailableToursProps {
  packageId: number;
}

export default function AvailableTours({ packageId }: AvailableToursProps) {
  // Fetch all tours
  const { data: tours = [], isLoading: isLoadingTours } = useQuery<TourItem[]>({
    queryKey: ['/api/tours'],
    retry: 1,
  });

  // Fetch destinations for tour location info
  const { data: destinations = [] } = useQuery<Destination[]>({
    queryKey: ['/api/destinations'],
    retry: 1,
  });

  // Get destination name by ID
  const getDestinationName = (destinationId?: number) => {
    if (!destinationId) return 'Various Locations';
    const destination = destinations.find(d => d.id === destinationId);
    return destination ? `${destination.name}, ${destination.country}` : 'Various Locations';
  };

  if (isLoadingTours) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!tours || tours.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No tours available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Available Tours</h3>
      {tours.slice(0, 3).map((tour) => (
        <Card key={tour.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm line-clamp-1">{tour.name}</h4>
                  <div className="text-right">
                    <div className="font-semibold text-sm">
                      {tour.discountedPrice ? (
                        <>
                          <span className="text-primary">
                            {tour.discountedPrice.toLocaleString('en-US')} EGP
                          </span>
                          <span className="text-xs text-gray-500 line-through ml-1">
                            {tour.price.toLocaleString('en-US')} EGP
                          </span>
                        </>
                      ) : (
                        <span>{tour.price.toLocaleString('en-US')} EGP</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">per person</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{typeof tour.duration === 'string' ? tour.duration : `${tour.duration} days`}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{getDestinationName(tour.destinationId)}</span>
                  </div>
                  {tour.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{tour.rating}/5</span>
                      {tour.reviewCount && (
                        <span className="text-gray-400">({tour.reviewCount})</span>
                      )}
                    </div>
                  )}
                  {tour.maxGroupSize && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>Max {tour.maxGroupSize}</span>
                    </div>
                  )}
                </div>

                {tour.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {tour.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {tour.difficulty && (
                      <Badge variant="outline" className="text-xs">
                        {tour.difficulty}
                      </Badge>
                    )}
                  </div>
                  <BookTourButton 
                    tour={{
                      ...tour,
                      duration: typeof tour.duration === 'number' ? tour.duration.toString() : tour.duration || undefined
                    } as any} 
                    size="sm" 
                    variant="outline"
                  >
                    Add Tour
                  </BookTourButton>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {tours.length > 3 && (
        <div className="text-center pt-2">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/tours'}>
            View All Tours ({tours.length})
          </Button>
        </div>
      )}
    </div>
  );
}