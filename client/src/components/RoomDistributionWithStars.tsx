import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Bed } from 'lucide-react';

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
};

type Hotel = {
  id: number;
  name: string;
  stars: number;
  city: string;
  country: string;
};

interface RoomDistributionWithStarsProps {
  packageId: number;
  selectedRoom: string;
  onRoomSelect: (room: string) => void;
  validationError?: string;
}

export default function RoomDistributionWithStars({ 
  packageId, 
  selectedRoom, 
  onRoomSelect, 
  validationError 
}: RoomDistributionWithStarsProps) {
  // Fetch rooms data
  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery<Room[]>({
    queryKey: ['/api/admin/rooms'],
    retry: 1,
  });

  // Fetch hotels data to get star ratings
  const { data: hotels = [], isLoading: isLoadingHotels } = useQuery<Hotel[]>({
    queryKey: ['/api/admin/hotels'],
    retry: 1,
  });

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
    const roomInfo = `${room.name} - ${room.max_adults} adults, ${room.max_children} children`;
    onRoomSelect(roomInfo);
  };

  return (
    <div className="space-y-4">
      {validationError && (
        <div className="text-sm text-red-500 mb-2">{validationError}</div>
      )}

      {Object.entries(roomsByHotel).map(([hotelId, hotelRooms]) => {
        const hotel = getHotelInfo(Number(hotelId));
        
        return (
          <div key={hotelId} className="space-y-2">
            {hotel && (
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-sm">{hotel.name}</h4>
                <div className="flex items-center gap-1">
                  {renderStars(hotel.stars || 0)}
                </div>
                <Badge variant="outline" className="text-xs">
                  {hotel.city}, {hotel.country}
                </Badge>
              </div>
            )}

            <div className="grid gap-2">
              {hotelRooms.map((room) => {
                const roomInfo = `${room.name} - ${room.max_adults} adults, ${room.max_children} children`;
                const isSelected = selectedRoom === roomInfo;

                return (
                  <Card 
                    key={room.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleRoomSelection(room)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-sm">{room.name}</h5>
                            <Badge variant="secondary" className="text-xs">
                              {room.type}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Bed className="w-3 h-3" />
                              <span>Max {room.max_occupancy}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{room.max_adults}A</span>
                              {room.max_children > 0 && <span>, {room.max_children}C</span>}
                              {room.max_infants > 0 && <span>, {room.max_infants}I</span>}
                            </div>
                          </div>

                          {room.description && (
                            <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                              {room.description}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="font-medium text-sm text-primary">
                            {(room.price / 100).toLocaleString('en-US')} EGP
                          </div>
                          <div className="text-xs text-gray-500">per night</div>
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
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No rooms available for this package.</p>
        </div>
      )}
    </div>
  );
}