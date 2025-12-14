// app/contact/page.tsx
"use client";

import { useState } from "react";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle,
  Building,
  Globe,
  MessageSquare,
  Shield,
  Users,
  ArrowRight
} from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    preferredContact: "email",
    newsletter: true,
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+1 (555) 123-4567", "+1 (555) 987-6543 (24/7 Emergency)"],
      description: "Call us anytime, our concierge is available 24/7",
      color: "text-sky-600",
      bgColor: "bg-sky-50"
    },
    {
      icon: Mail,
      title: "Email",
      details: ["reservations@royalmoss.com", "info@royalmoss.com"],
      description: "We respond within 2 hours during business hours",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["123 Luxury Avenue", "Miami Beach, FL 33139"],
      description: "Open daily from 6:00 AM to 11:00 PM",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
  ];

  const departments = [
    {
      name: "Reservations",
      email: "reservations@royalmoss.com",
      phone: "+1 (555) 123-4000",
      hours: "24/7",
      description: "For booking inquiries and modifications"
    },
    {
      name: "Concierge",
      email: "concierge@royalmoss.com",
      phone: "+1 (555) 123-4001",
      hours: "6:00 AM - 11:00 PM",
      description: "Personal assistance and special requests"
    },
    {
      name: "Events & Weddings",
      email: "events@royalmoss.com",
      phone: "+1 (555) 123-4002",
      hours: "9:00 AM - 6:00 PM",
      description: "Corporate events and wedding planning"
    },
    {
      name: "Group Bookings",
      email: "groups@royalmoss.com",
      phone: "+1 (555) 123-4003",
      hours: "8:00 AM - 8:00 PM",
      description: "Special rates for group accommodations"
    },
  ];

  const faqs = [
    {
      question: "What are your check-in and check-out times?",
      answer: "Check-in is at 3:00 PM and check-out is at 11:00 AM. Early check-in and late check-out may be available upon request and subject to availability."
    },
    {
      question: "Do you offer airport transportation?",
      answer: "Yes, we provide complimentary airport transfers for suite guests. For other guests, we offer luxury car service at competitive rates. Please arrange at least 24 hours in advance."
    },
    {
      question: "Are pets allowed at the hotel?",
      answer: "We welcome pets up to 25 lbs with prior arrangement. A pet fee of $150 per stay applies. We provide pet beds, bowls, and treats. Some restrictions may apply."
    },
    {
      question: "What is your cancellation policy?",
      answer: "Standard reservations can be cancelled up to 48 hours before arrival without penalty. Special packages and group bookings may have different policies."
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        preferredContact: "email",
        newsletter: true,
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-900/90 via-purple-900/80 to-gray-900/90 z-10"></div>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[url('/images/contact-pattern.svg')]"></div>
          </div>
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
              <MessageSquare className="w-4 h-4 text-white mr-2" />
              <span className="text-sm font-semibold text-white">Get in Touch</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              We&apos;re Here to <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-purple-300">Help</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
              Our dedicated team is available around the clock to ensure your Royal Moss experience is flawless from start to finish.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Multiple Ways to <span className="text-sky-600">Connect</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the method that works best for you. We&apos;re always ready to assist.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 ${method.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <method.icon className={`w-8 h-8 ${method.color}`} />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{method.title}</h3>
                
                <div className="space-y-3 mb-4">
                  {method.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-700 font-medium">{detail}</p>
                  ))}
                </div>
                
                <p className="text-gray-600 text-sm">{method.description}</p>
                
                {method.title === "Phone" && (
                  <button className="mt-6 w-full py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors">
                    Call Now
                  </button>
                )}
                
                {method.title === "Email" && (
                  <button className="mt-6 w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                    Send Email
                  </button>
                )}
                
                {method.title === "Visit Us" && (
                  <button className="mt-6 w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
                    Get Directions
                  </button>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              {!isSubmitted ? (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Send Us a Message</h2>
                    <p className="text-gray-600">
                      Fill out the form below and our team will get back to you as soon as possible.
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Full Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Subject *</label>
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                          required
                        >
                          <option value="">Select a subject</option>
                          <option value="reservation">Reservation Inquiry</option>
                          <option value="general">General Question</option>
                          <option value="feedback">Feedback</option>
                          <option value="group">Group Booking</option>
                          <option value="event">Event Planning</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Message *</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none min-h-[150px] resize-none"
                        placeholder="How can we help you?"
                        required
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Preferred Contact Method
                        </label>
                        <div className="flex space-x-4">
                          {["email", "phone"].map((method) => (
                            <label
                              key={method}
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="contactMethod"
                                value={method}
                                checked={formData.preferredContact === method}
                                onChange={(e) => setFormData({...formData, preferredContact: e.target.value})}
                                className="w-4 h-4 text-sky-600"
                              />
                              <span className="text-gray-700 capitalize">{method}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.newsletter}
                          onChange={(e) => setFormData({...formData, newsletter: e.target.checked})}
                          className="w-4 h-4 text-sky-600 mt-1"
                        />
                        <span className="text-gray-600 text-sm">
                          Subscribe to our newsletter for exclusive offers and updates
                        </span>
                      </label>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-sky-600 text-white rounded-xl font-semibold text-lg hover:bg-sky-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      By submitting this form, you agree to our Privacy Policy. We&apos;ll never share your information.
                    </p>
                  </form>
                </>
              ) : (
                /* Success State */
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                  
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Message Sent Successfully!
                  </h3>
                  
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Thank you for reaching out. Our team will respond to your inquiry within 2 hours during business hours.
                  </p>
                  
                  <div className="space-y-4 max-w-sm mx-auto">
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="w-full py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors"
                    >
                      Send Another Message
                    </button>
                    
                    <button className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors">
                      Return to Homepage
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Map & Additional Info */}
            <div className="space-y-8">
              {/* Map Placeholder */}
              <div className="bg-gradient-to-br from-sky-600 to-purple-600 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-8 text-white">
                  <div className="flex items-center space-x-3 mb-6">
                    <MapPin className="w-6 h-6" />
                    <h3 className="text-2xl font-bold">Our Location</h3>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div>
                      <p className="font-medium">Royal Moss Hotel</p>
                      <p className="text-white/80">123 Luxury Avenue</p>
                      <p className="text-white/80">Miami Beach, FL 33139</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Clock className="w-5 h-5 text-white/80" />
                      <span>Open 24/7</span>
                    </div>
                  </div>
                  
                  {/* Map Visualization */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold opacity-20 mb-2">Royal Moss</div>
                      <div className="text-white/30">Interactive Map</div>
                      <div className="mt-4">
                        <button className="px-6 py-2 bg-white text-sky-600 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                          View on Google Maps
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Departments */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Specific Departments</h3>
                
                <div className="space-y-4">
                  {departments.map((dept, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{dept.name}</h4>
                          <p className="text-sm text-gray-600">{dept.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {dept.email}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {dept.phone}
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Available: {dept.hours}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked <span className="text-sky-600">Questions</span>
            </h2>
            <p className="text-xl text-gray-600">
              Find quick answers to common questions about Royal Moss Hotel
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="group bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-sky-600 group-hover:rotate-90 transition-all" />
                </div>
                
                <div className="mt-3">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <p className="text-gray-600">
              Still have questions?{" "}
              <a href="#" className="text-sky-600 font-semibold hover:text-sky-700">
                View our complete FAQ section
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sky-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
            <Shield className="w-4 h-4 text-white mr-2" />
            <span className="text-sm font-semibold text-white">24/7 Support</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Need Immediate Assistance?
          </h2>
          
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
            Our dedicated support team is available around the clock to ensure your Royal Moss experience is flawless.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-white">24/7 Concierge</div>
                <div className="text-white/80">Always here to help</div>
              </div>
            </div>
            
            <button className="px-8 py-4 bg-white text-sky-600 rounded-full font-semibold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-2xl">
              Call Now: (555) 123-4567
            </button>
          </div>
          
          <div className="mt-10 pt-8 border-t border-white/20">
            <p className="text-white/70 text-sm">
              For emergency situations, please dial our emergency line:{" "}
              <span className="font-bold text-white">(555) 911-HELP</span>
            </p>
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="w-6 h-6 text-sky-600" />
                <h3 className="text-xl font-bold text-gray-900">Front Desk Hours</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { day: "Monday - Friday", time: "6:00 AM - 11:00 PM" },
                  { day: "Saturday - Sunday", time: "6:00 AM - 12:00 AM" },
                  { day: "24/7 Concierge", time: "Always Available" },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                    <span className="text-gray-700">{item.day}</span>
                    <span className="font-semibold text-gray-900">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Building className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Restaurant Hours</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { meal: "Breakfast", time: "6:30 AM - 11:00 AM" },
                  { meal: "Lunch", time: "12:00 PM - 3:00 PM" },
                  { meal: "Dinner", time: "6:00 PM - 11:00 PM" },
                  { meal: "24/7 Room Service", time: "Always Available" },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                    <span className="text-gray-700">{item.meal}</span>
                    <span className="font-semibold text-gray-900">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-gray-900">Spa & Wellness</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { service: "Spa Treatments", time: "9:00 AM - 9:00 PM" },
                  { service: "Fitness Center", time: "5:00 AM - 11:00 PM" },
                  { service: "Pool", time: "7:00 AM - 10:00 PM" },
                  { service: "Wellness Classes", time: "Schedule Varies" },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                    <span className="text-gray-700">{item.service}</span>
                    <span className="font-semibold text-gray-900">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;