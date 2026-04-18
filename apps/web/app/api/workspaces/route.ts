import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@plugin11/db";

/**
 * GET /api/workspaces
 *
 * Returns all workspaces the authenticated user is a member of,
 * including their role in each workspace.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: { workspace: true },
    orderBy: { workspace: { createdAt: "asc" } },
  });

  return NextResponse.json({
    workspaces: memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
      creditShare: m.creditShare,
    })),
  });
}

/**
 * POST /api/workspaces
 *
 * Creates a new workspace and adds the authenticated user as owner.
 * Body: { name: string }
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const body = await request.json();
  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: body.name.trim(),
      ownerId: userId,
      members: {
        create: { userId, role: "owner" },
      },
    },
  });

  return NextResponse.json({ ...workspace, role: "owner" }, { status: 201 });
}
