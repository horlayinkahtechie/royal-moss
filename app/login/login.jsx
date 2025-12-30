"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import supabase from "../lib/supabase";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import heroImage from "@/public/images/heroImage.jpg";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Function to fetch user role from users table
  const getUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("user_role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return "user"; // Default to user if error occurs
      }

      return data?.user_role || "user"; // Default to 'user' if role not found
    } catch (err) {
      console.error("Error in getUserRole:", err);
      return "user";
    }
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirectTo");
      if (redirectTo) {
        try {
          // Try to decode, but if it's already decoded, this will work fine
          const decodedRedirect = decodeURIComponent(redirectTo);
          // Store the redirect path for use after login
          sessionStorage.setItem("redirectAfterLogin", decodedRedirect);
        } catch (error) {
          // If decode fails (already decoded), just store as-is
          sessionStorage.setItem("redirectAfterLogin", redirectTo);
        }
      }
    }
  }, []);

  // Helper function to determine redirect path
  const getRedirectPath = (userRole, storedRedirect) => {
    // Admin always goes to admin dashboard
    if (userRole === "admin") {
      return {
        path: "/admin/dashboard",
        message: "Login successful! Redirecting to admin dashboard...",
      };
    }

    // Non-admin user with stored redirect
    if (storedRedirect) {
      sessionStorage.removeItem("redirectAfterLogin");

      if (storedRedirect.startsWith("/admin")) {
        // Non-admin tried to access admin page
        return {
          path: "/unauthorized",
          message: "Login successful! Redirecting...",
        };
      }

      // Valid redirect for non-admin user
      return {
        path: storedRedirect,
        message: "Login successful! Redirecting...",
      };
    }

    // Default for non-admin user
    return {
      path: "/",
      message: "Login successful! Redirecting to home page...",
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // 1️⃣ Authenticate user
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

      if (authError) throw authError;
      if (!authData?.user) {
        throw new Error("Authentication failed");
      }

      // 2️⃣ Fetch user role from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_role")
        .eq("id", authData.user.id)
        .single();

      if (userError) throw userError;

      // 3️⃣ Handle Remember Me
      if (formData.rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("userEmail", formData.email);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("userEmail");
      }

      // 4️⃣ Redirect based on role
      if (userData?.user_role === "admin") {
        window.location.assign("/admin/dashboard");
      } else {
        window.location.assign("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid credentials, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Check for stored redirect (already decoded from useEffect)
      const storedRedirect = sessionStorage.getItem("redirectAfterLogin");

      // Build the redirect URL with query parameters
      const redirectTo = `${window.location.origin}/auth/callback`;
      const redirectUrl = new URL(redirectTo);

      // Pass the original redirect as a query parameter
      if (storedRedirect) {
        // Encode it for the URL
        redirectUrl.searchParams.set(
          "redirect",
          encodeURIComponent(storedRedirect)
        );
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl.toString(),
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      setError(err.message || "An error occurred during Google sign in");
      setIsLoading(false);
    }
  };

  // Load remembered email on component mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const remembered = localStorage.getItem("rememberMe") === "true";
    const rememberedEmail = localStorage.getItem("userEmail");

    if (remembered && rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br pt-30 from-sky-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Column - Form */}
          <div className="p-8 sm:p-12 lg:p-16">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to your account to continue your luxury experience
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <p className="text-emerald-600 text-sm">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none disabled:opacity-50"
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-sky-600 hover:text-sky-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none disabled:opacity-50"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 cursor-pointer top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({ ...formData, rememberMe: e.target.checked })
                  }
                  className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500 focus:ring-2 disabled:opacity-50"
                  disabled={isLoading}
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 cursor-pointer bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Sign In
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3.5 cursor-pointer bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="flex items-center justify-center">
                  <FcGoogle className="w-5 h-5 mr-3" />
                  Sign in with Google
                </span>
              </button>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-gray-600 text-sm">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/signup"
                    className="text-sky-600 font-semibold hover:text-sky-700 transition-colors"
                  >
                    Sign up for free
                  </a>
                </p>
              </div>
            </form>
          </div>

          {/* Right Column - Image */}
          <div className="hidden lg:block relative bg-linear-to-br from-sky-600 to-purple-600 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm z-10"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full backdrop-blur-sm z-10"></div>

            {/* Image Container */}
            <div className="absolute inset-0">
              <Image
                src={heroImage}
                alt="Luxury Hotel Room"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Overlay for better text contrast */}
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"></div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 p-12 flex items-center justify-center z-20">
              <div className="text-center text-white max-w-md">
                <h3 className="text-3xl font-bold mb-4">
                  Experience Luxury Reimagined
                </h3>
                <p className="text-white/90">
                  Access your personalized dashboard to manage bookings, view
                  exclusive offers, and customize your stay preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
