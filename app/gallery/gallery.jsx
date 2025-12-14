"use client";

import { useState, useRef } from "react";
import Image from "next/image";
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

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [likedImages, setLikedImages] = useState([]);
  const modalRef = useRef(null);

  const categories = [
    { id: "all", label: "All Photos", count: 156 },
    { id: "rooms", label: "Rooms & Suites", count: 42 },
    { id: "dining", label: "Dining", count: 28 },
    { id: "spa", label: "Spa & Wellness", count: 19 },
    { id: "events", label: "Events", count: 24 },
    { id: "exterior", label: "Exterior", count: 15 },
    { id: "lifestyle", label: "Lifestyle", count: 28 },
  ];

  const galleryImages = Array.from({ length: 16 }, (_, i) => ({
    id: i + 1,
    category: ["rooms", "dining", "spa", "events", "exterior", "lifestyle"][i % 6],
    title: [
      "Presidential Suite",
      "Ocean View Restaurant",
      "Infinity Pool",
      "Wedding Ceremony",
      "Hotel Lobby",
      "Sunset Terrace",
    ][i % 6],
    description:
      "Experience luxury redefined in our award-winning spaces designed for unforgettable moments.",
    date: "2024-03-15",
    location: "Main Building",
    featured: i < 3,
  }));

  const filteredImages = galleryImages.filter((img) => {
    if (activeCategory !== "all" && img.category !== activeCategory) return false;
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

  const handleLike = (id, e) => {
    e.stopPropagation();
    setLikedImages((prev) =>
      prev.includes(id)
        ? prev.filter((imgId) => imgId !== id)
        : [...prev, id]
    );
  };

  const navigateImage = (direction) => {
    if (selectedImage === null) return;

    const currentIndex = filteredImages.findIndex(
      (img) => img.id === selectedImage
    );

    let newIndex;

    if (direction === "prev") {
      newIndex =
        currentIndex === 0
          ? filteredImages.length - 1
          : currentIndex - 1;
    } else {
      newIndex =
        currentIndex === filteredImages.length - 1
          ? 0
          : currentIndex + 1;
    }

    setSelectedImage(filteredImages[newIndex].id);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-900/90 via-purple-900/80 to-gray-900/90 z-10"></div>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[url('/images/gallery-pattern.svg')]"></div>
          </div>
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
              <Grid className="w-4 h-4 text-white mr-2" />
              <span className="text-sm font-semibold text-white">Visual Journey</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Experience Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-purple-300">World</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
              Step into the world of Royal Moss through our curated collection of photographs 
              showcasing luxury, elegance, and unforgettable moments.
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
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                >
                  <Grid className={`w-5 h-5 ${viewMode === "grid" ? "text-sky-600" : "text-gray-500"}`} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                >
                  <List className={`w-5 h-5 ${viewMode === "list" ? "text-sky-600" : "text-gray-500"}`} />
                </button>
              </div>

              {/* Filter Button */}
              <button className="flex items-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                <Filter className="w-5 h-5 mr-2" />
                Filter
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
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    activeCategory === category.id
                      ? "bg-sky-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.label}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeCategory === category.id
                      ? "bg-white/30"
                      : "bg-gray-300"
                  }`}>
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
          {/* Stats */}
          <div className="mb-8 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredImages.length}</span> of{" "}
              <span className="font-semibold">{galleryImages.length}</span> photos
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
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <div className={`absolute inset-0 ${
                      image.category === "rooms" ? "bg-gradient-to-br from-sky-400 to-blue-500" :
                      image.category === "dining" ? "bg-gradient-to-br from-amber-400 to-orange-500" :
                      image.category === "spa" ? "bg-gradient-to-br from-emerald-400 to-teal-500" :
                      image.category === "events" ? "bg-gradient-to-br from-purple-400 to-pink-500" :
                      "bg-gradient-to-br from-gray-400 to-gray-600"
                    }`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-3xl font-bold opacity-20">Royal Moss</div>
                          <div className="text-sm opacity-40">{image.title}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="text-white">
                          <h3 className="font-bold text-lg mb-1">{image.title}</h3>
                          <div className="flex items-center text-sm text-white/80">
                            <MapPin className="w-4 h-4 mr-1" />
                            {image.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => handleLike(image.id, e)}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                      >
                        <Heart className={`w-5 h-5 ${
                          likedImages.includes(image.id) ? "fill-rose-500 text-rose-500" : "text-white"
                        }`} />
                      </button>
                      <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                        <Share2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    
                    {/* Featured Badge */}
                    {image.featured && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        FEATURED
                      </div>
                    )}
                    
                    {/* Zoom Indicator */}
                    <div className="absolute bottom-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Caption */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 truncate">{image.title}</h3>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                        {image.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{image.description}</p>
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
                      <div className="aspect-[4/3] md:aspect-auto md:h-full">
                        <div className={`w-full h-full ${
                          image.category === "rooms" ? "bg-gradient-to-br from-sky-400 to-blue-500" :
                          image.category === "dining" ? "bg-gradient-to-br from-amber-400 to-orange-500" :
                          image.category === "spa" ? "bg-gradient-to-br from-emerald-400 to-teal-500" :
                          image.category === "events" ? "bg-gradient-to-br from-purple-400 to-pink-500" :
                          "bg-gradient-to-br from-gray-400 to-gray-600"
                        }`}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white text-center">
                              <div className="text-xl font-bold opacity-20">Royal Moss</div>
                              <div className="text-sm opacity-40">Gallery</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {image.featured && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          FEATURED
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{image.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {image.date}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {image.location}
                            </div>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                              {image.category}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => handleLike(image.id, e)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Heart className={`w-5 h-5 ${
                              likedImages.includes(image.id) ? "fill-rose-500 text-rose-500" : "text-gray-400"
                            }`} />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Share2 className="w-5 h-5 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{image.description}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <button className="text-sky-600 hover:text-sky-700 font-medium flex items-center">
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                        
                        <button className="flex items-center text-gray-600 hover:text-gray-900">
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
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No photos found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Try adjusting your search or filter to find what you&apos;re looking for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-6 px-6 py-3 bg-sky-600 text-white rounded-full font-semibold hover:bg-sky-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div 
            ref={modalRef}
            className="relative max-w-6xl w-full max-h-[90vh] overflow-hidden rounded-2xl bg-white"
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={() => navigateImage("prev")}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={() => navigateImage("next")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
            >
              <ArrowRight className="w-6 h-6 text-white" />
            </button>

            {/* Image Content */}
            <div className="flex flex-col lg:flex-row h-full">
              {/* Image */}
              <div className="lg:w-2/3 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-purple-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-5xl font-bold opacity-10">Royal Moss</div>
                      <div className="text-lg opacity-20 mt-2">Gallery Preview</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Panel */}
              <div className="lg:w-1/3 p-8 overflow-y-auto">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {filteredImages.find(img => img.id === selectedImage)?.title}
                    </h2>
                    <button
                      onClick={(e) => handleLike(selectedImage, e)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Heart className={`w-6 h-6 ${
                        likedImages.includes(selectedImage) ? "fill-rose-500 text-rose-500" : "text-gray-400"
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {filteredImages.find(img => img.id === selectedImage)?.date}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {filteredImages.find(img => img.id === selectedImage)?.location}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    {filteredImages.find(img => img.id === selectedImage)?.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <button className="w-full py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors flex items-center justify-center">
                    <Download className="w-5 h-5 mr-2" />
                    Download High-Res
                  </button>
                  
                  <button className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center">
                    <Share2 className="w-5 h-5 mr-2" />
                    Share Photo
                  </button>
                </div>

                {/* Metadata */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Photo Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category</span>
                      <span className="font-medium capitalize">
                        {filteredImages.find(img => img.id === selectedImage)?.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resolution</span>
                      <span className="font-medium">3840 × 2160</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Format</span>
                      <span className="font-medium">JPEG</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size</span>
                      <span className="font-medium">8.2 MB</span>
                    </div>
                  </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    © 2024 Royal Moss Hotel. All rights reserved. This image may not be used for commercial purposes without permission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sky-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Experience It Yourself?
          </h2>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            The photos are just a glimpse. Experience the real luxury of Royal Moss Hotel.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-sky-600 text-white rounded-full font-semibold text-lg hover:bg-sky-700 hover:scale-105 transition-all duration-300 shadow-lg">
              Book Your Visit
            </button>
            <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-semibold text-lg hover:border-sky-400 hover:text-sky-600 transition-all duration-300">
              Virtual Tour
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
