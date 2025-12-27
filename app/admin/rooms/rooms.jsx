"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Bed,
  Hotel,
  Users,
  Star,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  Edit,
  Plus,
  Trash2,
  Download,
  RefreshCw,
  Grid,
  List,
  Wifi,
  Tv,
  Wind,
  Coffee,
  Waves,
  Shield,
  Lock,
  Calendar,
  Home,
  Building,
  MapPin,
  Settings,
  Zap,
  Loader2,
  Image as ImageIcon,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/app/_components/admin/Sidebar";
import supabase from "../../lib/supabase";
import { FaNairaSign } from "react-icons/fa6";

const amenitiesList = [
  { id: "wifi", label: "Wi-Fi", icon: <Wifi className="w-4 h-4" /> },
  { id: "tv", label: "TV", icon: <Tv className="w-4 h-4" /> },
  { id: "ac", label: "AC", icon: <Wind className="w-4 h-4" /> },
  { id: "minibar", label: "Minibar", icon: <Coffee className="w-4 h-4" /> },
  { id: "balcony", label: "Balcony", icon: <Home className="w-4 h-4" /> },
  { id: "jacuzzi", label: "Jacuzzi", icon: <Waves className="w-4 h-4" /> },
  { id: "safe", label: "Safe", icon: <Shield className="w-4 h-4" /> },
  { id: "ocean-view", label: "Ocean View", icon: <Eye className="w-4 h-4" /> },
];

