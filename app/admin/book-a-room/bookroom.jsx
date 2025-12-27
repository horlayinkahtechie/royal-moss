"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  User,
  CreditCard,
  DollarSign,
  Bed,
  Users,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  ChevronDown,
  Search,
  MapPin,
  Home,
  Wifi,
  Tv,
  Wind,
  Coffee,
  Waves,
  Plus,
  CalendarDays,
  UserCheck,
  Receipt,
  Wallet,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Mail,
  Phone,
} from "lucide-react";
import supabase from "../../lib/supabase";
import Sidebar from "@/app/_components/admin/Sidebar";

// Helper function to format dates
const formatDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

// Get today's date and tomorrow's date for default values
const today = formatDate(new Date());
const tomorrow = formatDate(
  new Date(new Date().setDate(new Date().getDate() + 1))
);

export default function AdminBookRoom() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Step 1: Search criteria
  const [searchCriteria, setSearchCriteria] = useState({
    roomCategory: "",
    checkInDate: today,
    checkOutDate: tomorrow,
    numberOfGuests: 1,
  });

  // Step 2: Guest details
  const [guestDetails, setGuestDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    specialRequests: "",
  });

  // Step 3: Payment details
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: "cash",
    amountPaid: "",
    transactionId: "",
    paymentStatus: "pending",
  });

  // Current step
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch room categories on mount
  useEffect(() => {
    fetchRoomCategories();
  }, []);

  const fetchRoomCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("room_category")
        .not("room_category", "is", null);

      if (error) throw error;

      const uniqueCategories = [
        ...new Set(data.map((room) => room.room_category)),
      ];
      setCategories(uniqueCategories);

      // Set default category if available
      if (uniqueCategories.length > 0 && !searchCriteria.roomCategory) {
        setSearchCriteria((prev) => ({
          ...prev,
          roomCategory: uniqueCategories[0],
        }));
      }
    } catch (error) {
      console.error("Error fetching room categories:", error);
    }
  };

  // Check room availability
  const checkAvailability = async () => {
    if (
      !searchCriteria.roomCategory ||
      !searchCriteria.checkInDate ||
      !searchCriteria.checkOutDate
    ) {
      alert("Please select room category, check-in, and check-out dates");
      return;
    }

    try {
      setCheckingAvailability(true);

      // Fetch all rooms in the selected category
      const { data: categoryRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("*")
        .eq("room_category", searchCriteria.roomCategory)
        .order("room_number");

      if (roomsError) throw roomsError;

      // Fetch existing bookings for these rooms within the date range
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("room_number, check_in_date, check_out_date, booking_status")
        .in(
          "room_number",
          categoryRooms.map((room) => room.room_number)
        )
        .or(
          "booking_status.eq.confirmed,booking_status.eq.checked-in,booking_status.eq.pending"
        )
        .lte("check_in_date", searchCriteria.checkOutDate)
        .gte("check_out_date", searchCriteria.checkInDate);

      if (bookingsError) throw bookingsError;

      // Check availability for each room
      const roomsWithAvailability = categoryRooms.map((room) => {
        // Find bookings for this specific room
        const roomBookings =
          bookings?.filter(
            (booking) => booking.room_number === room.room_number
          ) || [];

        // Check if room has any booking conflicts for the selected dates
        const hasConflict = roomBookings.some((booking) => {
          const bookingCheckIn = new Date(booking.check_in_date);
          const bookingCheckOut = new Date(booking.check_out_date);
          const selectedCheckIn = new Date(searchCriteria.checkInDate);
          const selectedCheckOut = new Date(searchCriteria.checkOutDate);

          // Check for date overlap
          return (
            (selectedCheckIn >= bookingCheckIn &&
              selectedCheckIn < bookingCheckOut) ||
            (selectedCheckOut > bookingCheckIn &&
              selectedCheckOut <= bookingCheckOut) ||
            (selectedCheckIn <= bookingCheckIn &&
              selectedCheckOut >= bookingCheckOut)
          );
        });

        // Check if room has enough capacity
        const hasCapacity = room.no_of_guest >= searchCriteria.numberOfGuests;

        return {
          ...room,
          isAvailable:
            !hasConflict && hasCapacity && room.room_availability === true,
          conflictReason: hasConflict
            ? "Booked"
            : !hasCapacity
            ? "Insufficient capacity"
            : null,
        };
      });

      setRooms(roomsWithAvailability);
      setAvailableRooms(
        roomsWithAvailability.filter((room) => room.isAvailable)
      );
    } catch (error) {
      console.error("Error checking availability:", error);
      alert("Failed to check availability. Please try again.");
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Handle search criteria change
  const handleSearchCriteriaChange = (e) => {
    const { name, value } = e.target;

    if (name === "checkInDate") {
      const newCheckIn = value;
      const newCheckOut = searchCriteria.checkOutDate;

      // If check-in is after current check-out, adjust check-out
      if (new Date(newCheckIn) >= new Date(newCheckOut)) {
        const adjustedCheckOut = new Date(newCheckIn);
        adjustedCheckOut.setDate(adjustedCheckOut.getDate() + 1);
        setSearchCriteria((prev) => ({
          ...prev,
          checkInDate: newCheckIn,
          checkOutDate: formatDate(adjustedCheckOut),
        }));
      } else {
        setSearchCriteria((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name === "checkOutDate") {
      // Don't allow check-out before or on check-in
      if (new Date(value) <= new Date(searchCriteria.checkInDate)) {
        alert("Check-out date must be after check-in date");
        return;
      }
      setSearchCriteria((prev) => ({ ...prev, [name]: value }));
    } else {
      setSearchCriteria((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle guest details change
  const handleGuestDetailsChange = (e) => {
    const { name, value } = e.target;
    setGuestDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Handle payment details change
  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentDetails((prev) => ({
      ...prev,
      paymentMethod: method,
      transactionId: method === "cash" ? "" : prev.transactionId,
    }));
  };

  // Calculate number of nights
  const calculateNights = () => {
    const checkIn = new Date(searchCriteria.checkInDate);
    const checkOut = new Date(searchCriteria.checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  // Calculate total amount for selected room
  const calculateTotalAmount = () => {
    if (!selectedRoom) return 0;
    const nights = calculateNights();
    const price =
      selectedRoom.discounted_price_per_night ||
      selectedRoom.price_per_night ||
      0;
    return nights * price;
  };

  // Handle room selection
  const handleRoomSelect = (room) => {
    if (room.isAvailable) {
      setSelectedRoom(room);
      setCurrentStep(2);
    }
  };

  // Handle form submission
  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Generate a unique booking ID
      const bookingId = `ADMIN-${Date.now().toString().slice(-6)}`;

      // Prepare booking data
      const bookingData = {
        booking_id: bookingId,
        room_number: selectedRoom.room_number,
        guest_name: `${guestDetails.firstName} ${guestDetails.lastName}`,
        guest_email: guestDetails.email,
        guest_phone: guestDetails.phone,
        room_category: selectedRoom.room_category,
        room_title: selectedRoom.room_category,
        check_in_date: searchCriteria.checkInDate,
        check_out_date: searchCriteria.checkOutDate,
        no_of_nights: calculateNights(),
        no_of_guests: searchCriteria.numberOfGuests,
        price_per_night: selectedRoom.price_per_night,
        discounted_price_per_night: selectedRoom.discounted_price_per_night,
        total_amount: calculateTotalAmount(),
        currency: "NGN",
        payment_status:
          paymentDetails.amountPaid >= calculateTotalAmount()
            ? "paid"
            : paymentDetails.amountPaid > 0
            ? "partial"
            : "pending",
        payment_method: paymentDetails.paymentMethod,
        user_id: "Booked by admin",
        // paid_amount: parseFloat(paymentDetails.amountPaid) || 0,
        payment_reference: paymentDetails.transactionId,
        booking_status: "confirmed",
        special_requests: guestDetails.specialRequests,
        booked_by_admin: true,
        payment_data: paymentDetails.transactionId,
        room_image: selectedRoom.room_image,
        admin_notes: `Booking created by admin. Payment method: ${paymentDetails.paymentMethod}`,
      };

      // Insert booking into database
      const { data, error } = await supabase
        .from("bookings")
        .insert([bookingData])
        .select();

      if (error) throw error;

      // Success - reset form and show success message
      alert(
        `✅ Booking created successfully!\nBooking ID: ${bookingId}\nRoom: ${selectedRoom.room_number}\nGuest: ${guestDetails.firstName} ${guestDetails.lastName}`
      );

      // Reset to step 1 and refresh availability
      setCurrentStep(1);
      setSelectedRoom(null);
      setGuestDetails({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        specialRequests: "",
      });
      setPaymentDetails({
        paymentMethod: "cash",
        amountPaid: "",
        transactionId: "",
        paymentStatus: "pending",
      });

      // Refresh availability
      await checkAvailability();
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("❌ Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render amenities
  const renderAmenities = (amenities) => {
    if (!amenities || !Array.isArray(amenities)) return null;

    const amenityIcons = {
      wifi: <Wifi className="w-4 h-4" />,
      tv: <Tv className="w-4 h-4" />,
      ac: <Wind className="w-4 h-4" />,
      minibar: <Coffee className="w-4 h-4" />,
      balcony: <Home className="w-4 h-4" />,
      jacuzzi: <Waves className="w-4 h-4" />,
      safe: <Shield className="w-4 h-4" />,
    };

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {amenities.slice(0, 3).map((amenity, index) => (
          <div
            key={index}
            className="flex items-center gap-1 px-2 py-1 bg-gray-800/50 rounded text-xs"
          >
            {amenityIcons[amenity] || <div className="w-4 h-4" />}
            <span className="capitalize">{amenity.replace("-", " ")}</span>
          </div>
        ))}
        {amenities.length > 3 && (
          <span className="text-xs text-gray-400 px-2 py-1">
            +{amenities.length - 3} more
          </span>
        )}
      </div>
    );
  };

  // Room card component
  const RoomCard = ({ room }) => {
    const price = room.discounted_price_per_night || room.price_per_night;

    return (
      <div
        className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl border p-6 transition-all duration-300 ${
          room.isAvailable
            ? "border-gray-700 hover:border-sky-500/50 cursor-pointer"
            : "border-red-800/50 opacity-70"
        }`}
        onClick={() => handleRoomSelect(room)}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-900/50 to-purple-900/50 rounded-xl flex items-center justify-center">
                <Bed className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Room #{room.room_number}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 bg-gray-900/50 text-xs rounded-lg text-gray-300">
                    {room.room_title || "Standard Room"}
                  </span>
                  <div
                    className={`px-2 py-1 text-xs rounded-lg flex items-center gap-1 ${
                      room.isAvailable
                        ? "bg-emerald-900/30 text-emerald-300"
                        : "bg-red-900/30 text-red-300"
                    }`}
                  >
                    {room.isAvailable ? (
                      <>
                        <Check className="w-3 h-3" />
                        Available
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3" />
                        {room.conflictReason || "Unavailable"}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400">${price}</div>
            <div className="text-sm text-gray-400">per night</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <div className="text-sm text-gray-400">Capacity</div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <span className="font-medium text-white">
                {room.no_of_guest || 2} guests
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-gray-400">Size</div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span className="font-medium text-white">
                {room.room_dimension || "30 m²"}
              </span>
            </div>
          </div>
        </div>

        {renderAmenities(room.amenities)}

        <button
          className={`w-full mt-6 py-3 cursor-pointer rounded-xl font-medium transition-all ${
            room.isAvailable
              ? "bg-sky-600 hover:bg-sky-700 text-white"
              : "bg-gray-900/50 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!room.isAvailable}
        >
          {room.isAvailable ? "Select Room" : "Not Available"}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 cursor-pointer hover:bg-gray-800/50 rounded-xl transition-colors lg:hidden"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div>
                <h1 className="text-2xl font-bold text-white">
                  Admin - Book a Room
                </h1>
                <p className="text-sm text-gray-400">
                  Book rooms on behalf of guests
                </p>
              </div>
            </div>

            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-700/50 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              {/* Step 1 */}
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 1 ? "bg-sky-600" : "bg-gray-800"
                  }`}
                >
                  {currentStep > 1 ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <Bed className="w-6 h-6 text-white" />
                  )}
                </div>
                <div
                  className={`ml-3 ${
                    currentStep >= 1 ? "text-white" : "text-gray-500"
                  }`}
                >
                  <div className="font-medium">Check Availability</div>
                  <div className="text-sm">Select dates & room type</div>
                </div>
              </div>

              {/* Connector */}
              <div
                className={`w-24 h-1 mx-4 ${
                  currentStep >= 2 ? "bg-sky-600" : "bg-gray-800"
                }`}
              ></div>

              {/* Step 2 */}
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 2 ? "bg-sky-600" : "bg-gray-800"
                  }`}
                >
                  {currentStep > 2 ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div
                  className={`ml-3 ${
                    currentStep >= 2 ? "text-white" : "text-gray-500"
                  }`}
                >
                  <div className="font-medium">Guest Details</div>
                  <div className="text-sm">Enter guest information</div>
                </div>
              </div>

              {/* Connector */}
              <div
                className={`w-24 h-1 mx-4 ${
                  currentStep >= 3 ? "bg-sky-600" : "bg-gray-800"
                }`}
              ></div>

              {/* Step 3 */}
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 3 ? "bg-sky-600" : "bg-gray-800"
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`ml-3 ${
                    currentStep >= 3 ? "text-white" : "text-gray-500"
                  }`}
                >
                  <div className="font-medium">Payment</div>
                  <div className="text-sm">Complete payment</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: Search Criteria */}
          {currentStep === 1 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
                <h2 className="text-xl font-bold text-white mb-6">
                  Check Room Availability
                </h2>

                {/* Search Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Room Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Room Category *
                    </label>
                    <div className="relative">
                      <Bed className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="roomCategory"
                        value={searchCriteria.roomCategory}
                        onChange={handleSearchCriteriaChange}
                        className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white appearance-none"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Check-in Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Check-in Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="checkInDate"
                        value={searchCriteria.checkInDate}
                        onChange={handleSearchCriteriaChange}
                        min={today}
                        className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  {/* Check-out Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Check-out Date *
                    </label>
                    <div className="relative">
                      <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="checkOutDate"
                        value={searchCriteria.checkOutDate}
                        onChange={handleSearchCriteriaChange}
                        min={searchCriteria.checkInDate}
                        className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  {/* Number of Guests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Guests *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="numberOfGuests"
                        value={searchCriteria.numberOfGuests}
                        onChange={handleSearchCriteriaChange}
                        className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white appearance-none"
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "guest" : "guests"}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Check Availability Button */}
                <div className="flex justify-center mb-8">
                  <button
                    onClick={checkAvailability}
                    disabled={
                      checkingAvailability || !searchCriteria.roomCategory
                    }
                    className="px-8 cursor-pointer py-4 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    {checkingAvailability ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Checking Availability...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        Check Available Rooms
                      </>
                    )}
                  </button>
                </div>

                {/* Results Section */}
                {rooms.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white">
                        {searchCriteria.roomCategory} Rooms
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <span className="text-sm text-gray-400">
                            Available ({availableRooms.length})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="text-sm text-gray-400">
                            Booked ({rooms.length - availableRooms.length})
                          </span>
                        </div>
                      </div>
                    </div>

                    {availableRooms.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-2xl flex items-center justify-center">
                          <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          No rooms available
                        </h3>
                        <p className="text-gray-400 mb-6">
                          All rooms in this category are booked for the selected
                          dates. Try different dates or select another category.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {rooms.map((room) => (
                            <RoomCard key={room.id} room={room} />
                          ))}
                        </div>

                        <div className="mt-8 p-4 bg-sky-900/20 border border-sky-700/30 rounded-xl">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-sky-400" />
                            <p className="text-sm text-gray-300">
                              <span className="font-medium text-white">
                                {availableRooms.length}
                              </span>{" "}
                              rooms are available for booking. Click on any
                              available room to proceed.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Guest Details */}
          {currentStep === 2 && selectedRoom && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
                {/* Selected Room Summary */}
                <div className="bg-gray-900/30 rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-900/50 to-sky-900/50 rounded-xl flex items-center justify-center">
                        <Bed className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Room #{selectedRoom.room_number}
                        </h3>
                        <p className="text-gray-400">
                          {selectedRoom.room_title}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-3 py-1 bg-gray-800/50 text-sm rounded-lg text-gray-300">
                            {selectedRoom.room_category}
                          </span>
                          <span className="px-3 py-1 bg-emerald-900/30 text-sm rounded-lg text-emerald-300">
                            Available
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Stay Duration</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-sky-400" />
                        <span className="font-medium text-white">
                          {calculateNights()} nights
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 pl-6">
                        {searchCriteria.checkInDate} →{" "}
                        {searchCriteria.checkOutDate}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Guests</div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-sky-400" />
                        <span className="font-medium text-white">
                          {searchCriteria.numberOfGuests}{" "}
                          {searchCriteria.numberOfGuests === 1
                            ? "guest"
                            : "guests"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Total Amount</div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span className="text-2xl font-bold text-emerald-400">
                          ${calculateTotalAmount()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guest Details Form */}
                <h3 className="text-xl font-bold text-white mb-6">
                  Guest Information
                </h3>
                <form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="firstName"
                          value={guestDetails.firstName}
                          onChange={handleGuestDetailsChange}
                          required
                          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500"
                          placeholder="John"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <div className="relative">
                        <UserCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="lastName"
                          value={guestDetails.lastName}
                          onChange={handleGuestDetailsChange}
                          required
                          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={guestDetails.email}
                          onChange={handleGuestDetailsChange}
                          required
                          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={guestDetails.phone}
                          onChange={handleGuestDetailsChange}
                          required
                          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500"
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <textarea
                          name="address"
                          value={guestDetails.address}
                          onChange={handleGuestDetailsChange}
                          rows="2"
                          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 resize-none"
                          placeholder="Street address, city, state, zip code"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Special Requests
                      </label>
                      <textarea
                        name="specialRequests"
                        value={guestDetails.specialRequests}
                        onChange={handleGuestDetailsChange}
                        rows="3"
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 resize-none"
                        placeholder="Any special requirements or requests..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 border cursor-pointer border-gray-600 hover:bg-gray-700/50 text-white rounded-xl font-medium transition-colors"
                    >
                      Back to Room Selection
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={
                        !guestDetails.firstName ||
                        !guestDetails.lastName ||
                        !guestDetails.email ||
                        !guestDetails.phone
                      }
                      className="px-6 py-3 bg-sky-600 cursor-pointer hover:bg-sky-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Step 3: Payment Details */}
          {currentStep === 3 && selectedRoom && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
                {/* Booking Summary */}
                <div className="bg-gray-900/30 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-bold text-white mb-6">
                    Booking Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-white mb-4">
                        Room Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Room Number:</span>
                          <span className="font-medium text-white">
                            #{selectedRoom.room_number}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Room Type:</span>
                          <span className="font-medium text-white">
                            {selectedRoom.room_category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Stay Duration:</span>
                          <span className="font-medium text-white">
                            {calculateNights()} nights
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Guests:</span>
                          <span className="font-medium text-white">
                            {searchCriteria.numberOfGuests} guests
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-white mb-4">
                        Guest Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Name:</span>
                          <span className="font-medium text-white">
                            {guestDetails.firstName} {guestDetails.lastName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Email:</span>
                          <span className="font-medium text-white">
                            {guestDetails.email}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Phone:</span>
                          <span className="font-medium text-white">
                            {guestDetails.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="mt-8 pt-8 border-t border-gray-700">
                    <h4 className="font-semibold text-white mb-4">
                      Price Breakdown
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Room Rate:</span>
                        <span className="font-medium text-white">
                          $
                          {selectedRoom.discounted_price_per_night ||
                            selectedRoom.price_per_night}{" "}
                          × {calculateNights()} nights
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                        <span className="text-lg font-semibold text-white">
                          Total Amount:
                        </span>
                        <span className="text-2xl font-bold text-emerald-400">
                          ${calculateTotalAmount()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <h3 className="text-xl font-bold text-white mb-6">
                  Select Payment Method
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div
                    className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                      paymentDetails.paymentMethod === "cash"
                        ? "bg-sky-900/30 border-sky-600"
                        : "bg-gray-900/30 border-gray-700 hover:border-gray-600"
                    }`}
                    onClick={() => handlePaymentMethodChange("cash")}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`p-3 rounded-xl ${
                          paymentDetails.paymentMethod === "cash"
                            ? "bg-sky-800"
                            : "bg-gray-800"
                        }`}
                      >
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">Cash Payment</h4>
                        <p className="text-sm text-gray-400">
                          Guest pays with cash
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                      paymentDetails.paymentMethod === "transfer"
                        ? "bg-sky-900/30 border-sky-600"
                        : "bg-gray-900/30 border-gray-700 hover:border-gray-600"
                    }`}
                    onClick={() => handlePaymentMethodChange("transfer")}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`p-3 rounded-xl ${
                          paymentDetails.paymentMethod === "transfer"
                            ? "bg-sky-800"
                            : "bg-gray-800"
                        }`}
                      >
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">Bank Transfer</h4>
                        <p className="text-sm text-gray-400">
                          Guest pays via bank transfer
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                {paymentDetails.paymentMethod === "cash" && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-white mb-4">
                      Cash Payment Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Amount Paid ($)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            name="amountPaid"
                            value={paymentDetails.amountPaid}
                            onChange={handlePaymentDetailsChange}
                            min="0"
                            max={calculateTotalAmount()}
                            step="0.01"
                            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="mt-2 text-sm text-gray-400">
                          Balance: $
                          {(
                            calculateTotalAmount() -
                            (parseFloat(paymentDetails.amountPaid) || 0)
                          ).toFixed(2)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Payment Status
                        </label>
                        <select
                          name="paymentStatus"
                          value={paymentDetails.paymentStatus}
                          onChange={handlePaymentDetailsChange}
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                        >
                          <option value="pending">Pending</option>

                          <option value="paid">Paid</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {paymentDetails.paymentMethod === "transfer" && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-white mb-4">
                      Bank Transfer Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Amount Paid ($)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            name="amountPaid"
                            value={paymentDetails.amountPaid}
                            onChange={handlePaymentDetailsChange}
                            min="0"
                            max={calculateTotalAmount()}
                            step="0.01"
                            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Transaction ID *
                        </label>
                        <div className="relative">
                          <Receipt className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="transactionId"
                            value={paymentDetails.transactionId}
                            onChange={handlePaymentDetailsChange}
                            required
                            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                            placeholder="Enter transaction reference"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Payment Status
                        </label>
                        <select
                          name="paymentStatus"
                          value={paymentDetails.paymentStatus}
                          onChange={handlePaymentDetailsChange}
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 border cursor-pointer border-gray-600 hover:bg-gray-700/50 text-white rounded-xl font-medium transition-colors"
                  >
                    Back to Guest Details
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitBooking}
                    disabled={
                      loading ||
                      (paymentDetails.paymentMethod === "transfer" &&
                        !paymentDetails.transactionId)
                    }
                    className="px-6 py-3 bg-emerald-600 cursor-pointer hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Booking...
                      </div>
                    ) : (
                      "Confirm Booking"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
