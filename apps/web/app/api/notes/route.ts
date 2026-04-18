import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@plugin11/db";

/**
 * GET /api/notes?notebookId=xxx
 *
 * Returns all notes in a notebook.
 * Verifies workspace membership through notebook relationship.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { searchParams } = new URL(request.url);
  const notebookId = searchParams.get("notebookId");
  if (!notebookId)
    return NextResponse.json(
      { error: "notebookId query param is required" },
      { status: 400 }
    );

  const notebook = await prisma.notebook.findUnique({
    where: { id: notebookId },
    select: { workspaceId: true },
  });
  if (!notebook)
    return NextResponse.json({ error: "Notebook not found" }, { status: 404 });

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: notebook.workspaceId, userId },
    },
  });
  if (!member)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const notes = await prisma.note.findMany({
    where: { notebookId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ notes });
}

/**
 * POST /api/notes
 *
 * Creates a new note in a notebook.
 * Body: { notebookId, title, status?, tags?, visibilityTier? }
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const body = await request.json();
  const { notebookId, title, status, tags, visibilityTier } = body;

  if (!notebookId || !title)
    return NextResponse.json(
      { error: "notebookId and title are required" },
      { status: 400 }
    );

  const notebook = await prisma.notebook.findUnique({
    where: { id: notebookId },
    select: { workspaceId: true },
  });
  if (!notebook)
    return NextResponse.json({ error: "Notebook not found" }, { status: 404 });

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: notebook.workspaceId, userId },
    },
  });
  if (!member || member.role === "viewer")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const lastNote = await prisma.note.findFirst({
    where: { notebookId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const yjsDocId = `yjs-${notebookId}-${crypto.randomUUID()}`;

  const note = await prisma.note.create({
    data: {
      notebookId,
      title: title.trim(),
      yjsDocId,
      status: status ?? "idea",
      tags: tags ?? [],
      order: (lastNote?.order ?? 0) + 1,
      visibilityTier: visibilityTier ?? "intermediate",
      createdById: userId,
    },
  });

  return NextResponse.json(note, { status: 201 });
}

/**
 * PATCH /api/notes?noteId=xxx
 *
 * Updates note metadata (title, status, tags).
 * Body: { title?, status?, tags? }
 */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get("noteId");
  if (!noteId)
    return NextResponse.json({ error: "noteId is required" }, { status: 400 });

  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { notebook: { select: { workspaceId: true } } },
  });
  if (!note)
    return NextResponse.json({ error: "Note not found" }, { status: 404 });

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: note.notebook.workspaceId,
        userId,
      },
    },
  });
  if (!member || member.role === "viewer")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { title, status, tags } = body;

  const updated = await prisma.note.update({
    where: { id: noteId },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(status !== undefined && { status }),
      ...(tags !== undefined && { tags }),
    },
  });

  return NextResponse.json(updated);
}
