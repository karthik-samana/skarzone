import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/videos/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const video = await prisma.video.findUnique({
    where: { id },
    include: { resources: { orderBy: { createdAt: "desc" } } },
  });

  if (!video) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...video,
    tags: JSON.parse(video.tags || "[]"),
  });
}

// PUT /api/videos/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { videoNumber, title, description, platform, embedUrl, tags, pinned } = body;

  const video = await prisma.video.update({
    where: { id },
    data: {
      ...(videoNumber && { videoNumber }),
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(platform && { platform }),
      ...(embedUrl && { embedUrl }),
      ...(tags && { tags: JSON.stringify(tags) }),
      ...(pinned !== undefined && { pinned }),
    },
  });

  return NextResponse.json({ ...video, tags: JSON.parse(video.tags) });
}

// DELETE /api/videos/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.video.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
