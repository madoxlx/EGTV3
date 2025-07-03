import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Users, Bed, CheckCircle2 } from 'lucide-react';

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
}

export default function RoomDistributionWithStars({ 
  packageData, 
  selectedRooms, 
  onRoomSelect, 
  validationError 
}: RoomDistributionWithStarsProps) {
  // Fetch all rooms data
  const { data: allRooms = [], isLoading: isLoadingRooms } = useQuery<Room[]>({
    queryKey: ['/api/admin/rooms'],
    retry: 1,
  });

  // Fetch hotels data to get star ratings
  const { data: hotels = [], isLoading: isLoadingHotels } = useQuery<Hotel[]>({
    queryKey: ['/api/admin/hotels'],
    retry: 1,
  });

  // Get package included hotels
  const getIncludedHotels = (): number[] => {
    if (!packageData.selectedHotels) return [];
    
    if (typeof packageData.selectedHotels === 'string') {
      try {
        const parsed = JSON.parse(packageData.selectedHotels);
        return Array.isArray(parsed) ? parsed.map(h => Number(h)) : [];
      } catch (e) {
        console.log('Could not parse selectedHotels:', packageData.selectedHotels);
        return [];
      }
    }
    
    return Array.isArray(packageData.selectedHotels) ? 
      packageData.selectedHotels.map(h => Number(h)) : [];
  };

  // Get package included rooms
  const getIncludedRooms = (): Room[] => {
    if (!packageData.rooms) return [];
    
    let packageRooms: Room[] = [];
    
    if (typeof packageData.rooms === 'string') {
      try {
        packageRooms = JSON.parse(packageData.rooms);
      } catch (e) {
        console.log('Could not parse rooms:', packageData.rooms);
        return [];
      }
    } else if (Array.isArray(packageData.rooms)) {
      packageRooms = packageData.rooms;
    }

    if (!Array.isArray(packageRooms) || packageRooms.length === 0) {
      return [];
    }

    // Filter allRooms to include only those specified in package
    const packageRoomIds = packageRooms.map(room => room.id);
    const filteredRooms = allRooms.filter(room => packageRoomIds.includes(room.id));
    
    // Merge room data with package customizations
    return filteredRooms.map(room => {
      const packageRoom = packageRooms.find(pr => pr.id === room.id);
      return {
        ...room,
        customPrice: packageRoom?.customPrice || packageRoom?.price,
        originalPrice: room.price,
        ...(packageRoom && packageRoom)
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
      return allRooms.filter(room => includedHotelIds.includes(room.hotel_id));
    }

    return [];
  };

  const rooms = getDisplayRooms();

  // Get hotel info for a room
  const getHotelInfo = (hotelId: number) => {
    return hotels.find(h => h.id === hotelId);
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
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

  // Group rooms by hotel for better organization
  const roomsByHotel = rooms.reduce((acc, room) => {
    const hotelId = room.hotel_id;
    if (!acc[hotelId]) {
      acc[hotelId] = [];
    }
    acc[hotelId].push(room);
    return acc;
  }, {} as Record<number, Room[]>);

  const handleRoomSelection = (room: Room) => {
    const roomInfo = `${room.name} - ${room.max_adults || room.maxAdults} adults, ${room.max_children || room.maxChildren} children`;
    
    if (selectedRooms.includes(roomInfo)) {
      // Remove room if already selected
      onRoomSelect(selectedRooms.filter(r => r !== roomInfo));
    } else {
      // Add room to selection
      onRoomSelect([...selectedRooms, roomInfo]);
    }
  };

  return (
    <div className="space-y-4">
      {validationError && (
        <div className="text-sm text-red-500 mb-2">{validationError}</div>
      )}

      {/* Header indicating included rooms */}
      {rooms.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Included Rooms</span>
          <Badge variant="outline" className="text-xs text-green-700 border-green-300">
            {rooms.length} room{rooms.length !== 1 ? 's' : ''} available
          </Badge>
        </div>
      )}

      {Object.entries(roomsByHotel).map(([hotelId, hotelRooms]) => {
        const hotel = getHotelInfo(Number(hotelId));
        
        return (
          <div key={hotelId} className="space-y-2">
            {hotel && (
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-sm text-green-800">{hotel.name}</h4>
                <div className="flex items-center gap-1">
                  {renderStars(hotel.stars || 0)}
                </div>
                <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                  {hotel.city}, {hotel.country}
                </Badge>
              </div>
            )}

            <div className="grid gap-2">
              {hotelRooms.map((room) => {
                const roomInfo = `${room.name} - ${room.max_adults || room.maxAdults} adults, ${room.max_children || room.maxChildren} children`;
                const isSelected = selectedRooms.includes(roomInfo);
                const displayPrice = room.customPrice || room.price;

                return (
                  <Card 
                    key={room.id} 
                    className={`cursor-pointer transition-all hover:shadow-md border-green-200 bg-green-50/50 ${
                      isSelected ? 'ring-2 ring-green-500 bg-green-100/70' : ''
                    }`}
                    onClick={() => handleRoomSelection(room)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3 flex-1">
                          <Checkbox
                            id={`room-${room.id}`}
                            checked={isSelected}
                            onCheckedChange={() => handleRoomSelection(room)}
                            className="mt-1 border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-sm text-green-800">{room.name}</h5>
                              <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                                {room.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                                Included
                              </Badge>
                            </div>
                          
                          <div className="flex items-center gap-4 text-xs text-green-700 mb-2">
                            <div className="flex items-center gap-1">
                              <Bed className="w-3 h-3" />
                              <span>Max {room.max_occupancy || room.maxOccupancy}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{room.max_adults || room.maxAdults}A</span>
                              {(room.max_children || room.maxChildren || 0) > 0 && <span>, {room.max_children || room.maxChildren}C</span>}
                              {(room.max_infants || room.maxInfants || 0) > 0 && <span>, {room.max_infants || room.maxInfants}I</span>}
                            </div>
                          </div>

                          {room.description && (
                            <p className="text-xs text-green-600 line-clamp-1 mb-2">
                              {room.description}
                            </p>
                          )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-medium text-sm text-green-800">
                            {displayPrice ? (displayPrice / 100).toLocaleString('en-US') : '0'} EGP
                          </div>
                          <div className="text-xs text-green-600">per night</div>
                          {room.customPrice && room.originalPrice && room.customPrice !== room.originalPrice && (
                            <div className="text-xs text-gray-500 line-through">
                              {(room.originalPrice / 100).toLocaleString('en-US')} EGP
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {Object.keys(roomsByHotel).length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Package Includes Accommodation</span>
          </div>
          <p className="text-sm text-blue-700">
            Room selection and accommodation details will be confirmed during booking. 
            Your package includes hotel accommodation as specified in the package description.
          </p>
        </div>
      )}
      
      {rooms.length > 0 && (
        <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
          <span className="font-medium">Note:</span> These rooms are included in your package price. 
          Room assignments will be confirmed based on availability at the time of booking.
        </div>
      )}
    </div>
  );
}