"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonRow } from "@/components/Skeleton";
import { VideoWithResources, ResourceLinkType } from "@/types";

type SortType = "newest" | "oldest" | "popular";

export default function ResourcesPage() {
  const [videos, setVideos] = useState<VideoWithResources[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortType>("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const fetchResources = useCallback(
    async (reset = false) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (!reset && cursor) params.set("cursor", cursor);
      if (search) params.set("search", search);
      params.set("sort", sort);
      params.set("take", "15");

      try {
        const res = await fetch(`/api/resources?${params}`);
        const json = await res.json();

        if (reset) {
          setVideos(json.data);
        } else {
          setVideos((prev) => [...prev, ...json.data]);
        }
        setCursor(json.nextCursor);
        setHasMore(!!json.nextCursor);
      } catch (err) {
        console.error("Failed to fetch resources:", err);
      } finally {
        setLoading(false);
      }
    },
    [cursor, search, sort]
  );

  useEffect(() => {
    setCursor(null);
    setHasMore(true);
    fetchResources(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          fetchResources(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchResources]);

  const handleSearch = (value: string) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  };

  const handleVisit = async (link: ResourceLinkType) => {
    fetch(`/api/resources/${link.id}/visit`, { method: "POST" });
    window.open(link.url, "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2 font-[var(--font-display)]">
          Resource <span className="text-accent">Vault</span>
        </h1>
        <p className="text-[var(--color-muted)] mb-8 font-[var(--font-clean)]">
          Links, tools, and resources from every video — all in one place.
        </p>
      </motion.div>

      {/* Search + Sort */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 mb-8"
      >
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
            type="text"
            placeholder="Search by video number, tags, keywords..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]
                       focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30
                       text-sm font-[var(--font-clean)] placeholder:text-[var(--color-muted)] transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(["newest", "oldest", "popular"] as SortType[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`text-xs px-4 py-2 rounded-lg border transition-all capitalize font-[var(--font-clean)] ${
                sort === s
                  ? "bg-accent text-white dark:text-black border-accent font-medium"
                  : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-accent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Resource Rows */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {videos.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <div
                onClick={() => setExpandedId(expandedId === video.id ? null : video.id)}
                className={`border rounded-lg bg-[var(--color-surface)] cursor-pointer transition-all
                           hover:border-accent ${
                             expandedId === video.id
                               ? "border-accent dark:glow-accent"
                               : "border-[var(--color-border)]"
                           }`}
              >
                {/* Row Header */}
                <div className="flex items-center gap-4 p-4">
                  <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2 py-1 rounded shrink-0">
                    #{video.videoNumber}
                  </span>
                  <h3 className="flex-1 text-sm font-medium truncate font-[var(--font-clean)]">{video.title}</h3>
                  <div className="hidden sm:flex gap-1">
                    {video.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-surface-hover)] text-[var(--color-muted)] dark:text-[#d4d4d8]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-muted)]">
                      {video.resources.length} link{video.resources.length !== 1 ? "s" : ""}
                    </span>
                    <motion.svg
                      animate={{ rotate: expandedId === video.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </motion.svg>
                  </div>
                </div>

                {/* Expanded Resources */}
                <AnimatePresence>
                  {expandedId === video.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 border-t border-[var(--color-border)]">
                        {video.resources.length === 0 ? (
                          <p className="text-sm text-[var(--color-muted)] py-3">
                            No resources yet for this video.
                          </p>
                        ) : (
                          <div className="space-y-2 mt-3">
                            {video.resources.map((link) => (
                              <div
                                key={link.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVisit(link);
                                }}
                                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface-hover)]
                                         hover:bg-accent/10 cursor-pointer transition-all group"
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
                                  className="text-[var(--color-muted)] group-hover:text-accent shrink-0"
                                >
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                  <polyline points="15 3 21 3 21 9" />
                                  <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">
                                    {link.title}
                                  </p>
                                  {link.description && (
                                    <p className="text-xs text-[var(--color-muted)] truncate">
                                      {link.description}
                                    </p>
                                  )}
                                </div>
                                <span className="text-[10px] text-[var(--color-muted)] shrink-0">
                                  {link.visitCount} visits
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading &&
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={`skel-${i}`} />)}
      </div>

      {!loading && videos.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-[var(--color-muted)] text-lg">No resources found</p>
          <p className="text-[var(--color-muted)] text-sm mt-2">Try a different search term</p>
        </motion.div>
      )}

      <div ref={observerRef} className="h-10" />
    </div>
  );
}
