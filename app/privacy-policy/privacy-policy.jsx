"use client";

import { useState } from "react";
import {
  Shield,
  Lock,
  Eye,
  Mail,
  CreditCard,
  Calendar,
  User,
  FileText,
  Cookie,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Bell,
  Database,
  Users,
} from "lucide-react";

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", title: "Introduction", icon: FileText },
    { id: "information", title: "Information Collected", icon: Database },
    { id: "usage", title: "How We Use Information", icon: Eye },
    { id: "sharing", title: "Sharing Information", icon: Users },
    { id: "cookies", title: "Cookies & Tracking", icon: Cookie },
    { id: "security", title: "Data Security", icon: Lock },
    { id: "rights", title: "Your Rights", icon: Shield },
    { id: "retention", title: "Data Retention", icon: Calendar },
    { id: "children", title: "Children's Privacy", icon: Users },
    { id: "links", title: "Third-Party Links", icon: ExternalLink },
    { id: "changes", title: "Policy Changes", icon: Bell },
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
              <Shield className="w-4 h-4 text-white mr-2" />
              <span className="text-sm font-semibold text-white">
                Privacy & Data Protection
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Your Privacy{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-300 to-purple-300">
                Matters
              </span>
            </h1>

            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              At Royal Moss Hotel, we are committed to protecting your personal
              information and ensuring transparent data practices.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => {
                  document
                    .getElementById("privacy-content")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 cursor-pointer bg-white text-sky-600 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1"
              >
                Read Full Policy
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                value: "SSL Encrypted",
                label: "Secure Transactions",
                icon: Lock,
                color: "text-emerald-600",
                bgColor: "bg-emerald-50",
              },
              {
                value: "No Data Selling",
                label: "Your Data Protected",
                icon: Shield,
                color: "text-sky-600",
                bgColor: "bg-sky-50",
              },
              {
                value: "Easy Control",
                label: "Manage Your Preferences",
                icon: Eye,
                color: "text-purple-600",
                bgColor: "bg-purple-50",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20" id="privacy-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Policy Sections
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
                    <AlertCircle className="w-5 h-5 text-sky-600" />
                    <h4 className="font-semibold text-gray-900">
                      Last Updated
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600">January 10, 2026</p>
                  {/* <p className="text-xs text-gray-500 mt-2">Version 2.1</p> */}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-lg p-8">
                {/* Introduction */}
                <div id="introduction" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <FileText className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Introduction & Overview
                    </h2>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      Welcome to Royal Moss Hotel&apos;s Privacy Policy. This
                      document explains how we collect, use, disclose, and
                      safeguard your information when you visit our website and
                      use our booking services.
                    </p>
                    <p>
                      We are committed to protecting your personal data and
                      respecting your privacy rights. This policy complies with
                      applicable data protection laws and regulations.
                    </p>
                    <div className="bg-sky-50 rounded-xl p-4 mt-4">
                      <p className="text-sm font-medium text-sky-800">
                        Purpose: To ensure transparent data handling practices
                        and protect your personal information throughout your
                        interaction with Royal Moss Hotel.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Information Collected */}
                <div id="information" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <Database className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Information We Collect
                    </h2>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-sky-600" />
                        Personal Information
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <ul className="space-y-3 text-gray-700">
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                            <span>Full name and contact details</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                            <span>Email address and phone number</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                            <span>
                              Account login credentials (when applicable)
                            </span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                            <span>Billing and mailing address</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-sky-600" />
                        Booking Information
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <ul className="space-y-3 text-gray-700">
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                            <span>Check-in and check-out dates</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                            <span>Room type and preferences</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                            <span>Number of guests and ages</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                            <span>Special requests and requirements</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-sky-600" />
                        Payment Details
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <ul className="space-y-3 text-gray-700">
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                            <span>
                              Credit/debit card information (processed securely)
                            </span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                            <span>Billing address and transaction history</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                            <span>Payment confirmation records</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Automatically Collected Information
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <p className="text-gray-700 mb-3">
                          When you visit our website, we may automatically
                          collect:
                        </p>
                        <ul className="space-y-2 text-gray-700">
                          <li>• IP address and device type</li>
                          <li>• Browser type and operating system</li>
                          <li>• Website usage data and analytics</li>
                          <li>• Cookie information (see Cookies section)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How We Use Information */}
                <div id="usage" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <Eye className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      How We Use Your Information
                    </h2>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          title: "Booking Processing",
                          desc: "To process reservations, payments, and manage your stay",
                          icon: Calendar,
                        },
                        {
                          title: "Communication",
                          desc: "To send booking confirmations, updates, and notifications",
                          icon: Mail,
                        },
                        {
                          title: "Personalized Service",
                          desc: "To provide tailored services and special offers",
                          icon: User,
                        },
                        {
                          title: "Website Improvement",
                          desc: "To enhance website functionality and user experience",
                          icon: Eye,
                        },
                      ].map((use, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-xl p-5 hover:bg-sky-50 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-white rounded-lg">
                              <use.icon className="w-5 h-5 text-sky-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900">
                              {use.title}
                            </h4>
                          </div>
                          <p className="text-gray-600 text-sm">{use.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-sky-50 rounded-xl p-5 mt-4">
                      <p className="text-sky-800">
                        We also use your information to comply with legal
                        obligations, prevent fraud, and ensure the security of
                        our services.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sharing Information */}
                <div id="sharing" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <Users className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Information Sharing
                    </h2>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <p>
                      We may share your information in the following
                      circumstances:
                    </p>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-sky-600 rounded-full mt-2 mr-3 shrink-0"></div>
                          <div>
                            <span className="font-medium">Hotel Staff:</span>{" "}
                            With our team members to manage your booking and
                            provide service during your stay
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-sky-600 rounded-full mt-2 mr-3 shrink-0"></div>
                          <div>
                            <span className="font-medium">
                              Payment Processors:
                            </span>{" "}
                            With secure payment gateways to process transactions
                            (e.g., Stripe, PayPal)
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-sky-600 rounded-full mt-2 mr-3 shrink-0"></div>
                          <div>
                            <span className="font-medium">
                              Service Providers:
                            </span>{" "}
                            With trusted partners for email notifications,
                            analytics, and website maintenance
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-sky-600 rounded-full mt-2 mr-3 shrink-0"></div>
                          <div>
                            <span className="font-medium">
                              Legal Requirements:
                            </span>{" "}
                            When required by law or to protect our legal rights
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-5">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-semibold text-emerald-800">
                          Important Assurance
                        </h4>
                      </div>
                      <p className="text-emerald-700">
                        We do not sell, trade, or rent your personal information
                        to unrelated third parties for marketing purposes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cookies & Tracking */}
                <div id="cookies" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <Cookie className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Cookies & Tracking Technologies
                    </h2>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <p>
                      We use cookies and similar tracking technologies to
                      enhance your browsing experience:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          type: "Essential",
                          desc: "Required for website functionality",
                          color: "bg-emerald-100 text-emerald-800",
                        },
                        {
                          type: "Functional",
                          desc: "Remember preferences and settings",
                          color: "bg-sky-100 text-sky-800",
                        },
                        {
                          type: "Analytical",
                          desc: "Analyze website traffic and usage",
                          color: "bg-purple-100 text-purple-800",
                        },
                      ].map((cookie, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-xl p-4"
                        >
                          <div
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${cookie.color}`}
                          >
                            {cookie.type}
                          </div>
                          <p className="text-sm text-gray-600">{cookie.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5">
                      <p>
                        You can control cookies through your browser settings.
                        However, disabling essential cookies may affect website
                        functionality.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Data Security */}
                <div id="security" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <Lock className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Data Security
                    </h2>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Security Measures
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                          <span>
                            SSL encryption for all online transactions
                          </span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                          <span>Secure payment processing systems</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                          <span>Regular security audits and updates</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                          <span>Limited access to personal data</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-5">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <h4 className="font-semibold text-amber-800">
                          Important Notice
                        </h4>
                      </div>
                      <p className="text-amber-700 mt-2">
                        While we implement industry-standard security measures,
                        no electronic transmission or storage system is 100%
                        secure. We encourage you to protect your account
                        credentials and notify us immediately of any suspicious
                        activity.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Your Rights */}
                <div id="rights" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <Shield className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Your Privacy Rights
                    </h2>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <p>
                      You have the following rights regarding your personal
                      data:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        "Access your personal data",
                        "Correct inaccurate information",
                        "Request deletion of your data",
                        "Object to data processing",
                        "Withdraw consent",
                        "Data portability",
                        "Opt-out of marketing",
                        "Lodge a complaint",
                      ].map((right, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-sky-50 transition-colors duration-200"
                        >
                          <CheckCircle className="w-5 h-5 text-sky-600 shrink-0" />
                          <span>{right}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-sky-50 rounded-xl p-5">
                      <p className="text-sky-800">
                        To exercise any of these rights, please contact our
                        privacy team using the information in the &quot;Contact
                        Us&quot; section.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Data Retention */}
                <div id="retention" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <Calendar className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Data Retention
                    </h2>
                  </div>
                  <div className="space-y-6 text-gray-700">
                    <p>
                      We retain your personal data only for as long as
                      necessary:
                    </p>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Booking Information
                          </h4>
                          <p className="text-gray-600">
                            Retained for 7 years for tax and legal compliance
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Account Data
                          </h4>
                          <p className="text-gray-600">
                            Retained while your account is active + 2 years
                            after closure
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Marketing Preferences
                          </h4>
                          <p className="text-gray-600">
                            Retained until you opt-out or request deletion
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Children's Privacy */}
                <div id="children" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <Users className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Children&apos;s Privacy
                    </h2>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      Our services are not directed to children under the age of
                      18. We do not knowingly collect personal information from
                      children.
                    </p>
                    <div className="bg-gray-50 rounded-xl p-5">
                      <p>
                        If you believe we have collected information from a
                        child, please contact us immediately so we can take
                        appropriate action.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Third-Party Links */}
                <div id="links" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <ExternalLink className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Third-Party Links
                    </h2>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      Our website may contain links to external sites. This
                      privacy policy applies only to Royal Moss Hotel.
                    </p>
                    <div className="bg-amber-50 rounded-xl p-5">
                      <p className="text-amber-700">
                        We are not responsible for the privacy practices or
                        content of third-party websites. Please review their
                        privacy policies before providing any personal
                        information.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Policy Changes */}
                <div id="changes" className="mb-12 scroll-mt-24">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-sky-100 rounded-xl">
                      <Bell className="w-6 h-6 text-sky-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Changes to Privacy Policy
                    </h2>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      We may update this privacy policy periodically to reflect
                      changes in our practices or legal requirements.
                    </p>
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Notification of Changes
                      </h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Updated policy posted on this page</li>
                        <li>• &quot;Last Updated&quot; date revised</li>
                        <li>• Email notification for significant changes</li>
                        <li>• Notice on website for minor updates</li>
                      </ul>
                    </div>
                    <p>
                      We encourage you to review this policy periodically to
                      stay informed about how we protect your information.
                    </p>
                  </div>
                </div>

                {/* Policy Acknowledgment */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                    <p className="text-gray-700">
                      By using our website and services, you acknowledge that
                      you have read and understood this Privacy Policy.
                    </p>
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

export default PrivacyPolicyPage;
