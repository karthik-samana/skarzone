"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ResourceLinkType } from "@/types";

interface VideoCardProps {
  id: string;
  videoNumber: string;
  title: string;
  description: string;
  platform: string;
  embedUrl: string;
  tags: string[];
  pinned?: boolean;
  index: number;
  resources?: ResourceLinkType[];
}

function isInstagramUrl(url: string) {
  return /instagram\.com/i.test(url);
}

export function VideoCard({
  videoNumber,
  title,
  description,
  platform,
  embedUrl,
  tags,
  pinned,
  index,
  resources,
}: VideoCardProps) {
  const [loaded, setLoaded] = useState(false);
  const isIG = isInstagramUrl(embedUrl);

  const handleVisit = (e: React.MouseEvent, link: ResourceLinkType) => {
    e.stopPropagation();
    fetch(`/api/resources/${link.id}/visit`, { method: "POST" });
    window.open(link.url, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className="group relative rounded-xl overflow-hidden border border-[var(--color-border)]
                 bg-[var(--color-surface)] hover:border-accent
                 dark:hover:glow-accent transition-all duration-300"
    >
      {pinned && (
        <div className="absolute top-3 right-3 z-10 bg-accent text-white dark:text-black text-xs font-bold px-2 py-1 rounded-full">
          PINNED
        </div>
      )}

      {/* Embed / IG Fallback */}
      <div className="relative aspect-video bg-black/5">
        {isIG ? (
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3
                       bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]
                       cursor-pointer transition-transform hover:scale-[1.02]"
          >
            {/* Instagram icon */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="white" stroke="none" />
            </svg>
            <span className="text-white text-sm font-semibold tracking-wide drop-shadow-md">
              Watch on Instagram
            </span>
            {/* Play triangle */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="white"
              className="opacity-80"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </a>
        ) : (
          <>
            {!loaded && <div className="absolute inset-0 skeleton" />}
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              onLoad={() => setLoaded(true)}
              className={`w-full h-full ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
            />
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
            #{videoNumber}
          </span>
          <span className="text-xs text-[var(--color-muted)] capitalize">
            {platform}
          </span>
        </div>
        <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2 group-hover:text-accent transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-[var(--color-muted)] line-clamp-2 mb-3">
            {description}
          </p>
        )}
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-surface-hover)] text-[var(--color-muted)] dark:text-[#d4d4d8]"
            >
              {tag}
            </span>
          ))}
          {tags.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-surface-hover)] text-[var(--color-muted)] dark:text-[#d4d4d8]">
              +{tags.length - 4}
            </span>
          )}
        </div>

        {/* Resource Links */}
        {resources && resources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-1.5 mb-2">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--color-muted)]"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span className="text-[10px] font-medium text-[var(--color-muted)] uppercase tracking-wider">
                Resources
              </span>
            </div>
            <div className="space-y-1">
              {resources.map((link) => (
                <button
                  key={link.id}
                  onClick={(e) => handleVisit(e, link)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left
                             hover:bg-accent/10 transition-all group/link"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[var(--color-muted)] group-hover/link:text-accent shrink-0 transition-colors"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span className="text-xs truncate group-hover/link:text-accent transition-colors">
                    {link.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
