"use client";

import { useState } from "react";
import Image from "next/image";
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
  Users as UsersIcon,
  Building,
  Key,
  ConciergeBell,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";

const SpaService =
  "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&auto=format&fit=crop&q=60";
const DiningService =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=60";
const MeetingService =
  "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&auto=format&fit=crop&q=60";
const ClubService =
  "https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?w=600&auto=format&fit=crop&q=60";
const BookingService =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&auto=format&fit=crop&q=60";
const ConciergeService =
  "https://plus.unsplash.com/premium_photo-1723914099684-a6d2b1d0ad89?w=600&auto=format&fit=crop&q=60";

const ServicesPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const serviceCategories = [
    { id: "all", label: "All Services", icon: Sparkles, count: 6 },
    { id: "wellness", label: "Wellness", icon: Sparkles, count: 2 },
    { id: "dining", label: "Dining", icon: UtensilsCrossed, count: 1 },
    { id: "business", label: "Business", icon: Building, count: 1 },
    { id: "entertainment", label: "Entertainment", icon: UsersIcon, count: 1 },
    { id: "support", label: "Support", icon: ConciergeBell, count: 2 },
  ];

  const allServices = [
    {
      id: "club",
      title: "Royal Club",
      category: "entertainment",
      description:
        "Exclusive members-only club with premium amenities, private events, and networking opportunities for discerning guests.",
      price: "From $150/day",
      duration: "Access 24/7",
      features: [
        "Private Bar & Lounge",
        "Business Center",
        "Networking Events",
        "Complimentary Refreshments",
        "Dedicated Host",
      ],
      icon: Users,
      image: ClubService,
      featured: true,
      color: "from-purple-600 to-pink-600",
      popular: true,
    },
    {
      id: "dining",
      title: "Fine Dining",
      category: "dining",
      description:
        "Michelin-starred culinary experiences with world-class chefs, featuring locally sourced ingredients and international cuisine.",
      price: "From $75/person",
      duration: "Multiple venues",
      features: [
        "Michelin-starred Chef",
        "Wine Pairing",
        "Private Dining",
        "Cooking Classes",
        "24/7 Room Service",
      ],
      icon: Coffee,
      image: DiningService,
      featured: true,
      color: "from-amber-600 to-orange-600",
    },
    {
      id: "meetings",
      title: "Meeting Rooms",
      category: "business",
      description:
        "State-of-the-art conference and meeting facilities equipped with cutting-edge technology for productive business gatherings.",
      price: "From $500/day",
      duration: "Flexible hours",
      features: [
        "4K Video Conferencing",
        "Professional AV Setup",
        "Catering Services",
        "Event Planning",
        "High-Speed WiFi",
      ],
      icon: Building,
      image: MeetingService,
      color: "from-blue-600 to-cyan-600",
    },
    {
      id: "spa",
      title: "Spa & Wellness",
      category: "wellness",
      description:
        "Tranquil sanctuary offering premium spa treatments, fitness facilities, and holistic wellness programs for complete rejuvenation.",
      price: "From $120/treatment",
      duration: "90-180 min sessions",
      features: [
        "Signature Treatments",
        "Expert Therapists",
        "Fitness Center",
        "Yoga Studio",
        "Wellness Programs",
      ],
      icon: Sparkles,
      image: SpaService,
      featured: true,
      color: "from-emerald-600 to-teal-600",
      popular: true,
    },
    {
      id: "booking",
      title: "Room Booking",
      category: "support",
      description:
        "Seamless accommodation booking with personalized room selection, exclusive packages, and flexible cancellation policies.",
      price: "Flexible rates",
      duration: "24/7 availability",
      features: [
        "Best Price Guarantee",
        "Flexible Cancellation",
        "Room Customization",
        "Early Check-in",
        "Loyalty Rewards",
      ],
      icon: Key,
      image: BookingService,
      color: "from-sky-600 to-blue-600",
    },
    {
      id: "concierge",
      title: "Concierge Service",
      category: "support",
      description:
        "Personalized assistance for reservations, transportation, local experiences, and bespoke itinerary planning.",
      price: "Complimentary",
      duration: "24/7 service",
      features: [
        "Reservation Assistance",
        "Transportation Arrangements",
        "Local Experiences",
        "Event Tickets",
        "Personal Shopping",
      ],
      icon: ConciergeBell,
      image: ConciergeService,
      color: "from-rose-600 to-pink-600",
    },
  ];

  const filteredServices =
    activeCategory === "all"
      ? allServices
      : allServices.filter((service) => service.category === activeCategory);

  const testimonials = [
    {
      name: "Michael Chen",
      role: "Business Executive",
      text: "The meeting facilities are exceptional. Everything from the AV setup to the catering was flawless.",
      rating: 5,
      service: "Meeting Rooms",
    },
    {
      name: "Sophia Williams",
      role: "Wellness Enthusiast",
      text: "The spa treatments were transformative. Best wellness experience I've had in years.",
      rating: 5,
      service: "Spa & Wellness",
    },
    {
      name: "James Wilson",
      role: "Food Critic",
      text: "The dining experience rivals Michelin-starred restaurants in Paris. Absolutely exquisite.",
      rating: 5,
      service: "Fine Dining",
    },
  ];

  const bookingSteps = [
    {
      number: 1,
      title: "Choose Service",
      description: "Select from our premium services",
      icon: Sparkles,
    },
    {
      number: 2,
      title: "Customize",
      description: "Tailor the experience to your needs",
      icon: Heart,
    },
    {
      number: 3,
      title: "Book & Confirm",
      description: "Secure your reservation instantly",
      icon: Calendar,
    },
    {
      number: 4,
      title: "Enjoy",
      description: "Experience luxury service",
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden inset-0 bg-linear-to-br from-sky-900/90 via-purple-900/80 to-gray-900/90 z-10">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/service-pattern.svg')] opacity-10"></div>
          <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
              <Sparkles className="w-4 h-4 text-white mr-2" />
              <span className="text-sm font-semibold text-white">
                Premium Services
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Experience{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-300 to-purple-300">
                Unparalleled
              </span>{" "}
              Service
            </h1>

            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
              Discover our curated selection of premium services designed to
              elevate your stay with luxury, comfort, and exceptional attention
              to detail.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  document
                    .getElementById("our-services")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-4 cursor-pointer bg-linear-to-r from-sky-500 to-purple-500 text-white rounded-full font-semibold text-lg hover:from-sky-600 hover:to-purple-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl shadow-lg"
              >
                Explore All Services
              </button>
            </div>
          </div>
        </div>

        {/* Floating stats */}
        <div className="relative z-20 mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "24/7", label: "Service Availability", icon: Clock },
              { value: "100%", label: "Satisfaction Rate", icon: Heart },
              { value: "50+", label: "Expert Staff", icon: Users },
              { value: "Instant", label: "Booking Confirmation", icon: Zap },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Filter */}
      <section
        className="py-12  bg-gray-50 sticky top-0 z-40 shadow-sm"
        id="our-services"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Our Premium Services
            </h2>

            <div className="flex flex-wrap gap-2">
              {serviceCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`group px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-300 ${
                    activeCategory === category.id
                      ? "bg-sky-500 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-100 shadow"
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  <span className="font-medium">{category.label}</span>
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
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                  service.featured ? "lg:col-span-2 lg:row-span-2" : ""
                }`}
              >
                {/* Popular badge */}
                {service.popular && (
                  <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                    POPULAR
                  </div>
                )}

                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent z-10"></div>

                  {/* Solid color overlay based on service */}
                  <div
                    className={`absolute inset-0 ${
                      service.category === "wellness"
                        ? "bg-emerald-500"
                        : service.category === "dining"
                        ? "bg-amber-500"
                        : service.category === "business"
                        ? "bg-blue-500"
                        : service.category === "entertainment"
                        ? "bg-purple-500"
                        : service.category === "support"
                        ? "bg-sky-500"
                        : "bg-gray-500"
                    } opacity-10`}
                  ></div>

                  <Image
                    alt={service.title}
                    src={service.image}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Service icon overlay */}
                  <div className="absolute bottom-4 left-4 z-20 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <service.icon
                      className={`w-6 h-6 ${
                        service.category === "wellness"
                          ? "text-emerald-600"
                          : service.category === "dining"
                          ? "text-amber-600"
                          : service.category === "business"
                          ? "text-blue-600"
                          : service.category === "entertainment"
                          ? "text-purple-600"
                          : service.category === "support"
                          ? "text-sky-600"
                          : "text-gray-600"
                      }`}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {service.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {service.duration}
                        </span>
                        <span className="font-semibold text-sky-600">
                          {service.price}
                        </span>
                      </div>
                    </div>

                    <button className="p-2 bg-gray-100 rounded-lg group-hover:bg-sky-500 transition-all duration-300">
                      <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white" />
                    </button>
                  </div>

                  <p className="text-gray-600 mb-6">{service.description}</p>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple <span className="text-sky-600">Booking</span> Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Book your preferred service in just a few easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {bookingSteps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connecting line */}
                {index < bookingSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-3/4 w-full h-0.5 bg-sky-200"></div>
                )}

                <div className="relative group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="absolute -top-4 left-8 w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {step.number}
                  </div>

                  <div className="mt-4">
                    <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="w-8 h-8 text-sky-600" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/rooms/all"
              className="px-8 py-4 bg-sky-500 text-white rounded-full font-semibold text-lg hover:bg-sky-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl shadow-lg inline-flex items-center"
            >
              Start Booking Now
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Guest <span className="text-sky-600">Testimonials</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our guests say about our premium services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
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
                      className="w-5 h-5 text-amber-500 fill-amber-500"
                    />
                  ))}
                </div>

                <p className="text-gray-700 mb-4 italic">
                  &quot;{testimonial.text}&quot;
                </p>

                <div className="pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-sky-600">
                    {testimonial.service}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sky-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/sparkle-pattern.svg')] opacity-10"></div>
        </div>

        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
            <Award className="w-4 h-4 text-white mr-2" />
            <span className="text-sm font-semibold text-white">
              Premium Experience
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Experience Premium Service?
          </h2>

          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
            Book your preferred service today and let us create unforgettable
            moments tailored just for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/rooms/all"
              className="px-8 py-4 cursor-pointer bg-white text-sky-600 rounded-full font-semibold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-2xl flex items-center justify-center"
            >
              <Shield className="w-5 h-5 mr-2" />
              Book Securely Now
            </Link>
            <Link
              href="/contact"
              className="px-8 cursor-pointer py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
            >
              <Users className="w-5 h-5 mr-2" />
              Contact Our Team
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-white/80 text-sm">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Best Price Guarantee
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              24/7 Customer Support
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Flexible Cancellation
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
