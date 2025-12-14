import { Calendar, Users, MapPin } from "lucide-react";

const RoomAvailability = () => {
  return (
    <section id="check-availability" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect <span className="text-sky-600">Stay</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Check availability for our luxurious rooms and suites
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 max-w-6xl mx-auto border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Check-in */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-medium">
                <Calendar className="w-4 h-4 mr-2 text-sky-600" />
                Check-in
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Check-out */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-medium">
                <Calendar className="w-4 h-4 mr-2 text-sky-600" />
                Check-out
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-medium">
                <Users className="w-4 h-4 mr-2 text-sky-600" />
                Guests
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option>1 Guest</option>
                <option>2 Guests</option>
                <option>3 Guests</option>
                <option>4+ Guests</option>
              </select>
            </div>

            {/* Room Type */}
            <div className="space-y-2">
              <label className="flex items-center text-gray-700 font-medium">
                <MapPin className="w-4 h-4 mr-2 text-sky-600" />
                Room Type
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option>All Rooms</option>
                <option>Deluxe Room</option>
                <option>Executive Suite</option>
                <option>Presidential Suite</option>
                <option>Family Apartment</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="text-center mt-8">
            <button className="px-12 cursor-pointer py-4 bg-purple-600 text-white rounded-full font-semibold text-lg hover:bg-purple-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              Check Availability
              <span className="ml-2">→</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default RoomAvailability;
