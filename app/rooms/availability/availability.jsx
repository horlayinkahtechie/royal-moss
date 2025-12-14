"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import supabase from "../../lib/supabase";
import Image from "next/image";
import {
  Star,
  Users,
  Maximize2,
  CheckCircle,
  XCircle,
  Calendar,
  Wifi,
  Coffee,
  Wind,
  Tv,
  Utensils,
  MapPin,
  Filter,
  ArrowLeft,
  Clock,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Download,
  Building,
  MapPin as MapPinIcon,
  Phone,
  Mail,
  Check,
  Eye,
} from "lucide-react";

export default function Availability() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const roomType = searchParams.get("type") || "";
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    sortBy: "price_low",
    availability: "all",
    priceRange: [0, 1000],
  });
  
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const roomTypeNames = {
    "deluxe-ocean-view": "Deluxe Ocean View",
    "executive-suite": "Executive Suite",
    "presidential-apartment": "Presidential Apartment",
    "family-luxury-suite": "Family Luxury Suite",
  };

  const amenityIcons = {
    "Free WiFi": Wifi,
    "Breakfast Included": Coffee,
    "Sea View": Maximize2,
    "King Bed": Users,
    "Executive Lounge": Users,
    "Butler Service": Users,
    "Jacuzzi": Maximize2,
    "City View": Maximize2,
    "Private Pool": Maximize2,
    "Gourmet Kitchen": Utensils,
    "Cinema Room": Tv,
    "24/7 Butler": Users,
    "Kids Club Access": Users,
    "Connected Rooms": Users,
    "Game Console": Tv,
    "Family Amenities": Users,
    "Air Conditioning": Wind,
    "Room Service": Utensils,
    "Minibar": Coffee,
    "Smart TV": Tv,
    "Coffee Maker": Coffee,
    "Safe": Shield,
    "Hair Dryer": Wind,
    "Iron": Utensils,
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [roomType]);

  useEffect(() => {
    applyFilters();
  }, [rooms, filters]);

  const fetchRooms = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("rooms")
        .select("*");

      if (roomType) {
        query = query.eq("room_category", roomType);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!data || data.length === 0) {
        setError("No rooms found for this category");
        setRooms([]);
        return;
      }

      // Format room data
      const formattedRooms = data.map((room) => ({
        id: room.id,
        title: room.room_category
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        description: room.room_description,
        price: room.price_per_night,
        discountedPrice: room.discounted_price_per_night,
        rating: room.user_ratings || 4.5,
        guests: room.no_of_guest,
        size: room.room_dismesion,
        availability: room.room_availability,
        amenities: Array.isArray(room.amenities) 
          ? room.amenities 
          : (room.amenities ? JSON.parse(room.amenities) : []),
        images: Array.isArray(room.room_image) 
          ? room.room_image 
          : (room.room_image ? JSON.parse(room.room_image) : []),
        createdAt: room.created_at,
        roomNumber: room.room_number || `Room ${room.id.slice(0, 4)}`,
        floor: room.floor || "3rd Floor",
        view: room.view || "Ocean View",
        bedType: room.bed_type || "King Bed",
      }));

      setRooms(formattedRooms);
      
      // Set initial price range
      const prices = formattedRooms.map((r) => r.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setFilters(prev => ({ ...prev, priceRange: [minPrice, maxPrice] }));

    } catch (err) {
      setError(err.message || "Failed to fetch rooms");
      console.error("Error fetching rooms:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rooms];

    // Filter by availability
    if (filters.availability !== "all") {
      filtered = filtered.filter(room => 
        filters.availability === "available" 
          ? room.availability 
          : !room.availability
      );
    }

    // Filter by price range
    filtered = filtered.filter(room => 
      room.price >= filters.priceRange[0] && 
      room.price <= filters.priceRange[1]
    );

    // Sort rooms
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "price_low":
          return a.price - b.price;
        case "price_high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "guests":
          return b.guests - a.guests;
        default:
          return 0;
      }
    });

    setFilteredRooms(filtered);
  };

  const handleBookNow = (roomId, isAvailable) => {
    if (!isAvailable) return;
    // Add booking logic here
    console.log("Booking room:", roomId);
  };

  const handleViewDetails = (room) => {
    setSelectedRoom(room);
    setCurrentImageIndex(0);
    setIsLiked(false);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
    document.body.style.overflow = "auto";
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    if (selectedRoom && selectedRoom.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === selectedRoom.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    if (selectedRoom && selectedRoom.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? selectedRoom.images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    // Add share logic here
    if (navigator.share) {
      navigator.share({
        title: selectedRoom.title,
        text: `Check out this amazing room at Royal Moss!`,
        url: window.location.href,
      });
    }
  };

  const getRoomImage = (images) => {
    if (!images || images.length === 0) {
      return null;
    }
    return images[0];
  };

  const renderAmenityIcon = (amenity) => {
    const Icon = amenityIcons[amenity] || Users;
    return <Icon className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-600">Loading rooms...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Content */}
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-purple-600 pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => router.back()}
              className="flex items-center cursor-pointer text-white/90 hover:text-white mb-8 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Rooms
            </button>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {roomTypeNames[roomType] || "Available Rooms"}
                </h1>
                <p className="text-xl text-white/90">
                  {rooms.length} rooms available • Select your perfect stay
                </p>
              </div>

              <div className="mt-6 lg:mt-0">
                <div className="flex items-center space-x-4 text-white">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-emerald-300" />
                    <span>{rooms.filter(r => r.availability).length} Available</span>
                  </div>
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 mr-2 text-rose-300" />
                    <span>{rooms.filter(r => !r.availability).length} Occupied</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="sticky top-20 z-30 bg-white border-b border-gray-200 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Filter Controls */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Sort by:</span>
                </div>
                
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                >
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="guests">Most Guests</option>
                </select>

                <select
                  value={filters.availability}
                  onChange={(e) => setFilters({...filters, availability: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Rooms</option>
                  <option value="available">Available Only</option>
                  <option value="occupied">Occupied Only</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600">
                Showing {filteredRooms.length} of {rooms.length} rooms
              </div>
            </div>
          </div>
        </div>

        {/* Rooms List */}
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {error ? (
              <div className="text-center py-20">
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {error}
                </h3>
                <p className="text-gray-600 mb-6">
                  Please try selecting a different room category
                </p>
                <button
                  onClick={() => router.push("/rooms")}
                  className="px-6 py-3 bg-sky-600 cursor-pointer text-white rounded-full font-semibold hover:bg-sky-700 transition-colors"
                >
                  Browse All Rooms
                </button>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Filter className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No rooms match your filters
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters to find available rooms
                </p>
                <button
                  onClick={() => setFilters({
                    sortBy: "price_low",
                    availability: "all",
                    priceRange: [0, 1000],
                  })}
                  className="px-6 py-3 cursor-pointer bg-sky-600 text-white rounded-full font-semibold hover:bg-sky-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredRooms.map((room) => {
                  const mainImage = getRoomImage(room.images);
                  
                  return (
                    <div
                      key={room.id}
                      className={`bg-white rounded-2xl shadow-lg overflow-hidden border ${
                        room.availability 
                          ? "border-gray-200 hover:border-sky-300" 
                          : "border-gray-200 opacity-80"
                      } transition-all duration-300 hover:shadow-xl`}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Image Section */}
                        <div className="md:w-2/5 relative">
                          <div className="aspect-[4/3] md:aspect-auto md:h-full">
                            {mainImage ? (
                              <Image
                                src={mainImage}
                                alt={room.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 40vw"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-sky-400 to-purple-500 flex items-center justify-center">
                                <div className="text-white text-center">
                                  <div className="text-2xl font-bold opacity-20">
                                    Royal Moss
                                  </div>
                                  <div className="text-sm opacity-40">Luxury Room</div>
                                </div>
                              </div>
                            )}
                            
                            {/* Availability Badge */}
                            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${
                              room.availability 
                                ? "bg-emerald-500 text-white" 
                                : "bg-rose-500 text-white"
                            }`}>
                              {room.availability ? "AVAILABLE" : "OCCUPIED"}
                            </div>
                            
                            {/* Discount Badge */}
                            {room.discountedPrice && (
                              <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                SAVE ${room.price - room.discountedPrice}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Details Section */}
                        <div className="md:w-3/5 p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {room.title}
                              </h3>
                              <div className="flex items-center space-x-3 mt-2">
                                <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded-lg">
                                  <Star className="w-4 h-4 mr-1 fill-current" />
                                  <span className="font-bold">{room.rating.toFixed(1)}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Users className="w-4 h-4 mr-1" />
                                  {room.guests} Guests
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Maximize2 className="w-4 h-4 mr-1" />
                                  {room.size}
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4">{room.description}</p>

                          {/* Amenities */}
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Room Amenities
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {room.amenities.slice(0, 4).map((amenity, index) => (
                                <div
                                  key={index}
                                  className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                >
                                  {renderAmenityIcon(amenity)}
                                  <span className="ml-2">{amenity}</span>
                                </div>
                              ))}
                              {room.amenities.length > 4 && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  +{room.amenities.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Pricing & Action */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div>
                              <div className="flex items-center">
                                {room.discountedPrice ? (
                                  <>
                                    <span className="text-2xl font-bold text-gray-900">
                                      ${room.discountedPrice}
                                    </span>
                                    <span className="ml-2 text-lg text-gray-500 line-through">
                                      ${room.price}
                                    </span>
                                    <span className="ml-2 text-sm font-bold text-emerald-600">
                                      ({Math.round((1 - room.discountedPrice / room.price) * 100)}% off)
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-2xl font-bold text-gray-900">
                                      ${room.price}
                                  </span>
                                )}
                                <span className="ml-2 text-sm text-gray-600">/night</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Clock className="w-4 h-4 mr-1" />
                                Updated just now
                              </div>
                            </div>

                            <div className="space-x-3">
                              <button
                                onClick={() => handleBookNow(room.id, room.availability)}
                                disabled={!room.availability}
                                className={`px-6 py-3 cursor-pointer rounded-xl font-semibold transition-all duration-300 ${
                                  room.availability
                                    ? "bg-sky-600 text-white hover:bg-sky-700 hover:shadow-lg transform hover:-translate-y-0.5"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                {room.availability ? "Book Now" : "Not Available"}
                              </button>
                              
                              <button
                                onClick={() => handleViewDetails(room)}
                                className="px-4 py-2 border cursor-pointer border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal with blurred background */}
      {isModalOpen && selectedRoom && (
        <>
          {/* Blurred Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>

              <div className="flex flex-col lg:flex-row">
                {/* Left Column - Images */}
                <div className="lg:w-2/3 relative">
                  <div className="aspect-[16/9] lg:aspect-auto lg:h-[70vh] relative overflow-hidden">
                    {selectedRoom.images.length > 0 ? (
                      <>
                        <Image
                          src={selectedRoom.images[currentImageIndex]}
                          alt={`${selectedRoom.title} - Image ${currentImageIndex + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 66vw"
                        />
                        
                        {/* Navigation Buttons */}
                        {selectedRoom.images.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                            >
                              <ChevronLeft className="w-6 h-6 text-gray-700" />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                            >
                              <ChevronRight className="w-6 h-6 text-gray-700" />
                            </button>
                          </>
                        )}
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {selectedRoom.images.length}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="absolute top-4 left-4 flex space-x-2">
                          <button
                            onClick={handleLike}
                            className="p-3 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                          >
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                          </button>
                          <button 
                            onClick={handleShare}
                            className="p-3 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                          >
                            <Share2 className="w-5 h-5 text-gray-700" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-sky-400 to-purple-500 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-4xl font-bold opacity-20 mb-2">Royal Moss</div>
                          <div className="text-lg opacity-40">Luxury Room</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnail Gallery */}
                  {selectedRoom.images.length > 1 && (
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex space-x-2 overflow-x-auto">
                        {selectedRoom.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                              currentImageIndex === index 
                                ? 'border-sky-500' 
                                : 'border-transparent'
                            }`}
                          >
                            <div className="relative w-full h-full">
                              <Image
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Details */}
                <div className="lg:w-1/3 p-8 overflow-y-auto">
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {selectedRoom.title}
                        </h2>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                          selectedRoom.availability 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {selectedRoom.availability ? "AVAILABLE NOW" : "CURRENTLY OCCUPIED"}
                        </div>
                      </div>
                      <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-1 rounded-lg">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        <span className="font-bold">{selectedRoom.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-6">{selectedRoom.description}</p>
                    
                    {/* Room Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center text-gray-700 mb-1">
                          <Users className="w-4 h-4 mr-2 text-sky-500" />
                          <span className="text-sm font-medium">Guests</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{selectedRoom.guests}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center text-gray-700 mb-1">
                          <Maximize2 className="w-4 h-4 mr-2 text-purple-500" />
                          <span className="text-sm font-medium">Size</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{selectedRoom.size}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center text-gray-700 mb-1">
                          <Building className="w-4 h-4 mr-2 text-emerald-500" />
                          <span className="text-sm font-medium">Floor</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{selectedRoom.floor}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center text-gray-700 mb-1">
                          <Eye className="w-4 h-4 mr-2 text-amber-500" />
                          <span className="text-sm font-medium">View</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{selectedRoom.view}</div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-8 p-6 bg-gradient-to-r from-sky-50 to-purple-50 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Starting from</div>
                        <div className="flex items-center">
                          {selectedRoom.discountedPrice ? (
                            <>
                              <span className="text-3xl font-bold text-gray-900">
                                ${selectedRoom.discountedPrice}
                              </span>
                              <span className="ml-2 text-lg text-gray-500 line-through">
                                ${selectedRoom.price}
                              </span>
                              <span className="ml-2 text-sm font-bold text-emerald-600">
                                ({Math.round((1 - selectedRoom.discountedPrice / selectedRoom.price) * 100)}% off)
                              </span>
                            </>
                          ) : (
                            <span className="text-3xl font-bold text-gray-900">
                              ${selectedRoom.price}
                            </span>
                          )}
                          <span className="ml-2 text-gray-600">per night</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleBookNow(selectedRoom.id, selectedRoom.availability)}
                      disabled={!selectedRoom.availability}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                        selectedRoom.availability
                          ? "bg-sky-600 text-white hover:bg-sky-700 hover:shadow-lg"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {selectedRoom.availability ? "Book This Room" : "Currently Unavailable"}
                    </button>
                  </div>

                  {/* Amenities */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Room Amenities</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedRoom.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          {renderAmenityIcon(amenity)}
                          <span className="text-sm text-gray-700">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Additional Information</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Check className="w-4 h-4 mr-2 text-emerald-500" />
                        <span>Free cancellation up to 48 hours before check-in</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="w-4 h-4 mr-2 text-emerald-500" />
                        <span>Complimentary breakfast included</span>
                      </div>
                      <div className="flex items-center">
                        <Check className="w-4 h-4 mr-2 text-emerald-500" />
                        <span>24/7 concierge service</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Need assistance?</p>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Us
                      </button>
                      <button className="flex items-center px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Us
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}