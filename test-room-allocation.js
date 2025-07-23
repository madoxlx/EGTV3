// Test script for 7-person room allocation
console.log("🧪 Testing 7-Person Room Allocation Logic");

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

// Copy the allocation functions from BookingComparison.tsx for testing
function handleSevenPeopleAllocation(availableRooms, nights) {
  const allocations = [];
  let totalCost = 0;

  // Find triple rooms (capacity 3)
  const tripleRooms = availableRooms.filter(room => room.capacity === 3);
  // Find single rooms (capacity 1)
  const singleRooms = availableRooms.filter(room => room.capacity === 1);

  console.log(`📊 Available Triple Rooms: ${tripleRooms.length}`);
  console.log(`📊 Available Single Rooms: ${singleRooms.length}`);

  // If we have both triple and single rooms available
  if (tripleRooms.length > 0 && singleRooms.length > 0) {
    // Sort by cost per person
    const sortedTriples = tripleRooms.sort((a, b) => (a.pricePerNight / a.capacity) - (b.pricePerNight / b.capacity));
    const sortedSingles = singleRooms.sort((a, b) => (a.pricePerNight / a.capacity) - (b.pricePerNight / b.capacity));

    // Allocate 2 triple rooms (6 people)
    const tripleRoom = sortedTriples[0];
    const tripleAllocation = {
      roomType: tripleRoom,
      roomsNeeded: 2,
      totalCapacity: 6,
      totalCost: 2 * tripleRoom.pricePerNight * nights
    };
    allocations.push(tripleAllocation);
    totalCost += tripleAllocation.totalCost;

    // Allocate 1 single room (1 person)
    const singleRoom = sortedSingles[0];
    const singleAllocation = {
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

  return {
    allocations: [],
    totalCost: 0,
    totalCapacity: 0,
    isValid: false,
    costPerPerson: 0
  };
}

// Test the allocation for 7 people with 2 nights
const nights = 2;
const totalPeople = 7;

console.log(`\n🎯 Testing allocation for ${totalPeople} people for ${nights} nights`);
console.log("Available rooms:");
testRooms.forEach(room => {
  console.log(`  • ${room.name}: ${room.capacity} people, ${room.pricePerNight} EGP/night`);
});

const result = handleSevenPeopleAllocation(testRooms, nights);

console.log("\n📋 ALLOCATION RESULT:");
console.log(`✅ Valid: ${result.isValid}`);
console.log(`👥 Total Capacity: ${result.totalCapacity} people`);
console.log(`💰 Total Cost: ${result.totalCost} EGP`);
console.log(`💸 Cost Per Person: ${result.costPerPerson.toFixed(2)} EGP`);

console.log("\n🏨 Room Breakdown:");
result.allocations.forEach((allocation, index) => {
  console.log(`  ${index + 1}. ${allocation.roomsNeeded} × ${allocation.roomType.name}`);
  console.log(`     Capacity: ${allocation.totalCapacity} people`);
  console.log(`     Cost: ${allocation.totalCost} EGP (${allocation.roomType.pricePerNight} EGP/night × ${allocation.roomsNeeded} rooms × ${nights} nights)`);
});

// Verify the expected result: 2 triple + 1 single
const expectedTripleRooms = result.allocations.find(a => a.roomType.capacity === 3)?.roomsNeeded || 0;
const expectedSingleRooms = result.allocations.find(a => a.roomType.capacity === 1)?.roomsNeeded || 0;

console.log("\n🔍 VERIFICATION:");
console.log(`Expected: 2 triple + 1 single rooms`);
console.log(`Actual: ${expectedTripleRooms} triple + ${expectedSingleRooms} single rooms`);

if (expectedTripleRooms === 2 && expectedSingleRooms === 1) {
  console.log("✅ TEST PASSED: Correct allocation for 7 people!");
} else {
  console.log("❌ TEST FAILED: Incorrect allocation!");
}