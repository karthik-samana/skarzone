"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VideoCard } from "./VideoCard";
import { SkeletonCard } from "./Skeleton";
import { VideoType } from "@/types";

export function VideoFeed() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const observerRef = useRef<HTMLDivElement>(null);
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
        const tags = json.data.flatMap((v: VideoType) => v.tags);
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

  const handleSearch = (value: string) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  };

  return (
    <section className="max-w-6xl mx-auto px-6 pb-20">
      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-8 space-y-4"
      >
        <div className="relative">
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
            type="text"
            placeholder="Search by video number, tags, keywords..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]
                       focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30
                       text-sm font-[var(--font-clean)] placeholder:text-[var(--color-muted)] transition-all"
          />
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all font-[var(--font-clean)] ${
                !activeTag
                  ? "bg-accent text-white dark:text-black border-accent font-medium"
                  : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-accent"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all font-[var(--font-clean)] ${
                  activeTag === tag
                    ? "bg-accent text-white dark:text-black border-accent font-medium"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-accent"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
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
