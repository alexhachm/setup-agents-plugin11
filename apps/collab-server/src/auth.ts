import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string | null;
}

export function verifyToken(token: string): TokenPayload {
  // In development, accept "dev-token" for easy testing
  if (token === "dev-token" && process.env.NODE_ENV !== "production") {
    return {
      userId: "dev-user",
      email: "dev@plugin11.dev",
      name: "Developer",
    };
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return payload;
  } catch (err) {
    console.log(`[onAuthenticate] ${(err as Error).message}`);
    throw err;
  }
}

export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}
