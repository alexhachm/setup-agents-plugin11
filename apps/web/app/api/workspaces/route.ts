import { NextResponse } from "next/server";

export async function GET() {
  // In production: fetch workspaces for authenticated user
  return NextResponse.json({
    workspaces: [
      {
        id: "ws-demo",
        name: "Demo Workspace",
        plan: "free",
        createdAt: new Date().toISOString(),
      },
    ],
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  // In production: create workspace in database
  return NextResponse.json({
    id: "ws-" + Date.now(),
    name: body.name,
    plan: "free",
    createdAt: new Date().toISOString(),
  });
}
