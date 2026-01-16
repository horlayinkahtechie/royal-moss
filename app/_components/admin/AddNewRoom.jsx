"use client";

import { useState, useEffect } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Users,
  Ruler,
  Star,
  Wifi,
  Tv,
  Wind,
  Coffee,
  Waves,
  Shield,
  Home,
  Eye,
  Save,
  Loader2,
  Check,
  Building,
  Tag,
  FileText,
  ChevronDown,
  DumbbellIcon,
  CarIcon,
  DogIcon,
  ClubIcon,
  BedIcon,
  Fan,
  RectangleVerticalIcon,
} from "lucide-react";
import supabase from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Sidebar from "./Sidebar";
import { DiDigitalOcean } from "react-icons/di";
import { GrLounge } from "react-icons/gr";
import { FaCity } from "react-icons/fa";
import { MdIron } from "react-icons/md";
import { FaNairaSign } from "react-icons/fa6";
import { BiFridge } from "react-icons/bi";

// Amenities options matching your database schema
const amenitiesOptions = [
  { id: "Wi-Fi", label: "Wi-Fi", icon: <Wifi className="w-5 h-5" /> },
  { id: "TV", label: "TV", icon: <Tv className="w-5 h-5" /> },
  { id: "AC", label: "AC", icon: <Wind className="w-5 h-5" /> },
  { id: "Mini Bar", label: "Mini Bar", icon: <Coffee className="w-5 h-5" /> },
  { id: "Balcony", label: "Balcony", icon: <Home className="w-5 h-5" /> },
  { id: "Jacuzzi", label: "Jacuzzi", icon: <Waves className="w-5 h-5" /> },
  { id: "Safe", label: "Safe", icon: <Shield className="w-5 h-5" /> },
  {
    id: "Wardrobe",
    label: "Wardrobe",
    icon: <RectangleVerticalIcon className="w-5 h-5" />,
  },
  { id: "Fridge", label: "Fridge", icon: <BiFridge className="w-5 h-5" /> },

  {
    id: "Ocean View",
    label: "Ocean View",
    icon: <DiDigitalOcean className="w-5 h-5" />,
  },
  {
    id: "Room Service",
    label: "Room Service",
    icon: <Coffee className="w-5 h-5" />,
  },
  { id: "Breakfast", label: "Breakfast", icon: <Coffee className="w-5 h-5" /> },
  {
    id: "Pool Access",
    label: "Pool Access",
    icon: <Waves className="w-5 h-5" />,
  },
  {
    id: "Gym Access",
    label: "Gym Access",
    icon: <DumbbellIcon className="w-5 h-5" />,
  },
  {
    id: "Spa Access",
    label: "Spa Access",
    icon: <Waves className="w-5 h-5" />,
  },
  { id: "Parking", label: "Parking", icon: <CarIcon className="w-5 h-5" /> },
  {
    id: "Pet Friendly",
    label: "Pet Friendly",
    icon: <DogIcon className="w-5 h-5" />,
  },
  {
    id: "Club Access",
    label: "Club Access",
    icon: <ClubIcon className="w-5 h-5" />,
  },
  {
    id: "King Size Bed",
    label: "King Size Bed",
    icon: <BedIcon className="w-5 h-5" />,
  },
  {
    id: "Executive Lounge",
    label: "Executive Lounge",
    icon: <GrLounge className="w-5 h-5" />,
  },
  {
    id: "City View",
    label: "City View",
    icon: <FaCity className="w-5 h-5" />,
  },
  {
    id: "Pressing Iron",
    label: "Pressing Iron",
    icon: <MdIron className="w-5 h-5" />,
  },
  {
    id: "Standing Fan",
    label: "Standing Fan",
    icon: <Fan className="w-5 h-5" />,
  },
];

// Room categories
const roomCategories = [
  "Standard Room",
  "Deluxe Room",
  "Executive Suite",
  "Presidential Suite",
  "Family Room",
  "Honeymoon Suite",
  "Business Room",
  "Accessible Room",
];

// Format number with commas
const formatNumberWithCommas = (value) => {
  if (!value) return "";
  // Remove all non-digit characters except decimal point
  const numericValue = value.toString().replace(/[^\d.]/g, "");

  // Split into integer and decimal parts
  const parts = numericValue.split(".");
  let integerPart = parts[0];
  const decimalPart = parts[1] ? `.${parts[1]}` : "";

  // Format integer part with commas
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return integerPart + decimalPart;
};

