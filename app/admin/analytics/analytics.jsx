"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Calendar,
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

// Chart components
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
      let startDate;
      let endDate = new Date();

      switch (timeFilter) {
        case "7days":
          startDate = new Date(today.setDate(today.getDate() - 7));
          break;
        case "30days":
          startDate = new Date(today.setDate(today.getDate() - 30));
          break;
        case "90days":
          startDate = new Date(today.setDate(today.getDate() - 90));
          break;
        case "yearly":
          startDate = new Date(today.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(today.setDate(today.getDate() - 30));
      }

      // Fetch bookings data
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true });

      if (bookingsError) throw bookingsError;

      // Process data for daily revenue chart
      const dailyRevenueMap = {};
      bookings.forEach((booking) => {
        const date = new Date(booking.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        if (!dailyRevenueMap[date]) {
          dailyRevenueMap[date] = {
            date,
            revenue: 0,
            bookings: 0,
            roomNights: booking.no_of_nights || 0,
          };
        }
        dailyRevenueMap[date].revenue += booking.total_amount || 0;
        dailyRevenueMap[date].bookings += 1;
      });

      const dailyData = Object.values(dailyRevenueMap).slice(-15); // Last 15 days
      setRevenueData(dailyData);

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
          };
        }
        monthlyRevenueMap[monthYear].revenue += booking.total_amount || 0;
        monthlyRevenueMap[monthYear].bookings += 1;
        monthlyRevenueMap[monthYear].avgBookingValue =
          monthlyRevenueMap[monthYear].revenue /
          monthlyRevenueMap[monthYear].bookings;
      });

      const monthlyDataArray = Object.values(monthlyRevenueMap).slice(-6); // Last 6 months
      setMonthlyData(monthlyDataArray);

      // Process payment method data
      const paymentMethods = {};
      bookings.forEach((booking) => {
        const method = booking.payment_method || "unknown";
        if (!paymentMethods[method]) {
          paymentMethods[method] = {
            name: method.charAt(0).toUpperCase() + method.slice(1),
            value: 0,
            count: 0,
          };
        }
        paymentMethods[method].value += booking.total_amount || 0;
        paymentMethods[method].count += 1;
      });

      const paymentData = Object.values(paymentMethods).map((item) => ({
        ...item,
        value: parseFloat(item.value.toFixed(2)),
      }));
      setPaymentMethodData(paymentData);

      // Calculate stats
      const totalRevenue = bookings.reduce(
        (sum, booking) => sum + (booking.total_amount || 0),
        0
      );
      const totalBookings = bookings.length;
      const averageBookingValue =
        totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Fetch rooms for occupancy rate
      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("room_number, room_availability");

      if (!roomsError && rooms && rooms.length > 0) {
        const occupiedRooms = rooms.filter(
          (room) => !room.room_availability
        ).length;
        const occupancyRate = (occupiedRooms / rooms.length) * 100;

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

  const handleDownloadReport = () => {
    // Create CSV content
    const headers = ["Date", "Revenue", "Bookings", "Average Booking Value"];
    const csvContent = [
      headers.join(","),
      ...revenueData.map((row) =>
        [
          row.date,
          row.revenue.toFixed(2),
          row.bookings,
          (row.revenue / row.bookings || 0).toFixed(2),
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
              <span className="font-bold">{entry.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Stats cards
  const StatCard = ({ icon: Icon, title, value, change, color }) => (
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
        {typeof value === "number"
          ? `₦${value.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}`
          : value}
      </div>
    </div>
  );

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

              <div>
                <h1 className="text-2xl font-bold text-white">
                  Revenue Report
                </h1>
                <p className="text-sm text-gray-400">
                  Monitor booking revenue and performance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 cursor-pointer text-white rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
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
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={DollarSign}
                  title="Total Revenue"
                  value={stats.totalRevenue}
                  //   change="+12.5%"
                  color="#3B82F6"
                />
                <StatCard
                  icon={Home}
                  title="Total Bookings"
                  value={stats.totalBookings}
                  //   change="+8.3%"
                  color="#10B981"
                />
                <StatCard
                  icon={CreditCard}
                  title="Avg Booking Value"
                  value={stats.averageBookingValue}
                  //   change="+5.2%"
                  color="#8B5CF6"
                />
                <StatCard
                  icon={Users}
                  title="Occupancy Rate"
                  value={`${stats.occupancyRate.toFixed(1)}%`}
                  //   change="+3.1%"
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
                        Daily Revenue
                      </h3>
                      <p className="text-gray-400">Revenue breakdown by day</p>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                        <YAxis
                          stroke="#9CA3AF"
                          fontSize={12}
                          tickFormatter={(value) => `₦${value / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          dataKey="revenue"
                          name="Revenue"
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
                      <p className="text-gray-400">Revenue trend over months</p>
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
                          tickFormatter={(value) => `₦${value / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
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
                        Payment Methods
                      </h3>
                      <p className="text-gray-400">
                        Revenue distribution by payment type
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
                            `${entry.name}: ₦${entry.value.toLocaleString()}`
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
                          formatter={(value) => [`₦${value}`, "Revenue"]}
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
                              ₦{method.value.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700/50 h-2 rounded-full mt-1">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${
                                  (method.value / stats.totalRevenue) * 100
                                }%`,
                                backgroundColor: COLORS[index],
                              }}
                            ></div>
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
                        Revenue Breakdown
                      </h3>
                      <p className="text-gray-400">
                        Detailed revenue by category
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">
                            Category
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
                        {monthlyData.slice(-5).map((month, index) => (
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
                                ₦{month.revenue.toLocaleString()}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-white">{month.bookings}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-white">
                                ₦{month.avgBookingValue.toLocaleString()}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-16 bg-gray-700/50 h-2 rounded-full">
                                  <div
                                    className="h-full rounded-full bg-sky-500"
                                    style={{
                                      width: `${
                                        (month.revenue / stats.totalRevenue) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-400">
                                  {(
                                    (month.revenue / stats.totalRevenue) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
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
