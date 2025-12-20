"use client";

import { useState, useRef, useEffect } from "react";
import {
  Wifi,
  Utensils,
  Dumbbell,
  Car,
  ConciergeBell,
  Wind,
  Tv,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Wine,
  Sun,
  Moon,
  Shield,
  Users,
} from "lucide-react";

const Amenities = () => {
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const scrollContainerRef = useRef(null);

  const amenities = [
    {
      icon: Wifi,
      title: "High-Speed WiFi",
      description: "Complimentary high-speed internet throughout the property",
    },
    {
      icon: Utensils,
      title: "Fine Dining",
      description:
        "5-star restaurants & 24/7 room service with international cuisine",
    },
    {
      icon: Dumbbell,
      title: "Fitness Center",
      description: "State-of-the-art gym with certified personal trainers",
    },
    {
      icon: Coffee,
      title: "Luxury Spa",
      description: "Award-winning spa with professional therapists",
    },
    {
      icon: Car,
      title: "Valet Parking",
      description: "Complimentary valet service with secure parking",
    },
    {
      icon: ConciergeBell,
      title: "24/7 Concierge",
      description: "Personalized service available anytime, day or night",
    },
    {
      icon: Wind,
      title: "Climate Control",
      description: "Individual temperature control in every room",
    },
    {
      icon: Tv,
      title: "Entertainment",
      description: "Smart TVs with premium streaming services",
    },
    {
      icon: Wine,
      title: "Bar & Lounge",
      description: "Signature cocktails and fine wines in elegant settings",
    },
    {
      icon: Sun,
      title: "Pool Access",
      description: "Infinity pool with stunning views and poolside service",
    },
    {
      icon: Shield,
      title: "Security",
      description: "24/7 security and surveillance for your safety",
    },
    {
      icon: Users,
      title: "Meeting Rooms",
      description: "Fully-equipped conference and business facilities",
    },
  ];

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 10);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    // Check scroll position on mount
    setTimeout(checkScrollPosition, 100);
  }, []);

  return (
    <section id="amenities" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-sky-50 text-sky-700 rounded-full text-sm font-semibold mb-4">
            <Shield className="w-4 h-4 mr-2" />
            PREMIUM FACILITIES
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            World-Class <span className="text-sky-600">Amenities</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Experience unparalleled comfort with our extensive range of premium
            facilities
          </p>
          <div className="flex justify-center">
            <div className="inline-flex items-center px-4 py-2 bg-sky-100 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                <div className="text-sm text-sky-700 font-medium">
                  Scroll on mobile
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll navigation container */}
        <div className="relative">
          {/* Left scroll button (mobile only) */}
          {showLeftScroll && (
            <button
              onClick={scrollLeft}
              className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-all duration-300"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Right scroll button (mobile only) */}
          {showRightScroll && (
            <button
              onClick={scrollRight}
              className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-all duration-300"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Amenities Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible scrollbar-hide pb-6"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Add this for custom scrollbar styling */}
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {amenities.map((amenity, index) => (
              <div
                key={amenity.title}
                className="shrink-0 w-72 md:w-auto md:shrink md:min-w-0 group bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Icon with animation */}
                <div className="relative">
                  <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sky-100 transition-all duration-300">
                    <amenity.icon className="w-8 h-8 text-sky-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  {/* Decorative circle */}
                  <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full border-2 border-sky-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-sky-600 transition-colors duration-300">
                  {amenity.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {amenity.description}
                </p>

                {/* Hover Effect Line with animation */}
                <div className="mt-6 h-1 w-8 group-hover:w-full bg-sky-500 transition-all duration-500 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicators for mobile */}
        <div className="md:hidden mt-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-sky-300"></div>
                <div className="w-2 h-2 rounded-full bg-sky-300"></div>
                <div className="w-2 h-2 rounded-full bg-sky-300"></div>
              </div>
              <span className="text-sm text-gray-500">Swipe to explore</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Amenities;
