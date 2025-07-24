import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Bed } from "lucide-react";

interface CartRoomDistributionProps {
  configuration?: {
    selectedRooms?: any[];
    hotelInfo?: {
      id: number;
      name: string;
      stars: number;
      city?: string;
    };
    roomDistribution?: any[];
    priceBreakdown?: {
      roomsCost: number;
      toursCost: number;
      total: number;
    };
  };
  adults: number;
  children: number;
  infants: number;
}

export default function CartRoomDistribution({ 
  configuration, 
  adults, 
  children, 
  infants 
}: CartRoomDistributionProps) {
  if (!configuration?.selectedRooms || !configuration?.hotelInfo) {
    return null;
  }

  const { selectedRooms, hotelInfo, roomDistribution } = configuration;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-3 space-y-3">
      {/* Hotel Information */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-sm text-gray-900">Hotel Package</h4>
          <p className="text-sm text-gray-600">{hotelInfo.name}</p>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(hotelInfo.stars)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-xs text-gray-500 ml-1">{hotelInfo.city}</span>
        </div>
      </div>

      {/* Room Distribution */}
      {roomDistribution && roomDistribution.length > 0 ? (
        <div className="space-y-2">
          {roomDistribution.filter(room => room.isUsed).map((room, index) => (
            <div key={index} className="bg-white rounded-md p-3 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-sm text-gray-900">{room.room?.name || 'Room'}</h5>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {room.pricePerPerson?.toLocaleString('ar-EG')} EGP
                  </div>
                  <div className="text-xs text-gray-500">per person</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(hotelInfo.stars)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">
                    Max {room.room?.max_occupancy || room.room?.maxOccupancy} people
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    Total Cost: {room.totalCost?.toLocaleString('ar-EG')} EGP
                  </div>
                </div>
              </div>

              {/* Assigned Travelers */}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-600 mb-1">Assigned Travelers:</div>
                <div className="flex gap-2">
                  {room.assignedAdults > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      • {room.assignedAdults} adult{room.assignedAdults > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {room.assignedChildren > 0 && (
                    <Badge variant="outline" className="text-xs">
                      • {room.assignedChildren} child{room.assignedChildren > 1 ? 'ren' : ''}
                    </Badge>
                  )}
                  {room.assignedInfants > 0 && (
                    <Badge variant="outline" className="text-xs">
                      • {room.assignedInfants} infant{room.assignedInfants > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Total: {room.totalAssigned} / {room.room?.max_occupancy || room.room?.maxOccupancy} capacity
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Fallback for simple room display
        <div className="space-y-2">
          {selectedRooms.map((room, index) => (
            <div key={index} className="bg-white rounded-md p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-sm text-gray-900">{room.name}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      {[...Array(hotelInfo.stars)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">
                      Max {room.max_occupancy || room.maxOccupancy} people
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {(room.customPrice || room.price)?.toLocaleString('ar-EG')} EGP
                  </div>
                  <div className="text-xs text-gray-500">per person</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total Travelers Summary */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Total Travelers:</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">
            {adults} Adults
          </Badge>
          {children > 0 && (
            <Badge variant="outline" className="text-xs">
              {children} Children
            </Badge>
          )}
          {infants > 0 && (
            <Badge variant="outline" className="text-xs">
              {infants} Infants
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}