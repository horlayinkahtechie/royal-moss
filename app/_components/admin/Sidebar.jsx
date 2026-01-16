"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Calendar,
  Hotel,
  Users,
  TrendingUp,
  Plus,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Image,
  LogOut,
  User2Icon,
  MailCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import supabase from "../../lib/supabase";
import { format, startOfDay, endOfDay } from "date-fns";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState({
    bookings: false,
    rooms: false,
    analytics: false,
    finance: false,
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // State for dynamic badge counts
  const [badgeCounts, setBadgeCounts] = useState({
    users: 0,
    gallery: 0,
    customers: 0,
    subscribers: 0,
    bookings: {
      all: 0,
      checkinsToday: 0,
      checkoutsToday: 0,
      pending: 0,
    },
    rooms: {
      all: 0,
      maintenance: 0,
    },
  });

  // Fetch real data from database - FIXED: Only count PAID bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const todayStart = startOfDay(today).toISOString();
        const todayEnd = endOfDay(today).toISOString();

        // Fetch users count (admin users)
        const { count: usersCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        const { count: subscribersCount } = await supabase
          .from("subscribers")
          .select("*", { count: "exact", head: true });

        // Fetch gallery count
        const { count: galleryCount } = await supabase
          .from("gallery")
          .select("*", { count: "exact", head: true });

        // ============ BOOKINGS DATA - ONLY PAID ============
        // Fetch ALL bookings count - ONLY PAID
        const { count: allBookingsCount } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("payment_status", "paid");

        // Fetch check-ins for today - ONLY PAID
        const { count: checkinsTodayCount } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("check_in_date", format(today, "yyyy-MM-dd"))
          .eq("booking_status", "checked-in") // Changed from 'status' to 'booking_status'
          .eq("payment_status", "paid");

        // Fetch check-outs for today - ONLY PAID
        const { count: checkoutsTodayCount } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("check_out_date", format(today, "yyyy-MM-dd"))
          .eq("booking_status", "checked-out") // Changed from 'status' to 'booking_status'
          .eq("payment_status", "paid");

        // Fetch pending bookings - ONLY PAID
        const { count: pendingBookingsCount } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("booking_status", "pending") // Changed from 'status' to 'booking_status'
          .eq("payment_status", "paid");

        // ============ ROOMS DATA ============
        // Fetch rooms data
        const { count: allRoomsCount } = await supabase
          .from("rooms")
          .select("*", { count: "exact", head: true });

        // Fetch rooms under maintenance
        const { count: maintenanceRoomsCount } = await supabase
          .from("rooms")
          .select("*", { count: "exact", head: true })
          .eq("status", "maintenance");

        // ============ CUSTOMERS DATA - ONLY FROM PAID BOOKINGS ============
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select("guest_email, guest_name, guest_phone")
          .not("guest_email", "is", null)
          .eq("payment_status", "paid"); // Only include paid bookings for customer count

        let customersCount = 0;
        if (bookingsData && !bookingsError) {
          // Get unique customer emails from PAID bookings
          const uniqueEmails = new Set(
            bookingsData
              .map((booking) => booking.guest_email?.toLowerCase().trim())
              .filter((email) => email && email !== "")
          );
          customersCount = uniqueEmails.size;
        }

        // Update state with fetched data
        setBadgeCounts({
          users: usersCount || 0,
          gallery: galleryCount || 0,
          customers: customersCount || 0,
          subscribers: subscribersCount || 0,
          bookings: {
            all: allBookingsCount || 0, // Only paid bookings
            checkinsToday: checkinsTodayCount || 0, // Only paid check-ins
            checkoutsToday: checkoutsTodayCount || 0, // Only paid check-outs
            pending: pendingBookingsCount || 0, // Only paid pending
          },
          rooms: {
            all: allRoomsCount || 0,
            maintenance: maintenanceRoomsCount || 0,
          },
        });
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      }
    };

    fetchData();

    // Set up real-time subscription for relevant tables
    const bookingsSubscription = supabase
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => fetchData()
      )
      .subscribe();

    const usersSubscription = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => fetchData()
      )
      .subscribe();

    const roomsSubscription = supabase
      .channel("rooms-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      bookingsSubscription.unsubscribe();
      usersSubscription.unsubscribe();
      roomsSubscription.unsubscribe();
    };
  }, []);

  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <BarChart3 className="w-5 h-5" />,
      href: "/admin/dashboard",
      badge: null,
    },
    {
      id: "bookings",
      label: "Bookings",
      icon: <Calendar className="w-5 h-5" />,
      hasSubmenu: true,
      badge:
        badgeCounts.bookings.all > 0
          ? badgeCounts.bookings.all.toString()
          : null,
      submenu: [
        {
          label: "All Bookings",
          href: "/admin/bookings",
          badge:
            badgeCounts.bookings.all > 0
              ? badgeCounts.bookings.all.toString()
              : null,
        },
        {
          label: "Book a room",
          href: "/admin/book-a-room",
        },
        {
          label: "Booked Dates",
          href: "/admin/bookings/booked-dates",
        },
        {
          label: "Check ins & outs Today",
          href: "/admin/bookings/today-checkin",
          badge:
            badgeCounts.bookings.checkinsToday > 0
              ? badgeCounts.bookings.checkinsToday.toString()
              : null,
        },
      ],
    },
    {
      id: "rooms",
      label: "Rooms",
      icon: <Hotel className="w-5 h-5" />,
      hasSubmenu: true,
      badge:
        badgeCounts.rooms.all > 0 ? badgeCounts.rooms.all.toString() : null,
      submenu: [
        {
          label: "All Rooms",
          href: "/admin/rooms",
          badge:
            badgeCounts.rooms.all > 0 ? badgeCounts.rooms.all.toString() : null,
        },
        {
          label: "Add New Room",
          href: "/admin/add-new-room",
        },
        {
          label: "Room Availability",
          href: "/admin/room-availability",
        },
      ],
    },
    {
      id: "gallery",
      label: "Galleries",
      icon: <Image className="w-5 h-5" />,
      href: "/admin/gallery",
      badge: badgeCounts.gallery > 0 ? badgeCounts.gallery.toString() : null,
    },
    {
      id: "customers",
      label: "Customers",
      icon: <User2Icon className="w-5 h-5" />,
      href: "/admin/customers",
      badge:
        badgeCounts.customers > 0 ? badgeCounts.customers.toString() : null,
    },
    {
      id: "users",
      label: "Users",
      icon: <Users className="w-5 h-5" />,
      href: "/admin/users",
      badge: badgeCounts.users > 0 ? badgeCounts.users.toString() : null,
    },
    {
      id: "subscribers",
      label: "Subscribers",
      icon: <MailCheck className="w-5 h-5" />,
      href: "/admin/subscribers",
      badge:
        badgeCounts.subscribers > 0 ? badgeCounts.subscribers.toString() : null,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <TrendingUp className="w-5 h-5" />,
      href: "/admin/analytics",
      badge: null,
    },
  ];

  const quickActions = [
    {
      label: "Check In & Out",
      icon: <Plus className="w-4 h-4" />,
      href: "/admin/quick-checkin",
      color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    },
    {
      label: "Add New Room",
      icon: <Hotel className="w-4 h-4" />,
      href: "/admin/add-new-room",
      color: "bg-gradient-to-r from-sky-500 to-sky-600",
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-72 h-screen
        transform transition-all duration-300 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col
        bg-gradient-to-b from-white via-white to-gray-50
        dark:from-gray-900 dark:via-gray-900 dark:to-gray-950
        border-r border-gray-200/80 dark:border-gray-800/80
        shadow-xl lg:shadow-2xl
        overflow-hidden
      `}
      >
        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id} className="group">
                {item.hasSubmenu ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className={`
                        w-full flex items-center cursor-pointer justify-between px-4 py-3 rounded-xl
                        transition-all duration-200
                        ${
                          expandedMenus[item.id] ||
                          pathname.startsWith(`/admin/${item.id}`)
                            ? "bg-gradient-to-r from-sky-50 to-sky-100 dark:from-sky-900/30 dark:to-sky-900/10 text-sky-700 dark:text-sky-400 shadow-sm"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                        }
                        hover:shadow-sm
                      `}
                    >
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-lg mr-3 ${
                            expandedMenus[item.id] ||
                            pathname.startsWith(`/admin/${item.id}`)
                              ? "bg-gradient-to-br from-sky-500 to-sky-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="px-2 py-1 text-xs font-semibold bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-400 rounded-lg">
                            {item.badge}
                          </span>
                        )}
                        {expandedMenus[item.id] ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {expandedMenus[item.id] && (
                      <div className="mt-1 ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`
                              flex items-center cursor-pointer justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-200
                              ${
                                pathname === subItem.href
                                  ? "bg-gradient-to-r from-sky-500/10 to-sky-600/10 dark:from-sky-900/40 dark:to-sky-800/40 text-sky-700 dark:text-sky-400 font-medium"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                              }
                            `}
                            onClick={onClose}
                          >
                            <span>{subItem.label}</span>
                            {subItem.badge && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-400 rounded">
                                {subItem.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`
                      flex items-center cursor-pointer justify-between px-4 py-3 rounded-xl transition-all duration-200
                      ${
                        pathname === item.href
                          ? "bg-gradient-to-r from-sky-50 to-sky-100 dark:from-sky-900/30 dark:to-sky-900/10 text-sky-700 dark:text-sky-400 shadow-sm"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      }
                      hover:shadow-sm
                      group
                    `}
                    onClick={onClose}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                          pathname === item.href
                            ? "bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-semibold bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-400 rounded-lg">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 px-2">
            <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center cursor-pointer px-4 py-3.5 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200/80 dark:border-gray-800/80 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-lg transition-all duration-300 group"
                  onClick={onClose}
                >
                  <div
                    className={`${action.color} p-2 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-200`}
                  >
                    {action.icon}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {action.label}
                  </span>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Bottom Section with Logout */}
        <div className="border-t border-gray-200/80 dark:border-gray-800/80 pt-4 pb-6 px-4">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`
              w-full flex items-center justify-center px-4 py-3 rounded-xl
              transition-all duration-200 cursor-pointer
              ${
                isLoggingOut
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  : "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:shadow-sm"
              }
              ${isLoggingOut ? "cursor-not-allowed" : "hover:shadow-sm"}
            `}
          >
            <div
              className={`p-2 rounded-lg mr-3 ${
                isLoggingOut
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  : "bg-gradient-to-br from-red-500 to-red-600 text-white"
              }`}
            >
              {isLoggingOut ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
            </div>
            <span className="font-medium">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
