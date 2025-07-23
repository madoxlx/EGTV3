
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Bed, CheckCircle2, AlertTriangle } from "lucide-react";

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
  duration?: number;
  durationType?: string;
};

interface RoomDistributionWithStarsProps {
  packageData: Package;
  selectedRooms: string[];
  onRoomSelect: (rooms: string[]) => void;
  validationError?: string;
  adults?: number;
  children?: number;
  infants?: number;
  startDate?: string;
  endDate?: string;
}

export default function RoomDistributionWithStars({
  packageData,
  selectedRooms,
  onRoomSelect,
  validationError,
  adults = 4,
  children = 0,
  infants = 0,
  startDate,
  endDate,
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

  // Calculate nights from date range or use package duration
  const nights = React.useMemo(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays); // At least 1 night
    }
    // Use package duration if available
    if (packageData?.duration && packageData?.durationType === 'days') {
      return Math.max(1, packageData.duration - 1); // Convert days to nights
    }
    return 3; // Default fallback to 3 nights
  }, [startDate, endDate, packageData?.duration, packageData?.durationType]);

  // Calculate automatic room distribution
  const calculateRoomDistribution = React.useCallback(() => {
    if (rooms.length === 0) return [];

    const totalTravelers = adults + children + infants;
    const totalRoomCapacity = rooms.reduce((sum, room) => sum + room.max_occupancy, 0);
    
    // Check if travelers exceed total room capacity
    if (totalTravelers > totalRoomCapacity) {
      return { 
        capacityExceeded: true, 
        totalTravelers, 
        totalRoomCapacity,
        rooms: [] 
      };
    }

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
      
      // Assign children/infants with adults first (preferred arrangement)
      if (assignedAdults > 0) {
        // Then assign children if there's space and adults present
        const remainingCapacity = room.max_occupancy - assignedAdults;
        if (remainingChildren > 0 && remainingCapacity > 0 && room.max_children > 0) {
          assignedChildren = Math.min(remainingChildren, Math.min(remainingCapacity, room.max_children));
          remainingChildren -= assignedChildren;
        }
        
        // Finally assign infants if there's space and adults present
        const finalRemainingCapacity = room.max_occupancy - assignedAdults - assignedChildren;
        if (remainingInfants > 0 && finalRemainingCapacity > 0 && room.max_infants > 0) {
          assignedInfants = Math.min(remainingInfants, Math.min(finalRemainingCapacity, room.max_infants));
          remainingInfants -= assignedInfants;
        }
      }
      
      const totalAssigned = assignedAdults + assignedChildren + assignedInfants;
      const pricePerPerson = room.customPrice || room.price;
      const totalCostPerNight = totalAssigned * pricePerPerson;
      const totalCost = totalCostPerNight * nights;
      
      // Check if room has children/infants without adults (invalid assignment)
      const hasAdultRequirementIssue = (assignedChildren > 0 || assignedInfants > 0) && assignedAdults === 0;
      
      return {
        room,
        assignedAdults,
        assignedChildren,
        assignedInfants,
        totalAssigned,
        totalCost,
        totalCostPerNight,
        pricePerPerson,
        hasAdultRequirementIssue,
        isUsed: totalAssigned > 0
      };
    });

    // Second pass: assign ALL remaining children/infants to available rooms
    // and mark these as requiring additional adults
    let loopCounter = 0;
    const maxLoops = 50; // Safety counter to prevent infinite loops
    
    while ((remainingChildren > 0 || remainingInfants > 0) && 
           distribution.some(d => d.room.max_occupancy - d.totalAssigned > 0) && 
           loopCounter < maxLoops) {
      loopCounter++;
      // Find room with most available capacity
      const availableRooms = distribution.filter(d => d.room.max_occupancy - d.totalAssigned > 0);
      if (availableRooms.length === 0) break;
      
      // Sort by available capacity (highest first)
      availableRooms.sort((a, b) => (b.room.max_occupancy - b.totalAssigned) - (a.room.max_occupancy - a.totalAssigned));
      
      for (const roomDist of availableRooms) {
        if (remainingChildren === 0 && remainingInfants === 0) break;
        
        const { room } = roomDist;
        const currentCapacity = roomDist.totalAssigned;
        const availableCapacity = room.max_occupancy - currentCapacity;
        
        // Assign remaining children first
        if (remainingChildren > 0 && availableCapacity > 0 && room.max_children > 0) {
          const maxChildrenInRoom = Math.min(room.max_children - roomDist.assignedChildren, availableCapacity);
          const canAssignChildren = Math.min(remainingChildren, maxChildrenInRoom);
          
          if (canAssignChildren > 0) {
            roomDist.assignedChildren += canAssignChildren;
            remainingChildren -= canAssignChildren;
            
            // Update totals
            roomDist.totalAssigned += canAssignChildren;
            roomDist.totalCostPerNight = roomDist.totalAssigned * roomDist.pricePerPerson;
            roomDist.totalCost = roomDist.totalCostPerNight * nights;
            roomDist.isUsed = true;
            
            // Mark as requiring adult if no adults in room
            if (roomDist.assignedAdults === 0) {
              roomDist.hasAdultRequirementIssue = true;
            }
          }
        }
        
        // Then assign remaining infants
        const updatedAvailableCapacity = room.max_occupancy - roomDist.totalAssigned;
        if (remainingInfants > 0 && updatedAvailableCapacity > 0 && room.max_infants > 0) {
          const maxInfantsInRoom = Math.min(room.max_infants - roomDist.assignedInfants, updatedAvailableCapacity);
          const canAssignInfants = Math.min(remainingInfants, maxInfantsInRoom);
          
          if (canAssignInfants > 0) {
            roomDist.assignedInfants += canAssignInfants;
            remainingInfants -= canAssignInfants;
            
            // Update totals
            roomDist.totalAssigned += canAssignInfants;
            roomDist.totalCostPerNight = roomDist.totalAssigned * roomDist.pricePerPerson;
            roomDist.totalCost = roomDist.totalCostPerNight * nights;
            roomDist.isUsed = true;
            
            // Mark as requiring adult if no adults in room
            if (roomDist.assignedAdults === 0) {
              roomDist.hasAdultRequirementIssue = true;
            }
          }
        }
      }
    }
    
    return { capacityExceeded: false, rooms: distribution };
  }, [rooms, adults, children, infants, nights]);

  const roomDistribution = React.useMemo(() => calculateRoomDistribution(), [calculateRoomDistribution]);

  // Check if capacity is exceeded
  const isCapacityExceeded = Array.isArray(roomDistribution) ? false : roomDistribution?.capacityExceeded || false;
  const actualDistribution = Array.isArray(roomDistribution) ? roomDistribution : roomDistribution?.rooms || [];

  // Group room distribution by hotel for better organization
  const distributionByHotel = actualDistribution.reduce(
    (acc: Record<number, any[]>, dist: any) => {
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
    return actualDistribution
      .filter((dist: any) => dist.isUsed)
      .map((dist: any) => dist.room.id.toString());
  }, [actualDistribution]);

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

      {/* Capacity Exceeded Warning */}
      {isCapacityExceeded && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-900">
              Package Not Suitable for Your Group Size
            </h3>
          </div>
          
          <div className="bg-white border border-orange-200 rounded-md p-4 mb-4">
            <div className="text-sm text-orange-800">
              <p className="mb-2">
                <strong>Total travelers:</strong> {roomDistribution?.totalTravelers || 0}
              </p>
              <p className="mb-2">
                <strong>Maximum package capacity:</strong> {roomDistribution?.totalRoomCapacity || 0}
              </p>
              <p className="text-orange-700">
                This package cannot accommodate your group size. Please contact us to find a suitable alternative.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-orange-800 font-medium">
              Contact us through our channels and describe what you desire:
            </p>
            
            <div className="flex flex-wrap gap-3">
              <a
                href="https://facebook.com/saharajourneys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
              
              <a
                href="https://instagram.com/saharajourneys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.197-1.559-.187-.237-.318-.507-.39-.796-.072-.289-.084-.592-.035-.888.098-.592.394-1.139.835-1.543.441-.404.999-.658 1.576-.717.289-.029.582-.014.865.045.283.059.551.162.793.305.484.286.865.722 1.076 1.23.211.508.24 1.071.082 1.6-.158.529-.479 1.002-.907 1.335-.428.333-.962.526-1.507.526-.129 0-.257-.008-.384-.025-.254-.033-.502-.099-.738-.195-.472-.192-.888-.501-1.199-.889-.311-.388-.506-.855-.563-1.344-.057-.489.015-.987.207-1.434.192-.447.494-.838.871-1.126.377-.288.826-.464 1.295-.508.469-.044.944.024 1.369.196.425.172.799.441 1.078.776.279.335.452.735.498 1.153.046.418-.016.84-.179 1.223-.163.383-.417.719-.732.971-.315.252-.687.414-1.074.467-.387.053-.782.003-1.139-.144-.357-.147-.667-.378-.896-.666-.229-.288-.371-.632-.409-.99-.038-.358.028-.719.191-1.041.163-.322.415-.592.727-.781.312-.189.672-.291 1.038-.295.366-.004.73.091 1.051.274.321.183.593.451.784.773.191.322.294.691.298 1.065.004.374-.092.744-.277 1.071-.185.327-.451.604-.768.8-.317.196-.681.306-1.051.318-.37.012-.741-.081-1.073-.269-.332-.188-.614-.467-.815-.805-.201-.338-.316-.726-.332-1.119-.016-.393.075-.784.263-1.131.188-.347.467-.641.806-.851.339-.21.731-.331 1.133-.349.402-.018.804.072 1.163.261.359.189.666.467.888.803.222.336.354.725.381 1.122.027.397-.038.796-.188 1.157-.15.361-.384.681-.678.927-.294.246-.645.412-1.015.479-.37.067-.751.032-1.101-.101-.35-.133-.659-.354-.894-.639-.235-.285-.392-.626-.454-.984-.062-.358-.025-.725.106-1.063.131-.338.349-.635.629-.859.28-.224.618-.371.976-.426.358-.055.725-.016 1.061.112.336.128.633.338.859.607.226.269.376.592.434.933.058.341.022.691-.104 1.006-.126.315-.33.593-.589.804-.259.211-.568.349-.893.399-.325.05-.657.011-.952-.112-.295-.123-.554-.315-.748-.554-.194-.239-.319-.526-.361-.826-.042-.3-.001-.606.118-.882.119-.276.306-.515.541-.691.235-.176.515-.285.808-.314.293-.029.589.016.852.131.263.115.492.288.662.5.17.212.277.461.309.721.032.26-.007.523-.113.761-.106.238-.268.446-.468.603-.2.157-.437.258-.685.292-.248.034-.5.002-.728-.094-.228-.096-.428-.244-.578-.427-.15-.183-.246-.403-.277-.634-.031-.231.007-.466.110-.674.103-.208.261-.382.456-.503.195-.121.425-.186.663-.187.238-.001.475.062.683.182.208.12.381.292.497.497.116.205.171.439.158.674-.013.235-.084.464-.205.662-.121.198-.288.361-.481.471-.193.11-.413.165-.636.158-.223-.007-.442-.076-.632-.200-.19-.124-.345-.297-.447-.499-.102-.202-.147-.428-.130-.654.017-.226.089-.445.208-.632.119-.187.281-.337.467-.431.186-.094.394-.128.604-.098.21.03.411.119.580.256.169.137.302.319.383.525.081.206.107.432.074.652-.033.22-.123.429-.260.602-.137.173-.318.305-.521.381-.203.076-.425.092-.642.045-.217-.047-.425-.148-.599-.291-.174-.143-.310-.329-.391-.537-.081-.208-.104-.436-.066-.658.038-.222.127-.434.257-.613.13-.179.302-.320.496-.407.194-.087.408-.117.621-.086.213.031.419.118.591.252.172.134.308.314.391.520.083.206.111.432.081.652-.03.22-.115.432-.246.608-.131.176-.306.310-.505.386-.199.076-.417.090-.630.040-.213-.05-.418-.152-.588-.293-.17-.141-.304-.323-.386-.531-.082-.208-.109-.436-.077-.657.032-.221.120-.433.254-.611.134-.178.313-.317.515-.401.202-.084.424-.109.642-.072.218.037.428.128.605.263.177.135.317.314.403.520.086.206.116.432.087.653-.029.221-.113.434-.242.612-.129.178-.303.314-.501.392-.198.078-.414.094-.626.046-.212-.048-.415-.148-.585-.289-.17-.141-.305-.322-.388-.529-.083-.207-.111-.434-.081-.655.03-.221.115-.433.247-.611.132-.178.309-.316.512-.399.203-.083.425-.107.643-.069.218.038.428.130.606.266.178.136.319.316.405.522.086.206.116.433.087.654-.029.221-.113.434-.242.613-.129.179-.303.315-.501.393-.198.078-.414.094-.626.047-.212-.047-.415-.147-.585-.288-.17-.141-.305-.322-.388-.528-.083-.206-.111-.433-.081-.654.03-.221.115-.433.247-.611.132-.178.309-.316.512-.399.203-.083.425-.107.643-.069z"/>
                </svg>
                Instagram
              </a>
              
              <a
                href="https://wa.me/201152117102?text=Hello, I need help with a travel package for a large group"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.386"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Header indicating included rooms */}
      {!isCapacityExceeded && rooms.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Hotel Package
          </h3>
        </div>
      )}

      {!isCapacityExceeded && Object.entries(distributionByHotel).map(([hotelId, hotelDistributions]) => {
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
                const { room, assignedAdults, assignedChildren, assignedInfants, totalAssigned, totalCost, totalCostPerNight, pricePerPerson, hasAdultRequirementIssue, isUsed } = distribution;
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
                              {/* Adult requirement warning */}
                              {hasAdultRequirementIssue && (
                                <div className="text-xs text-orange-600 mt-1 bg-orange-50 border border-orange-200 rounded px-2 py-1">
                                  ⚠️ Requires additional adult - booking cannot proceed without adult supervision
                                </div>
                              )}
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
                              ({totalAssigned} × {displayPrice} {room.currency || "EGP"} × {nights} night{nights !== 1 ? 's' : ''})
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              Per night: {totalCostPerNight.toLocaleString("en-US")} {room.currency || "EGP"}
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

      {/* Check if any rooms require additional adults */}
      {(() => {
        const roomsRequiringAdults = Object.values(distributionByHotel)
          .flat()
          .filter((dist: any) => dist.hasAdultRequirementIssue);
        
        if (roomsRequiringAdults.length > 0) {
          const totalChildrenWithoutAdults = roomsRequiringAdults.reduce((total: number, room: any) => 
            total + (room.assignedAdults === 0 ? room.assignedChildren : 0), 0
          );
          const totalInfantsWithoutAdults = roomsRequiringAdults.reduce((total: number, room: any) => 
            total + (room.assignedAdults === 0 ? room.assignedInfants : 0), 0
          );
          const requiredAdults = roomsRequiringAdults.filter((room: any) => room.assignedAdults === 0).length;
          
          return (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  Adult Supervision Required
                </span>
              </div>
              <p className="text-sm text-orange-800">
                {totalChildrenWithoutAdults > 0 && totalInfantsWithoutAdults > 0 ? (
                  <>We've assigned {totalChildrenWithoutAdults} children and {totalInfantsWithoutAdults} infants to rooms without adult supervision. </>
                ) : totalChildrenWithoutAdults > 0 ? (
                  <>We've assigned {totalChildrenWithoutAdults} children to rooms without adult supervision. </>
                ) : totalInfantsWithoutAdults > 0 ? (
                  <>We've assigned {totalInfantsWithoutAdults} infants to rooms without adult supervision. </>
                ) : (
                  <>Some rooms have children or infants without adult supervision. </>
                )}
                Please add {requiredAdults} more adult(s) to proceed with booking, or adjust traveler numbers.
              </p>
            </div>
          );
        }
        return null;
      })()}

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
