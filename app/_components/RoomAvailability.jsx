"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabase";
import {
  Calendar,
  Users,
  MapPin,
  Search,
  XCircle,
  CheckCircle,
  Bed,
  User,
  Clock,
  ArrowRight,
} from "lucide-react";
import { format, parseISO, startOfDay, addDays } from "date-fns";

// Utility function to format price with K, M, B suffixes
const formatPrice = (amount, includeK = false) => {
  if (amount === null || amount === undefined) return "₦0";

  // Convert to number if it's a string
  const numericAmount =
    typeof amount === "string"
      ? parseFloat(amount.replace(/[^0-9.-]+/g, ""))
      : Number(amount);

  if (isNaN(numericAmount)) return "₦0";

  if (Math.abs(numericAmount) >= 1000000000) {
    return `₦${(numericAmount / 1000000000).toFixed(1).replace(/\.0$/, "")}B`;
  } else if (Math.abs(numericAmount) >= 1000000) {
    return `₦${(numericAmount / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  } else if (Math.abs(numericAmount) >= 1000) {
    return `₦${(numericAmount / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  } else {
    return `₦${numericAmount}${includeK && numericAmount !== 0 ? "K" : ""}`;
  }
};

// Helper function to extract numeric value from price (handles both formatted strings and numbers)
const extractNumericPrice = (priceValue) => {
  if (priceValue === null || priceValue === undefined) return 0;

  // If it's already a number, return it
  if (typeof priceValue === "number") return priceValue;

  // If it's a string, parse it
  if (typeof priceValue === "string") {
    // Remove currency symbol and any commas
    let cleanValue = priceValue.replace(/[₦,]/g, "").trim();

    // Check for K, M, B suffixes
    if (cleanValue.endsWith("B") || cleanValue.endsWith("b")) {
      const number = parseFloat(cleanValue.slice(0, -1));
      return number * 1000000000;
    } else if (cleanValue.endsWith("M") || cleanValue.endsWith("m")) {
      const number = parseFloat(cleanValue.slice(0, -1));
      return number * 1000000;
    } else if (cleanValue.endsWith("K") || cleanValue.endsWith("k")) {
      const number = parseFloat(cleanValue.slice(0, -1));
      return number * 1000;
    } else {
      // Just a plain number
      return parseFloat(cleanValue) || 0;
    }
  }

  // If it's something else, try to convert to number
  return Number(priceValue) || 0;
};

const RoomAvailability = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [roomTypes, setRoomTypes] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [occupancyDetails, setOccupancyDetails] = useState([]);

  // Search form state
  const [searchData, setSearchData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    roomType: "",
  });

  // Fetch room types on component mount
  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("room_category")
        .order("room_category");

      if (error) throw error;

      // Get unique room types
      const uniqueTypes = [...new Set(data.map((room) => room.room_category))];
      setRoomTypes(uniqueTypes);
    } catch (error) {
      console.error("Error fetching room types:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({
      ...prev,
      [name]: name === "guests" ? parseInt(value) || 1 : value,
    }));
  };

  // Helper function to normalize dates
  const normalizeDate = (dateString) => {
    const date = parseISO(dateString);
    return startOfDay(date);
  };

  // Check availability for individual rooms with occupancy details
  const checkIndividualRoomAvailability = async (
    room,
    checkIn,
    checkOut,
    occupancyList
  ) => {
    const normalizedCheckIn = normalizeDate(checkIn);
    const normalizedCheckOut = normalizeDate(checkOut);

    // Fetch bookings for THIS SPECIFIC ROOM NUMBER
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("check_in_date, check_out_date, booking_status, guest_name")
      .eq("room_number", room.room_number)
      .in("booking_status", ["confirmed", "checked_in", "pending"]);

    if (bookingsError) {
      console.error("Error fetching bookings for room:", bookingsError);
      return false;
    }

    // Check for date overlaps for this specific room
    for (const booking of bookings) {
      const bookedStart = normalizeDate(booking.check_in_date);
      const bookedEnd = normalizeDate(booking.check_out_date);

      // Check if the selected dates overlap with any booking for this room
      if (
        (normalizedCheckIn >= bookedStart && normalizedCheckIn < bookedEnd) ||
        (normalizedCheckOut > bookedStart && normalizedCheckOut <= bookedEnd) ||
        (normalizedCheckIn <= bookedStart && normalizedCheckOut >= bookedEnd)
      ) {
        // Room is booked, add to occupancy details
        occupancyList.push({
          roomNumber: room.room_number,
          guestName: booking.guest_name || "Guest",
          checkIn: format(bookedStart, "MMM dd, yyyy"),
          checkOut: format(bookedEnd, "MMM dd, yyyy"),
          bookingStatus: booking.booking_status,
        });
        return false; // This specific room is booked
      }
    }

    return true; // This specific room is available
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSearchError("");
    setAvailableRooms([]);
    setSearchPerformed(false);
    setOccupancyDetails([]);

    // Validate inputs
    if (!searchData.checkIn || !searchData.checkOut) {
      setSearchError("Please select both check-in and check-out dates");
      setIsLoading(false);
      return;
    }

    const checkIn = parseISO(searchData.checkIn);
    const checkOut = parseISO(searchData.checkOut);

    if (checkOut <= checkIn) {
      setSearchError("Check-out date must be after check-in date");
      setIsLoading(false);
      return;
    }

    try {
      // Build query based on search criteria
      let query = supabase.from("rooms").select("*");

      // Filter by room type if selected
      if (searchData.roomType) {
        query = query.eq("room_category", searchData.roomType);
      }

      const { data: allRooms, error: roomsError } = await query;

      if (roomsError) throw roomsError;

      if (!allRooms || allRooms.length === 0) {
        setSearchError("No rooms found matching your criteria");
        setIsLoading(false);
        setSearchPerformed(true);
        return;
      }

      // Calculate number of nights
      const diffTime = Math.abs(checkOut - checkIn);
      const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const occupancyList = [];

      // Create list of ALL rooms
      const allAvailableRooms = [];

      // Check availability for each room individually
      for (const room of allRooms) {
        // Check if room can accommodate the number of guests
        if (room.no_of_guest < searchData.guests) {
          continue; // Skip rooms that can't accommodate the guests
        }

        // Check if this specific room is available
        const isAvailable = await checkIndividualRoomAvailability(
          room,
          searchData.checkIn,
          searchData.checkOut,
          occupancyList
        );

        if (isAvailable) {
          // Extract numeric price values
          const pricePerNight = extractNumericPrice(room.price_per_night);
          const discountedPricePerNight = room.discounted_price_per_night
            ? extractNumericPrice(room.discounted_price_per_night)
            : null;

          // Calculate totals
          const totalPrice = nights * pricePerNight;
          const discountedTotal = discountedPricePerNight
            ? nights * discountedPricePerNight
            : null;

          const availableRoom = {
            ...room,
            nights,
            totalPrice,
            discountedTotal,
            formattedCheckIn: format(checkIn, "MMM dd, yyyy"),
            formattedCheckOut: format(checkOut, "MMM dd, yyyy"),
            isAvailable: true,
            originalCheckIn: searchData.checkIn,
            originalCheckOut: searchData.checkOut,
            searchGuests: searchData.guests,
          };

          allAvailableRooms.push(availableRoom);
        } else {
          // Room is booked, but we still want to show it as unavailable
          const bookedRoom = {
            ...room,
            nights,
            formattedCheckIn: format(checkIn, "MMM dd, yyyy"),
            formattedCheckOut: format(checkOut, "MMM dd, yyyy"),
            isAvailable: false,
            originalCheckIn: searchData.checkIn,
            originalCheckOut: searchData.checkOut,
            searchGuests: searchData.guests,
          };

          allAvailableRooms.push(bookedRoom);
        }
      }

      setOccupancyDetails(occupancyList);

      if (allAvailableRooms.filter((r) => r.isAvailable).length === 0) {
        setSearchError(
          "No available rooms for the selected dates. Please try different dates or room type."
        );
      }

      setAvailableRooms(allAvailableRooms);
      setSearchPerformed(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = (room) => {
    if (!room.isAvailable) return;

    // Format room title (Capitalize each word)
    const roomTitle = room.room_category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Get the price per night (use discounted price if available)
    const pricePerNight = extractNumericPrice(
      room.discounted_price_per_night || room.price_per_night
    );

    // Build the URL query string exactly as the book page expects
    const queryParams = new URLSearchParams({
      roomId: room.id,
      type: room.room_category,
      price: pricePerNight,
      title: roomTitle,
      checkIn: room.originalCheckIn,
      checkOut: room.originalCheckOut,
      guests: room.searchGuests,
      nights: room.nights,
      roomNumber: room.room_number,
      totalAmount: room.discountedTotal || room.totalPrice,
    });

    // Add room image if available
    if (room.room_image) {
      const roomImages = Array.isArray(room.room_image)
        ? room.room_image
        : typeof room.room_image === "string"
        ? [room.room_image]
        : [];
      if (roomImages.length > 0) {
        queryParams.set("roomImage", roomImages[0]);
      }
    }

    // Add other room details
    if (room.room_description) {
      queryParams.set("description", room.room_description);
    }

    if (room.no_of_guest) {
      queryParams.set("maxGuests", room.no_of_guest);
    }

    // Redirect to booking page with all parameters
    router.push(`/book?${queryParams.toString()}`);
  };

  // Format room name for display
  const formatRoomName = (roomCategory) => {
    return roomCategory
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Set minimum dates for date inputs
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  return (
    <section id="check-availability" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect <span className="text-sky-600">Stay</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Check availability and book directly from available rooms
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 max-w-6xl mx-auto border border-gray-200 mb-12">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Check-in */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <Calendar className="w-4 h-4 mr-2 text-sky-600" />
                  Check-in *
                </label>
                <input
                  type="date"
                  name="checkIn"
                  value={searchData.checkIn}
                  onChange={handleInputChange}
                  min={today}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Check-out */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <Calendar className="w-4 h-4 mr-2 text-sky-600" />
                  Check-out *
                </label>
                <input
                  type="date"
                  name="checkOut"
                  value={searchData.checkOut}
                  onChange={handleInputChange}
                  min={searchData.checkIn || tomorrow}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Guests */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <Users className="w-4 h-4 mr-2 text-sky-600" />
                  Guests
                </label>
                <select
                  name="guests"
                  value={searchData.guests}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Type */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <MapPin className="w-4 h-4 mr-2 text-sky-600" />
                  Room Type
                </label>
                <select
                  name="roomType"
                  value={searchData.roomType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="">All Room Types</option>
                  {roomTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {formatRoomName(type)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error Message */}
            {searchError && (
              <div className="mt-4 p-4 bg-rose-50 rounded-xl border border-rose-200">
                <p className="text-rose-700 flex items-center">
                  <XCircle className="w-5 h-5 mr-2 shrink-0" />
                  {searchError}
                </p>
              </div>
            )}

            {/* Search Button */}
            <div className="text-center mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="px-12 cursor-pointer py-4 bg-sky-600 text-white rounded-full font-semibold text-lg hover:bg-sky-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    Check Availability
                    <Search className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {searchPerformed && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Available Rooms for Booking
                </h3>
                <p className="text-gray-600 mt-2">
                  {availableRooms.filter((r) => r.isAvailable).length} room
                  {availableRooms.filter((r) => r.isAvailable).length !== 1
                    ? "s"
                    : ""}{" "}
                  available from{" "}
                  <span className="font-semibold">
                    {searchData.checkIn
                      ? format(parseISO(searchData.checkIn), "MMM dd, yyyy")
                      : ""}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {searchData.checkOut
                      ? format(parseISO(searchData.checkOut), "MMM dd, yyyy")
                      : ""}
                  </span>
                </p>
              </div>

              {availableRooms.filter((r) => r.isAvailable).length > 0 && (
                <div className="flex items-center bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Ready to Book</span>
                </div>
              )}
            </div>

            {/* Occupancy Details */}
            {occupancyDetails.length > 0 && (
              <div className="mb-8 p-6 bg-amber-50 rounded-2xl border border-amber-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-amber-600" />
                  Occupied Rooms During This Period
                </h4>
                <div className="space-y-3">
                  {occupancyDetails.map((occupancy, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white rounded-xl border border-amber-100"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Bed className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">
                              Room {occupancy.roomNumber}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {occupancy.guestName}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">
                            {occupancy.checkIn} → {occupancy.checkOut}
                          </span>
                          <span className="ml-3 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">
                            {occupancy.bookingStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableRooms.filter((r) => r.isAvailable).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl shadow-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  No Rooms Available
                </h4>
                <p className="text-gray-600 max-w-md mx-auto">
                  All rooms are booked for the selected dates. Please try
                  different dates or room types.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {availableRooms
                  .filter((room) => room.isAvailable)
                  .map((room) => (
                    <div
                      key={`${room.room_number}-${room.id}`}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:border-sky-300 transition-all duration-300 hover:shadow-xl"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">
                              {formatRoomName(room.room_category)} - Room{" "}
                              {room.room_number}
                            </h4>
                            <div className="flex items-center space-x-3 mt-2">
                              <div className="flex items-center bg-sky-50 text-sky-700 px-2 py-1 rounded-lg">
                                <Users className="w-4 h-4 mr-1" />
                                <span className="font-bold">
                                  Up to {room.no_of_guest} Guests
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-emerald-100 text-emerald-700">
                            AVAILABLE
                          </div>
                        </div>

                        <p className="text-gray-600 mb-6">
                          {room.room_description}
                        </p>

                        {/* Booking Summary */}
                        <div className="mb-6 p-4 bg-sky-50 rounded-xl border border-sky-200">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                Stay Duration
                              </p>
                              <p className="font-semibold">
                                {room.nights} night
                                {room.nights !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Check-in/out
                              </p>
                              <p className="font-semibold">
                                {room.formattedCheckIn} →{" "}
                                {room.formattedCheckOut}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Guests</p>
                              <p className="font-semibold">
                                {room.searchGuests}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                          <div>
                            <div className="flex items-center">
                              {room.discountedTotal ? (
                                <>
                                  <span className="text-2xl font-bold text-gray-900">
                                    {formatPrice(room.discountedTotal)}
                                  </span>
                                  <span className="ml-2 text-lg text-gray-500 line-through">
                                    {formatPrice(room.totalPrice)}
                                  </span>
                                  <span className="ml-2 text-sm font-bold text-emerald-600">
                                    Save{" "}
                                    {formatPrice(
                                      room.totalPrice - room.discountedTotal
                                    )}
                                  </span>
                                </>
                              ) : (
                                <span className="text-2xl font-bold text-gray-900">
                                  {formatPrice(room.totalPrice)}
                                </span>
                              )}
                              <span className="ml-2 text-gray-600">total</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatPrice(
                                room.discounted_price_per_night ||
                                  room.price_per_night,
                                true
                              )}{" "}
                              per night
                            </p>
                          </div>

                          <button
                            onClick={() => handleBookNow(room)}
                            className="px-6 py-3 bg-sky-600 cursor-pointer text-white rounded-xl font-semibold hover:bg-sky-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center"
                          >
                            Book Now
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Show Occupied Rooms Separately */}
            {availableRooms.filter((r) => !r.isAvailable).length > 0 && (
              <div className="mt-12">
                <h4 className="text-xl font-bold text-gray-900 mb-6">
                  Occupied Rooms (Not Available)
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {availableRooms
                    .filter((room) => !room.isAvailable)
                    .map((room) => (
                      <div
                        key={`occupied-${room.room_number}`}
                        className="bg-white rounded-xl border border-gray-300 p-6 opacity-70"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h5 className="font-semibold text-gray-900">
                              {formatRoomName(room.room_category)} - Room{" "}
                              {room.room_number}
                            </h5>
                            <p className="text-sm text-gray-600 mt-1">
                              Occupied during selected dates
                            </p>
                          </div>
                          <div className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-lg font-bold">
                            OCCUPIED
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          <p>Max Guests: {room.no_of_guest}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default RoomAvailability;
