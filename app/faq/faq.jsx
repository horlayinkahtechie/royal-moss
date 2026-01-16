"use client";

import { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  Sparkles,
  CreditCard,
  Calendar,
  User,
  Receipt,
  Key,
} from "lucide-react";
import Link from "next/link";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqCategories = [
    {
      title: "Booking Process",
      icon: Calendar,
      color: "text-sky-600",
      bgColor: "bg-sky-50",
      questions: [
        {
          q: "How do I make a reservation on the website?",
          a: "Select your check-in and check-out dates, choose a room, enter your details, and confirm your booking online.",
        },
        {
          q: "Is room availability updated in real time?",
          a: "Yes. Availability updates instantly to prevent double booking.",
        },
        {
          q: "Can I book rooms for multiple guests?",
          a: "Yes. You can select the number of guests during booking, and the system will show suitable available rooms.",
        },
      ],
    },
    {
      title: "Payment & Security",
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      questions: [
        {
          q: "Is online payment required to complete a booking?",
          a: "Yes, online booking require a full payment. You can also walk-in to book your stay.",
        },
        {
          q: "Are my personal and payment details secure?",
          a: "Yes. The website uses secure encryption to protect all personal and payment information.",
        },
        {
          q: "Are there any extra charges or taxes?",
          a: "Any additional charges or taxes will be clearly shown before you complete your booking.",
        },
      ],
    },
    {
      title: "Modifications & Cancellations",
      icon: Receipt,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      questions: [
        {
          q: "Can I modify or cancel my booking?",
          a: "Yes, you can modify booking, contact the support team, they will help you modify your booking. But canceling of bookings may not be guaranteed.",
        },
        {
          q: "What happens if my selected room is not available?",
          a: "The system will suggest alternative rooms or dates that are available.",
        },
      ],
    },
    {
      title: "Account & Support",
      icon: User,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      questions: [
        {
          q: "Can I make a booking without creating an account?",
          a: "Yes. Guest bookings are allowed, but creating an account helps you manage your reservations more easily.",
        },
        {
          q: "How do I contact the hotel for booking support?",
          a: "You can contact us via phone, email, or the contact form on the website.",
        },
        {
          q: "How do I know my booking was successful?",
          a: "Once your booking is completed, you'll see a confirmation message on the website and receive a confirmation email.",
        },
      ],
    },
    {
      title: "Check-in & Services",
      icon: Key,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      questions: [
        {
          q: "What time is check-in and check-out?",
          a: "Check-in is flexible, you can check in any time after the standard check-in time if the room is available. Check-out is always before 12:00 PM on your checkout day.",
        },
        {
          q: "Can I request special services or amenities?",
          a: "Yes. You can add special requests during booking, and the hotel will try to accommodate them.",
        },
      ],
    },
    {
      title: "Offers & Discounts",
      icon: Sparkles,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      questions: [
        {
          q: "Do you offer discounts or promo codes?",
          a: "Yes. Promotional offers and discount codes can be applied during checkout when available.",
        },
        {
          q: "Will I receive a booking confirmation?",
          a: "Yes. A confirmation email with your booking details will be sent immediately after successful booking.",
        },
      ],
    },
  ];

  const allFAQs = faqCategories.flatMap((category) => category.questions);

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
              <HelpCircle className="w-4 h-4 text-white mr-2" />
              <span className="text-sm font-semibold text-white">
                Frequently Asked Questions
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              How Can We{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-300 to-purple-300">
                Help You?
              </span>
            </h1>

            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Find quick answers to common questions about bookings, payments,
              policies, and your stay at Royal Moss Hotel.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => {
                  document
                    .getElementById("faq-categories")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 cursor-pointer bg-white text-sky-600 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1"
              >
                Browse FAQs
              </button>
              <Link
                href="/contact"
                className="px-6 py-3 cursor-pointer border-2 border-white/40 text-white rounded-full font-semibold hover:border-white hover:bg-white/10 transition-all duration-300"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Browse by <span className="text-sky-600">Category</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select a category to find answers to your specific questions
            </p>
          </div>

          {/* All FAQs */}
          <div className="max-w-4xl mx-auto" id="faq-categories">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Common Questions
              </h3>
              <p className="text-gray-600">
                Click on any question to reveal the answer
              </p>
            </div>

            <div className="space-y-4">
              {allFAQs.map((faq, index) => (
                <div
                  key={index}
                  id={`faq-${index}`}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-sky-50 rounded-lg">
                        <HelpCircle className="w-5 h-5 text-sky-600" />
                      </div>
                      <span className="font-semibold text-gray-900 text-lg">
                        {faq.q}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`px-6 overflow-hidden transition-all duration-300 ${
                      openIndex === index
                        ? "pb-6 max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pl-11">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-gray-700">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
