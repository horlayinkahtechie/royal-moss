"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Shield,
  CheckCircle,
  Hotel,
} from "lucide-react";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const handleResend = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-linear-to-br pt-30 from-sky-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Column - Form */}
          <div className="p-8 sm:p-12 lg:p-16">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center text-sky-600 hover:text-sky-700 transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to login
            </button>

            <div className="mb-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-sky-100 rounded-lg">
                  <Hotel className="w-6 h-6 text-sky-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Royal Moss</h1>
              </div>

              {!isSubmitted ? (
                <>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Reset Your Password
                  </h2>
                  <p className="text-gray-600">
                    Enter your email address and we&apos;ll send you a link to
                    reset your password
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Check Your Email
                  </h2>
                  <p className="text-gray-600">
                    We&apos;ve sent password reset instructions to{" "}
                    <span className="font-semibold text-sky-600">{email}</span>
                  </p>
                </>
              )}
            </div>

            {!isSubmitted ? (
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all outline-none"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending reset link...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Send Reset Link
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </span>
                  )}
                </button>

                {/* Help Text */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Can&apos;t remember your email?{" "}
                    <a
                      href="/contact"
                      className="text-sky-600 hover:text-sky-700 font-medium"
                    >
                      Contact our support team
                    </a>
                  </p>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Success Message */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-900">
                        Reset link sent successfully
                      </h4>
                      <p className="text-sm text-emerald-700 mt-1">
                        The link will expire in 1 hour for security reasons
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={handleResend}
                    disabled={isLoading}
                    className="w-full py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Resending...
                      </span>
                    ) : (
                      "Resend Email"
                    )}
                  </button>

                  <button
                    onClick={() => router.push("/login")}
                    className="w-full py-3.5 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Return to Login
                  </button>
                </div>

                {/* Help Section */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">
                      Didn&apos;t receive the email?
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 mr-2"></div>
                        Check your spam or junk folder
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 mr-2"></div>
                        Make sure you entered the correct email address
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 mr-2"></div>
                        Try resending the email
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-10 pt-6 border-t border-gray-100">
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <Shield className="w-4 h-4 text-gray-400" />
                <span>
                  We&apos;ll never share your email with third parties. Your
                  privacy is protected.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Image & Info */}
          <div className="hidden lg:block relative bg-linear-to-br from-sky-600 to-purple-600">
            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full backdrop-blur-sm"></div>

            {/* Content Container */}
            <div className="absolute inset-0 p-12 flex flex-col justify-between">
              {/* Top Content */}
              <div>
                <div className="mb-10">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Secure Account Recovery
                  </h3>
                  <p className="text-white/80 text-lg">
                    We take your security seriously. Follow these simple steps
                    to regain access.
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        Enter Your Email
                      </h4>
                      <p className="text-white/70 text-sm">
                        Provide the email address associated with your Royal
                        Moss account
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        Check Your Inbox
                      </h4>
                      <p className="text-white/70 text-sm">
                        Look for an email from Royal Moss with password reset
                        instructions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        Create New Password
                      </h4>
                      <p className="text-white/70 text-sm">
                        Follow the secure link to create a new strong password
                        for your account
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Info */}
              <div className="mt-8">
                <p className="text-white/60 text-sm text-center">
                  Need immediate assistance?{" "}
                  <a
                    href="tel:+15551234567"
                    className="text-white hover:underline"
                  >
                    Call our support: (555) 123-4567
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Info Section */}
        <div className="lg:hidden mt-8 bg-linear-to-br from-sky-600 to-purple-600 rounded-3xl p-8 text-white">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-3">Password Recovery Steps</h3>
            <p className="text-white/80">
              Simple and secure process to regain access to your account
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <span className="font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Enter Email</h4>
                <p className="text-white/70 text-sm">
                  Provide your account email address
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <span className="font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Check Email</h4>
                <p className="text-white/70 text-sm">
                  Open the reset link from Royal Moss
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <span className="font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Reset Password</h4>
                <p className="text-white/70 text-sm">
                  Create a new secure password
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">Secure & Encrypted</p>
                <p className="text-xs text-white/70">
                  Your information is protected with 256-bit SSL
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
