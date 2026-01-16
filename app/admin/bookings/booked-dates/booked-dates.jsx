"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Bed,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  Home,
  MapPin,
  Wifi,
  Tv,
  Wind,
  Coffee,
  Waves,
  Shield,
  Plus,
  CalendarDays,
  Eye,
  Hotel,
  Tag,
  Download,
  Printer,
  Mail,
  Phone,
  User,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  List,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/app/_components/admin/Sidebar";
import supabase from "../../../lib/supabase";
import { FaNairaSign } from "react-icons/fa6";
import {
  format,
  parseISO,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  startOfWeek,
  endOfWeek,
  addDays,
} from "date-fns";

// Helper function to format dates
const formatDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

export default function AdminBookedDates() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Data states
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calendar states
  const [bookedDates, setBookedDates] = useState({});
  const [roomBookings, setRoomBookings] = useState({});
  const [selectedDateBookings, setSelectedDateBookings] = useState([]);

  // UI states
  const [viewMode, setViewMode] = useState("calendar");
  const [expandedRooms, setExpandedRooms] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setSyncing(true);

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .order("check_in_date", { ascending: true });

      if (bookingsError) throw bookingsError;

      // Fetch rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number", { ascending: true });

      if (roomsError) throw roomsError;

      setBookings(bookingsData || []);
      setRooms(roomsData || []);

      // Extract unique categories from rooms (not from bookings)
      const uniqueCategories = [
        ...new Set(roomsData?.map((room) => room.room_category)),
      ];
      setCategories(uniqueCategories);

      // Process booked dates
      processBookedDates(bookingsData || [], roomsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  // Process booked dates for calendar display
  const processBookedDates = useCallback((bookingsData, roomsData) => {
    const bookedDatesMap = {};
    const roomBookingsMap = {};

    // Initialize room bookings map with all rooms
    roomsData.forEach((room) => {
      roomBookingsMap[room.room_number] = [];
    });

    // Process each booking
    bookingsData.forEach((booking) => {
      const checkIn = parseISO(booking.check_in_date);
      const checkOut = parseISO(booking.check_out_date);
      const roomNumber = booking.room_number;
      const roomCategory = booking.room_category;

      // Get room details for this booking
      const roomDetails = roomsData.find((r) => r.room_number === roomNumber);

      // Add to room bookings map if room exists
      if (roomBookingsMap[roomNumber]) {
        roomBookingsMap[roomNumber].push({
          ...booking,
          room_details: roomDetails,
        });
      }

      // Mark all dates in the booking range as booked
      let currentDate = new Date(checkIn);
      while (currentDate <= checkOut) {
        const dateKey = format(currentDate, "yyyy-MM-dd");

        if (!bookedDatesMap[dateKey]) {
          bookedDatesMap[dateKey] = [];
        }

        // Add booking to date if not already added
        if (!bookedDatesMap[dateKey].some((b) => b.id === booking.id)) {
          bookedDatesMap[dateKey].push({
            ...booking,
            room_details: roomDetails,
          });
        }

        currentDate = addDays(currentDate, 1);
      }
    });

    setBookedDates(bookedDatesMap);
    setRoomBookings(roomBookingsMap);
  }, []);

  // Get filtered rooms based on category selection
  const getFilteredRooms = useCallback(() => {
    let filtered = [...rooms];

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (room) => room.room_category === selectedCategory
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (room) =>
          room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.room_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.room_category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedRoom !== "all") {
      filtered = filtered.filter((room) => room.room_number === selectedRoom);
    }

    return filtered;
  }, [rooms, selectedCategory, searchQuery, selectedRoom]);

  // Get filtered bookings based on selected category and room
  const getFilteredBookings = useCallback(() => {
    if (selectedCategory === "all" && selectedRoom === "all") {
      return bookings;
    }

    return bookings.filter((booking) => {
      // Get room details for this booking
      const room = rooms.find((r) => r.room_number === booking.room_number);

      // Check category filter
      if (selectedCategory !== "all") {
        const bookingCategory = booking.room_category || room?.room_category;
        if (bookingCategory !== selectedCategory) {
          return false;
        }
      }

      // Check room filter
      if (selectedRoom !== "all" && booking.room_number !== selectedRoom) {
        return false;
      }

      return true;
    });
  }, [bookings, rooms, selectedCategory, selectedRoom]);

  // Get bookings for a specific date (filtered by current selection)
  const getBookingsForDate = useCallback(
    (date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      const allBookingsForDate = bookedDates[dateKey] || [];

      // Filter by selected category and room
      return allBookingsForDate.filter((booking) => {
        if (selectedCategory === "all" && selectedRoom === "all") {
          return true;
        }

        // Get room details
        const room = rooms.find((r) => r.room_number === booking.room_number);

        // Check category filter
        if (selectedCategory !== "all") {
          const bookingCategory = booking.room_category || room?.room_category;
          if (bookingCategory !== selectedCategory) {
            return false;
          }
        }

        // Check room filter
        if (selectedRoom !== "all" && booking.room_number !== selectedRoom) {
          return false;
        }

        return true;
      });
    },
    [bookedDates, rooms, selectedCategory, selectedRoom]
  );

  // Get occupancy for a specific date
  const getOccupancyForDate = useCallback(
    (date) => {
      const bookingsForDate = getBookingsForDate(date);
      const filteredRooms = getFilteredRooms();
      const occupiedRooms = new Set(bookingsForDate.map((b) => b.room_number))
        .size;

      return {
        occupied: occupiedRooms,
        total: filteredRooms.length,
        percentage:
          filteredRooms.length > 0
            ? (occupiedRooms / filteredRooms.length) * 100
            : 0,
      };
    },
    [getBookingsForDate, getFilteredRooms]
  );

  // Calendar navigation
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Toggle room expansion
  const toggleRoomExpansion = (roomNumber) => {
    setExpandedRooms((prev) =>
      prev.includes(roomNumber)
        ? prev.filter((r) => r !== roomNumber)
        : [...prev, roomNumber]
    );
  };

  // Handle date click
  const handleDateClick = (date) => {
    const bookings = getBookingsForDate(date);
    setSelectedDateBookings(bookings);
    setShowDetails(true);
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

  // Calendar component
  const CalendarView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const filteredRooms = getFilteredRooms();
    const hasBookingsForSelection = getFilteredBookings().length > 0;

    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
          >
            Today
          </button>
        </div>

        {/* Selection Info */}
        {selectedCategory !== "all" && (
          <div className="mb-4 p-4 bg-sky-900/20 border border-sky-700/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-sky-400" />
              <div>
                <p className="text-sm text-gray-300">
                  Showing bookings for{" "}
                  <span className="font-semibold text-white">
                    {selectedCategory}
                  </span>{" "}
                  category
                  {selectedRoom !== "all" && `, Room #${selectedRoom}`}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {hasBookingsForSelection
                    ? `${getFilteredBookings().length} bookings found`
                    : "No bookings found for this selection"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            const dateKey = format(day, "yyyy-MM-dd");
            const bookings = getBookingsForDate(day);
            const occupancy = getOccupancyForDate(day);
            const isFullyBooked = occupancy.percentage === 100;
            const isHighlyOccupied = occupancy.percentage >= 80;

            return (
              <div
                key={dateKey}
                onClick={() => handleDateClick(day)}
                className={`
                  relative min-h-24 p-2 rounded-xl border cursor-pointer transition-all
                  ${!isCurrentMonth ? "opacity-30" : ""}
                  ${isTodayDate ? "border-sky-500" : "border-gray-700"}
                  ${
                    bookings.length > 0
                      ? "hover:border-red-500/50"
                      : "hover:border-gray-600"
                  }
                  bg-gray-900/30
                `}
              >
                {/* Date number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`
                      text-sm font-medium
                      ${isTodayDate ? "text-sky-400" : "text-gray-300"}
                    `}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Occupancy indicator - only show if there are bookings */}
                  {bookings.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isFullyBooked
                            ? "bg-red-500"
                            : isHighlyOccupied
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      ></div>
                      <span className="text-xs text-gray-400">
                        {bookings.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Booking indicators - only show if there are bookings */}
                {bookings.length > 0 ? (
                  <div className="space-y-1">
                    {bookings.slice(0, 2).map((booking, idx) => (
                      <div
                        key={idx}
                        className={`
                          text-xs px-2 py-1 rounded truncate
                          ${
                            booking.booking_status === "confirmed"
                              ? "bg-emerald-900/30 text-emerald-300"
                              : booking.booking_status === "checked-in"
                              ? "bg-blue-900/30 text-blue-300"
                              : "bg-amber-900/30 text-amber-300"
                          }
                        `}
                      >
                        {booking.room_number}
                      </div>
                    ))}
                    {bookings.length > 2 && (
                      <div className="text-xs text-gray-400 text-center">
                        +{bookings.length - 2} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 text-center mt-2">
                    No bookings
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-gray-400">
                Low occupancy (0-79%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-sm text-gray-400">
                High occupancy (80-99%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-400">Fully booked (100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-700"></div>
              <span className="text-sm text-gray-400">No bookings</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Room List View
  const RoomListView = () => {
    const filteredRooms = getFilteredRooms();
    const filteredBookings = getFilteredBookings();
    const hasBookingsForSelection = filteredBookings.length > 0;

    if (filteredRooms.length === 0) {
      return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-2xl flex items-center justify-center">
            <Bed className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No rooms found</h3>
          <p className="text-gray-400 mb-6">
            {selectedCategory !== "all"
              ? `No rooms found in the "${selectedCategory}" category`
              : "Try adjusting your filters"}
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedRoom("all");
              setSearchQuery("");
            }}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Selection Info */}
        {selectedCategory !== "all" && (
          <div className="bg-sky-900/20 border border-sky-700/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-sky-900/30 rounded-xl">
                <Info className="w-6 h-6 text-sky-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">
                  {selectedCategory} Category
                </h3>
                <p className="text-gray-300 mb-3">
                  {hasBookingsForSelection
                    ? `Showing ${filteredBookings.length} bookings across ${filteredRooms.length} rooms`
                    : `No bookings found for ${selectedCategory} category. ${filteredRooms.length} rooms are available.`}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-gray-400">
                      Available rooms
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-gray-400">
                      Upcoming bookings
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Room Cards */}
        {filteredRooms.map((room) => {
          const roomBookingsList = roomBookings[room.room_number] || [];
          const filteredRoomBookings = roomBookingsList.filter((booking) => {
            if (selectedCategory !== "all") {
              const bookingCategory =
                booking.room_category || booking.room_details?.room_category;
              return bookingCategory === selectedCategory;
            }
            return true;
          });
          const upcomingBookings = filteredRoomBookings
            .filter((booking) => {
              const checkIn = parseISO(booking.check_in_date);
              return isAfter(checkIn, new Date());
            })
            .slice(0, 3);

          return (
            <div
              key={room.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-sky-500/50 transition-all duration-300"
            >
              <div className="p-6">
                {/* Room Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-sky-900/50 to-purple-900/50 rounded-xl flex items-center justify-center">
                      <Bed className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Room #{room.room_number}
                      </h3>
                      <p className="text-gray-400">{room.room_title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-gray-900/50 text-sm rounded-lg text-gray-300">
                          {room.room_category}
                        </span>
                        <div className="flex items-center gap-1 text-emerald-400">
                          <FaNairaSign className="w-4 h-4" />
                          <span className="font-bold">
                            {room.discounted_price_per_night ||
                              room.price_per_night}
                          </span>
                          <span className="text-sm text-gray-400">/night</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRoomExpansion(room.room_number)}
                    className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedRooms.includes(room.room_number)
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Room Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
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
                  <div className="space-y-1">
                    <div className="text-sm text-gray-400">Total Bookings</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-sky-400" />
                      <span className="font-medium text-white">
                        {filteredRoomBookings.length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-400">Status</div>
                    <div
                      className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 w-fit ${
                        room.room_availability &&
                        filteredRoomBookings.length === 0
                          ? "bg-emerald-900/30 border-emerald-700 text-emerald-300"
                          : "bg-red-900/30 border-red-700 text-red-300"
                      }`}
                    >
                      {room.room_availability &&
                      filteredRoomBookings.length === 0 ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Available
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          {filteredRoomBookings.length > 0
                            ? "Booked"
                            : "Unavailable"}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                {renderAmenities(room.amenities)}

                {/* Upcoming Bookings Preview */}
                {upcomingBookings.length > 0 ? (
                  <div className="mt-6">
                    <h4 className="font-semibold text-white mb-3">
                      Upcoming Bookings ({upcomingBookings.length})
                    </h4>
                    <div className="space-y-2">
                      {upcomingBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-white">
                              {booking.guest_name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {format(
                                parseISO(booking.check_in_date),
                                "MMM dd"
                              )}{" "}
                              -{" "}
                              {format(
                                parseISO(booking.check_out_date),
                                "MMM dd"
                              )}
                            </div>
                          </div>
                          <div
                            className={`px-3 py-1 text-xs rounded-lg ${
                              booking.booking_status === "confirmed"
                                ? "bg-emerald-900/30 text-emerald-300"
                                : "bg-amber-900/30 text-amber-300"
                            }`}
                          >
                            {booking.booking_status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 p-4 bg-gray-900/30 rounded-lg">
                    <p className="text-gray-400 text-center">
                      No upcoming bookings for this room
                    </p>
                  </div>
                )}

                {/* Expanded View - Booking Timeline */}
                {expandedRooms.includes(room.room_number) && (
                  <div className="mt-6 pt-6 border-t border-gray-700 animate-in slide-in-from-top-2">
                    <h4 className="font-semibold text-white mb-4">
                      Booking Timeline ({filteredRoomBookings.length} bookings)
                    </h4>
                    {filteredRoomBookings.length > 0 ? (
                      <div className="space-y-3">
                        {filteredRoomBookings.map((booking) => {
                          const checkIn = parseISO(booking.check_in_date);
                          const checkOut = parseISO(booking.check_out_date);
                          const nights = Math.ceil(
                            (checkOut - checkIn) / (1000 * 60 * 60 * 24)
                          );

                          return (
                            <div
                              key={booking.id}
                              className="p-4 bg-gray-900/30 rounded-xl border border-gray-700 hover:border-sky-500/50 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <div className="font-medium text-white">
                                    {booking.guest_name}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {booking.guest_email}
                                  </div>
                                </div>
                                <div
                                  className={`px-3 py-1.5 rounded-lg border ${
                                    booking.booking_status === "confirmed"
                                      ? "bg-emerald-900/30 border-emerald-700 text-emerald-300"
                                      : booking.booking_status === "checked-in"
                                      ? "bg-blue-900/30 border-blue-700 text-blue-300"
                                      : "bg-amber-900/30 border-amber-700 text-amber-300"
                                  }`}
                                >
                                  {booking.booking_status}
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <div className="text-sm text-gray-400">
                                    Dates
                                  </div>
                                  <div className="font-medium text-white">
                                    {format(checkIn, "MMM dd, yyyy")} →{" "}
                                    {format(checkOut, "MMM dd, yyyy")}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {nights} nights
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-400">
                                    Payment
                                  </div>
                                  <div className="font-medium text-white">
                                    {booking.payment_status === "paid" ? (
                                      <span className="text-emerald-400">
                                        Paid
                                      </span>
                                    ) : (
                                      <span className="text-amber-400">
                                        Pending
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-400">
                                    <FaNairaSign className="w-3 h-3" />
                                    {booking.total_amount}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-400">
                                    Contact
                                  </div>
                                  <div className="font-medium text-white">
                                    {booking.guest_phone}
                                  </div>
                                  <div className="text-sm text-gray-400 truncate">
                                    ID: {booking.booking_id}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 bg-gray-900/30 rounded-xl text-center">
                        <p className="text-gray-400">
                          No bookings found for this room
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Date Details Modal
  const DateDetailsModal = () => {
    if (!showDetails) return null;

    const selectedDate = selectedDateBookings[0]?.check_in_date
      ? parseISO(selectedDateBookings[0].check_in_date)
      : new Date();

    const filteredRooms = getFilteredRooms();

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {format(selectedDate, "MMMM dd, yyyy")}
                </h2>
                <p className="text-gray-400">
                  {selectedDateBookings.length} booking
                  {selectedDateBookings.length !== 1 ? "s" : ""}
                  {selectedCategory !== "all" && ` for ${selectedCategory}`}
                </p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Occupancy Stats */}
            <div className="bg-gray-900/30 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Total Rooms</div>
                  <div className="text-3xl font-bold text-white">
                    {filteredRooms.length}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Occupied Rooms</div>
                  <div className="text-3xl font-bold text-emerald-400">
                    {selectedDateBookings.length}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Occupancy Rate</div>
                  <div className="text-3xl font-bold text-sky-400">
                    {filteredRooms.length > 0
                      ? Math.round(
                          (selectedDateBookings.length / filteredRooms.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Bookings for this date
              </h3>
              {selectedDateBookings.length > 0 ? (
                selectedDateBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 bg-gray-900/30 rounded-xl border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-sky-600 to-sky-700 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {booking.guest_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || "GU"}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">
                            {booking.guest_name}
                          </h4>
                          <p className="text-sm text-gray-400">
                            Room #{booking.room_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-3 py-1.5 rounded-lg border ${
                            booking.booking_status === "confirmed"
                              ? "bg-emerald-900/30 border-emerald-700 text-emerald-300"
                              : booking.booking_status === "checked-in"
                              ? "bg-blue-900/30 border-blue-700 text-blue-300"
                              : "bg-amber-900/30 border-amber-700 text-amber-300"
                          }`}
                        >
                          {booking.booking_status}
                        </div>
                        <div
                          className={`px-3 py-1.5 rounded-lg border ${
                            booking.payment_status === "paid"
                              ? "bg-emerald-900/30 border-emerald-700 text-emerald-300"
                              : "bg-amber-900/30 border-amber-700 text-amber-300"
                          }`}
                        >
                          {booking.payment_status}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-400">Stay Period</div>
                        <div className="font-medium text-white">
                          {format(
                            parseISO(booking.check_in_date),
                            "MMM dd, yyyy"
                          )}{" "}
                          →{" "}
                          {format(
                            parseISO(booking.check_out_date),
                            "MMM dd, yyyy"
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          {booking.no_of_nights} nights
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Contact</div>
                        <div className="font-medium text-white">
                          {booking.guest_email}
                        </div>
                        <div className="text-sm text-gray-400">
                          {booking.guest_phone}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Amount</div>
                        <div className="flex items-center gap-1 text-lg font-bold text-emerald-400">
                          <FaNairaSign className="w-5 h-5" />
                          {booking.total_amount}
                        </div>
                        <div className="text-sm text-gray-400">
                          ID: {booking.booking_id}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 bg-gray-900/30 rounded-xl text-center">
                  <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-white mb-2">
                    No bookings found
                  </h4>
                  <p className="text-gray-400">
                    There are no bookings for this date with the current
                    filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add Info icon component
  const Info = ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading booked dates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors lg:hidden"
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
                  Booked Dates Calendar
                </h1>
                <p className="text-sm text-gray-400">
                  View and manage room bookings by date
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 ${
                  syncing ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    syncing ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                ></div>
                <span className="text-sm">
                  {syncing ? "Syncing..." : "Live"}
                </span>
              </div>
              <button
                onClick={fetchData}
                disabled={syncing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  syncing
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-sky-600 hover:bg-sky-700"
                }`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
                />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
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
          {/* Filters Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Room Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Category
                </label>
                <div className="relative">
                  <Bed className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedRoom("all"); // Reset room filter when category changes
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white appearance-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Room Number Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Number
                </label>
                <div className="relative">
                  <Home className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white appearance-none"
                    disabled={selectedCategory === "all"}
                  >
                    <option value="all">
                      {selectedCategory === "all"
                        ? "Select category first"
                        : "All Rooms"}
                    </option>
                    {getFilteredRooms().map((room) => (
                      <option key={room.room_number} value={room.room_number}>
                        Room #{room.room_number}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Rooms
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by room number or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500"
                  />
                </div>
              </div>

              {/* View Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  View Mode
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("calendar")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                      viewMode === "calendar"
                        ? "bg-sky-600 text-white"
                        : "bg-gray-900/50 text-gray-400 hover:bg-gray-700/50"
                    }`}
                  >
                    <CalendarDays className="w-5 h-5" />
                    Calendar
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                      viewMode === "list"
                        ? "bg-sky-600 text-white"
                        : "bg-gray-900/50 text-gray-400 hover:bg-gray-700/50"
                    }`}
                  >
                    <List className="w-5 h-5" />
                    List
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          {viewMode === "calendar" ? <CalendarView /> : <RoomListView />}

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-3 border border-gray-600 hover:bg-gray-700/50 text-white rounded-xl font-medium transition-colors"
            >
              <Printer className="w-5 h-5" />
              Print Calendar
            </button>
            <button
              onClick={() => {
                const data = {
                  category: selectedCategory,
                  room: selectedRoom,
                  bookings: selectedDateBookings,
                  date: format(new Date(), "yyyy-MM-dd"),
                };
                const dataStr = JSON.stringify(data, null, 2);
                const dataUri =
                  "data:application/json;charset=utf-8," +
                  encodeURIComponent(dataStr);
                const exportFileDefaultName = `bookings-${format(
                  new Date(),
                  "yyyy-MM-dd"
                )}.json`;
                const linkElement = document.createElement("a");
                linkElement.setAttribute("href", dataUri);
                linkElement.setAttribute("download", exportFileDefaultName);
                linkElement.click();
              }}
              className="flex items-center gap-2 px-4 py-3 border border-gray-600 hover:bg-gray-700/50 text-white rounded-xl font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              Export Data
            </button>
            <Link
              href="/admin/book-a-room"
              className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Booking
            </Link>
          </div>
        </main>
      </div>

      {/* Date Details Modal */}
      <DateDetailsModal />
    </div>
  );
}
