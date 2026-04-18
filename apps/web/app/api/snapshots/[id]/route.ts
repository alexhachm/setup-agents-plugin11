import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@plugin11/db";

/**
 * GET /api/snapshots/[id]
 *
 * Returns the full snapshot including the yjsState binary blob
 * as a number array (JSON-safe Uint8Array serialisation).
 * Used by the RestoreSnapshot flow in the editor sidebar.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const snapshot = await prisma.snapshot.findUnique({
    where: { id: params.id },
    include: {
      note: {
        include: { notebook: { select: { workspaceId: true } } },
      },
    },
  });

  if (!snapshot)
    return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });

  // Verify workspace membership
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: snapshot.note.notebook.workspaceId,
        userId,
      },
    },
  });
  if (!member)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({
    id: snapshot.id,
    noteId: snapshot.noteId,
    trigger: snapshot.trigger,
    description: snapshot.description,
    createdById: snapshot.createdById,
    createdAt: snapshot.createdAt,
    // Serialise Buffer → number[] for JSON transport
    // Client: Uint8Array.from(response.yjsState)
    yjsState: Array.from(snapshot.yjsState),
  });
}
