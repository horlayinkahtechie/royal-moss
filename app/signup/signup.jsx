"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../lib/supabase";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Hotel,
  Check,
  AlertCircle,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    newsletter: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // 1. Check if user already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from("users")
        .select("email, phone")
        .or(`email.eq.${formData.email},phone.eq.${formData.phone}`);

      if (checkError) {
        throw new Error("Error checking existing users");
      }

      if (existingUsers && existingUsers.length > 0) {
        const existingEmail = existingUsers.find(
          (u) => u.email === formData.email
        );
        const existingPhone = existingUsers.find(
          (u) => u.phone === formData.phone
        );

        if (existingEmail) {
          setError(
            "An account with this email already exists. Please login instead."
          );
          setIsLoading(false);
          return;
        }

        if (existingPhone) {
          setError("An account with this phone number already exists.");
          setIsLoading(false);
          return;
        }
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        }
      );

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (authData.user) {
        const { error: insertError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          subscribed_to_newsletter: formData.newsletter,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          auth_provider: "email_password",
          user_role: "user",
        });

        if (insertError) {
          console.error("Error inserting user data:", insertError);
        }

        setSuccess(
          "Account created successfully! Please check your email to confirm your account."
        );

        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // The user will be redirected to Google for authentication
      // After successful auth, they'll be redirected back to /auth/callback
    } catch (err) {
      setError(err.message || "An error occurred during Google sign up");
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.agreeTerms) {
      setError("Please agree to the Terms & Conditions");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    // Basic password strength check
    const hasLetter = /[a-zA-Z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    if (!hasLetter || !hasNumber || !hasSpecialChar) {
      setError(
        "Password must contain letters, numbers, and special characters"
      );
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Phone validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
      setError("Please enter a valid phone number");
      return false;
    }

    return true;
  };

  const features = [
    "Exclusive member rates",
    "Personalized room preferences",
    "Early check-in/late checkout priority",
    "Complimentary room upgrades",
    "VIP event invitations",
    "24/7 dedicated support",
  ];

  return (
    <div className="min-h-screen bg-linear-to-br pt-30 from-sky-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Column - Form */}
          <div className="p-8 sm:p-12 lg:p-16">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-sky-100 rounded-lg">
                    <Hotel className="w-6 h-6 text-sky-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Royal Moss
                  </h1>
                </div>
                <Link
                  href="/login"
                  className="text-sm cursor-pointer text-sky-600 hover:text-sky-700 transition-colors font-medium"
                >
                  Already have an account?
                </Link>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Join Our Luxury Community
              </h2>
              <p className="text-gray-600">
                Create your account and unlock exclusive benefits
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
                  <Check className="w-5 h-5 text-emerald-600" />
                  <p className="text-emerald-600 text-sm">{success}</p>
                </div>
              </div>
            )}

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex items-center space-x-2 ${
                    step >= 1 ? "text-sky-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= 1
                        ? "bg-sky-100 border-2 border-sky-600"
                        : "bg-gray-100 border-2 border-gray-300"
                    }`}
                  >
                    1
                  </div>
                  <span className="text-sm font-medium">Personal</span>
                </div>
                <div className="flex-1 h-0.5 mx-4 bg-gray-200"></div>
                <div
                  className={`flex items-center space-x-2 ${
                    step >= 2 ? "text-sky-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= 2
                        ? "bg-sky-100 border-2 border-sky-600"
                        : "bg-gray-100 border-2 border-gray-300"
                    }`}
                  >
                    2
                  </div>
                  <span className="text-sm font-medium">Account</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information - Step 1 */}
              <div className={`space-y-6 ${step === 1 ? "block" : "hidden"}`}>
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
                        placeholder="John"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
                        placeholder="Doe"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email Address *
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
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
                      placeholder="you@example.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
                      placeholder="+1 (555) 123-4567"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 bg-sky-600 cursor-pointer text-white rounded-xl font-semibold hover:bg-sky-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <span className="flex items-center justify-center">
                    Continue to Account Details
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </span>
                </button>
              </div>

              {/* Account Details - Step 2 */}
              <div className={`space-y-6 ${step === 2 ? "block" : "hidden"}`}>
                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Password *
                  </label>
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
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
                      placeholder="Create a strong password"
                      required
                      minLength={8}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 cursor-pointer transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 8 characters with letters, numbers, and special
                    characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
                      placeholder="Confirm your password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 cursor-pointer transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms and Newsletter */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          agreeTerms: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500 focus:ring-2 mt-1 disabled:opacity-50"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="agreeTerms"
                      className="ml-2 text-sm text-gray-700"
                    >
                      I agree to the{" "}
                      <Link
                        href="/privacy-policy"
                        className="text-sky-600 cursor-pointer hover:text-sky-700"
                      >
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy-policy"
                        className="text-sky-600 cursor-pointer hover:text-sky-700"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="newsletter"
                      checked={formData.newsletter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newsletter: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500 focus:ring-2 mt-1 disabled:opacity-50"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="newsletter"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Send me exclusive offers, updates, and travel inspiration
                    </label>
                  </div>
                </div>

                {/* Back and Submit Buttons */}
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-3.5 border-2 cursor-pointer border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-sky-600 cursor-pointer text-white rounded-xl font-semibold hover:bg-sky-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating Account...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Create Account
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Or sign up with
                  </span>
                </div>
              </div>

              {/* Google Sign Up */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full py-3.5 bg-white border-2 cursor-pointer border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="flex items-center justify-center">
                  <FcGoogle className="w-5 h-5 mr-3" />
                  Sign up with Google
                </span>
              </button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-sky-600 cursor-pointer font-semibold hover:text-sky-700 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>

            {/* Security Badge */}
            <div className="mt-10 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <Lock className="w-4 h-4 text-emerald-600" />
                </div>
                <span>
                  Your information is secured with 256-bit SSL encryption
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Benefits & Image */}
          <div className="hidden lg:block relative bg-linear-to-br from-sky-600 to-purple-600">
            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full backdrop-blur-sm"></div>

            {/* Content Container */}
            <div className="absolute inset-0 p-12 flex flex-col justify-between">
              {/* Top Content */}
              <div>
                <div className="mb-10">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Unlock Exclusive Benefits
                  </h3>
                  <p className="text-white/80 text-lg">
                    Join thousands of luxury travelers enjoying premium perks
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white/90">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
