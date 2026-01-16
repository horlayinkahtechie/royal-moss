"use client";

import { useState } from "react";
import {
  FileText,
  CheckCircle,
  Calendar,
  CreditCard,
  XCircle,
  Key,
  AlertTriangle,
  Shield,
  Mail,
  Globe,
  Bell,
  Scale,
  Clock,
  UserCheck,
  Building,
} from "lucide-react";
import Link from "next/link";

const TermsConditionsPage = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview", icon: FileText },
    { id: "booking", title: "Booking & Reservations", icon: Calendar },
    { id: "payment", title: "Payment & Charges", icon: CreditCard },
    { id: "cancellations", title: "Cancellations & Refunds", icon: XCircle },
    { id: "checkin", title: "Check-in & Check-out", icon: Key },
    { id: "conduct", title: "Guest Conduct", icon: UserCheck },
    { id: "liability", title: "Liability", icon: AlertTriangle },
    { id: "privacy", title: "Privacy & Data", icon: Shield },
    { id: "changes", title: "Changes to Terms", icon: Bell },
    { id: "governance", title: "Governing Law", icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-sky-900/90 via-purple-900/80 to-gray-900/90 z-10"></div>
          <div className="absolute inset-0">
            <div className="w-full h-full bg-[url('/images/hotel-pattern.svg')] opacity-10"></div>
          </div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
              <Scale className="w-4 h-4 text-white mr-2" />
              <span className="text-sm font-semibold text-white">
                Terms & Conditions
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Booking{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-300 to-purple-300">
                Terms
              </span>{" "}
              & Conditions
            </h1>

            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Please read these terms carefully before making a reservation at
              Royal Moss Hotel. By using our website and services, you agree to
              these terms.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => {
                  document
                    .getElementById("terms-content")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 cursor-pointer bg-white text-sky-600 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1"
              >
                Read Terms
              </button>
              <Link
                href="/rooms/all"
                className="px-6 py-3 cursor-pointer border-2 border-white/40 text-white rounded-full font-semibold hover:border-white hover:bg-white/10 transition-all duration-300"
              >
                Book a Room
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Highlights */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: "Secure Booking",
                desc: "Confirmed with payment",
                icon: CreditCard,
                color: "text-sky-600",
                bgColor: "bg-sky-50",
              },
              {
                title: "Flexible Check-in",
                desc: "Based on availability",
                icon: Clock,
                color: "text-emerald-600",
                bgColor: "bg-emerald-50",
              },
              {
                title: "Clear Policies",
                desc: "Transparent terms",
                icon: FileText,
                color: "text-purple-600",
                bgColor: "bg-purple-50",
              },
              {
                title: "Guest Protection",
                desc: "Secure data handling",
                icon: Shield,
                color: "text-amber-600",
                bgColor: "bg-amber-50",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 ${item.bgColor} rounded-xl`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-600">{item.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20" id="terms-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Terms Sections
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        document
                          .getElementById(section.id)
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeSection === section.id
                          ? "bg-sky-50 text-sky-600 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <section.icon className="w-4 h-4" />
                        <span>{section.title}</span>
                      </div>
                    </button>
                  ))}
                </nav>

                <div className="mt-8 p-4 bg-sky-50 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-sky-600" />
                    <h4 className="font-semibold text-gray-900">
                      Important Notice
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    By using our website, you agree to these terms. Please read
                    them carefully.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-lg p-8">
                {/* Overview */}
                <div id="overview" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <FileText className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Terms & Conditions Overview
                    </h2>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <div className="bg-sky-50 rounded-xl p-6">
                      <p className="text-sky-800 font-medium">
                        Welcome to Royal Moss Hotel website. By using this
                        website and making bookings, you agree to the following
                        terms and conditions. Please read them carefully before
                        making a reservation.
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-semibold text-gray-900">
                          Agreement Acceptance
                        </h4>
                      </div>
                      <p className="text-gray-600">
                        By accessing our website or making a booking, you
                        confirm that you have read, understood, and agree to be
                        bound by these terms and conditions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking & Reservations */}
                <div id="booking" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <Calendar className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      1. Booking & Reservations
                    </h2>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              1
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              All bookings are subject to availability.
                            </span>
                            <p className="text-gray-600 mt-1">
                              We cannot guarantee room availability until your
                              booking is confirmed.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              2
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              Reservations must be made online through our
                              website or at the hotel reception.
                            </span>
                            <p className="text-gray-600 mt-1">
                              Telephone bookings are subject to availability and
                              may require immediate payment confirmation.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              3
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              A valid payment method is required to confirm your
                              booking.
                            </span>
                            <p className="text-gray-600 mt-1">
                              Bookings are not confirmed until payment is
                              authorized or a deposit is received.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              4
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              Once a booking is confirmed, a confirmation email
                              will be sent with the details.
                            </span>
                            <p className="text-gray-600 mt-1">
                              Please check your confirmation email carefully and
                              contact us immediately if there are any errors.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Payment & Charges */}
                <div id="payment" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <CreditCard className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      2. Payment & Charges
                    </h2>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              1
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              Payments may be required in full or partial at the
                              time of booking, depending on the room type.
                            </span>
                            <p className="text-gray-600 mt-1">
                              Advance purchase rates require full payment at
                              time of booking. Flexible rates may require a
                              deposit.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              2
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              All prices include applicable taxes and fees
                              unless stated otherwise.
                            </span>
                            <p className="text-gray-600 mt-1">
                              Government taxes and service charges are included
                              in the displayed price.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              3
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              Additional charges for services (e.g., extra bed,
                              room service) will be billed separately.
                            </span>
                            <p className="text-gray-600 mt-1">
                              Mini-bar, laundry, spa services, and other
                              amenities are not included in room rates.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-5">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <h4 className="font-semibold text-amber-800">
                          Payment Security
                        </h4>
                      </div>
                      <p className="text-amber-700 mt-2">
                        All transactions are secured with SSL encryption. We do
                        not store complete credit card information on our
                        servers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cancellations & Refunds */}
                <div id="cancellations" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <XCircle className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      3. Cancellations & Refunds
                    </h2>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      {[
                        {
                          type: "Flexible Rate",
                          period: "48 hours before check-in",
                          charge: "No charge if cancelled within period",
                          color: "bg-emerald-50 text-emerald-800",
                        },
                        {
                          type: "Advance Purchase",
                          period: "Non-refundable",
                          charge: "Full charge applies",
                          color: "bg-amber-50 text-amber-800",
                        },
                        {
                          type: "Special Offers",
                          period: "As per offer terms",
                          charge: "Varies by promotion",
                          color: "bg-purple-50 text-purple-800",
                        },
                      ].map((policy, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-xl p-5"
                        >
                          <div
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${policy.color}`}
                          >
                            {policy.type}
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {policy.period}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {policy.charge}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              1
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              Cancellations must be made before the stated
                              cancellation period to avoid penalties.
                            </span>
                            <p className="text-gray-600 mt-1">
                              Cancellation periods vary by rate type and will be
                              clearly displayed during booking.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              2
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              Late cancellations or no-shows may be charged in
                              full.
                            </span>
                            <p className="text-gray-600 mt-1">
                              If you do not cancel within the specified period
                              or fail to arrive, the full amount may be charged.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              3
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              Refunds, if applicable, will be processed
                              according to the hotel&apos;s policy and payment
                              method.
                            </span>
                            <p className="text-gray-600 mt-1">
                              Refunds typically take 7-14 business days to
                              appear on your original payment method.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Check-in & Check-out */}
                <div id="checkin" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <Key className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      4. Check-in & Check-out
                    </h2>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-emerald-50 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Clock className="w-6 h-6 text-emerald-600" />
                          <h4 className="font-semibold text-gray-900">
                            Standard Times
                          </h4>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              Check-in
                            </div>
                            <p className="text-gray-600">
                              From 3:00 PM onwards
                            </p>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              Check-out
                            </div>
                            <p className="text-gray-600">Until 12:00 PM</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-sky-50 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Calendar className="w-6 h-6 text-sky-600" />
                          <h4 className="font-semibold text-gray-900">
                            Flexible Options
                          </h4>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              Early Check-in
                            </div>
                            <p className="text-gray-600">
                              Based on availability, may incur charges
                            </p>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              Late Check-out
                            </div>
                            <p className="text-gray-600">
                              Subject to availability and additional charges
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              1
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              Check-in: Flexible, any time after the standard
                              check-in time if the room is available.
                            </span>
                            <p className="text-gray-600 mt-1">
                              We will make every effort to accommodate early
                              arrivals when possible.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              2
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              Check-out: Must be completed before 12:00 PM on
                              your checkout day.
                            </span>
                            <p className="text-gray-600 mt-1">
                              Late check-out may result in additional charges.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              3
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              Early check-in or late check-out may be available
                              upon request and may incur additional charges.
                            </span>
                            <p className="text-gray-600 mt-1">
                              Please contact reception at least 24 hours in
                              advance to request flexible check-in/check-out.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Guest Conduct */}
                <div id="conduct" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <UserCheck className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      5. Guest Conduct
                    </h2>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              1
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              Guests are responsible for their behavior and any
                              damages caused to hotel property.
                            </span>
                            <p className="text-gray-600 mt-1">
                              Any damage to rooms, fixtures, fittings, or
                              equipment will be charged to the guest.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              2
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              Illegal activities, disruptive behavior, or
                              violation of hotel policies may result in
                              immediate termination of the booking without
                              refund.
                            </span>
                            <p className="text-gray-600 mt-1">
                              The hotel reserves the right to refuse service or
                              accommodation to any person for any reason.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-red-50 rounded-xl p-5">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h4 className="font-semibold text-red-800">
                          Zero Tolerance Policy
                        </h4>
                      </div>
                      <p className="text-red-700 mt-2">
                        We maintain a strict zero-tolerance policy against
                        harassment, discrimination, violence, and illegal
                        activities. Violations will result in immediate
                        eviction.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Liability */}
                <div id="liability" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <AlertTriangle className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      6. Liability
                    </h2>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              1
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              The hotel is not liable for loss, theft, or damage
                              to personal property.
                            </span>
                            <p className="text-gray-600 mt-1">
                              We recommend using the in-room safe for valuables
                              and securing appropriate travel insurance.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              2
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              The hotel is not responsible for events beyond its
                              control (e.g., natural disasters, strikes,
                              government restrictions).
                            </span>
                            <p className="text-gray-600 mt-1">
                              In such cases, our standard cancellation policy
                              may be modified at our discretion.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-5">
                      <div className="flex items-center space-x-2">
                        <Building className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-800">
                          Hotel&apos;s Maximum Liability
                        </h4>
                      </div>
                      <p className="text-blue-700 mt-2">
                        The hotel&apos;s maximum liability for any claim
                        relating to your stay is limited to the total amount
                        paid for the booking.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Privacy & Data */}
                <div id="privacy" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <Shield className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      7. Privacy & Personal Data
                    </h2>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              1
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              Your personal information is collected and used
                              according to our Privacy Policy.
                            </span>
                            <p className="text-gray-600 mt-1">
                              For details on how we handle your data, please
                              refer to our comprehensive Privacy Policy page.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              2
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              By making a booking, you consent to the
                              collection, use, and storage of your data for
                              booking and service purposes.
                            </span>
                            <p className="text-gray-600 mt-1">
                              This includes communication regarding your booking
                              and relevant offers.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-sky-50 rounded-xl p-5">
                      <p className="text-sky-800">
                        For full details on how we protect your privacy, please
                        visit our{" "}
                        <a
                          href="/privacy-policy"
                          className="font-semibold underline hover:text-sky-600"
                        >
                          Privacy Policy
                        </a>{" "}
                        page.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Changes to Terms */}
                <div id="changes" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <Bell className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      8. Changes to Terms
                    </h2>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              1
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              We reserve the right to update or modify these
                              terms at any time.
                            </span>
                            <p className="text-gray-600 mt-1">
                              Changes may be made to reflect legal requirements,
                              operational changes, or improvements to our
                              services.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              2
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              Changes will be effective immediately upon posting
                              on the website.
                            </span>
                            <p className="text-gray-600 mt-1">
                              The &qout;Last Updated&quot; date at the top of
                              this page will be revised when changes are made.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              3
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              Continued use of the website constitutes
                              acceptance of the updated terms.
                            </span>
                            <p className="text-gray-600 mt-1">
                              We recommend reviewing these terms periodically to
                              stay informed of any changes.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Governing Law */}
                <div id="governance" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <Scale className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      9. Governing Law
                    </h2>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              1
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              These terms are governed by the laws of Nigeria.
                            </span>
                            <p className="text-gray-600 mt-1">
                              All matters relating to these terms shall be
                              governed by Nigerian law.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0">
                            <span className="text-sky-600 font-semibold text-sm">
                              2
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              Any disputes will be resolved under the
                              jurisdiction of Lagos State courts.
                            </span>
                            <p className="text-gray-600 mt-1">
                              Legal proceedings must be brought in the courts of
                              Lagos State, Nigeria.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-sky-50 rounded-xl p-5">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-sky-600" />
                        <h4 className="font-semibold text-gray-900">
                          International Guests
                        </h4>
                      </div>
                      <p className="text-sky-800 mt-2">
                        International guests agree that any legal disputes will
                        be governed by Nigerian law and resolved in Nigerian
                        courts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Agreement Acceptance */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="bg-sky-50 rounded-xl p-8">
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                      <h3 className="text-2xl font-bold text-gray-900">
                        Agreement Acceptance
                      </h3>
                    </div>
                    <p className="text-center text-gray-700 max-w-2xl mx-auto">
                      By making a booking on our website, you confirm that you
                      have read, understood, and agree to be bound by these
                      Terms & Conditions. If you do not agree with any part of
                      these terms, please do not use our website or booking
                      services.
                    </p>
                    <div className="text-center mt-6">
                      <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow">
                        <span className="text-sm font-semibold text-gray-700">
                          Last Updated: January 10, 2026
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsConditionsPage;
