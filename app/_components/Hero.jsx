"use client";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center pt-10 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/heroImage.jpg"
            alt="Royal moss"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={75}
          />
        </div>

        {/* Dark Overlay for better text contrast */}
        <div className="absolute inset-0 bg-linear-to-br from-black/40 via-black/30 to-black/20"></div>

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-purple-900/10 via-sky-900/5 to-transparent"></div>
      </div>

      {/* Animated Blob Elements (now with lower opacity for better contrast) */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200/20 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-sky-200/20 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      {/* Content */}
      <div className="relative max-w-8xl mx-auto px-3 sm:px-6 lg:px-8 lg:py-24 py-17">
        <div className="text-center lg:text-left lg:max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
            <span className="w-2 h-2 bg-purple-300 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm font-semibold text-white">
              Luxury Experience Awaits
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl  font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Experience{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-300 to-purple-300">
              Unparalleled Luxury
            </span>{" "}
            & Comfort
          </h1>

          {/* Subtitle */}
          <p className="lg:text-xl text-l text-white/90 mb-10 max-w-2xl drop-shadow-md">
            Discover a world of elegance and exceptional service at our
            award-winning hotel. Perfect stays crafted just for you.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              href="/rooms"
              className="px-8 py-4 cursor-pointer bg-purple-600 text-white rounded-full font-semibold text-lg hover:bg-purple-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
            >
              Book Now
              <span className="ml-2">→</span>
            </Link>

            <button
              onClick={() => {
                document
                  .getElementById("check-availability")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-4 cursor-pointer bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold text-lg border-2 border-white/40 hover:border-white hover:bg-white/30 hover:shadow-xl transition-all duration-300 group shadow-lg"
            >
              <span className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2 text-white group-hover:animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
                Check Availability
              </span>
            </button>
          </div>

          {/* Stats (Optional - Uncomment if needed) */}
          {/* <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
            {[
              { value: "4.9", label: "Guest Rating", color: "text-purple-300" },
              { value: "120+", label: "Luxury Rooms", color: "text-sky-300" },
              { value: "24/7", label: "Concierge", color: "text-purple-300" },
              { value: "5*", label: "Star Hotel", color: "text-sky-300" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg"
              >
                <div className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-white/90 mt-1">{stat.label}</div>
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Hero;
