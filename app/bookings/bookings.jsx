"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabase";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Filter,
  Search,
  Download,
  Printer,
  Eye,
  ArrowRight,
  Building,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { format, parseISO, isAfter, isBefore } from "date-fns";

const BookingsPage = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    dateRange: "all",
  });

  const bookingStatuses = [
    { value: "all", label: "All Bookings", color: "gray" },
    { value: "confirmed", label: "Confirmed", color: "emerald" },
    { value: "pending", label: "Pending", color: "amber" },
    { value: "checked_in", label: "Checked In", color: "blue" },
    { value: "checked_out", label: "Checked Out", color: "purple" },
    { value: "cancelled", label: "Cancelled", color: "red" },
  ];

  const dateRanges = [
    { value: "all", label: "All Dates" },
    { value: "upcoming", label: "Upcoming Stays" },
    { value: "past", label: "Past Stays" },
    { value: "current", label: "Current Stays" },
  ];

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setUser(user);
        fetchBookings(user.id);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Please login to view your bookings");
      }
    };

    getUser();
  }, [router]);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const fetchBookings = async (userId) => {
    setIsLoading(true);
    setError("");

    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("check_in_date", { ascending: false });

      if (bookingsError) throw bookingsError;

      if (!bookingsData || bookingsData.length === 0) {
        setBookings([]);
        return;
      }

      // Format bookings with room details
      const formattedBookings = bookingsData.map((booking) => {
        const roomData = booking.rooms || {};
        const checkIn = parseISO(booking.check_in_date);
        const checkOut = parseISO(booking.check_out_date);
        const today = new Date();

        let status = booking.booking_status;

        // Determine status based on dates
        if (status === "confirmed") {
          if (isBefore(today, checkIn)) {
            status = "upcoming";
          } else if (isAfter(today, checkOut)) {
            status = "completed";
          } else if (today >= checkIn && today <= checkOut) {
            status = "active";
          }
        }

        return {
          ...booking,
          roomTitle: roomData.room_category,

          roomImage: roomData.room_image
            ? Array.isArray(roomData.room_image)
              ? roomData.room_image[0]
              : JSON.parse(roomData.room_image)[0]
            : null,
          roomDescription: roomData.room_description || "",
          status,
          formattedCheckIn: format(checkIn, "MMM dd, yyyy"),
          formattedCheckOut: format(checkOut, "MMM dd, yyyy"),
          formattedDates: `${format(checkIn, "MMM dd")} - ${format(
            checkOut,
            "MMM dd, yyyy"
          )}`,
          nights: Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)),
        };
      });

      setBookings(formattedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load your bookings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter(
        (booking) => booking.booking_status === filters.status
      );
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.roomTitle.toLowerCase().includes(searchLower) ||
          booking.booking_reference.toLowerCase().includes(searchLower) ||
          booking.guest_name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filters.dateRange === "upcoming") {
      filtered = filtered.filter((booking) => {
        const checkIn = parseISO(booking.check_in_date);
        return checkIn > today;
      });
    } else if (filters.dateRange === "past") {
      filtered = filtered.filter((booking) => {
        const checkOut = parseISO(booking.check_out_date);
        return checkOut < today;
      });
    } else if (filters.dateRange === "current") {
      filtered = filtered.filter((booking) => {
        const checkIn = parseISO(booking.check_in_date);
        const checkOut = parseISO(booking.check_out_date);
        return checkIn <= today && checkOut >= today;
      });
    }

    setFilteredBookings(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
      case "active":
        return "emerald";
      case "pending":
        return "amber";
      case "checked_in":
        return "blue";
      case "checked_out":
      case "completed":
        return "purple";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <ClockIcon className="w-4 h-4" />;
      case "checked_in":
        return <Building className="w-4 h-4" />;
      case "checked_out":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
  };

  const handlePrintInvoice = (booking) => {
    // Implement print functionality
    window.print();
  };

  const handleRefresh = () => {
    if (user) {
      fetchBookings(user.id);
    }
  };

  const getBookingStats = () => {
    const stats = {
      total: bookings.length,
      upcoming: bookings.filter((b) => parseISO(b.check_in_date) > new Date())
        .length,
      current: bookings.filter((b) => {
        const checkIn = parseISO(b.check_in_date);
        const checkOut = parseISO(b.check_out_date);
        const today = new Date();
        return checkIn <= today && checkOut >= today;
      }).length,
      past: bookings.filter((b) => parseISO(b.check_out_date) < new Date())
        .length,
    };
    return stats;
  };

  const stats = getBookingStats();

  if (!user && !isLoading) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                My Bookings
              </h1>
              <p className="text-xl text-gray-600">
                Manage your reservations and view booking details
              </p>
            </div>

            <div className="mt-6 lg:mt-0">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center cursor-pointer px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by room, reference, or name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
              >
                {bookingStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.dateRange}
                onChange={(e) =>
                  handleFilterChange("dateRange", e.target.value)
                }
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{error}</h3>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-sky-600 cursor-pointer text-white rounded-full font-semibold hover:bg-sky-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Bookings State */}
        {!isLoading && !error && bookings.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-sky-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No Bookings Yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              You haven&apos;t made any reservations yet. Start planning your
              perfect stay with us.
            </p>
            <button
              onClick={() => router.push("/rooms")}
              className="px-8 py-3 bg-sky-600 text-white rounded-full font-semibold hover:bg-sky-700 transition-colors flex items-center mx-auto"
            >
              Browse Rooms
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}

        {/* Bookings List */}
        {!isLoading && !error && filteredBookings.length > 0 && (
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const statusColor = getStatusColor(booking.booking_status);
              const statusIcon = getStatusIcon(booking.booking_status);

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:border-sky-300 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      {/* Room Image */}
                      <div className="lg:w-1/4">
                        <div className="aspect-[4/3] relative rounded-xl overflow-hidden">
                          {booking.roomImage ? (
                            <Image
                              src={booking.roomImage}
                              alt={booking.roomTitle}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 25vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-sky-400 to-purple-500 flex items-center justify-center">
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
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="lg:w-3/4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {booking.room_title}
                            </h3>
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2 text-sky-500" />
                                {booking.formattedDates}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-2 text-purple-500" />
                                {booking.nights} night
                                {booking.nights !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 mt-4 md:mt-0">
                            <div
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-${statusColor}-50 text-${statusColor}-700`}
                            >
                              {statusIcon}
                              <span className="ml-2 capitalize">
                                {booking.booking_status.replace("_", " ")}
                              </span>
                            </div>
                            <button
                              onClick={() => handleViewBooking(booking)}
                              className="flex items-center px-4 py-2 cursor-pointer text-gray-700 hover:text-sky-600"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Details
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center text-gray-700 mb-2">
                              <Users className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                Guests
                              </span>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {booking.no_of_guests} guest
                              {booking.no_of_guests !== 1 ? "s" : ""}
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center text-gray-700 mb-2">
                              <CreditCard className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                Total Amount
                              </span>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {booking.total_amount} {booking.currency}
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center text-gray-700 mb-2">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                Booking ID
                              </span>
                            </div>
                            <div className="font-mono text-lg font-bold text-gray-900">
                              {booking.booking_id}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center text-gray-700 mb-2">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                Room Number
                              </span>
                            </div>
                            <div className="font-mono text-lg font-bold text-gray-900">
                              {booking.room_number}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                          <button
                            onClick={() => handleViewBooking(booking)}
                            className="px-5 py-2.5 bg-sky-600 cursor-pointer text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
                          >
                            View Full Details
                          </button>
                          <button
                            onClick={() => handlePrintInvoice(booking)}
                            className="px-5 py-2.5 border cursor-pointer border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                          >
                            <Printer className="w-4 h-4 inline mr-2" />
                            Print Invoice
                          </button>
                          {booking.booking_status === "confirmed" &&
                            parseISO(booking.check_in_date) > new Date() && (
                              <button className="px-5 py-2.5 border cursor-pointer border-rose-300 text-rose-700 rounded-lg font-medium hover:bg-rose-50 transition-colors">
                                Cancel Booking
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No Results State */}
        {!isLoading &&
          !error &&
          bookings.length > 0 &&
          filteredBookings.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Matching Bookings
              </h3>
              <p className="text-gray-600 mb-6">
                No bookings match your current filters. Try adjusting your
                search criteria.
              </p>
              <button
                onClick={() =>
                  setFilters({ status: "all", search: "", dateRange: "all" })
                }
                className="px-6 py-3 cursor-pointer bg-sky-600 text-white rounded-full font-semibold hover:bg-sky-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Booking Details
                    </h2>
                    <p className="text-gray-600">
                      Reference: {selectedBooking.booking_reference}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div>
                    <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Stay Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Room Type</span>
                          <span className="font-medium">
                            {selectedBooking.room_category}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Room Number</span>
                          <span className="font-medium">
                            {selectedBooking.room_number}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking ID</span>
                          <span className="font-medium">
                            {selectedBooking.booking_id}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-in</span>
                          <span className="font-medium">
                            {selectedBooking.formattedCheckIn}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-out</span>
                          <span className="font-medium">
                            {selectedBooking.formattedCheckOut}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-medium">
                            {selectedBooking.nights} nights
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Guests</span>
                          <span className="font-medium">
                            {selectedBooking.no_of_guests}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Payment Details
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount</span>
                          <span className="font-bold">
                            {selectedBooking.total_amount}{" "}
                            {selectedBooking.currency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Status</span>
                          <span
                            className={`font-medium capitalize ${
                              selectedBooking.payment_status === "paid"
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }`}
                          >
                            {selectedBooking.payment_status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method</span>
                          <span className="font-medium capitalize">
                            {selectedBooking.payment_method}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking status</span>
                          <span className="font-medium capitalize">
                            {selectedBooking.booking_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Guest Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="font-medium">
                            {selectedBooking.guest_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">
                            {selectedBooking.guest_email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">
                            {selectedBooking.guest_phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Special Requests
                      </h3>
                      <p className="text-gray-700">
                        {selectedBooking.special_requests ||
                          "No special requests"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-8 border-t border-gray-200 flex justify-end space-x-4">
                  <button
                    onClick={() => handlePrintInvoice(selectedBooking)}
                    className="px-6 py-3 border cursor-pointer border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
                  >
                    Print Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