// Parse formatted number back to number
const parseFormattedNumber = (formattedValue) => {
  if (!formattedValue) return "";
  // Remove commas and keep only numbers and decimal point
  return formattedValue.toString().replace(/,/g, "");
};

export default function AddRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nextRoomNumber, setNextRoomNumber] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for mobile sidebar

  // Form state
  const [formData, setFormData] = useState({
    room_number: "",
    room_category: "Standard Room",
    room_title: "",
    price_per_night: "",
    discounted_price_per_night: "",
    no_of_guest: 2,
    user_ratings: 0,
    room_description: "",
    room_availability: true,
    amenities: [],
  });

  // Display values for formatted numbers
  const [displayPrice, setDisplayPrice] = useState("");
  const [displayDiscountedPrice, setDisplayDiscountedPrice] = useState("");

  // Images state
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Fetch next available room number
  useEffect(() => {
    const checkAdminRole = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/unauthorized");
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_role")
        .eq("id", user.id)
        .single();

      if (userError || userData?.user_role !== "admin") {
        router.replace("/unauthorized");
        return;
      }

      setLoading(false);
      fetchNextRoomNumber();
    };

    checkAdminRole();
  }, [router]);

  const fetchNextRoomNumber = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("room_number")
        .order("room_number", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const lastRoomNumber = data[0].room_number;
        const lastNumber = parseInt(lastRoomNumber.replace("ROOM", "")) || 0;
        const nextNumber = lastNumber + 1;
        setNextRoomNumber(`ROOM${nextNumber}`);
        setFormData((prev) => ({ ...prev, room_number: `ROOM${nextNumber}` }));
      } else {
        setNextRoomNumber("ROOM1");
        setFormData((prev) => ({ ...prev, room_number: "ROOM1" }));
      }
    } catch (error) {
      console.error("Error fetching room number:", error);
      setNextRoomNumber("ROOM1");
      setFormData((prev) => ({ ...prev, room_number: "ROOM1" }));
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "price_per_night") {
      // Format the display value with commas
      const formattedValue = formatNumberWithCommas(value);
      setDisplayPrice(formattedValue);

      // Store the actual numeric value (without commas)
      const numericValue = parseFormattedNumber(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else if (name === "discounted_price_per_night") {
      // Format the display value with commas
      const formattedValue = formatNumberWithCommas(value);
      setDisplayDiscountedPrice(formattedValue);

      // Store the actual numeric value (without commas)
      const numericValue = parseFormattedNumber(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
            ? parseFloat(value) || 0
            : value,
      }));
    }
  };

  // Handle amenities toggle
  const handleAmenityToggle = (amenityId) => {
    setFormData((prev) => {
      const currentAmenities = prev.amenities || [];
      const updatedAmenities = currentAmenities.includes(amenityId)
        ? currentAmenities.filter((id) => id !== amenityId)
        : [...currentAmenities, amenityId];

      return { ...prev, amenities: updatedAmenities };
    });
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    // Check total images (max 5)
    if (images.length + files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const isValidType = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max

      if (!isValidType)
        alert(`${file.name} is not a valid image type (JPEG, PNG, WebP only)`);
      if (!isValidSize) alert(`${file.name} is too large (max 5MB)`);

      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    setUploadingImages(true);

    try {
      // Create previews
      const newPreviews = await Promise.all(
        validFiles.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) =>
              resolve({
                file,
                preview: e.target.result,
                name: file.name,
              });
            reader.readAsDataURL(file);
          });
        })
      );

      setImagePreviews((prev) => [...prev, ...newPreviews]);
      setImages((prev) => [...prev, ...validFiles]);
    } catch (error) {
      console.error("Error creating image previews:", error);
      alert("Failed to process images");
    } finally {
      setUploadingImages(false);
    }
  };

  // Remove image
  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload images to Supabase Storage
  const uploadImagesToStorage = async () => {
    if (images.length === 0) return [];

    const uploadedUrls = [];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}-${file.name}`;

      try {
        const { error } = await supabase.storage
          .from("room-images")
          .upload(fileName, file);

        if (error) throw error;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("room-images").getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error(`Failed to upload image ${file.name}`);
      }
    }

    return uploadedUrls;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.room_number) {
      alert("Room number is required");
      return;
    }

    if (images.length === 0) {
      alert("Please upload at least one room image");
      return;
    }

    if (!formData.room_category) {
      alert("Room category is required");
      return;
    }

    if (
      !formData.price_per_night ||
      parseFloat(formData.price_per_night) <= 0
    ) {
      alert("Please enter a valid price per night");
      return;
    }

    if (!formData.no_of_guest || formData.no_of_guest < 1) {
      alert("Please enter a valid number of guests");
      return;
    }

    setLoading(true);

    try {
      // Upload images if any
      let imageUrls = [];
      if (images.length > 0) {
        imageUrls = await uploadImagesToStorage();
      }

      // Prepare room data
      const roomData = {
        room_number: formData.room_number,
        room_category: formData.room_category,
        room_title: formData.room_title,
        price_per_night: parseFloat(formData.price_per_night),
        discounted_price_per_night: formData.discounted_price_per_night
          ? parseFloat(formData.discounted_price_per_night)
          : null,
        no_of_guest: parseInt(formData.no_of_guest),
        user_ratings: 4.3, // Start with 0 ratings
        room_image: imageUrls, // Array of image URLs
        room_description: formData.room_description || null,
        room_availability: formData.room_availability,
        amenities: formData.amenities, // Array of amenities
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert into database
      const { error } = await supabase
        .from("rooms")
        .insert([roomData])
        .select();

      if (error) throw error;

      alert("Room added successfully!");

      // Reset form
      setFormData({
        room_number: nextRoomNumber,
        room_category: "Standard Room",
        room_title: "",
        price_per_night: "",
        discounted_price_per_night: "",
        no_of_guest: 2,
        user_ratings: 0,
        room_description: "",
        room_availability: true,
        amenities: [],
      });
      setDisplayPrice("");
      setDisplayDiscountedPrice("");
      setImages([]);
      setImagePreviews([]);

      // Fetch next room number
      await fetchNextRoomNumber();
    } catch (error) {
      console.error("Error adding room:", error);
      alert(`Failed to add room: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate discount percentage
  const calculateDiscount = () => {
    if (!formData.discounted_price_per_night || !formData.price_per_night)
      return 0;
    const regularPrice = parseFloat(formData.price_per_night);
    const discountedPrice = parseFloat(formData.discounted_price_per_night);
    if (regularPrice <= 0) return 0;
    return Math.round(((regularPrice - discountedPrice) / regularPrice) * 100);
  };

  // Format price for display in summary
  const formatPriceForDisplay = (price) => {
    if (!price) return "0.00";
    const numericPrice = parseFloat(price);
    return numericPrice.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-900 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden mb-4 p-2 cursor-pointer rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Add New Room
                </h1>
                <p className="text-gray-400">
                  Add a new room to your hotel inventory
                </p>
              </div>
              <button
                onClick={() => router.push("/admin/rooms")}
                className="px-4 py-2 border cursor-pointer border-gray-600 hover:bg-gray-700/50 rounded-xl transition-colors flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Room Images */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Room Images
                </h2>

                {/* Image Upload Area */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Upload Room Images (Max 5)
                  </label>

                  <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center hover:border-sky-500/50 transition-colors">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-900/50 rounded-xl flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 mb-2">
                      Drag & drop images or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      JPEG, PNG, WebP • Max 5MB each • Up to 5 images
                    </p>
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      required
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImages || images.length >= 5}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
                        uploadingImages || images.length >= 5
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-sky-600 hover:bg-sky-700 text-white"
                      }`}
                    >
                      {uploadingImages ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Select Images ({images.length}/5)
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-3">
                      Selected Images
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-xl overflow-hidden bg-gray-900/50">
                            <Image
                              width={100}
                              height={100}
                              src={preview.preview}
                              alt={`Room image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 cursor-pointer -right-2 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 right-2 bg-black/70 rounded-lg px-2 py-1 text-xs">
                            {preview.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Room Summary */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mt-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Room Preview
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Room Number:</span>
                    <span className="font-bold text-white">
                      {formData.room_number}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span className="font-medium text-white">
                      {formData.room_category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Nightly Rate:</span>
                    <span className="font-bold text-emerald-400">
                      ₦{formatPriceForDisplay(formData.price_per_night)}
                    </span>
                  </div>
                  {formData.discounted_price_per_night && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Discounted Rate:</span>
                      <span className="font-bold text-amber-400">
                        ₦
                        {formatPriceForDisplay(
                          formData.discounted_price_per_night
                        )}
                        <span className="ml-2 text-sm text-emerald-400">
                          ({calculateDiscount()}% off)
                        </span>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Capacity:</span>
                    <span className="font-medium text-white">
                      {formData.no_of_guest} guests
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Availability:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        formData.room_availability
                          ? "bg-emerald-900/30 text-emerald-300"
                          : "bg-red-900/30 text-red-300"
                      }`}
                    >
                      {formData.room_availability
                        ? "Available"
                        : "Not Available"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Room Details Form */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Room Details
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Room Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Room Number *
                      </label>
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="room_number"
                          value={formData.room_number}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                          placeholder="e.g., ROOM101"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Auto-suggested: {nextRoomNumber}
                      </p>
                    </div>

                    {/* Room Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Room Category *
                      </label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          name="room_category"
                          value={formData.room_category}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white appearance-none"
                          required
                        >
                          {roomCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Room Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Room Title
                      </label>
                      <input
                        type="text"
                        name="room_title"
                        value={formData.room_title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                        placeholder="e.g., Deluxe Ocean View Suite"
                      />
                    </div>

                    {/* Price per Night */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Price per Night *
                      </label>
                      <div className="relative">
                        <FaNairaSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="price_per_night"
                          value={displayPrice}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Enter amount in Naira (₦)
                      </p>
                    </div>

                    {/* Discounted Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Discounted Price (Optional)
                      </label>
                      <div className="relative">
                        <FaNairaSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="discounted_price_per_night"
                          value={displayDiscountedPrice}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                          placeholder="0.00"
                        />
                      </div>
                      {formData.discounted_price_per_night &&
                        formData.price_per_night && (
                          <p className="text-xs text-emerald-400 mt-2">
                            {calculateDiscount()}% discount applied
                          </p>
                        )}
                    </div>

                    {/* Number of Guests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Maximum Guests *
                      </label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          name="no_of_guest"
                          value={formData.no_of_guest}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                          min="1"
                          max="10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Room Description */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Room Description
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <textarea
                        name="room_description"
                        value={formData.room_description}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white resize-none"
                        placeholder="Describe the room features, view, amenities, and any special characteristics..."
                      />
                    </div>
                  </div>

                  {/* Amenities Selection */}
                  <div className="mt-8">
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      Select Amenities
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {amenitiesOptions.map((amenity) => (
                        <button
                          key={amenity.id}
                          type="button"
                          onClick={() => handleAmenityToggle(amenity.id)}
                          className={`flex flex-col cursor-pointer items-center justify-center p-4 rounded-xl border transition-all ${
                            formData.amenities.includes(amenity.id)
                              ? "bg-sky-900/30 border-sky-600 text-sky-400"
                              : "bg-gray-900/30 border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800/50"
                          }`}
                        >
                          <div className="mb-2">
                            {formData.amenities.includes(amenity.id) ? (
                              <div className="w-6 h-6 rounded-full bg-sky-600 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            ) : (
                              <div className="text-gray-500">
                                {amenity.icon}
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-center">
                            {amenity.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      {formData.amenities.length} amenities selected
                    </p>
                  </div>

                  {/* Room Availability */}
                  <div className="mt-8">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="room_availability"
                          checked={formData.room_availability}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-all ${
                            formData.room_availability
                              ? "bg-emerald-500"
                              : "bg-gray-700"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                              formData.room_availability ? "right-1" : "left-1"
                            }`}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          Room Available for Booking
                        </div>
                        <div className="text-sm text-gray-400">
                          Make this room immediately available for bookings
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-4 mt-8 pt-8 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={() => router.push("/admin/rooms")}
                      className="px-6 py-3 border cursor-pointer border-gray-600 hover:bg-gray-700/50 text-white rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || uploadingImages}
                      className="px-6 py-3 bg-linear-to-r cursor-pointer from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Adding Room...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Add Room
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Selected Amenities Preview */}
              {formData.amenities.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mt-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Selected Amenities Preview
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {formData.amenities.map((amenityId) => {
                      const amenity = amenitiesOptions.find(
                        (a) => a.id === amenityId
                      );
                      return amenity ? (
                        <div
                          key={amenityId}
                          className="flex items-center gap-2 px-4 py-2 bg-sky-900/20 border border-sky-700/30 rounded-lg"
                        >
                          <span className="text-sky-400">{amenity.icon}</span>
                          <span className="text-sm font-medium text-white">
                            {amenity.label}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
