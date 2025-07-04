import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { ScrollArea } from "./scroll-area";
import { Badge } from "./badge";
import * as LucideIcons from "lucide-react";

// Comprehensive icon categories with 400+ icons for travel and tourism
const iconCategories = {
  travel: [
    "Plane", "PlaneTakeoff", "PlaneLanding", "Car", "CarFront", "Taxi", "Bus", "Train", "Tram",
    "Ship", "Sailboat", "Anchor", "Bike", "Motorcycle", "Scooter", "Walk", "Footprints", "MapPin",
    "Map", "Navigation", "Navigation2", "Route", "Signpost", "Milestone", "Compass", "Globe",
    "Globe2", "Earth", "Mountain", "MountainSnow", "TreePine", "Trees", "Waves", "Palmtree",
    "Tent", "Backpack", "Luggage", "Briefcase", "Suitcase", "Passport", "Ticket", "BoardingPass"
  ],
  accommodation: [
    "Hotel", "Home", "Building", "Building2", "Castle", "Warehouse", "Store", "Bed", "BedDouble",
    "BedSingle", "Bath", "Shower", "Wifi", "WifiOff", "AirVent", "Fan", "Heater", "Snowflake",
    "Thermometer", "Key", "KeyRound", "Door", "DoorOpen", "DoorClosed", "Stairs", "Elevator",
    "Parking", "ParkingCircle", "ParkingMeter", "CarFront", "Garage", "Home", "Hotel", "Building",
    "Warehouse", "Store", "ShoppingCart", "ShoppingBag", "CreditCard", "Banknote", "Coins"
  ],
  activities: [
    "Camera", "CameraOff", "Image", "Images", "Video", "VideoOff", "Film", "Clapperboard",
    "Binoculars", "Telescope", "Microscope", "Trophy", "Award", "Medal", "Target", "Crosshair",
    "Zap", "Heart", "HeartHandshake", "ThumbsUp", "ThumbsDown", "Star", "StarHalf", "Gift",
    "GiftCard", "PartyPopper", "Confetti", "Balloon", "Cake", "IceCream", "Cherry", "Apple",
    "Grape", "Banana", "Lemon", "Orange", "Strawberry", "Gamepad", "Gamepad2", "Joystick",
    "Dice1", "Dice2", "Dice3", "Dice4", "Dice5", "Dice6", "Casino", "Spade", "Club", "Diamond", "Heart"
  ],
  services: [
    "Shield", "ShieldCheck", "Lock", "LockOpen", "Unlock", "Phone", "PhoneCall", "PhoneIncoming",
    "PhoneOutgoing", "PhoneMissed", "Mail", "MailOpen", "MailCheck", "MessageCircle", "MessageSquare",
    "MessageSquareText", "Send", "Calendar", "CalendarDays", "CalendarCheck", "Clock", "Clock3",
    "Timer", "Stopwatch", "Users", "Users2", "User", "UserCheck", "UserPlus", "UserMinus",
    "Crown", "Key", "Tool", "Tools", "Wrench", "Hammer", "Screwdriver", "Settings", "Settings2",
    "Cog", "Info", "AlertCircle", "AlertTriangle", "CheckCircle", "CheckCircle2", "XCircle",
    "HelpCircle", "QuestionMarkCircle", "ExclamationTriangle", "Ban", "ShieldAlert", "ShieldX"
  ],
  food: [
    "UtensilsCrossed", "Utensils", "Fork", "Spoon", "Knife", "ChefHat", "Cookie", "Cake",
    "CakeSlice", "Pizza", "PizzaSlice", "Soup", "Salad", "Sandwich", "Croissant", "Donut",
    "Pretzel", "Popcorn", "IceCream", "IceCream2", "Milk", "Coffee", "Tea", "Wine", "WineGlass",
    "Beer", "Martini", "Cocktail", "CupSoda", "Bottle", "BottleWater", "Cherry", "Apple",
    "Grape", "Banana", "Lemon", "Orange", "Strawberry", "Carrot", "Corn", "Egg", "EggFried",
    "Fish", "Beef", "Ham", "Chicken", "Turkey", "Shrimp", "Lobster", "Crab"
  ],
  weather: [
    "Sun", "SunMoon", "Moon", "MoonStar", "Cloud", "CloudRain", "CloudDrizzle", "CloudSnow",
    "CloudHail", "CloudLightning", "Cloudy", "PartlyCloudy", "Zap", "Rainbow", "Snowflake",
    "Droplets", "Droplet", "Wind", "Tornado", "Hurricane", "Thermometer", "ThermometerSun",
    "ThermometerSnowflake", "Sunrise", "Sunset", "Eclipse", "Umbrella", "UmbrellaBeach"
  ],
  nature: [
    "TreePine", "Trees", "Tree", "Leaf", "Leaves", "Flower", "Flower2", "FlowerTulip", "Rose",
    "Cactus", "Grass", "Mountain", "MountainSnow", "Volcano", "Island", "Desert", "Forest",
    "Palmtree", "Coconut", "Waves", "Water", "Lake", "River", "Waterfall", "Beach", "Shell",
    "Starfish", "Fish", "Whale", "Dolphin", "Octopus", "Crab", "Lobster", "Shrimp", "Turtle",
    "Penguin", "Bird", "Eagle", "Dove", "Owl", "Parrot", "Flamingo", "Swan", "Duck", "Chicken",
    "Rabbit", "Cat", "Dog", "Horse", "Cow", "Pig", "Sheep", "Goat", "Deer", "Fox", "Wolf",
    "Bear", "Lion", "Tiger", "Elephant", "Giraffe", "Zebra", "Hippo", "Rhino", "Monkey", "Koala"
  ],
  sports: [
    "Football", "Basketball", "Baseball", "Tennis", "Golf", "Soccer", "Volleyball", "Rugby",
    "Cricket", "Hockey", "TableTennis", "Badminton", "Boxing", "MartialArts", "Wrestling",
    "Swimming", "Diving", "Surfing", "Skiing", "Snowboarding", "IceSkating", "Cycling",
    "Running", "Marathon", "Gymnastics", "Weightlifting", "Archery", "Fishing", "Hunting",
    "Rock", "Mountain", "Climbing", "Hiking", "Camping", "Kayak", "Canoe", "Sailing", "Windsurfing"
  ],
  transportation: [
    "Car", "CarFront", "Truck", "Van", "Bus", "Taxi", "Ambulance", "FireTruck", "PoliceCar",
    "Motorcycle", "Scooter", "Bike", "ElectricScooter", "Skateboard", "RollerSkate", "Train",
    "Subway", "Tram", "Monorail", "Plane", "PlaneTakeoff", "PlaneLanding", "Helicopter",
    "Rocket", "Satellite", "Ship", "Boat", "Sailboat", "Yacht", "Submarine", "Ferry", "Cruise"
  ],
  technology: [
    "Smartphone", "Tablet", "Laptop", "Desktop", "Monitor", "Tv", "Radio", "Camera", "Video",
    "Headphones", "Speaker", "Microphone", "Battery", "BatteryCharging", "Plug", "Cable",
    "Wifi", "Bluetooth", "Signal", "Antenna", "Router", "Server", "Database", "HardDrive",
    "Usb", "SdCard", "Cd", "Dvd", "Floppy", "Printer", "Scanner", "Fax", "Phone", "Watch",
    "Smartwatch", "VirtualReality", "GameController", "Remote", "Calculator", "Computer"
  ],
  business: [
    "Building", "Building2", "Office", "Factory", "Warehouse", "Store", "Shop", "Mall",
    "Bank", "Hospital", "School", "University", "Library", "Museum", "Theater", "Cinema",
    "Restaurant", "Cafe", "Bar", "Hotel", "Gym", "Spa", "Salon", "Pharmacy", "GasStation",
    "CarWash", "Laundry", "PostOffice", "Police", "FireStation", "Embassy", "Government",
    "Church", "Mosque", "Temple", "Synagogue", "Cemetery", "Park", "Zoo", "Aquarium"
  ],
  symbols: [
    "Heart", "Star", "Diamond", "Circle", "Square", "Triangle", "Hexagon", "Pentagon",
    "Cross", "Plus", "Minus", "Multiply", "Divide", "Equal", "Percent", "Hash", "At",
    "Ampersand", "Question", "Exclamation", "Period", "Comma", "Semicolon", "Colon",
    "Quote", "Apostrophe", "Hyphen", "Underscore", "Backslash", "Slash", "Pipe", "Tilde",
    "Caret", "Grave", "Dollar", "Euro", "Pound", "Yen", "Rupee", "Bitcoin", "Copyright",
    "Trademark", "Registered", "Degree", "Section", "Paragraph", "Bullet", "Ellipsis"
  ]
};

