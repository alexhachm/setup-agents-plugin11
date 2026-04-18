import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/config";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const TOKEN_TTL = "1h";

/**
 * GET /api/collab-token
 *
 * Issues a short-lived JWT for the authenticated user.
 * NoteEditor calls this on mount to get a real token for
 * the Hocuspocus collab-server — replacing the hardcoded "dev-token".
 *
 * Token payload matches what collab-server verifyToken() expects:
 *   { userId, email, name }
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as {
    id: string;
    name?: string | null;
    email?: string | null;
  };

  if (!user.id) {
    return NextResponse.json(
      { error: "Session is missing user id — check NextAuth JWT callback" },
      { status: 400 }
    );
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email ?? "",
      name: user.name ?? null,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );

  return NextResponse.json({ token });
}
