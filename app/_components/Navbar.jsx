"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import supabase from "../lib/supabase";
import { Menu, X, LogOut, User } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Rooms & Suites", href: "/rooms" },
    { label: "About us", href: "/aboutus" },
    { label: "Gallery", href: "/gallery" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
    { label: "Bookings", href: "/bookings" },
  ];

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    setIsOpen(false);
    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleLogin = () => {
    setIsOpen(false);
    router.push("/login");
  };

  return (
    <nav className="fixed w-full z-50 py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-4xl shadow-lg border border-gray-200/80">
          <div className="px-6">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="shrink-0">
                <Link href="/">
                  <h1 className="text-2xl font-bold text-sky-600 hover:text-sky-700 transition-colors">
                    Royal Moss
                  </h1>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`relative px-3 py-2 font-medium text-sm transition-all duration-300 ${
                      isActive(item.href)
                        ? "text-white bg-purple-600 rounded-full"
                        : "text-gray-700 hover:text-purple-600"
                    }`}
                  >
                    {item.label}

                    {/* Centered underline for active link */}
                    {isActive(item.href) && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/3">
                        <div className="h-1 bg-white rounded-full"></div>
                      </div>
                    )}

                    {/* Hover underline effect */}
                    {!isActive(item.href) && (
                      <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-transparent group-hover:bg-purple-600 transition-all duration-300"></div>
                    )}
                  </Link>
                ))}

                {/* User Profile / Auth Section */}
                <div className="flex items-center space-x-4">
                  {isLoading ? (
                    // Loading skeleton
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                  ) : user ? (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-sky-600" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">
                          {user.email?.split("@")[0]}
                        </span>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors duration-300"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleLogin}
                      className="flex items-center cursor-pointer px-6 py-2.5 text-white hover:bg-purple-500 bg-purple-600 rounded-full font-medium transition-all duration-300"
                    >
                      Login/Signup
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center space-x-4">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-gray-700 hover:text-purple-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div
              className={`md:hidden transition-all duration-300 ease-in-out ${
                isOpen
                  ? "max-h-[80vh] opacity-100 py-4"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              <div className="border-t border-gray-200 pt-4">
                {/* Scrollable container for navigation items */}
                <div
                  className="max-h-[calc(80vh-120px)] overflow-y-auto pr-2"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#cbd5e1 transparent",
                  }}
                >
                  <div className="space-y-3">
                    {navItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`block px-4 py-2.5 rounded-lg transition-all duration-300 ${
                          isActive(item.href)
                            ? "text-white bg-purple-600"
                            : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center justify-between">
                          <span>{item.label}</span>
                          {isActive(item.href) && (
                            <div className="h-1 w-6 bg-white rounded-full"></div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Fixed Auth Section at bottom */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  {isLoading ? (
                    <div className="px-4 py-2.5">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : user ? (
                    <>
                      <div className="px-4 py-3 flex items-center space-x-3 bg-gray-50 rounded-lg mb-3">
                        <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-sky-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.email?.split("@")[0]}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center px-4 py-2.5 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleLogin}
                      className="w-full px-4 py-2.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300 text-left"
                    >
                      Login/Signup
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
