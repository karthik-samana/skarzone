import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/resources - Paginated resources with search
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const take = parseInt(searchParams.get("take") || "15");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";

  const videoWhere: Record<string, unknown> = {};

  if (search) {
    videoWhere.OR = [
      { title: { contains: search } },
      { videoNumber: { contains: search } },
      { tags: { contains: search } },
    ];
  }

  const orderBy: Record<string, string> = {};
  switch (sort) {
    case "popular":
      orderBy.viewCount = "desc";
      break;
    case "oldest":
      orderBy.createdAt = "asc";
      break;
    default:
      orderBy.createdAt = "desc";
  }

  const videos = await prisma.video.findMany({
    where: videoWhere,
    take: take + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy,
    include: {
      resources: {
        orderBy: { visitCount: "desc" },
      },
    },
  });

  const hasMore = videos.length > take;
  const data = hasMore ? videos.slice(0, take) : videos;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  const total = await prisma.video.count({ where: videoWhere });

  const parsed = data.map((v) => ({
    ...v,
    tags: JSON.parse(v.tags || "[]"),
  }));

  return NextResponse.json({ data: parsed, nextCursor, total });
}

// POST /api/resources - Create resource link (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { videoId, title, url, description } = body;

  if (!videoId || !title || !url) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const link = await prisma.resourceLink.create({
    data: {
      videoId,
      title,
      url,
      description: description || "",
    },
  });

  return NextResponse.json(link, { status: 201 });
}
