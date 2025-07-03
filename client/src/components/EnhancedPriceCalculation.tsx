import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Users, Home, Star, Percent } from 'lucide-react';

type PackageData = {
  id: number;
  title: string;
  price: number;
  discountedPrice?: number;
  duration: number;
  currency?: string;
};

interface EnhancedPriceCalculationProps {
  packageData: PackageData;
  adults: number;
  children: number;
  infants: number;
  hotelPackage: string;
  roomDistribution: string;
}

export default function EnhancedPriceCalculation({
  packageData,
  adults,
  children,
  infants,
  hotelPackage,
  roomDistribution
}: EnhancedPriceCalculationProps) {
  // Base price calculation
  const basePrice = packageData.discountedPrice || packageData.price;
  const originalPrice = packageData.price;
  const hasDiscount = packageData.discountedPrice && packageData.discountedPrice < packageData.price;
  
  // Calculate pricing based on travelers
  const adultPrice = basePrice * adults;
  const childPrice = basePrice * 0.7 * children; // 30% discount for children
  const infantPrice = basePrice * 0.1 * infants; // 90% discount for infants
  
  // Hotel package upgrades
  const hotelUpgrades = {
    standard: { name: 'Standard', multiplier: 1, price: 0 },
    deluxe: { name: 'Deluxe', multiplier: 1.2, price: 15000 },
    luxury: { name: 'Luxury', multiplier: 1.5, price: 25000 }
  };
  
  const selectedUpgrade = hotelUpgrades[hotelPackage as keyof typeof hotelUpgrades] || hotelUpgrades.standard;
  const upgradePrice = selectedUpgrade.price * (adults + children);
  
  // Room distribution costs (example pricing)
  const getRoomCost = (roomDist: string) => {
    if (!roomDist) return 0;
    const roomCount = roomDist.split(',').length;
    return roomCount > 1 ? (roomCount - 1) * 8000 : 0; // Additional room cost
  };
  
  const roomCost = getRoomCost(roomDistribution);
  
  // Calculate subtotal
  const subtotal = adultPrice + childPrice + infantPrice + upgradePrice + roomCost;
  
  // VAT calculation (14% in Egypt)
  const vatRate = 0.14;
  const vatAmount = subtotal * vatRate;
  
  // Service fees
  const serviceFee = 500; // Fixed service fee
  
  // Total calculation
  const total = subtotal + vatAmount + serviceFee;
  
  // Savings calculation
  const originalTotal = hasDiscount ? (originalPrice * (adults + children + infants) + upgradePrice + roomCost + vatAmount + serviceFee) : 0;
  const savings = hasDiscount ? originalTotal - total : 0;

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US');
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5 text-primary" />
          Price Breakdown
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
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
            Package Pricing
          </h4>
          
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
        </div>

        <Separator />

        {/* Hotel Package Upgrade */}
        {hotelPackage !== 'standard' && (
          <>
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
            <Separator />
          </>
        )}

        {/* Room Distribution Cost */}
        {roomCost > 0 && (
          <>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Additional Rooms</h4>
              <div className="flex justify-between text-sm">
                <span>Extra room arrangements</span>
                <span>{formatPrice(roomCost)} EGP</span>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Subtotal */}
        <div className="flex justify-between font-medium">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)} EGP</span>
        </div>

        {/* VAT */}
        <div className="flex justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Percent className="w-3 h-3" />
            <span>VAT ({Math.round(vatRate * 100)}%)</span>
          </div>
          <span>{formatPrice(vatAmount)} EGP</span>
        </div>

        {/* Service Fee */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Service Fee</span>
          <span>{formatPrice(serviceFee)} EGP</span>
        </div>

        <Separator />

        {/* Discount/Savings */}
        {hasDiscount && savings > 0 && (
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

        {/* Duration Information */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>{packageData.duration} days</strong> package for{' '}
            <strong>{adults + children + infants} travelers</strong>
            {hasDiscount && (
              <div className="mt-1 text-green-700">
                🎉 You're saving {formatPrice(savings)} EGP with this offer!
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}