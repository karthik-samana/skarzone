import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/videos - Paginated list with filtering
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const take = parseInt(searchParams.get("take") || "9");
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");
  const videoNumber = searchParams.get("videoNumber");

  const where: Record<string, unknown> = {};

  if (tag) {
    where.tags = { contains: tag };
  }
  if (videoNumber) {
    where.videoNumber = { contains: videoNumber };
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { videoNumber: { contains: search } },
      { tags: { contains: search } },
    ];
  }

  const videos = await prisma.video.findMany({
    where,
    take: take + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  const hasMore = videos.length > take;
  const data = hasMore ? videos.slice(0, take) : videos;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  const total = await prisma.video.count({ where });

  // Parse tags from JSON string
  const parsed = data.map((v) => ({
    ...v,
    tags: JSON.parse(v.tags || "[]"),
  }));

  return NextResponse.json({ data: parsed, nextCursor, total });
}

// POST /api/videos - Create new video (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { videoNumber, title, description, platform, embedUrl, tags, pinned } = body;

  if (!videoNumber || !title || !embedUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const video = await prisma.video.create({
    data: {
      videoNumber,
      title,
      description: description || "",
      platform: platform || "YouTube",
      embedUrl,
      tags: JSON.stringify(tags || []),
      pinned: pinned || false,
    },
  });

  return NextResponse.json({ ...video, tags: JSON.parse(video.tags) }, { status: 201 });
}
