"use client";

import { Users, DollarSign, Calendar, Bed } from "lucide-react";

const StatsCards = ({ stats, loading }) => {
  const cards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: <Calendar className="w-6 h-6" />,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="w-6 h-6" />,
      color: "bg-purple-500",
      change: "+5%",
    },
    {
      title: "Total Rooms",
      value: stats.totalRooms,
      icon: <Bed className="w-6 h-6" />,
      color: "bg-amber-500",
      change: "+2%",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${card.color} p-3 rounded-lg text-white`}>
              {card.icon}
            </div>
            <span className="text-sm font-medium text-green-600">
              {card.change}
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {card.value}
          </h3>
          <p className="text-gray-600">{card.title}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
