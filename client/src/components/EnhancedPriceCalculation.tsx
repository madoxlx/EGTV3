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
import { useLanguage } from "@/hooks/use-language";

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
  // Handle tours - can be single ID, array of IDs, or array of tour objects with pricing
  let packageTours: number[] = [];
  let tourPricingData: {
    [key: number]: {
      adultPrice: number;
      childPrice: number;
      infantPrice: number;
    };
  } = {};

  if (packageData.selectedTourId) {
    packageTours = [packageData.selectedTourId];
  } else if (packageData.tourSelection) {
    const parsedTours = parsePackageArray(packageData.tourSelection);
    console.log("EnhancedPriceCalculation - Parsed tours data:", parsedTours);

    // Handle new tour pricing structure with adult/child/infant prices
    if (
      parsedTours.length > 0 &&
      typeof parsedTours[0] === "object" &&
      "id" in parsedTours[0]
    ) {
      // New format: [{id: 6, adultPrice: 200000, childPrice: 120000, infantPrice: 80000}]
      parsedTours.forEach((tour: any) => {
        if (tour.id) {
          packageTours.push(tour.id);
          tourPricingData[tour.id] = {
            adultPrice: (tour.adultPrice || 0) / 100, // Convert from piasters to EGP
            childPrice: (tour.childPrice || 0) / 100,
            infantPrice: (tour.infantPrice || 0) / 100,
          };
        }
      });
    } else {
      // Old format: [6, 7, 8] or ["6", "7", "8"]
      packageTours = parsedTours
        .map((id) => (typeof id === "string" ? parseInt(id) : id))
        .filter((id) => !isNaN(id));
    }
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
  
  // Calculate pricing tiers based on base package price
  const basePackagePrice = packageData.discountedPrice || packageData.price;
  const adultPrice = basePackagePrice; // 100% of package price
  const childPrice = Math.round(basePackagePrice * 0.7); // 70% of package price
  const infantPrice = Math.round(basePackagePrice * 0.3); // 30% of package price

  // Calculate room costs based on selected rooms
  let roomsCost = 0;
  let roomsBreakdown: { name: string; nights: number; cost: number }[] = [];

  // Calculate the number of nights and days based on the date range
  let actualNights = packageData.duration || 1; // Default to package duration
  let days = actualNights + 1;
  if (dateMode === "range" && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
    actualNights = Math.max(1, Math.floor(diff));
    days = actualNights + 1;
  } else if (dateMode === "single" && selectedDate) {
    actualNights = packageData.duration || 1;
    days = actualNights + 1;
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

  if (packageTours.length > 0) {
    packageTours.forEach((tourId: number) => {
      // Use custom pricing data if available, otherwise fall back to tour database
      if (tourPricingData[tourId]) {
        const pricing = tourPricingData[tourId];
        const totalTourCost =
          pricing.adultPrice * adults +
          pricing.childPrice * children +
          pricing.infantPrice * infants;

        toursCost += totalTourCost;

        // Try to get tour name from database, fallback to ID
        const tour = allTours.find((t) => t.id === tourId);
        toursBreakdown.push({
          name: tour?.name || `Tour #${tourId}`,
          price: totalTourCost,
        });

        console.log(
          `EnhancedPriceCalculation - Tour ${tourId} cost calculation:`,
          {
            adults: adults,
            children: children,
            infants: infants,
            adultPrice: pricing.adultPrice,
            childPrice: pricing.childPrice,
            infantPrice: pricing.infantPrice,
            totalCost: totalTourCost,
          },
        );
      } else if (allTours.length > 0) {
        // Fallback to old pricing method
        const tour = allTours.find((t) => t.id === tourId);
        if (tour) {
          const tourPrice = tour.price / 100; // Convert from piasters to EGP
          const totalTourCost = isPricingPerPerson
            ? tourPrice * (adults + children * 0.7 + infants * 0.1)
            : tourPrice;

          toursCost += totalTourCost;
          toursBreakdown.push({
            name: tour.name,
            price: totalTourCost,
          });
        }
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
  const { t, currentLanguage } = useLanguage
    ? useLanguage()
    : { t: (k: string, d: string) => d, currentLanguage: "ar" };
  // صياغة النصوص حسب اللغة
  const isArabic = currentLanguage === "ar";
  const nightsText = isArabic
    ? `${actualNights} ${t("night", actualNights === 1 ? "ليلة" : "ليالي")}`
    : `${actualNights} ${t("night", actualNights === 1 ? "night" : "nights")}`;
  const daysText = isArabic
    ? `${days} ${t("day", days === 1 ? "يوم" : "أيام")}`
    : `${days} ${t("day", days === 1 ? "day" : "days")}`;
  const egpText = isArabic ? "ج.م" : "EGP";
  // Calculate individual totals for detailed breakdown
  const adultTotal = adults * adultPrice * days;
  const childTotal = children * childPrice * days;
  const infantTotal = infants * infantPrice * days;
  const grandTotal = adultTotal + childTotal + infantTotal;

  // مفاتيح الترجمة: price_breakdown, subtotal, vat, service_fee, total, savings
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
      <h4 className="font-bold mb-2">
        {t("price_breakdown", isArabic ? "تفصيل السعر" : "Price Breakdown")}
      </h4>
      <div className="flex flex-col gap-2 text-sm">
        <div className="mb-2 text-muted-foreground">
          {isArabic
            ? `${nightsText} / ${daysText}`
            : `${nightsText} / ${daysText}`}
        </div>
        
        {/* Detailed Breakdown */}
        {adults > 0 && (
          <div className="flex justify-between items-center">
            <span>
              {t("adults", isArabic ? "البالغين" : "Adults")} ({adults} × {formatPrice(adultPrice)} × {days} {t("days", isArabic ? "أيام" : "days")}):
            </span>
            <span className="font-medium">{formatPrice(adultTotal)} {egpText}</span>
          </div>
        )}
        
        {children > 0 && (
          <div className="flex justify-between items-center">
            <span>
              {t("children", isArabic ? "الأطفال" : "Children")} ({children} × {formatPrice(childPrice)} × {days} {t("days", isArabic ? "أيام" : "days")}):
            </span>
            <span className="font-medium">{formatPrice(childTotal)} {egpText}</span>
          </div>
        )}
        
        {infants > 0 && (
          <div className="flex justify-between items-center">
            <span>
              {t("infants", isArabic ? "الرضع" : "Infants")} ({infants} × {formatPrice(infantPrice)} × {days} {t("days", isArabic ? "أيام" : "days")}):
            </span>
            <span className="font-medium">{formatPrice(infantTotal)} {egpText}</span>
          </div>
        )}

        {/* Border separation before grand total */}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center font-bold text-lg">
            <span>{t("total", isArabic ? "الإجمالي" : "Total")}:</span>
            <span className="text-primary">{formatPrice(grandTotal)} {egpText}</span>
          </div>
        </div>

        {/* Additional costs if applicable */}
        {(roomsCost > 0 || toursCost > 0 || excursionsCost > 0 || upgradePrice > 0) && (
          <div className="mt-3 pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2">
              {t("additional_costs", isArabic ? "تكاليف إضافية" : "Additional Costs")}:
            </div>
            {roomsCost > 0 && (
              <div className="flex justify-between text-xs">
                <span>{t("accommodation", isArabic ? "الإقامة" : "Accommodation")}:</span>
                <span>{formatPrice(roomsCost)} {egpText}</span>
              </div>
            )}
            {toursCost > 0 && (
              <div className="flex justify-between text-xs">
                <span>{t("tours", isArabic ? "الجولات" : "Tours")}:</span>
                <span>{formatPrice(toursCost)} {egpText}</span>
              </div>
            )}
            {excursionsCost > 0 && (
              <div className="flex justify-between text-xs">
                <span>{t("excursions", isArabic ? "الرحلات" : "Excursions")}:</span>
                <span>{formatPrice(excursionsCost)} {egpText}</span>
              </div>
            )}
            {upgradePrice > 0 && (
              <div className="flex justify-between text-xs">
                <span>{t("upgrades", isArabic ? "ترقيات" : "Upgrades")}:</span>
                <span>{formatPrice(upgradePrice)} {egpText}</span>
              </div>
            )}
          </div>
        )}

        {/* VAT and Service Fees */}
        {(vatEnabled || serviceFeeEnabled) && (
          <div className="mt-2 pt-2 border-t">
            {vatEnabled && (
              <div className="flex justify-between text-xs">
                <span>{t("vat", isArabic ? "ضريبة القيمة المضافة" : "VAT")}:</span>
                <span>{formatPrice(vatAmount)} {egpText}</span>
              </div>
            )}
            {serviceFeeEnabled && (
              <div className="flex justify-between text-xs">
                <span>{t("service_fee", isArabic ? "رسوم الخدمة" : "Service Fee")}:</span>
                <span>{formatPrice(serviceFee)} {egpText}</span>
              </div>
            )}
          </div>
        )}

        {/* Final Total with all costs */}
        {(roomsCost > 0 || toursCost > 0 || excursionsCost > 0 || upgradePrice > 0 || vatEnabled || serviceFeeEnabled) && (
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>{t("final_total", isArabic ? "المجموع النهائي" : "Final Total")}:</span>
              <span className="text-primary">{formatPrice(total)} {egpText}</span>
            </div>
          </div>
        )}

        {hasDiscount && (
          <div className="text-green-700 text-xs mt-1">
            {t("savings", isArabic ? "توفير" : "Savings")}:{" "}
            {formatPrice(savings)} {egpText}
          </div>
        )}
      </div>
    </div>
  );
}
