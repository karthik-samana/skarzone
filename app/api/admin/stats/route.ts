import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/stats
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [videoCount, resourceCount, totalViews, totalVisits] = await Promise.all([
    prisma.video.count(),
    prisma.resourceLink.count(),
    prisma.video.aggregate({ _sum: { viewCount: true } }),
    prisma.resourceLink.aggregate({ _sum: { visitCount: true } }),
  ]);

  return NextResponse.json({
    videoCount,
    resourceCount,
    totalViews: totalViews._sum.viewCount || 0,
    totalVisits: totalVisits._sum.visitCount || 0,
  });
}
