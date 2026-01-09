// app/contact/page.tsx
"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Building,
  MessageSquare,
  Users,
  ArrowRight,
} from "lucide-react";
import ContactSection from "@/app/_components/ContactSection";

const ContactPage = () => {
  const faqs = [
    {
      question: "What are your check-in and check-out times?",
      answer:
        "Check-in is at 3:00 PM and check-out is at 11:00 AM. Early check-in and late check-out may be available upon request and subject to availability.",
    },
    {
      question: "Do you offer airport transportation?",
      answer:
        "Yes, we provide complimentary airport transfers for suite guests. For other guests, we offer luxury car service at competitive rates. Please arrange at least 24 hours in advance.",
    },
    {
      question: "Are pets allowed at the hotel?",
      answer:
        "We welcome pets up to 25 lbs with prior arrangement. A pet fee of $150 per stay applies. We provide pet beds, bowls, and treats. Some restrictions may apply.",
    },
    {
      question: "What is your cancellation policy?",
      answer:
        "Standard reservations can be cancelled up to 48 hours before arrival without penalty. Special packages and group bookings may have different policies.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-sky-900/90 via-purple-900/80 to-gray-900/90 z-10"></div>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[url('/images/contact-pattern.svg')]"></div>
          </div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
              <MessageSquare className="w-4 h-4 text-white mr-2" />
              <span className="text-sm font-semibold text-white">
                Get in Touch
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              We&apos;re Here to{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-300 to-purple-300">
                Help
              </span>
            </h1>

            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
              Our dedicated team is available around the clock to ensure your
              Royal Moss experience is flawless from start to finish.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <ContactSection />

      {/* Business Hours */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="w-6 h-6 text-sky-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  Front Desk Hours
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  { day: "Monday - Friday", time: "6:00 AM - 11:00 PM" },
                  { day: "Saturday - Sunday", time: "6:00 AM - 12:00 AM" },
                  { day: "24/7 Concierge", time: "Always Available" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-700">{item.day}</span>
                    <span className="font-semibold text-gray-900">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Building className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  Restaurant Hours
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  { meal: "Breakfast", time: "6:30 AM - 11:00 AM" },
                  { meal: "Lunch", time: "12:00 PM - 3:00 PM" },
                  { meal: "Dinner", time: "6:00 PM - 11:00 PM" },
                  { meal: "24/7 Room Service", time: "Always Available" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-700">{item.meal}</span>
                    <span className="font-semibold text-gray-900">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  Spa & Wellness
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  { service: "Spa Treatments", time: "9:00 AM - 9:00 PM" },
                  { service: "Fitness Center", time: "5:00 AM - 11:00 PM" },
                  { service: "Pool", time: "7:00 AM - 10:00 PM" },
                  { service: "Wellness Classes", time: "Schedule Varies" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-700">{item.service}</span>
                    <span className="font-semibold text-gray-900">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
