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
  Search,
  Printer,
  Eye,
  ArrowRight,
  Building,
  RefreshCw,
  AlertCircle,
  X,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { format, parseISO, isAfter, isBefore, isValid } from "date-fns";

const BookingsPage = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const router = useRouter();

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    dateRange: "all",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

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
        setIsLoading(false);
      }
    };

    getUser();
  }, [router]);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [filters]);

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
        setIsLoading(false);
        return;
      }

      const formattedBookings = await Promise.all(
        bookingsData.map(async (booking) => {
          try {
            const checkIn = parseISO(booking.check_in_date);
            const checkOut = parseISO(booking.check_out_date);
            const today = new Date();

            if (!isValid(checkIn) || !isValid(checkOut)) {
              console.warn("Invalid dates for booking:", booking.id);
            }

            let roomImage = null;
            if (booking.room_image) {
              try {
                if (Array.isArray(booking.room_image)) {
                  roomImage = booking.room_image[0] || null;
                } else if (typeof booking.room_image === "string") {
                  if (booking.room_image.trim().startsWith("[")) {
                    const parsed = JSON.parse(booking.room_image);
                    if (Array.isArray(parsed)) {
                      roomImage = parsed[0] || null;
                    } else if (typeof parsed === "string") {
                      roomImage = parsed;
                    }
                  } else {
                    roomImage = booking.room_image;
                  }
                }
              } catch (e) {
                console.warn("Error parsing room image:", e);
                roomImage = null;
              }
            }

            let displayStatus = booking.booking_status || "pending";

            if (displayStatus === "confirmed") {
              if (isBefore(today, checkIn)) {
                displayStatus = "upcoming";
              } else if (isAfter(today, checkOut)) {
                displayStatus = "completed";
              } else if (today >= checkIn && today <= checkOut) {
                displayStatus = "active";
              }
            }

            const nights = Math.ceil(
              (checkOut - checkIn) / (1000 * 60 * 60 * 24)
            );

            return {
              id: booking.id,
              booking_id:
                booking.booking_id || `BOOK-${booking.id.slice(0, 8)}`,
              booking_reference:
                booking.booking_reference ||
                booking.booking_id ||
                `BOOK-${booking.id.slice(0, 8)}`,
              room_title: booking.room_title || "Room",
              room_category: booking.room_category || "Standard Room",
              room_number: booking.room_number || "Not assigned",
              room_image: roomImage,
              check_in_date: booking.check_in_date,
              check_out_date: booking.check_out_date,
              no_of_guests: booking.no_of_guests || 1,
              total_amount: booking.total_amount || 0,
              currency: booking.currency || "USD",
              payment_status: booking.payment_status || "pending",
              payment_method: booking.payment_method || "paystack",
              booking_status: booking.booking_status || "pending",
              guest_name: booking.guest_name || "Guest",
              guest_email: booking.guest_email || "",
              guest_phone: booking.guest_phone || "",
              special_requests: booking.special_requests || "",
              user_id: booking.user_id,
              payment_reference: booking.payment_reference,
              created_at: booking.created_at,
              displayStatus,
              formattedCheckIn: format(checkIn, "MMM dd, yyyy"),
              formattedCheckOut: format(checkOut, "MMM dd, yyyy"),
              formattedDates: `${format(checkIn, "MMM dd")} - ${format(
                checkOut,
                "MMM dd, yyyy"
              )}`,
              nights: nights > 0 ? nights : 1,
            };
          } catch (error) {
            console.error("Error formatting booking:", error);
            return null;
          }
        })
      );

      const validBookings = formattedBookings.filter((b) => b !== null);
      setBookings(validBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load your bookings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    if (filters.status !== "all") {
      filtered = filtered.filter(
        (booking) => booking.booking_status === filters.status
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          (booking.room_title || "").toLowerCase().includes(searchLower) ||
          (booking.booking_reference || "")
            .toLowerCase()
            .includes(searchLower) ||
          (booking.guest_name || "").toLowerCase().includes(searchLower)
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filters.dateRange === "upcoming") {
      filtered = filtered.filter((booking) => {
        try {
          const checkIn = parseISO(booking.check_in_date);
          return checkIn > today;
        } catch (e) {
          return false;
        }
      });
    } else if (filters.dateRange === "past") {
      filtered = filtered.filter((booking) => {
        try {
          const checkOut = parseISO(booking.check_out_date);
          return checkOut < today;
        } catch (e) {
          console.log(e);
          return false;
        }
      });
    } else if (filters.dateRange === "current") {
      filtered = filtered.filter((booking) => {
        try {
          const checkIn = parseISO(booking.check_in_date);
          const checkOut = parseISO(booking.check_out_date);
          return checkIn <= today && checkOut >= today;
        } catch (e) {
          console.log(e);
          return false;
        }
      });
    }

    setFilteredBookings(filtered);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    // Scroll to top of bookings list
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();

    switch (statusLower) {
      case "confirmed":
      case "active":
      case "upcoming":
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
    const statusLower = status.toLowerCase();

    switch (statusLower) {
      case "confirmed":
      case "active":
      case "upcoming":
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
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${booking.booking_reference}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .invoice-details { margin: 20px 0; }
            .invoice-details p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>Royal Moss Hotel - Invoice</h1>
          <div class="invoice-details">
            <p><strong>Booking Reference:</strong> ${
              booking.booking_reference
            }</p>
            <p><strong>Guest Name:</strong> ${booking.guest_name}</p>
            <p><strong>Room:</strong> ${booking.room_title}</p>
            <p><strong>Dates:</strong> ${booking.formattedDates}</p>
            <p><strong>Nights:</strong> ${booking.nights}</p>
            <p><strong>Total Amount:</strong> ${booking.currency} ${
      booking.total_amount
    }</p>
            <p><strong>Payment Status:</strong> ${booking.payment_status}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleRefresh = () => {
    if (user) {
      fetchBookings(user.id);
    } else {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setUser(user);
          fetchBookings(user.id);
        } else {
          router.push("/login");
        }
      });
    }
  };

  const getBookingStats = () => {
    const stats = {
      total: bookings.length,
      upcoming: bookings.filter((b) => {
        try {
          return parseISO(b.check_in_date) > new Date();
        } catch (e) {
          console.log(e);
          return false;
        }
      }).length,
      current: bookings.filter((b) => {
        try {
          const checkIn = parseISO(b.check_in_date);
          const checkOut = parseISO(b.check_out_date);
          const today = new Date();
          return checkIn <= today && checkOut >= today;
        } catch (e) {
          console.log(e);
          return false;
        }
      }).length,
      past: bookings.filter((b) => {
        try {
          return parseISO(b.check_out_date) < new Date();
        } catch (e) {
          return false;
        }
      }).length,
    };
    return stats;
  };

  const stats = getBookingStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{error}</h3>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-3 bg-sky-600 cursor-pointer text-white rounded-full font-semibold hover:bg-sky-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
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

            <div className="mt-6 lg:mt-0 flex gap-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center cursor-pointer px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => router.push("/rooms")}
                className="inline-flex items-center cursor-pointer px-5 py-2.5 bg-sky-600 text-white rounded-full font-medium hover:bg-sky-700 transition-colors"
              >
                Book New Room
                <ArrowRight className="w-4 h-4 ml-2" />
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
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-8">
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
        {!isLoading && !error && currentBookings.length > 0 && (
          <div className="space-y-6">
            {currentBookings.map((booking) => {
              const statusColor = getStatusColor(
                booking.displayStatus || booking.booking_status
              );
              const statusIcon = getStatusIcon(
                booking.displayStatus || booking.booking_status
              );

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:border-sky-300 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      {/* Room Image */}
                      <div className="lg:w-1/4">
                        <div className="aspect-4/3 relative rounded-xl overflow-hidden bg-gradient-to-br from-sky-400 to-purple-500">
                          {booking.room_image ? (
                            <Image
                              src={booking.room_image}
                              alt={booking.room_title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 25vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
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
                                {booking.displayStatus ||
                                  booking.booking_status}
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

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gray-50 p-3 rounded-xl">
                            <div className="flex items-center text-gray-700 mb-1">
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

                          <div className="bg-gray-50 p-3 rounded-xl">
                            <div className="flex items-center text-gray-700 mb-1">
                              <CreditCard className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                Total Amount
                              </span>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              ₦{(booking.total_amount || 0).toFixed(2)}K
                            </div>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-xl">
                            <div className="flex items-center text-gray-700 mb-1">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                Booking ID
                              </span>
                            </div>
                            <div className="font-mono text-sm font-bold text-gray-900 truncate">
                              {booking.booking_id}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-xl">
                            <div className="flex items-center text-gray-700 mb-1">
                              <Building className="w-4 h-4 mr-2" />
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
                          {booking.booking_status === "confirmed" && (
                            <button
                              onClick={() => {
                                const checkIn = parseISO(booking.check_in_date);
                                if (checkIn > new Date()) {
                                  if (
                                    confirm(
                                      "Are you sure you want to cancel this booking?"
                                    )
                                  ) {
                                    alert(
                                      "Booking cancellation feature to be implemented"
                                    );
                                  }
                                }
                              }}
                              className="px-5 py-2.5 border cursor-pointer border-rose-300 text-rose-700 rounded-lg font-medium hover:bg-rose-50 transition-colors"
                            >
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

            {/* Pagination */}
            {filteredBookings.length > itemsPerPage && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {indexOfFirstItem + 1}-
                      {Math.min(indexOfLastItem, filteredBookings.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {filteredBookings.length}
                    </span>{" "}
                    bookings
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* First Page */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg ${
                        currentPage === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100 cursor-pointer"
                      }`}
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>

                    {/* Previous Page */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg ${
                        currentPage === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100 cursor-pointer"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {getPageNumbers().map((pageNum, index) =>
                        pageNum === "..." ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-gray-400"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? "bg-sky-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      )}
                    </div>

                    {/* Next Page */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg ${
                        currentPage === totalPages
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100 cursor-pointer"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg ${
                        currentPage === totalPages
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100 cursor-pointer"
                      }`}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Items per page selector (optional) */}
                  <div className="text-sm text-gray-600">
                    <span className="mr-2">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        // If you want to make itemsPerPage dynamic
                        // setItemsPerPage(Number(e.target.value));
                        // setCurrentPage(1);
                      }}
                      className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                      disabled
                    >
                      <option value="5">5 per page</option>
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
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
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
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
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Image */}
              <div className="mb-6">
                <div className="aspect-video relative rounded-xl overflow-hidden bg-linear-to-br from-sky-400 to-purple-500">
                  {selectedBooking.room_image ? (
                    <Image
                      src={selectedBooking.room_image}
                      alt={selectedBooking.room_title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 100vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-3xl font-bold opacity-20">
                          Royal Moss
                        </div>
                        <div className="text-lg opacity-40">Luxury Room</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div>
                  <div className="bg-gray-50 rounded-xl p-5 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Stay Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Type</span>
                        <span className="font-medium">
                          {selectedBooking.room_category ||
                            selectedBooking.room_title}
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
                        <span className="font-medium font-mono">
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

                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="font-bold">
                          ₦{(selectedBooking.total_amount || 0).toFixed(2)}K
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Status</span>
                        <span
                          className={`font-medium capitalize ${
                            selectedBooking.payment_status === "paid"
                              ? "text-emerald-600"
                              : selectedBooking.payment_status === "pending"
                              ? "text-amber-600"
                              : "text-rose-600"
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
                        <span className="text-gray-600">Booking Status</span>
                        <span className="font-medium capitalize">
                          {selectedBooking.booking_status}
                        </span>
                      </div>
                      {selectedBooking.payment_reference && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Ref</span>
                          <span className="font-medium font-mono text-sm">
                            {selectedBooking.payment_reference}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="bg-gray-50 rounded-xl p-5 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
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
                          {selectedBooking.guest_email || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">
                          {selectedBooking.guest_phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-5 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Special Requests
                    </h3>
                    <p className="text-gray-700">
                      {selectedBooking.special_requests ||
                        "No special requests provided"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Booking Timeline
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Booking Created</span>
                        <span className="font-medium">
                          {selectedBooking.created_at
                            ? format(
                                new Date(selectedBooking.created_at),
                                "MMM dd, yyyy HH:mm"
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Check-in Date</span>
                        <span className="font-medium">
                          {selectedBooking.formattedCheckIn}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Check-out Date</span>
                        <span className="font-medium">
                          {selectedBooking.formattedCheckOut}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-3 justify-end">
                <button
                  onClick={() => handlePrintInvoice(selectedBooking)}
                  className="px-6 py-3 border cursor-pointer border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  <Printer className="w-4 h-4 inline mr-2" />
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
