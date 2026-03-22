"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VideoCard } from "./VideoCard";
import { SkeletonCard } from "./Skeleton";
import { VideoWithResources } from "@/types";

export function VideoFeed() {
  const [videos, setVideos] = useState<VideoWithResources[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const fetchVideos = useCallback(
    async (reset = false) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (!reset && cursor) params.set("cursor", cursor);
      if (search) params.set("search", search);
      if (activeTag) params.set("tag", activeTag);
      params.set("take", "9");

      try {
        const res = await fetch(`/api/videos?${params}`);
        const json = await res.json();

        if (reset) {
          setVideos(json.data);
        } else {
          setVideos((prev) => [...prev, ...json.data]);
        }
        setCursor(json.nextCursor);
        setHasMore(!!json.nextCursor);

        // Collect all unique tags
        const tags = json.data.flatMap((v: VideoWithResources) => v.tags);
        setAllTags((prev) => {
          const combined = new Set([...prev, ...tags]);
          return Array.from(combined);
        });
      } catch (err) {
        console.error("Failed to fetch videos:", err);
      } finally {
        setLoading(false);
      }
    },
    [cursor, search, activeTag]
  );

  // Initial load and when filters change
  useEffect(() => {
    setCursor(null);
    setHasMore(true);
    fetchVideos(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeTag]);

  // Infinite scroll observer
  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          fetchVideos(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchVideos]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  };

  // Auto-focus search input when filter bar opens
  useEffect(() => {
    if (showFilters && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showFilters]);

  const handleTagSelect = (tag: string | null) => {
    setActiveTag(tag);
    setDropdownOpen(false);
  };

  return (
    <section className="max-w-6xl mx-auto px-6 pb-20">
      {/* Search Toggle Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-8"
      >
        {!showFilters && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)]
                       bg-[var(--color-surface)] hover:border-accent text-[var(--color-muted)]
                       hover:text-accent transition-all text-sm font-[var(--font-clean)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            Search & Filter
          </motion.button>
        )}

        {/* Expandable Filter Bar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: "hidden" }}
              animate={{ opacity: 1, height: "auto", overflow: "visible" }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-4"
            >
              <div className="flex gap-3 items-start">
                {/* Search Input */}
                <div className="relative flex-1">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by video number, tags, keywords..."
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]
                               focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30
                               text-sm font-[var(--font-clean)] placeholder:text-[var(--color-muted)] transition-all"
                  />
                  <button
                    onClick={() => setShowFilters(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-accent transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>

                {/* Tag Dropdown */}
                {allTags.length > 0 && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-[var(--font-clean)]
                                  transition-all whitespace-nowrap ${
                                    activeTag
                                      ? "bg-accent text-white dark:text-black border-accent font-medium"
                                      : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-accent"
                                  }`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
                      </svg>
                      {activeTag || "All Categories"}
                      <motion.svg
                        animate={{ rotate: dropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </motion.svg>
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute right-0 mt-2 w-56 max-h-64 overflow-y-auto rounded-xl border border-[var(--color-border)]
                                     bg-[var(--color-surface)] dropdown-shadow z-50"
                        >
                          <div className="p-1.5">
                            <button
                              onClick={() => handleTagSelect(null)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-[var(--font-clean)]
                                          transition-all ${
                                            !activeTag
                                              ? "bg-accent/10 text-accent font-medium"
                                              : "text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-foreground)]"
                                          }`}
                            >
                              All Categories
                            </button>
                            {allTags.map((tag) => (
                              <button
                                key={tag}
                                onClick={() => handleTagSelect(tag)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-[var(--font-clean)]
                                            transition-all ${
                                              activeTag === tag
                                                ? "bg-accent/10 text-accent font-medium"
                                                : "text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-foreground)]"
                                            }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Video Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${search}-${activeTag}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {videos.map((video, i) => (
            <VideoCard
              key={video.id}
              {...video}
              index={i}
            />
          ))}
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={`skel-${i}`} />
            ))}
        </motion.div>
      </AnimatePresence>

      {/* No results */}
      {!loading && videos.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-[var(--color-muted)] text-lg">No videos found</p>
          <p className="text-[var(--color-muted)] text-sm mt-2">Try a different search or filter</p>
        </motion.div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={observerRef} className="h-10" />
    </section>
  );
}
