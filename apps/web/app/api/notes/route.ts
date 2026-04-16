import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const notebookId = searchParams.get("notebookId");

  // In production: fetch notes from database
  return NextResponse.json({
    notes: [
      {
        id: "n-1",
        notebookId,
        title: "Login Flow",
        status: "implemented",
        tags: [],
        updatedAt: new Date().toISOString(),
      },
    ],
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  // In production: create note in database
  return NextResponse.json({
    id: "n-" + Date.now(),
    notebookId: body.notebookId,
    title: body.title,
    status: "idea",
    yjsDocId: "yjs-" + Date.now(),
    createdAt: new Date().toISOString(),
  });
}
