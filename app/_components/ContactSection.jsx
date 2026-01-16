"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Users,
  Loader2,
} from "lucide-react";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    type: "",
    message: "",
    submissionId: null,
  });
  const [formErrors, setFormErrors] = useState({});

  // Auto-detect phone country code
  useEffect(() => {
    if (formData.phone && !formData.phone.startsWith("+")) {
      const userLang = navigator.language || "en-US";
      const countryCode = userLang.includes("NG") ? "+234" : "+1";

      if (
        !formData.phone.startsWith(countryCode) &&
        formData.phone.length > 3
      ) {
        setFormData((prev) => ({
          ...prev,
          phone: countryCode + " " + prev.phone.replace(/^\+?\d*\s*/, ""),
        }));
      }
    }
  }, [formData.phone]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) errors.name = "Name is required";
    else if (formData.name.length < 2) errors.name = "Name is too short";
    else if (formData.name.length > 100) errors.name = "Name is too long";

    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      errors.email = "Invalid email format";
    else if (formData.email.length > 100) errors.email = "Email is too long";

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      errors.phone = "Invalid phone number";
    }

    if (!formData.subject) errors.subject = "Please select a subject";
    else if (formData.subject.length > 200)
      errors.subject = "Subject is too long";

    if (!formData.message.trim()) errors.message = "Message is required";
    else if (formData.message.length < 10)
      errors.message = "Message is too short";
    else if (formData.message.length > 5000)
      errors.message = "Message is too long";

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitStatus({
        type: "error",
        message: "Please fix the errors in the form",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "", submissionId: null });
    setFormErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit form");
      }

      // Success
      setSubmitStatus({
        type: "success",
        message:
          "Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.",
        submissionId: result.data?.id,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      // Auto-clear success message after 10 seconds
      setTimeout(() => {
        setSubmitStatus((prev) =>
          prev.type === "success" ? { type: "", message: "" } : prev
        );
      }, 10000);
    } catch (error) {
      console.error("Form submission error:", error);

      let errorMessage = error.message;

      if (error.message.includes("Too many requests")) {
        errorMessage =
          "You've sent too many requests. Please wait 15 minutes before trying again.";
      } else if (error.message.includes("network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      setSubmitStatus({
        type: "error",
        message: errorMessage,
      });

      // Auto-clear error message after 8 seconds
      setTimeout(() => {
        setSubmitStatus((prev) =>
          prev.type === "error" ? { type: "", message: "" } : prev
        );
      }, 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      details: ["KLM 21, Iworo-Aradagun Road, Badagry (Moghoto)"],
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      details: ["+234 8089 553 225", "+234 7076 012 107"],
      color: "from-sky-500 to-sky-600",
      bgColor: "bg-sky-50",
      iconColor: "text-sky-600",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      details: ["reservations@royalmoss.com", "royalmossng@gmail.com"],
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Opening Hours",
      details: ["24/7 Reception"],
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <section
      id="contact"
      className="py-20 bg-linear-to-b from-white to-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-sky-50 text-sky-700 rounded-full text-sm font-semibold mb-4">
            <MessageSquare className="w-4 h-4 mr-2" />
            GET IN TOUCH
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact <span className="text-sky-600">Us</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We&apos;re here to help you plan your perfect stay. Reach out to us
            anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Contact Information */}
          <div>
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-sky-600" />
                Our Commitment
              </h3>
              <p className="text-gray-600 mb-6">
                At Royal Moss, we believe exceptional service begins with
                attentive listening. Our dedicated team is committed to
                providing personalized assistance for all your needs.
              </p>
              {submitStatus.submissionId && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Reference ID:</strong> {submitStatus.submissionId}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Keep this ID for future reference
                  </p>
                </div>
              )}
            </div>

            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`${info.bgColor} p-3 rounded-xl`}>
                      <div className={`${info.iconColor}`}>{info.icon}</div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">
                        {info.title}
                      </h4>
                      <div className="space-y-1">
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-sm text-gray-600">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map Preview */}
            <div className="mt-10 bg-linear-to-r from-sky-500 to-purple-600 rounded-2xl p-6 text-white overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">Our Location</h3>
                  <p className="text-sky-100 text-sm">
                    Iworo-Aradagun Road, Badagry (Moghoto)
                  </p>
                </div>
                <a
                  href="https://maps.app.goo.gl/dPpvRsENSnqr28vB6?g_st=iw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                >
                  <MapPin className="w-6 h-6" />
                </a>
              </div>
              <div className="relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.777583674273!2d2.7168338!3d6.4260881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bfb6a3cb5ea81%3A0xc212a4f436a6cbe5!2sIworo%20-%20Aradagun%20Road%2C%20Badagry!5e0!3m2!1sen!2sng!4v1698151234567!5m2!1sen!2sng"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg shadow-lg"
                  title="Royal Moss Hotel Location"
                ></iframe>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <a
                    href="https://maps.app.goo.gl/dPpvRsENSnqr28vB6?g_st=iw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-sky-700 hover:bg-sky-50 px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 shadow-lg transition-all duration-300 hover:shadow-xl"
                  >
                    <MapPin className="w-4 h-4" />
                    Open in Google Maps
                  </a>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-sky-100">
                <p>📍 Located in the scenic Badagry area</p>
                <p className="text-xs opacity-80 mt-1">
                  Easy access from Lagos mainland
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-200">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Send us a Message
              </h3>
              <p className="text-gray-600">
                Fill out the form below and we&apos;ll get back to you as soon
                as possible.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 pl-11 border ${
                        formErrors.name ? "border-red-300" : "border-gray-300"
                      } rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all`}
                      placeholder="John Smith"
                    />
                    <div className="absolute left-3 top-3.5 text-gray-400">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 pl-11 border ${
                        formErrors.email ? "border-red-300" : "border-gray-300"
                      } rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all`}
                      placeholder="john@example.com"
                    />
                    <div className="absolute left-3 top-3.5 text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pl-11 border ${
                        formErrors.phone ? "border-red-300" : "border-gray-300"
                      } rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all`}
                      placeholder="+234 123 456 7890"
                    />
                    <div className="absolute left-3 top-3.5 text-gray-400">
                      <Phone className="w-5 h-5" />
                    </div>
                  </div>
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border ${
                      formErrors.subject ? "border-red-300" : "border-gray-300"
                    } rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all`}
                  >
                    <option value="">Select a topic</option>
                    <option value="reservation">Room Reservation</option>
                    <option value="information">General Information</option>
                    <option value="event">Event Hall & Planning</option>
                    <option value="gym">Gym Enquiry</option>
                    <option value="laundry">Laundry & Dry Cleaning</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                  {formErrors.subject && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.subject}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message *
                </label>
                <div className="relative">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    className={`w-full px-4 py-3 pl-11 border ${
                      formErrors.message ? "border-red-300" : "border-gray-300"
                    } rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all resize-none`}
                    placeholder="Tell us how we can help you..."
                  />
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Please include any specific dates, room preferences, or
                    special requirements.
                  </p>
                  <span
                    className={`text-xs ${
                      formData.message.length > 5000
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.message.length}/5000
                  </span>
                </div>
                {formErrors.message && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.message}
                  </p>
                )}
              </div>

              {/* Submit Status */}
              {submitStatus.message && (
                <div
                  className={`p-4 rounded-xl ${
                    submitStatus.type === "success"
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-rose-50 border border-rose-200"
                  } animate-in fade-in duration-300`}
                >
                  <div className="flex items-start">
                    {submitStatus.type === "success" ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 mr-3 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p
                        className={
                          submitStatus.type === "success"
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }
                      >
                        {submitStatus.message}
                      </p>
                      {submitStatus.type === "error" && (
                        <button
                          type="button"
                          onClick={() =>
                            setSubmitStatus({ type: "", message: "" })
                          }
                          className="mt-2 text-sm text-rose-600 hover:text-rose-800 font-medium"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Honeypot field for spam protection */}
              <div className="hidden">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex="-1"
                  autoComplete="off"
                />
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">
                    Fields marked with * are required
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-linear-to-r cursor-pointer from-purple-600 to-sky-600 text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center group"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Links */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">
                Quick Contact Options
              </h4>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:+234712345678"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </a>
                <a
                  href="mailto:reservations@royalmoss.com"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Directly
                </a>
                <a
                  href="https://wa.me/234712345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </a>
                <a
                  href="/book"
                  className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm"
                >
                  Book Now
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="mt-20 bg-linear-to-r from-sky-50 to-purple-50 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Quick answers to common questions about reservations, amenities,
              and policies.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                question: "How do I make a reservation on the website?",
                answer:
                  "Select your check-in and check-out dates, choose a room, enter your details, and confirm your booking online.",
              },
              {
                question: "Is the room availability avaialable in real-time?",
                answer:
                  "Yes. Availability updates instantly to prevent double booking.",
              },
              {
                question: "Can I book room for multiple guests?",
                answer:
                  "Yes. You can select the number of guests during booking, and the system will show suitable available rooms.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h4>
                <p className="text-sm text-gray-600">{faq.answer}</p>
                <button className="mt-4 text-sky-600 text-sm font-medium hover:text-sky-700 transition-colors">
                  Learn more →
                </button>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="/faq"
              className="inline-flex items-center text-sky-600 hover:text-sky-700 font-semibold"
            >
              View all FAQ
              <span className="ml-2">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
