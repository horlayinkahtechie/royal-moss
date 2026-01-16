"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Users,
  CheckCircle,
  XCircle,
  MoreVertical,
  Trash2,
  Download,
  RefreshCw,
  Grid,
  List,
  Loader2,
  X,
  User,
  Clock,
  Activity,
  Send,
  Target,
  MailCheck,
  CalendarDays,
  CheckSquare,
} from "lucide-react";
import Sidebar from "@/app/_components/admin/Sidebar";
import supabase from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function SubscribersPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    newThisMonth: 0,
    avgGrowth: 0,
    totalEmailsSent: 0,
    openRate: 0,
    clickRate: 0,
    unsubscribed: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("subscribed_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState(null);
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [emailCampaign, setEmailCampaign] = useState({
    subject: "",
    message: "",
    previewText: "",
    campaignName: "",
    sendTo: "all",
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStats, setEmailStats] = useState({
    scheduled: 0,
    sent: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
  });

  // Fetch sources and statuses dynamically
  const [statusOptions, setStatusOptions] = useState(["all"]);
  const [sourceOptions, setSourceOptions] = useState(["all"]);

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
      fetchSubscribers();
    };

    checkAdminRole();
  }, [router]);

  // Fetch all subscribers data
  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch subscribers from Supabase
      const { data: subscribersData, error: subscribersError } = await supabase
        .from("subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (subscribersError) throw subscribersError;

      // Process subscribers data
      const processedSubscribers =
        subscribersData?.map((subscriber) => {
          // Generate some mock engagement data for demonstration
          const engagementScore = Math.floor(Math.random() * 100);
          const lastEmailSent = new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          );
          const totalEmails = Math.floor(Math.random() * 50) + 1;
          const openedEmails = Math.floor(
            totalEmails * (Math.random() * 0.7 + 0.3)
          );
          const clickedEmails = Math.floor(
            openedEmails * (Math.random() * 0.4 + 0.1)
          );

          return {
            ...subscriber,
            engagement_score: engagementScore,
            last_email_sent: lastEmailSent.toISOString().split("T")[0],
            emails_sent: totalEmails,
            emails_opened: openedEmails,
            emails_clicked: clickedEmails,
            open_rate: Math.round((openedEmails / totalEmails) * 100),
            click_rate: Math.round((clickedEmails / totalEmails) * 100),
            is_active: subscriber.status === "active" && subscriber.confirmed,
          };
        }) || [];

      setSubscribers(processedSubscribers);
      setFilteredSubscribers(processedSubscribers);

      // Extract unique values for filters
      const statuses = [
        ...new Set(processedSubscribers.map((sub) => sub.status)),
      ].filter(Boolean);
      const sources = [
        ...new Set(processedSubscribers.map((sub) => sub.source)),
      ].filter(Boolean);

      setStatusOptions(["all", ...statuses]);
      setSourceOptions(["all", ...sources]);

      // Calculate statistics
      calculateStatistics(processedSubscribers);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Calculate statistics
  const calculateStatistics = (subsData) => {
    const totalSubscribers = subsData.length;
    const activeSubscribers = subsData.filter((sub) => sub.is_active).length;

    // Calculate this month's new subscribers
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const newThisMonth = subsData.filter((sub) => {
      const subDate = new Date(sub.subscribed_at);
      return (
        subDate.getMonth() === thisMonth && subDate.getFullYear() === thisYear
      );
    }).length;

    // Calculate average monthly growth (mock data for now)
    const avgGrowth = 12.5; // This would come from historical data

    // Calculate email engagement stats
    const totalEmailsSent = subsData.reduce(
      (sum, sub) => sum + (sub.emails_sent || 0),
      0
    );
    const totalOpened = subsData.reduce(
      (sum, sub) => sum + (sub.emails_opened || 0),
      0
    );
    const totalClicked = subsData.reduce(
      (sum, sub) => sum + (sub.emails_clicked || 0),
      0
    );

    const openRate =
      totalEmailsSent > 0 ? (totalOpened / totalEmailsSent) * 100 : 0;
    const clickRate =
      totalEmailsSent > 0 ? (totalClicked / totalEmailsSent) * 100 : 0;
    const unsubscribed = subsData.filter(
      (sub) => sub.status === "unsubscribed"
    ).length;

    setStats({
      totalSubscribers,
      activeSubscribers,
      newThisMonth,
      avgGrowth,
      totalEmailsSent,
      openRate: Math.round(openRate),
      clickRate: Math.round(clickRate),
      unsubscribed,
    });
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  // Filter and search subscribers
  useEffect(() => {
    let filtered = [...subscribers];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((sub) =>
        sub.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((sub) => sub.status === selectedStatus);
    }

    // Apply source filter
    if (selectedSource !== "all") {
      filtered = filtered.filter((sub) => sub.source === selectedSource);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "subscribed_at") {
        return sortOrder === "asc"
          ? new Date(a.subscribed_at) - new Date(b.subscribed_at)
          : new Date(b.subscribed_at) - new Date(a.subscribed_at);
      }
      if (sortBy === "engagement_score") {
        return sortOrder === "asc"
          ? (a.engagement_score || 0) - (b.engagement_score || 0)
          : (b.engagement_score || 0) - (a.engagement_score || 0);
      }
      if (sortBy === "email") {
        return sortOrder === "asc"
          ? a.email?.localeCompare(b.email || "")
          : b.email?.localeCompare(a.email || "");
      }
      return 0;
    });

    setFilteredSubscribers(filtered);
  }, [
    searchQuery,
    selectedStatus,
    selectedSource,
    sortBy,
    sortOrder,
    subscribers,
  ]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleSendEmail = (subscriber) => {
    setSelectedSubscriber(subscriber);
    setEmailCampaign({
      subject: "",
      message: "",
      previewText: "",
      campaignName: "",
      sendTo: "single",
    });
    setShowEmailModal(true);
  };

  const handleDeleteSubscriber = async () => {
    if (!subscriberToDelete) return;

    try {
      const { error } = await supabase
        .from("subscribers")
        .delete()
        .eq("id", subscriberToDelete.id);

      if (error) throw error;

      alert("Subscriber deleted successfully!");
      setShowDeleteModal(false);
      setSubscriberToDelete(null);
      fetchSubscribers();
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      alert("Failed to delete subscriber: " + error.message);
    }
  };

  const handleSelectSubscriber = (id) => {
    setSelectedSubscribers((prev) =>
      prev.includes(id) ? prev.filter((subId) => subId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubscribers.length === filteredSubscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(filteredSubscribers.map((sub) => sub.id));
    }
  };

  const handleSendBulkEmail = async () => {
    if (sendingEmail) return;

    setSendingEmail(true);

    try {
      // Determine which subscribers to send to
      const recipients =
        emailCampaign.sendTo === "all"
          ? filteredSubscribers
          : filteredSubscribers.filter((sub) =>
              selectedSubscribers.includes(sub.id)
            );

      if (recipients.length === 0) {
        alert("No recipients selected!");
        return;
      }

      // Here you would integrate with your email service (Resend, SendGrid, etc.)
      // For demonstration, we'll simulate sending
      console.log("Sending email to:", recipients.length, "subscribers");
      console.log("Email content:", emailCampaign);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update email stats
      setEmailStats((prev) => ({
        ...prev,
        scheduled: prev.scheduled + recipients.length,
        sent: prev.sent + recipients.length,
      }));

      alert(
        `Email campaign "${emailCampaign.campaignName}" sent successfully to ${recipients.length} subscribers!`
      );
      setShowBulkEmailModal(false);
      setEmailCampaign({
        subject: "",
        message: "",
        previewText: "",
        campaignName: "",
        sendTo: "all",
      });
    } catch (error) {
      console.error("Error sending bulk email:", error);
      alert("Failed to send email campaign. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      active: "bg-emerald-900/30 text-emerald-300 border-emerald-700",
      unsubscribed: "bg-red-900/30 text-red-300 border-red-700",
      bounced: "bg-amber-900/30 text-amber-300 border-amber-700",
      pending: "bg-blue-900/30 text-blue-300 border-blue-700",
    };

    return (
      <div
        className={`${
          colors[status] || colors.pending
        } px-3 py-1 rounded-lg border text-sm font-medium capitalize`}
      >
        {status}
      </div>
    );
  };

  const SourceBadge = ({ source }) => {
    const colors = {
      website_footer: "bg-sky-900/30 text-sky-300 border-sky-700",
      booking_form: "bg-purple-900/30 text-purple-300 border-purple-700",
      promotion: "bg-pink-900/30 text-pink-300 border-pink-700",
      event: "bg-amber-900/30 text-amber-300 border-amber-700",
    };

    return (
      <div
        className={`${
          colors[source] || colors.website_footer
        } px-3 py-1 rounded-lg border text-sm font-medium`}
      >
        {source?.replace(/_/g, " ") || "Website"}
      </div>
    );
  };

  const EngagementBadge = ({ score }) => {
    let color = "text-red-400";
    if (score >= 70) color = "text-emerald-400";
    else if (score >= 40) color = "text-amber-400";

    return (
      <div className="flex items-center gap-2">
        <Activity className={`w-4 h-4 ${color}`} />
        <span className={`font-semibold ${color}`}>{score}%</span>
      </div>
    );
  };

  // Subscriber Card Component (Grid View)
  const SubscriberCard = ({ subscriber }) => {
    const joinedDate = new Date(subscriber.subscribed_at).toLocaleDateString();
    const lastEmailSent = subscriber.last_email_sent
      ? new Date(subscriber.last_email_sent).toLocaleDateString()
      : "Never";

    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-sky-500/50 transition-all duration-300 overflow-hidden group">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-sky-900/50 to-purple-900/50 flex items-center justify-center">
                  <User className="w-6 h-6 text-sky-400" />
                </div>
                {subscriber.confirmed && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-white truncate max-w-45">
                  {subscriber.email}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={subscriber.status} />
                  <SourceBadge source={subscriber.source} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSubscribers.includes(subscriber.id)}
                onChange={() => handleSelectSubscriber(subscriber.id)}
                className="w-5 h-5 rounded border-gray-600 bg-gray-900/50 text-sky-500 focus:ring-sky-500 focus:ring-offset-gray-900"
              />
              <button className="p-2 cursor-pointer hover:bg-gray-700/50 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Joined</div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-sky-400" />
                  <span className="font-medium text-white">{joinedDate}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-gray-400">Engagement</div>
                <EngagementBadge score={subscriber.engagement_score} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Open Rate</div>
                <div className="flex items-center gap-2">
                  <MailCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium text-white">
                    {subscriber.open_rate || 0}%
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-gray-400">Last Email</div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="font-medium text-white text-sm">
                    {lastEmailSent}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSendEmail(subscriber)}
              className="flex-1 py-2.5 bg-sky-600 cursor-pointer hover:bg-sky-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Email
            </button>
            <button
              onClick={() => {
                setSubscriberToDelete(subscriber);
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

  // Subscriber List Item Component (List View)
  const SubscriberListItem = ({ subscriber }) => {
    const joinedDate = new Date(subscriber.subscribed_at).toLocaleDateString();

    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-sky-500/50 transition-all duration-300 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedSubscribers.includes(subscriber.id)}
                onChange={() => handleSelectSubscriber(subscriber.id)}
                className="w-5 h-5 rounded border-gray-600 bg-gray-900/50 text-sky-500 focus:ring-sky-500 focus:ring-offset-gray-900"
              />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-sky-900/50 to-purple-900/50 flex items-center justify-center">
                  <User className="w-5 h-5 text-sky-400" />
                </div>
                {subscriber.confirmed && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-white truncate max-w-62.5">
                  {subscriber.email}
                </h3>
                <div className="flex items-center gap-2">
                  <StatusBadge status={subscriber.status} />
                  <SourceBadge source={subscriber.source} />
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  Joined {joinedDate}
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  {subscriber.engagement_score}% engagement
                </div>
                <div className="flex items-center gap-1">
                  <MailCheck className="w-4 h-4" />
                  {subscriber.open_rate || 0}% open rate
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSendEmail(subscriber)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 cursor-pointer text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Email
            </button>
            <button
              onClick={() => {
                setSubscriberToDelete(subscriber);
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

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => {
    if (!subscriberToDelete) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
              <h2 className="text-xl font-bold text-white">
                Delete Subscriber
              </h2>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete subscriber{" "}
              <span className="font-semibold text-white">
                {subscriberToDelete.email}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSubscriberToDelete(null);
                }}
                className="px-4 py-2 border cursor-pointer border-gray-600 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubscriber}
                className="px-4 py-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete Subscriber
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Email Campaign Modal
  const EmailCampaignModal = () => {
    if (!showEmailModal && !showBulkEmailModal) return null;

    const isBulk = showBulkEmailModal;
    const title = isBulk ? "Create Email Campaign" : "Send Email to Subscriber";
    const recipientCount = isBulk
      ? emailCampaign.sendTo === "all"
        ? filteredSubscribers.length
        : selectedSubscribers.length
      : 1;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setShowBulkEmailModal(false);
                }}
                className="p-2 hover:bg-gray-700/50 cursor-pointer rounded-lg"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Recipient Info */}
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white mb-1">Recipients</h3>
                    <p className="text-sm text-gray-400">
                      {isBulk
                        ? `${recipientCount} subscriber${
                            recipientCount !== 1 ? "s" : ""
                          } selected`
                        : selectedSubscriber?.email}
                    </p>
                  </div>
                  <div className="text-sky-400">
                    <Send className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {isBulk && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={emailCampaign.campaignName}
                    onChange={(e) =>
                      setEmailCampaign((prev) => ({
                        ...prev,
                        campaignName: e.target.value,
                      }))
                    }
                    placeholder="Summer Promotion 2024"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject Line *
                </label>
                <input
                  type="text"
                  value={emailCampaign.subject}
                  onChange={(e) =>
                    setEmailCampaign((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  placeholder="Exciting news from Royal Moss Hotel!"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preview Text
                </label>
                <input
                  type="text"
                  value={emailCampaign.previewText}
                  onChange={(e) =>
                    setEmailCampaign((prev) => ({
                      ...prev,
                      previewText: e.target.value,
                    }))
                  }
                  placeholder="Check out our latest offers and updates..."
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Content *
                </label>
                <div className="border border-gray-700 rounded-xl overflow-hidden">
                  <div className="bg-gray-900/50 px-4 py-3 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                  </div>
                  <textarea
                    value={emailCampaign.message}
                    onChange={(e) =>
                      setEmailCampaign((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    rows="12"
                    placeholder="Write your email content here..."
                    className="w-full px-4 py-4 bg-gray-900/30 text-white resize-none focus:outline-none"
                    required
                  />
                </div>
              </div>

              {isBulk && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Send To
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        emailCampaign.sendTo === "all"
                          ? "bg-sky-900/30 border-sky-600 text-sky-400"
                          : "bg-gray-900/30 border-gray-700 text-gray-400 hover:bg-gray-800/50"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={emailCampaign.sendTo === "all"}
                        onChange={() =>
                          setEmailCampaign((prev) => ({
                            ...prev,
                            sendTo: "all",
                          }))
                        }
                        className="hidden"
                      />
                      <Users className="w-5 h-5" />
                      <div>
                        <div className="font-medium">All Subscribers</div>
                        <div className="text-sm opacity-75">
                          {filteredSubscribers.length} recipients
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        emailCampaign.sendTo === "selected"
                          ? "bg-sky-900/30 border-sky-600 text-sky-400"
                          : "bg-gray-900/30 border-gray-700 text-gray-400 hover:bg-gray-800/50"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={emailCampaign.sendTo === "selected"}
                        onChange={() =>
                          setEmailCampaign((prev) => ({
                            ...prev,
                            sendTo: "selected",
                          }))
                        }
                        className="hidden"
                      />
                      <Target className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Selected Only</div>
                        <div className="text-sm opacity-75">
                          {selectedSubscribers.length} recipients
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Email Preview */}
              <div className="bg-gray-900/50 rounded-xl p-4">
                <h4 className="font-medium text-white mb-3">Preview</h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-400">From:</div>
                    <div className="text-white">
                      Royal Moss Hotel &lt;newsletter@royalmoss.com&gt;
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Subject:</div>
                    <div className="text-white font-medium">
                      {emailCampaign.subject ||
                        "Your email subject will appear here"}
                    </div>
                  </div>
                  {emailCampaign.previewText && (
                    <div>
                      <div className="text-sm text-gray-400">Preview:</div>
                      <div className="text-gray-300 text-sm">
                        {emailCampaign.previewText}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false);
                    setShowBulkEmailModal(false);
                  }}
                  className="px-6 py-3 border cursor-pointer border-gray-600 hover:bg-gray-700/50 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={isBulk ? handleSendBulkEmail : () => {}}
                  disabled={
                    sendingEmail ||
                    !emailCampaign.subject ||
                    !emailCampaign.message
                  }
                  className="px-6 py-3 bg-linear-to-r cursor-pointer from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    `Send Email${
                      isBulk ? ` to ${recipientCount} Subscribers` : ""
                    }`
                  )}
                </button>
              </div>
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
          <p className="text-gray-400">Loading subscribers data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-900 to-black text-white">
      {/* Modals */}
      <DeleteConfirmationModal />
      <EmailCampaignModal />

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
                  Subscribers Management
                </h1>
                <p className="text-sm text-gray-400">
                  Manage newsletter subscribers and send promotional emails
                </p>
              </div>
              <div className="flex lg:justify-end items-center gap-4">
                <button
                  onClick={() => setShowBulkEmailModal(true)}
                  disabled={filteredSubscribers.length === 0}
                  className="flex items-center gap-2 px-5 py-3 cursor-pointer bg-linear-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 disabled:from-gray-700 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  Create Campaign
                </button>

                <button
                  onClick={() => {
                    setSelectedSubscribers([]);
                    setSearchQuery("");
                    setSelectedStatus("all");
                    setSelectedSource("all");
                  }}
                  className="flex items-center gap-2 px-5 py-3 cursor-pointer border border-gray-600 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all duration-300"
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
                label: "Total Subscribers",
                value: stats.totalSubscribers.toString(),
                icon: <Users className="w-6 h-6" />,
                color: "text-sky-400",
                change: `+${stats.newThisMonth} this month`,
              },
              {
                label: "Active Subscribers",
                value: stats.activeSubscribers.toString(),
                icon: <CheckCircle className="w-6 h-6" />,
                color: "text-emerald-400",
                change: `${Math.round(
                  (stats.activeSubscribers / stats.totalSubscribers) * 100
                )}% active`,
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
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-gray-400 mb-1">{stat.label}</p>
                <p className="text-sm text-gray-500">{stat.change}</p>
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
                  placeholder="Search by email address..."
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
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                  >
                    {statusOptions.map((status) => (
                      <option
                        key={status}
                        value={status}
                        className="bg-gray-900 text-white"
                      >
                        {status === "all" ? "All Statuses" : status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Source
                  </label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                  >
                    {sourceOptions.map((source) => (
                      <option
                        key={source}
                        value={source}
                        className="bg-gray-900 text-white"
                      >
                        {source === "all"
                          ? "All Sources"
                          : source.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Count */}
                <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-xl border border-gray-700">
                  <div>
                    <div className="text-sm text-gray-400">Selected</div>
                    <div className="text-lg font-bold text-white">
                      {selectedSubscribers.length}
                    </div>
                  </div>
                  {selectedSubscribers.length > 0 && (
                    <button
                      onClick={() => setShowBulkEmailModal(true)}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Email Selected
                    </button>
                  )}
                </div>
              </div>

              {/* Sort & Actions */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">
                    {filteredSubscribers.length} subscribers found
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Sort by:</span>
                    <button
                      onClick={() => handleSort("subscribed_at")}
                      className={`px-3 py-1.5 rounded-lg cursor-pointer text-sm ${
                        sortBy === "subscribed_at"
                          ? "bg-sky-900/30 text-sky-400"
                          : "text-gray-400 hover:bg-gray-700/50"
                      }`}
                    >
                      Date Joined{" "}
                      {sortBy === "subscribed_at" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </button>
                    <button
                      onClick={() => handleSort("engagement_score")}
                      className={`px-3 py-1.5 rounded-lg cursor-pointer text-sm ${
                        sortBy === "engagement_score"
                          ? "bg-sky-900/30 text-sky-400"
                          : "text-gray-400 hover:bg-gray-700/50"
                      }`}
                    >
                      Engagement{" "}
                      {sortBy === "engagement_score" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </button>
                    <button
                      onClick={() => handleSort("email")}
                      className={`px-3 py-1.5 rounded-lg cursor-pointer text-sm ${
                        sortBy === "email"
                          ? "bg-sky-900/30 text-sky-400"
                          : "text-gray-400 hover:bg-gray-700/50"
                      }`}
                    >
                      Email{" "}
                      {sortBy === "email" && (sortOrder === "asc" ? "↑" : "↓")}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center cursor-pointer gap-2 px-4 py-2.5 border border-gray-600 hover:bg-gray-700/50 rounded-xl transition-colors text-white"
                  >
                    <CheckSquare className="w-4 h-4" />
                    {selectedSubscribers.length === filteredSubscribers.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  <button
                    onClick={fetchSubscribers}
                    className="flex items-center cursor-pointer gap-2 px-4 py-2.5 border border-gray-600 hover:bg-gray-700/50 rounded-xl transition-colors text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Data
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedStatus("all");
                      setSelectedSource("all");
                      setSelectedSubscribers([]);
                    }}
                    className="flex items-center cursor-pointer gap-2 px-4 py-2.5 border border-gray-600 hover:bg-gray-700/50 rounded-xl transition-colors text-white"
                  >
                    <Filter className="w-4 h-4" />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Subscribers List/Grid */}
          <div>
            {viewMode === "list" ? (
              <div className="space-y-4">
                {filteredSubscribers.map((subscriber) => (
                  <SubscriberListItem
                    key={subscriber.id}
                    subscriber={subscriber}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSubscribers.map((subscriber) => (
                  <SubscriberCard key={subscriber.id} subscriber={subscriber} />
                ))}
              </div>
            )}
          </div>

          {/* Empty State */}
          {filteredSubscribers.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800/50 rounded-2xl flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No subscribers found
              </h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your filters or check back later
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStatus("all");
                    setSelectedSource("all");
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
    </div>
  );
}
