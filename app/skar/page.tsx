"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastProvider, useToast } from "@/components/Toast";
import { VideoType, ResourceLinkType } from "@/types";

function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToast } = useToast();

  const [stats, setStats] = useState({ videoCount: 0, resourceCount: 0, totalViews: 0, totalVisits: 0 });
  const [videos, setVideos] = useState<(VideoType & { resources: ResourceLinkType[] })[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoType | null>(null);
  const [editingLink, setEditingLink] = useState<ResourceLinkType | null>(null);
  const [linkVideoId, setLinkVideoId] = useState<string>("");

  // Form states
  const [videoForm, setVideoForm] = useState({
    videoNumber: "",
    title: "",
    description: "",
    platform: "YouTube",
    embedUrl: "",
    tags: "",
    pinned: false,
  });
  const [linkForm, setLinkForm] = useState({
    title: "",
    url: "",
    description: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, videosRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/resources?take=100"),
      ]);
      const statsData = await statsRes.json();
      const videosData = await videosRes.json();
      setStats(statsData);
      setVideos(videosData.data);
    } catch {
      addToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/skar/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router, fetchData]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  // Video CRUD
  const handleSaveVideo = async () => {
    const tags = videoForm.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const body = { ...videoForm, tags };

    try {
      if (editingVideo) {
        await fetch(`/api/videos/${editingVideo.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        addToast("Video updated!");
      } else {
        await fetch("/api/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        addToast("Video added!");
      }
      closeVideoModal();
      fetchData();
    } catch {
      addToast("Failed to save video", "error");
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Delete this video and all its resources?")) return;
    try {
      await fetch(`/api/videos/${id}`, { method: "DELETE" });
      addToast("Video deleted!");
      fetchData();
    } catch {
      addToast("Failed to delete video", "error");
    }
  };

  const openEditVideo = (video: VideoType) => {
    setEditingVideo(video);
    setVideoForm({
      videoNumber: video.videoNumber,
      title: video.title,
      description: video.description,
      platform: video.platform,
      embedUrl: video.embedUrl,
      tags: video.tags.join(", "),
      pinned: video.pinned,
    });
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setEditingVideo(null);
    setVideoForm({
      videoNumber: "",
      title: "",
      description: "",
      platform: "YouTube",
      embedUrl: "",
      tags: "",
      pinned: false,
    });
  };

  // Link CRUD
  const handleSaveLink = async () => {
    try {
      if (editingLink) {
        await fetch(`/api/resources/${editingLink.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(linkForm),
        });
        addToast("Link updated!");
      } else {
        await fetch("/api/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...linkForm, videoId: linkVideoId }),
        });
        addToast("Link added!");
      }
      closeLinkModal();
      fetchData();
    } catch {
      addToast("Failed to save link", "error");
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Delete this link?")) return;
    try {
      await fetch(`/api/resources/${id}`, { method: "DELETE" });
      addToast("Link deleted!");
      fetchData();
    } catch {
      addToast("Failed to delete link", "error");
    }
  };

  const openEditLink = (link: ResourceLinkType) => {
    setEditingLink(link);
    setLinkForm({
      title: link.title,
      url: link.url,
      description: link.description,
    });
    setShowLinkModal(true);
  };

  const openAddLink = (videoId: string) => {
    setLinkVideoId(videoId);
    setShowLinkModal(true);
  };

  const closeLinkModal = () => {
    setShowLinkModal(false);
    setEditingLink(null);
    setLinkVideoId("");
    setLinkForm({ title: "", url: "", description: "" });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold font-[var(--font-display)]">
            <span className="text-accent">Admin</span> Dashboard
          </h1>
          <p className="text-[var(--color-muted)] text-sm mt-1">
            Welcome, {session.user?.name}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm px-4 py-2 rounded-lg border border-[var(--color-border)]
                   text-[var(--color-muted)] hover:border-red-500 hover:text-red-500 transition-all"
        >
          Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Videos", value: stats.videoCount, icon: "🎬" },
          { label: "Resources", value: stats.resourceCount, icon: "🔗" },
          { label: "Video Views", value: stats.totalViews, icon: "👁" },
          { label: "Link Visits", value: stats.totalVisits, icon: "🖱" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-[var(--color-muted)]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Add Video Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Videos & Resources</h2>
        <button
          onClick={() => setShowVideoModal(true)}
          className="px-4 py-2 rounded-lg bg-accent text-white dark:text-black text-sm font-medium
                   hover:bg-accent-glow transition-colors"
        >
          + Add Video
        </button>
      </div>

      {/* Video List */}
      <div className="space-y-4">
        {videos.map((video) => (
          <motion.div
            key={video.id}
            layout
            className="border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] overflow-hidden"
          >
            <div className="p-4 flex items-center gap-4">
              <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2 py-1 rounded">
                #{video.videoNumber}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium truncate">{video.title}</h3>
                <p className="text-xs text-[var(--color-muted)]">{video.platform} • {video.resources.length} links</p>
              </div>
              {video.pinned && (
                <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">Pinned</span>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => openAddLink(video.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)]
                           text-[var(--color-muted)] hover:border-accent hover:text-accent transition-all"
                >
                  + Link
                </button>
                <button
                  onClick={() => openEditVideo(video)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)]
                           text-[var(--color-muted)] hover:border-blue-500 hover:text-blue-500 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteVideo(video.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)]
                           text-[var(--color-muted)] hover:border-red-500 hover:text-red-500 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Resources under this video */}
            {video.resources.length > 0 && (
              <div className="px-4 pb-4 space-y-2">
                {video.resources.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-[var(--color-surface-hover)] text-sm"
                  >
                    <span className="flex-1 truncate text-xs">{link.title}</span>
                    <span className="text-[10px] text-[var(--color-muted)]">{link.visitCount} visits</span>
                    <button
                      onClick={() => openEditLink(link)}
                      className="text-[10px] text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-[10px] text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {videos.length === 0 && !loading && (
        <div className="text-center py-20">
          <p className="text-[var(--color-muted)]">No videos yet. Add your first one!</p>
        </div>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={closeVideoModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[var(--background)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-lg font-bold mb-4">
                {editingVideo ? "Edit Video" : "Add Video"}
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Video Number (e.g., 021)"
                    value={videoForm.videoNumber}
                    onChange={(e) => setVideoForm((f) => ({ ...f, videoNumber: e.target.value }))}
                    className="px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm
                             focus:border-accent focus:outline-none"
                  />
                  <select
                    value={videoForm.platform}
                    onChange={(e) => setVideoForm((f) => ({ ...f, platform: e.target.value }))}
                    className="px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm
                             focus:border-accent focus:outline-none"
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="Instagram">Instagram</option>
                  </select>
                </div>
                <input
                  placeholder="Title"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm
                           focus:border-accent focus:outline-none"
                />
                <textarea
                  placeholder="Description"
                  value={videoForm.description}
                  onChange={(e) => setVideoForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm
                           focus:border-accent focus:outline-none resize-none"
                />
                <input
                  placeholder="Embed URL"
                  value={videoForm.embedUrl}
                  onChange={(e) => setVideoForm((f) => ({ ...f, embedUrl: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm
                           focus:border-accent focus:outline-none"
                />
                <input
                  placeholder="Tags (comma-separated)"
                  value={videoForm.tags}
                  onChange={(e) => setVideoForm((f) => ({ ...f, tags: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm
                           focus:border-accent focus:outline-none"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={videoForm.pinned}
                    onChange={(e) => setVideoForm((f) => ({ ...f, pinned: e.target.checked }))}
                    className="accent-accent"
                  />
                  Pin this video
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeVideoModal}
                  className="flex-1 py-2 rounded-lg border border-[var(--color-border)] text-sm
                           hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVideo}
                  className="flex-1 py-2 rounded-lg bg-accent text-white dark:text-black text-sm font-medium
                           hover:bg-accent-glow transition-colors"
                >
                  {editingVideo ? "Update" : "Add Video"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link Modal */}
      <AnimatePresence>
        {showLinkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={closeLinkModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[var(--background)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-lg font-bold mb-4">
                {editingLink ? "Edit Link" : "Add Link"}
              </h2>
              <div className="space-y-3">
                <input
                  placeholder="Link Title"
                  value={linkForm.title}
                  onChange={(e) => setLinkForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm
                           focus:border-accent focus:outline-none"
                />
                <input
                  placeholder="URL"
                  value={linkForm.url}
                  onChange={(e) => setLinkForm((f) => ({ ...f, url: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm
                           focus:border-accent focus:outline-none"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={linkForm.description}
                  onChange={(e) => setLinkForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm
                           focus:border-accent focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeLinkModal}
                  className="flex-1 py-2 rounded-lg border border-[var(--color-border)] text-sm
                           hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLink}
                  className="flex-1 py-2 rounded-lg bg-accent text-white dark:text-black text-sm font-medium
                           hover:bg-accent-glow transition-colors"
                >
                  {editingLink ? "Update" : "Add Link"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ToastProvider>
      <AdminDashboard />
    </ToastProvider>
  );
}
