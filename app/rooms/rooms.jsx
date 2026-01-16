"use client";

import { useState, useEffect, useRef } from "react";
import {
  Star,
  Users,
  Maximize2,
  Shield,
  Wifi,
  Coffee,
  Wind,
  Building,
  Eye,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import supabase from "../lib/supabase";

const Rooms = () => {
  const [roomCategories, setRoomCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const scrollContainerRef = useRef(null);

  // Enhanced formatPrice function with Millions, Billions, and Thousands
  const formatPrice = (price) => {
    if (!price && price !== 0) return "0";

    // Remove commas and convert to number
    const numPrice =
      typeof price === "string"
        ? parseFloat(price.replace(/,/g, ""))
        : Number(price);

    if (isNaN(numPrice)) return "0"; // Return 0 if not a number

    // Handle billions (1,000,000,000+)
    if (numPrice >= 1000000000) {
      const inBillions = numPrice / 1000000000;
      if (Number.isInteger(inBillions)) {
        return `${inBillions}`;
      } else {
        return `${inBillions.toFixed(1)}`;
      }
    }

    // Handle millions (1,000,000 - 999,999,999)
    if (numPrice >= 1000000) {
      const inMillions = numPrice / 1000000;
      if (Number.isInteger(inMillions)) {
        return `${inMillions}`;
      } else {
        return `${inMillions.toFixed(1)}`;
      }
    }

    // Handle thousands (1,000 - 999,999)
    if (numPrice >= 1000) {
      const inThousands = numPrice / 1000;
      if (Number.isInteger(inThousands)) {
        return `${inThousands}`;
      } else {
        return `${inThousands.toFixed(1)}`;
      }
    }

    // If less than 1,000, return as is
    return numPrice.toString();
  };

  // Helper function to determine price suffix
  const getPriceSuffix = (price) => {
    if (!price && price !== 0) return "";

    const numPrice =
      typeof price === "string"
        ? parseFloat(price.replace(/,/g, ""))
        : Number(price);

    if (isNaN(numPrice)) return "";

    if (numPrice >= 1000000000) return "B";
    if (numPrice >= 1000000) return "M";
    if (numPrice >= 1000) return "K";
    return "";
  };

  // Format price with proper suffix for display
  const formatPriceForDisplay = (price, prefix = "₦") => {
    const formattedValue = formatPrice(price);
    const suffix = getPriceSuffix(price);

    // If there's no suffix and price is less than 1000, just return the number
    if (!suffix) {
      return `${prefix}${formattedValue}`;
    }

    return `${prefix}${formattedValue}${suffix}`;
  };

  // Format price range for display
  const formatPriceRangeForDisplay = (minPrice, maxPrice, prefix = "₦") => {
    if (minPrice === maxPrice) {
      return `${formatPriceForDisplay(minPrice, prefix)}`;
    }

    const minFormatted = formatPrice(minPrice);
    const maxFormatted = formatPrice(maxPrice);
    const minSuffix = getPriceSuffix(minPrice);
    const maxSuffix = getPriceSuffix(maxPrice);

    // If both have the same suffix, show it only once at the end
    if (minSuffix === maxSuffix && minSuffix) {
      return `${prefix}${minFormatted}-${maxFormatted}${minSuffix}`;
    }

    // Different suffixes, show both
    return `${formatPriceForDisplay(
      minPrice,
      prefix
    )} - ${formatPriceForDisplay(maxPrice, prefix)}`;
  };

  // Format price with commas for display if needed (backup function)
  const formatPriceWithCommas = (price) => {
    if (!price && price !== 0) return "N/A";

    const numPrice =
      typeof price === "string"
        ? parseFloat(price.replace(/,/g, ""))
        : Number(price);

    if (isNaN(numPrice)) return price;

    return `₦${numPrice.toLocaleString("en-US")}`;
  };

  // Amenity icons mapping
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
    fetchRoomCategories();
  }, []);

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
        left: -320,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 320,
        behavior: "smooth",
      });
    }
  };

  const fetchRoomCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: roomsData, error: fetchError } = await supabase
        .from("rooms")
        .select(
          "room_category, price_per_night, discounted_price_per_night, amenities, no_of_guest,  user_ratings, room_image, room_description, room_availability, room_number"
        )
        .eq("room_availability", true)
        .order("price_per_night", { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!roomsData || roomsData.length === 0) {
        setError("No rooms found in the database");
        setRoomCategories([]);
        return;
      }

      // Group rooms by category and get aggregated data
      const categoriesMap = {};

      roomsData.forEach((room) => {
        const category = room.room_category;

        if (!categoriesMap[category]) {
          // Parse amenities
          let amenities = [];
          if (room.amenities) {
            if (Array.isArray(room.amenities)) {
              amenities = room.amenities;
            } else if (typeof room.amenities === "string") {
              try {
                const parsed = JSON.parse(room.amenities);
                amenities = Array.isArray(parsed) ? parsed : [];
              } catch (e) {
                console.log(e);
                amenities = [];
              }
            }
          }

          // Parse room images
          let images = [];
          if (room.room_image) {
            if (Array.isArray(room.room_image)) {
              images = room.room_image;
            } else if (typeof room.room_image === "string") {
              try {
                const parsed = JSON.parse(room.room_image);
                images = Array.isArray(parsed) ? parsed : [parsed];
              } catch (e) {
                console.log(e);
                if (
                  room.room_image.startsWith("http") ||
                  room.room_image.startsWith("/")
                ) {
                  images = [room.room_image];
                }
              }
            }
          }

          // Get available rooms count for this category
          const availableRooms = roomsData.filter(
            (r) => r.room_category === category && r.room_availability === true
          ).length;

          categoriesMap[category] = {
            id: category,
            title: category
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
            description:
              room.room_description ||
              `Luxurious ${category.replace(/-/g, " ")} with premium amenities`,
            minPrice: room.price_per_night,
            maxPrice: room.price_per_night,
            avgRating: room.user_ratings || 4.5,
            maxGuests: room.no_of_guest,
            minGuests: room.no_of_guest,
            images: images,
            amenities: amenities.slice(0, 6),
            availableRooms: availableRooms,
            totalRooms: 1,
            roomNumbers: [room.room_number],
          };
        } else {
          const categoryData = categoriesMap[category];

          // Update price range
          if (room.price_per_night < categoryData.minPrice) {
            categoryData.minPrice = room.price_per_night;
          }
          if (room.price_per_night > categoryData.maxPrice) {
            categoryData.maxPrice = room.price_per_night;
          }

          // Update guest range
          if (room.no_of_guest > categoryData.maxGuests) {
            categoryData.maxGuests = room.no_of_guest;
          }
          if (room.no_of_guest < categoryData.minGuests) {
            categoryData.minGuests = room.no_of_guest;
          }

          // Update rating average
          const currentRating = room.user_ratings || 4.5;
          categoryData.avgRating =
            (categoryData.avgRating * categoryData.totalRooms + currentRating) /
            (categoryData.totalRooms + 1);

          // Update room images (take from first room that has images)
          if (categoryData.images.length === 0 && room.room_image) {
            let images = [];
            if (Array.isArray(room.room_image)) {
              images = room.room_image;
            } else if (typeof room.room_image === "string") {
              try {
                const parsed = JSON.parse(room.room_image);
                images = Array.isArray(parsed) ? parsed : [parsed];
              } catch (e) {
                console.log(e);
                if (
                  room.room_image.startsWith("http") ||
                  room.room_image.startsWith("/")
                ) {
                  images = [room.room_image];
                }
              }
            }
            categoryData.images = images;
          }

          // Update available rooms count
          if (room.room_availability === true) {
            categoryData.availableRooms++;
          }

          // Update total rooms count
          categoryData.totalRooms++;

          // Add unique amenities (up to 6)
          if (room.amenities) {
            let newAmenities = [];
            if (Array.isArray(room.amenities)) {
              newAmenities = room.amenities;
            } else if (typeof room.amenities === "string") {
              try {
                const parsed = JSON.parse(room.amenities);
                newAmenities = Array.isArray(parsed) ? parsed : [];
              } catch (e) {
                console.log(e);
                newAmenities = [];
              }
            }

            // Add unique amenities
            newAmenities.forEach((amenity) => {
              if (
                !categoryData.amenities.includes(amenity) &&
                categoryData.amenities.length < 6
              ) {
                categoryData.amenities.push(amenity);
              }
            });
          }

          // Add room number
          if (
            room.room_number &&
            !categoryData.roomNumbers.includes(room.room_number)
          ) {
            categoryData.roomNumbers.push(room.room_number);
          }
        }
      });

      // Convert map to array and format for display
      const categoriesArray = Object.values(categoriesMap).map((category) => ({
        ...category,
        // Format title nicely
        displayTitle: category.title,
        // Format price display with proper suffixes
        priceDisplay: formatPriceRangeForDisplay(
          category.minPrice,
          category.maxPrice
        ),
        // Format guests display
        guestsDisplay:
          category.minGuests === category.maxGuests
            ? `${category.minGuests} Guests`
            : `${category.minGuests}-${category.maxGuests} Guests`,
        // Get first image for display
        displayImage: category.images.length > 0 ? category.images[0] : null,
        // Ensure we have some default amenities
        displayAmenities:
          category.amenities.length > 0
            ? category.amenities.slice(0, 4) // Show only first 4 in preview
            : [
                "Free WiFi",
                "Breakfast Included",
                "Luxury Bathroom",
                "Sea View",
              ],
      }));

      setRoomCategories(categoriesArray);
    } catch (err) {
      console.error("Error fetching room categories:", err);
      setError("Failed to load room categories");
      setRoomCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAmenityIcon = (amenity) => {
    const Icon = amenityIcons[amenity] || Shield;
    return <Icon className="w-4 h-4" />;
  };

  useEffect(() => {
    // Check scroll position after loading
    if (!isLoading && scrollContainerRef.current) {
      setTimeout(checkScrollPosition, 100);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <section className="py-30 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="text-sky-600">Featured</span> Accommodations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience unparalleled comfort in our carefully curated rooms and
              suites
            </p>
          </div>

          {/* Mobile loading skeleton */}
          <div className="md:hidden">
            <div className="flex space-x-4 overflow-hidden">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="shrink-0 w-80 animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2 w-full"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
                  <div className="h-10 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop loading skeleton */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-2xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-full"></div>
                <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
                <div className="h-10 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error && roomCategories.length === 0) {
    return (
      <section className="py-30 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="text-sky-600">Featured</span> Accommodations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience unparalleled comfort in our carefully curated rooms and
              suites
            </p>
          </div>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{error}</h3>
            <button
              onClick={fetchRoomCategories}
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
    <section className="py-30 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-sky-50 text-sky-700 rounded-full text-sm font-semibold mb-4">
            <Star className="w-4 h-4 mr-2 fill-current" />
            DYNAMIC CATEGORIES
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-sky-600">Room</span> Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover our diverse collection of room types, each offering unique
            experiences and amenities
          </p>

          {/* Scroll instructions for mobile */}
          <div className="md:hidden flex justify-center">
            <div className="inline-flex items-center px-4 py-2 bg-sky-100 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                  <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                  <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                </div>
                <div className="text-sm text-sky-700 font-medium">
                  Swipe to explore categories
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll navigation container */}
        <div className="relative">
          {/* Left scroll button (mobile only) */}
          {showLeftScroll && (
            <button
              onClick={scrollLeft}
              className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-all duration-300"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Right scroll button (mobile only) */}
          {showRightScroll && (
            <button
              onClick={scrollRight}
              className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-all duration-300"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Rooms Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible scrollbar-hide pb-6"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Add this for custom scrollbar styling */}
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {roomCategories.map((category, index) => (
              <div
                key={category.id}
                className="shrink-0 w-80 md:w-auto md:shrink md:min-w-0 group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Category Image Container */}
                <div className="relative h-48 overflow-hidden">
                  {category.displayImage ? (
                    <Image
                      src={category.displayImage}
                      alt={category.displayTitle}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 320px, (max-width: 1024px) 300px, 400px"
                    />
                  ) : (
                    <div className="w-full h-full bg-sky-400 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-3xl font-bold opacity-20">
                          Royal Moss
                        </div>
                        <div className="text-sm opacity-40">
                          {category.displayTitle}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Available Rooms Badge */}
                  {category.availableRooms > 0 && (
                    <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                      {category.totalRooms} AVAILABLE
                    </div>
                  )}

                  {/* Most Popular Badge */}
                  {index === 0 && (
                    <div className="md:absolute md:top-4 md:right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                      POPULAR
                    </div>
                  )}

                  {/* Price Tag */}
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl z-10">
                    <div className="text-2xl font-bold text-gray-900">
                      {category.priceDisplay}
                    </div>
                    <div className="text-xs text-gray-600">
                      starting per night
                    </div>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent"></div>
                </div>

                {/* Category Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-sky-600 transition-colors duration-300">
                        {category.displayTitle}
                      </h3>
                      <div className="text-xs text-gray-500 mt-1">
                        {category.totalRooms || 1} room
                        {category.totalRooms !== 1 ? "s" : ""} available
                      </div>
                    </div>
                    <div className="flex items-center bg-amber-500 text-white px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      <span className="font-bold">
                        {category.avgRating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {category.description}
                  </p>

                  {/* Category Features */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1 text-sky-600" />
                      <span>{category.guestsDisplay}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {category.displayAmenities.map((amenity, idx) => (
                      <div
                        key={`${category.id}-${idx}`}
                        className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                        title={amenity}
                      >
                        {renderAmenityIcon(amenity)}
                        <span className="ml-1 truncate max-w-20">
                          {amenity}
                        </span>
                      </div>
                    ))}
                    {category.amenities && category.amenities.length > 4 && (
                      <div className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                        +{category.amenities.length - 4} more
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Link
                      href={`/rooms/availability?type=${category.id}`}
                      className="block"
                    >
                      <button className="w-full cursor-pointer py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-all duration-300 group">
                        <span className="flex items-center justify-center">
                          View Available Rooms
                          <Eye className="w-4 h-4 ml-2 transform group-hover:scale-110 transition-transform" />
                        </span>
                      </button>
                    </Link>

                    <Link
                      href={`/rooms/all?category=${category.id}`}
                      className="block"
                    >
                      <button className="w-full cursor-pointer py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300">
                        <span className="flex items-center justify-center text-sm">
                          Category Details
                          <Building className="w-3 h-3 ml-2" />
                        </span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicators for mobile */}
        <div className="md:hidden mt-8 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-sky-300"></div>
            <div className="text-sm text-gray-500">
              Scroll horizontally to see more categories
            </div>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/rooms/all">
            <button className="px-8 py-3 cursor-pointer bg-white border-2 border-sky-600 text-sky-600 rounded-full font-semibold hover:bg-sky-50 transition-all duration-300 group">
              <span className="flex items-center">
                View All Rooms
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Rooms;
