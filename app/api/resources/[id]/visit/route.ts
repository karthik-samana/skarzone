import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/resources/[id]/visit - Increment visit count
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const link = await prisma.resourceLink.update({
    where: { id },
    data: { visitCount: { increment: 1 } },
  });

  return NextResponse.json({ visitCount: link.visitCount });
}
