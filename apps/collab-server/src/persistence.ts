import { prisma } from "@plugin11/db";

/**
 * Yjs document persistence backed by PostgreSQL via Prisma.
 *
 * Writes are debounced 2 seconds per document to prevent database
 * thrash under rapid collaborative edits. A single flush happens
 * at most once per 2s per unique documentName.
 *
 * On write failure, one retry is queued after 5 seconds.
 *
 * Used by the Hocuspocus Database extension (store callback).
 * storeDocument is intentionally NOT async — Hocuspocus does not
 * await the store callback, so we manage our own async lifecycle.
 */

const writeTimers = new Map<string, ReturnType<typeof setTimeout>>();
const DEBOUNCE_MS = 2_000;
const RETRY_MS = 5_000;

export async function fetchDocument(
  documentName: string
): Promise<Uint8Array | null> {
  const doc = await prisma.yjsDocument.findUnique({
    where: { name: documentName },
  });

  if (!doc) return null;
  return new Uint8Array(doc.data);
}

export function storeDocument(
  documentName: string,
  state: Uint8Array
): void {
  // Cancel any pending write for this document
  const existing = writeTimers.get(documentName);
  if (existing) clearTimeout(existing);

  // Snapshot state at this point in time — avoid capturing a stale
  // reference if state is mutated externally before the timer fires
  const snapshot = Buffer.from(state);

  const timer = setTimeout(async () => {
    writeTimers.delete(documentName);
    await flush(documentName, snapshot);
  }, DEBOUNCE_MS);

  writeTimers.set(documentName, timer);
}

async function flush(
  documentName: string,
  snapshot: Buffer,
  isRetry = false
): Promise<void> {
  try {
    await prisma.yjsDocument.upsert({
      where: { name: documentName },
      create: { name: documentName, data: snapshot },
      update: { data: snapshot },
    });
    if (isRetry) {
      console.log(`[persistence] Retry succeeded for ${documentName}`);
    }
  } catch (err) {
    console.error(
      `[persistence] ${isRetry ? "Retry" : "Write"} failed for ${documentName}:`,
      err
    );
    if (!isRetry) {
      // Queue exactly one retry
      const retry = setTimeout(async () => {
        writeTimers.delete(documentName);
        await flush(documentName, snapshot, true);
      }, RETRY_MS);
      writeTimers.set(documentName, retry);
    }
  }
}
