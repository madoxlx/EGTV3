// Test script for Advanced Room Allocation Logic
console.log("🧪 Testing Advanced Room Allocation Logic");

// Mock room types similar to what's in the actual application
const testRooms = [
  {
    id: 1,
    name: "Standard Garden Triple",
    type: "triple",
    capacity: 3,
    pricePerNight: 1600,
    available: 5
  },
  {
    id: 2,
    name: "Standard Garden View",
    type: "double", 
    capacity: 2,
    pricePerNight: 2000,
    available: 10
  },
  {
    id: 3,
    name: "Single Garden view room",
    type: "single",
    capacity: 1,
    pricePerNight: 1000,
    available: 3
  }
];

// Copy the advanced allocation functions for testing
function generateAllRoomCombinations(availableRooms, totalPeople, adults, children) {
  const combinations = [];

  // Helper function to check if a room combination can accommodate the group
  function canAccommodateGroup(roomCombination) {
    let accommodatedAdults = 0;
    let accommodatedChildren = 0;
    
    for (const { roomType, count } of roomCombination) {
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
        const canAccommodate = Math.min(remainingToAccommodate, count * roomType.capacity);
        
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
  function generateCombinations(roomIndex, currentCombination) {
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

function findSmartRoomAllocation(totalPeople, availableRooms, nights, adults, children) {
  // Generate all possible room combinations and find the most cost-effective
  const allCombinations = generateAllRoomCombinations(availableRooms, totalPeople, adults, children);
  
  if (allCombinations.length === 0) {
    return {
      allocations: [],
      totalCost: 0,
      totalCapacity: 0,
      isValid: false,
      costPerPerson: 0
    };
  }

  // Sort combinations by total cost (most economical first)
  const sortedCombinations = allCombinations.sort((a, b) => a.totalCost - b.totalCost);
  const bestCombination = sortedCombinations[0];

  // Convert to allocation format with nights calculation
  const allocations = bestCombination.rooms.map(room => ({
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
function canActuallyAccommodateGroup(allocations, adults, children) {
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

// Test scenarios
const testCases = [
  {
    name: "4 Adults (should be 1 triple + 1 single)",
    adults: 4,
    children: 0,
    totalPeople: 4,
    expected: "1 triple + 1 single"
  },
  {
    name: "3 Adults + 1 Child (should be 1 triple)",
    adults: 3,
    children: 1,
    totalPeople: 4,
    expected: "1 triple"
  },
  {
    name: "7 Adults (should be 2 triple + 1 single)",
    adults: 7,
    children: 0,
    totalPeople: 7,
    expected: "2 triple + 1 single"
  },
  {
    name: "2 Adults + 2 Children (should be 1 triple OR 2 double)",
    adults: 2,
    children: 2,
    totalPeople: 4,
    expected: "optimal allocation"
  }
];

const nights = 2;

console.log("\n🎯 Testing Multiple Scenarios:");
console.log("Available rooms:");
testRooms.forEach(room => {
  console.log(`  • ${room.name}: ${room.capacity} people, ${room.pricePerNight} EGP/night`);
});

testCases.forEach((testCase, index) => {
  console.log(`\n📋 TEST CASE ${index + 1}: ${testCase.name}`);
  console.log(`   Adults: ${testCase.adults}, Children: ${testCase.children}, Total: ${testCase.totalPeople}`);
  
  const result = findSmartRoomAllocation(testCase.totalPeople, testRooms, nights, testCase.adults, testCase.children);
  
  console.log(`   ✅ Valid: ${result.isValid}`);
  console.log(`   👥 Total Capacity: ${result.totalCapacity} people`);
  console.log(`   💰 Total Cost: ${result.totalCost} EGP`);
  console.log(`   💸 Cost Per Person: ${result.costPerPerson.toFixed(2)} EGP`);
  
  console.log("   🏨 Room Allocation:");
  result.allocations.forEach((allocation, allocIndex) => {
    console.log(`     ${allocIndex + 1}. ${allocation.roomsNeeded} × ${allocation.roomType.name}`);
    console.log(`        Capacity: ${allocation.totalCapacity} people`);
    console.log(`        Cost: ${allocation.totalCost} EGP`);
  });

  // Special validation for 4 adults case
  if (testCase.adults === 4 && testCase.children === 0) {
    const tripleRooms = result.allocations.find(a => a.roomType.name.includes('Triple'))?.roomsNeeded || 0;
    const singleRooms = result.allocations.find(a => a.roomType.name.includes('Single'))?.roomsNeeded || 0;
    
    console.log(`   🔍 Expected: 1 triple + 1 single`);
    console.log(`   🔍 Actual: ${tripleRooms} triple + ${singleRooms} single`);
    
    if (tripleRooms === 1 && singleRooms === 1) {
      console.log("   ✅ PERFECT! 4 adults correctly allocated to 1 triple + 1 single");
    } else {
      console.log("   ❌ Not optimal for 4 adults");
    }
  }
});

console.log("\n🚀 Advanced Room Allocation Testing Complete!");