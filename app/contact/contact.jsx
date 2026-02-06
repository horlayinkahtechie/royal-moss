"use client";

import { MessageSquare } from "lucide-react";
import ContactSection from "@/app/_components/ContactSection";

const ContactPage = () => {
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
    </div>
  );
};

export default ContactPage;
