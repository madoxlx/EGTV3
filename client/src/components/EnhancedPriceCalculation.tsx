import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Users, Home, Star, Percent, MapPin, Calendar, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface SystemSettings {
  payment?: {
    vatEnabled?: boolean;
    vatRate?: number;
    serviceFeeEnabled?: boolean;
    serviceFeeRate?: number;
    minimumServiceFee?: number;
  };
}

type PackageData = {
  id: number;
  title: string;
  price: number;
  discountedPrice?: number;
  duration: number;
  currency?: string;
  pricingMode?: string;
  selectedHotels?: string[] | string;
  rooms?: any[] | string;
  tourSelection?: number[] | string;
  selectedTourIds?: number[];
  optionalExcursions?: any[];
};

type Room = {
  id: number;
  name: string;
  hotel_id: number;
  price: number;
  max_occupancy: number;
  max_adults: number;
  max_children: number;
  max_infants: number;
};

type Tour = {
  id: number;
  name: string;
  price: number;
  duration: number;
};

type Hotel = {
  id: number;
  name: string;
  stars: number;
  base_price?: number;
};

type EnhancedPriceCalculationProps = {
  packageData: any;
  adults: number;
  children: number;
  infants: number;
  hotelPackage: string;
  selectedRooms: string[];
  dateMode?: 'single' | 'range';
  selectedDate?: string;
  startDate?: string;
  endDate?: string;
};

