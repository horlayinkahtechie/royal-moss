const CallToAction = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-sky-600"></div>

          {/* Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center py-16 px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready for an Unforgettable Stay?
            </h2>

            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Book your luxury experience today and enjoy exclusive benefits
              with our best rate guarantee.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="px-10 py-4 bg-white text-sky-600 rounded-full font-bold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-2xl">
                Book Your Stay Now
                <span className="ml-2">→</span>
              </button>

              <button className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300">
                Call Us: (555) 123-4567
              </button>
            </div>

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { text: "Best Price Guarantee" },
                { text: "Free Cancellation" },
                { text: "No Booking Fees" },
              ].map((feature) => (
                <div
                  key={feature.text}
                  className="flex items-center justify-center text-white/90"
                >
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  {feature.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
