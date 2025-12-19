"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import supabase from "../lib/supabase";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const FeaturedRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  // Shuffle array function - Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get random rooms with fallback images
  const fetchRandomRooms = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, get all room IDs
      const { data: allRooms, error: fetchError } = await supabase
        .from("rooms")
        .select(
          "id, room_category, room_description, price_per_night, discounted_price_per_night, user_ratings, no_of_guest, room_dismesion, amenities, room_image"
        )
        .eq("room_availability", true);

      if (fetchError) throw fetchError;

      if (!allRooms || allRooms.length === 0) {
        setError("No rooms available");
        setRooms([]);
        return;
      }

      // Shuffle rooms and take first 8 (or less if not enough)
      const shuffledRooms = shuffleArray(allRooms);
      const selectedRooms = shuffledRooms.slice(
        0,
        Math.min(8, shuffledRooms.length)
      );

      // Format room data
      const formattedRooms = selectedRooms.map((room) => ({
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
          ? room.amenities.slice(0, 3) // Show only first 3 amenities
          : room.amenities
          ? JSON.parse(room.amenities).slice(0, 3)
          : [],
        images: Array.isArray(room.room_image)
          ? room.room_image
          : room.room_image
          ? JSON.parse(room.room_image)
          : [],
      }));

      setRooms(formattedRooms);
    } catch (err) {
      console.error("Error fetching random rooms:", err);
      setError("Failed to load featured rooms");
      // Fallback to mock data if API fails
      setRooms(getMockRooms());
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for fallback
  const getMockRooms = () => {
    const roomTypes = [
      "Deluxe Ocean View",
      "Executive Suite",
      "Presidential Apartment",
      "Family Luxury Suite",
      "Premium City View",
      "Honeymoon Suite",
      "Business Class Room",
      "Penthouse Suite",
    ];

    return Array.from({ length: 8 }, (_, index) => ({
      id: `mock-${index}`,
      title: roomTypes[index % roomTypes.length],
      description:
        "Experience luxury and comfort in our beautifully appointed rooms with stunning views and premium amenities.",
      price: Math.floor(Math.random() * 300) + 200,
      discountedPrice:
        Math.random() > 0.5 ? Math.floor(Math.random() * 250) + 150 : null,
      rating: (Math.random() * 2 + 3.5).toFixed(1),
      guests: Math.floor(Math.random() * 4) + 1,
      size: `${Math.floor(Math.random() * 200) + 300} sq ft`,
      amenities: ["Free WiFi", "Breakfast Included", "Sea View"].slice(
        0,
        Math.floor(Math.random() * 3) + 1
      ),
      images: [],
    }));
  };

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 10);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    fetchRandomRooms();
  }, []);

  useEffect(() => {
    // Check scroll position on mount and after data loads
    if (!isLoading && scrollContainerRef.current) {
      setTimeout(checkScrollPosition, 100);
    }
  }, [isLoading]);

  // Get room image or fallback
  const getRoomImage = (images) => {
    if (!images || images.length === 0) {
      return null;
    }
    return images[0];
  };

  // Amenity icons mapping
  const amenityIcons = {
    "Free WiFi": Wifi,
    "Breakfast Included": Coffee,
    "Sea View": MapPin,
    "Air Conditioning": Wind,
    "King Bed": Users,
    "Private Pool": Maximize2,
  };

  const renderAmenityIcon = (amenity) => {
    const Icon = amenityIcons[amenity] || Shield;
    return <Icon className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured <span className="text-sky-600">Rooms</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our handpicked selection of luxurious accommodations
            </p>
          </div>

          {/* Mobile loading skeleton */}
          <div className="md:hidden">
            <div className="flex space-x-4 overflow-hidden">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="shrink-0 w-72 animate-pulse">
                  <div className="bg-gray-200 h-56 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop loading skeleton */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-2xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error && rooms.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Unable to Load Rooms
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchRandomRooms}
              className="px-6 py-3 bg-sky-600 text-white rounded-full font-semibold hover:bg-sky-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-sky-50 text-sky-700 rounded-full text-sm font-semibold mb-4">
            <Star className="w-4 h-4 mr-2 fill-current" />
            CURATED SELECTION
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured <span className="text-sky-600">Rooms</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover our handpicked selection of luxurious accommodations,
            refreshed daily for your perfect stay
          </p>
          <Link
            href="/rooms"
            className="inline-flex items-center text-sky-600 hover:text-sky-700 font-semibold group"
          >
            View All Rooms
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Scroll navigation for mobile */}
        <div className="relative">
          {/* Left scroll button (mobile only) */}
          {showLeftScroll && (
            <button
              onClick={scrollLeft}
              className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Right scroll button (mobile only) */}
          {showRightScroll && (
            <button
              onClick={scrollRight}
              className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Rooms Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible scrollbar-hide pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Add this for custom scrollbar styling if needed */}
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {rooms.map((room) => {
              const mainImage = getRoomImage(room.images);

              return (
                <div
                  key={room.id}
                  className="shrink-0 w-72 md:w-auto md:shrink md:min-w-0 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:border-sky-300 transition-all duration-300 hover:shadow-xl"
                >
                  {/* Image Container */}
                  <div className="relative h-48 overflow-hidden">
                    {mainImage ? (
                      <Image
                        src={mainImage}
                        alt={room.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 288px, (max-width: 1024px) 200px, 300px"
                      />
                    ) : (
                      <div className="w-full h-full bg-sky-400 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-2xl font-bold opacity-20">
                            Royal Moss
                          </div>
                          <div className="text-sm opacity-40">Luxury Room</div>
                        </div>
                      </div>
                    )}

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-amber-500 fill-current mr-1" />
                        <span className="font-bold text-gray-900">
                          {room.rating}
                        </span>
                      </div>
                    </div>

                    {/* Discount Badge */}
                    {room.discountedPrice && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        SAVE ₦{room.price - room.discountedPrice}K
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-sky-600 transition-colors">
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

                    {/* Amenities */}
                    {room.amenities.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {room.amenities.map((amenity, index) => (
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
                                ₦{room.discountedPrice}K
                              </span>
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                ₦{room.price}K
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-gray-900">
                              ₦{room.price}K
                            </span>
                          )}
                          <span className="ml-1 text-sm text-gray-600">
                            /night
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/book?roomId=${room.id}&type=${room.title
                          .toLowerCase()
                          .replace(/\s+/g, "-")}&price=${
                          room.discountedPrice || room.price
                        }`}
                        className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold hover:bg-sky-700 transition-colors transform hover:-translate-y-0.5"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll indicators for mobile */}
        <div className="md:hidden mt-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="text-sm text-gray-500">
              Swipe to explore more rooms
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRooms;
