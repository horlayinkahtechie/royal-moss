"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  CreditCard,
  Download,
  Filter,
  ChevronDown,
  Home,
} from "lucide-react";
import supabase from "../../lib/supabase";
import Sidebar from "@/app/_components/admin/Sidebar";
import { useRouter } from "next/navigation";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminRevenueReport() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [dateRange, setDateRange] = useState("monthly");
  const [timeFilter, setTimeFilter] = useState("30days");
  const [bookingDetails, setBookingDetails] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    averageBookingValue: 0,
    occupancyRate: 0,
  });

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

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

      if (userError || userData?.user_role !== "admin") {
        router.replace("/unauthorized");
        return;
      }

      fetchRevenueData();
    };

    checkAdminRole();
  }, [router, timeFilter]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);

      // Calculate date ranges
      const today = new Date();
      const endDate = new Date();
      let startDate;

      switch (timeFilter) {
        case "7days":
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          break;
        case "30days":
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 30);
          break;
        case "90days":
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 90);
          break;
        case "yearly":
          startDate = new Date(today.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 30);
      }

      // Fetch bookings data - Only get paid bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select(
          `
          *,
          room:room_number,
          guest_name,
          guest_email,
          guest_phone,
          room_category,
          check_in_date,
          check_out_date,
          no_of_nights,
          no_of_guests,
          price_per_night,
          total_amount,
          currency,
          payment_status,
          payment_method
        `
        )
        .eq("payment_status", "paid") // Only count paid bookings
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      if (bookingsError) throw bookingsError;

      // Store booking details for reference
      setBookingDetails(bookings);

      // Process data for daily revenue chart
      const dailyRevenueMap = {};

      bookings.forEach((booking) => {
        const date = new Date(booking.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        if (!dailyRevenueMap[date]) {
          dailyRevenueMap[date] = {
            date,
            revenue: 0,
            bookings: 0,
            roomNights: 0,
          };
        }

        // Only add revenue if payment status is 'paid'
        if (booking.payment_status === "paid") {
          dailyRevenueMap[date].revenue += booking.total_amount || 0;
          dailyRevenueMap[date].bookings += 1;
          dailyRevenueMap[date].roomNights += booking.no_of_nights || 0;
        }
      });

      // Get all dates in the range for consistent display
      const allDates = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        allDates.push(dateStr);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Create complete daily data with zeros for days without bookings
      const completeDailyData = allDates.map((date) => {
        if (dailyRevenueMap[date]) {
          return dailyRevenueMap[date];
        } else {
          return {
            date,
            revenue: 0,
            bookings: 0,
            roomNights: 0,
          };
        }
      });

      // For different time filters, show different amounts of data
      let dailyDataToShow;
      switch (timeFilter) {
        case "7days":
          dailyDataToShow = completeDailyData.slice(-7); // Last 7 days
          break;
        case "30days":
          dailyDataToShow = completeDailyData.slice(-30); // Last 30 days
          break;
        case "90days":
          // For 90 days, we might want to show weekly aggregation instead
          dailyDataToShow = aggregateWeeklyData(completeDailyData);
          break;
        case "yearly":
          // For yearly, show monthly aggregation
          dailyDataToShow = monthlyData; // Will be populated below
          break;
        default:
          dailyDataToShow = completeDailyData.slice(-15); // Default 15 days
      }

      setRevenueData(dailyDataToShow);

      // Process monthly data
      const monthlyRevenueMap = {};
      bookings.forEach((booking) => {
        const monthYear = new Date(booking.created_at).toLocaleDateString(
          "en-US",
          {
            month: "short",
            year: "numeric",
          }
        );

        if (!monthlyRevenueMap[monthYear]) {
          monthlyRevenueMap[monthYear] = {
            month: monthYear,
            revenue: 0,
            bookings: 0,
            avgBookingValue: 0,
            roomNights: 0,
            avgRoomRate: 0,
          };
        }

        // Only add revenue if payment status is 'paid'
        if (booking.payment_status === "paid") {
          monthlyRevenueMap[monthYear].revenue += booking.total_amount || 0;
          monthlyRevenueMap[monthYear].bookings += 1;
          monthlyRevenueMap[monthYear].roomNights += booking.no_of_nights || 0;
          monthlyRevenueMap[monthYear].avgRoomRate =
            monthlyRevenueMap[monthYear].roomNights > 0
              ? monthlyRevenueMap[monthYear].revenue /
                monthlyRevenueMap[monthYear].roomNights
              : 0;
        }

        // Calculate average booking value
        if (monthlyRevenueMap[monthYear].bookings > 0) {
          monthlyRevenueMap[monthYear].avgBookingValue =
            monthlyRevenueMap[monthYear].revenue /
            monthlyRevenueMap[monthYear].bookings;
        }
      });

      // Sort monthly data chronologically
      const monthlyDataArray = Object.values(monthlyRevenueMap).sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA - dateB;
      });

      setMonthlyData(monthlyDataArray);

      // Process payment method data - Only for paid bookings
      const paymentMethods = {};
      bookings.forEach((booking) => {
        // Only process paid bookings
        if (booking.payment_status !== "paid") return;

        const method = booking.payment_method || "unknown";
        if (!paymentMethods[method]) {
          paymentMethods[method] = {
            name: method.charAt(0).toUpperCase() + method.slice(1),
            value: 0,
            count: 0,
            percentage: 0,
          };
        }
        paymentMethods[method].value += booking.total_amount || 0;
        paymentMethods[method].count += 1;
      });

      // Calculate total paid revenue for percentages
      const totalPaidRevenue = bookings
        .filter((booking) => booking.payment_status === "paid")
        .reduce((sum, booking) => sum + (booking.total_amount || 0), 0);

      // Calculate percentages for each payment method
      const paymentData = Object.values(paymentMethods).map((item) => ({
        ...item,
        value: parseFloat(item.value.toFixed(2)),
        percentage:
          totalPaidRevenue > 0
            ? parseFloat(((item.value / totalPaidRevenue) * 100).toFixed(1))
            : 0,
      }));

      setPaymentMethodData(paymentData);

      // Calculate stats - Only from paid bookings
      const paidBookings = bookings.filter(
        (booking) => booking.payment_status === "paid"
      );
      const totalRevenue = paidBookings.reduce(
        (sum, booking) => sum + (booking.total_amount || 0),
        0
      );
      const totalBookings = paidBookings.length;
      const averageBookingValue =
        totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Fetch rooms for occupancy rate
      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("room_number, room_availability");

      if (!roomsError && rooms && rooms.length > 0) {
        // Calculate occupancy based on current bookings
        const today = new Date().toISOString().split("T")[0];
        const { data: activeBookings } = await supabase
          .from("bookings")
          .select("room_number")
          .lte("check_in_date", today)
          .gte("check_out_date", today)
          .eq("payment_status", "paid");

        const occupiedRoomNumbers = new Set(
          activeBookings?.map((b) => b.room_number) || []
        );
        const occupancyRate = (occupiedRoomNumbers.size / rooms.length) * 100;

        setStats({
          totalRevenue,
          totalBookings,
          averageBookingValue,
          occupancyRate,
        });
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to aggregate daily data into weekly data
  const aggregateWeeklyData = (dailyData) => {
    const weeklyMap = {};

    dailyData.forEach((day) => {
      const date = new Date(day.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)

      const weekKey = weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = {
          date: `Week of ${weekKey}`,
          revenue: 0,
          bookings: 0,
          roomNights: 0,
        };
      }

      weeklyMap[weekKey].revenue += day.revenue;
      weeklyMap[weekKey].bookings += day.bookings;
      weeklyMap[weekKey].roomNights += day.roomNights;
    });

    return Object.values(weeklyMap);
  };

  const handleDownloadReport = () => {
    // Create CSV content with detailed booking information
    const headers = [
      "Booking Date",
      "Room Number",
      "Guest Name",
      "Guest Email",
      "Guest Phone",
      "Room Category",
      "Check-in Date",
      "Check-out Date",
      "Nights",
      "Guests",
      "Price Per Night",
      "Total Amount",
      "Currency",
      "Payment Status",
      "Payment Method",
    ];

    const csvContent = [
      headers.join(","),
      ...bookingDetails.map((booking) =>
        [
          new Date(booking.created_at).toLocaleDateString(),
          `"${booking.room_number}"`,
          `"${booking.guest_name || ""}"`,
          `"${booking.guest_email || ""}"`,
          `"${booking.guest_phone || ""}"`,
          `"${booking.room_category || ""}"`,
          booking.check_in_date,
          booking.check_out_date,
          booking.no_of_nights || 0,
          booking.no_of_guests || 0,
          booking.price_per_night || 0,
          booking.total_amount || 0,
          `"${booking.currency || "NGN"}"`,
          `"${booking.payment_status || ""}"`,
          `"${booking.payment_method || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{" "}
              <span className="font-bold">
                {entry.name === "Revenue" ||
                entry.name === "Average Booking Value"
                  ? `₦${entry.value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : entry.value.toLocaleString()}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Stats cards
  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-xl ${color} bg-opacity-20`}
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <span className="text-sm text-gray-400">{title}</span>
      </div>
      <div className="text-3xl font-bold text-white mb-2">
        {title === "Total Revenue" || title === "Avg Booking Value"
          ? `₦${value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : title === "Occupancy Rate"
          ? `${typeof value === "number" ? value.toFixed(1) : value}%`
          : typeof value === "number"
          ? value.toLocaleString()
          : value}
      </div>
    </div>
  );

  // Get chart title based on time filter
  const getDailyChartTitle = () => {
    switch (timeFilter) {
      case "7days":
        return "Daily Revenue (Last 7 days)";
      case "30days":
        return "Daily Revenue (Last 30 days)";
      case "90days":
        return "Weekly Revenue (Last 90 days)";
      case "yearly":
        return "Monthly Revenue (Year to date)";
      default:
        return "Daily Revenue";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-900 to-black text-white">
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
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading revenue data...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-full pb-7">
                <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 pb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Revenue Report
                    </h1>
                    <p className="text-sm text-gray-400">
                      Monitor booking revenue and performance (Paid bookings
                      only)
                    </p>
                  </div>
                  <div className="flex items-center lg:justify-end gap-4">
                    <button
                      onClick={handleDownloadReport}
                      className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 cursor-pointer text-white rounded-xl transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export Detailed Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Time Filter */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="pl-12 pr-10 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white appearance-none cursor-pointer"
                    >
                      <option value="7days">Last 7 days</option>
                      <option value="30days">Last 30 days</option>
                      <option value="90days">Last 90 days</option>
                      <option value="yearly">Year to date</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Showing data for paid bookings only
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={DollarSign}
                  title="Total Revenue"
                  value={stats.totalRevenue}
                  color="#3B82F6"
                />
                <StatCard
                  icon={Home}
                  title="Total Bookings"
                  value={stats.totalBookings}
                  color="#10B981"
                />
                <StatCard
                  icon={CreditCard}
                  title="Avg Booking Value"
                  value={stats.averageBookingValue}
                  color="#8B5CF6"
                />
                <StatCard
                  icon={Users}
                  title="Occupancy Rate"
                  value={stats.occupancyRate}
                  color="#F59E0B"
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Daily Revenue Bar Chart */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {getDailyChartTitle()}
                      </h3>
                      <p className="text-gray-400">
                        Revenue from paid bookings
                      </p>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="date"
                          stroke="#9CA3AF"
                          fontSize={12}
                          angle={timeFilter === "30days" ? -45 : 0}
                          textAnchor={
                            timeFilter === "30days" ? "end" : "middle"
                          }
                          height={timeFilter === "30days" ? 60 : 30}
                        />
                        <YAxis
                          stroke="#9CA3AF"
                          fontSize={12}
                          tickFormatter={(value) =>
                            `₦${value.toLocaleString()}`
                          }
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          dataKey="revenue"
                          name="Revenue (₦)"
                          fill="#3B82F6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="bookings"
                          name="Bookings"
                          fill="#10B981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monthly Revenue Area Chart */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Monthly Trend
                      </h3>
                      <p className="text-gray-400">
                        Revenue trend from paid bookings
                      </p>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                        <YAxis
                          stroke="#9CA3AF"
                          fontSize={12}
                          tickFormatter={(value) =>
                            `₦${value.toLocaleString()}`
                          }
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue (₦)"
                          stroke="#8B5CF6"
                          fill="#8B5CF6"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Payment Method Distribution */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Payment Methods Distribution
                      </h3>
                      <p className="text-gray-400">
                        Revenue distribution by payment type (Paid bookings
                        only)
                      </p>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentMethodData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) =>
                            `${entry.name}: ${entry.percentage}%`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          {paymentMethodData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [
                            `₦${Number(value).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`,
                            props.payload.name,
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {paymentMethodData.map((method, index) => (
                      <div
                        key={method.name}
                        className="flex items-center gap-3"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index] }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-300">
                              {method.name}
                            </span>
                            <span className="text-sm font-semibold">
                              {method.percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700/50 h-2 rounded-full mt-1">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${method.percentage}%`,
                                backgroundColor: COLORS[index],
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            ₦{method.value.toLocaleString()} ({method.count}{" "}
                            bookings)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Revenue Breakdown Table */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Monthly Revenue Breakdown
                      </h3>
                      <p className="text-gray-400">
                        Detailed revenue by month (Paid bookings)
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Month
                          </th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Revenue
                          </th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Bookings
                          </th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Avg Value
                          </th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Share
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.slice(-5).map((month, index) => {
                          const share =
                            stats.totalRevenue > 0
                              ? (month.revenue / stats.totalRevenue) * 100
                              : 0;

                          return (
                            <tr
                              key={month.month}
                              className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: COLORS[index] }}
                                  ></div>
                                  <span className="font-medium">
                                    {month.month}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-emerald-400">
                                  ₦
                                  {month.revenue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-white">
                                  {month.bookings}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-white">
                                  ₦
                                  {month.avgBookingValue.toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-16 bg-gray-700/50 h-2 rounded-full">
                                    <div
                                      className="h-full rounded-full bg-sky-500"
                                      style={{
                                        width: `${share}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-400">
                                    {share.toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
