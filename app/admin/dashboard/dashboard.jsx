"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Calendar,
  User,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Download,
  Printer,
  Mail,
  Phone,
  CalendarDays,
  Users,
  Bed,
  Tag,
  ChevronDown,
  ChevronUp,
  Plus,
  RefreshCw,
  BarChart3,
  Grid,
  List,
  Hotel,
  CalendarCheck,
  CheckSquare,
  Shield,
  Zap,
  Star,
  TrendingUp,
  ChevronRight,
  TrendingDown,
  Activity,
  ExternalLink,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/admin/Sidebar";
import supabase from "../../lib/supabase";
import {
  format,
  subDays,
  subMonths,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  parseISO,
  isValid,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { FaNairaSign } from "react-icons/fa6";
import Image from "next/image";

// Time period options for chart
const chartTimeFrames = [
  { id: "week", label: "Weekly", groupBy: "week" },
  { id: "month", label: "Monthly", groupBy: "month" },
  { id: "year", label: "Yearly", groupBy: "year" },
  { id: "all", label: "All Time", groupBy: "year" },
];

// Time period options for stats
const timePeriods = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
  { id: "all", label: "All Time" },
];

const statusOptions = [
  "all",
  "confirmed",
  "pending",
  "cancelled",
  "checked-in",
  "checked-out",
];
const paymentStatusOptions = ["all", "paid", "pending", "partial", "refunded"];

