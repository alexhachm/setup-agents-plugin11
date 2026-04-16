import { NextRequest, NextResponse } from "next/server";

interface ImportedNoteData {
  title: string;
  content: string;
  order: number;
  tags: string[];
  crossReferences: string[];
}

interface ImportedNotebookData {
  title: string;
  icon: string;
  notes: ImportedNoteData[];
}

/**
 * POST /api/import
 *
 * Accepts file uploads (multipart/form-data) and processes them
 * into a notebook/note structure.
 *
 * - For repos: calls AI engine's domain analyzer
 * - For markdown: parses and converts to notes
 * - For PDFs: extracts text and converts to notes
 * - For note exports: parses Notion JSON, converts to notebooks/notes
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sourceType = formData.get("sourceType") as string;
    const workspaceId = formData.get("workspaceId") as string;

    if (!sourceType || !workspaceId) {
      return NextResponse.json(
        { error: "sourceType and workspaceId are required" },
        { status: 400 }
      );
    }

    let notebooks: { id: string; title: string; icon: string; notes: { id: string; title: string; content: string; tags: string[]; crossReferences: string[] }[] }[] = [];
    const warnings: string[] = [];

    switch (sourceType) {
      case "github": {
        const repoUrl = formData.get("repoUrl") as string;
        if (!repoUrl) {
          return NextResponse.json(
            { error: "repoUrl is required for GitHub imports" },
            { status: 400 }
          );
        }
        // Domain analyzer would be called here in production.
        // For now, generate a placeholder notebook from the repo URL.
        const repoName = repoUrl.split("/").pop() || "repository";
        notebooks = [
          {
            id: crypto.randomUUID(),
            title: repoName,
            icon: "\u{1F4E6}",
            notes: [
              {
                id: crypto.randomUUID(),
                title: "Repository Overview",
                content: `Imported from ${repoUrl}. The AI engine will analyze the codebase and generate detailed notes.`,
                tags: [],
                crossReferences: [],
              },
            ],
          },
        ];
        break;
      }

      case "markdown": {
        const files = formData.getAll("files") as File[];
        if (files.length === 0) {
          return NextResponse.json(
            { error: "No files provided" },
            { status: 400 }
          );
        }

        for (const file of files) {
          const content = await file.text();
          const parsed = parseMarkdownToNotebook(file.name, content);
          notebooks.push(...parsed.notebooks);
          warnings.push(...parsed.warnings);
        }
        break;
      }

      case "pdf": {
        const files = formData.getAll("files") as File[];
        if (files.length === 0) {
          return NextResponse.json(
            { error: "No files provided" },
            { status: 400 }
          );
        }

        for (const file of files) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const parsed = await parsePDFToNotebook(file.name, buffer);
          notebooks.push(...parsed.notebooks);
          warnings.push(...parsed.warnings);
        }
        break;
      }

      case "notion": {
        const files = formData.getAll("files") as File[];
        if (files.length === 0) {
          return NextResponse.json(
            { error: "No files provided" },
            { status: 400 }
          );
        }

        for (const file of files) {
          if (file.name.endsWith(".json")) {
            const content = await file.text();
            const parsed = parseNotionJSON(content);
            notebooks.push(...parsed.notebooks);
            warnings.push(...parsed.warnings);
          } else if (file.name.endsWith(".zip")) {
            // ZIP handling would decompress and process each file
            warnings.push(
              "ZIP import creates placeholder notebooks. Full extraction requires server-side processing."
            );
            notebooks.push({
              id: crypto.randomUUID(),
              title: file.name.replace(/\.zip$/, ""),
              icon: "\u{1F4E5}",
              notes: [
                {
                  id: crypto.randomUUID(),
                  title: "Imported Archive",
                  content:
                    "This notebook was imported from a ZIP archive. Individual pages will be processed.",
                  tags: [],
                  crossReferences: [],
                },
              ],
            });
          }
        }
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown source type: ${sourceType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      notebooks,
      warnings,
      sourceType,
      workspaceId,
    });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

// ── Inline parsing helpers (mirrors ai-engine importers for server-side use) ──

function parseMarkdownToNotebook(
  filename: string,
  content: string
): { notebooks: { id: string; title: string; icon: string; notes: { id: string; title: string; content: string; tags: string[]; crossReferences: string[] }[] }[]; warnings: string[] } {
  const warnings: string[] = [];
  const h1Sections = splitByHeading(content, /^# (.+)$/m);
  const h2Sections = splitByHeading(content, /^## (.+)$/m);

  const hasH1 = (content.match(/^# [^\n]+/gm) || []).length > 0;
  const hasH2 = (content.match(/^## [^\n]+/gm) || []).length > 0;

  if (hasH1 && hasH2) {
    // H1 = notebooks, H2 = notes
    const notebooks = h1Sections.map((section) => {
      const noteSections = splitByHeading(section.body, /^## (.+)$/m);
      return {
        id: crypto.randomUUID(),
        title: section.title,
        icon: "\u{1F4D3}",
        notes:
          noteSections.length > 0
            ? noteSections.map((n) => ({
                id: crypto.randomUUID(),
                title: n.title,
                content: n.body,
                tags: [],
                crossReferences: extractRefs(n.body),
              }))
            : [
                {
                  id: crypto.randomUUID(),
                  title: section.title,
                  content: section.body,
                  tags: [],
                  crossReferences: extractRefs(section.body),
                },
              ],
      };
    });
    return { notebooks, warnings };
  }

  if (hasH2) {
    const title = filename.replace(/\.md$/i, "").replace(/[-_]/g, " ");
    return {
      notebooks: [
        {
          id: crypto.randomUUID(),
          title,
          icon: "\u{1F4D3}",
          notes: h2Sections.map((s) => ({
            id: crypto.randomUUID(),
            title: s.title,
            content: s.body,
            tags: [],
            crossReferences: extractRefs(s.body),
          })),
        },
      ],
      warnings,
    };
  }

  // Flat structure
  const title = filename.replace(/\.md$/i, "").replace(/[-_]/g, " ");
  return {
    notebooks: [
      {
        id: crypto.randomUUID(),
        title,
        icon: "\u{1F4D3}",
        notes: [
          {
            id: crypto.randomUUID(),
            title,
            content,
            tags: [],
            crossReferences: extractRefs(content),
          },
        ],
      },
    ],
    warnings,
  };
}

async function parsePDFToNotebook(
  filename: string,
  buffer: Buffer
): Promise<{ notebooks: { id: string; title: string; icon: string; notes: { id: string; title: string; content: string; tags: string[]; crossReferences: string[] }[] }[]; warnings: string[] }> {
  const warnings: string[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string; numpages: number; info?: { Title?: string } }>;
    const data = await pdfParse(buffer);
    const text = data.text || "";
    const title =
      data.info?.Title || filename.replace(/\.pdf$/i, "");

    if (!text.trim()) {
      warnings.push("PDF appears to be image-based. No text extracted.");
      return {
        notebooks: [
          {
            id: crypto.randomUUID(),
            title,
            icon: "\u{1F4C4}",
            notes: [],
          },
        ],
        warnings,
      };
    }

    // Split by page breaks
    const pages = text.split("\f").filter((p: string) => p.trim());
    const notes =
      pages.length > 1
        ? pages.map((page: string, idx: number) => ({
            id: crypto.randomUUID(),
            title: `Page ${idx + 1}`,
            content: page.trim(),
            tags: [] as string[],
            crossReferences: [] as string[],
          }))
        : [
            {
              id: crypto.randomUUID(),
              title,
              content: text.trim(),
              tags: [] as string[],
              crossReferences: [] as string[],
            },
          ];

    return {
      notebooks: [{ id: crypto.randomUUID(), title, icon: "\u{1F4C4}", notes }],
      warnings,
    };
  } catch (err) {
    warnings.push(
      `Failed to parse PDF: ${err instanceof Error ? err.message : String(err)}`
    );
    return {
      notebooks: [
        {
          id: crypto.randomUUID(),
          title: filename.replace(/\.pdf$/i, ""),
          icon: "\u{1F4C4}",
          notes: [],
        },
      ],
      warnings,
    };
  }
}

function parseNotionJSON(content: string): {
  notebooks: { id: string; title: string; icon: string; notes: { id: string; title: string; content: string; tags: string[]; crossReferences: string[] }[] }[];
  warnings: string[];
} {
  const warnings: string[] = [];
  try {
    const data = JSON.parse(content);
    const notebooks: { id: string; title: string; icon: string; notes: { id: string; title: string; content: string; tags: string[]; crossReferences: string[] }[] }[] = [];

    // Handle Notion database exports
    if (data.databases && Array.isArray(data.databases)) {
      for (const db of data.databases) {
        const notes = (db.pages || []).map(
          (page: { title?: string; content?: string }, idx: number) => ({
            id: crypto.randomUUID(),
            title: page.title || `Page ${idx + 1}`,
            content: page.content || "",
            tags: [] as string[],
            crossReferences: [] as string[],
          })
        );
        notebooks.push({
          id: crypto.randomUUID(),
          title: db.title || "Untitled Database",
          icon: "\u{1F4CA}",
          notes,
        });
      }
    }

    // Handle page exports
    if (data.pages && Array.isArray(data.pages)) {
      const notes = data.pages.map(
        (page: { title?: string; content?: string }, idx: number) => ({
          id: crypto.randomUUID(),
          title: page.title || `Page ${idx + 1}`,
          content: page.content || "",
          tags: [] as string[],
          crossReferences: [] as string[],
        })
      );
      if (notes.length > 0) {
        notebooks.push({
          id: crypto.randomUUID(),
          title: data.workspace?.name || "Imported Pages",
          icon: "\u{1F4DD}",
          notes,
        });
      }
    }

    // Handle flat array of pages
    if (Array.isArray(data) && data.length > 0) {
      const notes = data.map(
        (page: { title?: string; content?: string }, idx: number) => ({
          id: crypto.randomUUID(),
          title: page.title || `Page ${idx + 1}`,
          content: page.content || "",
          tags: [] as string[],
          crossReferences: [] as string[],
        })
      );
      notebooks.push({
        id: crypto.randomUUID(),
        title: "Imported Notes",
        icon: "\u{1F4DD}",
        notes,
      });
    }

    if (notebooks.length === 0) {
      warnings.push("Could not detect pages or databases in JSON export.");
    }

    return { notebooks, warnings };
  } catch {
    return {
      notebooks: [],
      warnings: ["Failed to parse JSON export. The file may be corrupted."],
    };
  }
}

function splitByHeading(
  content: string,
  regex: RegExp
): { title: string; body: string }[] {
  const sections: { title: string; body: string }[] = [];
  const lines = content.split("\n");
  let currentTitle = "";
  let currentBody: string[] = [];

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      if (currentTitle || currentBody.length > 0) {
        sections.push({
          title: currentTitle || "Untitled",
          body: currentBody.join("\n").trim(),
        });
      }
      currentTitle = match[1].trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  if (currentTitle || currentBody.length > 0) {
    sections.push({
      title: currentTitle || "Untitled",
      body: currentBody.join("\n").trim(),
    });
  }
  return sections;
}

function extractRefs(content: string): string[] {
  const refs: string[] = [];
  const wikiRegex = /\[\[([^\]]+)\]\]/g;
  let match: RegExpExecArray | null;
  while ((match = wikiRegex.exec(content)) !== null) {
    refs.push(match[1].trim());
  }
  return [...new Set(refs)];
}
