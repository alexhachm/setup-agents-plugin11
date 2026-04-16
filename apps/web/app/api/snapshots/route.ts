import { NextRequest, NextResponse } from "next/server";

/**
 * In-memory snapshot store for development.
 * In production, this would use the database via Prisma.
 */
const snapshotStore = new Map<
  string,
  {
    id: string;
    noteId: string;
    trigger: string;
    description: string;
    createdById: string;
    createdAt: string;
    yjsState: number[];
    metadata?: Record<string, unknown>;
  }
>();

/**
 * GET /api/snapshots?noteId=xxx
 *
 * List snapshots for a note.
 */
export async function GET(request: NextRequest) {
  const noteId = request.nextUrl.searchParams.get("noteId");

  if (!noteId) {
    return NextResponse.json(
      { error: "noteId query parameter is required" },
      { status: 400 }
    );
  }

  const snapshots = Array.from(snapshotStore.values())
    .filter((s) => s.noteId === noteId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return NextResponse.json({ snapshots });
}

/**
 * POST /api/snapshots
 *
 * Create a new snapshot.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      id,
      noteId,
      trigger,
      description,
      createdById,
      yjsState,
      metadata,
    } = body;

    if (!noteId || !trigger || !createdById) {
      return NextResponse.json(
        { error: "noteId, trigger, and createdById are required" },
        { status: 400 }
      );
    }

    const snapshot = {
      id: id || crypto.randomUUID(),
      noteId,
      trigger,
      description: description || "",
      createdById,
      createdAt: new Date().toISOString(),
      yjsState: yjsState || [],
      metadata,
    };

    snapshotStore.set(snapshot.id, snapshot);

    return NextResponse.json(snapshot, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to create snapshot",
      },
      { status: 500 }
    );
  }
}
