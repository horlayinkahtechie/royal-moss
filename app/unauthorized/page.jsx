"use client";
import Link from "next/link";
import { Shield, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10">
          <div className="text-center">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
              <Shield className="w-10 h-10 text-red-600" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Access Denied
            </h1>

            {/* Message */}
            <p className="text-gray-600 mb-8">
              You don&apos;t have permission to access this page. This area is
              restricted to administrators only.
            </p>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center py-3.5 px-6 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Home className="w-5 h-5 mr-2" />
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