export default function RoomsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    avgRate: 0,
    featuredRooms: 0,
    underMaintenance: 0,
    totalCapacity: 0,
    avgOccupancy: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("room_number");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  // Fetch room categories, statuses, dynamically
  const [categoryOptions, setCategoryOptions] = useState(["all"]);
  const [statusOptions, setStatusOptions] = useState(["all"]);

  // Price formatting function
  const formatPrice = (price) => {
    if (!price) return "₦0";

    if (price >= 1000000) {
      const formatted = (price / 1000000).toFixed(1);
      return formatted.endsWith(".0")
        ? `₦${formatted.slice(0, -2)}M`
        : `₦${formatted}M`;
    }

    if (price >= 1000) {
      const formatted = (price / 1000).toFixed(1);
      return formatted.endsWith(".0")
        ? `₦${formatted.slice(0, -2)}k`
        : `₦${formatted}k`;
    }

    return `₦${price.toLocaleString()}`;
  };

  // Fetch all rooms data
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch rooms from Supabase
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number");
      // .eq("room_availability", true);

      if (roomsError) throw roomsError;

      // Fetch current bookings to determine room availability
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("room_number, booking_status, check_out_date")
        .or("booking_status.eq.confirmed,booking_status.eq.checked-in")
        .gte("check_out_date", new Date().toISOString().split("T")[0]);

      if (bookingsError) throw bookingsError;

      // Process rooms data with availability status
      const processedRooms =
        roomsData?.map((room) => {
          return {
            ...room,

            featured: Math.random() > 0.7, // Random featured status
            lastCleaned: new Date(
              Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0],
            // Ensure room_image is always an array
            room_image: Array.isArray(room.room_image)
              ? room.room_image
              : room.room_image
              ? [room.room_image]
              : [],
          };
        }) || [];

      setRooms(processedRooms);
      setFilteredRooms(processedRooms);

      // Extract unique values for filters
      const categories = [
        ...new Set(processedRooms.map((room) => room.room_category)),
      ].filter(Boolean);
      const statuses = [
        ...new Set(processedRooms.map((room) => room.status)),
      ].filter(Boolean);

      setCategoryOptions(["all", ...categories]);
      setStatusOptions(["all", ...statuses]);

      // Calculate statistics
      calculateStatistics(processedRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Calculate statistics
  const calculateStatistics = (roomsData) => {
    const totalRooms = roomsData.length;
    const availableRooms = roomsData.filter(
      (room) => room.room_availability === true
    ).length;

    const featuredRooms = roomsData.filter((room) => room.featured).length;
    const underMaintenance = roomsData.filter(
      (room) => room.status === "maintenance"
    ).length;

    const totalCapacity = roomsData.reduce(
      (sum, room) => sum + (room.no_of_guest || 0),
      0
    );
    const avgRate =
      roomsData.length > 0
        ? roomsData.reduce(
            (sum, room) => sum + (room.price_per_night || 0),
            0
          ) / roomsData.length
        : 0;

    // Calculate average occupancy (simplified)
    const totalOccupancy = roomsData.reduce(
      (sum, room) => sum + (room.occupancy || 0),
      0
    );
    const avgOccupancy =
      roomsData.length > 0 ? Math.round(totalOccupancy / roomsData.length) : 0;

    setStats({
      totalRooms,
      availableRooms,
      avgRate,
      featuredRooms,
      underMaintenance,
      totalCapacity,
      avgOccupancy,
    });
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Filter and search rooms
  useEffect(() => {
    let filtered = [...rooms];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (room) =>
          room.room_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.room_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.room_category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (room) => room.room_category === selectedCategory
      );
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((room) => room.status === selectedStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "room_number") {
        return sortOrder === "asc"
          ? a.room_number?.localeCompare(b.room_number || "")
          : b.room_number?.localeCompare(a.room_number || "");
      }
      if (sortBy === "price_per_night") {
        return sortOrder === "asc"
          ? (a.price_per_night || 0) - (b.price_per_night || 0)
          : (b.price_per_night || 0) - (a.price_per_night || 0);
      }
      if (sortBy === "no_of_guest") {
        return sortOrder === "asc"
          ? (a.no_of_guest || 0) - (b.no_of_guest || 0)
          : (b.no_of_guest || 0) - (a.no_of_guest || 0);
      }
      return 0;
    });

    setFilteredRooms(filtered);
  }, [searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder, rooms]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setShowEditModal(true);
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;

    try {
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", roomToDelete.id);

      if (error) throw error;

      alert("Room deleted successfully!");
      setShowDeleteModal(false);
      setRoomToDelete(null);
      fetchRooms(); // Refresh data
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Failed to delete room: " + error.message);
    }
  };

  const handleViewImages = (images) => {
    setSelectedImages(images);
    setShowImageModal(true);
  };

  const CategoryBadge = ({ category }) => {
    const colors = {
      "Standard Room": "bg-gray-800/50 text-gray-300 border-gray-700",
      "Deluxe Room": "bg-sky-900/30 text-sky-300 border-sky-700",
      "Executive Suite": "bg-purple-900/30 text-purple-300 border-purple-700",
      "Presidential Suite": "bg-amber-900/30 text-amber-300 border-amber-700",
      "Family Room": "bg-emerald-900/30 text-emerald-300 border-emerald-700",
      "Honeymoon Suite": "bg-pink-900/30 text-pink-300 border-pink-700",
      "Business Room": "bg-blue-900/30 text-blue-300 border-blue-700",
      "Accessible Room": "bg-green-900/30 text-green-300 border-green-700",
    };

    return (
      <div
        className={`${
          colors[category] || colors["Standard Room"]
        } px-3 py-1 rounded-lg border text-sm font-medium`}
      >
        {category}
      </div>
    );
  };

  // Room Card Component (Grid View)
  const RoomCard = ({ room }) => {
    const price = room.discounted_price_per_night || room.price_per_night;
    const mainImage = room.room_image?.[0] || null;

    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-sky-500/50 transition-all duration-300 overflow-hidden group">
        {/* Room Image Header */}
        <div className="relative h-48 bg-gradient-to-br from-sky-900/50 to-purple-900/50 overflow-hidden">
          {mainImage ? (
            <div
              className="w-full h-full cursor-pointer"
              onClick={() => handleViewImages(room.room_image)}
            >
              <Image
                width={100}
                height={100}
                src={mainImage}
                alt={room.room_title || `Room ${room.room_number}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-gray-700" />
            </div>
          )}

          {/* Featured Badge */}
          {room.featured && (
            <div className="absolute top-4 left-4">
              <div className="px-3 py-1 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm font-semibold rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" />
                Featured
              </div>
            </div>
          )}

          {/* Room Number */}
          <div className="absolute bottom-4 left-4">
            <div className="text-4xl font-bold text-white drop-shadow-lg">
              #{room.room_number}
            </div>
          </div>

          {/* Image Count */}
          {room.room_image?.length > 1 && (
            <div
              className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm cursor-pointer hover:bg-black/80 transition-colors"
              onClick={() => handleViewImages(room.room_image)}
            >
              +{room.room_image.length - 1} more
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {room.room_title || `${room.room_number}`}
              </h3>
              <CategoryBadge category={room.room_category || "Standard Room"} />
            </div>
            <button className="p-2 cursor-pointer hover:bg-gray-700/50 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <p className="text-gray-400 text-sm mb-6 line-clamp-2">
            {room.room_description ||
              "A comfortable room with modern amenities."}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-1">
              <div className="text-sm text-gray-400">Capacity</div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span className="font-medium text-white">
                  {room.no_of_guest || 2} guests
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-400">Nightly Rate</div>
              <div className="flex items-center gap-2">
                <FaNairaSign className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-lg text-white">
                  {formatPrice(price)}
                </span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-2">Amenities</div>
              <div className="flex flex-wrap gap-2">
                {room.amenities.slice(0, 3).map((amenity, index) => {
                  const amenityInfo = amenitiesList.find(
                    (a) => a.id === amenity
                  );
                  return amenityInfo ? (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-900/50 rounded-lg border border-gray-700"
                      title={amenityInfo.label}
                    >
                      <span className="text-sky-400">{amenityInfo.icon}</span>
                      <span className="text-xs text-gray-300">
                        {amenityInfo.label}
                      </span>
                    </div>
                  ) : null;
                })}
                {room.amenities.length > 3 && (
                  <div className="px-3 py-1.5 bg-gray-900/50 rounded-lg border border-gray-700">
                    <span className="text-xs text-gray-300">
                      +{room.amenities.length - 3} more
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleEditRoom(room)}
              className="flex-1 py-2.5 bg-sky-600 cursor-pointer hover:bg-sky-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Room
            </button>
            <button
              onClick={() => handleViewImages(room.room_image)}
              className="p-2.5 border border-gray-600 cursor-pointer hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => {
                setRoomToDelete(room);
                setShowDeleteModal(true);
              }}
              className="p-2.5 border border-red-600 cursor-pointer hover:bg-red-700/50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Room List Item Component (List View)
  const RoomListItem = ({ room }) => {
    const price = room.discounted_price_per_night || room.price_per_night;
    const mainImage = room.room_image?.[0] || null;

    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-sky-500/50 transition-all duration-300 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-sky-900/50 to-purple-900/50 flex items-center justify-center cursor-pointer"
                onClick={() => handleViewImages(room.room_image)}
              >
                {mainImage ? (
                  <Image
                    width={100}
                    height={100}
                    src={mainImage}
                    alt={room.room_title || `Room ${room.room_number}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML =
                        '<Bed className="w-8 h-8 text-gray-600" />';
                    }}
                  />
                ) : (
                  <Bed className="w-8 h-8 text-gray-600" />
                )}
              </div>
              {room.room_image?.length > 1 && (
                <div
                  className="absolute -top-1 -right-1 w-6 h-6 bg-black/70 rounded-full text-xs text-white flex items-center justify-center cursor-pointer"
                  onClick={() => handleViewImages(room.room_image)}
                >
                  +{room.room_image.length - 1}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-white">
                  #{room.room_number} •{" "}
                  {room.room_title || `Room ${room.room_number}`}
                </h3>
                <CategoryBadge
                  category={room.room_category || "Standard Room"}
                />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {room.no_of_guest || 2} guests
                </div>
                <div className="flex items-center gap-1">
                  <FaNairaSign className="w-4 h-4" />
                  {formatPrice(price)}/night
                </div>
                {room.featured && (
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4" />
                    Featured
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleEditRoom(room)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 cursor-pointer text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => handleViewImages(room.room_image)}
              className="p-2 border border-gray-600 cursor-pointer hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => {
                setRoomToDelete(room);
                setShowDeleteModal(true);
              }}
              className="p-2 border border-red-600 cursor-pointer hover:bg-red-700/50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Image Modal Component
  const ImageModal = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!showImageModal || selectedImages.length === 0) return null;

    const currentImage = selectedImages[currentIndex];

    const goToPrevious = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? selectedImages.length - 1 : prevIndex - 1
      );
    };

    const goToNext = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === selectedImages.length - 1 ? 0 : prevIndex + 1
      );
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-6xl max-h-[90vh]">
          {/* Close Button */}
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 cursor-pointer z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation Buttons */}
          {selectedImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 cursor-pointer transform -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white rotate-180" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 cursor-pointer transform -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Main Image */}
          <div className="w-full h-[70vh] flex items-center justify-center">
            <Image
              width={100}
              height={100}
              src={currentImage}
              alt={`Room image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFmMjkzNyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyN2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSA8dHNwYW4gZHk9IjE0Ij5Ob3QgQXZhaWxhYmxlPC90c3Bhbj48L3RleHQ+PC9zdmc+";
              }}
            />
          </div>

          {/* Thumbnails */}
          {selectedImages.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2 overflow-x-auto py-2">
              {selectedImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 cursor-pointer rounded-lg overflow-hidden border-2 ${
                    currentIndex === index
                      ? "border-sky-500"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    width={100}
                    height={100}
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMWYyOTM3Ii8+PHRleHQgeD0iMzIiIHk9IjMyIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNiIgZmlsbD0iIzZiNzI3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vPC90c3Bhbj48L3RleHQ+PC9zdmc+";
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
            {currentIndex + 1} / {selectedImages.length}
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => {
    if (!roomToDelete) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
              <h2 className="text-xl font-bold text-white">Delete Room</h2>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete room{" "}
              <span className="font-semibold text-white">
                #{roomToDelete.room_number}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setRoomToDelete(null);
                }}
                className="px-4 py-2 border cursor-pointer border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoom}
                className="px-4 py-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete Room
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading rooms data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white">
      {/* Modals */}
      <ImageModal />
      <DeleteConfirmationModal />

      {/* Edit Room Modal will be added separately */}

      {/* Top Navigation */}
      <div className="sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-800/50 cursor-pointer rounded-xl transition-colors lg:hidden"
              >
                <svg
                  className="w-5 h-5"
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
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="w-full pb-7">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Rooms Management
                </h1>
                <p className="text-sm text-gray-400">
                  Manage hotel rooms, availability, and pricing
                </p>
              </div>
              <div className="flex lg:justify-end items-center gap-4">
                <Link
                  href="/admin/add-new-room"
                  className="flex items-center gap-2 px-5 py-3 cursor-pointer bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Add New Room
                </Link>

                {/* Check Availability Button */}
                <Link
                  href="/admin/room-availability"
                  className="flex items-center gap-2 px-5 py-3 cursor-pointer bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  <Calendar className="w-5 h-5" />
                  Check Availability
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: "Total Rooms",
                value: stats.totalRooms.toString(),
                change: "+2",
                icon: <Hotel className="w-6 h-6" />,
                color: "text-sky-400",
              },
              {
                label: "Available",
                value: stats.availableRooms.toString(),
                change: "+4",
                icon: <CheckCircle className="w-6 h-6" />,
                color: "text-emerald-400",
              },

              {
                label: "Avg. Rate",
                value: formatPrice(stats.avgRate),
                change: "+8%",
                icon: <FaNairaSign className="w-6 h-6" />,
                color: "text-purple-400",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gray-900/30">
                    <div className={stat.color}>{stat.icon}</div>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      stat.change.startsWith("+")
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Filters & Search */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by room number, title, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white placeholder-gray-500"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-lg cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-sky-900/30 text-sky-400"
                      : "text-gray-400 hover:bg-gray-700/50"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-lg cursor-pointer ${
                    viewMode === "list"
                      ? "bg-sky-900/30 text-sky-400"
                      : "text-gray-400 hover:bg-gray-700/50"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Room Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                  >
                    {categoryOptions.map((category) => (
                      <option
                        key={category}
                        value={category}
                        className="bg-gray-900 text-white"
                      >
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sort & Actions */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">
                    {filteredRooms.length} rooms found
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Sort by:</span>
                    <button
                      onClick={() => handleSort("room_number")}
                      className={`px-3 py-1.5 rounded-lg cursor-pointer text-sm ${
                        sortBy === "room_number"
                          ? "bg-sky-900/30 text-sky-400"
                          : "text-gray-400 hover:bg-gray-700/50"
                      }`}
                    >
                      Room Number{" "}
                      {sortBy === "room_number" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </button>
                    <button
                      onClick={() => handleSort("price_per_night")}
                      className={`px-3 py-1.5 rounded-lg cursor-pointer text-sm ${
                        sortBy === "price_per_night"
                          ? "bg-sky-900/30 text-sky-400"
                          : "text-gray-400 hover:bg-gray-700/50"
                      }`}
                    >
                      Price{" "}
                      {sortBy === "price_per_night" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </button>
                    <button
                      onClick={() => handleSort("no_of_guest")}
                      className={`px-3 py-1.5 rounded-lg cursor-pointer text-sm ${
                        sortBy === "no_of_guest"
                          ? "bg-sky-900/30 text-sky-400"
                          : "text-gray-400 hover:bg-gray-700/50"
                      }`}
                    >
                      Capacity{" "}
                      {sortBy === "no_of_guest" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchRooms}
                    className="flex items-center cursor-pointer gap-2 px-4 py-2.5 border border-gray-600 hover:bg-gray-700/50 rounded-xl transition-colors text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Data
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedStatus("all");
                    }}
                    className="flex items-center cursor-pointer gap-2 px-4 py-2.5 border border-gray-600 hover:bg-gray-700/50 rounded-xl transition-colors text-white"
                  >
                    <Filter className="w-4 h-4" />
                    Clear Filters
                  </button>
                  <button className="flex items-center cursor-pointer gap-2 px-4 py-2.5 border border-gray-600 hover:bg-gray-700/50 rounded-xl transition-colors text-white">
                    <Download className="w-4 h-4" />
                    Export List
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Rooms List/Grid */}
          <div>
            {viewMode === "list" ? (
              <div className="space-y-4">
                {filteredRooms.map((room) => (
                  <RoomListItem key={room.id} room={room} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>

          {/* Empty State */}
          {filteredRooms.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-2xl flex items-center justify-center">
                <Bed className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No rooms found
              </h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your filters or add a new room
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/admin/add-new-room"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl font-medium transition-colors"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Add New Room
                </Link>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedStatus("all");
                  }}
                  className="px-6 py-3 border cursor-pointer border-gray-600 hover:bg-gray-700/50 text-white rounded-xl font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Room Modal */}
      {showEditModal && selectedRoom && (
        <EditRoomModal
          room={selectedRoom}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedRoom) => {
            // Update room in state
            const updatedRooms = rooms.map((r) =>
              r.id === updatedRoom.id ? updatedRoom : r
            );
            setRooms(updatedRooms);
            setShowEditModal(false);
            fetchRooms(); // Refresh to get updated data
          }}
          categories={categoryOptions.filter((c) => c !== "all")}
          amenitiesList={amenitiesList}
        />
      )}
    </div>
  );
}

// Edit Room Modal Component
function EditRoomModal({ room, onClose, onSave, categories, amenitiesList }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    room_number: room.room_number || "",
    room_title: room.room_title || "",
    room_category: room.room_category || categories[0] || "Standard Room",
    price_per_night: room.price_per_night || 0,
    discounted_price_per_night: room.discounted_price_per_night || "",
    no_of_guest: room.no_of_guest || 2,
    room_dimension: room.room_dimension || "",
    room_description: room.room_description || "",
    amenities: room.amenities || [],
    room_availability: room.room_availability !== false,
    room_image: Array.isArray(room.room_image)
      ? room.room_image
      : room.room_image
      ? [room.room_image]
      : [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("rooms")
        .update(updateData)
        .eq("id", room.id)
        .select();

      if (error) throw error;

      alert("Room updated successfully!");
      onSave(data[0]);
    } catch (error) {
      console.error("Error updating room:", error);
      alert("Failed to update room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageRemove = (index) => {
    const updatedImages = [...formData.room_image];
    updatedImages.splice(index, 1);
    setFormData({ ...formData, room_image: updatedImages });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    // For now, we'll just store the file objects
    // In a real app, you'd upload these to Supabase Storage
    const newImages = files.map((file) => URL.createObjectURL(file));
    setFormData({
      ...formData,
      room_image: [...formData.room_image, ...newImages],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Edit Room #{room.room_number}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 cursor-pointer rounded-lg"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    value={formData.room_number}
                    onChange={(e) =>
                      setFormData({ ...formData, room_number: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Room Title *
                  </label>
                  <input
                    type="text"
                    value={formData.room_title}
                    onChange={(e) =>
                      setFormData({ ...formData, room_title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.room_category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        room_category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price per Night *
                  </label>
                  <div className="relative">
                    <FaNairaSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.price_per_night}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price_per_night: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                      required
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Discounted Price
                  </label>
                  <div className="relative">
                    <FaNairaSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.discounted_price_per_night}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discounted_price_per_night:
                            parseFloat(e.target.value) || "",
                        })
                      }
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    value={formData.no_of_guest}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        no_of_guest: parseInt(e.target.value) || 2,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Room Dimension
                  </label>
                  <input
                    type="text"
                    value={formData.room_dimension}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        room_dimension: e.target.value,
                      })
                    }
                    placeholder="e.g., 30 m²"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.room_description}
                onChange={(e) =>
                  setFormData({ ...formData, room_description: e.target.value })
                }
                rows="3"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white resize-none"
              />
            </div>

            {/* Room Images */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Room Images
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.room_image.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-900/50">
                      <Image
                        width={100}
                        height={100}
                        src={img}
                        alt={`Room image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute -top-2 -right-2 cursor-pointer w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-700 hover:border-sky-500/50 flex items-center justify-center cursor-pointer transition-colors">
                  <div className="text-center">
                    <Plus className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <span className="text-sm text-gray-400">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* Amenities Selection */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {amenitiesList.map((amenity) => (
                  <label
                    key={amenity.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.amenities?.includes(amenity.id)
                        ? "bg-sky-900/30 border-sky-600 text-sky-400"
                        : "bg-gray-900/30 border-gray-700 text-gray-400 hover:bg-gray-800/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities?.includes(amenity.id)}
                      onChange={(e) => {
                        const updatedAmenities = e.target.checked
                          ? [...(formData.amenities || []), amenity.id]
                          : (formData.amenities || []).filter(
                              (a) => a !== amenity.id
                            );
                        setFormData({
                          ...formData,
                          amenities: updatedAmenities,
                        });
                      }}
                      className="hidden"
                    />
                    {amenity.icon}
                    <span className="font-medium">{amenity.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Room Availability */}
            <div className="mt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.room_availability}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        room_availability: e.target.checked,
                      })
                    }
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
                  <div className="font-medium text-white">Room Available</div>
                  <div className="text-sm text-gray-400">
                    Make this room available for booking
                  </div>
                </div>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-4 mt-8 pt-8 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border cursor-pointer border-gray-600 hover:bg-gray-700/50 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r cursor-pointer from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
