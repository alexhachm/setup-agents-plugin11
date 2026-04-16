import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  // In production: fetch notebooks from database
  return NextResponse.json({
    notebooks: [
      {
        id: "nb-1",
        workspaceId,
        title: "Auth",
        icon: "\u{1F4D3}",
        status: "active",
        notesCount: 3,
      },
    ],
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  // In production: create notebook in database
  return NextResponse.json({
    id: "nb-" + Date.now(),
    workspaceId: body.workspaceId,
    title: body.title,
    icon: body.icon || "\u{1F4D3}",
    status: "active",
    createdAt: new Date().toISOString(),
  });
}