export default function EnhancedPriceCalculation({
  packageData,
  adults,
  children,
  infants,
  hotelPackage,
  selectedRooms,
  dateMode = 'single',
  selectedDate,
  startDate,
  endDate
}: EnhancedPriceCalculationProps) {
  // Fetch rooms data for accurate pricing
  const { data: allRooms = [] } = useQuery<Room[]>({
    queryKey: ['/api/admin/rooms'],
    retry: 1,
  });

  // Fetch tours data for accurate pricing
  const { data: allTours = [] } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
    retry: 1,
  });

  // Fetch hotels data for accommodation pricing
  const { data: allHotels = [] } = useQuery<Hotel[]>({
    queryKey: ['/api/hotels'],
    retry: 1,
  });

  // Fetch system settings for VAT and service fee configuration
  const { data: systemSettings } = useQuery<SystemSettings>({
    queryKey: ['/api/admin/settings'],
    retry: 1,
  });

  // Parse package data safely
  const parsePackageArray = (data: any[] | string | undefined): any[] => {
    if (!data) return [];
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return Array.isArray(data) ? data : [];
  };

  const packageHotels = parsePackageArray(packageData.selectedHotels);
  const packageRooms = parsePackageArray(packageData.rooms);
  // Handle tours - can be single ID, array of IDs, or JSON string
  let packageTours: number[] = [];
  if (packageData.selectedTourId) {
    packageTours = [packageData.selectedTourId];
  } else if (packageData.tourSelection) {
    packageTours = parsePackageArray(packageData.tourSelection);
  } else if (packageData.selectedTourIds) {
    packageTours = parsePackageArray(packageData.selectedTourIds);
  }
  const packageOptionalExcursions = parsePackageArray(packageData.optionalExcursions);

  // Determine pricing mode (per person vs per booking)
  const isPricingPerPerson = packageData.pricingMode === 'per_person';
  const isPricingPerBooking = packageData.pricingMode === 'per_booking';

  // Base package price calculation - convert from cents to EGP
  const basePrice = (packageData.discountedPrice || packageData.price) / 100;
  const originalPrice = packageData.price / 100;
  const hasDiscount = packageData.discountedPrice && packageData.discountedPrice < packageData.price;

  // Calculate base package cost based on pricing mode
  let packageBaseCost = 0;
  let adultPrice = 0;
  let childPrice = 0;
  let infantPrice = 0;

  if (isPricingPerPerson) {
    // Per person pricing
    adultPrice = basePrice * adults;
    childPrice = basePrice * 0.7 * children; // 30% discount for children
    infantPrice = basePrice * 0.1 * infants; // 90% discount for infants
    packageBaseCost = adultPrice + childPrice + infantPrice;
  } else {
    // Per booking pricing (default)
    packageBaseCost = basePrice;
  }

  // Calculate room costs based on selected rooms
  let roomsCost = 0;
  let roomsBreakdown: { name: string; nights: number; cost: number }[] = [];

  // Calculate the number of nights based on the date range
  let actualNights = packageData.duration || 1; // Default to package duration
  if (dateMode === 'range' && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    actualNights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
  } else if (dateMode === 'single' && selectedDate) {
    // For single date, use package duration
    actualNights = packageData.duration || 1;
  }

  // Calculate costs for user-selected rooms
  if (selectedRooms.length > 0 && allRooms.length > 0) {
    selectedRooms.forEach((roomId: string) => {
      const room = allRooms.find(r => r.id === parseInt(roomId));
      if (room) {
        const roomPricePerNight = room.price / 100; // Convert from cents to EGP
        const roomTotalCost = roomPricePerNight * actualNights;

        roomsCost += roomTotalCost;
        roomsBreakdown.push({
          name: room.name,
          nights: actualNights,
          cost: roomTotalCost
        });
      }
    });
  }
  // Fallback to package rooms if no rooms are selected by user
  else if (packageRooms.length > 0 && allRooms.length > 0) {
    packageRooms.forEach((roomData: any) => {
      const room = allRooms.find(r => r.id === (roomData.id || roomData.roomId));
      if (room) {
        const customPrice = roomData.customPrice || roomData.price || room.price;
        const roomPricePerNight = customPrice / 100; // Convert from cents to EGP
        const roomTotalCost = roomPricePerNight * actualNights;

        roomsCost += roomTotalCost;
        roomsBreakdown.push({
          name: room.name,
          nights: actualNights,
          cost: roomTotalCost
        });
      }
    });
  }

  // Calculate tours cost based on package tours
  let toursCost = 0;
  let toursBreakdown: { name: string; price: number }[] = [];

  if (packageTours.length > 0 && allTours.length > 0) {
    packageTours.forEach((tourId: number) => {
      const tour = allTours.find(t => t.id === tourId);
      if (tour) {
        const tourPrice = tour.price / 100; // Convert from cents to EGP
        const totalTourCost = isPricingPerPerson ? tourPrice * (adults + children * 0.7 + infants * 0.1) : tourPrice;

        toursCost += totalTourCost;
        toursBreakdown.push({
          name: tour.name,
          price: totalTourCost
        });
      }
    });
  }

  // Calculate optional excursions cost
  let excursionsCost = 0;
  let excursionsBreakdown: { name: string; price: number }[] = [];

  if (packageOptionalExcursions.length > 0) {
    packageOptionalExcursions.forEach((excursion: any) => {
      const excursionPrice = excursion.price || 0;
      const totalExcursionCost = isPricingPerPerson ? excursionPrice * (adults + children * 0.7 + infants * 0.1) : excursionPrice;

      excursionsCost += totalExcursionCost;
      excursionsBreakdown.push({
        name: excursion.name || 'Optional Excursion',
        price: totalExcursionCost
      });
    });
  }

  // Hotel package upgrades (if not already included in rooms)
  const hotelUpgrades = {
    standard: { name: 'Standard', multiplier: 1, price: 0 },
    deluxe: { name: 'Deluxe', multiplier: 1.2, price: 150 },
    luxury: { name: 'Luxury', multiplier: 1.5, price: 300 }
  };

  const selectedUpgrade = hotelUpgrades[hotelPackage as keyof typeof hotelUpgrades] || hotelUpgrades.standard;
  const upgradePrice = packageRooms.length > 0 ? 0 : selectedUpgrade.price * actualNights * (adults + children);

  // Calculate subtotal
  const subtotal = packageBaseCost + roomsCost + toursCost + excursionsCost + upgradePrice;

  // VAT calculation based on system settings (default disabled until enabled in admin settings)
  const vatEnabled = systemSettings?.payment?.vatEnabled ?? false;
  const vatRate = vatEnabled ? (systemSettings?.payment?.vatRate ?? 14) / 100 : 0;
  const vatAmount = vatEnabled ? subtotal * vatRate : 0;

  // Service fees based on system settings (default disabled until enabled in admin settings)  
  const serviceFeeEnabled = systemSettings?.payment?.serviceFeeEnabled ?? false;
  const serviceFeeRate = serviceFeeEnabled ? (systemSettings?.payment?.serviceFeeRate ?? 2) / 100 : 0;
  const minimumServiceFee = systemSettings?.payment?.minimumServiceFee ?? 50;
  const serviceFee = serviceFeeEnabled ? Math.max(subtotal * serviceFeeRate, minimumServiceFee) : 0;

  // Total calculation
  const total = subtotal + vatAmount + serviceFee;

  // Savings calculation
  const originalSubtotal = hasDiscount ? (
    (isPricingPerPerson ? (packageData.price / 100) * (adults + children + infants) : (packageData.price / 100)) + 
    roomsCost + toursCost + excursionsCost + upgradePrice
  ) : 0;
  const originalTotal = hasDiscount ? originalSubtotal + (originalSubtotal * vatRate) + serviceFee : 0;
  const savings = hasDiscount ? originalTotal - total : 0;

  const formatPrice = (price: number) => {
    return Math.round(price).toLocaleString('en-US');
  };

  const totalTravelers = adults + children + infants;

  const totalPrice = total;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5 text-primary" />
          Price Breakdown
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pricing Mode Indicator */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Pricing Mode</span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {isPricingPerPerson ? 'Per Person' : 'Per Booking'}
          </Badge>
        </div>

        {/* Traveler Count Summary */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Travelers</span>
          </div>
          <div className="text-sm">
            {adults > 0 && <span>{adults} Adults</span>}
            {children > 0 && <span>{adults > 0 ? ', ' : ''}{children} Children</span>}
            {infants > 0 && <span>{(adults > 0 || children > 0) ? ', ' : ''}{infants} Infants</span>}
          </div>
        </div>

        {/* Base Package Pricing */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Base Package
          </h4>

          {isPricingPerPerson ? (
            <>
              {adults > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Adults ({adults} × {formatPrice(basePrice)} EGP)</span>
                  <span>{formatPrice(adultPrice)} EGP</span>
                </div>
              )}

              {children > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Children ({children} × {formatPrice(basePrice * 0.7)} EGP)</span>
                  <span>{formatPrice(childPrice)} EGP</span>
                </div>
              )}

              {infants > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Infants ({infants} × {formatPrice(basePrice * 0.1)} EGP)</span>
                  <span>{formatPrice(infantPrice)} EGP</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-between text-sm">
              <span>Package Base Rate</span>
              <span>{formatPrice(packageBaseCost)} EGP</span>
            </div>
          )}
        </div>

        {/* Accommodation Costs */}
        {roomsBreakdown.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-500" />
                <h4 className="text-sm font-semibold">Accommodation ({actualNights} night{actualNights !== 1 ? 's' : ''})</h4>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="space-y-1">
                  {roomsBreakdown.map((room, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-blue-800">{room.name}</span>
                      <span className="text-blue-900 font-medium">{formatPrice(room.cost / room.nights)} EGP/night × {room.nights} nights</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-1">
                <span>Total Accommodation</span>
                <span>{formatPrice(roomsCost)} EGP</span>
              </div>
            </div>
          </>
        )}

        {/* Tours Costs */}
        {toursBreakdown.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500" />
                Included Tours
              </h4>
              {toursBreakdown.map((tour, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{tour.name}</span>
                  <span>{formatPrice(tour.price)} EGP</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-medium border-t pt-1">
                <span>Total Tours</span>
                <span>{formatPrice(toursCost)} EGP</span>
              </div>
            </div>
          </>
        )}

        {/* Optional Excursions */}
        {excursionsBreakdown.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                Optional Excursions
              </h4>
              {excursionsBreakdown.map((excursion, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{excursion.name}</span>
                  <span>{formatPrice(excursion.price)} EGP</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-medium border-t pt-1">
                <span>Total Excursions</span>
                <span>{formatPrice(excursionsCost)} EGP</span>
              </div>
            </div>
          </>
        )}

        {/* Hotel Package Upgrade */}
        {upgradePrice > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-500" />
                Hotel Upgrade
              </h4>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span>{selectedUpgrade.name} Package</span>
                  <Badge variant="secondary" className="text-xs">
                    +{Math.round((selectedUpgrade.multiplier - 1) * 100)}%
                  </Badge>
                </div>
                <span>{formatPrice(upgradePrice)} EGP</span>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Subtotal */}
        <div className="flex justify-between font-medium">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)} EGP</span>
        </div>

        {/* VAT - only show if enabled */}
        {vatEnabled && (
          <div className="flex justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Percent className="w-3 h-3" />
              <span>VAT ({Math.round(vatRate * 100)}%)</span>
            </div>
            <span>{formatPrice(vatAmount)} EGP</span>
          </div>
        )}

        {/* Service Fee - only show if enabled */}
        {serviceFeeEnabled && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Service Fee ({Math.round(serviceFeeRate * 100)}%)</span>
            <span>{formatPrice(serviceFee)} EGP</span>
          </div>
        )}

        <Separator />

        {/* Discount/Savings */}
        {hasDiscount && savings > 1 && (
          <div className="flex justify-between text-sm text-green-600 font-medium">
            <span>Total Savings</span>
            <span>-{formatPrice(savings)} EGP</span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between text-lg font-bold text-primary">
          <span>Total</span>
          <div className="text-right">
            <div>{formatPrice(total)} EGP</div>
            {hasDiscount && (
              <div className="text-sm font-normal text-gray-500 line-through">
                {formatPrice(originalTotal)} EGP
              </div>
            )}
          </div>
        </div>

        {/* Summary Information */}
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="text-sm text-green-800">
            <div className="flex items-center justify-between">
              <span><strong>{actualNights + 1} days</strong> package</span>
              <span><strong>{totalTravelers} travelers</strong></span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span>Cost per traveler:</span>
              <span><strong>{formatPrice(total / totalTravelers)} EGP</strong></span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span>Cost per night:</span>
              <span><strong>{formatPrice(total / actualNights)} EGP</strong></span>
            </div>
            {hasDiscount && savings > 1 && (
              <div className="mt-2 text-green-700 font-medium">
                💰 You're saving {formatPrice(savings)} EGP with this offer!
              </div>
            )}
          </div>
        </div>

        {/* Payment Information */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-800">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span className="font-medium">Payment Information</span>
            </div>
            <div className="mt-1">
              No payment required to book. You'll only pay when finalizing your reservation.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}