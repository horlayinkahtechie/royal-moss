"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Users,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  ChevronDown,
  Grid,
  List,
  UserPlus,
  Lock,
  Unlock,
  Ban,
  Activity,
  TrendingUp,
  Star,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Key,
  Building,
  Check,
  X,
  ChevronUp,
  AlertCircle,
  BarChart,
  Users as UsersIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  CalendarDays,
  ShieldCheck,
  Zap,
  Globe,
  Crown,
  UserCog,
  KeyRound,
  Save,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/app/_components/admin/Sidebar";
import supabase from "../../lib/supabase";
import { format, parseISO, differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";

// User status options
const statusOptions = ["all", "active", "inactive", "suspended", "pending"];
const authMethodOptions = [
  "all",
  "email_password",
  "google",
  "facebook",
  "apple",
];
// User role options
const roleOptions = ["all", "user", "admin"];

export default function UsersPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    newsletterSubscribers: 0,
    avgUserAge: 0,
    adminUsers: 0,
    moderatorUsers: 0,
  });

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedAuthMethod, setSelectedAuthMethod] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Fetch users from Supabase
  const fetchUsers = useCallback(
    async (searchTerm = searchQuery) => {
      try {
        setLoading(true);

        // Build query with count - including user_role
        let query = supabase.from("users").select("*", { count: "exact" });

        // Apply search filter
        if (searchTerm) {
          query = query.or(
            `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
          );
        }

        // Apply status filter
        if (selectedStatus !== "all") {
          query = query.eq("status", selectedStatus);
        }

        // Apply auth method filter
        if (selectedAuthMethod !== "all") {
          query = query.eq("auth_method", selectedAuthMethod);
        }

        // Apply role filter
        if (selectedRole !== "all") {
          query = query.eq("user_role", selectedRole);
        }

        // Apply sorting
        if (sortBy === "created_at") {
          query = query.order("created_at", {
            ascending: sortOrder === "asc",
          });
        } else if (sortBy === "first_name") {
          query = query.order("first_name", {
            ascending: sortOrder === "asc",
          });
        } else if (sortBy === "last_login") {
          query = query.order("last_login", {
            ascending: sortOrder === "asc",
          });
        } else if (sortBy === "user_role") {
          query = query.order("user_role", {
            ascending: sortOrder === "asc",
          });
        }

        // Apply pagination
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        query = query.range(from, to);

        const { data: usersData, error, count } = await query;

        if (error) throw error;

        setTotalItems(count || 0);

        // Get all users for statistics (without pagination)
        const { data: allUsersData, error: allUsersError } = await supabase
          .from("users")
          .select("*");

        if (!allUsersError) {
          // Process users data
          const processedUsers = usersData.map((user) => ({
            ...user,
            full_name:
              `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
              "Unknown User",
            // Add derived fields for display
            is_active: user.status === "active",
            is_verified: user.email_confirmed_at !== null,
            last_active: user.last_login || user.updated_at || user.created_at,
            // Ensure user_role has a default value
            user_role: user.user_role || "user",
          }));

          setUsers(processedUsers);
          setFilteredUsers(processedUsers);

          // Calculate statistics
          calculateStatistics(allUsersData);
        } else {
          // Fallback to basic processing
          const processedUsers = usersData.map((user) => ({
            ...user,
            full_name:
              `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
              "Unknown User",
            user_role: user.user_role || "user",
          }));

          setUsers(processedUsers);
          setFilteredUsers(processedUsers);

          // Calculate basic statistics
          const totalUsers = count || 0;
          const newsletterSubscribers = usersData.filter(
            (u) => u.subscribed_to_newsletter
          ).length;
          const verifiedEmails = usersData.filter(
            (u) => u.email_confirmed_at
          ).length;
          const adminUsers = usersData.filter(
            (u) => u.user_role === "admin" || u.user_role === "super_admin"
          ).length;
          const moderatorUsers = usersData.filter(
            (u) => u.user_role === "moderator"
          ).length;

          setStats({
            totalUsers,
            activeUsers: totalUsers,
            newUsers: usersData.filter((u) => {
              const createdDate = new Date(u.created_at);
              return differenceInDays(new Date(), createdDate) <= 7;
            }).length,
            verifiedEmails,
            newsletterSubscribers,
            avgUserAge: 0,
            adminUsers,
            moderatorUsers,
          });
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    },
    [
      selectedStatus,
      selectedAuthMethod,
      selectedRole,
      sortBy,
      sortOrder,
      currentPage,
      itemsPerPage,
    ]
  );

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
      fetchUsers();
    };

    checkAdminRole();
  }, [router]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedAuthMethod, selectedRole, sortBy, sortOrder]);

  // Handle search with debounce
  const handleSearchChange = (value) => {
    setSearchQuery(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const newTimeout = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(value);
    }, 500);

    setSearchTimeout(newTimeout);
  };

  const calculateStatistics = (usersData) => {
    if (!usersData || usersData.length === 0) {
      return;
    }

    const totalUsers = usersData.length;
    const activeUsers = usersData.filter(
      (u) => u.status === "active" || !u.status
    ).length;
    const newUsers = usersData.filter((u) => {
      const createdDate = new Date(u.created_at);
      return differenceInDays(new Date(), createdDate) <= 7;
    }).length;
    const verifiedEmails = usersData.filter((u) => u.email_confirmed_at).length;
    const newsletterSubscribers = usersData.filter(
      (u) => u.subscribed_to_newsletter
    ).length;
    const adminUsers = usersData.filter(
      (u) => u.user_role === "admin" || u.user_role === "super_admin"
    ).length;
    const moderatorUsers = usersData.filter(
      (u) => u.user_role === "moderator"
    ).length;

    // Calculate average account age (in days)
    const avgAccountAge =
      usersData.reduce((sum, user) => {
        const createdDate = new Date(user.created_at);
        const ageInDays = differenceInDays(new Date(), createdDate);
        return sum + ageInDays;
      }, 0) / totalUsers;

    setStats({
      totalUsers,
      activeUsers,
      newUsers,
      verifiedEmails,
      newsletterSubscribers,
      avgUserAge: Math.round(avgAccountAge),
      adminUsers,
      moderatorUsers,
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // View user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      status: user.status || "active",
      user_role: user.user_role || "user",
      subscribed_to_newsletter: user.subscribed_to_newsletter || false,
    });
    setShowEditModal(true);
  };

  // Save edited user
  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          ...editFormData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      alert("User updated successfully!");
      setShowEditModal(false);
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user: " + error.message);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userToDelete.id);

      if (error) throw error;

      alert("User deleted successfully!");
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user: " + error.message);
    }
  };

  // Toggle user status (active/suspended)
  const handleToggleStatus = async (user, newStatus) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      alert(
        `User ${
          newStatus === "suspended" ? "suspended" : "activated"
        } successfully!`
      );
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status: " + error.message);
    }
  };

  // Send reset password email
  const handleResetPassword = async (user) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      alert(`Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Failed to send reset password email: " + error.message);
    }
  };

  // Update user role
  const handleUpdateRole = async (user, newRole) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          user_role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      alert(`User role updated to ${newRole} successfully!`);
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role: " + error.message);
    }
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const config = {
      active: {
        color: "bg-emerald-900/40 border-emerald-700 text-emerald-300",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      inactive: {
        color: "bg-amber-900/40 border-amber-700 text-amber-300",
        icon: <Clock className="w-4 h-4" />,
      },
      suspended: {
        color: "bg-red-900/40 border-red-700 text-red-300",
        icon: <Ban className="w-4 h-4" />,
      },
      pending: {
        color: "bg-blue-900/40 border-blue-700 text-blue-300",
        icon: <Clock className="w-4 h-4" />,
      },
    };

    const { color, icon } = config[status] || config.active;

    return (
      <div
        className={`${color} px-3 py-1.5 rounded-lg border flex items-center gap-2 w-fit`}
      >
        {icon}
        <span className="text-sm font-medium capitalize text-white">
          {status}
        </span>
      </div>
    );
  };

  // Role Badge Component
  const RoleBadge = ({ role }) => {
    const config = {
      admin: {
        color: "bg-purple-900/40 border-purple-700 text-purple-300",
        icon: <Shield className="w-4 h-4" />,
        label: "Admin",
      },
      super_admin: {
        color: "bg-red-900/40 border-red-700 text-red-300",
        icon: <Crown className="w-4 h-4" />,
        label: "Super Admin",
      },
      moderator: {
        color: "bg-blue-900/40 border-blue-700 text-blue-300",
        icon: <UserCog className="w-4 h-4" />,
        label: "Moderator",
      },
      user: {
        color: "bg-gray-800 border-gray-700 text-gray-300",
        icon: <User className="w-4 h-4" />,
        label: "User",
      },
    };

    const { color, icon, label } = config[role] || {
      color: "bg-gray-800 border-gray-700 text-gray-300",
      icon: <User className="w-4 h-4" />,
      label: role || "User",
    };

    return (
      <div
        className={`${color} px-3 py-1.5 rounded-lg border flex items-center gap-2 w-fit`}
      >
        {icon}
        <span className="text-sm font-medium capitalize text-white">
          {label}
        </span>
      </div>
    );
  };

  // Auth Method Badge Component
  const AuthMethodBadge = ({ method }) => {
    const config = {
      email_password: {
        color: "bg-blue-900/40 border-blue-700 text-blue-300",
        label: "Email",
        icon: <MailIcon className="w-4 h-4" />,
      },
      google: {
        color: "bg-red-900/40 border-red-700 text-red-300",
        label: "Google",
        icon: <ShieldCheck className="w-4 h-4" />,
      },
      facebook: {
        color: "bg-indigo-900/40 border-indigo-700 text-indigo-300",
        label: "Facebook",
        icon: <UsersIcon className="w-4 h-4" />,
      },
      apple: {
        color: "bg-gray-900/40 border-gray-700 text-gray-300",
        label: "Apple",
        icon: <Shield className="w-4 h-4" />,
      },
    };

    const { color, label, icon } = config[method] || {
      color: "bg-gray-800 border-gray-700 text-gray-300",
      label: method || "Unknown",
      icon: <User className="w-4 h-4" />,
    };

    return (
      <div
        className={`${color} px-3 py-1.5 rounded-lg border flex items-center gap-2 w-fit`}
      >
        {icon}
        <span className="text-sm font-medium capitalize text-white">
          {label}
        </span>
      </div>
    );
  };

  // User Detail Modal
  const UserDetailModal = () => {
    if (!selectedUser) return null;

    const formatDate = (dateString) => {
      try {
        return format(new Date(dateString), "MMM dd, yyyy HH:mm");
      } catch {
        return "N/A";
      }
    };

    const accountAge = () => {
      try {
        const created = new Date(selectedUser.created_at);
        const days = differenceInDays(new Date(), created);
        if (days < 1) return "Today";
        if (days === 1) return "1 day ago";
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        if (days < 365) return `${Math.floor(days / 30)} months ago`;
        return `${Math.floor(days / 365)} years ago`;
      } catch {
        return "N/A";
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">User Details</h2>
                <p className="text-gray-400">
                  User ID: {selectedUser.id.substring(0, 8)}...
                </p>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 hover:bg-gray-700/50 cursor-pointer rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile & Basic Info */}
              <div className="lg:col-span-1 space-y-6">
                {/* Profile Card */}
                <div className="bg-gray-900/50 rounded-xl p-6 text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-sky-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {selectedUser.first_name?.[0]?.toUpperCase()}
                    {selectedUser.last_name?.[0]?.toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {selectedUser.full_name}
                  </h3>
                  <p className="text-gray-400 mb-4">{selectedUser.email}</p>
                  <div className="flex flex-col gap-2">
                    <StatusBadge status={selectedUser.status || "active"} />
                    <RoleBadge role={selectedUser.user_role || "user"} />
                    <AuthMethodBadge method={selectedUser.auth_method} />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gray-900/50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Account Stats
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Member Since</span>
                      <span className="font-medium text-white">
                        {formatDate(selectedUser.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Account Age</span>
                      <span className="font-medium text-white">
                        {accountAge()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Last Updated</span>
                      <span className="font-medium text-white">
                        {formatDate(selectedUser.updated_at)}
                      </span>
                    </div>
                    {selectedUser.last_login && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Last Login</span>
                        <span className="font-medium text-white">
                          {formatDate(selectedUser.last_login)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Detailed Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-900/50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">First Name</p>
                      <p className="text-white">
                        {selectedUser.first_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Last Name</p>
                      <p className="text-white">
                        {selectedUser.last_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email Address</p>
                      <p className="text-white">{selectedUser.email}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400">Phone Number</p>
                      <p className="text-white">
                        {selectedUser.phone || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400">User Role</p>
                      <RoleBadge role={selectedUser.user_role || "user"} />
                    </div>

                    <div>
                      <p className="text-sm text-gray-400">Newsletter</p>
                      <div className="flex items-center gap-2">
                        {selectedUser.subscribed_to_newsletter ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-sky-400" />
                            <span className="text-sky-400">Subscribed</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">
                              Not Subscribed
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">User ID</p>
                      <p className="text-white text-sm font-mono">
                        {selectedUser.id.substring(0, 20)}...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-gray-900/50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Account Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">
                        Authentication Method
                      </p>
                      <AuthMethodBadge method={selectedUser.auth_method} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Account Status</p>
                      <StatusBadge status={selectedUser.status || "active"} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Created At</p>
                      <p className="text-white">
                        {formatDate(selectedUser.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Updated At</p>
                      <p className="text-white">
                        {formatDate(selectedUser.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      handleEditUser(selectedUser);
                    }}
                    className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                    Edit User
                  </button>
                  <button
                    onClick={() => handleResetPassword(selectedUser)}
                    className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Key className="w-5 h-5" />
                    Reset Password
                  </button>
                  <button
                    onClick={() =>
                      handleToggleStatus(
                        selectedUser,
                        selectedUser.status === "suspended"
                          ? "active"
                          : "suspended"
                      )
                    }
                    className={`flex items-center cursor-pointer gap-2 px-6 py-3 ${
                      selectedUser.status === "suspended"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-red-600 hover:bg-red-700"
                    } text-white font-medium rounded-lg transition-colors`}
                  >
                    {selectedUser.status === "suspended" ? (
                      <>
                        <Unlock className="w-5 h-5" />
                        Activate User
                      </>
                    ) : (
                      <>
                        <Ban className="w-5 h-5" />
                        Suspend User
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setUserToDelete(selectedUser);
                      setShowUserModal(false);
                      setShowDeleteModal(true);
                    }}
                    className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit User Modal
  const EditUserModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit User</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-700/50 cursor-pointer rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.first_name || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        first_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.last_name || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        last_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editFormData.email || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={editFormData.status || "active"}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    User Role
                  </label>
                  <select
                    value={editFormData.user_role || "user"}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        user_role: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newsletter"
                  checked={editFormData.subscribed_to_newsletter || false}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      subscribed_to_newsletter: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-sky-600 bg-gray-700 border-gray-600 rounded focus:ring-sky-500"
                />
                <label htmlFor="newsletter" className="text-sm text-gray-300">
                  Subscribed to newsletter
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                >
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
    if (!userToDelete) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <h2 className="text-xl font-bold text-white">Delete User</h2>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete user{" "}
              <span className="font-semibold text-white">
                {userToDelete.full_name}
              </span>
              ? This action cannot be undone and all user data will be
              permanently removed.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 border cursor-pointer border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 cursor-pointer text-white rounded-lg transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // User Card Component
  const UserCard = ({ user }) => {
    const userInitials =
      `${user.first_name?.[0] || ""}${
        user.last_name?.[0] || ""
      }`.toUpperCase() || "U";

    const formatDate = (dateString) => {
      try {
        return format(new Date(dateString), "MMM dd, yyyy");
      } catch {
        return "N/A";
      }
    };

    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group">
        {/* User Header */}
        <div className="relative h-40 bg-gradient-to-br from-purple-900/50 to-sky-900/50 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {userInitials}
                </div>
                {user.email_confirmed_at && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center border-2 border-gray-800">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {user.full_name}
                </h3>
                <p className="text-sm text-gray-300">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Status & Auth Method */}
          <div className="flex items-center gap-2 mt-4">
            <StatusBadge status={user.status || "active"} />
            <RoleBadge role={user.user_role || "user"} />
          </div>
        </div>

        <div className="p-6">
          {/* User Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-1">
              <div className="text-sm text-gray-400">Phone</div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400" />
                <span className="font-medium text-white">
                  {user.phone || "N/A"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-400">Member Since</div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span className="font-medium text-white">
                  {formatDate(user.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-900/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">
                {user.subscribed_to_newsletter ? (
                  <Check className="w-5 h-5 mx-auto text-emerald-400" />
                ) : (
                  <X className="w-5 h-5 mx-auto text-gray-400" />
                )}
              </div>
              <div className="text-xs text-gray-400">Newsletter</div>
            </div>
            <div className="bg-gray-900/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-emerald-400">
                {user.email_confirmed_at ? "✓" : "—"}
              </div>
              <div className="text-xs text-gray-400">Verified</div>
            </div>
            <div className="bg-gray-900/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-amber-400">
                {user.auth_method === "google" ? "G" : "E"}
              </div>
              <div className="text-xs text-gray-400">Auth</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewUser(user)}
              className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
            <button
              onClick={() => handleEditUser(user)}
              className="p-2.5 border border-gray-600 hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => handleResetPassword(user)}
              className="p-2.5 border border-amber-600 hover:bg-amber-700/50 rounded-lg transition-colors cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // User List Item Component
  const UserListItem = ({ user }) => {
    const userInitials =
      `${user.first_name?.[0] || ""}${
        user.last_name?.[0] || ""
      }`.toUpperCase() || "U";

    const formatDate = (dateString) => {
      try {
        return format(new Date(dateString), "MMM dd, yyyy");
      } catch {
        return "N/A";
      }
    };

    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {userInitials}
              </div>
              {user.email_confirmed_at && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center border-2 border-gray-800">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-white">
                  {user.full_name}
                </h3>
                <div className="flex items-center gap-2">
                  <StatusBadge status={user.status || "active"} />
                  <RoleBadge role={user.user_role || "user"} />
                  <AuthMethodBadge method={user.auth_method} />
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {user.phone}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(user.created_at)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewUser(user)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => handleEditUser(user)}
                className="p-2 border border-gray-600 hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer"
              >
                <Edit className="w-4 h-4 text-gray-400" />
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
    const maxVisiblePages = 5;

    if (totalPages <= 1) return null;

    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col lg:flex-row items-center justify-between mt-8 pt-8 border-t border-gray-700 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
            users
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${
              currentPage === 1
                ? "text-gray-600 cursor-not-allowed"
                : "text-gray-400 hover:bg-gray-700/50 cursor-pointer"
            }`}
          >
            «
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${
              currentPage === 1
                ? "text-gray-600 cursor-not-allowed"
                : "text-gray-400 hover:bg-gray-700/50 cursor-pointer"
            }`}
          >
            ‹
          </button>

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`w-10 h-10 rounded-lg font-medium ${
                currentPage === number
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-700/50 cursor-pointer"
              }`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${
              currentPage === totalPages
                ? "text-gray-600 cursor-not-allowed"
                : "text-gray-400 hover:bg-gray-700/50 cursor-pointer"
            }`}
          >
            ›
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${
              currentPage === totalPages
                ? "text-gray-600 cursor-not-allowed"
                : "text-gray-400 hover:bg-gray-700/50 cursor-pointer"
            }`}
          >
            »
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Users per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm cursor-pointer"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading users data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white">
      {/* Modals */}
      {showUserModal && <UserDetailModal />}
      {showEditModal && <EditUserModal />}

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
          <div className="w-full pb-7">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6">
              {/* Left */}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Users Management
                </h1>
                <p className="text-sm text-gray-400">
                  Manage and monitor all user accounts
                </p>
              </div>

              {/* Right */}
              <div className="flex lg:justify-end items-center gap-4">
                {/* Refresh Button */}
                <button
                  onClick={() => fetchUsers()}
                  className="flex items-center gap-2 px-5 py-3 border border-gray-600 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all duration-300 cursor-pointer"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: "Total Users",
                value: stats.totalUsers.toString(),
                icon: <UsersIcon className="w-6 h-6" />,
                color: "text-purple-400",
                trend: "+12%",
              },
              {
                label: "Active Users",
                value: stats.activeUsers.toString(),
                icon: <UserCheck className="w-6 h-6" />,
                color: "text-emerald-400",
                trend: "+8%",
              },
              {
                label: "Admin Users",
                value: stats.adminUsers.toString(),
                icon: <Shield className="w-6 h-6" />,
                color: "text-red-400",
                trend: "+2%",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-emerald-500">
                        {stat.trend}
                      </span>
                      <span className="text-sm text-gray-400">
                        from last month
                      </span>
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-xl bg-gray-900/50 ${stat.color}`}
                  >
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Search Bar */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Users
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by name, email, or phone..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-end gap-4">
                {/* View Mode Toggle */}
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

                {/* Advanced Filters Button */}
                <button className="flex items-center gap-2 px-4 py-3 border border-gray-600 hover:bg-gray-700/50 text-white rounded-xl font-medium transition-colors cursor-pointer">
                  <Filter className="w-5 h-5" />
                  <span>Advanced Filters</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
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
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white cursor-pointer"
                >
                  {roleOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() +
                        option.slice(1).replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auth Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Auth Method
                </label>
                <select
                  value={selectedAuthMethod}
                  onChange={(e) => setSelectedAuthMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white cursor-pointer"
                >
                  {authMethodOptions.map((option) => (
                    <option key={option} value={option}>
                      {option
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4 mt-6">
              <span className="text-sm text-gray-400">Sort by:</span>
              <div className="flex gap-2">
                {[
                  { field: "created_at", label: "Date Created" },
                  { field: "first_name", label: "Name" },
                  { field: "last_login", label: "Last Login" },
                  { field: "user_role", label: "Role" },
                ].map((option) => (
                  <button
                    key={option.field}
                    onClick={() => handleSort(option.field)}
                    className={`px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
                      sortBy === option.field
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "border-gray-600 hover:bg-gray-700/50 text-gray-400"
                    }`}
                  >
                    {option.label}
                    {sortBy === option.field && (
                      <span className="ml-2">
                        {sortOrder === "desc" ? (
                          <ChevronDown className="w-4 h-4 inline" />
                        ) : (
                          <ChevronUp className="w-4 h-4 inline" />
                        )}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Users Display */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Users ({filteredUsers.length})
              </h2>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors cursor-pointer">
                  <Download className="w-5 h-5" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading users...</p>
              </div>
            )}

            {/* Users Grid/List */}
            {!loading && filteredUsers.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  No users found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStatus("all");
                    setSelectedAuthMethod("all");
                    setSelectedRole("all");
                    fetchUsers();
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <UserListItem key={user.id} user={user} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            <Pagination />
          </div>
        </main>
      </div>
    </div>
  );
}
