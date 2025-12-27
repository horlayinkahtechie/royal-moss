"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import supabase from "../lib/supabase";
import Image from "next/image";
import {
  Calendar,
  User,
  Users,
  CreditCard,
  Shield,
  CheckCircle,
  ArrowLeft,
  Clock,
  Star,
  Maximize2,
  Building,
  Eye,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LogIn,
} from "lucide-react";
import {
  format,
  addDays,
  subDays,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  startOfDay,
  isBefore,
  parseISO,
} from "date-fns";

// Utility function to format price with K, M, B suffixes
const formatPrice = (amount, includeK = false) => {
  if (amount === null || amount === undefined) return "₦0";

  // Convert to number if it's a string
  const numericAmount =
    typeof amount === "string"
      ? parseFloat(amount.replace(/[^0-9.-]+/g, ""))
      : Number(amount);

  if (isNaN(numericAmount)) return "₦0";

  if (Math.abs(numericAmount) >= 1000000000) {
    return `₦${(numericAmount / 1000000000).toFixed(1).replace(/\.0$/, "")}B`;
  } else if (Math.abs(numericAmount) >= 1000000) {
    return `₦${(numericAmount / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  } else if (Math.abs(numericAmount) >= 1000) {
    return `₦${(numericAmount / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  } else {
    return `₦${numericAmount}${includeK && numericAmount !== 0 ? "K" : ""}`;
  }
};

// Helper function to extract numeric value from price (handles both formatted strings and numbers)
const extractNumericPrice = (priceValue) => {
  if (priceValue === null || priceValue === undefined) return 0;

  // If it's already a number, return it
  if (typeof priceValue === "number") return priceValue;

  // If it's a string, parse it
  if (typeof priceValue === "string") {
    // Remove currency symbol and any commas
    let cleanValue = priceValue.replace(/[₦,]/g, "").trim();

    // Check for K, M, B suffixes
    if (cleanValue.endsWith("B") || cleanValue.endsWith("b")) {
      const number = parseFloat(cleanValue.slice(0, -1));
      return number * 1000000000;
    } else if (cleanValue.endsWith("M") || cleanValue.endsWith("m")) {
      const number = parseFloat(cleanValue.slice(0, -1));
      return number * 1000000;
    } else if (cleanValue.endsWith("K") || cleanValue.endsWith("k")) {
      const number = parseFloat(cleanValue.slice(0, -1));
      return number * 1000;
    } else {
      // Just a plain number
      return parseFloat(cleanValue) || 0;
    }
  }

  // If it's something else, try to convert to number
  return Number(priceValue) || 0;
};

export default function Book() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = searchParams.get("roomId");
  const roomType = searchParams.get("type");
  const roomPrice = searchParams.get("price");
  const roomTitle = searchParams.get("title");
  const roomImage = searchParams.get("roomImage");

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [room, setRoom] = useState(null);

  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [existingBookings, setExistingBookings] = useState([]);
  const [dateValidationError, setDateValidationError] = useState("");
  const [showCalendar, setShowCalendar] = useState({
    checkIn: false,
    checkOut: false,
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentError, setPaymentError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkInDate: "",
    checkOutDate: "",
    noOfGuests: 1,
    specialRequests: "",
    paymentMethod: "paystack",
  });

  // Calculate derived values
  const [calculatedValues, setCalculatedValues] = useState({
    noOfNights: 0,
    totalAmount: 0,
  });

  // PayStack Script Loader
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const paystackScriptRef = useRef(null);

  useEffect(() => {
    // Load PayStack script
    const loadPaystackScript = () => {
      // Check if script is already loaded
      if (
        document.querySelector(
          'script[src="https://js.paystack.co/v1/inline.js"]'
        )
      ) {
        setPaystackLoaded(true);
        console.log("PayStack script already loaded");
        return;
      }

      paystackScriptRef.current = document.createElement("script");
      paystackScriptRef.current.src = "https://js.paystack.co/v1/inline.js";
      paystackScriptRef.current.async = true;

      paystackScriptRef.current.onload = () => {
        console.log("PayStack script loaded successfully");
        setPaystackLoaded(true);
      };

      paystackScriptRef.current.onerror = () => {
        console.error("Failed to load PayStack script");
        setPaymentError(
          "Payment service is currently unavailable. Please try again later."
        );
        setPaystackLoaded(false);
      };

      document.body.appendChild(paystackScriptRef.current);
    };

    loadPaystackScript();

    return () => {
      // Clean up script on unmount
      if (
        paystackScriptRef.current &&
        document.body.contains(paystackScriptRef.current)
      ) {
        document.body.removeChild(paystackScriptRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (bookingSuccess) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [bookingSuccess]);

  useEffect(() => {
    const getUser = async () => {
      try {
        setIsAuthLoading(true);
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user:", error);
          setUser(null);
        } else {
          setUser(user);

          if (user) {
            setFormData((prev) => ({
              ...prev,
              guestEmail: user.email || "",
              guestName: user.user_metadata?.full_name || "",
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    getUser();
    fetchRoomDetails();
    fetchExistingBookings();

    // Check if this is a payment callback
    const checkPaymentStatus = () => {
      const ref = searchParams.get("reference");
      const trxref = searchParams.get("trxref");

      if (ref || trxref) {
        verifyPaymentCallback(ref || trxref);
      }
    };

    checkPaymentStatus();
  }, [roomId, roomType, searchParams]);

  const verifyPaymentCallback = async (reference) => {
    try {
      const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (data.status) {
        setPaymentStatus("completed");
        // Update booking status in database
        await updateBookingPaymentStatus(reference, "paid");

        // Show success message
        setBookingSuccess(true);
      } else {
        setPaymentStatus("failed");
        alert("Payment verification failed. Please contact support.");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setPaymentStatus("failed");
    }
  };

  const updateBookingPaymentStatus = async (reference, status) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          payment_status: status,
          booking_status: status === "paid" ? "confirmed" : "pending",
        })
        .eq("booking_id", reference);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  useEffect(() => {
    // Calculate number of nights and total amount when dates change
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = parseISO(formData.checkInDate);
      const checkOut = parseISO(formData.checkOutDate);

      const diffTime = Math.abs(checkOut - checkIn);
      const noOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Extract numeric price
      const pricePerNight = extractNumericPrice(roomPrice);
      const totalAmount = noOfNights * pricePerNight;

      setCalculatedValues({
        noOfNights,
        totalAmount,
      });

      // Validate dates against existing bookings
      validateDates(checkIn, checkOut);
    }
  }, [
    formData.checkInDate,
    formData.checkOutDate,
    room,
    roomPrice,
    existingBookings,
  ]);

  const fetchExistingBookings = async () => {
    if (!roomType) return;

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("check_in_date, check_out_date")
        .eq("room_category", roomType)
        .in("booking_status", ["confirmed", "checked_in"])
        .order("check_in_date", { ascending: true });

      if (error) throw error;
      setExistingBookings(data || []);
    } catch (error) {
      console.error("Error fetching existing bookings:", error);
    }
  };

  // Helper function to normalize dates (remove time component)
  const normalizeDate = (date) => {
    return startOfDay(new Date(date));
  };

  // Check if a specific date is within any booked interval
  const isDateBooked = (date) => {
    const checkDate = normalizeDate(date);

    for (const booking of existingBookings) {
      const bookedStart = normalizeDate(booking.check_in_date);
      const bookedEnd = normalizeDate(booking.check_out_date);

      // Check if date is within booked interval (check-in inclusive, check-out exclusive)
      if (checkDate >= bookedStart && checkDate < bookedEnd) {
        return true;
      }
    }

    return false;
  };

  // Check if a date range overlaps with any existing booking
  const validateDateRange = (checkIn, checkOut) => {
    const normalizedCheckIn = normalizeDate(checkIn);
    const normalizedCheckOut = normalizeDate(checkOut);

    for (const booking of existingBookings) {
      const bookedStart = normalizeDate(booking.check_in_date);
      const bookedEnd = normalizeDate(booking.check_out_date);

      // Check for any overlap
      if (
        (normalizedCheckIn >= bookedStart && normalizedCheckIn < bookedEnd) ||
        (normalizedCheckOut > bookedStart && normalizedCheckOut <= bookedEnd) ||
        (normalizedCheckIn <= bookedStart && normalizedCheckOut >= bookedEnd)
      ) {
        return {
          isValid: false,
          message: `Room is already booked from ${format(
            bookedStart,
            "MMM dd, yyyy"
          )} to ${format(bookedEnd, "MMM dd, yyyy")}`,
        };
      }
    }

    return { isValid: true };
  };

  const validateDates = (checkIn, checkOut) => {
    setDateValidationError("");

    // Basic validation
    if (checkOut <= checkIn) {
      setDateValidationError("Check-out date must be after check-in date");
      return false;
    }

    // Validate against existing bookings
    const validation = validateDateRange(checkIn, checkOut);
    if (!validation.isValid) {
      setDateValidationError(validation.message);
      return false;
    }

    return true;
  };

  const generateBookingReference = () => {
    const prefix = "RM";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateSelect = (date, type) => {
    const dateStr = format(date, "yyyy-MM-dd");

    if (type === "checkIn") {
      // If check-out is before new check-in, reset check-out
      if (
        formData.checkOutDate &&
        normalizeDate(formData.checkOutDate) <= date
      ) {
        const nextDay = addDays(date, 1);
        setFormData({
          ...formData,
          checkInDate: dateStr,
          checkOutDate: format(nextDay, "yyyy-MM-dd"),
        });
      } else {
        setFormData({
          ...formData,
          checkInDate: dateStr,
        });
      }
      setShowCalendar({ checkIn: false, checkOut: false });
    } else if (type === "checkOut") {
      if (normalizeDate(formData.checkInDate) >= date) {
        alert("Check-out date must be after check-in date");
        return;
      }
      setFormData({
        ...formData,
        checkOutDate: dateStr,
      });
      setShowCalendar({ checkIn: false, checkOut: false });
    }
  };

  const fetchRoomDetails = async () => {
    if (!roomId) return;

    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (error) throw error;

      if (data) {
        // Get images array safely
        let images = [];
        if (data.room_image) {
          if (Array.isArray(data.room_image)) {
            images = data.room_image;
          } else if (typeof data.room_image === "string") {
            try {
              const parsed = JSON.parse(data.room_image);
              images = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              // If it's a single URL string
              images = [data.room_image];
            }
          }
        }

        setRoom({
          id: data.id,
          title:
            roomTitle ||
            data.room_category
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
          price: data.price_per_night,
          discountedPrice: data.discounted_price_per_night,
          rating: data.user_ratings || 4.5,
          guests: data.no_of_guest,
          size: data.room_dismesion,
          roomNumber: data.room_number,
          floor: data.floor || "3rd",
          view: data.view || "Ocean View",
          description: data.room_description,
          images: images,
        });
      }
    } catch (error) {
      console.error("Error fetching room details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user authentication
  const handleLogin = async () => {
    try {
      // You can redirect to login page or show login modal
      router.push("/login?redirect=/book");
    } catch (error) {
      console.error("Login error:", error);
      alert("Please login to continue with booking");
    }
  };

  // PayStack Payment Handler
  const handlePaystackPayment = async (
    bookingFormData,
    totalAmount,
    bookingRef
  ) => {
    return new Promise((resolve, reject) => {
      // Wait a bit more to ensure PayStack is fully loaded
      setTimeout(() => {
        if (
          !window.PaystackPop ||
          typeof window.PaystackPop.setup !== "function"
        ) {
          console.error("PayStack not available or not properly loaded");
          reject(
            new Error(
              "PayStack payment service is not available. Please refresh and try again."
            )
          );
          return;
        }

        console.log("Setting up PayStack payment with ref:", bookingRef);

        try {
          const handler = window.PaystackPop.setup({
            key:
              process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
              "pk_test_YOUR_TEST_KEY", // Make sure this is set in your .env.local
            email: formData.guestEmail,
            amount: totalAmount * 100, // Convert to kobo
            currency: "NGN",
            ref: bookingRef,
            metadata: {
              booking_id: bookingRef,
              guest_name: formData.guestName,
              room_type: roomType,
              check_in_date: formData.checkInDate,
              check_out_date: formData.checkOutDate,
              no_of_nights: calculatedValues.noOfNights,
              no_of_guests: formData.noOfGuests,
            },
            callback: function (response) {
              console.log("PayStack callback response:", response);

              // Handle the response in the main async function
              if (response.status === "success") {
                resolve(response);
              } else {
                reject(new Error("Payment failed or was cancelled"));
              }
            },
            onClose: function () {
              console.log("Payment window closed by user");
              reject(new Error("Payment cancelled by user"));
            },
          });

          console.log("Opening PayStack iframe...");
          handler.openIframe();
        } catch (error) {
          console.error("Error setting up PayStack:", error);
          reject(new Error("Failed to initialize payment. Please try again."));
        }
      }, 500); // Small delay to ensure everything is ready
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!user) {
      alert("Please login to continue with booking");
      handleLogin();
      return;
    }

    // Check if PayStack is loaded
    if (!paystackLoaded) {
      setPaymentError(
        "Payment service is still loading. Please wait a moment and try again."
      );
      return;
    }

    // Validate dates
    if (!formData.checkInDate || !formData.checkOutDate) {
      alert("Please select check-in and check-out dates");
      return;
    }

    const checkIn = normalizeDate(formData.checkInDate);
    const checkOut = normalizeDate(formData.checkOutDate);

    if (checkOut <= checkIn) {
      alert("Check-out date must be after check-in date");
      return;
    }

    // Validate against existing bookings
    const validation = validateDateRange(checkIn, checkOut);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    // Validate required fields
    if (!formData.guestName || !formData.guestEmail || !formData.guestPhone) {
      alert("Please fill in all required personal information fields");
      return;
    }

    setIsSubmitting(true);
    setPaymentError("");
    let bookingRef;

    try {
      bookingRef = generateBookingReference();
      setBookingReference(bookingRef);

      const diffTime = Math.abs(checkOut - checkIn);
      const noOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const pricePerNight = extractNumericPrice(roomPrice);
      const totalAmount = noOfNights * pricePerNight;

      // Get the room image - try multiple sources
      let roomImageToSave = roomImage || "";
      if (!roomImageToSave && room?.images?.length > 0) {
        roomImageToSave = room.images[0];
      }

      // Prepare booking data with correct field names
      const bookingFormData = {
        check_in_date: formData.checkInDate,
        check_out_date: formData.checkOutDate,
        room_number: room?.roomNumber || `Room ${roomId?.slice(-4)}`,
        user_id: user.id,
        guest_name: formData.guestName,
        guest_email: formData.guestEmail,
        guest_phone: formData.guestPhone,
        room_category: roomType,
        no_of_nights: noOfNights,
        price_per_night: pricePerNight,
        room_image: roomImageToSave,
        room_title: room?.title || roomTitle || "Room Booking",
        no_of_guests: parseInt(formData.noOfGuests),
        total_amount: totalAmount,
        currency: "NGN",
        payment_method: formData.paymentMethod,
        special_requests: formData.specialRequests,
        booking_id: bookingRef,
        created_at: new Date().toISOString(),
      };

      console.log("Booking data prepared:", bookingFormData);

      // Store in localStorage BEFORE payment (for recovery if needed)
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `booking_${bookingRef}`,
          JSON.stringify(bookingFormData)
        );
      }

      // Process payment based on selected method
      if (formData.paymentMethod === "paystack") {
        console.log("Initiating PayStack payment...");

        // Make sure PayStack is available
        if (!window.PaystackPop) {
          throw new Error(
            "Payment service not ready. Please refresh the page."
          );
        }

        // Initiate PayStack payment
        const paymentResponse = await handlePaystackPayment(
          bookingFormData,
          totalAmount,
          bookingRef
        );

        if (paymentResponse.status === "success") {
          console.log("PayStack payment successful, verifying...");

          // Verify payment on backend
          const verifyResponse = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ reference: paymentResponse.reference }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.status && verifyData.data.status === "success") {
            // Add payment details to booking data
            const finalBookingData = {
              ...bookingFormData,
              payment_reference: paymentResponse.reference,
              payment_status: "paid",
              booking_status: "confirmed",
              payment_data: verifyData.data,
              updated_at: new Date().toISOString(),
            };

            // Create booking in database
            const { data: bookingData, error: bookingError } = await supabase
              .from("bookings")
              .insert([finalBookingData])
              .select()
              .single();

            if (bookingError) {
              console.error("Error saving booking:", bookingError);
              throw new Error("Failed to save booking after payment");
            }

            // Clean up localStorage
            if (typeof window !== "undefined") {
              localStorage.removeItem(`booking_${bookingRef}`);
            }

            // Show success
            setBookingSuccess(true);
            setBookingReference(bookingRef);
            setPaymentStatus("completed");
            setIsSubmitting(false);
          } else {
            throw new Error("Payment verification failed");
          }
        } else {
          throw new Error("Payment failed");
        }
      } else {
        throw new Error("Unsupported payment method");
      }
    } catch (error) {
      console.error("Error processing booking:", error);

      let errorMessage = "Failed to process payment. Please try again.";
      if (error.message.includes("cancelled")) {
        errorMessage = "Payment was cancelled. No booking was created.";
      } else if (
        error.message.includes("not ready") ||
        error.message.includes("not available")
      ) {
        errorMessage =
          "Payment service is not ready. Please refresh the page and try again.";
      }

      setPaymentError(errorMessage);
      alert(errorMessage);

      // Clean up on error
      if (typeof window !== "undefined" && bookingRef) {
        localStorage.removeItem(`booking_${bookingRef}`);
      }

      setIsSubmitting(false);
    }
  };

  // Get all booked dates as strings (YYYY-MM-DD)
  const getBookedDates = () => {
    const bookedDates = new Set();

    existingBookings.forEach((booking) => {
      const start = normalizeDate(booking.check_in_date);
      const end = normalizeDate(booking.check_out_date);

      // Get all dates between check-in and check-out (excluding check-out date)
      let current = new Date(start);
      while (current < end) {
        bookedDates.add(format(current, "yyyy-MM-dd"));
        current.setDate(current.getDate() + 1);
      }
    });

    return Array.from(bookedDates);
  };

  // Generate calendar days for current month
  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfMonth(currentMonth);
    const endDate = endOfMonth(currentMonth);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((day) => {
      const normalizedDay = normalizeDate(day);
      const today = normalizeDate(new Date());

      return {
        date: day,
        isCurrentMonth: isSameMonth(day, currentMonth),
        isToday: isSameDay(normalizedDay, today),
        isPast:
          isBefore(normalizedDay, today) && !isSameDay(normalizedDay, today),
        isBooked: isDateBooked(day),
        isSelected:
          (formData.checkInDate &&
            isSameDay(normalizedDay, normalizeDate(formData.checkInDate))) ||
          (formData.checkOutDate &&
            isSameDay(normalizedDay, normalizeDate(formData.checkOutDate))),
        isInRange:
          formData.checkInDate &&
          formData.checkOutDate &&
          normalizedDay >= normalizeDate(formData.checkInDate) &&
          normalizedDay <= normalizeDate(formData.checkOutDate),
      };
    });
  };

  const prevMonth = () => {
    setCurrentMonth(subDays(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addDays(currentMonth, 1));
  };

  // Custom Date Input Component with Calendar
  const DatePicker = ({ type, label, value, onChange, disabled }) => {
    const calendarDays = getCalendarDays();
    const today = normalizeDate(new Date());

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} *
        </label>
        <div className="relative">
          <input
            type="text"
            readOnly
            value={value ? format(normalizeDate(value), "MMM dd, yyyy") : ""}
            onClick={() =>
              setShowCalendar((prev) => ({ ...prev, [type]: !prev[type] }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none cursor-pointer bg-white"
            placeholder={`Select ${label.toLowerCase()}`}
            disabled={disabled}
          />
          <Calendar className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {showCalendar[type] && (
          <div className="absolute z-10 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-72">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-gray-900">
                {format(currentMonth, "MMMM yyyy")}
              </h3>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const isSelectable = !day.isPast && !day.isBooked;

                return (
                  <button
                    key={index}
                    onClick={() =>
                      isSelectable && handleDateSelect(day.date, type)
                    }
                    disabled={!isSelectable}
                    className={`
                      h-9 rounded-lg text-sm font-medium transition-all
                      ${!day.isCurrentMonth ? "text-gray-400" : "text-gray-900"}
                      ${
                        day.isToday && !day.isSelected
                          ? "border-2 border-sky-500"
                          : ""
                      }
                      ${day.isSelected ? "bg-sky-600 text-white" : ""}
                      ${
                        day.isInRange && !day.isSelected
                          ? "bg-sky-100 text-sky-700"
                          : ""
                      }
                      ${
                        day.isBooked
                          ? "bg-rose-50 text-rose-400 line-through cursor-not-allowed"
                          : ""
                      }
                      ${
                        day.isPast
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : ""
                      }
                      ${
                        isSelectable && !day.isSelected && !day.isInRange
                          ? "hover:bg-gray-100"
                          : ""
                      }
                      ${!day.isCurrentMonth ? "opacity-50" : ""}
                    `}
                  >
                    {format(day.date, "d")}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-sky-600 rounded mr-1"></div>
                  <span className="text-gray-600">Selected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-rose-50 border border-rose-200 rounded mr-1"></div>
                  <span className="text-gray-600">Booked</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-100 rounded mr-1"></div>
                  <span className="text-gray-600">Past</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-sky-100 rounded mr-1"></div>
                  <span className="text-gray-600">In Range</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getRoomImage = (images) => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return null;
    }
    const validImages = images.filter(
      (img) => img && typeof img === "string" && img.trim() !== ""
    );

    return validImages.length > 0 ? validImages[0] : null;
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-amber-100">
              <LogIn className="w-12 h-12 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Login Required
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              You need to be logged in to complete your booking. Please login or
              create an account to continue.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() =>
                  router.push(
                    "/login?redirect=" +
                      window.location.pathname +
                      window.location.search
                  )
                }
                className="px-6 py-3 bg-sky-600 cursor-pointer text-white rounded-full font-semibold hover:bg-sky-700 transition-colors"
              >
                Login to Continue
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 border cursor-pointer border-gray-300 text-gray-700 rounded-full font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                Back to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push("/rooms")}
            className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Rooms
          </button>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-10">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  paymentStatus === "completed"
                    ? "bg-emerald-100"
                    : "bg-amber-100"
                }`}
              >
                {paymentStatus === "completed" ? (
                  <CheckCircle className="w-12 h-12 text-emerald-600" />
                ) : (
                  <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {paymentStatus === "completed"
                  ? "Payment Successful!"
                  : "Processing Payment..."}
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                {paymentStatus === "completed"
                  ? "Your booking has been confirmed. We've sent a confirmation to your email."
                  : "Please wait while we verify your payment..."}
              </p>
            </div>

            <div className="bg-linear-to-r from-sky-50 to-purple-50 rounded-2xl p-8 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Booking Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Booking Reference</p>
                    <p className="text-lg font-bold text-gray-900">
                      {bookingReference}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Room</p>
                    <p className="text-lg font-bold text-gray-900">
                      {room?.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Check-in Date</p>
                    <p className="text-lg font-bold text-gray-900">
                      {format(
                        normalizeDate(formData.checkInDate),
                        "MMMM dd, yyyy"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Number of Guests</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formData.noOfGuests}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatPrice(calculatedValues.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p
                      className={`text-lg font-bold ${
                        paymentStatus === "completed"
                          ? "text-emerald-600"
                          : paymentStatus === "failed"
                          ? "text-rose-600"
                          : "text-amber-600"
                      }`}
                    >
                      {paymentStatus === "completed"
                        ? "Paid"
                        : paymentStatus === "failed"
                        ? "Failed"
                        : "Pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Check-out Date</p>
                    <p className="text-lg font-bold text-gray-900">
                      {format(
                        normalizeDate(formData.checkOutDate),
                        "MMMM dd, yyyy"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Number of Nights</p>
                    <p className="text-lg font-bold text-gray-900">
                      {calculatedValues.noOfNights}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-sky-600 cursor-pointer text-white rounded-full font-semibold hover:bg-sky-700 transition-colors"
              >
                Go to Homepage
              </button>
              <button
                onClick={() => router.push("/bookings")}
                className="px-6 py-3 border cursor-pointer border-gray-300 text-gray-700 rounded-full font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Room Details */}
          <div className="lg:w-2/5">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Room Details
              </h2>

              {room && (
                <>
                  {/* Room Image */}
                  <div className="aspect-4/3 relative rounded-xl overflow-hidden mb-6">
                    {getRoomImage(room.images) ? (
                      <Image
                        src={getRoomImage(room.images)}
                        alt={room.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 40vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-sky-400 to-purple-500 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-2xl font-bold opacity-20">
                            Royal Moss
                          </div>
                          <div className="text-sm opacity-40">Luxury Room</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Room Info */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">
                        {room.title}
                      </h3>
                      <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-1 rounded-lg">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        <span className="font-bold">
                          {room.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center text-gray-700 mb-1">
                          <Users className="w-4 h-4 mr-2 text-sky-500" />
                          <span className="text-sm font-medium">Guests</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {room.guests}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center text-gray-700 mb-1">
                          <Maximize2 className="w-4 h-4 mr-2 text-purple-500" />
                          <span className="text-sm font-medium">Size</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {room.size}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center text-gray-700 mb-1">
                          <Building className="w-4 h-4 mr-2 text-emerald-500" />
                          <span className="text-sm font-medium">
                            Floor/Room Number
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {room.floor}/{room.roomNumber}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center text-gray-700 mb-1">
                          <Eye className="w-4 h-4 mr-2 text-amber-500" />
                          <span className="text-sm font-medium">View</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {room.view}
                        </div>
                      </div>
                    </div>

                    {/* Booking Calendar Preview */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Availability Status
                      </h4>
                      {existingBookings.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Booked date ranges:
                          </p>
                          <ul className="space-y-1 text-sm max-h-32 overflow-y-auto pr-2">
                            {existingBookings.map((booking, index) => (
                              <li
                                key={index}
                                className="flex items-center text-gray-700"
                              >
                                <XCircle className="w-3 h-3 mr-2 text-rose-500 shrink-0" />
                                <span className="truncate">
                                  {format(
                                    normalizeDate(booking.check_in_date),
                                    "MMM dd"
                                  )}{" "}
                                  -{" "}
                                  {format(
                                    normalizeDate(booking.check_out_date),
                                    "MMM dd, yyyy"
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-emerald-600">
                          ✓ All dates available for booking
                        </p>
                      )}
                    </div>

                    {/* Pricing Summary */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Pricing Summary
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price per night</span>
                          <span className="font-medium">
                            {formatPrice(roomPrice, true)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Number of nights
                          </span>
                          <span className="font-medium">
                            {calculatedValues.noOfNights}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="text-lg font-semibold text-gray-900">
                            Total Amount
                          </span>
                          <span className="text-2xl font-bold text-emerald-600">
                            {formatPrice(calculatedValues.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:w-3/5">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Complete Your Booking
              </h1>
              <p className="text-gray-600 mb-8">
                Please fill in your details to complete the booking process
              </p>

              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2 text-sky-600" />
                    Personal Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="guestName"
                        value={formData.guestName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="guestEmail"
                        value={formData.guestEmail}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="guestPhone"
                        value={formData.guestPhone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Guests *
                      </label>
                      <select
                        name="noOfGuests"
                        value={formData.noOfGuests}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "Guest" : "Guests"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                    Stay Dates
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DatePicker
                      type="checkIn"
                      label="Check-in Date"
                      value={formData.checkInDate}
                    />

                    <DatePicker
                      type="checkOut"
                      label="Check-out Date"
                      value={formData.checkOutDate}
                      disabled={!formData.checkInDate}
                    />
                  </div>

                  {dateValidationError && (
                    <div className="mt-4 p-4 bg-rose-50 rounded-lg">
                      <p className="text-sm text-rose-700 flex items-center">
                        <XCircle className="w-4 h-4 mr-2" />
                        {dateValidationError}
                      </p>
                    </div>
                  )}

                  {formData.checkInDate &&
                    formData.checkOutDate &&
                    !dateValidationError && (
                      <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                        <p className="text-sm text-emerald-700">
                          <span className="font-semibold">
                            ✓ {calculatedValues.noOfNights} night(s) selected
                          </span>
                          <span className="font-semibold ml-2">
                            • {formatPrice(calculatedValues.totalAmount)} total
                          </span>
                        </p>
                      </div>
                    )}
                </div>

                {/* Payment Method */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-emerald-600" />
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    <label
                      className={`flex items-center p-4 border rounded-xl cursor-pointer ${
                        formData.paymentMethod === "paystack"
                          ? "border-sky-500 bg-sky-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paystack"
                        checked={formData.paymentMethod === "paystack"}
                        onChange={handleInputChange}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">PayStack</p>
                        <p className="text-sm text-gray-600">
                          Pay with your credit card, transfer or USSD using a
                          secured payment gateway called Paystack
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Special Requests
                  </h2>

                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    placeholder="Any special requests or requirements..."
                  />
                </div>

                {/* Security Note */}
                <div className="mb-8 p-6 bg-gray-50 rounded-2xl">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 mb-2">
                        Secure Booking
                      </p>
                      <p className="text-sm text-gray-600">
                        Your personal and payment information is encrypted and
                        secure through PayStack. You can cancel your booking up
                        to 48 hours before check-in for a full refund.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {paymentError && (
                  <div className="mb-6 p-4 bg-rose-50 rounded-xl border border-rose-200">
                    <p className="text-rose-700 flex items-center">
                      <XCircle className="w-5 h-5 mr-2 shrink-0" />
                      {paymentError}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Price includes all taxes and fees</span>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      dateValidationError ||
                      !formData.checkInDate ||
                      !formData.checkOutDate ||
                      !formData.guestName ||
                      !formData.guestEmail ||
                      !formData.guestPhone ||
                      !paystackLoaded
                    }
                    className="px-8 py-3 bg-sky-600 cursor-pointer text-white rounded-full font-semibold hover:bg-sky-700 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing Payment...
                      </span>
                    ) : (
                      `Pay ${formatPrice(calculatedValues.totalAmount)}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
