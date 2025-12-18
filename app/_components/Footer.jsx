// components/Footer.tsx
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const footerLinks = {
    "Quick Links": [
      { label: "Home", href: "/" },
      { label: "Rooms & Suites", href: "/rooms" },
      { label: "Amenities", href: "/gallery" },
      // { label: "Special Offers", href: "/offers" },
      { label: "Gallery", href: "/gallery" },
      { label: "Your Bookings", href: "/bookings" },
    ],
    Services: [
      { label: "Concierge", href: "/services/concierge" },
      { label: "Spa & Wellness", href: "/services/spa" },
      { label: "Fine Dining", href: "/services/dining" },
      { label: "Meeting Rooms", href: "/services/meetings" },
      { label: "Transport", href: "/services/transport" },
    ],
    Support: [
      { label: "FAQ", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Contact Us", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
  };

  return (
    <footer id="contact" className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Royal Moss</h2>
            <p className="text-gray-400 mb-6">
              Experience luxury redefined at our hotel. Where exceptional
              service meets unforgettable moments.
            </p>

            {/* Social Media */}
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-sky-600 transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-lg font-bold mb-6 text-white">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-sky-400 mr-3 mt-1" />
                <span className="text-gray-400">
                  123 Luxury Avenue
                  <br />
                  Miami Beach, FL 33139
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-sky-400 mr-3" />
                <span className="text-gray-400">(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-sky-400 mr-3" />
                <span className="text-gray-400">info@royalmoss.com</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-8">
              <h4 className="font-bold mb-3 text-white">Stay Updated</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-sky-500 text-white"
                />
                <button className="px-4 bg-sky-600 text-white rounded-r-lg font-semibold hover:bg-sky-700 transition-colors">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <div className="mb-4 md:mb-0">
            © {new Date().getFullYear()} Royal Moss Hotel. All rights reserved.
          </div>

          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
