import { 
  Wifi, Tv, Coffee, Wind, Droplets, 
  Utensils, Car, Dumbbell, Waves, 
  Thermometer, Volume2, Battery, 
  Watch, Lock, Zap, Shield, Check
} from 'lucide-react';
import { useState } from 'react';

// Icon mapping for common amenities
const amenityConfig = {
  // Connectivity
  'wifi': { icon: <Wifi className="w-4 h-4" />, label: 'High-Speed WiFi' },
  'wireless charging': { icon: <Battery className="w-4 h-4" />, label: 'Wireless Charging' },
  'ethernet': { icon: <Wifi className="w-4 h-4" />, label: 'Wired Internet' },
  'bluetooth': { icon: <Volume2 className="w-4 h-4" />, label: 'Bluetooth' },
  
  // Entertainment
  'tv': { icon: <Tv className="w-4 h-4" />, label: 'Smart TV' },
  'streaming': { icon: <Tv className="w-4 h-4" />, label: 'Streaming' },
  'speaker': { icon: <Volume2 className="w-4 h-4" />, label: 'Speaker' },
  
  // Comfort
  'air conditioning': { icon: <Wind className="w-4 h-4" />, label: 'Air Conditioning' },
  'heating': { icon: <Thermometer className="w-4 h-4" />, label: 'Heating' },
  'curtains': { icon: <Watch className="w-4 h-4" />, label: 'Blackout Curtains' },
  
  // Bathroom
  'hair dryer': { icon: <Wind className="w-4 h-4" />, label: 'Hair Dryer' },
  'toiletries': { icon: <Droplets className="w-4 h-4" />, label: 'Toiletries' },
  'shower': { icon: <Droplets className="w-4 h-4" />, label: 'Rain Shower' },
  'bathtub': { icon: <Droplets className="w-4 h-4" />, label: 'Bathtub' },
  
  // Kitchen & Dining
  'coffee': { icon: <Coffee className="w-4 h-4" />, label: 'Coffee Maker' },
  'mini bar': { icon: <Coffee className="w-4 h-4" />, label: 'Mini Bar' },
  'fridge': { icon: <Coffee className="w-4 h-4" />, label: 'Mini Fridge' },
  'kettle': { icon: <Coffee className="w-4 h-4" />, label: 'Kettle' },
  'breakfast': { icon: <Utensils className="w-4 h-4" />, label: 'Breakfast' },
  
  // Facilities
  'gym': { icon: <Dumbbell className="w-4 h-4" />, label: 'Gym Access' },
  'pool': { icon: <Waves className="w-4 h-4" />, label: 'Pool' },
  'spa': { icon: <Droplets className="w-4 h-4" />, label: 'Spa' },
  'parking': { icon: <Car className="w-4 h-4" />, label: 'Parking' },
  'fitness': { icon: <Dumbbell className="w-4 h-4" />, label: 'Fitness' },
  
  // Safety & Security
  'safe': { icon: <Lock className="w-4 h-4" />, label: 'Safe' },
  'security': { icon: <Shield className="w-4 h-4" />, label: 'Security' },
  'lock': { icon: <Lock className="w-4 h-4" />, label: 'Digital Lock' },
  
  // Default fallback
  'default': { icon: <Check className="w-4 h-4" />, label: null }
};

// Replace the amenities grid item with this:
<div className="bg-gray-50 p-3 rounded-xl">
  <div className="flex items-center text-gray-700 mb-1">
    <Eye className="w-4 h-4 mr-2 text-amber-500" />
    <span className="text-sm font-medium">Amenities</span>
  </div>
  
  {/* Modern Amenities Display */}
  <div className="mt-3">
    {room.amenities && Array.isArray(room.amenities) ? (
      <div className="space-y-4">
        {/* Top 4 amenities displayed by default */}
        <div className="grid grid-cols-2 gap-2">
          {room.amenities.slice(0, 4).map((amenity, index) => {
            const amenityLower = amenity.toLowerCase();
            let matchedConfig = amenityConfig.default;
            let displayLabel = amenity;
            
            // Find matching configuration
            for (const [key, config] of Object.entries(amenityConfig)) {
              if (key !== 'default' && (
                amenityLower.includes(key) || 
                key.includes(amenityLower) ||
                amenityLower.replace(/\s+/g, '').includes(key.replace(/\s+/g, ''))
              )) {
                matchedConfig = config;
                displayLabel = config.label || amenity;
                break;
              }
            }
            
            return (
              <div 
                key={index} 
                className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-100 hover:border-amber-200 transition-colors"
              >
                <div className="w-6 h-6 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600">
                    {matchedConfig.icon}
                  </span>
                </div>
                <span className="text-sm text-gray-700 truncate font-medium">
                  {displayLabel}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Show more amenities if available */}
        {room.amenities.length > 4 && (
          <div className="pt-2">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center text-amber-600 text-sm font-medium hover:text-amber-700"
            >
              {showAll ? 'Show less' : `Show all ${room.amenities.length} amenities`}
              <svg 
                className={`w-4 h-4 ml-1 transition-transform ${showAll ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showAll && (
              <div className="mt-3 grid grid-cols-2 gap-2 animate-fadeIn">
                {room.amenities.slice(4).map((amenity, index) => {
                  const amenityLower = amenity.toLowerCase();
                  let matchedConfig = amenityConfig.default;
                  let displayLabel = amenity;
                  
                  for (const [key, config] of Object.entries(amenityConfig)) {
                    if (key !== 'default' && (
                      amenityLower.includes(key) || 
                      key.includes(amenityLower) ||
                      amenityLower.replace(/\s+/g, '').includes(key.replace(/\s+/g, ''))
                    )) {
                      matchedConfig = config;
                      displayLabel = config.label || amenity;
                      break;
                    }
                  }
                  
                  return (
                    <div 
                      key={index + 4} 
                      className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-100 hover:border-amber-200 transition-colors"
                    >
                      <div className="w-6 h-6 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-600">
                          {matchedConfig.icon}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700 truncate">
                        {displayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    ) : (
      <div className="text-gray-500 text-sm italic">No amenities listed</div>
    )}
  </div>
</div>