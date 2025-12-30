"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Check,
  Calendar,
  User,
  Phone,
  Mail,
  CreditCard,
  Clock,
  Users,
  Bed,
  AlertCircle,
  LogOut,
  LogIn,
  ChevronLeft,
  DollarSign,
  Receipt,
  Shield,
  Loader2,
} from "lucide-react";
import supabase from "../../lib/supabase";
import Sidebar from "@/app/_components/admin/Sidebar";
import { useRouter } from "next/navigation";

export default function AdminQuickCheckInOut() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const [searchType] = useState("booking_id");
  const [searchError, setSearchError] = useState("");

  // Booking state
  const [booking, setBooking] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);

  // Check-out state
  const [checkoutDetails, setCheckoutDetails] = useState({
    finalAmount: 0,
    additionalCharges: 0,
    damageCharges: 0,
    otherCharges: 0,
    notes: "",
    paymentMethod: "cash",
    transactionId: "",
  });

  // Active tab: checkin or checkout
  const [activeTab, setActiveTab] = useState("checkin");

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
    };

    checkAdminRole();
  }, [router]);

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      setSearchError("Please enter a room number or booking ID");
      return;
    }

    setLoading(true);
    setSearchError("");
    setBooking(null);
    setRoomDetails(null);

    try {
      let query = supabase.from("bookings").select("*");

      if (searchType === "room_number") {
        query = query.eq("room_number", searchInput.trim());
      } else {
        query = query.eq("booking_id", searchInput.trim());
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        setSearchError(
          `No booking found with ${
            searchType === "room_number" ? "room number" : "booking ID"
          }: ${searchInput}`
        );
        setLoading(false);
        return;
      }

      const foundBooking = data[0];
      setBooking(foundBooking);

      // Fetch room details
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("room_number", foundBooking.room_number)
        .single();

      if (!roomError) {
        setRoomDetails(roomData);
      }

      // Pre-calculate checkout details if checking out
      if (activeTab === "checkout" && foundBooking) {
        const totalAmount = foundBooking.total_amount || 0;
        setCheckoutDetails((prev) => ({
          ...prev,
          finalAmount: totalAmount,
        }));
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!booking) return;

    setProcessing(true);
    try {
      // Update booking status
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({
          booking_status: "checked-in",
          updated_at: new Date().toISOString(),
          admin_notes: `Checked in by admin on ${new Date().toLocaleString()}${
            booking.admin_notes
              ? `\nPrevious notes: ${booking.admin_notes}`
              : ""
          }`,
        })
        .eq("id", booking.id);

      if (bookingError) throw bookingError;

      // Update room availability
      const { error: roomError } = await supabase
        .from("rooms")
        .update({
          room_availability: false,
          updated_at: new Date().toISOString(),
        })
        .eq("room_number", booking.room_number);

      if (roomError) throw roomError;

      alert("✅ Guest checked in successfully!");

      // Refresh booking data
      const { data: updatedBooking } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", booking.id)
        .single();

      setBooking(updatedBooking);
    } catch (error) {
      console.error("Check-in error:", error);
      alert("❌ Failed to check in guest. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!booking) return;

    // Calculate totals
    const additionalTotal = parseFloat(checkoutDetails.additionalCharges) || 0;
    const damageTotal = parseFloat(checkoutDetails.damageCharges) || 0;
    const otherTotal = parseFloat(checkoutDetails.otherCharges) || 0;
    const finalTotal = parseFloat(checkoutDetails.finalAmount) || 0;

    if (finalTotal <= 0) {
      alert("Please enter a valid final amount");
      return;
    }

    if (
      !window.confirm(
        `Confirm check-out for Room ${booking.room_number}? Final amount: $${finalTotal}`
      )
    ) {
      return;
    }

    setProcessing(true);
    try {
      // Update booking status
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({
          booking_status: "checked-out",
          total_amount: finalTotal,
          payment_status:
            finalTotal <= (parseFloat(booking.paid_amount) || 0)
              ? "paid"
              : "partial",
          updated_at: new Date().toISOString(),
          admin_notes: `Checked out by admin on ${new Date().toLocaleString()}. Additional charges: $${additionalTotal}, Damage charges: $${damageTotal}, Other charges: $${otherTotal}. ${
            checkoutDetails.notes ? `Notes: ${checkoutDetails.notes}` : ""
          }${
            booking.admin_notes
              ? `\nPrevious notes: ${booking.admin_notes}`
              : ""
          }`,
          payment_method: checkoutDetails.paymentMethod,
          payment_reference: checkoutDetails.transactionId,
          paid_amount: finalTotal,
        })
        .eq("id", booking.id);

      if (bookingError) throw bookingError;

      // Update room availability
      const { error: roomError } = await supabase
        .from("rooms")
        .update({
          room_availability: true,
          updated_at: new Date().toISOString(),
          last_checkout: new Date().toISOString(),
        })
        .eq("room_number", booking.room_number);

      if (roomError) throw roomError;

      // Create payment record if needed
      if (additionalTotal > 0 || damageTotal > 0 || otherTotal > 0) {
        const { error: paymentError } = await supabase.from("payments").insert({
          booking_id: booking.id,
          room_number: booking.room_number,
          guest_email: booking.guest_email,
          amount: additionalTotal + damageTotal + otherTotal,
          payment_method: checkoutDetails.paymentMethod,
          transaction_id:
            checkoutDetails.transactionId || `CHKOUT-${Date.now()}`,
          payment_type: "additional_charges",
          status: "completed",
          notes: `Additional charges on check-out. Breakdown: Additional: $${additionalTotal}, Damage: $${damageTotal}, Other: $${otherTotal}`,
        });

        if (paymentError) console.error("Payment record error:", paymentError);
      }

      alert("✅ Guest checked out successfully!");

      // Reset form
      setSearchInput("");
      setBooking(null);
      setRoomDetails(null);
      setCheckoutDetails({
        finalAmount: 0,
        additionalCharges: 0,
        damageCharges: 0,
        otherCharges: 0,
        notes: "",
        paymentMethod: "cash",
        transactionId: "",
      });
    } catch (error) {
      console.error("Check-out error:", error);
      alert("❌ Failed to check out guest. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckoutDetailChange = (e) => {
    const { name, value } = e.target;

    if (
      name === "additionalCharges" ||
      name === "damageCharges" ||
      name === "otherCharges"
    ) {
      const additional = parseFloat(checkoutDetails.additionalCharges) || 0;
      const damage = parseFloat(checkoutDetails.damageCharges) || 0;
      const other = parseFloat(checkoutDetails.otherCharges) || 0;
      const baseAmount = booking?.total_amount || 0;

      let newValue = parseFloat(value) || 0;
      if (isNaN(newValue)) newValue = 0;

      const newDetails = {
        ...checkoutDetails,
        [name]: value,
      };

      // Recalculate final amount
      if (name === "additionalCharges") {
        newDetails.finalAmount = baseAmount + newValue + damage + other;
      } else if (name === "damageCharges") {
        newDetails.finalAmount = baseAmount + additional + newValue + other;
      } else if (name === "otherCharges") {
        newDetails.finalAmount = baseAmount + additional + damage + newValue;
      }

      setCheckoutDetails(newDetails);
    } else {
      setCheckoutDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const canCheckIn = () => {
    if (!booking) return false;
    return (
      booking.booking_status === "confirmed" ||
      booking.booking_status === "pending"
    );
  };

  const canCheckOut = () => {
    if (!booking) return false;
    return booking.booking_status === "checked-in";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateNightsLeft = () => {
    if (!booking) return 0;
    const checkOut = new Date(booking.check_out_date);
    const today = new Date();
    const diffTime = checkOut - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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

              <div>
                <h1 className="text-2xl font-bold text-white">
                  Admin - Quick Check-in/Check-out
                </h1>
                <p className="text-sm text-gray-400">
                  Manage guest check-ins and check-outs
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/admin/book-a-room")}
              className="flex cursor-pointer items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-700/50 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Book Room
            </button>
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
          {/* Tab Navigation */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="flex border-b border-gray-700">
              <button
                className={`px-6 py-3 font-medium text-lg transition-colors ${
                  activeTab === "checkin"
                    ? "text-sky-400 border-b-2 border-sky-400"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => {
                  setActiveTab("checkin");
                  setSearchInput("");
                  setBooking(null);
                  setSearchError("");
                }}
              >
                <div className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Quick Check-in
                </div>
              </button>
              <button
                className={`px-6 py-3 font-medium text-lg transition-colors ${
                  activeTab === "checkout"
                    ? "text-emerald-400 border-b-2 border-emerald-400"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => {
                  setActiveTab("checkout");
                  setSearchInput("");
                  setBooking(null);
                  setSearchError("");
                }}
              >
                <div className="flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  Quick Check-out
                </div>
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6">
                {activeTab === "checkin" ? "Check-in Guest" : "Check-out Guest"}
              </h2>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {searchType === "room_number"
                      ? "Room Number"
                      : "Booking ID"}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      placeholder={
                        searchType === "room_number"
                          ? "Enter room number (e.g., 101)"
                          : "Enter booking ID"
                      }
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    disabled={loading || !searchInput.trim()}
                    className="px-6 py-3 cursor-pointer bg-sky-600 hover:bg-sky-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2 min-w-35"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        Search
                      </>
                    )}
                  </button>
                </div>
              </div>

              {searchError && (
                <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-300">{searchError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Details */}
          {booking && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
                {/* Booking Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`px-3 py-1 rounded-lg flex items-center gap-2 ${
                          booking.booking_status === "checked-in"
                            ? "bg-emerald-900/30 text-emerald-300"
                            : booking.booking_status === "checked-out"
                            ? "bg-gray-700 text-gray-300"
                            : booking.booking_status === "confirmed"
                            ? "bg-sky-900/30 text-sky-300"
                            : "bg-yellow-900/30 text-yellow-300"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            booking.booking_status === "checked-in"
                              ? "bg-emerald-400"
                              : booking.booking_status === "checked-out"
                              ? "bg-gray-400"
                              : booking.booking_status === "confirmed"
                              ? "bg-sky-400"
                              : "bg-yellow-400"
                          }`}
                        ></div>
                        <span className="capitalize">
                          {booking.booking_status.replace("-", " ")}
                        </span>
                      </div>
                      <div className="px-3 py-1 bg-gray-700/50 rounded-lg text-sm">
                        Booking ID: {booking.booking_id}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Room #{booking.room_number} • {booking.guest_name}
                    </h2>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4 md:mt-0">
                    {activeTab === "checkin" && canCheckIn() && (
                      <button
                        onClick={handleCheckIn}
                        disabled={processing}
                        className="px-6 py-3 cursor-pointer bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                      >
                        {processing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                        Check In Guest
                      </button>
                    )}

                    {activeTab === "checkout" && canCheckOut() && (
                      <button
                        onClick={handleCheckOut}
                        disabled={processing}
                        className="px-6 py-3 cursor-pointer bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                      >
                        {processing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <LogOut className="w-5 h-5" />
                        )}
                        Check Out Guest
                      </button>
                    )}

                    {!canCheckIn() && !canCheckOut() && (
                      <div className="px-4 py-3 bg-gray-700/50 rounded-xl">
                        <p className="text-gray-300">
                          Cannot{" "}
                          {activeTab === "checkin" ? "check in" : "check out"} -
                          Status: {booking.booking_status}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Guest & Stay Info */}
                  <div>
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-sky-400" />
                        Guest Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-sky-900/30 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-sky-400" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Name</div>
                            <div className="font-medium text-white">
                              {booking.guest_name}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-sky-900/30 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-sky-400" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Email</div>
                            <div className="font-medium text-white">
                              {booking.guest_email}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-sky-900/30 rounded-lg flex items-center justify-center">
                            <Phone className="w-5 h-5 text-sky-400" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Phone</div>
                            <div className="font-medium text-white">
                              {booking.guest_phone}
                            </div>
                          </div>
                        </div>

                        {booking.special_requests && (
                          <div className="mt-4 p-4 bg-gray-900/30 rounded-xl">
                            <div className="text-sm text-gray-400 mb-1">
                              Special Requests
                            </div>
                            <div className="text-white">
                              {booking.special_requests}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                        Stay Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/30 p-4 rounded-xl">
                          <div className="text-sm text-gray-400">Check-in</div>
                          <div className="font-medium text-white">
                            {formatDate(booking.check_in_date)}
                          </div>
                        </div>
                        <div className="bg-gray-900/30 p-4 rounded-xl">
                          <div className="text-sm text-gray-400">Check-out</div>
                          <div className="font-medium text-white">
                            {formatDate(booking.check_out_date)}
                          </div>
                        </div>
                        <div className="bg-gray-900/30 p-4 rounded-xl">
                          <div className="text-sm text-gray-400">Nights</div>
                          <div className="font-medium text-white">
                            {booking.no_of_nights}
                          </div>
                        </div>
                        <div className="bg-gray-900/30 p-4 rounded-xl">
                          <div className="text-sm text-gray-400">Guests</div>
                          <div className="font-medium text-white">
                            {booking.no_of_guests}
                          </div>
                        </div>
                      </div>

                      {calculateNightsLeft() > 0 &&
                        booking.booking_status === "checked-in" && (
                          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-xl">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-300">
                                {calculateNightsLeft()} night
                                {calculateNightsLeft() !== 1 ? "s" : ""}{" "}
                                remaining
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Right Column: Room & Payment Info */}
                  <div>
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Bed className="w-5 h-5 text-purple-400" />
                        Room Information
                      </h3>
                      {roomDetails ? (
                        <div className="bg-gray-900/30 rounded-xl p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-20 h-20 bg-linear-to-br from-purple-900/50 to-pink-900/50 rounded-xl flex items-center justify-center">
                              <Bed className="w-8 h-8 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-white">
                                {roomDetails.room_title ||
                                  booking.room_category}
                              </h4>
                              <p className="text-gray-400 text-sm mb-2">
                                Room #{roomDetails.room_number}
                              </p>

                              <div className="flex flex-wrap gap-2 mt-3">
                                <div className="px-3 py-1 bg-gray-800/50 rounded-lg text-sm">
                                  <Users className="w-3 h-3 inline mr-1" />
                                  {roomDetails.no_of_guest || 2} guests
                                </div>
                                {roomDetails.amenities &&
                                  roomDetails.amenities
                                    .slice(0, 3)
                                    .map((amenity, idx) => (
                                      <div
                                        key={idx}
                                        className="px-3 py-1 bg-gray-800/50 rounded-lg text-sm"
                                      >
                                        {amenity}
                                      </div>
                                    ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-900/30 rounded-xl p-4">
                          <p className="text-gray-400">
                            Room details not available
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-yellow-400" />
                        Payment Information
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-gray-900/30 p-4 rounded-xl">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm text-gray-400">
                              Total Amount
                            </div>
                            <div className="text-2xl font-bold text-emerald-400">
                              ${booking.total_amount}
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              Payment Status
                            </span>
                            <span
                              className={`font-medium ${
                                booking.payment_status === "paid"
                                  ? "text-emerald-400"
                                  : booking.payment_status === "partial"
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }`}
                            >
                              {booking.payment_status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-900/30 p-4 rounded-xl">
                            <div className="text-sm text-gray-400">
                              Payment Method
                            </div>
                            <div className="font-medium text-white">
                              {booking.payment_method || "N/A"}
                            </div>
                          </div>
                          <div className="bg-gray-900/30 p-4 rounded-xl">
                            <div className="text-sm text-gray-400">
                              Reference
                            </div>
                            <div className="font-medium text-white text-sm truncate">
                              {booking.payment_reference || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Check-out Details Form (Only for check-out tab) */}
                {activeTab === "checkout" && canCheckOut() && (
                  <div className="mt-8 pt-8 border-t border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-6">
                      Check-out Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Additional Charges ($)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            name="additionalCharges"
                            value={checkoutDetails.additionalCharges}
                            onChange={handleCheckoutDetailChange}
                            min="0"
                            step="0.01"
                            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Damage Charges ($)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            name="damageCharges"
                            value={checkoutDetails.damageCharges}
                            onChange={handleCheckoutDetailChange}
                            min="0"
                            step="0.01"
                            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Other Charges ($)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            name="otherCharges"
                            value={checkoutDetails.otherCharges}
                            onChange={handleCheckoutDetailChange}
                            min="0"
                            step="0.01"
                            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Final Amount ($)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            name="finalAmount"
                            value={checkoutDetails.finalAmount}
                            onChange={handleCheckoutDetailChange}
                            min="0"
                            step="0.01"
                            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white font-bold"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Payment Method
                        </label>
                        <select
                          name="paymentMethod"
                          value={checkoutDetails.paymentMethod}
                          onChange={handleCheckoutDetailChange}
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                        >
                          <option value="cash">Cash</option>
                          <option value="transfer">Bank Transfer</option>
                          <option value="card">Card</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Transaction ID (Optional)
                        </label>
                        <div className="relative">
                          <Receipt className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="transactionId"
                            value={checkoutDetails.transactionId}
                            onChange={handleCheckoutDetailChange}
                            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                            placeholder="Enter transaction reference"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={checkoutDetails.notes}
                        onChange={handleCheckoutDetailChange}
                        rows="3"
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white resize-none"
                        placeholder="Additional notes for check-out..."
                      />
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {booking.admin_notes && (
                  <div className="mt-8 pt-8 border-t border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-gray-400" />
                      Admin Notes
                    </h3>
                    <div className="bg-gray-900/30 p-4 rounded-xl">
                      <p className="text-gray-300 whitespace-pre-line">
                        {booking.admin_notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!booking && !searchError && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-br from-gray-800/50 to-gray-900/50 rounded-2xl flex items-center justify-center">
                  {activeTab === "checkin" ? (
                    <LogIn className="w-12 h-12 text-gray-400" />
                  ) : (
                    <LogOut className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {activeTab === "checkin"
                    ? "Quick Check-in"
                    : "Quick Check-out"}
                </h3>
                <p className="text-gray-400 mb-6">
                  {activeTab === "checkin"
                    ? "Search for a guest booking with booking ID to check them in. Only bookings with 'confirmed' or 'pending' status can be checked in."
                    : "Search for a guest currently checked in by booking ID to process check-out. You can add additional charges if needed."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 text-sm text-gray-300">
                  <div className="p-4 bg-gray-900/30 rounded-xl justify-center items-center">
                    <div className="font-medium text-white mb-1">
                      Search by Booking ID
                    </div>
                    <p>Enter the booking reference ID</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
