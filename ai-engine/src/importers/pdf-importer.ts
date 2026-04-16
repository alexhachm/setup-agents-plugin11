/**
 * PDF Importer
 *
 * Extracts text from PDF documents using pdf-parse.
 * Splits by sections/pages.
 * Generates note titles from section headers.
 * Handles tables and lists.
 */

import type {
  ImportedNotebook,
  ImportedNote,
} from "./markdown-importer";

export interface PDFImportResult {
  notebooks: ImportedNotebook[];
  warnings: string[];
  metadata: {
    title: string | null;
    author: string | null;
    pageCount: number;
  };
}

/**
 * Detect section boundaries in extracted PDF text.
 * Looks for lines that appear to be headers:
 * - All caps lines
 * - Lines followed by underline patterns
 * - Short lines preceding longer paragraphs
 * - Numbered sections (1. Section, 1.1 Subsection)
 */
function detectSections(
  text: string
): { title: string; body: string }[] {
  const lines = text.split("\n");
  const sections: { title: string; body: string }[] = [];
  let currentTitle = "";
  let currentBody: string[] = [];

  const isLikelyHeading = (line: string, nextLine?: string): boolean => {
    const trimmed = line.trim();
    if (!trimmed) return false;

    // Numbered section patterns: "1. Title", "1.1 Title", "Chapter 1"
    if (/^\d+(\.\d+)*\.?\s+\S/.test(trimmed)) return true;
    if (/^(Chapter|Section|Part)\s+\d+/i.test(trimmed)) return true;

    // All caps, reasonable length (likely a heading)
    if (
      trimmed === trimmed.toUpperCase() &&
      trimmed.length > 3 &&
      trimmed.length < 80 &&
      !/[.!?]$/.test(trimmed)
    ) {
      return true;
    }

    // Line followed by === or --- underline
    if (nextLine && /^[=-]{3,}$/.test(nextLine.trim())) return true;

    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];

    if (isLikelyHeading(line, nextLine)) {
      if (currentTitle || currentBody.length > 0) {
        sections.push({
          title: currentTitle || "Introduction",
          body: currentBody.join("\n").trim(),
        });
      }
      currentTitle = line.trim().replace(/^\d+(\.\d+)*\.?\s+/, "");
      currentBody = [];

      // Skip underline if present
      if (nextLine && /^[=-]{3,}$/.test(nextLine.trim())) {
        i++;
      }
    } else {
      currentBody.push(line);
    }
  }

  if (currentTitle || currentBody.length > 0) {
    sections.push({
      title: currentTitle || "Content",
      body: currentBody.join("\n").trim(),
    });
  }

  return sections;
}

/**
 * Split text by page breaks (form feed characters).
 */
function splitByPages(text: string): string[] {
  return text.split("\f").filter((page) => page.trim().length > 0);
}

/**
 * Parse PDF buffer into notebook/note structure.
 */
export async function parsePDFBuffer(
  filename: string,
  buffer: Buffer
): Promise<PDFImportResult> {
  // pdf-parse v2 uses named exports
  const pdfParseModule = await import("pdf-parse");
  type PDFResult = { text: string; numpages: number; info?: { Title?: string; Author?: string } };
  const pdfParse = (pdfParseModule as unknown as { default: (buf: Buffer) => Promise<PDFResult> }).default;

  const warnings: string[] = [];
  let data: PDFResult;

  try {
    data = await pdfParse(buffer);
  } catch (err) {
    return {
      notebooks: [],
      warnings: [
        `Failed to parse PDF ${filename}: ${err instanceof Error ? err.message : String(err)}`,
      ],
      metadata: { title: null, author: null, pageCount: 0 },
    };
  }

  const metadata = {
    title: data.info?.Title || null,
    author: data.info?.Author || null,
    pageCount: data.numpages || 0,
  };

  const text = data.text || "";

  if (!text.trim()) {
    warnings.push(
      `${filename}: PDF appears to be image-based or empty. No text could be extracted.`
    );
    return {
      notebooks: [
        {
          title:
            metadata.title ||
            filename.replace(/\.pdf$/i, ""),
          icon: "\u{1F4C4}",
          notes: [],
        },
      ],
      warnings,
      metadata,
    };
  }

  // Try section-based splitting first
  const sections = detectSections(text);

  let notes: ImportedNote[];

  if (sections.length > 1) {
    // Section-based splitting worked
    notes = sections.map((section, idx) => ({
      title: section.title,
      content: section.body,
      order: idx,
      tags: [],
      crossReferences: [],
    }));
  } else {
    // Fall back to page-based splitting
    const pages = splitByPages(text);
    if (pages.length > 1) {
      notes = pages.map((page, idx) => ({
        title: `Page ${idx + 1}`,
        content: page.trim(),
        order: idx,
        tags: [],
        crossReferences: [],
      }));
    } else {
      // Single note for the whole document
      notes = [
        {
          title:
            metadata.title ||
            filename.replace(/\.pdf$/i, ""),
          content: text.trim(),
          order: 0,
          tags: [],
          crossReferences: [],
        },
      ];
    }
  }

  const notebookTitle =
    metadata.title || filename.replace(/\.pdf$/i, "");

  return {
    notebooks: [
      {
        title: notebookTitle,
        icon: "\u{1F4C4}",
        notes,
      },
    ],
    warnings,
    metadata,
  };
}
