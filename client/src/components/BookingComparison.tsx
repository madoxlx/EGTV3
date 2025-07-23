import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Users, DollarSign, TrendingDown, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

// Default configuration constants - fallback if package data unavailable
const DEFAULT_ROOM_RATES = {
  TRIPLE_ROOM: 800,
  DOUBLE_ROOM: 1000,
  PER_PERSON_RATE: 1000
} as const;

const DEFAULT_CONFIG = {
  DEFAULT_NIGHTS: 3
} as const;

// Interface for room types with capacity and pricing
interface RoomType {
  id?: number;
  name: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  available?: number; // Number of rooms available
}

// Room allocation result
interface RoomAllocation {
  roomType: RoomType;
  roomsNeeded: number;
  totalCapacity: number;
  totalCost: number;
}

interface OptimalAllocation {
  allocations: RoomAllocation[];
  totalCost: number;
  totalCapacity: number;
  isValid: boolean;
  costPerPerson: number;
}

interface PackageData {
  id: number;
  title: string;
  price: number;
  discountedPrice?: number | null;
  currency: string;
  duration?: number;
  durationType?: string;
  rooms?: any[] | null;
  hotels?: any[] | null;
}

interface BookingComparisonProps {
  adults: number;
  children: number;
  infants: number;
  startDate?: string;
  endDate?: string;
  packageData?: PackageData | null;
}

// Advanced dynamic room allocation algorithm with intelligent capacity handling
function findOptimalRoomAllocation(totalPeople: number, availableRooms: RoomType[], nights: number, adults: number = totalPeople, children: number = 0): OptimalAllocation {
  if (totalPeople === 0 || availableRooms.length === 0) {
    return {
      allocations: [],
      totalCost: 0,
      totalCapacity: 0,
      isValid: false,
      costPerPerson: 0
    };
  }

  // Use advanced room allocation with smart capacity calculation
  return findSmartRoomAllocation(totalPeople, availableRooms, nights, adults, children);
}

// Smart room allocation with intelligent capacity and combination logic
function findSmartRoomAllocation(totalPeople: number, availableRooms: RoomType[], nights: number, adults: number, children: number): OptimalAllocation {
  // Generate all possible room combinations and find the most cost-effective
  const allCombinations = generateAllRoomCombinations(availableRooms, totalPeople, adults, children);
  
  if (allCombinations.length === 0) {
    return fallbackAllocation(totalPeople, availableRooms, nights);
  }

  // Sort combinations by total cost (most economical first)
  const sortedCombinations = allCombinations.sort((a, b) => a.totalCost - b.totalCost);
  const bestCombination = sortedCombinations[0];

  // Convert to allocation format with nights calculation
  const allocations: RoomAllocation[] = bestCombination.rooms.map(room => ({
    roomType: room.roomType,
    roomsNeeded: room.count,
    totalCapacity: room.count * room.roomType.capacity,
    totalCost: room.count * room.roomType.pricePerNight * nights
  }));

  const totalCost = allocations.reduce((sum, alloc) => sum + alloc.totalCost, 0);
  const totalCapacity = allocations.reduce((sum, alloc) => sum + alloc.totalCapacity, 0);

  // For triple rooms with smart capacity, we need to check actual accommodation not just capacity
  const actuallyAccommodated = canActuallyAccommodateGroup(allocations, adults, children);
  
  return {
    allocations,
    totalCost,
    totalCapacity,
    isValid: actuallyAccommodated,
    costPerPerson: totalPeople > 0 ? totalCost / totalPeople : 0
  };
}

