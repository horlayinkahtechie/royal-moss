import { Star, Users, Maximize2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Import your images (update these paths to your actual images)
import DeluxeRoomImage from "@/public/images/deluxe-room.jpg";
import ExecutiveSuiteImage from "@/public/images/executive-room.jpg";
import PresidentialApartmentImage from "@/public/images/presidential-room.jpg";
import FamilySuiteImage from "@/public/images/family-room.jpg";

const Rooms = () => {
  const rooms = [
    {
      id: "deluxe-ocean-view",
      title: "Deluxe Ocean View",
      description: "Stunning ocean views with luxury amenities",
      price: 299,
      rating: 4.9,
      guests: 2,
      size: "45 m²",
      image: DeluxeRoomImage,
      features: ["Free WiFi", "Breakfast Included", "Sea View", "King Bed"],
    },
    {
      id: "executive-suite",
      title: "Executive Suite",
      description: "Spacious suite with separate living area",
      price: 459,
      rating: 4.95,
      guests: 3,
      size: "75 m²",
      image: ExecutiveSuiteImage,
      features: ["Executive Lounge", "Butler Service", "Jacuzzi", "City View"],
    },
    {
      id: "presidential-apartment",
      title: "Presidential Apartment",
      description: "Ultimate luxury with private terrace",
      price: 899,
      rating: 5.0,
      guests: 4,
      size: "120 m²",
      image: PresidentialApartmentImage,
      features: [
        "Private Pool",
        "Gourmet Kitchen",
        "Cinema Room",
        "24/7 Butler",
      ],
    },
    {
      id: "family-luxury-suite",
      title: "Family Luxury Suite",
      description: "Perfect for family stays with connected rooms",
      price: 649,
      rating: 4.8,
      guests: 5,
      size: "90 m²",
      image: FamilySuiteImage,
      features: [
        "Kids Club Access",
        "Connected Rooms",
        "Game Console",
        "Family Amenities",
      ],
    },
  ];

  return (
    <section className="py-30 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-sky-600">Featured</span> Accommodations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience unparalleled comfort in our carefully curated rooms and
            suites
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {rooms.map((room, index) => (
            <div
              key={room.id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Room Image Container */}
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-sky-400 to-purple-500 opacity-10"></div>

                {room.image ? (
                  <Image
                    src={room.image}
                    alt={room.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-sky-400 to-purple-500 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-3xl font-bold opacity-20">
                        Royal Moss
                      </div>
                      <div className="text-sm opacity-40">{room.title}</div>
                    </div>
                  </div>
                )}

                {/* Popular Badge */}
                {index === 0 && (
                  <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                    MOST POPULAR
                  </div>
                )}

                {/* Price Tag */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl z-10">
                  <div className="text-2xl font-bold text-gray-900">
                    ${room.price}
                  </div>
                  <div className="text-xs text-gray-600">per night</div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>

              {/* Room Details */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {room.title}
                  </h3>
                  <div className="flex items-center bg-amber-500 text-white px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    <span className="font-bold">{room.rating}</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{room.description}</p>

                {/* Room Features */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1 text-sky-600" />
                    <span>{room.guests} Guests</span>
                  </div>
                  <div className="flex items-center">
                    <Maximize2 className="w-4 h-4 mr-1 text-purple-600" />
                    <span>{room.size}</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {room.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Action Button - Routes to room-specific availability */}
                <Link
                  href={`/rooms/availability?type=${room.id}`}
                  className="block"
                >
                  <button className="w-full cursor-pointer py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300 group">
                    <span className="flex items-center justify-center">
                      Check Availability
                      <span className="ml-2 transform group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

       
      </div>
    </section>
  );
};

export default Rooms;
