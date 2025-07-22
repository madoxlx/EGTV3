import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Users, DollarSign, TrendingDown, TrendingUp, Calendar, RefreshCw } from 'lucide-react';

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

// Dynamic room allocation algorithm
function findOptimalRoomAllocation(totalPeople: number, availableRooms: RoomType[], nights: number): OptimalAllocation {
  if (totalPeople === 0 || availableRooms.length === 0) {
    return {
      allocations: [],
      totalCost: 0,
      totalCapacity: 0,
      isValid: false,
      costPerPerson: 0
    };
  }

  // Sort rooms by cost per person (most economical first)
  const sortedRooms = [...availableRooms].sort((a, b) => {
    const costPerPersonA = a.pricePerNight / a.capacity;
    const costPerPersonB = b.pricePerNight / b.capacity;
    return costPerPersonA - costPerPersonB;
  });

  let remainingPeople = totalPeople;
  const allocations: RoomAllocation[] = [];
  let totalCost = 0;

  // Greedy allocation - start with most economical rooms
  for (const roomType of sortedRooms) {
    if (remainingPeople <= 0) break;

    const maxRoomsAvailable = roomType.available || 10; // Default max if not specified
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
        capacity: room.capacity || 
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
    // Option 1: Optimal room allocation using dynamic algorithm
    const optimalAllocation = findOptimalRoomAllocation(totalPeople, availableRooms, nights);
    
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
  }, [totalPeople, nights, availableRooms, perPersonRate]);

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
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Dynamic Room Allocation
          <RefreshCw className="h-4 w-4 text-green-500" />
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
                {optimalAllocation.allocations.map((allocation, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                    <span>
                      • {allocation.roomsNeeded} × {allocation.roomType.name} ({allocation.roomType.capacity} people each)
                    </span>
                    <span className="font-medium">
                      {allocation.totalCost.toLocaleString()} EGP
                    </span>
                  </div>
                ))}
                <div className="pt-2 text-muted-foreground">
                  Total capacity: {optimalAllocation.totalCapacity} people
                  {!optimalAllocation.isValid && (
                    <span className="text-red-600 font-medium"> (Need {totalPeople} people)</span>
                  )}
                </div>
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