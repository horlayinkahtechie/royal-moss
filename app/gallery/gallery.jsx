"use client";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  Grid,
  List,
  X,
  ZoomIn,
  ArrowLeft,
  ArrowRight,
  Heart,
  Share2,
  Download,
  Clock,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import supabase from "../lib/supabase";
import Link from "next/link";

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [likedImages, setLikedImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef(null);

  // Fetch categories and images on initial load
  useEffect(() => {
    fetchGalleryData();
  }, []);

  // Fetch images whenever category changes
  useEffect(() => {
    if (activeCategory !== "all") {
      fetchGalleryImagesByCategory(activeCategory);
    } else {
      fetchAllGalleryImages();
    }
  }, [activeCategory]);

  const fetchGalleryData = async () => {
    await Promise.all([fetchCategories(), fetchAllGalleryImages()]);
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery")
        .select("category, id")
        .eq("status", "active");

      if (error) throw error;

      // Group by category and count
      const categoryCounts = data.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      // Format categories for display
      const formattedCategories = Object.entries(categoryCounts).map(
        ([category, count]) => ({
          id: category,
          label: category
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          count,
        })
      );

      // Add "All Photos" category
      const totalCount = Object.values(categoryCounts).reduce(
        (a, b) => a + b,
        0
      );
      const allCategories = [
        { id: "all", label: "All Photos", count: totalCount },
        ...formattedCategories,
      ];

      setCategories(allCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([
        { id: "all", label: "All Photos", count: 0 },
        { id: "rooms", label: "Rooms & Suites", count: 0 },
        { id: "dining", label: "Dining", count: 0 },
        { id: "spa", label: "Spa & Wellness", count: 0 },
        { id: "events", label: "Events", count: 0 },
        { id: "exterior", label: "Exterior", count: 0 },
        { id: "lifestyle", label: "Lifestyle", count: 0 },
      ]);
    }
  };

  const fetchAllGalleryImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setGalleryImages(data || []);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      setGalleryImages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryImagesByCategory = async (category) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("category", category)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setGalleryImages(data || []);
    } catch (error) {
      console.error("Error fetching gallery images by category:", error);
      setGalleryImages([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = galleryImages.filter((img) => {
    if (activeCategory !== "all" && img.category !== activeCategory)
      return false;
    if (
      searchQuery &&
      !img.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const handleImageClick = (id) => {
    setSelectedImage(id);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = "auto";
  };

  const handleLike = async (id, e) => {
    e.stopPropagation();

    // Update local state immediately for better UX
    setLikedImages((prev) =>
      prev.includes(id) ? prev.filter((imgId) => imgId !== id) : [...prev, id]
    );

    // You could also update a likes table in Supabase here
    // For example, if you have a 'likes' table:
    /*
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('likes')
          .upsert({
            user_id: user.id,
            gallery_id: id,
            liked: !likedImages.includes(id)
          });
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
    */
  };

  const navigateImage = (direction) => {
    if (selectedImage === null) return;

    const currentIndex = filteredImages.findIndex(
      (img) => img.id === selectedImage
    );

    let newIndex;

    if (direction === "prev") {
      newIndex =
        currentIndex === 0 ? filteredImages.length - 1 : currentIndex - 1;
    } else {
      newIndex =
        currentIndex === filteredImages.length - 1 ? 0 : currentIndex + 1;
    }

    setSelectedImage(filteredImages[newIndex].id);
  };

  // Helper function to get image URL (first image in array)
  const getImageUrl = (image) => {
    if (image.image_url && image.image_url.length > 0) {
      return image.image_url[0];
    }
    return null;
  };

  // Helper function to get all image URLs
  const getAllImageUrls = (image) => {
    return image.image_url || [];
  };

  // Helper function to get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case "rooms":
        return "from-sky-400 to-blue-500";
      case "dining":
        return "from-amber-400 to-orange-500";
      case "spa":
        return "from-emerald-400 to-teal-500";
      case "events":
        return "from-purple-400 to-pink-500";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-sky-900/90 via-purple-900/80 to-gray-900/90 z-10"></div>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[url('/images/gallery-pattern.svg')]"></div>
          </div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
              <Grid className="w-4 h-4 text-white mr-2" />
              <span className="text-sm font-semibold text-white">
                Visual Journey
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Experience Our{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-300 to-purple-300">
                World
              </span>
            </h1>

            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
              Step into the world of Royal Moss through our curated collection
              of photographs showcasing luxury, elegance, and unforgettable
              moments.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Controls */}
      <section className="sticky top-20 z-30 bg-white border-b border-gray-200 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photos by keyword..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 cursor-pointer transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-4">
              {/* View Mode */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <Grid
                    className={`w-5 h-5 ${
                      viewMode === "grid" ? "text-sky-600" : "text-gray-500"
                    }`}
                  />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <List
                    className={`w-5 h-5 ${
                      viewMode === "list" ? "text-sky-600" : "text-gray-500"
                    }`}
                  />
                </button>
              </div>

              {/* Filter Button */}
              <button
                className="flex items-center cursor-pointer px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
              >
                <Filter className="w-5 h-5 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-6 overflow-x-auto">
            <div className="flex space-x-4 pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full cursor-pointer whitespace-nowrap transition-all ${
                    activeCategory === category.id
                      ? "bg-sky-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.label}
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeCategory === category.id
                        ? "bg-white/30"
                        : "bg-gray-300"
                    }`}
                  >
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading gallery...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Stats */}
              <div className="mb-8 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold">{filteredImages.length}</span>{" "}
                  of{" "}
                  <span className="font-semibold">{galleryImages.length}</span>{" "}
                  photos
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 text-rose-500 mr-1" />
                    <span>{likedImages.length} liked</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-1" />
                    <span>Updated today</span>
                  </div>
                </div>
              </div>

              {/* Gallery Grid */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                      onClick={() => handleImageClick(image.id)}
                    >
                      {/* Image Container */}
                      <div className="aspect-4/3 relative overflow-hidden">
                        {getImageUrl(image) ? (
                          <Image
                            src={getImageUrl(image)}
                            alt={image.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className={`absolute inset-0 bg-linear-to-br ${getCategoryColor(
                              image.category
                            )}`}
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-white text-center">
                                <div className="text-3xl font-bold opacity-20">
                                  Royal Moss
                                </div>
                                <div className="text-sm opacity-40">
                                  {image.title}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="text-white">
                              <h3 className="font-bold text-lg mb-1">
                                {image.title}
                              </h3>
                              <div className="flex items-center text-sm text-white/80">
                                <MapPin className="w-4 h-4 mr-1" />
                                {image.location || "Royal Moss Hotel"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={(e) => handleLike(image.id, e)}
                            className="p-2 bg-white/20 backdrop-blur-sm cursor-pointer rounded-lg hover:bg-white/30 transition-colors"
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                likedImages.includes(image.id)
                                  ? "fill-rose-500 text-rose-500"
                                  : "text-white"
                              }`}
                            />
                          </button>
                          <button className="p-2 bg-white/20 cursor-pointer backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                            <Share2 className="w-5 h-5 text-white" />
                          </button>
                        </div>

                        {/* Zoom Indicator */}
                        <div className="absolute bottom-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ZoomIn className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      {/* Caption */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900 truncate">
                            {image.title}
                          </h3>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                            {image.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {image.caption ||
                            "Experience luxury at Royal Moss Hotel"}
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          {formatDate(image.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-6">
                  {filteredImages.map((image) => (
                    <div
                      key={image.id}
                      className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => handleImageClick(image.id)}
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-48 lg:w-64 relative">
                          <div className="aspect-4/3 md:aspect-auto md:h-full relative">
                            {getImageUrl(image) ? (
                              <Image
                                src={getImageUrl(image)}
                                alt={image.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 25vw"
                                className="object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div
                                className={`w-full h-full bg-linear-to-br ${getCategoryColor(
                                  image.category
                                )}`}
                              >
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-white text-center">
                                    <div className="text-xl font-bold opacity-20">
                                      Royal Moss
                                    </div>
                                    <div className="text-sm opacity-40">
                                      Gallery
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {image.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {formatDate(image.created_at)}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {image.location || "Royal Moss Hotel"}
                                </div>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                                  {image.category}
                                </span>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => handleLike(image.id, e)}
                                className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
                              >
                                <Heart
                                  className={`w-5 h-5 ${
                                    likedImages.includes(image.id)
                                      ? "fill-rose-500 text-rose-500"
                                      : "text-gray-400"
                                  }`}
                                />
                              </button>
                              <button className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors">
                                <Share2 className="w-5 h-5 text-gray-400" />
                              </button>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4">
                            {image.caption ||
                              "Experience luxury at Royal Moss Hotel"}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <button className="text-sky-600 cursor-pointer hover:text-sky-700 font-medium flex items-center">
                              View Details
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </button>

                            <button className="flex cursor-pointer items-center text-gray-600 hover:text-gray-900">
                              <Download className="w-4 h-4 mr-1" />
                              <span className="text-sm">Download</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {filteredImages.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No photos found
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Try adjusting your search or filter to find what you&apos;re
                    looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("all");
                    }}
                    className="mt-6 px-6 py-3 bg-sky-600 cursor-pointer text-white rounded-full font-semibold hover:bg-sky-700 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div
            ref={modalRef}
            className="relative max-w-6xl w-full max-h-[90vh] overflow-hidden rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 cursor-pointer p-2 bg-black backdrop-blur-sm rounded-lg text-white transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={() => navigateImage("prev")}
              className="absolute left-4 top-1/2 cursor-pointer transform -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={() => navigateImage("next")}
              className="absolute right-4 top-1/2 cursor-pointer transform -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
            >
              <ArrowRight className="w-6 h-6 text-white" />
            </button>

            {/* Image Content */}
            <div className="flex flex-col lg:flex-row h-full">
              {/* Image */}
              <div className="lg:w-2/3 relative min-h-100 lg:min-h-0">
                {(() => {
                  const selectedImg = filteredImages.find(
                    (img) => img.id === selectedImage
                  );
                  const imageUrl = getImageUrl(selectedImg);

                  return imageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={imageUrl}
                        alt={selectedImg?.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        className="object-contain bg-gray-900"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-sky-400 to-purple-500">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-5xl font-bold opacity-10">
                            Royal Moss
                          </div>
                          <div className="text-lg opacity-20 mt-2">
                            Gallery Preview
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Info Panel */}
              <div className="lg:w-1/3 p-6 lg:p-8 overflow-y-auto">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {
                        filteredImages.find((img) => img.id === selectedImage)
                          ?.title
                      }
                    </h2>
                    <button
                      onClick={(e) => handleLike(selectedImage, e)}
                      className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
                    >
                      <Heart
                        className={`w-6 h-6 ${
                          likedImages.includes(selectedImage)
                            ? "fill-rose-500 text-rose-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(
                        filteredImages.find((img) => img.id === selectedImage)
                          ?.created_at
                      )}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {filteredImages.find((img) => img.id === selectedImage)
                        ?.location || "Royal Moss Hotel"}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6">
                    {filteredImages.find((img) => img.id === selectedImage)
                      ?.caption || "Experience luxury at Royal Moss Hotel"}
                  </p>
                </div>

                {/* Metadata */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Photo Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category</span>
                      <span className="font-medium capitalize">
                        {
                          filteredImages.find((img) => img.id === selectedImage)
                            ?.category
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Images</span>
                      <span className="font-medium">
                        {getAllImageUrls(
                          filteredImages.find((img) => img.id === selectedImage)
                        ).length || 0}{" "}
                        photos
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className="font-medium capitalize">
                        {
                          filteredImages.find((img) => img.id === selectedImage)
                            ?.status
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created</span>
                      <span className="font-medium">
                        {formatDate(
                          filteredImages.find((img) => img.id === selectedImage)
                            ?.created_at
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    © {new Date().getFullYear()} Royal Moss Hotel. All rights
                    reserved. This image may not be used for commercial purposes
                    without permission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-sky-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Experience It Yourself?
          </h2>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            The photos are just a glimpse. Experience the real luxury of Royal
            Moss Hotel.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/rooms/all"
              className="px-8 py-4 cursor-pointer bg-sky-600 text-white rounded-full font-semibold text-lg hover:bg-sky-700 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Book Your Visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
