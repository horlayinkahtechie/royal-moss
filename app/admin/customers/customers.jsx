"use client";

import { useState, useEffect } from "react";
import {
  Users,
  User,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Award,
  Star,
  Download,
  Filter,
  ChevronDown,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminCustomersReport() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

  // Data states
  const [customers, setCustomers] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [bookingFrequencyData, setBookingFrequencyData] = useState([]);
  const [customerGrowthData, setCustomerGrowthData] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    totalCustomers: 0,
    repeatCustomers: 0,
    newCustomers: 0,
    averageBookingsPerCustomer: 0,
  });

  const COLORS = [
    "#3B82F6", // Blue
    "#10B981", // Emerald
    "#8B5CF6", // Purple
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#EC4899", // Pink
    "#06B6D4", // Cyan
  ];

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

      fetchCustomersData();
    };

    checkAdminRole();
  }, [router, timeFilter]);

  const fetchCustomersData = async () => {
    try {
      setLoading(true);

      // Calculate date filter
      let filterQuery = supabase
        .from("bookings")
        .select("*")
        .not("guest_email", "is", null)
        .not("guest_name", "is", null);

      if (timeFilter !== "all") {
        const today = new Date();
        let startDate;

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
          case "year":
            startDate = new Date(today.getFullYear(), 0, 1);
            break;
        }

        filterQuery = filterQuery.gte("created_at", startDate.toISOString());
      }

      // Fetch bookings data
      const { data: bookings, error: bookingsError } = await filterQuery;

      if (bookingsError) throw bookingsError;

      // Process customer data
      const customerMap = new Map();

      bookings.forEach((booking) => {
        const email = booking.guest_email?.toLowerCase().trim();
        if (!email) return;

        if (!customerMap.has(email)) {
          customerMap.set(email, {
            email,
            name: booking.guest_name || "Unknown",
            phone: booking.guest_phone || "Not provided",
            bookings: [],
            totalSpent: 0,
            firstBooking: booking.created_at,
            lastBooking: booking.created_at,
          });
        }

        const customer = customerMap.get(email);
        customer.bookings.push({
          id: booking.booking_id,
          date: booking.created_at,
          room: booking.room_number,
          amount: booking.total_amount || 0,
          status: booking.booking_status,
        });

        customer.totalSpent += booking.total_amount || 0;

        // Update last booking date
        if (new Date(booking.created_at) > new Date(customer.lastBooking)) {
          customer.lastBooking = booking.created_at;
        }

        // Update first booking date
        if (new Date(booking.created_at) < new Date(customer.firstBooking)) {
          customer.firstBooking = booking.created_at;
        }
      });

      // Convert map to array and calculate additional metrics
      const customersArray = Array.from(customerMap.values()).map(
        (customer) => ({
          ...customer,
          bookingCount: customer.bookings.length,
          averageBookingValue: customer.totalSpent / customer.bookings.length,
          isRepeatCustomer: customer.bookings.length > 1,
        })
      );

      // Sort by booking count (descending)
      customersArray.sort((a, b) => b.bookingCount - a.bookingCount);

      setCustomers(customersArray);

      // Set top 3 customers
      setTopCustomers(customersArray.slice(0, 3));

      // Calculate stats
      const totalCustomers = customersArray.length;
      const repeatCustomers = customersArray.filter(
        (c) => c.bookingCount > 1
      ).length;
      const newCustomers = customersArray.filter((c) => {
        const firstBookingDate = new Date(c.firstBooking);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return firstBookingDate >= thirtyDaysAgo;
      }).length;
      const averageBookingsPerCustomer =
        totalCustomers > 0 ? bookings.length / totalCustomers : 0;

      setStats({
        totalCustomers,
        repeatCustomers,
        newCustomers,
        averageBookingsPerCustomer,
      });

      // Process booking frequency data
      const frequencyMap = {};
      customersArray.forEach((customer) => {
        const count = customer.bookingCount;
        if (!frequencyMap[count]) {
          frequencyMap[count] = 0;
        }
        frequencyMap[count] += 1;
      });

      const frequencyData = Object.entries(frequencyMap)
        .map(([bookings, customers]) => ({
          bookings: parseInt(bookings),
          customers,
          label: `${bookings} ${bookings === "1" ? "booking" : "bookings"}`,
        }))
        .sort((a, b) => a.bookings - b.bookings);

      setBookingFrequencyData(frequencyData);

      // Process customer growth data (last 6 months)
      const growthMap = {};
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthYear = `${
          monthNames[date.getMonth()]
        } ${date.getFullYear()}`;
        growthMap[monthYear] = 0;
      }

      customersArray.forEach((customer) => {
        const firstBookingDate = new Date(customer.firstBooking);
        const monthYear = `${
          monthNames[firstBookingDate.getMonth()]
        } ${firstBookingDate.getFullYear()}`;

        if (growthMap[monthYear] !== undefined) {
          growthMap[monthYear] += 1;
        }
      });

      const growthData = Object.entries(growthMap).map(
        ([month, customers]) => ({
          month,
          customers,
        })
      );

      setCustomerGrowthData(growthData);
    } catch (error) {
      console.error("Error fetching customers data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    const headers = [
      "Customer Name",
      "Email",
      "Phone",
      "Total Bookings",
      "Total Spent",
      "Average Booking Value",
      "First Booking",
      "Last Booking",
      "Repeat Customer",
    ];
    const csvContent = [
      headers.join(","),
      ...customers.map((customer) =>
        [
          `"${customer.name}"`,
          customer.email,
          `"${customer.phone}"`,
          customer.bookingCount,
          customer.totalSpent.toFixed(2),
          customer.averageBookingValue.toFixed(2),
          new Date(customer.firstBooking).toISOString().split("T")[0],
          new Date(customer.lastBooking).toISOString().split("T")[0],
          customer.isRepeatCustomer ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-report-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower)
      //   customer.phone.toLowerCase().includes(searchLower)
    );
  });

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Stats cards
  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-xl`}
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <span className="text-sm text-gray-400">{title}</span>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      {subtitle && <div className="text-sm text-gray-400">{subtitle}</div>}
    </div>
  );

  // Top customer card
  const TopCustomerCard = ({ customer, index }) => {
    const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // Gold, Silver, Bronze

    return (
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: rankColors[index] }}
            >
              {index + 1}
            </div>
            <div>
              <h4 className="font-bold text-white text-lg">{customer.name}</h4>
              <p className="text-sm text-gray-400">{customer.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-900/30 rounded-lg">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-bold">
              {customer.bookingCount} bookings
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-400">Total Spent</div>
            <div className="text-xl font-bold text-emerald-400">
              ${customer.totalSpent.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Avg/Booking</div>
            <div className="text-lg font-semibold text-white">
              $
              {customer.averageBookingValue.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">{customer.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">
              {new Date(customer.lastBooking).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Customer Since</span>
            <span className="text-sm font-medium text-white">
              {new Date(customer.firstBooking).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Customer row component
  const CustomerRow = ({ customer }) => (
    <tr className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-900/50 to-purple-900/50 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="font-semibold text-white">{customer.name}</div>
            <div className="text-sm text-gray-400">{customer.email}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{customer.phone}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              customer.bookingCount === 1
                ? "bg-blue-900/30 text-blue-400"
                : customer.bookingCount === 2
                ? "bg-purple-900/30 text-purple-400"
                : "bg-emerald-900/30 text-emerald-400"
            }`}
          >
            {customer.bookingCount}{" "}
            {customer.bookingCount === 1 ? "booking" : "bookings"}
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-emerald-400 font-bold">
          ${customer.totalSpent.toLocaleString()}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-white">
          $
          {customer.averageBookingValue.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          {customer.isRepeatCustomer ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Repeat Customer</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400">First Time</span>
            </>
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm text-gray-300">
          {new Date(customer.lastBooking).toLocaleDateString()}
        </div>
      </td>
    </tr>
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
                  Customers Report
                </h1>
                <p className="text-sm text-gray-400">
                  View customer bookings and loyalty metrics
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
                <p className="text-gray-400">Loading customer data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Filters and Search */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex flex-wrap gap-4">
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="pl-12 pr-10 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white appearance-none cursor-pointer"
                    >
                      <option value="all">All Time</option>
                      <option value="year">This Year</option>
                      <option value="90days">Last 90 Days</option>
                      <option value="30days">Last 30 Days</option>
                      <option value="7days">Last 7 Days</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>

                  <div className="relative flex-1 md:w-96">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search customers by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-400">
                  Showing {filteredCustomers.length} of {customers.length}{" "}
                  customers
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={Users}
                  title="Total Customers"
                  value={stats.totalCustomers.toLocaleString()}
                  subtitle={`${stats.repeatCustomers} repeat customers`}
                  color="#3B82F6"
                />
                <StatCard
                  icon={TrendingUp}
                  title="Repeat Rate"
                  value={`${(
                    (stats.repeatCustomers / stats.totalCustomers) *
                    100
                  ).toFixed(1)}%`}
                  subtitle="Customers with 2+ bookings"
                  color="#10B981"
                />
                <StatCard
                  icon={User}
                  title="New Customers"
                  value={stats.newCustomers}
                  subtitle="Last 30 days"
                  color="#8B5CF6"
                />
                <StatCard
                  icon={DollarSign}
                  title="Avg Bookings/Customer"
                  value={stats.averageBookingsPerCustomer.toFixed(1)}
                  subtitle="Average booking frequency"
                  color="#F59E0B"
                />
              </div>

              {/* Top Customers Section */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Top Customers
                    </h3>
                    <p className="text-gray-400">
                      Most loyal customers by booking frequency
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-700/50 rounded-xl">
                    <Award className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-400 font-medium">
                      Loyalty Leaders
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {topCustomers.map((customer, index) => (
                    <TopCustomerCard
                      key={customer.email}
                      customer={customer}
                      index={index}
                    />
                  ))}
                </div>

                {/* Insights */}
                <div className="p-4 bg-sky-900/20 border border-sky-700/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-sky-400" />
                    <p className="text-sm text-gray-300">
                      Top 3 customers account for{" "}
                      <span className="font-semibold text-white">
                        {topCustomers.length > 0
                          ? (
                              (topCustomers.reduce(
                                (sum, c) => sum + c.totalSpent,
                                0
                              ) /
                                customers.reduce(
                                  (sum, c) => sum + c.totalSpent,
                                  0
                                )) *
                              100
                            ).toFixed(1)
                          : "0"}
                        %
                      </span>{" "}
                      of total revenue and have made{" "}
                      <span className="font-semibold text-white">
                        {topCustomers.reduce(
                          (sum, c) => sum + c.bookingCount,
                          0
                        )}
                      </span>{" "}
                      total bookings.
                    </p>
                  </div>
                </div>
              </div>

              {/* Customers Table */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      All Customers
                    </h3>
                    <p className="text-gray-400">
                      Detailed customer information and booking history
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {filteredCustomers.length} customers found
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-700">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-900/50">
                        <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                          Customer
                        </th>
                        <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                          Contact
                        </th>
                        <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                          Bookings
                        </th>
                        <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                          Total Spent
                        </th>
                        <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                          Avg/Booking
                        </th>
                        <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                          Customer Type
                        </th>
                        <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                          Last Booking
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                          <CustomerRow
                            key={customer.email}
                            customer={customer}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="py-12 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <Users className="w-12 h-12 text-gray-600 mb-4" />
                              <p className="text-gray-400">
                                No customers found
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                Try adjusting your search or filters
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination would go here */}
                {filteredCustomers.length > 10 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
                    <div className="text-sm text-gray-400">
                      Showing 1-10 of {filteredCustomers.length} customers
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 border border-gray-600 hover:bg-gray-700/50 rounded-lg transition-colors">
                        Previous
                      </button>
                      <button className="px-4 py-2 border border-gray-600 hover:bg-gray-700/50 rounded-lg transition-colors">
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Booking Frequency Distribution */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Booking Frequency
                      </h3>
                      <p className="text-gray-400">
                        Distribution of customers by number of bookings
                      </p>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bookingFrequencyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          dataKey="customers"
                          name="Number of Customers"
                          fill="#3B82F6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {bookingFrequencyData.slice(0, 3).map((item, index) => (
                      <div key={item.bookings} className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {item.customers}
                        </div>
                        <div className="text-sm text-gray-400">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Growth Chart */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Customer Growth
                      </h3>
                      <p className="text-gray-400">
                        New customer acquisition over time
                      </p>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={customerGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          dataKey="customers"
                          name="New Customers"
                          fill="#10B981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-4 bg-emerald-900/20 border border-emerald-700/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <p className="text-sm text-gray-300">
                        Total new customers in the last 6 months:{" "}
                        <span className="font-semibold text-white">
                          {customerGrowthData.reduce(
                            (sum, month) => sum + month.customers,
                            0
                          )}
                        </span>
                      </p>
                    </div>
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
