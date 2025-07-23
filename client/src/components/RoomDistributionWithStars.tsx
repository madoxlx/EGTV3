
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Bed, CheckCircle2 } from "lucide-react";

type Room = {
  id: number;
  name: string;
  type: string;
  max_occupancy: number;
  max_adults: number;
  max_children: number;
  max_infants: number;
  price: number;
  hotel_id: number;
  description?: string;
  customPrice?: number;
  maxOccupancy?: number;
  maxAdults?: number;
  maxChildren?: number;
  maxInfants?: number;
  originalPrice?: number;
  amenities?: string[] | string;
  currency?: string;
  imageUrl?: string;
};

type Hotel = {
  id: number;
  name: string;
  stars: number;
  city: string;
  country: string;
};

type Package = {
  id: number;
  selectedHotels?: number[] | string | null;
  rooms?: Room[] | string | null;
};

interface RoomDistributionWithStarsProps {
  packageData: Package;
  selectedRooms: string[];
  onRoomSelect: (rooms: string[]) => void;
  validationError?: string;
  adults?: number;
  children?: number;
  infants?: number;
}

export default function RoomDistributionWithStars({
  packageData,
  selectedRooms,
  onRoomSelect,
  validationError,
  adults = 4,
  children = 0,
  infants = 0,
}: RoomDistributionWithStarsProps) {
  // Fetch all rooms data
  const { data: allRooms = [], isLoading: isLoadingRooms } = useQuery<Room[]>({
    queryKey: ["/api/admin/rooms"],
    retry: 1,
  });

  // Fetch hotels data to get star ratings
  const { data: hotels = [], isLoading: isLoadingHotels } = useQuery<Hotel[]>({
    queryKey: ["/api/admin/hotels"],
    retry: 1,
  });

  // Get package included hotels
  const getIncludedHotels = (): number[] => {
    if (!packageData.selectedHotels) return [];

    if (typeof packageData.selectedHotels === "string") {
      try {
        const parsed = JSON.parse(packageData.selectedHotels);
        return Array.isArray(parsed) ? parsed.map((h) => Number(h)) : [];
      } catch (e) {
        console.log(
          "Could not parse selectedHotels:",
          packageData.selectedHotels,
        );
        return [];
      }
    }

    return Array.isArray(packageData.selectedHotels)
      ? packageData.selectedHotels.map((h) => Number(h))
      : [];
  };

  // Get package included rooms with actual database values
  const getIncludedRooms = (): Room[] => {
    if (!packageData.rooms) return [];

    let packageRooms: Room[] = [];

    if (typeof packageData.rooms === "string") {
      try {
        packageRooms = JSON.parse(packageData.rooms);
      } catch (e) {
        console.log("Could not parse rooms:", packageData.rooms);
        return [];
      }
    } else if (Array.isArray(packageData.rooms)) {
      packageRooms = packageData.rooms;
    }

    if (!Array.isArray(packageRooms) || packageRooms.length === 0) {
      return [];
    }

    // Filter allRooms to include only those specified in package
    const packageRoomIds = packageRooms.map((room) => room.id);
    const filteredRooms = allRooms.filter((room) =>
      packageRoomIds.includes(room.id),
    );

    // Merge room data with package customizations, prioritizing actual database values
    return filteredRooms.map((dbRoom) => {
      const packageRoom = packageRooms.find((pr) => pr.id === dbRoom.id);
      return {
        ...dbRoom,
        // Use actual database values for capacity and occupancy
        max_occupancy: dbRoom.max_occupancy,
        max_adults: dbRoom.max_adults,
        max_children: dbRoom.max_children,
        max_infants: dbRoom.max_infants,
        // Price handling - use custom price if available, otherwise database price
        customPrice: packageRoom?.customPrice || packageRoom?.price,
        originalPrice: dbRoom.price,
        price: packageRoom?.customPrice || packageRoom?.price || dbRoom.price,
        // Keep package customizations if they exist
        ...(packageRoom && {
          description: packageRoom.description || dbRoom.description,
          imageUrl: packageRoom.imageUrl || dbRoom.imageUrl,
        }),
      };
    });
  };

  // Get final rooms to display - either from package rooms or from package hotels
  const getDisplayRooms = (): Room[] => {
    const packageRooms = getIncludedRooms();

    if (packageRooms.length > 0) {
      return packageRooms;
    }

    // Fallback: show rooms from package hotels
    const includedHotelIds = getIncludedHotels();
    if (includedHotelIds.length > 0) {
      return allRooms.filter((room) =>
        includedHotelIds.includes(room.hotel_id),
      );
    }

    return [];
  };

  const rooms = getDisplayRooms();

  // Calculate automatic room distribution
  const calculateRoomDistribution = () => {
    if (rooms.length === 0) return [];

    // Sort rooms by capacity (highest to lowest)
    const sortedRooms = [...rooms].sort((a, b) => b.max_adults - a.max_adults);
    
    let remainingAdults = adults;
    let remainingChildren = children;
    let remainingInfants = infants;
    
    const distribution = sortedRooms.map(room => {
      let assignedAdults = 0;
      let assignedChildren = 0;
      let assignedInfants = 0;
      
      // First, try to assign adults up to room capacity
      if (remainingAdults > 0 && room.max_adults > 0) {
        assignedAdults = Math.min(remainingAdults, room.max_adults);
        remainingAdults -= assignedAdults;
      }
      
      // Then assign children if there's space
      const remainingCapacity = room.max_occupancy - assignedAdults;
      if (remainingChildren > 0 && remainingCapacity > 0 && room.max_children > 0) {
        assignedChildren = Math.min(remainingChildren, Math.min(remainingCapacity, room.max_children));
        remainingChildren -= assignedChildren;
      }
      
      // Finally assign infants if there's space
      const finalRemainingCapacity = room.max_occupancy - assignedAdults - assignedChildren;
      if (remainingInfants > 0 && finalRemainingCapacity > 0 && room.max_infants > 0) {
        assignedInfants = Math.min(remainingInfants, Math.min(finalRemainingCapacity, room.max_infants));
        remainingInfants -= assignedInfants;
      }
      
      const totalAssigned = assignedAdults + assignedChildren + assignedInfants;
      const totalCost = totalAssigned * (room.customPrice || room.price);
      
      return {
        room,
        assignedAdults,
        assignedChildren,
        assignedInfants,
        totalAssigned,
        totalCost,
        isUsed: totalAssigned > 0
      };
    });
    
    return distribution;
  };

  const roomDistribution = calculateRoomDistribution();

  // Group room distribution by hotel for better organization
  const distributionByHotel = roomDistribution.reduce(
    (acc, dist) => {
      const hotelId = dist.room.hotel_id;
      if (!acc[hotelId]) {
        acc[hotelId] = [];
      }
      acc[hotelId].push(dist);
      return acc;
    },
    {} as Record<number, any[]>,
  );

  // Memoize the used room IDs to prevent infinite re-renders
  const usedRoomIds = React.useMemo(() => {
    return roomDistribution
      .filter(dist => dist.isUsed)
      .map(dist => dist.room.id.toString());
  }, [roomDistribution]);

  // Automatically select used rooms for the booking process
  React.useEffect(() => {
    const currentRoomIds = [...selectedRooms].sort();
    const newRoomIds = [...usedRoomIds].sort();
    
    if (JSON.stringify(currentRoomIds) !== JSON.stringify(newRoomIds)) {
      onRoomSelect(usedRoomIds);
    }
  }, [usedRoomIds, selectedRooms, onRoomSelect]);

  // Get hotel info for a room
  const getHotelInfo = (hotelId: number) => {
    // Handle type mismatch between number and string IDs
    const hotel = hotels.find((h) => {
      const hId = typeof h.id === "string" ? Number(h.id) : h.id;
      return hId === hotelId;
    });
    if (!hotel) {
      console.warn(`Hotel not found for ID: ${hotelId}`);
      return null;
    }

    // Ensure we have the actual star rating from the database
    return {
      ...hotel,
      stars: hotel.stars || 0, // Use the actual stars field from the hotel record
    };
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (isLoadingRooms || isLoadingHotels) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {validationError && (
        <div className="text-sm text-red-500 mb-2">{validationError}</div>
      )}

      {/* Header indicating included rooms */}
      {rooms.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Hotel Package
          </h3>
        </div>
      )}

      {Object.entries(distributionByHotel).map(([hotelId, hotelDistributions]) => {
        const hotel = getHotelInfo(Number(hotelId));

        // Debug: Log hotel data to verify star ratings
        if (hotel) {
          console.log(
            `Hotel ${hotel.name} (ID: ${hotelId}) - Stars: ${hotel.stars}`,
          );
        } else {
          console.warn(`No hotel found for hotel ID: ${hotelId}`);
        }

        return (
          <div key={hotelId} className="space-y-2">
            {hotel && (
              <div className="mb-3">
                <h4 className="font-medium text-gray-900 mb-1">
                  some hotel in {hotel.city}
                </h4>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(hotel.stars || 0)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {hotel.city}, {hotel.country}
                  </span>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              {hotelDistributions.map((distribution: any) => {
                const { room, assignedAdults, assignedChildren, assignedInfants, totalAssigned, totalCost, isUsed } = distribution;
                const displayPrice = room.customPrice || room.price;

                return (
                  <div
                    key={room.id}
                    className={`border rounded-lg p-4 ${
                      isUsed
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">
                          {room.name}
                        </div>
                        {/* Hotel star rating under room name */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            {renderStars(hotel?.stars || 0)}
                          </div>
                          <span>
                            {hotel?.stars
                              ? `(${hotel.stars} Star Hotel)`
                              : "(Hotel)"}
                          </span>
                        </div>
                        
                        {/* Room capacity information */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>Max: {room.max_occupancy} people</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span>{room.type}</span>
                          </div>
                        </div>

                        {/* Distribution Assignment */}
                        <div className="bg-white border border-gray-200 rounded-md p-3 mb-2">
                          <div className="text-sm font-medium mb-1">
                            {isUsed ? "Assigned Travelers:" : "Not Used"}
                          </div>
                          {isUsed ? (
                            <div className="space-y-1 text-sm text-gray-700">
                              {assignedAdults > 0 && (
                                <div>• {assignedAdults} adult{assignedAdults !== 1 ? 's' : ''}</div>
                              )}
                              {assignedChildren > 0 && (
                                <div>• {assignedChildren} child{assignedChildren !== 1 ? 'ren' : ''}</div>
                              )}
                              {assignedInfants > 0 && (
                                <div>• {assignedInfants} infant{assignedInfants !== 1 ? 's' : ''}</div>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                Total: {totalAssigned} / {room.max_occupancy} capacity
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              0 travelers assigned
                            </div>
                          )}
                        </div>

                        {room.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {room.description}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="font-semibold text-gray-900">
                          {displayPrice ? displayPrice.toLocaleString("en-US") : "0"}{" "}
                          {room.currency || "EGP"}
                          <div className="text-xs text-gray-500 leading-none">
                            /per person
                          </div>
                        </div>
                        {isUsed && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                            <div className="text-sm font-medium text-blue-900">
                              Total Cost: {totalCost.toLocaleString("en-US")} {room.currency || "EGP"}
                            </div>
                            <div className="text-xs text-blue-700">
                              ({totalAssigned} × {displayPrice} {room.currency || "EGP"})
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {Object.keys(distributionByHotel).length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              Package Includes Accommodation
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Room selection and accommodation details will be confirmed during
            booking. Your package includes hotel accommodation as specified in
            the package description.
          </p>
        </div>
      )}
    </div>
  );
}
