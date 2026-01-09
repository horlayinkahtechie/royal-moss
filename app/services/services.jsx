"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Star,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  ChevronRight,
  ArrowRight,
  Shield,
  Award,
  Heart,
  Zap,
  Coffee,
  Building,
  Key,
  ConciergeBell,
  Dumbbell,
  Scissors,
  Droplets,
  Music,
  GlassWater,
  Shirt,
  UtensilsCrossed,
  Wifi,
  Phone,
  MapPin,
} from "lucide-react";

const HotelServices = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const serviceCategories = [
    { id: "all", label: "All Services", icon: Sparkles, count: 9 },
    { id: "accommodation", label: "Accommodation", icon: Key, count: 1 },
    { id: "events", label: "Events", icon: Building, count: 2 },
    { id: "wellness", label: "Wellness", icon: Dumbbell, count: 3 },
    { id: "dining", label: "Dining", icon: UtensilsCrossed, count: 3 },
    { id: "concierge", label: "Concierge", icon: ConciergeBell, count: 2 },
  ];

  const allServices = [
    {
      id: "room-booking",
      title: "Luxury Room Booking",
      category: "accommodation",
      description:
        "Experience unparalleled comfort in our meticulously designed rooms and suites, featuring premium amenities and breathtaking views.",
      price: "Flexible rates available",
      duration: "24/7 check-in available",
      features: [
        "Premium room selection",
        "Flexible cancellation",
        "Best price guarantee",
        "Early check-in/late check-out",
        "Complimentary WiFi",
      ],
      icon: Key,
      image:
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&auto=format&fit=crop&q=60",
      featured: true,
      color: "from-sky-600 to-blue-600",
      popular: true,
      link: "/rooms/all",
    },
    {
      id: "multipurpose-hall",
      title: "Multi-Purpose Hall",
      category: "events",
      description:
        "Versatile event space perfect for weddings, conferences, meetings, and social gatherings with state-of-the-art facilities.",
      price: "Custom packages",
      duration: "Flexible booking hours",
      features: [
        "Capacity: 300+ guests",
        "Professional AV setup",
        "Event planning assistance",
        "Custom catering options",
        "Dedicated event manager",
      ],
      icon: Building,
      image:
        "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&auto=format&fit=crop&q=60",
      color: "from-purple-600 to-pink-600",
      featured: true,
      link: "/contact",
    },
    {
      id: "gym",
      title: "Fitness Center",
      category: "wellness",
      description:
        "Modern fitness facility equipped with the latest exercise machines, free weights, and personal training services.",
      price: "Complimentary for guests",
      duration: "24-hour access",
      features: [
        "Cardio machines",
        "Strength training equipment",
        "Personal trainers",
        "Yoga mats & accessories",
        "Locker facilities",
      ],
      icon: Dumbbell,
      image:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=60",
      color: "from-emerald-600 to-teal-600",
      popular: true,
      link: "/contact",
    },
    {
      id: "salon",
      title: "Unisex Salon",
      category: "wellness",
      description:
        "Professional hair and beauty services for both men and women, provided by expert stylists in a relaxing environment.",
      price: "From ₦5,000",
      duration: "9AM - 9PM daily",
      features: [
        "Haircut & styling",
        "Manicure & pedicure",
        "Facials & skincare",
        "Beard grooming",
        "Makeup services",
      ],
      icon: Scissors,
      image:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=60",
      color: "from-rose-600 to-pink-600",
      link: "/contact",
    },
    {
      id: "restaurant",
      title: "Royal Restaurant",
      category: "dining",
      description:
        "Exquisite dining experience featuring both local and international cuisine, prepared by our award-winning chefs.",

      duration: "6AM - 11PM daily",
      features: [
        "Award-winning chefs",
        "Local & international cuisine",
        "Private dining available",
        "Wine pairing selection",
        "24/7 room service",
      ],
      icon: UtensilsCrossed,
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=60",
      color: "from-amber-600 to-orange-600",
      featured: true,
      popular: true,
      link: "/contact",
    },
    {
      id: "swimming-pool",
      title: "Infinity Pool",
      category: "wellness",
      description:
        "Stunning infinity pool overlooking Badagry with separate areas for adults and children, complete with poolside service.",
      price: "Complimentary for guests",
      duration: "6AM - 10PM daily",
      features: [
        "Infinity edge design",
        "Children's section",
        "Poolside bar & snacks",
        "Lounge chairs & towels",
        "Swimming instructor available",
      ],
      icon: Droplets,
      image:
        "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&auto=format&fit=crop&q=60",
      color: "from-blue-500 to-cyan-500",
      popular: true,
      link: "/contact",
    },
    {
      id: "laundry",
      title: "Laundry & Dry Cleaning",
      category: "concierge",
      description:
        "Professional laundry and dry cleaning services with same-day return for your convenience and comfort.",
      price: "From ₦2,500",
      duration: "Same-day service",
      features: [
        "Same-day service",
        "Eco-friendly detergents",
        "Expert stain removal",
        "Ironing & pressing",
        "Express service available",
      ],
      icon: Shirt,
      image:
        "https://images.unsplash.com/photo-1581368129682-2bdfd80b195b?w=600&auto=format&fit=crop&q=60",
      color: "from-indigo-600 to-purple-600",
      link: "/contact",
    },
    {
      id: "bar",
      title: "Skyline Bar",
      category: "dining",
      description:
        "Chic rooftop bar offering premium cocktails, fine wines, and panoramic views of Badagry's landscape.",
      price: "From ₦2,500 per drink",
      duration: "4PM - 2AM",
      features: [
        "Premium cocktails",
        "Fine wine selection",
        "Live music weekends",
        "Rooftop seating",
        "Signature mocktails",
      ],
      icon: GlassWater,
      image:
        "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&auto=format&fit=crop&q=60",
      color: "from-violet-600 to-purple-600",
      link: "/contact",
    },
    {
      id: "vip-lounge",
      title: "VIP Executive Lounge",
      category: "dining",
      description:
        "Exclusive lounge for VIP guests featuring private workspaces, premium refreshments, and personalized service.",
      price: "Access with premium rooms",
      duration: "24/7 access",
      features: [
        "Private workstations",
        "Complimentary refreshments",
        "Business facilities",
        "Dedicated concierge",
        "Exclusive events",
      ],
      icon: Users,
      image:
        "https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?w=600&auto=format&fit=crop&q=60",
      color: "from-amber-600 to-red-600",
      link: "/contact",
    },
  ];

  const filteredServices =
    activeCategory === "all"
      ? allServices
      : allServices.filter((service) => service.category === activeCategory);

  const testimonials = [
    {
      name: "Chioma Adebayo",
      role: "Business Traveler",
      text: "The multi-purpose hall was perfect for our corporate retreat. The event team was incredibly professional.",
      rating: 5,
      service: "Multi-Purpose Hall",
    },
    {
      name: "Tunde Okafor",
      role: "Fitness Enthusiast",
      text: "The gym facilities are top-notch! Better equipped than most dedicated fitness centers in Lagos.",
      rating: 5,
      service: "Fitness Center",
    },
    {
      name: "Amara Okeke",
      role: "Wedding Planner",
      text: "Exceptional service for our client's wedding. Every detail was handled perfectly by the Royal Moss team.",
      rating: 5,
      service: "Event Services",
    },
  ];

  const bookingSteps = [
    {
      number: 1,
      title: "Browse Services",
      description: "Explore our premium offerings",
      icon: Sparkles,
    },
    {
      number: 2,
      title: "Select & Customize",
      description: "Choose and tailor to your needs",
      icon: Heart,
    },
    {
      number: 3,
      title: "Instant Booking",
      description: "Secure reservation online or call",
      icon: Calendar,
    },
    {
      number: 4,
      title: "Enjoy Experience",
      description: "Relax and let us handle everything",
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-br from-sky-900 via-purple-900 to-gray-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/service-pattern.svg')] opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-pulse">
              <Sparkles className="w-4 h-4 text-white mr-2" />
              <span className="text-sm font-semibold text-white">
                PREMIUM SERVICES
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Discover{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-purple-300">
                Royal Moss
              </span>{" "}
              Excellence
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-3xl mx-auto">
              Experience unparalleled luxury with our comprehensive range of
              premium services designed to make your stay unforgettable in
              Badagry.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  document
                    .getElementById("services-grid")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 md:px-8 md:py-4 cursor-pointer bg-gradient-to-r from-sky-500 to-purple-500 text-white rounded-full font-semibold text-base md:text-lg hover:from-sky-600 hover:to-purple-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl shadow-lg flex items-center"
              >
                Explore Services
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
              <Link
                href="/contact"
                className="px-6 py-3 md:px-8 md:py-4 cursor-pointer border-2 border-white/40 text-white rounded-full font-semibold text-base md:text-lg hover:border-white hover:bg-white/10 transition-all duration-300 flex items-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Quick Inquiry
              </Link>
            </div>
          </div>
        </div>

        {/* Floating stats */}
        <div className="relative z-20 mt-12 md:mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { value: "9+", label: "Premium Services", icon: Sparkles },
              { value: "24/7", label: "Available", icon: Clock },
              { value: "100%", label: "Satisfaction", icon: Heart },
              { value: "50+", label: "Expert Staff", icon: Users },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="p-2 md:p-3 bg-white/10 rounded-lg md:rounded-xl">
                    <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-white/80">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Filter */}
      <section
        className="py-8 bg-gradient-to-r from-sky-50 to-purple-50 sticky top-0 z-40 shadow-sm"
        id="services-grid"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Our Premium Services
            </h2>

            <div className="flex flex-wrap justify-center gap-2">
              {serviceCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`group px-3 py-2 md:px-4 md:py-2 rounded-full flex items-center space-x-2 transition-all duration-300 ${
                    activeCategory === category.id
                      ? "bg-gradient-to-r from-sky-500 to-purple-500 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-50 shadow"
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  <span className="font-medium text-sm md:text-base">
                    {category.label}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      activeCategory === category.id
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredServices.map((service) => (
              <Link
                key={service.id}
                href={service.link}
                className={`group relative bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 block ${
                  service.featured ? "lg:col-span-2 lg:row-span-2" : ""
                }`}
              >
                {/* Popular badge */}
                {service.popular && (
                  <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                )}

                {/* Image */}
                <div className="relative h-48 md:h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>

                  {/* Category indicator */}
                  <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                    <span className="text-xs font-semibold text-gray-700">
                      {service.category.toUpperCase()}
                    </span>
                  </div>

                  <div className="absolute inset-0">
                    <Image
                      alt={service.title}
                      src={service.image}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  {/* Service icon overlay */}
                  <div className="absolute bottom-4 left-4 z-20 w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-5 h-5 md:w-6 md:h-6 text-sky-600" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 md:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                        {service.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-3 md:space-x-4">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {service.duration}
                        </span>
                        <span className="font-semibold text-sky-600">
                          {service.price}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gradient-to-r from-sky-500 to-purple-500 transition-all duration-300">
                      <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white" />
                    </div>
                  </div>

                  <p className="text-gray-600 mb-5 md:mb-6 text-sm md:text-base">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 md:space-y-3 mb-5 md:mb-6">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                    {service.features.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{service.features.length - 3} more features
                      </div>
                    )}
                  </div>

                  {/* Action button */}
                  <div className="pt-4 border-t border-gray-100">
                    <span className="inline-flex items-center text-sky-600 font-semibold text-sm md:text-base group-hover:text-purple-600 transition-colors">
                      Book Now
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* No services message */}
          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No services found
              </h3>
              <p className="text-gray-600 mb-6">
                Try selecting a different category
              </p>
              <button
                onClick={() => setActiveCategory("all")}
                className="px-6 py-3 bg-sky-500 text-white rounded-full font-semibold hover:bg-sky-600 transition-all duration-300"
              >
                Show All Services
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Booking Process */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-sky-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Simple{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-purple-600">
                Booking
              </span>{" "}
              Process
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Book your preferred service in just a few easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {bookingSteps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connecting line */}
                {index < bookingSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-3/4 w-full h-0.5 bg-gradient-to-r from-sky-300 to-purple-300"></div>
                )}

                <div className="relative group bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="absolute -top-4 left-6 md:left-8 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-sky-500 to-purple-500 rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg">
                    {step.number}
                  </div>

                  <div className="mt-6 md:mt-8">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-sky-100 to-purple-100 rounded-xl md:rounded-2xl flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="w-7 h-7 md:w-8 md:h-8 text-gradient-to-r from-sky-600 to-purple-600" />
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 md:mt-12">
            <Link
              href="/rooms/all"
              className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-sky-500 to-purple-500 text-white rounded-full font-semibold text-base md:text-lg hover:from-sky-600 hover:to-purple-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl shadow-lg inline-flex items-center"
            >
              Start Booking Now
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              What Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-purple-600">
                Guests
              </span>{" "}
              Say
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Real experiences from our valued guests
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="flex items-center mb-5 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-sky-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 md:w-5 md:h-5 text-amber-500 fill-amber-500"
                    />
                  ))}
                </div>

                <p className="text-gray-700 mb-4 italic text-sm md:text-base">
                  &quot;{testimonial.text}&quot;
                </p>

                <div className="pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-gradient-to-r from-sky-600 to-purple-600">
                    {testimonial.service}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-sky-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/sparkle-pattern.svg')] opacity-10"></div>
        </div>

        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
            <Award className="w-4 h-4 text-white mr-2" />
            <span className="text-sm font-semibold text-white">
              PREMIUM EXPERIENCE
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Experience Royal Moss?
          </h2>

          <p className="text-lg md:text-xl text-white/90 mb-8 md:mb-10 max-w-3xl mx-auto">
            Book your preferred service today and let us create unforgettable
            moments tailored just for you in the heart of Badagry.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/rooms/all"
              className="px-6 py-3 md:px-8 md:py-4 cursor-pointer bg-white text-sky-600 rounded-full font-semibold text-base md:text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-2xl flex items-center justify-center"
            >
              <Shield className="w-5 h-5 mr-2" />
              Book Now
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 md:px-8 md:py-4 cursor-pointer border-2 border-white text-white rounded-full font-semibold text-base md:text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </Link>
          </div>

          <div className="mt-8 md:mt-10 flex flex-wrap justify-center gap-4 md:gap-6 text-white/80 text-sm">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Best Price Guarantee
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              24/7 Customer Support
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-5 mr-2" />
              Flexible Cancellation
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HotelServices;
