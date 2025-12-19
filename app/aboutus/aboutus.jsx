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
  Calendar,
  Trophy,
  Shield,
  Leaf,
} from "lucide-react";

// Mock images - replace with your actual images
import HotelExterior from "@/public/images/deluxe-room.jpg";

const AboutPage = () => {
  const [activeMilestone, setActiveMilestone] = useState(2024);

  const milestones = [
    {
      year: 2010,
      title: "Foundation",
      description:
        "Royal Moss Hotel was founded with a vision to redefine luxury hospitality.",
    },
    {
      year: 2013,
      title: "First Award",
      description:
        "Received our first 5-star rating and Luxury Hotel of the Year award.",
    },
    {
      year: 2016,
      title: "Global Expansion",
      description:
        "Opened our second property in Dubai, marking international presence.",
    },
    {
      year: 2019,
      title: "Sustainability Leader",
      description:
        "Achieved carbon-neutral certification across all properties.",
    },
    {
      year: 2022,
      title: "Innovation Hub",
      description: "Launched our digital concierge and smart room technology.",
    },
    {
      year: 2024,
      title: "Industry Pioneer",
      description: "Introduced AI-powered personalized guest experiences.",
    },
  ];

  const coreValues = [
    {
      icon: Heart,
      title: "Exceptional Service",
      description:
        "We believe in creating unforgettable experiences through personalized, anticipatory service.",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
    },
    {
      icon: Shield,
      title: "Integrity",
      description:
        "We operate with transparency, honesty, and respect in all our relationships.",
      color: "text-sky-500",
      bgColor: "bg-sky-50",
    },
    {
      icon: Globe,
      title: "Global Excellence",
      description:
        "We combine local authenticity with international standards of luxury.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
    },
    {
      icon: Leaf,
      title: "Sustainable Luxury",
      description:
        "We're committed to environmental stewardship without compromising on luxury.",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
  ];

  const leadershipTeam = [
    {
      name: "Eleanor Sterling",
      role: "Founder & CEO",
      experience: "25+ years in luxury hospitality",
      imageColor: "bg-gradient-to-br from-sky-400 to-blue-500",
    },
    {
      name: "Marcus Chen",
      role: "Head of Operations",
      experience: "15+ years managing 5-star properties",
      imageColor: "bg-gradient-to-br from-purple-400 to-pink-500",
    },
    {
      name: "Isabella Rossi",
      role: "Creative Director",
      experience: "Award-winning interior designer",
      imageColor: "bg-gradient-to-br from-amber-400 to-orange-500",
    },
    {
      name: "David Kingston",
      role: "Guest Experience Director",
      experience: "Former butler to royalty",
      imageColor: "bg-gradient-to-br from-emerald-400 to-teal-500",
    },
  ];

  const awards = [
    { title: "World's Best Luxury Hotel 2023", icon: Trophy },
    { title: "Sustainable Hotel of the Year", icon: Leaf },
    { title: "5-Star Diamond Award", icon: Star },
    { title: "Best Customer Service", icon: Users },
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
                  Our Story
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Redefining{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-300 to-purple-300">
                  Luxury
                </span>{" "}
                Hospitality
              </h1>

              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                For years, Royal Moss has been at the forefront of luxury
                hospitality, blending timeless elegance with modern innovation
                to create unforgettable experiences.
              </p>

              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-sky-600 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1">
                  Explore Our Story
                </button>
                <button className="px-6 py-3 border-2 border-white/40 text-white rounded-full font-semibold hover:border-white hover:bg-white/10 transition-all duration-300">
                  Meet Our Team
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: "10", label: "Years of Excellence", icon: Calendar },
                { value: "50K+", label: "Happy Guests", icon: Users },
                { value: "150+", label: "Team Members", icon: Building },
                { value: "25+", label: "Awards Won", icon: Trophy },
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
      <section className="py-20">
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
                Our <span className="text-sky-600">Journey</span> of Excellence
              </h2>

              <p className="text-lg text-gray-600 mb-6">
                Founded in 2010, Royal Moss began as a dream to create a
                sanctuary where luxury meets genuine hospitality. What started
                as a single property has grown into an internationally acclaimed
                brand, recognized for our commitment to excellence and
                innovation.
              </p>

              <p className="text-lg text-gray-600 mb-8">
                We&apos;ve consistently pushed boundaries while maintaining the
                timeless elegance that defines true luxury. From pioneering
                sustainable practices to introducing cutting-edge guest
                technology, our journey reflects our dedication to evolving with
                our guests&apos; needs.
              </p>

              <div className="space-y-4">
                {[
                  "Award-winning sustainable luxury practices",
                  "Pioneers in personalized guest technology",
                  "Global recognition for exceptional service",
                  "Commitment to local community development",
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
              Our <span className="text-sky-600">Milestones</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key moments that have shaped our journey and defined our legacy
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
              Our <span className="text-sky-600">Core Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide every decision we make and every
              experience we create
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Meet Our <span className="text-sky-600">Leadership</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The visionary team dedicated to redefining luxury hospitality
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
                      <div className="text-sm opacity-40">Leadership</div>
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
                  <p className="text-sm text-gray-600 mb-4">
                    {member.experience}
                  </p>

                  <div className="flex space-x-3 pt-4 border-t border-gray-100">
                    <a
                      href="#"
                      className="text-gray-400 hover:text-sky-600 transition-colors"
                    >
                      <LinkedInIcon />
                    </a>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-sky-600 transition-colors"
                    >
                      <TwitterIcon />
                    </a>
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
                Awards & <span className="text-sky-600">Recognition</span>
              </h2>

              <p className="text-lg text-gray-600 mb-8">
                Our commitment to excellence has been recognized by the most
                prestigious organizations in the hospitality industry.
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
                        International Luxury Hotel Awards
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-linear-to-br from-sky-600 to-purple-600 rounded-3xl p-8 text-white">
              <div className="text-center mb-8">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-white/80" />
                <h3 className="text-2xl font-bold mb-2">Global Recognition</h3>
                <p className="text-white/80">
                  Consistently ranked among the world&apos;s best luxury hotels
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "#1", label: "Luxury Hotel in Region" },
                  { value: "Top 10", label: "Worldwide" },
                  { value: "5★", label: "Service Rating" },
                  { value: "98%", label: "Guest Satisfaction" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
                  >
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-linear-to-r from-sky-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Experience the Royal Moss Difference
          </h2>

          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
            Join thousands of discerning travelers who have made Royal Moss
            their preferred choice for luxury accommodation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-sky-600 rounded-full font-semibold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-2xl">
              Book Your Stay
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300">
              Contact Our Team
            </button>
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
