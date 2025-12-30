"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
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
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  X,
  Trash2,
  AlertCircle,
  BarChart,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/app/_components/admin/Sidebar";
import supabase from "../../lib/supabase";
import {
  format,
  subDays,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
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
  BarChart as RechartsBarChart,
  Bar,
} from "recharts";
import { FaNairaSign } from "react-icons/fa6";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Chart time frame options
const chartTimeFrames = [
  { id: "week", label: "Weekly", groupBy: "week" },
  { id: "month", label: "Monthly", groupBy: "month" },
  { id: "year", label: "Yearly", groupBy: "year" },
  { id: "all", label: "All Time", groupBy: "year" },
];

// Time period options
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search
  const [searchTimeout, setSearchTimeout] = useState(null);

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

  // Fetch all data
  const fetchData = useCallback(
    async (searchTerm = searchQuery) => {
      try {
        setLoading(true);

        // Fetch bookings data with pagination
        let query = supabase.from("bookings").select("*", { count: "exact" });

        // Apply filters
        if (searchTerm) {
          query = query.or(
            `guest_name.ilike.%${searchTerm}%,guest_email.ilike.%${searchTerm}%,booking_id.ilike.%${searchTerm}%,room_number.ilike.%${searchTerm}%`
          );
        }

        if (selectedStatus !== "all") {
          query = query.eq("booking_status", selectedStatus);
        }

        if (selectedPaymentStatus !== "all") {
          query = query.eq("payment_status", selectedPaymentStatus);
        }

        if (dateRange.start && dateRange.end) {
          query = query
            .gte("check_in_date", dateRange.start)
            .lte("check_in_date", dateRange.end);
        }

        // Apply sorting
        if (sortBy === "check_in_date") {
          query = query.order("check_in_date", {
            ascending: sortOrder === "asc",
          });
        } else if (sortBy === "total_amount") {
          query = query.order("total_amount", {
            ascending: sortOrder === "asc",
          });
        } else if (sortBy === "guest_name") {
          query = query.order("guest_name", { ascending: sortOrder === "asc" });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        // Apply pagination
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        query = query.range(from, to);

        const { data: bookingsData, error: bookingsError, count } = await query;

        if (bookingsError) throw bookingsError;

        setTotalItems(count || 0);

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
        const roomCategories =
          roomsData?.map((room) => room.room_category) || [];
        const uniqueRoomTypes = [...new Set(roomCategories)].filter(Boolean);
        const updatedRoomTypeOptions = ["all", ...uniqueRoomTypes];
        setRoomTypeOptions(updatedRoomTypeOptions);

        // Create a map for quick room lookup by room_number
        const roomMap = {};
        roomsData?.forEach((room) => {
          roomMap[room.room_number] = room;
        });

        // Filter by room type if selected
        let filteredBookings = bookingsData || [];
        if (selectedRoomType !== "all") {
          filteredBookings = filteredBookings.filter(
            (booking) =>
              roomMap[booking.room_number]?.room_category === selectedRoomType
          );
        }

        // Join bookings with room data
        const enrichedBookings =
          filteredBookings?.map((booking) => ({
            ...booking,
            room_details: roomMap[booking.room_number] || null,
          })) || [];

        setBookings(enrichedBookings);
        setRooms(roomsData || []);

        // Calculate statistics based on all bookings (not just current page)
        const allBookingsQuery = supabase.from("bookings").select("*");

        const { data: allBookingsData, error: allBookingsError } =
          await allBookingsQuery;

        if (!allBookingsError && allBookingsData) {
          const allEnrichedBookings = allBookingsData.map((booking) => ({
            ...booking,
            room_details: roomMap[booking.room_number] || null,
          }));

          const statsData = calculateStatistics(
            allEnrichedBookings,
            usersCount,
            timePeriod,
            roomsData
          );
          setStats(statsData);

          // Calculate revenue trend
          const trendData = calculateRevenueTrend(
            allEnrichedBookings,
            chartTimeFrame
          );
          setRevenueTrend(trendData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    },
    [
      supabase,
      selectedStatus,
      selectedRoomType,
      selectedPaymentStatus,
      dateRange,
      sortBy,
      sortOrder,
      currentPage,
      itemsPerPage,
      timePeriod,
      chartTimeFrame,
    ]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to page 1 when filters change (except search)
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedStatus,
    selectedRoomType,
    selectedPaymentStatus,
    dateRange,
    sortBy,
    sortOrder,
  ]);

  // Handle search with debounce
  const handleSearchChange = (value) => {
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout
    const newTimeout = setTimeout(() => {
      setCurrentPage(1);
      fetchData(value);
    }, 500); // 500ms delay

    setSearchTimeout(newTimeout);
  };

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

    // Filter by time period if needed
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
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);
        return checkIn <= now && now <= checkOut;
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
      const roomType = booking.room_details?.room_category || "Unknown";
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
        const bookingDate = new Date(
          booking.created_at || booking.check_in_date
        );
        return bookingDate >= startDate && bookingDate <= endDate;
      } catch {
        return false;
      }
    });
  };

  const calculateRevenueTrend = (bookingsData, timeFrame) => {
    if (!bookingsData || bookingsData.length === 0) {
      return [];
    }

    const now = new Date();
    let startDate = new Date();
    let groupFormat = "";
    let intervalFn = eachDayOfInterval;

    // Determine date range based on time frame
    switch (timeFrame) {
      case "week":
        startDate = subDays(now, 30); // Show last 30 days for weekly view
        groupFormat = "MMM dd";
        intervalFn = eachDayOfInterval;
        break;
      case "month":
        startDate = subMonths(now, 12);
        groupFormat = "MMM yyyy";
        intervalFn = eachMonthOfInterval;
        break;
      case "year":
        startDate = subYears(now, 5); // 5 years
        groupFormat = "yyyy";
        intervalFn = eachMonthOfInterval;
        break;
      case "all":
        // Use earliest booking date
        const earliestDate = new Date(
          Math.min(...bookingsData.map((b) => new Date(b.created_at).getTime()))
        );
        startDate = earliestDate;
        groupFormat = "yyyy";
        intervalFn = eachMonthOfInterval;
        break;
      default:
        startDate = subMonths(now, 12);
        groupFormat = "MMM yyyy";
        intervalFn = eachMonthOfInterval;
    }

    // Create date intervals
    const dateIntervals = intervalFn({ start: startDate, end: now });

    // Initialize revenue map with all dates
    const revenueMap = new Map();
    dateIntervals.forEach((date) => {
      const key = format(date, groupFormat);
      if (!revenueMap.has(key)) {
        revenueMap.set(key, { period: key, revenue: 0, bookings: 0 });
      }
    });

    // Add booking revenues
    bookingsData.forEach((booking) => {
      try {
        const bookingDate = new Date(
          booking.created_at || booking.check_in_date
        );
        const periodKey = format(bookingDate, groupFormat);

        if (revenueMap.has(periodKey)) {
          const current = revenueMap.get(periodKey);
          revenueMap.set(periodKey, {
            ...current,
            revenue: current.revenue + (booking.total_amount || 0),
            bookings: current.bookings + 1,
          });
        }
      } catch (error) {
        console.error("Error processing booking date:", error);
      }
    });

    // Convert to array and sort
    return Array.from(revenueMap.values())
      .sort((a, b) => new Date(a.period) - new Date(b.period))
      .slice(-12); // Show last 12 periods
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
      guest_phone: booking.guest_phone || "",
      room_number: booking.room_number,
      room_category: booking.room_category,
      check_in_date: format(new Date(booking.check_in_date), "yyyy-MM-dd"),
      check_out_date: format(new Date(booking.check_out_date), "yyyy-MM-dd"),
      no_of_guests: booking.no_of_guests,
      booking_status: booking.booking_status,
      payment_status: booking.payment_status,
      special_requests: booking.special_requests || "",
      total_amount: booking.total_amount,
      price_per_night: booking.price_per_night,
    });
    setShowEditModal(true);
  };

  // Save edited booking
  const handleSaveEdit = async () => {
    try {
      // Calculate number of nights
      const checkIn = new Date(editFormData.check_in_date);
      const checkOut = new Date(editFormData.check_out_date);
      const no_of_nights = Math.ceil(
        (checkOut - checkIn) / (1000 * 60 * 60 * 24)
      );

      const updateData = {
        ...editFormData,
        no_of_nights: no_of_nights,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("bookings")
        .update(updateData)
        .eq("id", selectedBooking.id);

      if (error) throw error;

      alert("Booking updated successfully!");
      setShowEditModal(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking: " + error.message);
    }
  };

  // Delete booking
  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingToDelete.id);

      if (error) throw error;

      alert("Booking deleted successfully!");
      setShowDeleteModal(false);
      setBookingToDelete(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking: " + error.message);
    }
  };

  // Print invoice
  const handlePrintInvoice = (booking) => {
    const printWindow = window.open("", "_blank");
    const invoiceContent = `
      <html>
        <head>
          <title>Invoice - ${booking.booking_id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .invoice-header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #333; }
            .invoice-details { margin-bottom: 30px; }
            .invoice-details h3 { color: #333; margin-bottom: 15px; }
            .invoice-items { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .invoice-items th { background-color: #f5f5f5; padding: 12px; text-align: left; border: 1px solid #ddd; }
            .invoice-items td { padding: 12px; border: 1px solid #ddd; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            .total-amount { font-size: 20px; color: #10B981; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>Royal Moss</h1>
            <h2>${booking.booking_id}</h2>
            <p>Date: ${format(new Date(), "MMMM dd, yyyy")}</p>
          </div>
          
          <div class="invoice-details">
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
              <div>
                <h3>Hotel Information</h3>
                <p>Luxury Hotel & Resort</p>
                <p>123 Ocean View Drive</p>
                <p>Miami Beach, FL 33139</p>
                <p>Phone: (305) 555-0123</p>
              </div>
              <div>
                <h3>Guest Information</h3>
                <p><strong>${booking.guest_name}</strong></p>
                <p>${booking.guest_email}</p>
                <p>${booking.guest_phone || "N/A"}</p>
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between;">
              <div>
                <h3>Booking Details</h3>
                <p><strong>Check-in:</strong> ${format(
                  new Date(booking.check_in_date),
                  "MMMM dd, yyyy"
                )}</p>
                <p><strong>Check-out:</strong> ${format(
                  new Date(booking.check_out_date),
                  "MMMM dd, yyyy"
                )}</p>
                <p><strong>Nights:</strong> ${booking.no_of_nights}</p>
              </div>
              <div>
                <h3>Room Details</h3>
                <p><strong>Room:</strong> ${booking.room_number}</p>
                <p><strong>Type:</strong> ${booking.room_category}</p>
                <p><strong>Guests:</strong> ${booking.no_of_guests}</p>
              </div>
            </div>
          </div>

          <table class="invoice-items">
            <thead>
              <tr>
                <th>Description</th>
                <th>Rate</th>
                <th>Nights</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${booking.room_category} - Room ${booking.room_number}</td>
                <td>₦${
                  booking.price_per_night ||
                  booking.total_amount / booking.no_of_nights
                }</td>
                <td>${booking.no_of_nights}</td>
                <td>₦${booking.total_amount}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" style="text-align: right;"><strong>Total Amount:</strong></td>
                <td class="total-amount">₦${booking.total_amount}</td>
              </tr>
            </tbody>
          </table>

          <div class="invoice-details">
            <h3>Payment Information</h3>
            <p><strong>Status:</strong> ${booking.payment_status}</p>
            <p><strong>Method:</strong> ${booking.payment_method || "N/A"}</p>
            <p><strong>Reference:</strong> ${
              booking.payment_reference || "N/A"
            }</p>
            ${
              booking.special_requests
                ? `<p><strong>Special Requests:</strong> ${booking.special_requests}</p>`
                : ""
            }
          </div>

          <div class="footer">
            <p>Thank you for choosing our Royal Moss!</p>
            <p>For any questions, please contact our customer service at (305) 555-0123</p>
            <button class="no-print" onclick="window.print()" style="padding: 10px 20px; background-color: #10B981; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">Print Invoice</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceContent);
    printWindow.document.close();
  };

  // Send email
  const handleSendEmail = (booking) => {
    const subject = encodeURIComponent(
      `Your Booking Confirmation - ${booking.booking_id}`
    );
    const body = encodeURIComponent(`Dear ${booking.guest_name},

Thank you for your booking with us!

Booking Details:
- Booking ID: ${booking.booking_id}
- Room: ${booking.room_number} (${booking.room_category})
- Check-in: ${format(new Date(booking.check_in_date), "MMMM dd, yyyy")}
- Check-out: ${format(new Date(booking.check_out_date), "MMMM dd, yyyy")}
- Total Amount: ₦${booking.total_amount}
- Payment Status: ${booking.payment_status}
- Guests: ${booking.no_of_guests}

${
  booking.special_requests
    ? `Special Requests: ${booking.special_requests}\n\n`
    : "\n"
}
We look forward to welcoming you!

Best regards,
Hotel Management Team`);

    window.location.href = `mailto:${booking.guest_email}?subject=${subject}&body=${body}`;
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
              ₦{amount || 0} of ₦{total || 0}
            </span>
          )}
        </div>
      </div>
    );
  };

  const toggleBookingExpansion = (id) => {
    setExpandedBooking(expandedBooking === id ? null : id);
  };

  // Booking Modal Component
  const BookingModal = () => {
    if (!selectedBooking) return null;

    const formatDate = (dateString) => {
      try {
        return format(new Date(dateString), "MMM dd, yyyy");
      } catch {
        return "Invalid date";
      }
    };

    const roomImages =
      selectedBooking.room_details?.room_image ||
      selectedBooking.room_image ||
      [];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
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
                className="p-2 hover:bg-gray-700/50 cursor-pointer rounded-lg transition-colors"
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
                    <div>
                      <p className="text-sm text-gray-400">User ID</p>
                      <p className="text-white">
                        {selectedBooking.user_id || "N/A"}
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
                    <div>
                      <p className="text-sm text-gray-400">Created</p>
                      <p className="text-white">
                        {formatDate(selectedBooking.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Updated</p>
                      <p className="text-white">
                        {formatDate(selectedBooking.updated_at)}
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
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFmMjkzNyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyN2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSA8dHNwYW4gZHk9IjE0Ij5Ob3QgQXZhaWxhYmxlPC90c3Bhbj48L3RleHQ+PC9zdmc+";
                                }}
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
                        ₦{selectedBooking.price_per_night}/night
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
                        ₦{selectedBooking.total_amount}
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
                    {selectedBooking.payment_data && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">
                          Payment Data
                        </p>
                        <pre className="text-xs text-gray-300 bg-gray-900 p-2 rounded overflow-auto">
                          {JSON.stringify(
                            selectedBooking.payment_data,
                            null,
                            2
                          )}
                        </pre>
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
                className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Booking
              </button>
              <button
                onClick={() => handlePrintInvoice(selectedBooking)}
                className="flex items-center cursor-pointer gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </button>
              <button
                onClick={() => handleSendEmail(selectedBooking)}
                className="flex items-center gap-2 px-4 cursor-pointer py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </button>
              <button
                onClick={() => {
                  setBookingToDelete(selectedBooking);
                  setShowDeleteModal(true);
                  setShowBookingModal(false);
                }}
                className="flex items-center gap-2 px-4 py-2 border cursor-pointer border-red-600 hover:bg-red-700/50 text-red-400 hover:text-white rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Booking
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex items-center gap-2 px-4 py-2 border cursor-pointer border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors ml-auto"
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Booking</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-700/50 cursor-pointer rounded-lg transition-colors"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price per Night
                  </label>
                  <input
                    type="number"
                    value={editFormData.price_per_night || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        price_per_night: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    value={editFormData.total_amount || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        total_amount: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                    min="0"
                    step="0.01"
                  />
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
                  className="px-4 py-2 border cursor-pointer border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white rounded-lg transition-colors"
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
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
                className="px-4 py-2 border cursor-pointer border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBooking}
                className="px-4 py-2 bg-red-600 cursor-pointer hover:bg-red-700 text-white rounded-lg transition-colors"
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
        return format(new Date(dateString), "MMM dd, yyyy");
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
                <div className="w-12 h-12 bg-linear-to-br from-sky-600 to-sky-700 rounded-xl flex items-center justify-center text-white font-bold text-lg">
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
                  ({room.room_category || "Unknown"})
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
                  ₦{booking.total_amount || 0}
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
                  className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
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
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
          <BarChart className="w-16 h-16 mb-4 text-gray-600" />
          <p>No revenue data available for the selected period</p>
        </div>
      );
    }

    return (
      <div className="mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <span className="text-sm text-gray-400">Revenue Trend</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-400">
                ₦
                {revenueTrend
                  .reduce((sum, item) => sum + item.revenue, 0)
                  .toLocaleString()}
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
                tickFormatter={(value) => `₦${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  borderColor: "#4B5563",
                  color: "white",
                  borderRadius: "8px",
                  padding: "12px",
                }}
                formatter={(value) => [`₦${value.toLocaleString()}`, "Revenue"]}
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ stroke: "#10B981", strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  stroke: "#10B981",
                  strokeWidth: 2,
                  fill: "#fff",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Pagination component
  const Pagination = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const maxVisiblePages = 5;

    if (totalPages <= 1) return null;

    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col lg:flex-row items-center justify-between mt-8 pt-8 border-t border-gray-700 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
            bookings
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg cursor-pointer ${
              currentPage === 1
                ? "text-gray-600 cursor-not-allowed"
                : "text-gray-400 hover:bg-gray-700/50"
            }`}
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg cursor-pointer ${
              currentPage === 1
                ? "text-gray-600 cursor-not-allowed"
                : "text-gray-400 hover:bg-gray-700/50"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`w-10 h-10 rounded-lg font-medium cursor-pointer ${
                currentPage === number
                  ? "bg-sky-600 text-white"
                  : "text-gray-400 hover:bg-gray-700/50"
              }`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${
              currentPage === totalPages
                ? "text-gray-600 cursor-not-allowed"
                : "text-gray-400 hover:bg-gray-700/50"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg cursor-pointer ${
              currentPage === totalPages
                ? "text-gray-600 cursor-not-allowed"
                : "text-gray-400 hover:bg-gray-700/50"
            }`}
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
    );
  };

  // Time period selector component
  const TimePeriodSelector = () => (
    <div className="flex items-center gap-2 flex-wrap">
      {timePeriods.map((period) => (
        <button
          key={period.id}
          onClick={() => setTimePeriod(period.id)}
          className={`px-4 py-2 rounded-lg cursor-pointer font-medium transition-all ${
            timePeriod === period.id
              ? "bg-sky-600 text-white"
              : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );

  // Loading state
  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading bookings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-900 to-black text-white">
      {/* Modals */}
      {showBookingModal && <BookingModal />}
      {showEditModal && <EditBookingModal />}
      {showDeleteModal && <DeleteConfirmationModal />}

      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-800/50 cursor-pointer rounded-xl transition-colors lg:hidden"
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
          <div className="w-full pb-7">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6">
              {/* Left */}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Bookings Management
                </h1>
                <p className="text-sm text-gray-400">
                  Manage and track all hotel bookings
                </p>
              </div>

              {/* Right */}
              <div className="flex lg:justify-end items-center gap-4">
                {/* Check Availability Button */}
                <Link
                  href="/admin/room-availability"
                  className="flex items-center gap-2 cursor-pointer px-5 py-3 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  <CalendarCheck className="w-5 h-5" />
                  Check Availability
                </Link>

                <Link
                  href="/admin/quick-checkin"
                  className="flex items-center gap-2 px-5 text-[14px] py-3 bg-linear-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  <CalendarCheck className="w-5 h-5" />
                  Check-in & Out
                </Link>

                {/* Book Room Button */}
                <Link
                  href="/admin/book-a-room"
                  className="flex items-center cursor-pointer gap-2 px-5 py-3 bg-linear-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Book Room
                </Link>
              </div>
            </div>
          </div>

          {/* Time Period Selector */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <h2 className="text-xl font-bold text-white">
                Performance Overview
              </h2>
              <TimePeriodSelector />
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: "Total Bookings",
                value: stats.totalBookings.toString(),
                icon: <Calendar className="w-6 h-6" />,
                color: "text-sky-400",
              },
              {
                label: "Active Stays",
                value: stats.activeStays.toString(),
                icon: <User className="w-6 h-6" />,
                color: "text-emerald-400",
              },
              {
                label: "Total Revenue",
                value: `₦${stats.totalRevenue.toLocaleString()}`,
                icon: <FaNairaSign className="w-6 h-6" />,
                color: "text-amber-400",
              },
              {
                label: "Occupancy Rate",
                value: `${stats.occupancyRate}%`,
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  Revenue Analysis
                </h3>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <RevenueTrendChart />
            </div>

            {/* Additional Stats Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Quick Stats</h3>
                <BarChart3 className="w-5 h-5 text-sky-400" />
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
                    value: `₦${stats.averageBookingValue.toFixed(2)}`,
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
                  onChange={(e) => handleSearchChange(e.target.value)}
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
              <button className="flex cursor-pointer items-center gap-2 px-4 py-3 border border-gray-600 hover:bg-gray-700/50 rounded-xl transition-colors text-white">
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
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mt-6 gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">
                    {totalItems} bookings found
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
                      setCurrentPage(1);
                      // Clear search timeout
                      if (searchTimeout) {
                        clearTimeout(searchTimeout);
                        setSearchTimeout(null);
                      }
                      fetchData("");
                    }}
                    className="flex items-center cursor-pointer gap-2 px-4 py-2.5 border border-gray-600 hover:bg-gray-700/50 rounded-xl transition-colors text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Clear Filters
                  </button>
                  <button
                    onClick={() => fetchData()}
                    className="flex items-center cursor-pointer gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors"
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
                    className="px-6 py-3 bg-linear-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white rounded-xl font-medium transition-colors"
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
                      setCurrentPage(1);
                      if (searchTimeout) {
                        clearTimeout(searchTimeout);
                        setSearchTimeout(null);
                      }
                      fetchData("");
                    }}
                    className="px-6 py-3 border cursor-pointer border-gray-600 hover:bg-gray-700/50 text-white rounded-xl font-medium transition-colors"
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
                      <div className="w-10 h-10 bg-linear-to-br from-sky-600 to-sky-700 rounded-xl flex items-center justify-center text-white font-bold text-lg">
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
                          ₦{booking.total_amount || 0}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewBooking(booking)}
                      className="w-full py-2 bg-sky-600 cursor-pointer hover:bg-sky-700 text-white text-sm rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <Pagination />
        </main>
      </div>
    </div>
  );
}