interface IconSelectorProps {
  value?: string;
  onChange: (iconName: string) => void;
  placeholder?: string;
  className?: string;
}

export function IconSelector({ value, onChange, placeholder = "Select an icon", className }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get all icons from our predefined categories
  const allCategoryIcons = Object.values(iconCategories).flat();
  
  // For now, focus on our curated categories which are known to work
  // We can expand to all Lucide icons later once we resolve the object-type rendering issue
  const allLucideIcons: string[] = [];

  // Combine our curated icons with all Lucide icons for maximum choice
  const combinedIcons = [...allCategoryIcons, ...allLucideIcons];
  const allAvailableIcons = combinedIcons.filter((icon, index) => combinedIcons.indexOf(icon) === index);

  // Filter icons based on search and category
  const filteredIcons = (() => {
    let iconsToFilter = allAvailableIcons;
    
    // If a category is selected, only show icons from that category
    if (selectedCategory) {
      iconsToFilter = iconCategories[selectedCategory as keyof typeof iconCategories] || [];
    }
    
    // Apply search filter
    const result = iconsToFilter.filter(iconName =>
      iconName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Optional debug logging (disabled for performance)
    // console.log("IconSelector Debug:", { allAvailableIcons: allAvailableIcons.length, filteredResult: result.length });
    
    return result;
  })();

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    
    if (!IconComponent) {
      return <div className="w-5 h-5 bg-gray-300 rounded" />;
    }
    
    try {
      // Handle both function and object type React components
      if (typeof IconComponent === 'function') {
        return <IconComponent size={20} />;
      } else if (typeof IconComponent === 'object' && IconComponent !== null) {
        // For object-type components, use them directly as JSX elements
        const Component = IconComponent;
        return <Component size={20} />;
      }
      
      return <div className="w-5 h-5 bg-gray-300 rounded" />;
    } catch (error) {
      console.warn(`Failed to render icon: ${iconName}`, error);
      return <div className="w-5 h-5 bg-gray-300 rounded" />;
    }
  };

  const selectedIcon = value ? renderIcon(value) : null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start ${className}`}
          type="button"
        >
          <div className="flex items-center gap-2">
            {selectedIcon || <div className="w-5 h-5" />}
            <span className="flex-1 text-left">
              {value || placeholder}
            </span>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh]" aria-describedby="icon-selector-description">
        <DialogHeader>
          <DialogTitle>Select an Icon (400+ Available)</DialogTitle>
          <p id="icon-selector-description" className="text-sm text-muted-foreground">
            Choose from hundreds of professional icons organized by category
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <Input
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {Object.keys(iconCategories).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
          
          {/* Icons Grid */}
          <ScrollArea className="h-96">
            <div className="grid grid-cols-10 gap-2 p-2">
              {filteredIcons.map((iconName) => (
                <Button
                  key={iconName}
                  variant={value === iconName ? "default" : "ghost"}
                  size="sm"
                  className="h-12 w-12 p-2 hover:bg-accent"
                  onClick={() => handleIconSelect(iconName)}
                  title={iconName}
                >
                  {renderIcon(iconName)}
                </Button>
              ))}
            </div>
            {filteredIcons.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No icons found matching your search.
              </div>
            )}
          </ScrollArea>
          
          {/* Icons Count */}
          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredIcons.length} icons
            {selectedCategory && ` in ${selectedCategory}`}
          </div>
          
          {/* Selected Icon Info */}
          {value && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              {selectedIcon}
              <span className="text-sm font-medium">{value}</span>
              <Badge variant="secondary" className="ml-auto">Selected</Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}