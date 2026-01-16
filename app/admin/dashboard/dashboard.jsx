"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Grid,
  List,
  Hotel,
  CalendarCheck,
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
  parseISO,
  isValid,
  isWithinInterval,
  subDays,
  subMonths,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaNairaSign } from "react-icons/fa6";

// Helper function to format prices with commas
const formatPrice = (price) => {
  if (price === undefined || price === null) return "0";

  // Convert to number first
  const num =
    typeof price === "string"
      ? parseFloat(price.replace(/[^0-9.-]+/g, ""))
      : Number(price);

  if (isNaN(num)) return "0";

  // Format with commas
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Helper function to format price for display with Naira symbol
const formatPriceDisplay = (price) => {
  return `₦${formatPrice(price)}`;
};

// Helper function to safely parse and calculate price
const parsePrice = (price) => {
  if (!price && price !== 0) return 0;
  // Remove any non-numeric characters except decimal point
  const cleaned = String(price).replace(/[^0-9.-]+/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Time period options
const chartTimeFrames = [
  { id: "week", label: "Weekly", groupBy: "week" },
  { id: "month", label: "Monthly", groupBy: "month" },
  { id: "year", label: "Yearly", groupBy: "year" },
  { id: "all", label: "All Time", groupBy: "year" },
];

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
const paymentStatusOptions = ["all", "paid", "refunded"];

export default function BookingsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);

  // Core data states
  const [allBookings, setAllBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [displayedBookings, setDisplayedBookings] = useState([]);

  // Stats and trends
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeStays: 0,
    totalRevenue: 0,
    totalRevenueFormatted: "₦0",
    occupancyRate: 0,
    totalUsers: 0,
    averageBookingValue: 0,
    averageBookingValueFormatted: "₦0",
    avgStayDuration: 0,
    topRoomType: "N/A",
  });
  const [revenueTrend, setRevenueTrend] = useState([]);

  // Filter states
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

  // Room types for filter
  const [roomTypeOptions, setRoomTypeOptions] = useState(["all"]);

  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Real-time states
  const [subscription, setSubscription] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [userCount, setUserCount] = useState(0);

  // Refs for real-time management
  const subscriptionRef = useRef(null);
  const isMountedRef = useRef(true);

  // Format time for last update
  const formatTime = (date) => {
    if (!date) return "Never";
    return format(date, "HH:mm:ss");
  };

  // Get time period range
  const getTimePeriodRange = useCallback((period) => {
    const now = new Date();

    switch (period) {
      case "today":
        return {
          start: startOfDay(now),
          end: endOfDay(now),
        };
      case "week":
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        };
      case "month":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
      case "year":
        return {
          start: startOfYear(now),
          end: endOfYear(now),
        };
      case "all":
      default:
        return null;
    }
  }, []);

  // Filter bookings by time period
  const filterByTimePeriod = useCallback(
    (bookings, period) => {
      if (period === "all") return bookings;

      const range = getTimePeriodRange(period);
      if (!range) return bookings;

      return bookings.filter((booking) => {
        try {
          const checkInDate = parseISO(booking.check_in_date);
          if (!isValid(checkInDate)) return false;

          return (
            isAfter(checkInDate, range.start) &&
            isBefore(checkInDate, range.end)
          );
        } catch {
          return false;
        }
      });
    },
    [getTimePeriodRange]
  );

  // Initial data fetch - simplified and optimized
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setIsSyncing(true);

      // Parallel fetching for better performance
      const [bookingsResponse, roomsResponse, usersResponse] =
        await Promise.all([
          supabase
            .from("bookings")
            .select("*")
            .order("check_in_date", { ascending: false }),
          supabase.from("rooms").select("*"),
          supabase.from("users").select("*", { count: "exact", head: true }),
        ]);

      if (bookingsResponse.error) throw bookingsResponse.error;
      if (roomsResponse.error) throw roomsResponse.error;

      setUserCount(usersResponse.count || 0);
      setRooms(roomsResponse.data || []);

      // Create room map
      const roomMap = {};
      roomsResponse.data?.forEach((room) => {
        roomMap[room.room_number] = room;
      });

      // Enrich bookings with room data
      const enrichedBookings =
        bookingsResponse.data?.map((booking) => ({
          ...booking,
          room_details: roomMap[booking.room_number] || null,
          room_category:
            roomMap[booking.room_number]?.room_category ||
            booking.room_category,
          total_amount_formatted: formatPriceDisplay(booking.total_amount),
        })) || [];

      setAllBookings(enrichedBookings);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // Setup real-time subscriptions
  const setupRealtimeSubscriptions = useCallback(() => {
    console.log("Setting up real-time subscriptions...");

    // Clean up existing subscriptions
    if (subscriptionRef.current) {
      console.log("Cleaning up existing subscription...");
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    // Create new channel with better configuration
    const channel = supabase
      .channel("admin-dashboard")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          console.log(
            "Booking change detected:",
            payload.eventType,
            payload.new
          );
          if (isMountedRef.current) {
            setIsSyncing(true);
            setLastUpdate(new Date());

            // Update based on event type
            if (payload.eventType === "INSERT") {
              console.log("New booking added, refreshing data...");
              fetchInitialData();
            } else if (payload.eventType === "UPDATE") {
              console.log("Booking updated, refreshing data...");
              fetchInitialData();
            } else if (payload.eventType === "DELETE") {
              console.log("Booking deleted, refreshing data...");
              fetchInitialData();
            }

            // Auto-hide syncing after 2 seconds
            setTimeout(() => {
              if (isMountedRef.current) {
                setIsSyncing(false);
              }
            }, 2000);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
        },
        (payload) => {
          console.log("Room change detected:", payload.eventType);
          if (isMountedRef.current) {
            setIsSyncing(true);
            setLastUpdate(new Date());

            // Fetch updated rooms data
            supabase
              .from("rooms")
              .select("*")
              .then(({ data, error }) => {
                if (!error && data) {
                  setRooms(data);

                  // Update room type options
                  const roomCategories = data
                    .map((room) => room.room_category)
                    .filter(Boolean);
                  const uniqueRoomTypes = [...new Set(roomCategories)];
                  setRoomTypeOptions(["all", ...uniqueRoomTypes]);

                  // Also refresh bookings to update room details
                  fetchInitialData();
                }
              });
          }
        }
      )
      .on("system", { event: "connected" }, () => {
        console.log("✅ Connected to real-time");
        if (isMountedRef.current) {
          setIsSyncing(false);
        }
      })
      .on("system", { event: "disconnected" }, () => {
        console.log("❌ Disconnected from real-time");
        if (isMountedRef.current) {
          setIsSyncing(true);
        }
      })
      .on("system", { event: "reconnected" }, () => {
        console.log("🔄 Reconnected to real-time");
        if (isMountedRef.current) {
          setIsSyncing(true);
          fetchInitialData();
        }
      })
      .subscribe((status) => {
        console.log("Subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to real-time updates");
          if (isMountedRef.current) {
            setIsSyncing(false);
          }
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Channel error");
          // Try to reconnect after 5 seconds
          setTimeout(() => {
            if (isMountedRef.current) {
              console.log("Attempting to reconnect...");
              setupRealtimeSubscriptions();
            }
          }, 5000);
        }
      });

    subscriptionRef.current = channel;
    setSubscription(channel);
  }, [fetchInitialData]);

  // Calculate statistics - FIXED: Only count bookings with payment_status = "paid" for ALL calculations
  const calculateStats = useCallback(
    (bookings) => {
      if (!bookings || bookings.length === 0) {
        return {
          totalBookings: 0,
          activeStays: 0,
          totalRevenue: 0,
          totalRevenueFormatted: "₦0",
          occupancyRate: 0,
          totalUsers: userCount,
          averageBookingValue: 0,
          averageBookingValueFormatted: "₦0",
          avgStayDuration: 0,
          topRoomType: "N/A",
        };
      }

      const now = new Date();

      // Filter only paid bookings for ALL calculations
      const paidBookings = bookings.filter(
        (booking) => booking.payment_status === "paid"
      );

      // Calculate basic stats for PAID bookings only
      const totalBookings = paidBookings.length; // FIXED: Now only counts paid bookings

      // Calculate revenue ONLY from paid bookings
      const totalRevenue = paidBookings.reduce((sum, booking) => {
        const amount = parsePrice(booking.total_amount) || 0;
        return sum + amount;
      }, 0);

      // Calculate average booking value from paid bookings
      const averageBookingValue =
        paidBookings.length > 0 ? totalRevenue / paidBookings.length : 0;

      // Format revenue values
      const totalRevenueFormatted = formatPriceDisplay(totalRevenue);
      const averageBookingValueFormatted =
        formatPriceDisplay(averageBookingValue);

      // Calculate active stays (only for paid bookings)
      const activeStays = paidBookings.filter((booking) => {
        try {
          const checkIn = parseISO(booking.check_in_date);
          const checkOut = parseISO(booking.check_out_date);
          return (
            isValid(checkIn) &&
            isValid(checkOut) &&
            isWithinInterval(now, { start: checkIn, end: checkOut })
          );
        } catch {
          return false;
        }
      }).length;

      // Calculate average stay duration (only for paid bookings)
      const totalNights = paidBookings.reduce((sum, booking) => {
        const nights = parseInt(booking.no_of_nights) || 0;
        return sum + nights;
      }, 0);
      const avgStayDuration =
        paidBookings.length > 0
          ? (totalNights / paidBookings.length).toFixed(1)
          : "0";

      // Calculate occupancy rate (only for paid bookings that are active)
      const totalRooms = rooms.length || 50;
      const occupancyRate = Math.round((activeStays / totalRooms) * 100);

      // Find top room type (only from paid bookings)
      const roomTypeCounts = {};
      paidBookings.forEach((booking) => {
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
        totalBookings, // FIXED: Shows only paid bookings count
        activeStays, // Only paid active stays
        totalRevenue, // Only from paid bookings
        totalRevenueFormatted,
        occupancyRate, // Based on paid active stays
        totalUsers: userCount,
        averageBookingValue, // Only from paid bookings
        averageBookingValueFormatted,
        avgStayDuration: parseFloat(avgStayDuration), // Only from paid bookings
        topRoomType, // Only from paid bookings
      };
    },
    [rooms.length, userCount]
  );

  // Calculate revenue trend - FIXED: Only count bookings with payment_status = "paid"
  const calculateRevenueTrend = useCallback((bookings, timeframe) => {
    if (!bookings || bookings.length === 0) return [];

    const now = new Date();
    let startDate = new Date();
    let groupFormat = "";

    switch (timeframe) {
      case "week":
        startDate = subDays(now, 30);
        groupFormat = "MMM dd";
        break;
      case "month":
        startDate = subMonths(now, 12);
        groupFormat = "MMM yyyy";
        break;
      case "year":
        startDate = subMonths(now, 60);
        groupFormat = "yyyy";
        break;
      case "all":
        startDate = subMonths(now, 60);
        groupFormat = "yyyy";
        break;
      default:
        startDate = subMonths(now, 12);
        groupFormat = "MMM yyyy";
    }

    const revenueMap = {};

    // Filter only paid bookings for revenue trend
    const paidBookings = bookings.filter(
      (booking) => booking.payment_status === "paid"
    );

    paidBookings.forEach((booking) => {
      try {
        const bookingDate = parseISO(booking.created_at);
        if (!isValid(bookingDate)) return;

        let periodKey;
        switch (timeframe) {
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
          revenueMap[periodKey] = { period: displayKey, revenue: 0 };
        }

        revenueMap[periodKey].revenue += parsePrice(booking.total_amount) || 0;
      } catch (error) {
        console.error("Error processing booking date:", error);
      }
    });

    return Object.values(revenueMap)
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-12)
      .map((item) => ({
        ...item,
        revenue: item.revenue, // Keep as number for chart
        revenueFormatted: formatPrice(item.revenue), // Add formatted value for tooltip
      }));
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    if (allBookings.length === 0) {
      setFilteredBookings([]);
      setDisplayedBookings([]);
      return;
    }

    let filtered = [...allBookings];

    // Apply time period filter FIRST
    if (timePeriod !== "all") {
      filtered = filterByTimePeriod(filtered, timePeriod);
    }

    // Search filter
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

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (booking) => booking.booking_status === selectedStatus
      );
    }

    // Room type filter
    if (selectedRoomType !== "all") {
      filtered = filtered.filter(
        (booking) => booking.room_category === selectedRoomType
      );
    }

    // Payment status filter
    if (selectedPaymentStatus !== "all") {
      filtered = filtered.filter(
        (booking) => booking.payment_status === selectedPaymentStatus
      );
    }

    // Date range filter (custom range)
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

    // Sort
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
        const amountA = parsePrice(a.total_amount) || 0;
        const amountB = parsePrice(b.total_amount) || 0;
        return sortOrder === "desc" ? amountB - amountA : amountA - amountB;
      }
      if (sortBy === "guest_name") {
        return sortOrder === "desc"
          ? (b.guest_name || "").localeCompare(a.guest_name || "")
          : (a.guest_name || "").localeCompare(b.guest_name || "");
      }
      return 0;
    });

    setFilteredBookings(filtered);
    setDisplayedBookings(filtered.slice(0, 5));
  }, [
    allBookings,
    searchQuery,
    selectedStatus,
    selectedRoomType,
    selectedPaymentStatus,
    dateRange,
    sortBy,
    sortOrder,
    timePeriod,
    filterByTimePeriod,
  ]);

  // Update stats when filtered bookings or settings change
  useEffect(() => {
    if (filteredBookings.length > 0) {
      const newStats = calculateStats(filteredBookings);
      setStats(newStats);

      const newTrend = calculateRevenueTrend(filteredBookings, chartTimeFrame);
      setRevenueTrend(newTrend);
    } else {
      setStats({
        totalBookings: 0,
        activeStays: 0,
        totalRevenue: 0,
        totalRevenueFormatted: "₦0",
        occupancyRate: 0,
        totalUsers: userCount,
        averageBookingValue: 0,
        averageBookingValueFormatted: "₦0",
        avgStayDuration: 0,
        topRoomType: "N/A",
      });
      setRevenueTrend([]);
    }
  }, [
    filteredBookings,
    chartTimeFrame,
    calculateStats,
    calculateRevenueTrend,
    userCount,
  ]);

  // Update room type options when rooms are loaded
  useEffect(() => {
    if (rooms.length > 0) {
      const roomCategories = rooms
        .map((room) => room.room_category)
        .filter(Boolean);
      const uniqueRoomTypes = [...new Set(roomCategories)];
      setRoomTypeOptions(["all", ...uniqueRoomTypes]);
    }
  }, [rooms]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Initial data fetch and real-time setup
  useEffect(() => {
    const initialize = async () => {
      // Check admin role
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/unauthorized");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("user_role")
        .eq("id", user.id)
        .single();

      if (!userData || userData.user_role !== "admin") {
        router.replace("/unauthorized");
        return;
      }

      isMountedRef.current = true;

      // Fetch initial data
      await fetchInitialData();

      // Setup real-time subscriptions
      setupRealtimeSubscriptions();

      // Set up periodic health check
      const healthCheckInterval = setInterval(() => {
        if (isMountedRef.current && subscriptionRef.current) {
          const channel = subscriptionRef.current;
          // Send a ping to keep connection alive
          channel.send({ type: "broadcast", event: "ping", payload: {} });
        }
      }, 30000); // Every 30 seconds

      return () => {
        clearInterval(healthCheckInterval);
      };
    };

    initialize();

    // Cleanup function
    return () => {
      console.log("Cleaning up subscriptions...");
      isMountedRef.current = false;

      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }

      if (subscription) {
        supabase.removeChannel(subscription);
        setSubscription(null);
      }
    };
  }, [router, fetchInitialData, setupRealtimeSubscriptions]);

  // Handler functions
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

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

  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update(editFormData)
        .eq("id", selectedBooking.id);

      if (error) throw error;
      alert("Booking updated successfully!");
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);

      if (error) throw error;
      alert("Booking deleted successfully!");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking");
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Reset date range when time period changes
  useEffect(() => {
    if (timePeriod !== "all") {
      const range = getTimePeriodRange(timePeriod);
      if (range) {
        setDateRange({
          start: format(range.start, "yyyy-MM-dd"),
          end: format(range.end, "yyyy-MM-dd"),
        });
      }
    }
  }, [timePeriod, getTimePeriodRange]);

  // Component render functions
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
              {formatPriceDisplay(amount)} of {formatPriceDisplay(total)}
            </span>
          )}
        </div>
      </div>
    );
  };

  const BookingCard = ({ booking }) => {
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
                onClick={() =>
                  setExpandedBooking(
                    expandedBooking === booking.id ? null : booking.id
                  )
                }
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
                  {booking.total_amount_formatted ||
                    formatPriceDisplay(booking.total_amount)}
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
                  onClick={() => handleEditBooking(booking)}
                  className="flex items-center cursor-pointer gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" /> Edit Booking
                </button>
                <button
                  onClick={() => {
                    setBookingToDelete(booking);
                    setShowDeleteModal(true);
                  }}
                  className="flex items-center cursor-pointer gap-2 px-4 py-2 border border-red-600 hover:bg-red-700/50 text-red-400 hover:text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40">
        <div className="px-6 py-3">
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
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    isSyncing ? "bg-yellow-500" : "bg-emerald-500"
                  }`}
                ></div>
                <span
                  className={`text-sm ${
                    isSyncing ? "text-yellow-400" : "text-emerald-400"
                  }`}
                >
                  {isSyncing ? "Syncing..." : "Live"}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                Updated: {formatTime(lastUpdate)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchInitialData}
                disabled={isSyncing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  isSyncing
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-sky-600 hover:bg-sky-700"
                }`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                />
                <span className="text-sm">
                  {isSyncing ? "Refreshing..." : "Refresh"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <Sidebar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-6">
          {/* Header */}
          <div className="w-full pb-7">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Admin Management Dashboard
                </h1>
                <p className="text-sm text-gray-400">
                  Manage and track all hotel bookings{" "}
                  {isSyncing && "(Syncing...)"}
                </p>
              </div>
              <div className="flex lg:justify-end items-center gap-4">
                <Link
                  href="/admin/bookings"
                  className="flex items-center gap-2 px-5 text-[14px] py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  <Eye className="w-5 h-5" /> View All Bookings
                </Link>
                <Link
                  href="/admin/room-availability"
                  className="flex items-center gap-2 text-[14px] px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  <CalendarCheck className="w-5 h-5" /> Check Availability
                </Link>
                <Link
                  href="/admin/book-a-room"
                  className="flex items-center text-[14px] gap-2 px-5 py-3 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  <Plus className="w-5 h-5" /> Book a Room
                </Link>
              </div>
            </div>
          </div>

          {/* Time Period Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Performance Overview
                {isSyncing && (
                  <span className="ml-2 text-sm text-sky-400">
                    • Updating...
                  </span>
                )}
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
                label: "Paid Bookings",
                value: stats.totalBookings.toString(),
                change: "Paid bookings only",
                icon: <Calendar className="w-6 h-6" />,
                color: "text-sky-400",
              },
              {
                label: "Active Stays",
                value: stats.activeStays.toString(),
                change: "Paid stays only",
                icon: <User className="w-6 h-6" />,
                color: "text-emerald-400",
              },
              {
                label: "Total Revenue",
                value: stats.totalRevenueFormatted,
                change: "From paid bookings",
                icon: <FaNairaSign className="w-6 h-6" />,
                color: "text-amber-400",
              },
              {
                label: "Occupancy Rate",
                value: `${stats.occupancyRate}%`,
                change: "Based on paid stays",
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
                  <span className="text-xs font-medium text-emerald-400">
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
              <div className="mt-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-sm text-gray-400">Revenue Trend</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold text-emerald-400">
                        {stats.totalRevenueFormatted}
                      </span>
                      <span className="text-sm text-emerald-400">
                        (Paid bookings only)
                      </span>
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
                  {revenueTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="period"
                          stroke="#9CA3AF"
                          fontSize={12}
                        />
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
                          formatter={(value) => [
                            formatPriceDisplay(value),
                            "Revenue",
                          ]}
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
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No revenue data available
                    </div>
                  )}
                </div>
              </div>
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
                    value: stats.averageBookingValueFormatted,
                    icon: <FaNairaSign className="w-4 h-4" />,
                    note: "(Paid only)",
                  },
                  {
                    label: "Avg. Stay Duration",
                    value: `${stats.avgStayDuration} nights`,
                    icon: <CalendarDays className="w-4 h-4" />,
                    note: "(Paid only)",
                  },
                  {
                    label: "Top Room Type",
                    value: stats.topRoomType,
                    icon: <Bed className="w-4 h-4" />,
                    note: "(Paid only)",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400">{stat.icon}</div>
                      <div>
                        <span className="text-sm text-gray-300">
                          {stat.label}
                        </span>
                        {stat.note && (
                          <span className="text-xs text-emerald-400 block">
                            {stat.note}
                          </span>
                        )}
                      </div>
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
            </div>

            {/* Advanced Filters */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Check-in Date Range
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
                    Showing {displayedBookings.length} of{" "}
                    {filteredBookings.length} bookings
                    {selectedPaymentStatus === "all" &&
                      " (all payment statuses)"}
                    {selectedPaymentStatus === "paid" && " (paid only)"}
                    {selectedPaymentStatus === "refunded" && " (refunded only)"}
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
                      setTimePeriod("all");
                    }}
                    className="flex cursor-pointer items-center gap-2 px-4 py-2.5 border border-gray-600 hover:bg-gray-700/50 rounded-xl transition-colors text-white"
                  >
                    <RefreshCw className="w-4 h-4" /> Clear All Filters
                  </button>
                  <button
                    onClick={fetchInitialData}
                    disabled={isSyncing}
                    className={`flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
                      isSyncing
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-sky-600 hover:bg-sky-700"
                    }`}
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                    />
                    {isSyncing ? "Syncing..." : "Refresh Data"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List/Grid */}
          <div>
            {displayedBookings.length === 0 ? (
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
                    href="/admin/book-a-room"
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
                      setTimePeriod("all");
                    }}
                    className="px-6 py-3 cursor-pointer border border-gray-600 hover:bg-gray-700/50 text-white rounded-xl font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-4">
                {displayedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
                <div className="text-center mt-8">
                  <Link
                    href="/admin/bookings"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" /> View All Bookings (
                    {allBookings.length})
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-5 hover:border-sky-500/50 transition-all duration-300"
                  >
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
                          {booking.total_amount_formatted ||
                            formatPriceDisplay(booking.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="col-span-full text-center mt-8">
                  <Link
                    href="/admin/bookings"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" /> View All Bookings (
                    {allBookings.length})
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showDeleteModal && bookingToDelete && (
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
                  onClick={() => setShowDeleteModal(false)}
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
      )}

      {showEditModal && selectedBooking && (
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
                      <option value="paid">Paid</option>
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
      )}
    </div>
  );
}
