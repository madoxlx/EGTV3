// Package Price Calculator - Replicates EnhancedPriceCalculation logic
// This ensures cart prices match booking page calculations exactly

interface PackageData {
  id: number;
  price: number;
  discountedPrice?: number;
  duration?: number;
  selectedHotels?: any;
  rooms?: any;
  selectedTourId?: number | null;
  tourSelection?: any;
  pricingMode?: string;
}

interface CalculationParams {
  packageData: PackageData;
  adults: number;
  children: number;
  infants: number;
  startDate?: string;
  endDate?: string;
  selectedDate?: string;
  dateMode?: "single" | "range";
  hotelPackage?: string;
  allRooms?: any[];
  allTours?: any[];
}

interface PriceBreakdown {
  subtotal: number;
  total: number;
  roomsCost: number;
  toursCost: number;
  excursionsCost: number;
  upgradePrice: number;
  actualNights: number;
  totalPAX: number;
  breakdown: {
    rooms: Array<{ name: string; nights: number; cost: number }>;
    tours: Array<{ name: string; price: number }>;
    excursions: Array<{ name: string; price: number }>;
  };
}

// Helper function to parse package arrays (same as EnhancedPriceCalculation)
const parsePackageArray = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
};

export function calculatePackagePrice(params: CalculationParams): PriceBreakdown {
  const {
    packageData,
    adults,
    children,
    infants,
    startDate,
    endDate,
    selectedDate,
    dateMode = "range",
    hotelPackage = "standard",
    allRooms = [],
    allTours = []
  } = params;

  // Parse package data (same logic as EnhancedPriceCalculation)
  const packageRooms = parsePackageArray(packageData.rooms);
  
  // Handle tours - can be single ID, array of IDs, or array of tour objects with pricing
  let packageTours: number[] = [];
  let tourPricingData: { [key: number]: { adultPrice: number; childPrice: number; infantPrice: number } } = {};
  
  if (packageData.selectedTourId) {
    packageTours = [packageData.selectedTourId];
  } else if (packageData.tourSelection) {
    const parsedTours = parsePackageArray(packageData.tourSelection);
    console.log('Parsed tours data:', parsedTours);
    
    // Handle new tour pricing structure with adult/child/infant prices
    if (parsedTours.length > 0 && typeof parsedTours[0] === 'object' && 'id' in parsedTours[0]) {
      // New format: [{id: 6, adultPrice: 200000, childPrice: 120000, infantPrice: 80000}]
      parsedTours.forEach((tour: any) => {
        if (tour.id) {
          packageTours.push(tour.id);
          tourPricingData[tour.id] = {
            adultPrice: (tour.adultPrice || 0) / 100, // Convert from piasters to EGP
            childPrice: (tour.childPrice || 0) / 100,
            infantPrice: (tour.infantPrice || 0) / 100
          };
        }
      });
    } else {
      // Old format: [6, 7, 8] or ["6", "7", "8"]
      packageTours = parsedTours.map(id => typeof id === 'string' ? parseInt(id) : id).filter(id => !isNaN(id));
    }
  }

  // Determine pricing mode
  const isPricingPerPerson = packageData.pricingMode === "per_person";

  // Calculate the number of nights based on the date range
  let actualNights = packageData.duration || 1;
  if (dateMode === "range" && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    actualNights = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24))
    );
  } else if (dateMode === "single" && selectedDate) {
    actualNights = packageData.duration || 1;
  }

  // Calculate total number of PAX
  const totalPAX = adults + children + infants;

  // Calculate room costs (CORE LOGIC from EnhancedPriceCalculation)
  let roomsCost = 0;
  let roomsBreakdown: Array<{ name: string; nights: number; cost: number }> = [];

  if (packageRooms.length > 0) {
    // Use the first available room for cost calculation (matches EnhancedPriceCalculation)
    const packageRoom = packageRooms[0];
    if (packageRoom) {
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

  // Calculate tours cost
  let toursCost = 0;
  let toursBreakdown: Array<{ name: string; price: number }> = [];

  if (packageTours.length > 0) {
    packageTours.forEach((tourId: number) => {
      // Use custom pricing data if available, otherwise fall back to tour database
      if (tourPricingData[tourId]) {
        const pricing = tourPricingData[tourId];
        const totalTourCost = 
          (pricing.adultPrice * adults) + 
          (pricing.childPrice * children) + 
          (pricing.infantPrice * infants);

        toursCost += totalTourCost;
        toursBreakdown.push({
          name: `Tour #${tourId}`, // We don't have tour name in pricing data
          price: totalTourCost,
        });
        
        console.log(`Tour ${tourId} cost calculation:`, {
          adults: adults,
          children: children,
          infants: infants,
          adultPrice: pricing.adultPrice,
          childPrice: pricing.childPrice,
          infantPrice: pricing.infantPrice,
          totalCost: totalTourCost
        });
      } else if (allTours.length > 0) {
        // Fallback to old pricing method
        const tour = allTours.find((t: any) => t.id === tourId);
        if (tour) {
          const tourPrice = tour.price / 100; // Convert from piasters to EGP
          const totalTourCost = isPricingPerPerson
            ? tourPrice * (adults + children * 0.7 + infants * 0.1)
            : tourPrice;

          toursCost += totalTourCost;
          toursBreakdown.push({
            name: tour.name || `Tour #${tourId}`,
            price: totalTourCost,
          });
        }
      }
    });
  }

  // Calculate optional excursions cost (placeholder for future implementation)
  let excursionsCost = 0;
  let excursionsBreakdown: Array<{ name: string; price: number }> = [];

  // Hotel package upgrades (if not already included in rooms)
  const hotelUpgrades = {
    standard: { name: "Standard", multiplier: 1, price: 0 },
    deluxe: { name: "Deluxe", multiplier: 1.2, price: 150 },
    luxury: { name: "Luxury", multiplier: 1.5, price: 300 },
  };

  const selectedUpgrade = hotelUpgrades[hotelPackage as keyof typeof hotelUpgrades] || hotelUpgrades.standard;
  const upgradePrice = packageRooms.length > 0 ? 0 : selectedUpgrade.price * actualNights * (adults + children);

  // Base package cost is excluded (matches EnhancedPriceCalculation)
  const packageBaseCost = 0;

  // Calculate subtotal (matches EnhancedPriceCalculation)
  const subtotal = packageBaseCost + roomsCost + toursCost + excursionsCost + upgradePrice;

  // For now, no VAT or service fees (can be added later if needed)
  const total = subtotal;

  return {
    subtotal,
    total,
    roomsCost,
    toursCost,
    excursionsCost,
    upgradePrice,
    actualNights,
    totalPAX,
    breakdown: {
      rooms: roomsBreakdown,
      tours: toursBreakdown,
      excursions: excursionsBreakdown,
    },
  };
}