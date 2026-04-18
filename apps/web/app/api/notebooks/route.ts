import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@plugin11/db";

async function assertWorkspaceAccess(userId: string, workspaceId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!member) throw new Error("Not a workspace member");
  return member;
}

/**
 * GET /api/notebooks?workspaceId=xxx
 *
 * Returns all notebooks in a workspace the user is a member of.
 * Includes note count per notebook.
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId)
    return NextResponse.json(
      { error: "workspaceId query param is required" },
      { status: 400 }
    );

  try {
    await assertWorkspaceAccess(userId, workspaceId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const notebooks = await prisma.notebook.findMany({
    where: { workspaceId },
    orderBy: { order: "asc" },
    include: { _count: { select: { notes: true } } },
  });

  return NextResponse.json({
    notebooks: notebooks.map((nb) => ({
      id: nb.id,
      workspaceId: nb.workspaceId,
      title: nb.title,
      icon: nb.icon,
      domain: nb.domain,
      order: nb.order,
      status: nb.status,
      visibilityTier: nb.visibilityTier,
      createdById: nb.createdById,
      createdAt: nb.createdAt,
      updatedAt: nb.updatedAt,
      notesCount: nb._count.notes,
    })),
  });
}

/**
 * POST /api/notebooks
 *
 * Creates a new notebook in a workspace.
 * Body: { workspaceId, title, icon?, domain?, visibilityTier? }
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const body = await request.json();
  const { workspaceId, title, icon, domain, visibilityTier } = body;

  if (!workspaceId || !title)
    return NextResponse.json(
      { error: "workspaceId and title are required" },
      { status: 400 }
    );

  let member;
  try {
    member = await assertWorkspaceAccess(userId, workspaceId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (member.role === "viewer" || member.role === "suggestion_only") {
    return NextResponse.json(
      { error: "Insufficient permissions to create notebooks" },
      { status: 403 }
    );
  }

  const lastNotebook = await prisma.notebook.findFirst({
    where: { workspaceId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const notebook = await prisma.notebook.create({
    data: {
      workspaceId,
      title: title.trim(),
      icon: icon ?? "\u{1F4D3}",
      domain: domain ?? null,
      order: (lastNotebook?.order ?? 0) + 1,
      visibilityTier: visibilityTier ?? "intermediate",
      createdById: userId,
    },
  });

  return NextResponse.json(notebook, { status: 201 });
}
