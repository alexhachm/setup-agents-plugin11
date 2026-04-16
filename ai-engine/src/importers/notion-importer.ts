/**
 * Notion Importer
 *
 * Parses Notion exports (JSON/markdown/HTML format).
 * Maps Notion pages to notes.
 * Maps Notion databases to notebooks.
 * Preserves Notion links as note references.
 */

import type {
  ImportedNotebook,
  ImportedNote,
} from "./markdown-importer";

export interface NotionImportResult {
  notebooks: ImportedNotebook[];
  warnings: string[];
}

// Notion export page structure (from their JSON export)
interface NotionExportPage {
  id?: string;
  title?: string;
  type?: string;
  properties?: Record<string, unknown>;
  content?: string;
  children?: NotionExportPage[];
  parent?: { type: string; page_id?: string; database_id?: string };
  url?: string;
}

interface NotionExportDatabase {
  id?: string;
  title?: string;
  description?: string;
  pages?: NotionExportPage[];
}

interface NotionExport {
  pages?: NotionExportPage[];
  databases?: NotionExportDatabase[];
  workspace?: { name?: string };
}

/**
 * Convert Notion block content to markdown.
 */
function notionContentToMarkdown(content: string | undefined): string {
  if (!content) return "";

  // Notion exports may include HTML — do basic conversion
  let md = content;

  // Convert basic HTML tags to markdown
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n");
  md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b>(.*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i>(.*?)<\/i>/gi, "*$1*");
  md = md.replace(/<code>(.*?)<\/code>/gi, "`$1`");
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  md = md.replace(/<li>(.*?)<\/li>/gi, "- $1\n");
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<p>(.*?)<\/p>/gi, "$1\n\n");
  md = md.replace(/<[^>]+>/g, ""); // Strip remaining HTML

  return md.trim();
}

/**
 * Extract Notion-style internal links and convert to cross-references.
 */
function extractNotionLinks(content: string): string[] {
  const refs: string[] = [];

  // Match Notion-style page mentions
  const mentionRegex = /@([^@\n]+)/g;
  let match: RegExpExecArray | null;
  while ((match = mentionRegex.exec(content)) !== null) {
    refs.push(match[1].trim());
  }

  // Match Notion page links in markdown format
  const linkRegex = /\[([^\]]+)\]\(\/[a-f0-9-]+\)/g;
  while ((match = linkRegex.exec(content)) !== null) {
    refs.push(match[1].trim());
  }

  return [...new Set(refs)];
}

/**
 * Parse a Notion JSON export into notebooks and notes.
 */
export function parseNotionExport(data: unknown): NotionImportResult {
  const warnings: string[] = [];
  const notebooks: ImportedNotebook[] = [];

  const exportData = data as NotionExport;

  // Process databases as notebooks
  if (exportData.databases && Array.isArray(exportData.databases)) {
    for (const db of exportData.databases) {
      const notes: ImportedNote[] = [];

      if (db.pages && Array.isArray(db.pages)) {
        db.pages.forEach((page, idx) => {
          const content = notionContentToMarkdown(page.content);
          notes.push({
            title: page.title || `Untitled ${idx + 1}`,
            content,
            order: idx,
            tags: [],
            crossReferences: extractNotionLinks(content),
          });
        });
      }

      notebooks.push({
        title: db.title || "Untitled Database",
        icon: "\u{1F4CA}",
        notes,
      });
    }
  }

  // Process top-level pages
  if (exportData.pages && Array.isArray(exportData.pages)) {
    const topLevelNotes: ImportedNote[] = [];
    let noteOrder = 0;

    for (const page of exportData.pages) {
      // Pages with children become notebooks
      if (page.children && page.children.length > 0) {
        const childNotes: ImportedNote[] = page.children.map(
          (child, idx) => {
            const content = notionContentToMarkdown(child.content);
            return {
              title: child.title || `Untitled ${idx + 1}`,
              content,
              order: idx,
              tags: [],
              crossReferences: extractNotionLinks(content),
            };
          }
        );

        notebooks.push({
          title: page.title || "Untitled Notebook",
          icon: "\u{1F4D3}",
          notes: childNotes,
        });
      } else {
        // Standalone pages become notes in a general notebook
        const content = notionContentToMarkdown(page.content);
        topLevelNotes.push({
          title: page.title || `Untitled ${noteOrder + 1}`,
          content,
          order: noteOrder++,
          tags: [],
          crossReferences: extractNotionLinks(content),
        });
      }
    }

    if (topLevelNotes.length > 0) {
      notebooks.push({
        title:
          exportData.workspace?.name || "Imported Pages",
        icon: "\u{1F4DD}",
        notes: topLevelNotes,
      });
    }
  }

  if (notebooks.length === 0) {
    warnings.push(
      "No pages or databases found in Notion export. The export format may not be supported."
    );
  }

  return { notebooks, warnings };
}

/**
 * Parse Notion markdown export (folder of .md files).
 * Each top-level folder = notebook, each .md file = note.
 */
export function parseNotionMarkdownExport(
  files: { path: string; content: string }[]
): NotionImportResult {
  const warnings: string[] = [];
  const notebookMap = new Map<string, ImportedNote[]>();

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    const notebookName =
      parts.length > 1 ? parts[0].replace(/[-_]/g, " ") : "Imported Notes";
    const noteTitle = (parts[parts.length - 1] || "Untitled")
      .replace(/\.md$/i, "")
      .replace(/[-_]/g, " ")
      // Notion appends IDs to filenames — strip them
      .replace(/\s+[a-f0-9]{32}$/i, "");

    if (!notebookMap.has(notebookName)) {
      notebookMap.set(notebookName, []);
    }

    const notes = notebookMap.get(notebookName)!;
    notes.push({
      title: noteTitle,
      content: notionContentToMarkdown(file.content),
      order: notes.length,
      tags: [],
      crossReferences: extractNotionLinks(file.content),
    });
  }

  const notebooks: ImportedNotebook[] = [];
  let iconIdx = 0;
  const icons = [
    "\u{1F4D3}",
    "\u{1F4D4}",
    "\u{1F4D5}",
    "\u{1F4D7}",
    "\u{1F4D8}",
    "\u{1F4D9}",
  ];

  for (const [title, notes] of notebookMap) {
    notebooks.push({
      title,
      icon: icons[iconIdx % icons.length],
      notes,
    });
    iconIdx++;
  }

  return { notebooks, warnings };
}
