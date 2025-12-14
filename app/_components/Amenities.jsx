import {
  Wifi,
  Utensils,
  Dumbbell,
  // Spa,
  Car,
  ConciergeBell,
  Wind,
  Tv,
} from "lucide-react";

const Amenities = () => {
  const amenities = [
    {
      icon: Wifi,
      title: "High-Speed WiFi",
      description: "Complimentary high-speed internet throughout",
    },
    {
      icon: Utensils,
      title: "Fine Dining",
      description: "5-star restaurants & 24/7 room service",
    },
    {
      icon: Dumbbell,
      title: "Fitness Center",
      description: "State-of-the-art gym with personal trainers",
    },
    {
      icon: Tv,
      title: "Luxury Spa",
      description: "Award-winning spa & wellness center",
    },
    {
      icon: Car,
      title: "Valet Parking",
      description: "Complimentary valet service",
    },
    {
      icon: ConciergeBell,
      title: "24/7 Concierge",
      description: "Personalized service anytime",
    },
    {
      icon: Wind,
      title: "Climate Control",
      description: "Individual room temperature control",
    },
    {
      icon: Tv,
      title: "Entertainment",
      description: "Smart TV with streaming services",
    },
  ];

  return (
    <section id="amenities" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Premium <span className="text-sky-600">Amenities</span> & Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience world-class facilities designed for your comfort and
            convenience
          </p>
        </div>

        {/* Amenities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {amenities.map((amenity) => (
            <div
              key={amenity.title}
              className="group bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-50 transition-all">
                <amenity.icon className="w-8 h-8 text-sky-600" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {amenity.title}
              </h3>
              <p className="text-gray-600">{amenity.description}</p>

              {/* Hover Effect Line */}
              <div className="mt-4 h-1 w-0 group-hover:w-full bg-purple-500 transition-all duration-500 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Amenities;
