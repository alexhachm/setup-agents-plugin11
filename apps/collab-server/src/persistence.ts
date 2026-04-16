import { prisma } from "@plugin11/db";

/**
 * Yjs document persistence backed by PostgreSQL via Prisma.
 * Used by the Hocuspocus Database extension.
 */
export async function fetchDocument(
  documentName: string
): Promise<Uint8Array | null> {
  const doc = await prisma.yjsDocument.findUnique({
    where: { name: documentName },
  });

  if (!doc) return null;
  return new Uint8Array(doc.data);
}

export async function storeDocument(
  documentName: string,
  state: Uint8Array
): Promise<void> {
  await prisma.yjsDocument.upsert({
    where: { name: documentName },
    create: {
      name: documentName,
      data: Buffer.from(state),
    },
    update: {
      data: Buffer.from(state),
    },
  });
}