// Helper function to verify if allocations can actually accommodate the group
function canActuallyAccommodateGroup(allocations: RoomAllocation[], adults: number, children: number): boolean {
  let accommodatedAdults = 0;
  let accommodatedChildren = 0;
  
  for (const allocation of allocations) {
    const { roomType, roomsNeeded } = allocation;
    
    for (let i = 0; i < roomsNeeded; i++) {
      const remainingAdults = adults - accommodatedAdults;
      const remainingChildren = children - accommodatedChildren;
      
      if (remainingAdults === 0 && remainingChildren === 0) break;
      
      if (roomType.name.toLowerCase().includes('triple')) {
        // Triple room smart capacity: up to 4 people if 3 adults + 1 child  
        let adultsInRoom = Math.min(remainingAdults, 3);
        let childrenInRoom = 0;
        
        // If we have 3 adults, we can fit 1 more child (total 4)
        // Otherwise, children fill remaining capacity up to 3 total
        if (adultsInRoom === 3 && remainingChildren > 0) {
          childrenInRoom = Math.min(remainingChildren, 1); // Max 1 extra child
        } else {
          const remainingCapacity = 3 - adultsInRoom;
          childrenInRoom = Math.min(remainingChildren, remainingCapacity);
        }
        
        accommodatedAdults += adultsInRoom;
        accommodatedChildren += childrenInRoom;
      } else {
        // Standard capacity for other room types
        const capacity = roomType.capacity;
        const adultsToAdd = Math.min(remainingAdults, capacity);
        const childrenToAdd = Math.min(remainingChildren, capacity - adultsToAdd);
        
        accommodatedAdults += adultsToAdd;
        accommodatedChildren += childrenToAdd;
      }
    }
  }
  
  return accommodatedAdults >= adults && accommodatedChildren >= children;
}

// Generate all possible room combinations that can accommodate the group
function generateAllRoomCombinations(availableRooms: RoomType[], totalPeople: number, adults: number, children: number) {
  const combinations: Array<{
    rooms: Array<{ roomType: RoomType; count: number }>;
    totalCost: number;
    totalCapacity: number;
  }> = [];

  // Helper function to check if a room combination can accommodate the group
  function canAccommodateGroup(roomCombination: Array<{ roomType: RoomType; count: number }>): boolean {
    let accommodatedAdults = 0;
    let accommodatedChildren = 0;
    
    for (const { roomType, count } of roomCombination) {
      const roomCapacity = count * roomType.capacity;
      
      // Smart capacity logic based on room type
      if (roomType.name.toLowerCase().includes('triple')) {
        // Triple rooms can accommodate: 3 adults OR up to 4 people total (3 adults + 1 child)
        for (let i = 0; i < count; i++) {
          const remainingAdults = adults - accommodatedAdults;
          const remainingChildren = children - accommodatedChildren;
          const remainingTotal = remainingAdults + remainingChildren;
          
          if (remainingTotal <= 0) break;
          
          // Each triple room can take up to 4 people, but prioritize adults first
          let peopleInThisRoom = 0;
          let adultsInThisRoom = 0;
          let childrenInThisRoom = 0;
          
          // First, place adults (up to 3)
          adultsInThisRoom = Math.min(remainingAdults, 3);
          peopleInThisRoom += adultsInThisRoom;
          
          // Then, place children if there's remaining capacity (can exceed 3 if it's 3 adults + 1 child)
          const maxCapacityForChildren = (adultsInThisRoom === 3) ? 4 : 3; // Allow 4 total if 3 adults
          const remainingCapacity = maxCapacityForChildren - peopleInThisRoom;
          childrenInThisRoom = Math.min(remainingChildren, remainingCapacity);
          peopleInThisRoom += childrenInThisRoom;
          
          accommodatedAdults += adultsInThisRoom;
          accommodatedChildren += childrenInThisRoom;
        }
      } else {
        // Other room types use standard capacity
        const remainingToAccommodate = (adults + children) - (accommodatedAdults + accommodatedChildren);
        const canAccommodate = Math.min(remainingToAccommodate, roomCapacity);
        
        if (accommodatedAdults < adults) {
          const adultsToAdd = Math.min(adults - accommodatedAdults, canAccommodate);
          accommodatedAdults += adultsToAdd;
          const remainingCapacity = canAccommodate - adultsToAdd;
          const childrenToAdd = Math.min(children - accommodatedChildren, remainingCapacity);
          accommodatedChildren += childrenToAdd;
        } else {
          accommodatedChildren += Math.min(children - accommodatedChildren, canAccommodate);
        }
      }
    }
    
    return accommodatedAdults >= adults && accommodatedChildren >= children;
  }

  // Generate combinations up to reasonable limits
  function generateCombinations(roomIndex: number, currentCombination: Array<{ roomType: RoomType; count: number }>) {
    if (roomIndex >= availableRooms.length) {
      if (currentCombination.length > 0 && canAccommodateGroup(currentCombination)) {
        const totalCost = currentCombination.reduce((sum, { roomType, count }) => 
          sum + (count * roomType.pricePerNight), 0);
        const totalCapacity = currentCombination.reduce((sum, { roomType, count }) => 
          sum + (count * roomType.capacity), 0);
        
        combinations.push({
          rooms: [...currentCombination],
          totalCost,
          totalCapacity
        });
      }
      return;
    }

    const room = availableRooms[roomIndex];
    const maxRooms = Math.min(room.available || 10, Math.ceil(totalPeople / room.capacity) + 2);

    // Try different quantities of this room type (0 to maxRooms)
    for (let count = 0; count <= maxRooms; count++) {
      if (count > 0) {
        currentCombination.push({ roomType: room, count });
      }
      generateCombinations(roomIndex + 1, currentCombination);
      if (count > 0) {
        currentCombination.pop();
      }
    }
  }

  generateCombinations(0, []);
  return combinations;
}