export default function BookingsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]); // Store all bookings for filtering
  const [rooms, setRooms] = useState([]);
  const [roomTypeOptions, setRoomTypeOptions] = useState(["all"]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeStays: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    totalUsers: 0,
    averageBookingValue: 0,
    avgStayDuration: 0,
    topRoomType: "N/A",
  });
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [chartTimeFrame, setChartTimeFrame] = useState("month");
  const [timePeriod, setTimePeriod] = useState("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRoomType, setSelectedRoomType] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [sortBy, setSortBy] = useState("check_in_date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  useEffect(() => {
    const checkAdminRole = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/unauthorized");
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_role")
        .eq("id", user.id)
        .single();

      // ❌ Not admin → unauthorized
      if (userError || userData?.user_role !== "admin") {
        router.replace("/unauthorized");
        return;
      }

      setLoading(false);
      fetchData();
    };

    checkAdminRole();
  }, [router]);

  // Price formatting function
  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦0";

    // Convert to number if it's a string
    const numPrice = typeof price === "string" ? parseFloat(price) : price;

    if (numPrice >= 1000000) {
      const formatted = (numPrice / 1000000).toFixed(1);
      return formatted.endsWith(".0")
        ? `₦${formatted.slice(0, -2)}M`
        : `₦${formatted}M`;
    }

    if (numPrice >= 1000) {
      const formatted = (numPrice / 1000).toFixed(1);
      return formatted.endsWith(".0")
        ? `₦${formatted.slice(0, -2)}k`
        : `₦${formatted}k`;
    }

    return `₦${numPrice.toLocaleString()}`;
  };

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch bookings data with all fields
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .order("check_in_date", { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch rooms data
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("*");

      if (roomsError) throw roomsError;

      // Fetch users count
      const { count: usersCount, error: usersError } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      if (usersError) throw usersError;

      // Process rooms data to get room type options
      const roomCategories = roomsData?.map((room) => room.room_category) || [];
      const uniqueRoomTypes = [...new Set(roomCategories)].filter(Boolean);
      const updatedRoomTypeOptions = ["all", ...uniqueRoomTypes];
      setRoomTypeOptions(updatedRoomTypeOptions);

      // Create a map for quick room lookup by room_number
      const roomMap = {};
      roomsData?.forEach((room) => {
        roomMap[room.room_number] = room;
      });

      // Join bookings with room data
      const enrichedBookings =
        bookingsData?.map((booking) => ({
          ...booking,
          room_details: roomMap[booking.room_number] || null,
        })) || [];

      setAllBookings(enrichedBookings);
      setBookings(enrichedBookings.slice(0, 10)); // Show only 10 initially for dashboard
      setRooms(roomsData || []);

      // Calculate statistics based on time period
      const statsData = calculateStatistics(
        enrichedBookings,
        usersCount,
        timePeriod,
        roomsData
      );
      setStats(statsData);

      // Calculate revenue trend
      const trendData = calculateRevenueTrend(enrichedBookings, chartTimeFrame);
      setRevenueTrend(trendData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, timePeriod, chartTimeFrame]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch revenue trend when chart time frame changes
  useEffect(() => {
    if (allBookings.length > 0) {
      const trendData = calculateRevenueTrend(allBookings, chartTimeFrame);
      setRevenueTrend(trendData);
    }
  }, [chartTimeFrame, allBookings]);

  // Handle filters and search
  useEffect(() => {
    if (allBookings.length === 0) return;

    let filtered = [...allBookings];

    if (searchQuery) {
      filtered = filtered.filter(
        (booking) =>
          booking.guest_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          booking.guest_email
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          booking.booking_id
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          booking.room_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (booking) => booking.booking_status === selectedStatus
      );
    }

    if (selectedRoomType !== "all") {
      filtered = filtered.filter(
        (booking) => booking.room_category === selectedRoomType
      );
    }

    if (selectedPaymentStatus !== "all") {
      filtered = filtered.filter(
        (booking) => booking.payment_status === selectedPaymentStatus
      );
    }

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((booking) => {
        try {
          const checkIn = parseISO(booking.check_in_date);
          const start = parseISO(dateRange.start);
          const end = parseISO(dateRange.end);
          if (!isValid(checkIn) || !isValid(start) || !isValid(end))
            return false;
          return checkIn >= start && checkIn <= end;
        } catch {
          return false;
        }
      });
    }

    filtered.sort((a, b) => {
      if (sortBy === "check_in_date") {
        try {
          const dateA = parseISO(a.check_in_date);
          const dateB = parseISO(b.check_in_date);
          if (!isValid(dateA) || !isValid(dateB)) return 0;
          return sortOrder === "desc"
            ? dateB.getTime() - dateA.getTime()
            : dateA.getTime() - dateB.getTime();
        } catch {
          return 0;
        }
      }
      if (sortBy === "total_amount") {
        return sortOrder === "desc"
          ? (b.total_amount || 0) - (a.total_amount || 0)
          : (a.total_amount || 0) - (b.total_amount || 0);
      }
      if (sortBy === "guest_name") {
        return sortOrder === "desc"
          ? (b.guest_name || "").localeCompare(a.guest_name || "")
          : (a.guest_name || "").localeCompare(b.guest_name || "");
      }
      return 0;
    });

    setBookings(filtered.slice(0, 5)); // Limit to 10 for dashboard view
  }, [
    searchQuery,
    selectedStatus,
    selectedRoomType,
    selectedPaymentStatus,
    dateRange,
    sortBy,
    sortOrder,
    allBookings,
  ]);

  const calculateStatistics = (bookingsData, usersCount, period, roomsData) => {
    if (!bookingsData || bookingsData.length === 0) {
      return {
        totalBookings: 0,
        activeStays: 0,
        totalRevenue: 0,
        occupancyRate: 0,
        totalUsers: usersCount || 0,
        averageBookingValue: 0,
        avgStayDuration: 0,
        topRoomType: "N/A",
      };
    }

    const now = new Date();
    let filteredBookings = bookingsData;

    // Filter by time period
    if (period !== "all") {
      filteredBookings = filterBookingsByPeriod(bookingsData, period);
    }

    // Calculate totals
    const totalBookings = filteredBookings.length;
    const totalRevenue = filteredBookings.reduce(
      (sum, booking) => sum + (booking.total_amount || 0),
      0
    );
    const averageBookingValue =
      totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Calculate active stays (bookings with check-in date <= now <= check-out date)
    const activeStays = filteredBookings.filter((booking) => {
      try {
        const checkIn = parseISO(booking.check_in_date);
        const checkOut = parseISO(booking.check_out_date);
        return (
          isValid(checkIn) &&
          isValid(checkOut) &&
          checkIn <= now &&
          now <= checkOut
        );
      } catch {
        return false;
      }
    }).length;

    // Calculate average stay duration
    const totalNights = filteredBookings.reduce(
      (sum, booking) => sum + (booking.no_of_nights || 0),
      0
    );
    const avgStayDuration =
      totalBookings > 0 ? (totalNights / totalBookings).toFixed(1) : 0;

    // Calculate occupancy rate
    const totalRooms = roomsData?.length || 50;
    const occupancyRate = Math.round((activeStays / totalRooms) * 100);

    // Find top room type
    const roomTypeCounts = {};
    filteredBookings.forEach((booking) => {
      const roomType = booking.room_category || "Unknown";
      roomTypeCounts[roomType] = (roomTypeCounts[roomType] || 0) + 1;
    });

    let topRoomType = "N/A";
    let maxCount = 0;
    Object.entries(roomTypeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topRoomType = type;
      }
    });

    return {
      totalBookings,
      activeStays,
      totalRevenue,
      occupancyRate,
      totalUsers: usersCount || 0,
      averageBookingValue,
      avgStayDuration: parseFloat(avgStayDuration),
      topRoomType,
    };
  };

  const calculateRevenueTrend = (bookingsData, timeFrame) => {
    if (!bookingsData || bookingsData.length === 0) {
      return [];
    }

    const now = new Date();
    let startDate = new Date();
    let groupFormat = "";

    // Determine date range based on time frame
    switch (timeFrame) {
      case "week":
        startDate = subDays(now, 30); // Show last 30 days for weekly view
        groupFormat = "MMM dd";
        break;
      case "month":
        startDate = subMonths(now, 12);
        groupFormat = "MMM yyyy";
        break;
      case "year":
        startDate = subMonths(now, 60); // 5 years
        groupFormat = "yyyy";
        break;
      case "all":
        // Use earliest booking date
        const earliestDate = new Date(
          Math.min(...bookingsData.map((b) => new Date(b.created_at).getTime()))
        );
        startDate = earliestDate;
        groupFormat = "yyyy";
        break;
      default:
        startDate = subMonths(now, 12);
        groupFormat = "MMM yyyy";
    }

    // Filter bookings within date range
    const filteredBookings = bookingsData.filter((booking) => {
      try {
        const bookingDate = parseISO(booking.created_at);
        return isValid(bookingDate) && bookingDate >= startDate;
      } catch {
        return false;
      }
    });

    // Group by time period
    const revenueMap = {};
    filteredBookings.forEach((booking) => {
      try {
        const bookingDate = parseISO(booking.created_at);
        if (!isValid(bookingDate)) return;

        let periodKey;
        switch (timeFrame) {
          case "week":
            periodKey = format(bookingDate, "yyyy-'W'ww");
            break;
          case "month":
            periodKey = format(bookingDate, "yyyy-MM");
            break;
          case "year":
          case "all":
            periodKey = format(bookingDate, "yyyy");
            break;
          default:
            periodKey = format(bookingDate, "yyyy-MM");
        }

        const displayKey = format(bookingDate, groupFormat);

        if (!revenueMap[periodKey]) {
          revenueMap[periodKey] = {
            period: displayKey,
            revenue: 0,
            bookings: 0,
          };
        }

        revenueMap[periodKey].revenue += booking.total_amount || 0;
        revenueMap[periodKey].bookings += 1;
      } catch (error) {
        console.error("Error processing booking date:", error);
      }
    });

    // Convert to array and sort
    return Object.values(revenueMap)
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-12); // Show last 12 periods
  };

  const filterBookingsByPeriod = (bookingsData, period) => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case "today":
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case "week":
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case "month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "year":
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        return bookingsData;
    }

    return bookingsData.filter((booking) => {
      try {
        const bookingDate = parseISO(booking.created_at);
        if (!isValid(bookingDate)) return false;
        return bookingDate >= startDate && bookingDate <= endDate;
      } catch {
        return false;
      }
    });
  };

  const toggleBookingExpansion = (id) => {
    setExpandedBooking(expandedBooking === id ? null : id);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // View booking details
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  // Edit booking
  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setEditFormData({
      guest_name: booking.guest_name,
      guest_email: booking.guest_email,
      guest_phone: booking.guest_phone,
      room_number: booking.room_number,
      check_in_date: format(parseISO(booking.check_in_date), "yyyy-MM-dd"),
      check_out_date: format(parseISO(booking.check_out_date), "yyyy-MM-dd"),
      no_of_guests: booking.no_of_guests,
      booking_status: booking.booking_status,
      payment_status: booking.payment_status,
      special_requests: booking.special_requests || "",
    });
    setShowEditModal(true);
  };

  // Save edited booking
  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          ...editFormData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedBooking.id);

      if (error) throw error;

      alert("Booking updated successfully!");
      setShowEditModal(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking");
    }
  };

  // Delete booking
  const handleDeleteBooking = async (bookingId) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);

      if (error) throw error;

      alert("Booking deleted successfully!");
      setShowDeleteModal(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking");
    }
  };

  // Print invoice
  const handlePrintInvoice = (booking) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${booking.booking_id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .invoice-header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            .invoice-items { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .invoice-items th, .invoice-items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>INVOICE</h1>
            <p>Booking ID: ${booking.booking_id}</p>
            <p>Date: ${format(new Date(), "MMM dd, yyyy")}</p>
          </div>
          <div class="invoice-details">
            <h3>Guest Information</h3>
            <p>Name: ${booking.guest_name}</p>
            <p>Email: ${booking.guest_email}</p>
            <p>Phone: ${booking.guest_phone}</p>
          </div>
          <table class="invoice-items">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Room ${booking.room_number} - ${booking.room_category} (${
      booking.no_of_nights
    } nights)</td>
                <td>${formatPrice(booking.total_amount)}</td>
              </tr>
              <tr class="total">
                <td>Total</td>
                <td>${formatPrice(booking.total_amount)}</td>
              </tr>
            </tbody>
          </table>
          <p>Payment Status: ${booking.payment_status}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Send email
  const handleSendEmail = (booking) => {
    const subject = `Your Booking Confirmation - ${booking.booking_id}`;
    const body = `Dear ${booking.guest_name},

Thank you for your booking with us!

Booking Details:
- Booking ID: ${booking.booking_id}
- Room: ${booking.room_number} (${booking.room_category})
- Check-in: ${format(parseISO(booking.check_in_date), "MMM dd, yyyy")}
- Check-out: ${format(parseISO(booking.check_out_date), "MMM dd, yyyy")}
- Total Amount: ${formatPrice(booking.total_amount)}
- Payment Status: ${booking.payment_status}

We look forward to welcoming you!

Best regards,
Hotel Management`;

    window.location.href = `mailto:${
      booking.guest_email
    }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const StatusBadge = ({ status }) => {
    const config = {
      confirmed: {
        color: "bg-emerald-900/40 border-emerald-700 text-emerald-300",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      pending: {
        color: "bg-amber-900/40 border-amber-700 text-amber-300",
        icon: <Clock className="w-4 h-4" />,
      },
      cancelled: {
        color: "bg-red-900/40 border-red-700 text-red-300",
        icon: <XCircle className="w-4 h-4" />,
      },
      "checked-in": {
        color: "bg-blue-900/40 border-blue-700 text-blue-300",
        icon: <User className="w-4 h-4" />,
      },
      "checked-out": {
        color: "bg-purple-900/40 border-purple-700 text-purple-300",
        icon: <Calendar className="w-4 h-4" />,
      },
    };

    const { color, icon } = config[status] || config.pending;

    return (
      <div
        className={`${color} px-3 py-1.5 rounded-lg border flex items-center gap-2 w-fit`}
      >
        {icon}
        <span className="text-sm font-medium capitalize text-white">
          {status}
        </span>
      </div>
    );
  };

  const PaymentStatusBadge = ({ status, amount, total }) => {
    const config = {
      paid: {
        color: "bg-emerald-900/40 border-emerald-700 text-emerald-300",
        label: "Paid",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      pending: {
        color: "bg-amber-900/40 border-amber-700 text-amber-300",
        label: "Pending",
        icon: <Clock className="w-4 h-4" />,
      },
      partial: {
        color: "bg-blue-900/40 border-blue-700 text-blue-300",
        label: "Partial",
        icon: <FaNairaSign className="w-4 h-4" />,
      },
      refunded: {
        color: "bg-gray-800 border-gray-700 text-gray-300",
        label: "Refunded",
        icon: <CreditCard className="w-4 h-4" />,
      },
    };

    const { color, label, icon } = config[status] || config.pending;

    return (
      <div
        className={`${color} px-3 py-1.5 rounded-lg border flex items-center gap-2`}
      >
        {icon}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">{label}</span>
          {status === "partial" && (
            <span className="text-xs text-gray-300">
              {formatPrice(amount)} of {formatPrice(total)}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Booking Modal Component
  const BookingModal = () => {
    if (!selectedBooking) return null;

    const formatDate = (dateString) => {
      try {
        return format(parseISO(dateString), "MMM dd, yyyy");
      } catch {
        return "Invalid date";
      }
    };

    const roomImages =
      selectedBooking.room_details?.room_image ||
      selectedBooking.room_image ||
      [];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Booking Details
                </h2>
                <p className="text-gray-400">
                  Booking ID: {selectedBooking.booking_id}
                </p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Guest & Booking Info */}
              <div className="space-y-6">
                {/* Guest Information */}
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Guest Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">Full Name</p>
                      <p className="text-white">{selectedBooking.guest_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">
                        {selectedBooking.guest_email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="text-white">
                        {selectedBooking.guest_phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Booking Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Check-in</p>
                      <p className="text-white">
                        {formatDate(selectedBooking.check_in_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Check-out</p>
                      <p className="text-white">
                        {formatDate(selectedBooking.check_out_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Nights</p>
                      <p className="text-white">
                        {selectedBooking.no_of_nights}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Guests</p>
                      <p className="text-white">
                        {selectedBooking.no_of_guests}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Status
                  </h3>
                  <div className="space-y-4">
                    <StatusBadge status={selectedBooking.booking_status} />
                    <PaymentStatusBadge
                      status={selectedBooking.payment_status}
                      amount={selectedBooking.paid_amount || 0}
                      total={selectedBooking.total_amount || 0}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Room & Payment Info */}
              <div className="space-y-6">
                {/* Room Information */}
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Room Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">Room Number</p>
                      <p className="text-white text-lg font-semibold">
                        {selectedBooking.room_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Room Type</p>
                      <p className="text-white">
                        {selectedBooking.room_category}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Room Title</p>
                      <p className="text-white">
                        {selectedBooking.room_details?.room_title ||
                          selectedBooking.room_title ||
                          "N/A"}
                      </p>
                    </div>
                    {roomImages.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">
                          Room Images
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {roomImages.slice(0, 4).map((img, index) => (
                            <div
                              key={index}
                              className="aspect-square rounded-lg overflow-hidden bg-gray-800"
                            >
                              <Image
                                width={100}
                                height={100}
                                src={img}
                                alt={`Room ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Payment Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <p className="text-gray-400">Room Rate</p>
                      <p className="text-white">
                        {formatPrice(selectedBooking.price_per_night)}/night
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-400">Total Nights</p>
                      <p className="text-white">
                        {selectedBooking.no_of_nights}
                      </p>
                    </div>
                    <div className="flex justify-between border-t border-gray-700 pt-3">
                      <p className="text-gray-400">Total Amount</p>
                      <p className="text-white text-xl font-bold">
                        {formatPrice(selectedBooking.total_amount)}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-400">Currency</p>
                      <p className="text-white">
                        {selectedBooking.currency || "USD"}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-400">Payment Method</p>
                      <p className="text-white">
                        {selectedBooking.payment_method || "N/A"}
                      </p>
                    </div>
                    {selectedBooking.payment_reference && (
                      <div className="flex justify-between">
                        <p className="text-gray-400">Payment Reference</p>
                        <p className="text-white text-sm">
                          {selectedBooking.payment_reference}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.special_requests && (
                  <div className="bg-gray-900/50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Special Requests
                    </h3>
                    <p className="text-gray-300">
                      {selectedBooking.special_requests}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={() => handleEditBooking(selectedBooking)}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Booking
              </button>
              <button
                onClick={() => handlePrintInvoice(selectedBooking)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </button>
              <button
                onClick={() => handleSendEmail(selectedBooking)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </button>
              <button
                onClick={() => {
                  setBookingToDelete(selectedBooking);
                  setShowDeleteModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 border border-red-600 hover:bg-red-700/50 text-red-400 hover:text-white rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Booking
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Booking Modal
  const EditBookingModal = () => {
    if (!selectedBooking) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Booking</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.guest_name || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        guest_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Guest Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.guest_email || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        guest_email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Guest Phone
                  </label>
                  <input
                    type="tel"
                    value={editFormData.guest_phone || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        guest_phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    value={editFormData.no_of_guests || 1}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        no_of_guests: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.check_in_date || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        check_in_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.check_out_date || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        check_out_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Booking Status
                  </label>
                  <select
                    value={editFormData.booking_status || "pending"}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        booking_status: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="checked-in">Checked In</option>
                    <option value="checked-out">Checked Out</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={editFormData.payment_status || "pending"}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        payment_status: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Special Requests
                </label>
                <textarea
                  value={editFormData.special_requests || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      special_requests: e.target.value,
                    })
                  }
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => {
    if (!bookingToDelete) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <h2 className="text-xl font-bold text-white">Delete Booking</h2>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete booking{" "}
              <span className="font-semibold text-white">
                {bookingToDelete.booking_id}
              </span>{" "}
              for{" "}
              <span className="font-semibold text-white">
                {bookingToDelete.guest_name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setBookingToDelete(null);
                }}
                className="px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBooking(bookingToDelete.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BookingCard = ({ booking }) => {
    const room = booking.room_details || {};
    const guestInitials = booking.guest_name
      ? booking.guest_name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "GU";

    const formatDate = (dateString) => {
      try {
        return format(parseISO(dateString), "MMM dd, yyyy");
      } catch {
        return "Invalid date";
      }
    };

    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-sky-500/50 transition-all duration-300">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-600 to-sky-700 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {guestInitials}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {booking.guest_name || "Unknown Guest"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {booking.booking_id || `BK-${booking.id}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={booking.booking_status} />
              <button
                onClick={() => toggleBookingExpansion(booking.id)}
                className="p-2 cursor-pointer hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                {expandedBooking === booking.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-400">Room</div>
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-sky-400" />
                <span className="font-medium text-white">
                  {booking.room_number || "N/A"}
                </span>
                <span className="text-sm text-gray-400">
                  ({booking.room_category || "Unknown"})
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-400">Stay</div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="font-medium text-white">
                    {booking.no_of_nights || 0} nights
                  </span>
                  <div className="text-xs text-gray-400">
                    {formatDate(booking.check_in_date)} →{" "}
                    {formatDate(booking.check_out_date)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-400">Guests</div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span className="font-medium text-white">
                  {booking.no_of_guests || 1} guests
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-400">Amount</div>
              <div className="flex items-center gap-2">
                <FaNairaSign className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-lg text-white">
                  {formatPrice(booking.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {expandedBooking === booking.id && (
            <div className="mt-6 pt-6 border-t border-gray-700 space-y-4 animate-in slide-in-from-top-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Guest Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {booking.guest_email || "No email provided"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {booking.guest_phone || "No phone provided"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        Booked on {formatDate(booking.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Payment Details</h4>
                  <PaymentStatusBadge
                    status={booking.payment_status}
                    amount={booking.paid_amount || 0}
                    total={booking.total_amount || 0}
                  />
                  {booking.special_requests && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-300 mb-1">
                        Special Requests
                      </h5>
                      <p className="text-sm text-gray-400 bg-gray-900/50 p-3 rounded-lg">
                        {booking.special_requests}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => handleViewBooking(booking)}
                  className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => handleEditBooking(booking)}
                  className="flex items-center cursor-pointer gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Booking
                </button>
                <button
                  onClick={() => handlePrintInvoice(booking)}
                  className="flex items-center cursor-pointer gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Invoice
                </button>
                <button
                  onClick={() => handleSendEmail(booking)}
                  className="flex items-center cursor-pointer gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </button>
                <button
                  onClick={() => {
                    setBookingToDelete(booking);
                    setShowDeleteModal(true);
                  }}
                  className="flex items-center cursor-pointer gap-2 px-4 py-2 border border-red-600 hover:bg-red-700/50 text-red-400 hover:text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Revenue Trend Chart Component
  const RevenueTrendChart = () => {
    if (revenueTrend.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No revenue data available for the selected period
        </div>
      );
    }

    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-sm text-gray-400">Revenue Trend</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-400">
                {formatPrice(stats.totalRevenue)}
              </span>
              <span className="text-sm text-emerald-400">total</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Time Frame:</span>
            <select
              value={chartTimeFrame}
              onChange={(e) => setChartTimeFrame(e.target.value)}
              className="px-3 py-1.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm"
            >
              {chartTimeFrames.map((frame) => (
                <option key={frame.id} value={frame.id}>
                  {frame.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#9CA3AF" fontSize={12} />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => formatPrice(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  borderColor: "#4B5563",
                  color: "white",
                }}
                formatter={(value) => [formatPrice(value), "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ stroke: "#10B981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen  bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading bookings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white">
      {/* Modals */}
      {showBookingModal && <BookingModal />}
      {showEditModal && <EditBookingModal />}
      {showDeleteModal && <DeleteConfirmationModal />}

      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 cursor-pointer hover:bg-gray-800/50 rounded-xl transition-colors lg:hidden"
              >
                {" "}
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
          <div className=" w-full pb-7">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6">
              {/* Left */}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Admin Management Dashboard
                </h1>
                <p className="text-sm text-gray-400">
                  Manage and track all hotel bookings
                </p>
              </div>

              {/* Right */}
              <div className="flex lg:justify-end items-center gap-4">
                {/* View All Bookings Button */}
                <Link
                  href="/admin/bookings"
                  className="flex items-center gap-2 px-5 text-[14px] py-3 bg-linear-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  <Eye className="w-5 h-5" />
                  View All Bookings
                </Link>

                {/* Check Availability Button */}
                <Link
                  href="/admin/room-availability"
                  className="flex items-center gap-2 text-[14px] px-5 py-3 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  <CalendarCheck className="w-5 h-5" />
                  Check Availability
                </Link>

                {/* Book Room Button */}
                <Link
                  href="/admin/book-a-room"
                  className="flex items-center text-[14px] gap-2 px-5 py-3 bg-linear-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Book a Room
                </Link>
              </div>
            </div>
          </div>

          {/* Time Period Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Performance Overview
              </h2>
              <div className="flex items-center gap-2">
                {timePeriods.map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setTimePeriod(period.id)}
                    className={`px-4 py-2 cursor-pointer rounded-lg font-medium transition-all ${
                      timePeriod === period.id
                        ? "bg-sky-600 text-white"
                        : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: "Total Bookings",
                value: stats.totalBookings.toString(),
                change: "+12%",
                icon: <Calendar className="w-6 h-6" />,
                color: "text-sky-400",
              },
              {
                label: "Active Stays",
                value: stats.activeStays.toString(),
                change: "+3",
                icon: <User className="w-6 h-6" />,
                color: "text-emerald-400",
              },
              {
                label: "Total Revenue",
                value: formatPrice(stats.totalRevenue),
                change: "+8%",
                icon: <FaNairaSign className="w-6 h-6" />,
                color: "text-amber-400",
              },
              {
                label: "Occupancy Rate",
                value: `${stats.occupancyRate}%`,
                change: "+4%",
                icon: <Hotel className="w-6 h-6" />,
                color: "text-purple-400",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gray-900/30`}>
                    <div className={stat.color}>{stat.icon}</div>
                  </div>
                  <span className="text-sm font-medium text-emerald-400">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue Trend & Additional Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Trend Card */}
            <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <RevenueTrendChart />
            </div>

            {/* Additional Stats Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Quick Stats</h3>
                <Activity className="w-5 h-5 text-sky-400" />
              </div>
              <div className="space-y-4">
                {[
                  {
                    label: "Total Users",
                    value: stats.totalUsers.toString(),
                    icon: <Users className="w-4 h-4" />,
                  },
                  {
                    label: "Avg. Booking Value",
                    value: formatPrice(stats.averageBookingValue),
                    icon: <FaNairaSign className="w-4 h-4" />,
                  },
                  {
                    label: "Avg. Stay Duration",
                    value: `${stats.avgStayDuration} nights`,
                    icon: <CalendarDays className="w-4 h-4" />,
                  },
                  {
                    label: "Top Room Type",
                    value: stats.topRoomType,
                    icon: <Bed className="w-4 h-4" />,
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400">{stat.icon}</div>
                      <span className="text-sm text-gray-300">
                        {stat.label}
                      </span>
                    </div>
                    <span className="font-medium text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filters & Search Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by guest name, email, booking ID, or room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white placeholder-gray-500"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-lg cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-sky-900/30 text-sky-400"
                      : "text-gray-400 hover:bg-gray-700/50"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-lg cursor-pointer ${
                    viewMode === "list"
                      ? "bg-sky-900/30 text-sky-400"
                      : "text-gray-400 hover:bg-gray-700/50"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Export Button */}
              <button className="flex items-center cursor-pointer gap-2 px-4 py-3 border border-gray-600 hover:bg-gray-700/50 rounded-xl transition-colors text-white">
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
            </div>

            {/* Advanced Filters */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Booking Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                  >
                    {statusOptions.map((status) => (
                      <option
                        key={status}
                        value={status}
                        className="bg-gray-900 text-white capitalize"
                      >
                        {status === "all" ? "All Statuses" : status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Room Type
                  </label>
                  <select
                    value={selectedRoomType}
                    onChange={(e) => setSelectedRoomType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                  >
                    {roomTypeOptions.map((type) => (
                      <option
                        key={type}
                        value={type}
                        className="bg-gray-900 text-white capitalize"
                      >
                        {type === "all" ? "All Room Types" : type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                  >
                    {paymentStatusOptions.map((status) => (
                      <option
                        key={status}
                        value={status}
                        className="bg-gray-900 text-white capitalize"
                      >
                        {status === "all" ? "All Payments" : status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Check-in Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                      className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                      className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Sort & Actions */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">
                    Showing {bookings.length} of {allBookings.length} bookings
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Sort by:</span>
                    <button
                      onClick={() => handleSort("check_in_date")}
                      className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer ${
                        sortBy === "check_in_date"
                          ? "bg-sky-900/30 text-sky-400"
                          : "text-gray-400 hover:bg-gray-700/50"
                      }`}
                    >
                      Check-in Date{" "}
                      {sortBy === "check_in_date" &&
                        (sortOrder === "desc" ? "↓" : "↑")}
                    </button>
                    <button
                      onClick={() => handleSort("total_amount")}
                      className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer ${
                        sortBy === "total_amount"
                          ? "bg-sky-900/30 text-sky-400"
                          : "text-gray-400 hover:bg-gray-700/50"
                      }`}
                    >
                      Amount{" "}
                      {sortBy === "total_amount" &&
                        (sortOrder === "desc" ? "↓" : "↑")}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedStatus("all");
                      setSelectedRoomType("all");
                      setSelectedPaymentStatus("all");
                      setDateRange({ start: "", end: "" });
                    }}
                    className="flex cursor-pointer items-center gap-2 px-4 py-2.5 border border-gray-600 hover:bg-gray-700/50 rounded-xl transition-colors text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Clear Filters
                  </button>
                  <button
                    onClick={fetchData}
                    className="flex cursor-pointer items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List/Grid */}
          <div>
            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your filters or create a new booking
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link
                    href="/admin/book-room"
                    className="px-6 py-3 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Create New Booking
                  </Link>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedStatus("all");
                      setSelectedRoomType("all");
                      setSelectedPaymentStatus("all");
                      setDateRange({ start: "", end: "" });
                    }}
                    className="px-6 py-3 cursor-pointer border border-gray-600 hover:bg-gray-700/50 text-white rounded-xl font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}

                {/* View All Link */}
                <div className="text-center mt-8">
                  <Link
                    href="/admin/all-bookings"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View All Bookings ({allBookings.length})
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-5 hover:border-sky-500/50 transition-all duration-300"
                  >
                    {/* Simplified grid view card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-sky-600 to-sky-700 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {booking.guest_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "GU"}
                      </div>
                      <StatusBadge status={booking.booking_status} />
                    </div>
                    <h3 className="font-bold text-white mb-1">
                      {booking.guest_name || "Unknown Guest"}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      {booking.booking_id || `BK-${booking.id}`}
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Room</span>
                        <span className="font-medium text-white">
                          {booking.room_number || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Amount</span>
                        <span className="font-bold text-emerald-400">
                          {formatPrice(booking.total_amount)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewBooking(booking)}
                      className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}

                {/* View All Link */}
                <div className="col-span-full text-center mt-8">
                  <Link
                    href="/admin/all-bookings"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View All Bookings ({allBookings.length})
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
