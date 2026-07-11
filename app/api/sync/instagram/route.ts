import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ─── POST: Add Instagram Post/Reel via Shared URL ────────────────────────────
// Called from an iOS Shortcut when you share an Instagram post.
// Accepts the Instagram URL, auto-generates videoNumber, and inserts into DB.
export async function POST(req: NextRequest) {
  // ── Auth Check ──
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.replace("Bearer ", "");

    if (bearerToken !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // ── Parse Body ──
  let body: { url?: string; title?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url, title } = body;

  if (!url) {
    return NextResponse.json({ error: "Missing 'url' field" }, { status: 400 });
  }

  // ── Validate Instagram URL ──
  if (!/instagram\.com/i.test(url)) {
    return NextResponse.json(
      { error: "Not a valid Instagram URL" },
      { status: 400 }
    );
  }

  // ── Clean the URL (remove query params/tracking) ──
  const cleanUrl = url.split("?")[0].replace(/\/+$/, "");

  // ── Check for Duplicates ──
  const existing = await prisma.video.findFirst({
    where: { embedUrl: cleanUrl },
  });

  if (existing) {
    return NextResponse.json({
      status: "skipped",
      message: "This post is already on your site",
      video: { id: existing.id, videoNumber: existing.videoNumber, title: existing.title },
    });
  }

  // ── Determine Platform (Reel vs Post) ──
  const isReel = /\/(reel|reels)\//i.test(cleanUrl);
  const platform = isReel ? "Instagram" : "Instagram Post";

  // ── Auto-generate videoNumber ──
  const latestVideo = await prisma.video.findFirst({
    orderBy: { videoNumber: "desc" },
    select: { videoNumber: true },
  });

  let nextNumber = "001";
  if (latestVideo) {
    const num = parseInt(latestVideo.videoNumber, 10);
    if (!isNaN(num)) {
      const padLength = Math.max(latestVideo.videoNumber.length, 3);
      nextNumber = String(num + 1).padStart(padLength, "0");
    }
  }

  // ── Generate Title ──
  const videoTitle = title || `${isReel ? "Instagram Reel" : "Instagram Post"} #${nextNumber}`;

  // ── Insert into Database ──
  try {
    const video = await prisma.video.create({
      data: {
        videoNumber: nextNumber,
        title: videoTitle,
        description: "",
        platform,
        embedUrl: cleanUrl,
        tags: JSON.stringify([]),
        pinned: false,
      },
    });

    console.log(`[Instagram Sync] ✅ Added: #${nextNumber} "${videoTitle}"`);

    return NextResponse.json({
      status: "ok",
      message: `Added to Skar Zone as #${nextNumber}`,
      video: { id: video.id, videoNumber: nextNumber, title: videoTitle },
    });
  } catch (error) {
    console.error("[Instagram Sync] Failed to insert:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
