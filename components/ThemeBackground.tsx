"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";

function Stars() {
  // Generate star positions once on mount (deterministic via useMemo with empty seed)
  const stars = useMemo(() => {
    const result = [];
    for (let i = 0; i < 80; i++) {
      result.push({
        id: i,
        left: `${(i * 17.3 + i * i * 0.7) % 100}%`,
        top: `${(i * 13.7 + i * i * 0.3) % 100}%`,
        size: i % 3 === 0 ? 2 : 1,
        delay: `${(i * 0.5) % 5}s`,
        duration: `${2 + (i % 4)}s`,
      });
    }
    return result;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white star-twinkle"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  );
}

function CityBuildings() {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
      <svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="w-full h-[120px] sm:h-[160px] md:h-[200px]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Far background buildings - darker, smaller */}
        <g opacity="0.15" fill="currentColor" className="text-white">
          <rect x="50" y="100" width="30" height="120" />
          <rect x="90" y="80" width="25" height="140" />
          <rect x="130" y="110" width="35" height="110" />
          <rect x="200" y="70" width="20" height="150" />
          <rect x="230" y="90" width="40" height="130" />
          <rect x="300" y="60" width="25" height="160" />
          <rect x="340" y="100" width="30" height="120" />
          <rect x="400" y="75" width="35" height="145" />
          <rect x="460" y="95" width="20" height="125" />
          <rect x="500" y="65" width="30" height="155" />
          <rect x="560" y="85" width="25" height="135" />
          <rect x="610" y="105" width="35" height="115" />
          <rect x="670" y="55" width="28" height="165" />
          <rect x="720" y="80" width="22" height="140" />
          <rect x="770" y="100" width="35" height="120" />
          <rect x="830" y="70" width="25" height="150" />
          <rect x="880" y="90" width="30" height="130" />
          <rect x="940" y="60" width="40" height="160" />
          <rect x="1000" y="85" width="20" height="135" />
          <rect x="1040" y="75" width="35" height="145" />
          <rect x="1100" y="95" width="28" height="125" />
          <rect x="1150" y="65" width="25" height="155" />
          <rect x="1200" y="100" width="30" height="120" />
          <rect x="1260" y="80" width="35" height="140" />
          <rect x="1320" y="70" width="25" height="150" />
          <rect x="1370" y="90" width="40" height="130" />
        </g>

        {/* Mid buildings - slightly brighter */}
        <g opacity="0.25" fill="currentColor" className="text-white">
          <rect x="20" y="130" width="40" height="90" />
          <rect x="70" y="110" width="35" height="110" />
          <rect x="120" y="140" width="45" height="80" />
          <rect x="180" y="100" width="30" height="120" />
          <rect x="250" y="120" width="50" height="100" />
          <rect x="320" y="90" width="35" height="130" />
          <rect x="380" y="130" width="40" height="90" />
          <rect x="440" y="105" width="30" height="115" />
          <rect x="490" y="125" width="45" height="95" />
          <rect x="560" y="95" width="35" height="125" />
          <rect x="620" y="140" width="40" height="80" />
          <rect x="690" y="110" width="30" height="110" />
          <rect x="740" y="100" width="45" height="120" />
          <rect x="800" y="130" width="35" height="90" />
          <rect x="860" y="115" width="40" height="105" />
          <rect x="920" y="95" width="50" height="125" />
          <rect x="990" y="120" width="35" height="100" />
          <rect x="1050" y="105" width="40" height="115" />
          <rect x="1110" y="135" width="30" height="85" />
          <rect x="1160" y="110" width="45" height="110" />
          <rect x="1230" y="125" width="35" height="95" />
          <rect x="1290" y="95" width="40" height="125" />
          <rect x="1360" y="120" width="50" height="100" />
        </g>

        {/* Window lights scattered on buildings */}
        <g opacity="0.5" fill="#e5e5e5">
          {/* Building windows - tiny dots of light */}
          <rect x="95" y="88" width="2" height="2" rx="0.5" />
          <rect x="102" y="95" width="2" height="2" rx="0.5" />
          <rect x="235" y="98" width="2" height="2" rx="0.5" />
          <rect x="245" y="108" width="2" height="2" rx="0.5" />
          <rect x="308" y="70" width="2" height="2" rx="0.5" />
          <rect x="312" y="80" width="2" height="2" rx="0.5" />
          <rect x="410" y="85" width="2" height="2" rx="0.5" />
          <rect x="415" y="95" width="2" height="2" rx="0.5" />
          <rect x="510" y="75" width="2" height="2" rx="0.5" />
          <rect x="515" y="85" width="2" height="2" rx="0.5" />
          <rect x="680" y="65" width="2" height="2" rx="0.5" />
          <rect x="684" y="78" width="2" height="2" rx="0.5" />
          <rect x="950" y="72" width="2" height="2" rx="0.5" />
          <rect x="955" y="85" width="2" height="2" rx="0.5" />
          <rect x="1055" y="82" width="2" height="2" rx="0.5" />
          <rect x="1060" y="95" width="2" height="2" rx="0.5" />
          <rect x="1160" y="75" width="2" height="2" rx="0.5" />
          <rect x="1165" y="88" width="2" height="2" rx="0.5" />
          <rect x="1330" y="80" width="2" height="2" rx="0.5" />
          <rect x="1335" y="92" width="2" height="2" rx="0.5" />
        </g>
      </svg>
    </div>
  );
}

function Sun() {
  return (
    <div className="absolute top-16 right-12 sm:top-20 sm:right-20 pointer-events-none">
      {/* Outer glow */}
      <div className="absolute inset-0 -m-8 rounded-full bg-yellow-300/20 blur-2xl sun-pulse" />
      {/* Mid glow */}
      <div className="absolute inset-0 -m-4 rounded-full bg-yellow-400/30 blur-xl" />
      {/* Sun body */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 shadow-[0_0_60px_rgba(250,204,21,0.4)]" />
      {/* Sun rays */}
      <div className="absolute inset-0 sun-rays">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-0.5 bg-gradient-to-t from-yellow-400/40 to-transparent"
            style={{
              height: "40px",
              transformOrigin: "bottom center",
              transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function ThemeBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {isDark ? (
        <>
          {/* Dark sky gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090b] via-[#0c0e14] to-[#09090b]" />
          <Stars />
          <CityBuildings />
        </>
      ) : (
        <>
          {/* Light sky gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50/50" />
          <Sun />
          {/* Subtle clouds */}
          <div className="absolute top-32 left-[10%] w-48 h-12 bg-gray-200/40 rounded-full blur-xl cloud-drift" />
          <div className="absolute top-48 left-[60%] w-64 h-14 bg-gray-200/30 rounded-full blur-xl cloud-drift-slow" />
          <div className="absolute top-24 left-[35%] w-36 h-10 bg-gray-200/35 rounded-full blur-lg cloud-drift" style={{ animationDelay: "3s" }} />
        </>
      )}
    </div>
  );
}
