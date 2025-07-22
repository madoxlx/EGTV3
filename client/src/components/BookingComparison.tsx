import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Users, DollarSign, TrendingDown, TrendingUp, Calendar, RefreshCw } from 'lucide-react';

// Configuration constants - easy to modify
const ROOM_RATES = {
  TRIPLE_ROOM: 800,
  DOUBLE_ROOM: 1000,
  PER_PERSON_RATE: 1000
} as const;

const PACKAGE_CONFIG = {
  DEFAULT_NIGHTS: 3,
  TRIPLE_ROOMS: 3,
  DOUBLE_ROOMS: 1,
  MAX_PEOPLE_OPTION_1: 11 // 3 triple rooms (3 people each) + 1 double room (2 people)
} as const;

interface BookingComparisonProps {
  adults: number;
  children: number;
  infants: number;
  startDate?: string;
  endDate?: string;
}

export default function BookingComparison({ adults, children, infants, startDate, endDate }: BookingComparisonProps) {
  const [showComparison, setShowComparison] = useState(false);
  
  // Calculate nights from date range
  const nights = useMemo(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays); // At least 1 night
    }
    return PACKAGE_CONFIG.DEFAULT_NIGHTS;
  }, [startDate, endDate]);

  // Calculate total people (infants don't count for accommodation)
  const totalPeople = adults + children;
  
  // Memoize calculations to recalculate when dependencies change
  const calculations = useMemo(() => {
    // Option 1: Room-based pricing (3 Triple + 1 Double)
    const option1Cost = (ROOM_RATES.TRIPLE_ROOM * PACKAGE_CONFIG.TRIPLE_ROOMS + 
                         ROOM_RATES.DOUBLE_ROOM * PACKAGE_CONFIG.DOUBLE_ROOMS) * nights;
    
    // Option 2: Per person pricing
    const option2Cost = totalPeople * ROOM_RATES.PER_PERSON_RATE * nights;
    
    // Calculate cost per person for each option
    const option1CostPerPerson = totalPeople > 0 ? option1Cost / totalPeople : 0;
    const option2CostPerPerson = ROOM_RATES.PER_PERSON_RATE * nights;
    
    // Determine the cheaper option
    const option1IsCheaper = option1Cost < option2Cost;
    const savings = Math.abs(option1Cost - option2Cost);
    const savingsPerPerson = totalPeople > 0 ? savings / totalPeople : 0;
    
    // Check if Option 1 is applicable (within capacity)
    const option1Applicable = totalPeople <= PACKAGE_CONFIG.MAX_PEOPLE_OPTION_1;

    return {
      option1Cost,
      option2Cost,
      option1CostPerPerson,
      option2CostPerPerson,
      option1IsCheaper,
      savings,
      savingsPerPerson,
      option1Applicable
    };
  }, [totalPeople, nights]);

  const {
    option1Cost,
    option2Cost,
    option1CostPerPerson,
    option2CostPerPerson,
    option1IsCheaper,
    savings,
    savingsPerPerson,
    option1Applicable
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
          Smart Booking Comparison
          <RefreshCw className="h-4 w-4 text-green-500" />
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Compare pricing options for {totalPeople} people ({adults} adults, {children} children{infants > 0 ? `, ${infants} infants` : ''})
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
            {/* Option 1: Room-based */}
            <div className={`p-4 rounded-lg border-2 ${
              option1IsCheaper && option1Applicable 
                ? 'border-green-500 bg-green-50' 
                : option1Applicable 
                  ? 'border-gray-200 bg-gray-50' 
                  : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">Option 1: Room Package</span>
                  {option1IsCheaper && option1Applicable && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      BEST DEAL
                    </span>
                  )}
                  {!option1Applicable && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                      OVER CAPACITY
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{option1Cost.toLocaleString()} EGP</div>
                  <div className="text-sm text-muted-foreground">
                    {option1CostPerPerson.toFixed(0)} EGP per person
                  </div>
                </div>
              </div>
              
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>• {PACKAGE_CONFIG.TRIPLE_ROOMS} Triple rooms (3 people each)</span>
                  <span>{ROOM_RATES.TRIPLE_ROOM} EGP/night × {nights} nights = {ROOM_RATES.TRIPLE_ROOM * nights * PACKAGE_CONFIG.TRIPLE_ROOMS} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span>• {PACKAGE_CONFIG.DOUBLE_ROOMS} Double room (2 people)</span>
                  <span>{ROOM_RATES.DOUBLE_ROOM} EGP/night × {nights} nights = {ROOM_RATES.DOUBLE_ROOM * nights * PACKAGE_CONFIG.DOUBLE_ROOMS} EGP</span>
                </div>
                <div className="pt-2 text-muted-foreground">
                  Accommodates up to {PACKAGE_CONFIG.MAX_PEOPLE_OPTION_1} people
                  {!option1Applicable && (
                    <span className="text-red-600 font-medium"> (You have {totalPeople} people)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Option 2: Per person */}
            <div className={`p-4 rounded-lg border-2 ${
              !option1IsCheaper || !option1Applicable 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">Option 2: Per Person</span>
                  {(!option1IsCheaper || !option1Applicable) && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      {!option1Applicable ? 'ONLY OPTION' : 'BEST DEAL'}
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
                  <span>• {totalPeople} people × {ROOM_RATES.PER_PERSON_RATE} EGP/night</span>
                  <span>{totalPeople} × {ROOM_RATES.PER_PERSON_RATE} × {nights} nights</span>
                </div>
                <div className="pt-2 text-muted-foreground">
                  Flexible accommodation arrangement
                </div>
              </div>
            </div>

            {/* Savings Summary */}
            {option1Applicable && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Live Price Analysis</span>
                  <div className="ml-auto flex items-center gap-1 text-xs text-blue-600">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Auto-updated</span>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  {option1IsCheaper ? (
                    <>
                      <div className="text-green-700">
                        ✅ <strong>Room Package saves you {savings.toLocaleString()} EGP</strong> ({savingsPerPerson.toFixed(0)} EGP per person)
                      </div>
                      <div className="text-muted-foreground">
                        That's {((savings / option2Cost) * 100).toFixed(1)}% less than the per-person rate
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-blue-700">
                        💡 <strong>Per-person rate saves you {savings.toLocaleString()} EGP</strong> ({savingsPerPerson.toFixed(0)} EGP per person)
                      </div>
                      <div className="text-muted-foreground">
                        That's {((savings / option1Cost) * 100).toFixed(1)}% less than the room package
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => setShowComparison(false)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Hide Comparison
              </Button>
              <Button 
                size="sm"
                className="flex-1"
                variant={option1IsCheaper && option1Applicable ? "default" : "secondary"}
              >
                <Users className="h-4 w-4 mr-2" />
                Book {option1IsCheaper && option1Applicable ? 'Room Package' : 'Per Person'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}