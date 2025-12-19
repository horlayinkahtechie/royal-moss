"use client";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Send,
  Heart,
} from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const footerLinks = {
    "Quick Links": [
      { label: "Home", href: "/" },
      { label: "Rooms & Suites", href: "/rooms" },
      { label: "Amenities", href: "/gallery" },
      { label: "Gallery", href: "/gallery" },
      { label: "Services", href: "/services" },
      { label: "Your Bookings", href: "/bookings" },
    ],
    Services: [
      { label: "Concierge", href: "/services" },
      { label: "Spa & Wellness", href: "/services" },
      { label: "Fine Dining", href: "/services" },
      { label: "Meeting Rooms", href: "/rooms" },
      { label: "Clubing", href: "/services" },
      { label: "Book a Room", href: "/rooms" },
    ],
    Support: [
      { label: "FAQ", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Contact Us", href: "/contact" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer
      id="contact"
      className="bg-linear-to-b from-gray-900 to-black text-white pt-16 pb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand Column - Wider */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-linear-to-r from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">RM</span>
              </div>
              <h2 className="text-3xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Royal Moss
              </h2>
            </div>
            <p className="text-gray-400 mb-8 text-lg leading-relaxed max-w-lg">
              Experience luxury redefined at our hotel. Where exceptional
              service meets unforgettable moments in the heart of Lagos.
            </p>

            {/* Social Media with hover effects */}
            <div className="flex space-x-3">
              {socialLinks.map(({ icon: Icon, href, label }, index) => (
                <Link
                  key={index}
                  href={href}
                  className="group relative"
                  aria-label={label}
                >
                  <div className="w-12 h-12 bg-gray-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-linear-to-br group-hover:from-sky-500 group-hover:to-blue-600 group-hover:scale-110 group-hover:-translate-y-1">
                    <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded">
                    {label}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
                {category}
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-linear-to-r from-sky-500 to-blue-600 rounded-full"></div>
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group flex items-center text-gray-400 hover:text-white transition-all duration-300"
                    >
                      <ChevronRight className="w-4 h-4 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info & Newsletter */}
          <div className="lg:col-span-2 md:col-span-2">
            <h3 className="text-lg font-bold mb-6 text-white relative inline-block">
              Stay Connected
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-linear-to-r from-sky-500 to-blue-600 rounded-full"></div>
            </h3>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-sky-500/30 transition-all duration-300">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mr-3">
                    <Phone className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Call Us</p>
                    <p className="font-semibold">(555) 123-4567</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-sky-500/30 transition-all duration-300">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mr-3">
                    <Mail className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email Us</p>
                    <p className="font-semibold">info@royalmoss.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 text-sky-400 mr-3 shrink-0" />
                <span className="text-gray-400">
                  123 Luxury Avenue, Lagos Beach, FL 33139
                </span>
              </div>
            </div>

            {/* Newsletter - Modern Design */}
            <div className="mt-8">
              <h4 className="font-bold mb-4 text-white flex items-center">
                <Send className="w-5 h-5 mr-2 text-sky-400" />
                Newsletter Signup
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                Get exclusive offers and updates
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-white placeholder-gray-500 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-xl ring-0 ring-sky-500/0 group-focus-within:ring-2 group-focus-within:ring-sky-500/20 transition-all duration-300"></div>
                </div>
                <button className="px-6 py-3 bg-linear-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center shadow-lg hover:shadow-xl shadow-sky-500/10">
                  Subscribe
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-3">
                By subscribing, you agree to our Privacy Policy
              </p>
            </div>
          </div>
        </div>

        {/* Divider with gradient */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800/50"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="px-4 bg-gray-900">
              <div className="w-24 h-0.5 bg-linear-to-r from-transparent via-sky-500 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Enhanced */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <div className="mb-4 md:mb-0 flex items-center">
            © {new Date().getFullYear()} Royal Moss Hotel. All rights reserved.
            <span className="hidden sm:inline mx-2">•</span>
            <span className="flex items-center text-xs mt-1 sm:mt-0">
              Made with{" "}
              <Heart className="w-3 h-3 mx-1 text-red-500 fill-red-500" /> by{" "}
              {""}
              <Link href="https://abdulsalamalao.com" className="underline">
                Abdul-salam
              </Link>
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link
              href="/privacy-policy"
              className="hover:text-white transition-colors duration-300 hover:underline hover:underline-offset-4"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-white transition-colors duration-300 hover:underline hover:underline-offset-4"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy-policy"
              className="hover:text-white transition-colors duration-300 hover:underline hover:underline-offset-4"
            >
              Cookie Policy
            </Link>
          </div>
        </div>

        {/* Trust Badges for Mobile */}
        <div className="mt-8 md:hidden grid grid-cols-2 gap-4 text-xs">
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="font-semibold text-white">⭐ 4.9/5</div>
            <div className="text-gray-400">Guest Rating</div>
          </div>
          <div className="text-center p-3 bg-gray-800/30 rounded-lg">
            <div className="font-semibold text-white">🏆 Luxury</div>
            <div className="text-gray-400">Award Winner</div>
          </div>
        </div>
      </div>

      {/* Floating Back to Top Button for Mobile */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 md:hidden w-12 h-12 bg-linear-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
        aria-label="Back to top"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </footer>
  );
};

export default Footer;
