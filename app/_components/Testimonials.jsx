// components/Testimonials.tsx
import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Business Traveler",
      rating: 5,
      comment:
        "Absolutely stunning hotel with exceptional service. The executive suite was beyond expectations!",
      avatarColor: "bg-sky-500",
      stay: "Stayed in Executive Suite",
    },
    {
      name: "Michael Chen",
      role: "Family Vacation",
      rating: 5,
      comment:
        "Perfect for families! Kids loved the pool and the staff went above and beyond.",
      avatarColor: "bg-purple-500",
      stay: "Stayed in Family Suite",
    },
    {
      name: "Emma Williams",
      role: "Honeymoon",
      rating: 5,
      comment:
        "The most romantic experience. The ocean view room took our breath away every morning.",
      avatarColor: "bg-amber-500",
      stay: "Stayed in Ocean View",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our <span className="text-sky-600">Guests</span> Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don&apos;t just take our word for it - hear from our satisfied
            guests
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-all duration-300"
            >
              {/* Quote Icon */}
              <Quote className="w-12 h-12 text-gray-200 mb-6" />

              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-gray-700 text-lg mb-6 italic">
                &quot;{testimonial.comment}&quot;
              </p>

              {/* Stay Info */}
              <div className="text-sm text-sky-600 font-medium mb-6">
                {testimonial.stay}
              </div>

              {/* User Info */}
              <div className="flex items-center">
                <div
                  className={`w-14 h-14 rounded-full ${testimonial.avatarColor}`}
                ></div>
                <div className="ml-4">
                  <div className="font-bold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Rating */}
        <div className="mt-20 bg-sky-600 rounded-3xl p-8 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="text-center lg:text-left">
              <div className="text-6xl font-bold">4.9</div>
              <div className="flex justify-center lg:justify-start mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-white" />
                ))}
              </div>
              <div className="mt-2">Overall Rating</div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold mb-6">
                Rated Excellent by Our Guests
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: "Cleanliness", score: "4.9" },
                  { label: "Service", score: "4.95" },
                  { label: "Location", score: "4.8" },
                ].map((item) => (
                  <div key={item.label} className="bg-white/10 p-4 rounded-xl">
                    <div className="text-3xl font-bold">{item.score}</div>
                    <div className="text-sm opacity-90">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
