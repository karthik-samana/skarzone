"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
const TARGET_TEXT = "skar zone";

function useTextScramble(text: string, speed = 40) {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);

  const scramble = useCallback(() => {
    let iteration = 0;
    setDone(false);

    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < iteration) return text[i];
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
      iteration += 1 / 2;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  useEffect(() => {
    const cleanup = scramble();
    // Re-scramble every 6 seconds for a looping effect
    const loop = setInterval(() => scramble(), 6000);
    return () => {
      cleanup();
      clearInterval(loop);
    };
  }, [scramble]);

  return { display, done };
}

export function Hero() {
  const { display, done } = useTextScramble(TARGET_TEXT, 50);

  return (
    <section className="relative py-28 sm:py-36 px-6 overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] rounded-full bg-accent/3 blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-accent/3 blur-[90px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--grid-line-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line-color) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Channel Name with scramble + glitch */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1
            className="text-6xl sm:text-8xl lg:text-9xl font-bold tracking-tighter mb-2
                       font-[var(--font-brand)] glitch-text select-none"
            data-text={done ? TARGET_TEXT : display}
          >
            <span className="text-accent drop-shadow-[0_0_25px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]">
              {display || TARGET_TEXT}
            </span>
          </h1>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="w-24 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-6"
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="text-sm sm:text-base tracking-[0.3em] uppercase text-[var(--color-muted)] mb-10
                     font-[var(--font-display)] text-flicker"
        >
          Tech &bull; Coding &bull; Dev &bull; Experiments
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
          className="flex items-center justify-center gap-4"
        >
          <a
            href="https://www.youtube.com/@skar_zone"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 px-6 py-3 rounded-full
                       bg-[var(--color-surface)] border border-[var(--color-border)]
                       hover:border-accent hover:bg-accent/10
                       transition-all duration-300 text-sm font-medium font-[var(--font-display)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-red-500 group-hover:scale-110 transition-transform">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YouTube
          </a>
          <a
            href="https://www.instagram.com/skar_zone?igsh=YWx2ZmZpZzZ1NjZ5"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 px-6 py-3 rounded-full
                       bg-[var(--color-surface)] border border-[var(--color-border)]
                       hover:border-accent hover:bg-accent/10
                       transition-all duration-300 text-sm font-medium font-[var(--font-display)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-pink-500 group-hover:scale-110 transition-transform">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
            Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
