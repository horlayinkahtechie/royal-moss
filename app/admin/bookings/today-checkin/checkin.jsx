"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Home,
  Bed,
  Users,
  CreditCard,
  Settings,
  Bell,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  Eye,
  Mail,
  Phone,
  MapPin,
  Star,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Download,
  Printer,
  CalendarDays,
  Hotel,
  TrendingUp,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  BarChart3,
  Shield,
  Moon,
  Sun,
} from "lucide-react";
import Link from "next/link";
import supabase from "../../../lib/supabase";
import { format, parseISO, isToday, isAfter, isBefore } from "date-fns";
import { useRouter } from "next/navigation";
import { FaNairaSign } from "react-icons/fa6";
import Sidebar from "../../../_components/admin/Sidebar";

export default function TodayCheckinsCheckoutsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todaysCheckins, setTodaysCheckins] = useState([]);
  const [todaysCheckouts, setTodaysCheckouts] = useState([]);
  const [upcomingCheckins, setUpcomingCheckins] = useState([]);
  const [upcomingCheckouts, setUpcomingCheckouts] = useState([]);
  const [stats, setStats] = useState({
    totalCheckins: 0,
    totalCheckouts: 0,
    pendingArrivals: 0,
    pendingDepartures: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
  });

  // Check admin role and fetch data
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

      setLoading(false);
      fetchTodaysData();
    };

    checkAdminRole();
  }, [router]);

  const fetchTodaysData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const todayStr = format(today, "yyyy-MM-dd");

      // Fetch all bookings
      const { data: allBookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .order("check_in_date", { ascending: true });

      if (bookingsError) throw bookingsError;

      // Fetch all rooms
      const { data: allRooms, error: roomsError } = await supabase
        .from("rooms")
        .select("*");

      if (roomsError) throw roomsError;

      // Filter today's check-ins and check-outs
      const todayCheckins = allBookings.filter((booking) => {
        try {
          const checkInDate = new Date(booking.check_in_date);
          return isToday(checkInDate) && booking.booking_status !== "cancelled";
        } catch {
          return false;
        }
      });

      const todayCheckouts = allBookings.filter((booking) => {
        try {
          const checkOutDate = new Date(booking.check_out_date);
          return (
            isToday(checkOutDate) && booking.booking_status !== "cancelled"
          );
        } catch {
          return false;
        }
      });

      // Filter upcoming check-ins (next 3 days)
      const upcomingCheckins = allBookings.filter((booking) => {
        try {
          const checkInDate = new Date(booking.check_in_date);
          const threeDaysFromNow = new Date();
          threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
          return (
            isAfter(checkInDate, today) &&
            isBefore(checkInDate, threeDaysFromNow) &&
            booking.booking_status !== "cancelled"
          );
        } catch {
          return false;
        }
      });

      // Filter upcoming check-outs (next 3 days)
      const upcomingCheckouts = allBookings.filter((booking) => {
        try {
          const checkOutDate = new Date(booking.check_out_date);
          const threeDaysFromNow = new Date();
          threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
          return (
            isAfter(checkOutDate, today) &&
            isBefore(checkOutDate, threeDaysFromNow) &&
            booking.booking_status !== "cancelled"
          );
        } catch {
          return false;
        }
      });

      // Calculate room occupancy
      const totalRooms = allRooms.length || 0;
      const occupiedRooms = allBookings.filter((booking) => {
        try {
          const checkIn = new Date(booking.check_in_date);
          const checkOut = new Date(booking.check_out_date);
          return checkIn <= today && checkOut >= today;
        } catch {
          return false;
        }
      }).length;

      setTodaysCheckins(todayCheckins);
      setTodaysCheckouts(todayCheckouts);
      setUpcomingCheckins(upcomingCheckins);
      setUpcomingCheckouts(upcomingCheckouts);

      setStats({
        totalCheckins: todayCheckins.length,
        totalCheckouts: todayCheckouts.length,
        pendingArrivals: todayCheckins.filter(
          (b) => b.booking_status === "confirmed"
        ).length,
        pendingDepartures: todayCheckouts.filter(
          (b) => b.booking_status === "checked-in"
        ).length,
        totalRooms,
        occupiedRooms,
        availableRooms: totalRooms - occupiedRooms,
      });
    } catch (error) {
      console.error("Error fetching today's data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const config = {
      confirmed: {
        color: "bg-emerald-900/40 border-emerald-700 text-emerald-300",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Confirmed",
      },
      pending: {
        color: "bg-amber-900/40 border-amber-700 text-amber-300",
        icon: <Clock className="w-4 h-4" />,
        label: "Pending",
      },
      cancelled: {
        color: "bg-red-900/40 border-red-700 text-red-300",
        icon: <XCircle className="w-4 h-4" />,
        label: "Cancelled",
      },
      "checked-in": {
        color: "bg-blue-900/40 border-blue-700 text-blue-300",
        icon: <User className="w-4 h-4" />,
        label: "Checked In",
      },
      "checked-out": {
        color: "bg-purple-900/40 border-purple-700 text-purple-300",
        icon: <Calendar className="w-4 h-4" />,
        label: "Checked Out",
      },
    };

    const { color, icon, label } = config[status] || config.pending;

    return (
      <div
        className={`${color} px-3 py-1.5 rounded-lg border flex items-center gap-2 w-fit`}
      >
        {icon}
        <span className="text-sm font-medium capitalize">{label}</span>
      </div>
    );
  };

  const GuestCard = ({ guest, type = "checkin" }) => {
    const getTimeText = () => {
      if (type === "checkin") {
        return `Check-in: ${format(new Date(guest.check_in_date), "hh:mm a")}`;
      } else {
        return `Check-out: ${format(
          new Date(guest.check_out_date),
          "hh:mm a"
        )}`;
      }
    };

    const getActionButton = () => {
      if (type === "checkin") {
        if (guest.booking_status === "checked-in") {
          return (
            <button className="px-4 py-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Check className="w-4 h-4 inline mr-2" />
              Checked In
            </button>
          );
        }
        return (
          <button className="px-4 py-2 bg-sky-600 cursor-pointer hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors">
            Check In
          </button>
        );
      } else {
        if (guest.booking_status === "checked-out") {
          return (
            <button className="px-4 py-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Check className="w-4 h-4 inline mr-2" />
              Checked Out
            </button>
          );
        }
        return (
          <button className="px-4 py-2 cursor-pointer bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
            Check Out
          </button>
        );
      }
    };

    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 hover:border-sky-500/50 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-600 to-sky-700 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {guest.guest_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {guest.guest_name}
              </h3>
              <p className="text-sm text-gray-400">
                Room {guest.room_number} • {guest.room_category}
              </p>
              <p className="text-sm text-gray-400 mt-1">{getTimeText()}</p>
            </div>
          </div>
          <StatusBadge status={guest.booking_status} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Duration</p>
            <p className="text-white font-medium">
              {guest.no_of_nights} night{guest.no_of_nights !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Amount</p>
            <p className="text-white font-bold">
              <FaNairaSign className="inline w-4 h-4 mr-1" />
              {guest.total_amount}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Guests</p>
            <p className="text-white font-medium">
              {guest.no_of_guests} guest{guest.no_of_guests !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Contact</p>
            <p className="text-white font-medium">
              {guest.guest_phone || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
          {getActionButton()}
          <button className="flex items-center cursor-pointer gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg text-sm font-medium transition-colors">
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <button className="flex items-center cursor-pointer gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg text-sm font-medium transition-colors">
            <Mail className="w-4 h-4" />
            Send Message
          </button>
        </div>
      </div>
    );
  };

  const UpcomingCard = ({ guest, type = "checkin" }) => {
    const getDateText = () => {
      const date =
        type === "checkin" ? guest.check_in_date : guest.check_out_date;
      const formattedDate = format(new Date(date), "MMM dd, yyyy");
      const time = format(new Date(date), "hh:mm a");
      return `${formattedDate} at ${time}`;
    };

    const getDaysUntil = () => {
      const today = new Date();
      const targetDate = new Date(
        type === "checkin" ? guest.check_in_date : guest.check_out_date
      );
      const diffTime = targetDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      return `In ${diffDays} days`;
    };

    return (
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-4 hover:border-gray-600 transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {guest.guest_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {guest.guest_name}
              </h4>
              <p className="text-xs text-gray-400">Room {guest.room_number}</p>
            </div>
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-gray-700/50 text-gray-300 rounded">
            {getDaysUntil()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {type === "checkin" ? "Arrival" : "Departure"}: {getDateText()}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
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
          <p className="text-gray-400">
            Loading today's arrivals and departures...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-gray-800/50 backdrop-blur-sm border cursor-pointer border-gray-700 rounded-xl hover:bg-gray-700/50 transition-colors"
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

      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  Today's Arrivals & Departures
                </h1>
                <p className="text-gray-400">
                  {format(new Date(), "EEEE, MMMM dd, yyyy")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchTodaysData}
                  className="flex items-center cursor-pointer gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">Refresh</span>
                </button>

                <button className="flex cursor-pointer items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Today's Check-ins */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Today's Check-ins
                  </h2>
                  <p className="text-gray-400">Arrivals scheduled for today</p>
                </div>
                <div className="px-3 py-1.5 bg-sky-900/30 text-sky-400 rounded-lg text-sm font-medium">
                  {todaysCheckins.length} guest
                  {todaysCheckins.length !== 1 ? "s" : ""}
                </div>
              </div>

              {todaysCheckins.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    No check-ins scheduled for today
                  </h3>
                  <p className="text-gray-400">
                    All arrivals for today are complete
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysCheckins.map((guest) => (
                    <GuestCard key={guest.id} guest={guest} type="checkin" />
                  ))}
                </div>
              )}

              {/* Upcoming Check-ins */}
              {upcomingCheckins.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Upcoming Arrivals
                    </h3>
                    <span className="text-sm text-gray-400">Next 3 days</span>
                  </div>
                  <div className="space-y-3">
                    {upcomingCheckins.slice(0, 3).map((guest) => (
                      <UpcomingCard
                        key={guest.id}
                        guest={guest}
                        type="checkin"
                      />
                    ))}
                    {upcomingCheckins.length > 3 && (
                      <button className="w-full py-3 cursor-pointer text-center text-sm text-sky-400 hover:text-sky-300 transition-colors">
                        View all {upcomingCheckins.length} upcoming arrivals
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Today's Check-outs */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Today's Check-outs
                  </h2>
                  <p className="text-gray-400">
                    Departures scheduled for today
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-emerald-900/30 text-emerald-400 rounded-lg text-sm font-medium">
                  {todaysCheckouts.length} guest
                  {todaysCheckouts.length !== 1 ? "s" : ""}
                </div>
              </div>

              {todaysCheckouts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 rounded-2xl flex items-center justify-center">
                    <LogOut className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    No check-outs scheduled for today
                  </h3>
                  <p className="text-gray-400">
                    All departures for today are complete
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysCheckouts.map((guest) => (
                    <GuestCard key={guest.id} guest={guest} type="checkout" />
                  ))}
                </div>
              )}

              {/* Upcoming Check-outs */}
              {upcomingCheckouts.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Upcoming Departures
                    </h3>
                    <span className="text-sm text-gray-400">Next 3 days</span>
                  </div>
                  <div className="space-y-3">
                    {upcomingCheckouts.slice(0, 3).map((guest) => (
                      <UpcomingCard
                        key={guest.id}
                        guest={guest}
                        type="checkout"
                      />
                    ))}
                    {upcomingCheckouts.length > 3 && (
                      <button className="w-full py-3 cursor-pointer text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                        View all {upcomingCheckouts.length} upcoming departures
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/admin/quick-checkin"
                className="flex items-center cursor-pointer justify-center gap-3 p-6 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl transition-colors"
              >
                <div className="p-3 rounded-xl bg-sky-900/30">
                  <User className="w-6 h-6 text-sky-400" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-white">Check-in Guest</h4>
                  <p className="text-sm text-gray-400">Process new arrival</p>
                </div>
              </Link>

              <Link
                href="/admin/quick-checkin"
                className="flex items-center cursor-pointer justify-center gap-3 p-6 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl transition-colors"
              >
                <div className="p-3 rounded-xl bg-emerald-900/30">
                  <LogOut className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-white">Check-out Guest</h4>
                  <p className="text-sm text-gray-400">Process departure</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Last updated: {format(new Date(), "hh:mm a")}</p>
            <p className="mt-1">
              Click refresh to update the latest information
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