// Special allocation function for 7 people: 2 triple rooms + 1 single room
function handleSevenPeopleAllocation(availableRooms: RoomType[], nights: number): OptimalAllocation {
  const allocations: RoomAllocation[] = [];
  let totalCost = 0;

  // Find triple rooms (capacity 3)
  const tripleRooms = availableRooms.filter(room => room.capacity === 3);
  // Find single rooms (capacity 1)
  const singleRooms = availableRooms.filter(room => room.capacity === 1);

  // If we have both triple and single rooms available
  if (tripleRooms.length > 0 && singleRooms.length > 0) {
    // Sort by cost per person
    const sortedTriples = tripleRooms.sort((a, b) => (a.pricePerNight / a.capacity) - (b.pricePerNight / b.capacity));
    const sortedSingles = singleRooms.sort((a, b) => (a.pricePerNight / a.capacity) - (b.pricePerNight / b.capacity));

    // Allocate 2 triple rooms (6 people)
    const tripleRoom = sortedTriples[0];
    const tripleAllocation: RoomAllocation = {
      roomType: tripleRoom,
      roomsNeeded: 2,
      totalCapacity: 6,
      totalCost: 2 * tripleRoom.pricePerNight * nights
    };
    allocations.push(tripleAllocation);
    totalCost += tripleAllocation.totalCost;

    // Allocate 1 single room (1 person)
    const singleRoom = sortedSingles[0];
    const singleAllocation: RoomAllocation = {
      roomType: singleRoom,
      roomsNeeded: 1,
      totalCapacity: 1,
      totalCost: singleRoom.pricePerNight * nights
    };
    allocations.push(singleAllocation);
    totalCost += singleAllocation.totalCost;

    return {
      allocations,
      totalCost,
      totalCapacity: 7,
      isValid: true,
      costPerPerson: totalCost / 7
    };
  }

  // Fallback: If specific room types aren't available, use the general algorithm
  return fallbackAllocation(7, availableRooms, nights);
}

