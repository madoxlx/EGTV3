import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  Star,
  Users,
  CheckCircle2,
  Baby,
  Heart,
  DollarSign,
} from "lucide-react";

type Tour = {
  id: number;
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  adultPrice?: number;
  childPrice?: number;
  infantPrice?: number;
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

type Package = {
  id: number;
  selectedTourId?: number | null;
  tourSelection?: string | null;
  includedFeatures?: string[] | null;
  inclusions?: string[] | null;
};

interface IncludedToursProps {
  packageData: Package;
}

export default function IncludedTours({ packageData }: IncludedToursProps) {
  // Fetch all tours
  const { data: tours = [], isLoading: isLoadingTours } = useQuery<Tour[]>({
    queryKey: ["/api/tours"],
    retry: 1,
  });

  // Fetch destinations for tour location info
  const { data: destinations = [] } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
    retry: 1,
  });

  // Get destination name by ID
  const getDestinationName = (destinationId?: number) => {
    if (!destinationId) return "Various Locations";
    const destination = destinations.find((d) => d.id === destinationId);
    return destination
      ? `${destination.name}, ${destination.country}`
      : "Various Locations";
  };

  // Get tours included in this package
  const getIncludedTours = () => {
    // If there's a specific selectedTourId, return that tour
    if (packageData.selectedTourId) {
      const selectedTour = tours.find(
        (tour) => tour.id === packageData.selectedTourId,
      );
      return selectedTour ? [selectedTour] : [];
    }

    // If there's tourSelection data, parse it
    if (packageData.tourSelection) {
      try {
        const tourIds = JSON.parse(packageData.tourSelection);
        if (Array.isArray(tourIds)) {
          return tours.filter((tour) => tourIds.includes(tour.id));
        }
      } catch (e) {
        console.log(
          "Could not parse tourSelection:",
          packageData.tourSelection,
        );
      }
    }

    // Look for tour-related items in inclusions or includedFeatures
    const tourKeywords = ["tour", "excursion", "visit", "trip", "guided"];
    const allInclusions = [
      ...(packageData.includedFeatures || []),
      ...(packageData.inclusions || []),
    ];

    const tourInclusions = allInclusions.filter((item) =>
      tourKeywords.some((keyword) =>
        item.toLowerCase().includes(keyword.toLowerCase()),
      ),
    );

    // If no specific tours found, return top-rated tours as suggestions
    if (tourInclusions.length === 0) {
      return tours
        .filter((tour) => tour.rating && tour.rating >= 4)
        .slice(0, 2);
    }

    // Return the first 2-3 tours as commonly included
    return tours.slice(0, 2);
  };

  const includedTours = getIncludedTours();

  if (isLoadingTours) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!includedTours || includedTours.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Package Includes
          </span>
        </div>
        <p className="text-sm text-blue-700">
          This package includes guided tours and activities. Specific tour
          details will be provided during booking confirmation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-800">
          Included Tours with Pricing
        </span>
      </div>

      {includedTours.map((tour) => (
        <Card key={tour.id} className="border-green-200 bg-green-50/50">
          <CardContent className="p-3">
            <div className="space-y-3">
              {/* Tour Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-green-800 line-clamp-1 mb-1">
                    {tour.name}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-green-700">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {typeof tour.duration === "string"
                          ? tour.duration
                          : `${tour.duration} days`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{getDestinationName(tour.destinationId)}</span>
                    </div>
                    {tour.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{tour.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs text-green-700 border-green-300"
                >
                  Included
                </Badge>
              </div>

              {/* Tour Description */}
              {tour.description && (
                <p className="text-xs text-green-600 line-clamp-2">
                  {tour.description}
                </p>
              )}

              {/* Tour Pricing Breakdown */}
              <div className="bg-white rounded-lg border border-green-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-700">
                    Tour Pricing per Person
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Adult Price */}
                  <div className="text-center p-2 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700">
                        Adult
                      </span>
                    </div>
                    <div className="text-xs text-blue-800 font-semibold">
                      {tour.adultPrice
                        ? `${(tour.adultPrice / 100).toLocaleString("en-US")} EGP`
                        : `${(tour.price / 100).toLocaleString("en-US")} EGP`}
                    </div>
                  </div>

                  {/* Child Price */}
                  <div className="text-center p-2 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Baby className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-medium text-green-700">
                        Child
                      </span>
                    </div>
                    <div className="text-xs text-green-800 font-semibold">
                      {tour.childPrice
                        ? `${(tour.childPrice / 100).toLocaleString("en-US")} EGP`
                        : `${Math.round((tour.price * 0.7) / 100).toLocaleString("en-US")} EGP`}
                    </div>
                    <div className="text-xs text-green-600">(2-12 years)</div>
                  </div>

                  {/* Infant Price */}
                  <div className="text-center p-2 bg-orange-50 border border-orange-200 rounded">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Heart className="h-3 w-3 text-orange-600" />
                      <span className="text-xs font-medium text-orange-700">
                        Infant
                      </span>
                    </div>
                    <div className="text-xs text-orange-800 font-semibold">
                      {tour.infantPrice
                        ? `${(tour.infantPrice / 100).toLocaleString("en-US")} EGP`
                        : "Free"}
                    </div>
                    <div className="text-xs text-orange-600">(0-2 years)</div>
                  </div>
                </div>

                {/* Tour Value Notice */}
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800 text-center">
                    <span className="font-medium">✓ Included in Package</span> -
                    No additional cost when booking this hotel package
                  </p>
                </div>
              </div>

              {/* Tour Features */}
              {tour.difficulty && (
                <div className="flex justify-center">
                  <Badge variant="secondary" className="text-xs">
                    {tour.difficulty}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
        <span className="font-medium">Note:</span> These tours are included in
        your package price. The pricing shown is for reference - you won't pay
        extra for these tours when booking this hotel package.
      </div>
    </div>
  );
}
