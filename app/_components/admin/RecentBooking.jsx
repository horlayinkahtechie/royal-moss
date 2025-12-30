"use client";

import { useState, useEffect } from "react";
import supabase from "../../lib/supabase";
import { Clock, Calendar, CheckCircle, XCircle } from "lucide-react";

const RecentBookings = ({ limit = 5 }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentBookings();
  }, []);

  const fetchRecentBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          profiles:user_id (full_name, email),
          rooms:room_id (room_number, category)
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="w-4 h-4" />,
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="w-4 h-4" />,
      },
    };
    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`${config.color} px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}
      >
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No bookings found</div>
      ) : (
        bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-sky-100 p-3 rounded-lg">
                <Calendar className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {booking.profiles?.full_name || "Guest"}
                </h4>
                <p className="text-sm text-gray-600">
                  Room {booking.rooms?.room_number} • {booking.rooms?.category}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {new Date(booking.check_in).toLocaleDateString()} -{" "}
                    {new Date(booking.check_out).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">
                ${booking.total_amount}
              </div>
              <div className="mt-1">{getStatusBadge(booking.status)}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentBookings;
