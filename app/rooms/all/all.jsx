"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabase";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Users,
  Maximize2,
  MapPin,
  ArrowRight,
  Shield,
  Wifi,
  Coffee,
  Wind,
  Filter,
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  Building,
  Eye,
  Calendar,
} from "lucide-react";

export default function AllRooms() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [filters, setFilters] = useState({
    sortBy: "price_low",
    search: "",
    priceRange: [0, 1000],
    guests: "all",
    amenities: [],
  });

  const roomCategories = {
    "deluxe-ocean-view": "Deluxe Ocean View",
    "executive-suite": "Executive Suite",
    "presidential-apartment": "Presidential Apartment",
    "family-luxury-suite": "Family Luxury Suite",
  };

  const allAmenities = [
    "Free WiFi",
    "Breakfast Included",
    "Sea View",
    "King Bed",
    "Executive Lounge",
    "Butler Service",
    "Jacuzzi",
    "City View",
    "Private Pool",
    "Gourmet Kitchen",
    "Cinema Room",
    "24/7 Butler",
    "Kids Club Access",
    "Connected Rooms",
    "Game Console",
    "Family Amenities",
    "Air Conditioning",
    "Room Service",
    "Minibar",
    "Smart TV",
    "Coffee Maker",
    "Safe",
    "Hair Dryer",
    "Iron",
  ];

  const amenityIcons = {
    "Free WiFi": Wifi,
    "Breakfast Included": Coffee,
    "Sea View": MapPin,
    "King Bed": Users,
    "Executive Lounge": Building,
    "Butler Service": Users,
    Jacuzzi: Maximize2,
    "City View": MapPin,
    "Private Pool": Maximize2,
    "Gourmet Kitchen": Shield,
    "Cinema Room": Shield,
    "24/7 Butler": Users,
    "Kids Club Access": Users,
    "Connected Rooms": Building,
    "Game Console": Shield,
    "Family Amenities": Users,
    "Air Conditioning": Wind,
    "Room Service": Shield,
    Minibar: Coffee,
    "Smart TV": Shield,
    "Coffee Maker": Coffee,
    Safe: Shield,
    "Hair Dryer": Wind,
    Iron: Shield,
  };

  useEffect(() => {
    fetchRooms();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rooms, filters, selectedCategory]);

  const fetchRooms = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("rooms")
        .select("*")
        .order("price_per_night", { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!data || data.length === 0) {
        setError("No rooms found");
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
        amenities: Array.isArray(room.amenities)
          ? room.amenities
          : room.amenities
          ? JSON.parse(room.amenities)
          : [],
        images: Array.isArray(room.room_image)
          ? room.room_image
          : room.room_image
          ? JSON.parse(room.room_image)
          : [],
        createdAt: room.created_at,
        roomNumber: room.room_number || `Room ${room.id.slice(0, 4)}`,
        floor: room.floor || "3rd Floor",
        view: room.view || "Ocean View",
        bedType: room.bed_type || "King Bed",
        roomCategory: room.room_category,
        categoryName: roomCategories[room.room_category] || room.room_category,
      }));

      setRooms(formattedRooms);

      // Set initial price range
      const prices = formattedRooms.map((r) => r.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setFilters((prev) => ({ ...prev, priceRange: [minPrice, maxPrice] }));
    } catch (err) {
      setError(err.message || "Failed to fetch rooms");
      console.error("Error fetching rooms:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("room_category")
        .order("room_category");

      if (error) throw error;

      const uniqueCategories = [...new Set(data.map((r) => r.room_category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...rooms];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (room) => room.roomCategory === selectedCategory
      );
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (room) =>
          room.title.toLowerCase().includes(searchLower) ||
          room.description.toLowerCase().includes(searchLower) ||
          room.categoryName.toLowerCase().includes(searchLower)
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (room) =>
        room.price >= filters.priceRange[0] &&
        room.price <= filters.priceRange[1]
    );

    // Filter by guests
    if (filters.guests !== "all") {
      filtered = filtered.filter(
        (room) => room.guests >= parseInt(filters.guests)
      );
    }

    // Filter by amenities
    if (filters.amenities.length > 0) {
      filtered = filtered.filter((room) =>
        filters.amenities.every((amenity) => room.amenities.includes(amenity))
      );
    }

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
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "popular":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredRooms = applyFilters();

  const handleBookNow = (roomId, roomData = null) => {
    if (roomData) {
      const roomImage = getRoomImage(roomData.images);
      router.push(
        `/book?roomId=${roomId}&type=${roomData.roomCategory}&price=${
          roomData.price
        }&roomImage=${
          roomImage ? encodeURIComponent(roomImage) : "No room image"
        }&title=${encodeURIComponent(roomData.title)}`
      );
    } else {
      const room = filteredRooms.find((r) => r.id === roomId);
      if (room) {
        const roomImage = getRoomImage(room.images);
        router.push(
          `/book?roomId=${roomId}&type=${room.roomCategory}&price=${
            room.price
          }&roomImage=${
            roomImage ? encodeURIComponent(roomImage) : "No room image"
          }&title=${encodeURIComponent(room.title)}`
        );
      }
    }
  };

  const handleViewDetails = (room) => {
    setSelectedRoom(room);
    setCurrentImageIndex(0);
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

  const getRoomImage = (images) => {
    if (!images || images.length === 0) {
      return null;
    }
    return images[0];
  };

  const renderAmenityIcon = (amenity) => {
    const Icon = amenityIcons[amenity] || Shield;
    return <Icon className="w-4 h-4" />;
  };

  const handleAmenityToggle = (amenity) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setFilters({
      sortBy: "price_low",
      search: "",
      priceRange: [0, 1000],
      guests: "all",
      amenities: [],
    });
  };

  const getCategoryStats = () => {
    const stats = {};
    categories.forEach((category) => {
      stats[category] = rooms.filter(
        (room) => room.roomCategory === category
      ).length;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  if (isLoading) {
    return (
      <section className="min-h-screen bg-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-600">Loading all rooms...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* Header */}
      <div className="pt-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-sky-50 text-sky-700 rounded-full text-sm font-semibold mb-4">
              <Star className="w-4 h-4 mr-2 fill-current" />
              EXPLORE OUR COLLECTION
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              All <span className="text-sky-600">Rooms & Suites</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our complete collection of luxurious accommodations
            </p>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="sticky top-20 z-30 bg-white border-b border-gray-200 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                  selectedCategory === "all"
                    ? "bg-sky-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Building className="w-4 h-4 mr-2" />
                All Rooms ({rooms.length})
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                    selectedCategory === category
                      ? "bg-sky-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Star className="w-4 h-4 mr-2" />
                  {roomCategories[category] || category} (
                  {categoryStats[category] || 0})
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              {showAdvancedFilters ? "Hide Filters" : "Show Filters"}
              <ChevronDown
                className={`w-4 h-4 ml-2 transition-transform ${
                  showAdvancedFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-white border-b border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search rooms by name or description..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Guests Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guests
                </label>
                <select
                  value={filters.guests}
                  onChange={(e) =>
                    setFilters({ ...filters, guests: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Guests</option>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                >
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="guests">Most Guests</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ${filters.priceRange[0]} - $
                  {filters.priceRange[1]}
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.priceRange[0]}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        priceRange: [
                          parseInt(e.target.value),
                          filters.priceRange[1],
                        ],
                      })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        priceRange: [
                          filters.priceRange[0],
                          parseInt(e.target.value),
                        ],
                      })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Reset Button */}
              <div className="md:col-span-2 flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            </div>

            {/* Amenities Filter */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {allAmenities.slice(0, 8).map((amenity) => (
                  <button
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filters.amenities.includes(amenity)
                        ? "bg-sky-100 text-sky-700 border border-sky-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {renderAmenityIcon(amenity)}
                    <span className="ml-2">{amenity}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Filters */}
            {filters.amenities.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Selected:</span>
                  {filters.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center px-2 py-1 bg-sky-50 text-sky-700 rounded text-xs"
                    >
                      {amenity}
                      <button
                        onClick={() => handleAmenityToggle(amenity)}
                        className="ml-1 text-sky-600 hover:text-sky-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rooms List */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Summary */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === "all"
                  ? "All Available Rooms"
                  : roomCategories[selectedCategory] || selectedCategory}
              </h2>
              <p className="text-gray-600 mt-1">
                Showing {filteredRooms.length} of {rooms.length} rooms
                {filters.search && ` matching "${filters.search}"`}
              </p>
            </div>
          </div>

          {error && filteredRooms.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{error}</h3>
              <button
                onClick={fetchRooms}
                className="px-6 py-3 bg-sky-600 cursor-pointer text-white rounded-full font-semibold hover:bg-sky-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No rooms match your search
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 cursor-pointer bg-sky-600 text-white rounded-full font-semibold hover:bg-sky-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRooms.map((room) => {
                const mainImage = getRoomImage(room.images);

                return (
                  <div
                    key={room.id}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:border-sky-300 transition-all duration-300 hover:shadow-xl"
                  >
                    {/* Image Container */}
                    <div className="relative h-48 overflow-hidden">
                      {mainImage ? (
                        <Image
                          src={mainImage}
                          alt={room.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-sky-400 to-purple-500 flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="text-2xl font-bold opacity-20">
                              Royal Moss
                            </div>
                            <div className="text-sm opacity-40">
                              Luxury Room
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <div className="flex items-center text-xs font-medium text-gray-900">
                          <Building className="w-3 h-3 mr-1" />
                          {room.categoryName}
                        </div>
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-amber-500 fill-current mr-1" />
                          <span className="font-bold text-gray-900 text-sm">
                            {room.rating}
                          </span>
                        </div>
                      </div>

                      {/* Discount Badge */}
                      {room.discountedPrice && (
                        <div className="absolute bottom-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          SAVE ${room.price - room.discountedPrice}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors line-clamp-1">
                        {room.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {room.description}
                      </p>

                      {/* Room Details */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-1 text-sky-500" />
                            {room.guests}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Maximize2 className="w-4 h-4 mr-1 text-purple-500" />
                            {room.size}
                          </div>
                        </div>
                      </div>

                      {/* Room Info */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          <Building className="w-3 h-3 mr-1" />
                          {room.floor}
                        </div>
                        <div className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          {room.view}
                        </div>
                      </div>

                      {/* Amenities */}
                      {room.amenities.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {room.amenities
                              .slice(0, 3)
                              .map((amenity, index) => (
                                <div
                                  key={index}
                                  className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                                  title={amenity}
                                >
                                  {renderAmenityIcon(amenity)}
                                  <span className="ml-1 truncate max-w-20">
                                    {amenity}
                                  </span>
                                </div>
                              ))}
                            {room.amenities.length > 3 && (
                              <div className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                                +{room.amenities.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Price & Action */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <div className="flex items-center">
                            {room.discountedPrice ? (
                              <>
                                <span className="text-xl font-bold text-gray-900">
                                  ${room.discountedPrice}
                                </span>
                                <span className="ml-2 text-sm text-gray-500 line-through">
                                  ${room.price}
                                </span>
                              </>
                            ) : (
                              <span className="text-xl font-bold text-gray-900">
                                ${room.price}
                              </span>
                            )}
                            <span className="ml-1 text-sm text-gray-600">
                              /night
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(room)}
                            className="p-2 text-gray-600 hover:text-sky-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleBookNow(room.id, room)}
                            className="px-4 py-2 cursor-pointer bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors transform hover:-translate-y-0.5"
                          >
                            Book Now
                          </button>
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
            <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>

              <div className="p-6">
                {/* Image */}
                <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6">
                  {selectedRoom.images.length > 0 ? (
                    <Image
                      src={selectedRoom.images[currentImageIndex]}
                      alt={selectedRoom.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 100vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-sky-400 to-purple-500 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-3xl font-bold opacity-20">
                          Royal Moss
                        </div>
                        <div className="text-lg opacity-40">Luxury Room</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {selectedRoom.title}
                          </h2>
                          <div className="inline-flex items-center px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold mt-2">
                            {selectedRoom.categoryName}
                          </div>
                        </div>
                        <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-1 rounded-lg">
                          <Star className="w-4 h-4 mr-1 fill-current" />
                          <span className="font-bold">
                            {selectedRoom.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-6">
                        {selectedRoom.description}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Room Information
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-lg">
                          <div className="flex items-center text-gray-700 mb-1">
                            <Users className="w-4 h-4 mr-2 text-sky-500" />
                            <span className="text-sm font-medium">Guests</span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {selectedRoom.guests}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="flex items-center text-gray-700 mb-1">
                            <Maximize2 className="w-4 h-4 mr-2 text-purple-500" />
                            <span className="text-sm font-medium">Size</span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {selectedRoom.size}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="flex items-center text-gray-700 mb-1">
                            <Building className="w-4 h-4 mr-2 text-emerald-500" />
                            <span className="text-sm font-medium">Floor</span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {selectedRoom.floor}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <div className="flex items-center text-gray-700 mb-1">
                            <Eye className="w-4 h-4 mr-2 text-amber-500" />
                            <span className="text-sm font-medium">View</span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {selectedRoom.view}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <div className="bg-gray-50 rounded-xl p-5 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Star className="w-4 h-4 mr-2" />
                        Pricing & Booking
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Price per night</span>
                          <div className="flex items-center">
                            {selectedRoom.discountedPrice ? (
                              <>
                                <span className="text-2xl font-bold text-gray-900">
                                  ${selectedRoom.discountedPrice}
                                </span>
                                <span className="ml-2 text-lg text-gray-500 line-through">
                                  ${selectedRoom.price}
                                </span>
                              </>
                            ) : (
                              <span className="text-2xl font-bold text-gray-900">
                                ${selectedRoom.price}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleBookNow(selectedRoom.id, selectedRoom)
                          }
                          className="w-full py-3 cursor-pointer bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 hover:shadow-lg transition-all duration-300"
                        >
                          Book This Room
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Key Amenities
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedRoom.amenities
                          .slice(0, 8)
                          .map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              {renderAmenityIcon(amenity)}
                              <span className="text-sm text-gray-700">
                                {amenity}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => handleBookNow(selectedRoom.id, selectedRoom)}
                    className="px-8 py-3 bg-sky-600 cursor-pointer text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-8 py-3 border cursor-pointer border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
