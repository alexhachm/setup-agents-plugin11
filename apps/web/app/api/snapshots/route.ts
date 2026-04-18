import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@plugin11/db";

/**
 * GET /api/snapshots?noteId=xxx
 *
 * Lists snapshots for a note, newest first.
 * Excludes the yjsState binary blob from the list response
 * for performance — fetch the full blob via GET /api/snapshots/[id]
 * when restoring.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const noteId = request.nextUrl.searchParams.get("noteId");
  if (!noteId)
    return NextResponse.json({ error: "noteId is required" }, { status: 400 });

  // Verify access: note → notebook → workspace membership
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { notebook: { select: { workspaceId: true } } },
  });
  if (!note)
    return NextResponse.json({ error: "Note not found" }, { status: 404 });

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: note.notebook.workspaceId, userId },
    },
  });
  if (!member)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const snapshots = await prisma.snapshot.findMany({
    where: { noteId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      noteId: true,
      trigger: true,
      description: true,
      createdById: true,
      createdAt: true,
      // yjsState excluded intentionally — too large for list responses
    },
  });

  return NextResponse.json({ snapshots });
}

/**
 * POST /api/snapshots
 *
 * Creates a new snapshot. Accepts the Yjs state as a number array
 * (JSON-serialised Uint8Array from the client).
 * Body: { noteId, trigger, description?, yjsState: number[] }
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  try {
    const body = await request.json();
    const { noteId, trigger, description, yjsState } = body;

    if (!noteId || !trigger)
      return NextResponse.json(
        { error: "noteId and trigger are required" },
        { status: 400 }
      );

    // Verify access
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { notebook: { select: { workspaceId: true } } },
    });
    if (!note)
      return NextResponse.json({ error: "Note not found" }, { status: 404 });

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId: note.notebook.workspaceId, userId },
      },
    });
    if (!member || member.role === "viewer")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const snapshot = await prisma.snapshot.create({
      data: {
        noteId,
        trigger,
        description: description ?? "",
        createdById: userId,
        yjsState: Buffer.from(yjsState ?? []),
      },
    });

    // Return metadata only — not the binary blob
    return NextResponse.json(
      {
        id: snapshot.id,
        noteId: snapshot.noteId,
        trigger: snapshot.trigger,
        description: snapshot.description,
        createdById: snapshot.createdById,
        createdAt: snapshot.createdAt,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create snapshot" },
      { status: 500 }
    );
  }
}
