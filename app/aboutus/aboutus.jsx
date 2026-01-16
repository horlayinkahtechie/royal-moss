"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Users,
  Globe,
  Heart,
  Sparkles,
  Star,
  CheckCircle,
  Building,
  Trophy,
  Shield,
  Leaf,
} from "lucide-react";

import HotelExterior from "@/public/images/deluxe-room.jpg";
const hotelImage =
  "https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGhvdGVsfGVufDB8fDB8fHww";

const AboutPage = () => {
  const [activeMilestone, setActiveMilestone] = useState(2024);

  const milestones = [
    {
      year: 2023,
      title: "Vision Born",
      description:
        "The concept of Royal Moss was conceived with a dream to create Badagry's premier luxury destination.",
    },
    {
      year: 2024,
      title: "Construction Begins",
      description:
        "Groundbreaking ceremony and construction started on Iworo-Aradagun Road.",
    },
    {
      year: 2025,
      title: "Grand Opening",
      description:
        "Royal Moss Hotel officially opens its doors, welcoming first guests to experience luxury redefined.",
    },
    {
      year: 2026,
      title: "First Recognition",
      description:
        "Receives 'Best New Luxury Hotel' award in Lagos hospitality awards.",
    },
    {
      year: 2027,
      title: "Sustainable Initiatives",
      description:
        "Launches comprehensive eco-friendly program and community engagement.",
    },
    {
      year: 2028,
      title: "Future Vision",
      description:
        "Plans for expansion and introduction of premium wellness center.",
    },
  ];

  const coreValues = [
    {
      icon: Heart,
      title: "Personalized Service",
      description:
        "Every guest receives bespoke attention tailored to their unique preferences and needs.",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
    },
    {
      icon: Shield,
      title: "Authentic Hospitality",
      description:
        "We blend modern luxury with genuine Nigerian warmth and cultural authenticity.",
      color: "text-sky-500",
      bgColor: "bg-sky-50",
    },
    {
      icon: Globe,
      title: "Local Excellence",
      description:
        "Showcasing Badagry's rich heritage while maintaining international luxury standards.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
    },
    {
      icon: Leaf,
      title: "Sustainable Innovation",
      description:
        "Pioneering eco-friendly practices in Nigerian luxury hospitality.",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
  ];

  const leadershipTeam = [
    {
      name: "Olatunji Amosu",
      role: "CEO/Director",
      imageColor: "bg-gradient-to-br from-sky-400 to-blue-500",
    },
    {
      name: "Mojibola Amosu",
      role: "COO/Director",
      imageColor: "bg-gradient-to-br from-purple-400 to-pink-500",
    },
    {
      name: "Oluwaseun Amosu",
      role: "Director",

      imageColor: "bg-gradient-to-br from-amber-400 to-orange-500",
    },
    {
      name: "Olawunmi Amosu",
      role: "Director",

      imageColor: "bg-gradient-to-br from-emerald-400 to-teal-500",
    },
  ];

  const awards = [
    { title: "Best New Luxury Hotel 2025", icon: Trophy },
    { title: "Sustainable Design Award", icon: Leaf },
    { title: "Cultural Hospitality Excellence", icon: Star },
    { title: "Guest Service Innovation", icon: Users },
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
                <Sparkles className="w-4 h-4 text-white mr-2" />
                <span className="text-sm font-semibold text-white">
                  The New Era of Luxury
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Welcome to{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-300 to-purple-300">
                  Royal Moss
                </span>{" "}
                Hotel
              </h1>

              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                Badagry&apos;s newest and most exclusive luxury destination,
                where contemporary elegance meets authentic Nigerian hospitality
                in a breathtaking waterfront setting.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    document
                      .getElementById("our-story")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3 cursor-pointer bg-white text-sky-600 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1"
                >
                  Discover Our Vision
                </button>
                <button
                  onClick={() => {
                    document
                      .getElementById("our-team")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3 cursor-pointer border-2 border-white/40 text-white rounded-full font-semibold hover:border-white hover:bg-white/10 transition-all duration-300"
                >
                  Meet The Founders
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: "New", label: "Premium Destination", icon: Sparkles },
                {
                  value: "50+",
                  label: "Luxury Rooms & Suites",
                  icon: Building,
                },
                { value: "50+", label: "Expert Team Members", icon: Users },
                { value: "5*", label: "Service Standard", icon: Star },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-sm text-white/80">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20" id="our-story">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative  h-100 rounded-3xl overflow-hidden shadow-2xl">
              <Image
                alt="about"
                src={HotelExterior}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                A New Vision for{" "}
                <span className="text-sky-600">Badagry Luxury</span>
              </h2>

              <p className="text-lg text-gray-600 mb-6">
                Royal Moss Hotel represents a bold new chapter in Nigerian
                luxury hospitality. Born from a vision to create Badagry&apos;s
                most exclusive retreat, we&apos;ve built a sanctuary that honors
                local heritage while embracing global luxury standards.
              </p>

              <p className="text-lg text-gray-600 mb-8">
                Strategically located on Iworo-Aradagun Road, our property
                offers breathtaking views and unprecedented access to
                Badagry&apos;s rich cultural tapestry. Every aspect of Royal
                Moss has been meticulously designed to provide an authentic yet
                elevated Nigerian experience.
              </p>

              <div className="space-y-4">
                {[
                  "First luxury hotel built specifically for Badagry's unique landscape",
                  "Sustainable construction using locally-sourced materials",
                  "Custom-designed interiors blending modern and traditional elements",
                  "Partnerships with local artisans and cultural ambassadors",
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="text-sky-600">Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From vision to reality - the milestones of creating Badagry&apos;s
              premier luxury destination
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-0 right-0 top-8 h-0.5 bg-linear-to-r from-sky-400 via-purple-400 to-pink-400 hidden lg:block"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8">
              {milestones.map((milestone) => (
                <div
                  key={milestone.year}
                  className="relative group"
                  onMouseEnter={() => setActiveMilestone(milestone.year)}
                >
                  <div
                    className={`text-center transition-all duration-300 ${
                      activeMilestone === milestone.year
                        ? "scale-110"
                        : "scale-100"
                    }`}
                  >
                    <div
                      className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                        activeMilestone === milestone.year
                          ? "bg-linear-to-r from-sky-600 to-purple-600 text-white shadow-xl"
                          : "bg-white text-gray-600 shadow-lg"
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-bold text-lg">
                          {milestone.year}
                        </div>
                      </div>
                    </div>

                    <h3
                      className={`font-bold text-lg mb-2 transition-colors ${
                        activeMilestone === milestone.year
                          ? "text-sky-600"
                          : "text-gray-900"
                      }`}
                    >
                      {milestone.title}
                    </h3>

                    <p className="text-sm text-gray-600">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="text-sky-600">Philosophy</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The guiding principles that define the Royal Moss experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div
                  className={`w-16 h-16 ${value.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <value.icon className={`w-8 h-8 ${value.color}`} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-gray-50" id="our-team">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              The <span className="text-sky-600">Visionaries</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the passionate team bringing Royal Moss to life
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadershipTeam.map((member, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div
                  className={`h-48 ${member.imageColor} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-3xl font-bold opacity-20">
                        Royal Moss
                      </div>
                      <div className="text-sm opacity-40">Pioneers</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <div className="text-sky-600 font-medium mb-3">
                    {member.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Setting New <span className="text-sky-600">Standards</span>
              </h2>

              <p className="text-lg text-gray-600 mb-8">
                Even as a new establishment, Royal Moss is already setting
                benchmarks for luxury hospitality in Nigeria and earning
                recognition for our innovative approach.
              </p>

              <div className="space-y-6">
                {awards.map((award, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="p-3 bg-sky-100 rounded-lg">
                      <award.icon className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {award.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Nigerian Hospitality Excellence Awards
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-full h-125 lg:h-150">
              <Image
                src={hotelImage}
                alt="Royal Moss Image"
                fill
                className="rounded-3xl object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Simple icon components
const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

export default AboutPage;
