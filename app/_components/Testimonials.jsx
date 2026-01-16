"use client";

import { useState, useRef, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const Testimonials = () => {
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const scrollContainerRef = useRef(null);

  const testimonials = [
    {
      name: "Mr. Michael",
      role: "Tourist",
      rating: 5,
      comment:
        "Absolutely stunning hotel with exceptional service. The room I booked was beyond expectations! The attention to detail was remarkable.",
      avatarColor: "bg-sky-500",
      stay: "Stayed in Executive Suite",
      duration: "3 nights",
    },
    {
      name: "Lydia Taiye David",
      role: "Family Vacation",
      rating: 5,
      comment: "New beautiful and good place to rest in.",
      avatarColor: "bg-purple-500",
      stay: "Stayed in Family Suite",
      duration: "1 night",
    },
    {
      name: "Mr & Mrs William",
      role: "Honeymoon",
      rating: 5,
      comment:
        "The most romantic experience. The ocean view room took our breath away every morning. Service was impeccable throughout our stay.",
      avatarColor: "bg-amber-500",
      stay: "Stayed in Ocean View",
      duration: "7 nights",
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
        left: -320,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 320,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    // Check scroll position on mount
    setTimeout(checkScrollPosition, 100);
  }, []);

  // Avatar initials
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-sky-50 text-sky-700 rounded-full text-sm font-semibold mb-4">
            <Star className="w-4 h-4 mr-2 fill-current" />
            GUEST REVIEWS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our <span className="text-sky-600">Guests</span> Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Don&apos;t just take our word for it - hear from our satisfied
            guests
          </p>

          {/* Scroll instructions for mobile */}
          <div className="md:hidden flex justify-center">
            <div className="inline-flex items-center px-4 py-2 bg-sky-100 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                  <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                  <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                </div>
                <div className="text-sm text-sky-700 font-medium">
                  Swipe to read reviews
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

          {/* Testimonials Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible scrollbar-hide pb-6"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Add this for custom scrollbar styling */}
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="shrink-0 w-80 md:w-auto md:shrink md:min-w-0 group bg-white rounded-3xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Quote Icon with animation */}
                <div className="relative mb-6">
                  <Quote className="w-12 h-12 text-gray-200" />
                  <div className="absolute top-0 left-0 w-12 h-12 flex items-center justify-center">
                    <span className="text-3xl text-white font-bold opacity-20">
                      &ldquo;
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-amber-400 text-amber-400 transform group-hover:scale-110 transition-transform duration-300"
                      style={{ transitionDelay: `${i * 100}ms` }}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-amber-600">
                    {testimonial.rating}.0
                  </span>
                </div>

                {/* Comment */}
                <p className="text-gray-700 text-lg mb-6 italic leading-relaxed">
                  &quot;{testimonial.comment}&quot;
                </p>

                {/* Stay Info */}
                <div className="mb-6">
                  <div className="inline-flex items-center text-sky-600 font-medium">
                    <div className="w-2 h-2 bg-sky-500 rounded-full mr-2"></div>
                    {testimonial.stay}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {testimonial.duration}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex items-center pt-6 border-t border-gray-100">
                  <div
                    className={`w-14 h-14 rounded-full ${testimonial.avatarColor} flex items-center justify-center relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 opacity-10 bg-white"></div>
                    <span className="text-white text-lg font-bold">
                      {getInitials(testimonial.name)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="font-bold text-gray-900 group-hover:text-sky-600 transition-colors duration-300">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {testimonial.role}
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mr-1"></div>
                      <div className="text-xs text-gray-500">
                        Verified Guest
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicators and stats */}
        <div className="md:hidden mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-sky-300"></div>
            <div className="text-sm text-gray-500">
              Scroll to read more reviews
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
