import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import prisma from "@/lib/prisma";

// ─── GET: WebSub Verification ────────────────────────────────────────────────
// YouTube's hub sends a GET request to verify we own this callback URL.
// We echo back the `hub.challenge` value to confirm the subscription.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const challenge = searchParams.get("hub.challenge");
  const topic = searchParams.get("hub.topic");

  console.log(`[WebSub] Verification request: mode=${mode}, topic=${topic}`);

  if (mode === "subscribe" && challenge) {
    // Echo back the challenge to confirm subscription
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({ error: "Invalid verification request" }, { status: 400 });
}

// ─── POST: Receive New Video Notification ────────────────────────────────────
// YouTube pushes an Atom XML payload when a new video is uploaded.
// We parse it, verify the HMAC signature, and insert into the database.
export async function POST(req: NextRequest) {
  const secret = process.env.WEBSUB_SECRET;
  const body = await req.text();

  // ── HMAC Verification ──
  if (secret) {
    const signature = req.headers.get("x-hub-signature");
    if (signature) {
      const expectedSig =
        "sha1=" + createHmac("sha1", secret).update(body).digest("hex");

      if (signature !== expectedSig) {
        console.error("[WebSub] HMAC verification failed");
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }
  }

  // ── Parse Atom XML ──
  // Extract the <entry> block (YouTube sends one entry per notification)
  const entryMatch = body.match(/<entry>([\s\S]*?)<\/entry>/);
  if (!entryMatch) {
    // Could be a deletion notification or empty feed — just acknowledge
    console.log("[WebSub] No <entry> found in payload, acknowledging");
    return NextResponse.json({ status: "ok", message: "No entry to process" });
  }

  const entry = entryMatch[1];

  // Extract videoId and title from within the entry
  const videoIdMatch = entry.match(/<yt:videoId>(.+?)<\/yt:videoId>/);
  const titleMatch = entry.match(/<title>(.+?)<\/title>/);

  if (!videoIdMatch) {
    console.error("[WebSub] Could not extract videoId from entry");
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }

  const videoId = videoIdMatch[1].trim();
  const title = titleMatch ? titleMatch[1].trim() : `YouTube Video ${videoId}`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  console.log(`[WebSub] New video notification: "${title}" (${videoId})`);

  // ── Check for Duplicates ──
  const existing = await prisma.video.findFirst({
    where: { embedUrl },
  });

  if (existing) {
    console.log(`[WebSub] Video already exists, skipping: ${videoId}`);
    return NextResponse.json({ status: "ok", message: "Already exists" });
  }

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

  // ── Insert into Database ──
  try {
    const video = await prisma.video.create({
      data: {
        videoNumber: nextNumber,
        title,
        description: "",
        platform: "YouTube",
        embedUrl,
        tags: JSON.stringify([]),
        pinned: false,
      },
    });

    console.log(`[WebSub] ✅ Video added: #${nextNumber} "${title}"`);
    return NextResponse.json({
      status: "ok",
      video: { id: video.id, videoNumber: nextNumber, title },
    });
  } catch (error) {
    console.error("[WebSub] Failed to insert video:", error);
    return NextResponse.json({ error: "Failed to save video" }, { status: 500 });
  }
}