// Fallback allocation when preferred room types aren't available
function fallbackAllocation(totalPeople: number, availableRooms: RoomType[], nights: number): OptimalAllocation {
  const sortedRooms = [...availableRooms].sort((a, b) => {
    const costPerPersonA = a.pricePerNight / a.capacity;
    const costPerPersonB = b.pricePerNight / b.capacity;
    return costPerPersonA - costPerPersonB;
  });

  let remainingPeople = totalPeople;
  const allocations: RoomAllocation[] = [];
  let totalCost = 0;

  for (const roomType of sortedRooms) {
    if (remainingPeople <= 0) break;

    const maxRoomsAvailable = roomType.available || 10;
    const roomsNeeded = Math.min(
      Math.ceil(remainingPeople / roomType.capacity),
      maxRoomsAvailable
    );

    if (roomsNeeded > 0) {
      const totalCapacity = roomsNeeded * roomType.capacity;
      const roomCost = roomsNeeded * roomType.pricePerNight * nights;
      
      allocations.push({
        roomType,
        roomsNeeded,
        totalCapacity,
        totalCost: roomCost
      });

      totalCost += roomCost;
      remainingPeople -= totalCapacity;
    }
  }

  const totalCapacity = allocations.reduce((sum, alloc) => sum + alloc.totalCapacity, 0);
  const isValid = totalCapacity >= totalPeople;
  const costPerPerson = totalPeople > 0 ? totalCost / totalPeople : 0;

  return {
    allocations,
    totalCost,
    totalCapacity,
    isValid,
    costPerPerson
  };
}

