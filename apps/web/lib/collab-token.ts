/**
 * collab-token.ts
 *
 * Client-side helper that fetches a short-lived JWT from /api/collab-token
 * and caches it in memory until it's within 60 seconds of expiry.
 *
 * Usage in NoteEditor:
 *   const token = await getCollabToken();
 */

interface CachedToken {
  value: string;
  expiresAt: number; // ms epoch
}

let cache: CachedToken | null = null;

const REFRESH_BUFFER_MS = 60_000; // refresh 60s before expiry

/**
 * Returns a valid collab JWT, fetching a new one when near expiry.
 * Throws if the fetch fails or the server returns a non-ok status.
 */
export async function getCollabToken(): Promise<string> {
  const now = Date.now();

  if (cache && cache.expiresAt - now > REFRESH_BUFFER_MS) {
    return cache.value;
  }

  const res = await fetch("/api/collab-token");
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `[collab-token] Failed to fetch: ${res.status} ${body}`
    );
  }

  const { token } = (await res.json()) as { token: string };

  // Parse expiry from JWT payload without importing a full JWT library
  // client-side. The token is not validated here — server already signed it.
  let expiresAt = now + 55 * 60 * 1000; // default 55 min if parse fails
  try {
    const payloadB64 = token.split(".")[1];
    if (payloadB64) {
      const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(json) as { exp?: number };
      if (payload.exp) {
        expiresAt = payload.exp * 1000; // JWT exp is Unix seconds
      }
    }
  } catch {
    // Non-fatal — fall back to default expiry
  }

  cache = { value: token, expiresAt };
  return token;
}

/** Clears the cached token, forcing a fresh fetch on next call.
 *  Call this on user sign-out. */
export function clearCollabTokenCache(): void {
  cache = null;
}
