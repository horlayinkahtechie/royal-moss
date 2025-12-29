"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Grid,
  List,
  Image as ImageIcon,
  Plus,
  X,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  ChevronDown,
  CheckCircle,
  XCircle,
  MoreVertical,
  Calendar,
  Tag,
  Check,
} from "lucide-react";
import supabase from "../../lib/supabase";
import { format } from "date-fns";
import Sidebar from "@/app/_components/admin/Sidebar";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Gallery categories
const categories = [
  "interior",
  "pool",
  "restaurant",
  "exterior",
  "bathrooms",
  "restaurant and bar",
  "gym",
  "event center",
  "dining",
];

// Status options
const statusOptions = ["all", "active", "inactive"];

export default function GalleryPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [galleries, setGalleries] = useState([]);
  const [filteredGalleries, setFilteredGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [newGallery, setNewGallery] = useState({
    title: "",
    caption: "",
    category: "interior",
    status: "active",
    image_url: [""],
  });
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [editGallery, setEditGallery] = useState(null);
  const [galleryToDelete, setGalleryToDelete] = useState(null);

  // File upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);

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

      // ❌ Not admin → unauthorized
      if (userError || userData?.user_role !== "admin") {
        router.replace("/unauthorized");
        return;
      }

      setLoading(false);
      fetchGalleries();
    };

    checkAdminRole();
  }, [router]);

  // Fetch galleries from Supabase
  const fetchGalleries = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("gallery")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      // Apply filters
      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
      }

      // Apply search
      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,caption.ilike.%${searchQuery}%`
        );
      }

      // Get total count for pagination
      const { count } = await query;
      setTotalItems(count || 0);

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      // Process image_urls to ensure it's always an array
      const processedGalleries = data.map((gallery) => ({
        ...gallery,
        image_url: Array.isArray(gallery.image_url)
          ? gallery.image_url
          : gallery.image_url
          ? [gallery.image_url]
          : [],
      }));

      setGalleries(processedGalleries);
      setFilteredGalleries(processedGalleries);
    } catch (error) {
      console.error("Error fetching galleries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, [currentPage, selectedCategory, selectedStatus, searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedStatus, searchQuery]);

  // Handle file uploads
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return [];

    setUploading(true);
    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from("gallery-images") // Make sure this bucket exists
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("gallery-images").getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    setUploading(false);
    setUploadProgress(0);
    return uploadedUrls;
  };

  // Add new gallery
  const handleAddGallery = async () => {
    try {
      if (!newGallery.title.trim() || newGallery.image_url.length === 0) {
        alert("Title and at least one image are required");
        return;
      }

      // Filter out empty image URLs
      const filteredImageUrls = newGallery.image_url.filter(
        (url) => url.trim() !== ""
      );

      if (filteredImageUrls.length === 0) {
        alert("Please add at least one valid image URL");
        return;
      }

      const galleryData = {
        title: newGallery.title.trim(),
        caption: newGallery.caption.trim(),
        category: newGallery.category,
        status: newGallery.status,
        image_url: filteredImageUrls,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("gallery").insert([galleryData]);

      if (error) throw error;

      alert("Gallery added successfully!");
      setShowAddModal(false);
      resetNewGalleryForm();
      fetchGalleries();
    } catch (error) {
      console.error("Error adding gallery:", error);
      alert("Failed to add gallery: " + error.message);
    }
  };

  // Update gallery
  const handleUpdateGallery = async () => {
    try {
      if (!editGallery.title.trim() || editGallery.image_url.length === 0) {
        alert("Title and at least one image are required");
        return;
      }

      // Filter out empty image URLs
      const filteredImageUrls = editGallery.image_url.filter(
        (url) => url.trim() !== ""
      );

      if (filteredImageUrls.length === 0) {
        alert("Please add at least one valid image URL");
        return;
      }

      const updateData = {
        title: editGallery.title.trim(),
        caption: editGallery.caption.trim(),
        category: editGallery.category,
        status: editGallery.status,
        image_url: filteredImageUrls,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("gallery")
        .update(updateData)
        .eq("id", editGallery.id);

      if (error) throw error;

      alert("Gallery updated successfully!");
      setShowEditModal(false);
      fetchGalleries();
    } catch (error) {
      console.error("Error updating gallery:", error);
      alert("Failed to update gallery: " + error.message);
    }
  };

  // Delete gallery
  const handleDeleteGallery = async () => {
    try {
      const { error } = await supabase
        .from("gallery")
        .delete()
        .eq("id", galleryToDelete.id);

      if (error) throw error;

      alert("Gallery deleted successfully!");
      setShowDeleteModal(false);
      setGalleryToDelete(null);
      fetchGalleries();
    } catch (error) {
      console.error("Error deleting gallery:", error);
      alert("Failed to delete gallery: " + error.message);
    }
  };

  // Reset new gallery form
  const resetNewGalleryForm = () => {
    setNewGallery({
      title: "",
      caption: "",
      category: "interior",
      status: "active",
      image_url: [""],
    });
    setUploadedFiles([]);
  };

  // Add new image URL field
  const addImageUrlField = () => {
    setNewGallery({
      ...newGallery,
      image_url: [...newGallery.image_url, ""],
    });
  };

  // Remove image URL field
  const removeImageUrlField = (index) => {
    const newImageUrls = newGallery.image_url.filter((_, i) => i !== index);
    setNewGallery({
      ...newGallery,
      image_url: newImageUrls,
    });
  };

  // Update image URL
  const updateImageUrl = (index, value) => {
    const newImageUrls = [...newGallery.image_url];
    newImageUrls[index] = value;
    setNewGallery({
      ...newGallery,
      image_url: newImageUrls,
    });
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    return (
      <div
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          status === "active"
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        }`}
      >
        {status === "active" ? "Active" : "Inactive"}
      </div>
    );
  };

  // Category Badge Component
  const CategoryBadge = ({ category }) => {
    const getCategoryColor = (cat) => {
      const colors = {
        interior:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        pool: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
        restaurant:
          "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        exterior:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        bathrooms:
          "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
        "restaurant and bar":
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        gym: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        "event center":
          "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
        dining:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      };
      return (
        colors[cat] ||
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      );
    };

    return (
      <div
        className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
          category
        )}`}
      >
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </div>
    );
  };

  // Gallery Card Component
  const GalleryCard = ({ gallery }) => {
    const mainImage = gallery.image_url?.[0] || "";

    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden bg-gray-900">
          {mainImage ? (
            <Image
              width={100}
              height={100}
              src={mainImage}
              alt={gallery.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <ImageIcon className="w-12 h-12 text-gray-600" />
            </div>
          )}

          {/* Image Count Badge */}
          {gallery.image_url && gallery.image_url.length > 0 && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
              <span className="text-xs text-white font-medium">
                {gallery.image_url.length} image
                {gallery.image_url.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <StatusBadge status={gallery.status} />
          </div>

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <div className="flex gap-2 w-full">
              <button
                onClick={() => {
                  setSelectedGallery(gallery);
                  setShowViewModal(true);
                }}
                className="flex-1 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => {
                  setEditGallery({ ...gallery });
                  setShowEditModal(true);
                }}
                className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg transition-colors cursor-pointer"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setGalleryToDelete(gallery);
                  setShowDeleteModal(true);
                }}
                className="p-2 bg-red-500/80 backdrop-blur-sm hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold text-white truncate">
              {gallery.title}
            </h3>
          </div>

          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {gallery.caption || "No caption provided"}
          </p>

          <div className="flex items-center justify-between">
            <CategoryBadge category={gallery.category} />
            <span className="text-xs text-gray-500">
              {formatDate(gallery.created_at)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Gallery List Item Component
  const GalleryListItem = ({ gallery }) => {
    const mainImage = gallery.image_url?.[0] || "";

    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 p-6">
        <div className="flex items-center gap-4">
          {/* Thumbnail */}
          <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-900">
            {mainImage ? (
              <Image
                width={100}
                height={100}
                src={mainImage}
                alt={gallery.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-600" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-white truncate">
                {gallery.title}
              </h3>
              <StatusBadge status={gallery.status} />
              <CategoryBadge category={gallery.category} />
            </div>

            <p className="text-sm text-gray-400 mb-3 line-clamp-1">
              {gallery.caption || "No caption provided"}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                <span>{gallery.image_url?.length || 0} images</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(gallery.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedGallery(gallery);
                setShowViewModal(true);
              }}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
            <button
              onClick={() => {
                setEditGallery({ ...gallery });
                setShowEditModal(true);
              }}
              className="p-2 border border-gray-600 hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => {
                setGalleryToDelete(gallery);
                setShowDeleteModal(true);
              }}
              className="p-2 border border-red-600 hover:bg-red-700/50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add Gallery Modal
  const AddGalleryModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Add New Gallery</h2>
              <p className="text-gray-400">
                Upload images and add gallery details
              </p>
            </div>
            <button
              onClick={() => {
                setShowAddModal(false);
                resetNewGalleryForm();
              }}
              className="p-2 hover:bg-gray-700/50 cursor-pointer rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Title and Caption */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newGallery.title}
                  onChange={(e) =>
                    setNewGallery({ ...newGallery, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter gallery title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Caption
                </label>
                <textarea
                  value={newGallery.caption}
                  onChange={(e) =>
                    setNewGallery({ ...newGallery, caption: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Enter gallery caption (optional)"
                  rows="3"
                />
              </div>
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={newGallery.category}
                  onChange={(e) =>
                    setNewGallery({ ...newGallery, category: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  value={newGallery.status}
                  onChange={(e) =>
                    setNewGallery({ ...newGallery, status: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Image URLs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-300">
                  Image URLs *
                </label>
                <button
                  type="button"
                  onClick={addImageUrlField}
                  className="text-sm text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add URL
                </button>
              </div>

              <div className="space-y-3">
                {newGallery.image_url.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    {newGallery.image_url.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageUrlField(index)}
                        className="p-2 text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Add image URLs (JPG, PNG, or WebP formats recommended)
              </p>
            </div>

            {/* Upload Progress (if uploading) */}
            {uploading && (
              <div className="space-y-2">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 text-center">
                  Uploading {uploadedFiles.length} file(s)...{" "}
                  {uploadProgress.toFixed(0)}%
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetNewGalleryForm();
                }}
                className="px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGallery}
                disabled={
                  !newGallery.title.trim() ||
                  newGallery.image_url.some((url) => !url.trim())
                }
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add Gallery
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // View Gallery Modal
  const ViewGalleryModal = () => {
    if (!selectedGallery) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedGallery.title}
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-700/50 cursor-pointer rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Gallery Info */}
              <div className="flex items-center gap-4">
                <StatusBadge status={selectedGallery.status} />
                <CategoryBadge category={selectedGallery.category} />
                <div className="text-sm text-gray-400">
                  Added on {formatDate(selectedGallery.created_at)}
                </div>
              </div>

              {/* Caption */}
              {selectedGallery.caption && (
                <p className="text-gray-300">{selectedGallery.caption}</p>
              )}

              {/* Images Grid */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Images ({selectedGallery.image_url?.length || 0})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedGallery.image_url?.map((url, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg overflow-hidden bg-gray-900 aspect-square"
                    >
                      <Image
                        width={100}
                        height={100}
                        src={url}
                        alt={`${selectedGallery.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => window.open(url, "_blank")}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-700">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setEditGallery({ ...selectedGallery });
                    setShowEditModal(true);
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Gallery
                </button>
                <button
                  onClick={() => {
                    setGalleryToDelete(selectedGallery);
                    setShowViewModal(false);
                    setShowDeleteModal(true);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Gallery
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Gallery Modal
  const EditGalleryModal = () => {
    if (!editGallery) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Edit Gallery</h2>
                <p className="text-gray-400">Update gallery details</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-700/50 cursor-pointer rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Title and Caption */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editGallery.title}
                    onChange={(e) =>
                      setEditGallery({ ...editGallery, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Caption
                  </label>
                  <textarea
                    value={editGallery.caption}
                    onChange={(e) =>
                      setEditGallery({
                        ...editGallery,
                        caption: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>
              </div>

              {/* Category and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={editGallery.category}
                    onChange={(e) =>
                      setEditGallery({
                        ...editGallery,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    value={editGallery.status}
                    onChange={(e) =>
                      setEditGallery({ ...editGallery, status: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Image URLs */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Image URLs *
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditGallery({
                        ...editGallery,
                        image_url: [...editGallery.image_url, ""],
                      })
                    }
                    className="text-sm text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add URL
                  </button>
                </div>

                <div className="space-y-3">
                  {editGallery.image_url?.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={url}
                          onChange={(e) => {
                            const newUrls = [...editGallery.image_url];
                            newUrls[index] = e.target.value;
                            setEditGallery({
                              ...editGallery,
                              image_url: newUrls,
                            });
                          }}
                          className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      {editGallery.image_url.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newUrls = editGallery.image_url.filter(
                              (_, i) => i !== index
                            );
                            setEditGallery({
                              ...editGallery,
                              image_url: newUrls,
                            });
                          }}
                          className="p-2 text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateGallery}
                  disabled={
                    !editGallery.title.trim() ||
                    editGallery.image_url.some((url) => !url.trim())
                  }
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => {
    if (!galleryToDelete) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white">Delete Gallery</h2>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the gallery{" "}
              <span className="font-semibold text-white">
                "{galleryToDelete.title}"
              </span>
              ? This action cannot be undone and all images will be removed.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setGalleryToDelete(null);
                }}
                className="px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGallery}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Delete Gallery
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Pagination Component
  const Pagination = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-700">
        <div className="text-sm text-gray-400">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
          galleries
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${
              currentPage === 1
                ? "text-gray-600 cursor-not-allowed"
                : "text-gray-400 hover:bg-gray-700/50 cursor-pointer"
            }`}
          >
            ‹
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-lg font-medium ${
                  currentPage === pageNum
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:bg-gray-700/50 cursor-pointer"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${
              currentPage === totalPages
                ? "text-gray-600 cursor-not-allowed"
                : "text-gray-400 hover:bg-gray-700/50 cursor-pointer"
            }`}
          >
            ›
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white">
      {/* Modals */}
      {showAddModal && <AddGalleryModal />}
      {showViewModal && <ViewGalleryModal />}
      {showEditModal && <EditGalleryModal />}
      {showDeleteModal && <DeleteConfirmationModal />}

      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors lg:hidden cursor-pointer"
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
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Gallery Management
                  </h1>
                  <p className="text-gray-400 mt-2">
                    Manage and organize your hotel gallery images
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    Add Gallery
                  </button>

                  <button
                    onClick={fetchGalleries}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-600 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all duration-300 cursor-pointer"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Galleries</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {totalItems}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Galleries</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {galleries.filter((g) => g.status === "active").length}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Images</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {galleries.reduce(
                        (total, gallery) =>
                          total + (gallery.image_url?.length || 0),
                        0
                      )}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-sky-500/20 text-sky-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Search Bar */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Search Galleries
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title or caption..."
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* View Mode and Filters */}
                <div className="flex items-end gap-4">
                  {/* View Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      View
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-3 rounded-lg border transition-colors ${
                          viewMode === "grid"
                            ? "bg-purple-600 border-purple-500 text-white"
                            : "border-gray-600 hover:bg-gray-700/50 text-gray-400"
                        } cursor-pointer`}
                      >
                        <Grid className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-3 rounded-lg border transition-colors ${
                          viewMode === "list"
                            ? "bg-purple-600 border-purple-500 text-white"
                            : "border-gray-600 hover:bg-gray-700/50 text-gray-400"
                        } cursor-pointer`}
                      >
                        <List className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Filter Button */}
                  <button className="flex items-center gap-2 px-4 py-3 border border-gray-600 hover:bg-gray-700/50 text-white rounded-xl font-medium transition-colors cursor-pointer">
                    <Filter className="w-5 h-5" />
                    <span>More Filters</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Galleries Display */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Galleries ({filteredGalleries.length})
                </h2>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors cursor-pointer">
                    <Download className="w-5 h-5" />
                    Export
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading galleries...</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredGalleries.length === 0 && (
                <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
                  <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    No galleries found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery ||
                    selectedCategory !== "all" ||
                    selectedStatus !== "all"
                      ? "Try adjusting your search or filters"
                      : "Get started by adding your first gallery"}
                  </p>
                  {!searchQuery &&
                    selectedCategory === "all" &&
                    selectedStatus === "all" && (
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        Add Gallery
                      </button>
                    )}
                </div>
              )}

              {/* Galleries Grid/List */}
              {!loading && filteredGalleries.length > 0 && (
                <>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredGalleries.map((gallery) => (
                        <GalleryCard key={gallery.id} gallery={gallery} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredGalleries.map((gallery) => (
                        <GalleryListItem key={gallery.id} gallery={gallery} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Pagination */}
              <Pagination />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