export default function BookingComparison({ adults, children, infants, startDate, endDate, packageData }: BookingComparisonProps) {
  const [showComparison, setShowComparison] = useState(false);
  const [showAllRooms, setShowAllRooms] = useState(false);
  const queryClient = useQueryClient();
  
  // Calculate nights from date range or use package duration
  const nights = useMemo(() => {
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
    return DEFAULT_CONFIG.DEFAULT_NIGHTS;
  }, [startDate, endDate, packageData?.duration, packageData?.durationType]);

  // Calculate total people (infants don't count for accommodation)
  const totalPeople = adults + children;
  
  // Extract room types from package data or create defaults
  const availableRooms = useMemo((): RoomType[] => {
    if (packageData?.rooms && packageData.rooms.length > 0) {
      return packageData.rooms.map(room => ({
        id: room.id,
        name: room.name || room.type || 'Room',
        type: room.type || 'standard',
        // Use actual database capacity values instead of inferring from type names
        capacity: room.capacity || room.maxOccupancy || 
                 (room.type?.toLowerCase().includes('triple') ? 3 : 
                  room.type?.toLowerCase().includes('double') ? 2 : 
                  room.type?.toLowerCase().includes('single') ? 1 : 2),
        pricePerNight: room.pricePerNight || room.price || DEFAULT_ROOM_RATES.DOUBLE_ROOM,
        available: room.available || 5
      }));
    }
    
    // Create default room types if no package room data
    return [
      {
        name: 'Triple Room',
        type: 'triple',
        capacity: 3,
        pricePerNight: DEFAULT_ROOM_RATES.TRIPLE_ROOM,
        available: 3
      },
      {
        name: 'Double Room', 
        type: 'double',
        capacity: 2,
        pricePerNight: DEFAULT_ROOM_RATES.DOUBLE_ROOM,
        available: 2
      }
    ];
  }, [packageData?.rooms]);

  // Calculate per-person rate for comparison
  const perPersonRate = useMemo(() => {
    if (packageData?.price && packageData?.duration) {
      const basePrice = packageData.discountedPrice || packageData.price;
      return Math.round(basePrice / packageData.duration / 2); // Estimate per person per night
    }
    return DEFAULT_ROOM_RATES.PER_PERSON_RATE;
  }, [packageData]);
  
  // Calculate optimal room allocation and comparison
  const calculations = useMemo(() => {
    // Option 1: Advanced room allocation using smart algorithm with adults/children distinction
    const optimalAllocation = findOptimalRoomAllocation(totalPeople, availableRooms, nights, adults, children);
    
    // Option 2: Per person pricing
    const option2Cost = totalPeople * perPersonRate * nights;
    
    // Calculate savings between options
    const option1IsCheaper = optimalAllocation.totalCost < option2Cost;
    const savings = Math.abs(optimalAllocation.totalCost - option2Cost);
    const savingsPerPerson = totalPeople > 0 ? savings / totalPeople : 0;

    return {
      optimalAllocation,
      option2Cost,
      option2CostPerPerson: perPersonRate * nights,
      option1IsCheaper,
      savings,
      savingsPerPerson
    };
  }, [totalPeople, nights, availableRooms, perPersonRate, adults, children]);

  const {
    optimalAllocation,
    option2Cost,
    option2CostPerPerson,
    option1IsCheaper,
    savings,
    savingsPerPerson
  } = calculations;

  useEffect(() => {
    // Auto-show comparison when there are people selected and dates are set
    if (totalPeople > 0) {
      setShowComparison(true);
    } else {
      setShowComparison(false);
    }
  }, [totalPeople, nights]);

  if (totalPeople === 0) {
    return (
      <Card className="mb-4 border-dashed">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <Calculator className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p className="text-sm font-medium">Smart Price Comparison Ready</p>
            <p className="text-xs mt-1">Select travelers and dates to automatically calculate the best booking option</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Dynamic Room Allocation
            <RefreshCw className="h-4 w-4 text-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                // Refresh package data and room allocations
                queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
                queryClient.invalidateQueries({ queryKey: ['/api/manual-packages'] });
                setShowComparison(false);
                setTimeout(() => setShowComparison(true), 100);
              }}
              variant="outline"
              size="sm"
              className="h-7 px-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
            <Button
              onClick={() => setShowAllRooms(!showAllRooms)}
              variant="outline"
              size="sm"
              className="h-7 px-2"
            >
              {showAllRooms ? 'Show Compatible Only' : 'Show All Rooms'}
            </Button>
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Smart pricing for {totalPeople} people ({adults} adults, {children} children{infants > 0 ? `, ${infants} infants` : ''})
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{nights} night{nights !== 1 ? 's' : ''}</span>
          </div>
          {startDate && endDate && (
            <span>
              {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!showComparison ? (
          <Button 
            onClick={() => setShowComparison(true)}
            className="w-full"
            variant="outline"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Compare Booking Options
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Option 1: Dynamic Room Allocation */}
            <div className={`p-4 rounded-lg border-2 ${
              option1IsCheaper && optimalAllocation.isValid 
                ? 'border-green-500 bg-green-50' 
                : optimalAllocation.isValid 
                  ? 'border-gray-200 bg-gray-50' 
                  : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">Option 1: Smart Room Allocation</span>
                  {option1IsCheaper && optimalAllocation.isValid && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      BEST DEAL
                    </span>
                  )}
                  {!optimalAllocation.isValid && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                      NOT AVAILABLE
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{optimalAllocation.totalCost.toLocaleString()} EGP</div>
                  <div className="text-sm text-muted-foreground">
                    {optimalAllocation.costPerPerson.toFixed(0)} EGP per person
                  </div>
                </div>
              </div>
              
              <div className="text-sm space-y-2">
                {showAllRooms ? (
                  // Show ALL available rooms with capacity indicators
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground mb-3 p-2 bg-blue-50 rounded border">
                      <p className="font-medium">All Available Rooms</p>
                      <p>🟢 Compatible with your group size | 🟡 Requires multiple rooms | 🔴 Insufficient capacity</p>
                    </div>
                    {availableRooms.map((room, index) => {
                      const roomsNeeded = Math.ceil(totalPeople / room.capacity);
                      const isCompatible = room.capacity >= totalPeople;
                      const requiresMultiple = !isCompatible && roomsNeeded <= (room.available || 5);
                      const isInsufficient = !requiresMultiple && !isCompatible;
                      
                      const indicator = isCompatible ? '🟢' : requiresMultiple ? '🟡' : '🔴';
                      const statusText = isCompatible ? 'Perfect fit' : 
                                       requiresMultiple ? `${roomsNeeded} rooms needed` : 
                                       'Not suitable';
                      
                      const totalCost = roomsNeeded * room.pricePerNight * nights;
                      
                      // Calculate capacity breakdown for this room type
                      const getCapacityBreakdown = (roomType: any) => {
                        if (roomType.name.toLowerCase().includes('triple')) {
                          return {
                            adultsCapacity: 3,
                            childrenCapacity: 1, // Can accommodate 1 extra child if 3 adults
                            infantsCapacity: 2, // Infants typically don't count toward main capacity
                            maxTotal: 4, // 3 adults + 1 child maximum
                            description: "3 adults OR 3 adults + 1 child"
                          };
                        } else if (roomType.name.toLowerCase().includes('double')) {
                          return {
                            adultsCapacity: 2,
                            childrenCapacity: 0,
                            infantsCapacity: 2,
                            maxTotal: 2,
                            description: "2 adults + infants"
                          };
                        } else if (roomType.name.toLowerCase().includes('single')) {
                          return {
                            adultsCapacity: 1,
                            childrenCapacity: 0,
                            infantsCapacity: 1,
                            maxTotal: 1,
                            description: "1 adult + infants"
                          };
                        } else {
                          // Generic room type
                          return {
                            adultsCapacity: roomType.capacity,
                            childrenCapacity: 0,
                            infantsCapacity: 1,
                            maxTotal: roomType.capacity,
                            description: `${roomType.capacity} people maximum`
                          };
                        }
                      };

                      const capacityInfo = getCapacityBreakdown(room);
                      
                      return (
                        <div key={index} className={`p-3 rounded-lg border ${
                          isCompatible ? 'bg-green-50 border-green-200' : 
                          requiresMultiple ? 'bg-yellow-50 border-yellow-200' : 
                          'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{indicator}</span>
                                <span className="font-medium">{room.name}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {statusText} | {roomsNeeded} room{roomsNeeded !== 1 ? 's' : ''} needed
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{totalCost.toLocaleString()} EGP</div>
                              <div className="text-xs text-muted-foreground">
                                {room.pricePerNight.toLocaleString()} EGP/night × {roomsNeeded}
                              </div>
                            </div>
                          </div>
                          
                          {/* Detailed Capacity Breakdown */}
                          <div className="bg-white rounded p-2 border">
                            <div className="text-xs font-medium text-gray-700 mb-2">Room Capacity Per Room:</div>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <span className="font-medium">Adults:</span>
                                <span className="text-blue-600 font-bold">{capacityInfo.adultsCapacity}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="font-medium">Children:</span>
                                <span className="text-green-600 font-bold">{capacityInfo.childrenCapacity}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                <span className="font-medium">Infants:</span>
                                <span className="text-orange-600 font-bold">{capacityInfo.infantsCapacity}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 mt-2 italic border-t pt-2">
                              💡 {capacityInfo.description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Show only optimal allocation
                  <div className="space-y-3">
                    {optimalAllocation.allocations.map((allocation, index) => {
                      // Calculate capacity breakdown for this room type
                      const getCapacityBreakdown = (roomType: any) => {
                        if (roomType.name.toLowerCase().includes('triple')) {
                          return {
                            adultsCapacity: 3,
                            childrenCapacity: 1, // Can accommodate 1 extra child if 3 adults
                            infantsCapacity: 2, // Infants typically don't count toward main capacity
                            maxTotal: 4, // 3 adults + 1 child maximum
                            description: "3 adults OR 3 adults + 1 child"
                          };
                        } else if (roomType.name.toLowerCase().includes('double')) {
                          return {
                            adultsCapacity: 2,
                            childrenCapacity: 0,
                            infantsCapacity: 2,
                            maxTotal: 2,
                            description: "2 adults + infants"
                          };
                        } else if (roomType.name.toLowerCase().includes('single')) {
                          return {
                            adultsCapacity: 1,
                            childrenCapacity: 0,
                            infantsCapacity: 1,
                            maxTotal: 1,
                            description: "1 adult + infants"
                          };
                        } else {
                          // Generic room type
                          return {
                            adultsCapacity: roomType.capacity,
                            childrenCapacity: 0,
                            infantsCapacity: 1,
                            maxTotal: roomType.capacity,
                            description: `${roomType.capacity} people maximum`
                          };
                        }
                      };

                      const capacityInfo = getCapacityBreakdown(allocation.roomType);

                      return (
                        <div key={index} className="bg-white p-3 rounded-lg border border-green-300">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-medium">
                                {allocation.roomsNeeded} × {allocation.roomType.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {allocation.roomType.capacity} people capacity each room
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{allocation.totalCost.toLocaleString()} EGP</div>
                              <div className="text-xs text-muted-foreground">
                                {allocation.roomType.pricePerNight.toLocaleString()} EGP/night × {allocation.roomsNeeded}
                              </div>
                            </div>
                          </div>
                          
                          {/* Detailed Capacity Breakdown */}
                          <div className="bg-green-50 rounded p-2 border border-green-200">
                            <div className="text-xs font-medium text-gray-700 mb-2">Capacity Per Room:</div>
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <span className="font-medium">Adults:</span>
                                <span className="text-blue-600 font-bold">{capacityInfo.adultsCapacity}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="font-medium">Children:</span>
                                <span className="text-green-600 font-bold">{capacityInfo.childrenCapacity}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                <span className="font-medium">Infants:</span>
                                <span className="text-orange-600 font-bold">{capacityInfo.infantsCapacity}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 mt-2 italic border-t border-green-300 pt-2">
                              💡 {capacityInfo.description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 text-muted-foreground">
                      Total capacity: {optimalAllocation.totalCapacity} people
                      {!optimalAllocation.isValid && (
                        <div className="mt-2">
                          <span className="text-red-600 font-medium">Need {totalPeople} people</span>
                          <Button 
                            onClick={() => setShowAllRooms(true)}
                            variant="outline"
                            size="sm"
                            className="ml-2"
                          >
                            Show All Available Rooms
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Option 2: Per person */}
            <div className={`p-4 rounded-lg border-2 ${
              !option1IsCheaper || !optimalAllocation.isValid 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">Option 2: Per Person</span>
                  {(!option1IsCheaper || !optimalAllocation.isValid) && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      {!optimalAllocation.isValid ? 'ONLY OPTION' : 'BEST DEAL'}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{option2Cost.toLocaleString()} EGP</div>
                  <div className="text-sm text-muted-foreground">
                    {option2CostPerPerson.toFixed(0)} EGP per person
                  </div>
                </div>
              </div>
              
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>• {totalPeople} people × {perPersonRate} EGP/night</span>
                  <span>{totalPeople} × {perPersonRate} × {nights} nights</span>
                </div>
                <div className="pt-2 text-muted-foreground">
                  Flexible accommodation arrangement
                </div>
              </div>
            </div>

            {/* Savings Summary */}
            {optimalAllocation.isValid && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Dynamic Price Analysis</span>
                  <div className="ml-auto flex items-center gap-1 text-xs text-blue-600">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Auto-optimized</span>
                  </div>
                </div>
                {packageData && (
                  <div className="text-xs text-blue-600 mb-2 flex items-center gap-1">
                    <span>✓ Using package room data: {packageData.title}</span>
                    {packageData.discountedPrice && (
                      <span className="ml-2 text-green-600">
                        (Save {((packageData.price - packageData.discountedPrice) / packageData.price * 100).toFixed(0)}%)
                      </span>
                    )}
                  </div>
                )}
                <div className="text-sm">
                  {option1IsCheaper ? (
                    <div className="text-green-700">
                      ✅ <strong>Smart allocation saves you {savings.toLocaleString()} EGP total</strong> ({savingsPerPerson.toFixed(0)} EGP per person)
                    </div>
                  ) : (
                    <div className="text-blue-700">
                      💡 Per-person pricing saves you {savings.toLocaleString()} EGP total ({savingsPerPerson.toFixed(0)} EGP per person)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}