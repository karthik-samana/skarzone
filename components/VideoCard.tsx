"use client";

import { motion } from "framer-motion";
import { useState } from "react";

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
}: VideoCardProps) {
  const [loaded, setLoaded] = useState(false);
  const isIG = isInstagramUrl(embedUrl);

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
      </div>
    </motion.div>
  );
}
