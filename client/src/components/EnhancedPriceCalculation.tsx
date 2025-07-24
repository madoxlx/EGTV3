import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  Users,
  Home,
  Star,
  Percent,
  MapPin,
  Calendar,
  Info,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
  dateMode?: "single" | "range";
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
  dateMode = "single",
  selectedDate,
  startDate,
  endDate,
}: EnhancedPriceCalculationProps) {
  // Fetch rooms data for accurate pricing
  const { data: allRooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/admin/rooms"],
    retry: 1,
  });

  // Fetch tours data for accurate pricing
  const { data: allTours = [] } = useQuery<Tour[]>({
    queryKey: ["/api/tours"],
    retry: 1,
  });

  // Fetch hotels data for accommodation pricing
  const { data: allHotels = [] } = useQuery<Hotel[]>({
    queryKey: ["/api/hotels"],
    retry: 1,
  });

  // Fetch system settings for VAT and service fee configuration
  const { data: systemSettings } = useQuery<SystemSettings>({
    queryKey: ["/api/admin/settings"],
    retry: 1,
  });

  // Parse package data safely
  const parsePackageArray = (data: any[] | string | undefined): any[] => {
    if (!data) return [];
    if (typeof data === "string") {
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
  const packageOptionalExcursions = parsePackageArray(
    packageData.optionalExcursions,
  );

  // Determine pricing mode (per person vs per booking)
  const isPricingPerPerson = packageData.pricingMode === "per_person";
  const isPricingPerBooking = packageData.pricingMode === "per_booking";

  // Base package price calculation - prices are already in EGP (for display only, not included in total)
  const basePrice = packageData.discountedPrice || packageData.price;
  const originalPrice = packageData.price;
  const hasDiscount =
    packageData.discountedPrice &&
    packageData.discountedPrice < packageData.price;

  // Base package cost is now excluded from calculations
  let packageBaseCost = 0;
  let adultPrice = 0;
  let childPrice = 0;
  let infantPrice = 0;

  // Calculate room costs based on selected rooms
  let roomsCost = 0;
  let roomsBreakdown: { name: string; nights: number; cost: number }[] = [];

  // Calculate the number of nights based on the date range
  let actualNights = packageData.duration || 1; // Default to package duration
  if (dateMode === "range" && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    actualNights = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)),
    );
  } else if (dateMode === "single" && selectedDate) {
    // For single date, use package duration
    actualNights = packageData.duration || 1;
  }

  // Calculate total number of PAX
  const totalPAX = adults + children + infants;

  // Calculate costs for package rooms automatically (no user selection needed)
  if (packageRooms.length > 0) {
    // Use the first available room for cost calculation
    const packageRoom = packageRooms[0];
    if (packageRoom) {
      // Use the price from packageRooms data
      const roomPricePerNight = packageRoom.customPrice || packageRoom.price;
      // SPECIFICATION FORMULA: Room Cost × Nights × PAX
      const roomTotalCost = roomPricePerNight * actualNights * totalPAX;

      roomsCost += roomTotalCost;
      roomsBreakdown.push({
        name: packageRoom.name,
        nights: actualNights,
        cost: roomTotalCost,
      });
    }
  }
  // Fallback to allRooms if no package rooms available
  else if (allRooms.length > 0) {
    const room = allRooms[0]; // Use first available room
    if (room) {
      const roomPricePerNight = room.price;
      // SPECIFICATION FORMULA: Room Cost × Nights × PAX
      const roomTotalCost = roomPricePerNight * actualNights * totalPAX;

      roomsCost += roomTotalCost;
      roomsBreakdown.push({
        name: room.name,
        nights: actualNights,
        cost: roomTotalCost,
      });
    }
  }

  // Calculate tours cost based on package tours
  let toursCost = 0;
  let toursBreakdown: { name: string; price: number }[] = [];

  if (packageTours.length > 0 && allTours.length > 0) {
    packageTours.forEach((tourId: number) => {
      const tour = allTours.find((t) => t.id === tourId);
      if (tour) {
        // All prices are stored in EGP
        const tourPrice = tour.price;
        const totalTourCost = isPricingPerPerson
          ? tourPrice * (adults + children * 0.7 + infants * 0.1)
          : tourPrice;

        toursCost += totalTourCost;
        toursBreakdown.push({
          name: tour.name,
          price: totalTourCost,
        });
      }
    });
  }

  // Calculate optional excursions cost
  let excursionsCost = 0;
  let excursionsBreakdown: { name: string; price: number }[] = [];

  if (packageOptionalExcursions.length > 0) {
    packageOptionalExcursions.forEach((excursion: any) => {
      // All prices are stored in EGP
      const excursionPrice = excursion.price || 0;
      const totalExcursionCost = isPricingPerPerson
        ? excursionPrice * (adults + children * 0.7 + infants * 0.1)
        : excursionPrice;

      excursionsCost += totalExcursionCost;
      excursionsBreakdown.push({
        name: excursion.name || "Optional Excursion",
        price: totalExcursionCost,
      });
    });
  }

  // Hotel package upgrades (if not already included in rooms)
  const hotelUpgrades = {
    standard: { name: "Standard", multiplier: 1, price: 0 },
    deluxe: { name: "Deluxe", multiplier: 1.2, price: 150 },
    luxury: { name: "Luxury", multiplier: 1.5, price: 300 },
  };

  const selectedUpgrade =
    hotelUpgrades[hotelPackage as keyof typeof hotelUpgrades] ||
    hotelUpgrades.standard;
  const upgradePrice =
    packageRooms.length > 0
      ? 0
      : selectedUpgrade.price * actualNights * (adults + children);

  // Calculate subtotal
  const subtotal =
    packageBaseCost + roomsCost + toursCost + excursionsCost + upgradePrice;

  // VAT calculation based on system settings (default disabled until enabled in admin settings)
  const vatEnabled = systemSettings?.payment?.vatEnabled ?? false;
  const vatRate = vatEnabled
    ? (systemSettings?.payment?.vatRate ?? 14) / 100
    : 0;
  const vatAmount = vatEnabled ? subtotal * vatRate : 0;

  // Service fees based on system settings (default disabled until enabled in admin settings)
  const serviceFeeEnabled = systemSettings?.payment?.serviceFeeEnabled ?? false;
  const serviceFeeRate = serviceFeeEnabled
    ? (systemSettings?.payment?.serviceFeeRate ?? 2) / 100
    : 0;
  const minimumServiceFee = systemSettings?.payment?.minimumServiceFee ?? 50;
  const serviceFee = serviceFeeEnabled
    ? Math.max(subtotal * serviceFeeRate, minimumServiceFee)
    : 0;

  // Total calculation
  const total = subtotal + vatAmount + serviceFee;

  // Savings calculation
  const originalSubtotal = hasDiscount
    ? (isPricingPerPerson
        ? packageData.price * (adults + children + infants)
        : packageData.price) +
      roomsCost +
      toursCost +
      excursionsCost +
      upgradePrice
    : 0;
  const originalTotal = hasDiscount
    ? originalSubtotal + originalSubtotal * vatRate + serviceFee
    : 0;
  const savings = hasDiscount ? originalTotal - total : 0;

  const formatPrice = (price: number) => {
    return Math.round(price).toLocaleString("en-US");
  };

  const totalPrice = total;

  // Validation logic for showing the calculation section
  const hasValidDates =
    dateMode === "single" ? !!selectedDate : !!(startDate && endDate);
  const hasValidAdults = adults > 0;
  // Room selection is now automatic, no validation needed
  const hasSelectedRooms = true; // Rooms are automatically selected

  // Validation messages
  const validationMessages: string[] = [];
  if (!hasValidAdults) {
    validationMessages.push("Please select at least one adult.");
  }
  if (!hasValidDates) {
    validationMessages.push("Please set the start and end date.");
  }

  // Only show calculation section when all requirements are met
  if (!hasValidDates || !hasValidAdults) {
    return (
      <Card id="price-breakdown" className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="w-5 h-5 text-primary" />
            Price Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Home className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm font-medium mb-2">Complete Your Selection</p>
            <div className="space-y-1">
              {validationMessages.map((message, index) => (
                <p key={index} className="text-xs text-red-500">
                  {message}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="text-center text-gray-500 p-8">
      <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-400" />
      <p className="text-sm font-medium">Price calculation content removed</p>
    </div>
  );
}
