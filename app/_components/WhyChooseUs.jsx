import { Award, Shield, Heart, Clock } from "lucide-react";
import Image from "next/image";
import WhyChooseUsImage from "@/public/images/why-choose-us-image.jpg";

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: Award,
      title: "Award-Winning Service",
      description: "Consistently rated among the top hotels",
      stats: "",
      color: "text-purple-600",
    },
    {
      icon: Shield,
      title: "Premium Security",
      description: "State-of-the-art security and privacy measures",
      stats: "24/7 Security",
      color: "text-sky-600",
    },
    {
      icon: Heart,
      title: "Personalized Care",
      description: "Tailored experiences for every guest",
      stats: "98% Satisfaction",
      color: "text-purple-600",
    },
    {
      icon: Clock,
      title: "Immediate Response",
      description: "Quick resolution for all your requests",
      stats: "<5 min Response",
      color: "text-sky-600",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Image Container */}
          <div className="relative rounded-3xl h-125 lg:h-150 w-full overflow-hidden shadow-xl">
            <Image
              src={WhyChooseUsImage}
              alt="Why choose Royal Moss Hotel"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {/* Optional: Overlay for better text contrast if needed */}
            <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent"></div>
          </div>

          {/* Right Column - Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why <span className="text-sky-600">Choose</span> Royal Moss?
            </h2>

            <p className="text-xl text-gray-600 mb-10">
              We combine luxury with personalized service to create
              unforgettable experiences for every guest.
            </p>

            {/* Reasons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {reasons.map((reason) => (
                <div
                  key={reason.title}
                  className="group p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-purple-300 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center group-hover:bg-purple-50 transition-all">
                      <reason.icon className={`w-6 h-6 ${reason.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">
                        {reason.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {reason.description}
                      </p>
                      <div className={`text-sm font-bold ${reason.color}`}>
                        {reason.stats}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
