import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT /api/resources/[id]
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
  const { title, url, description } = body;

  const link = await prisma.resourceLink.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(url && { url }),
      ...(description !== undefined && { description }),
    },
  });

  return NextResponse.json(link);
}

// DELETE /api/resources/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.resourceLink.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
