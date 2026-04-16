/**
 * Markdown Importer
 *
 * Parses .md files into a notebook/note structure.
 * Split by headings: # = notebook, ## = note (or auto-detect).
 * Preserves formatting (lists, code blocks, links).
 * Generates note titles from headings.
 * Cross-reference detection (find internal links).
 */

export interface ImportedNote {
  title: string;
  content: string;
  order: number;
  tags: string[];
  crossReferences: string[];
}

export interface ImportedNotebook {
  title: string;
  icon: string;
  notes: ImportedNote[];
}

export interface MarkdownImportResult {
  notebooks: ImportedNotebook[];
  warnings: string[];
}

const NOTEBOOK_ICONS = [
  "\u{1F4D3}",
  "\u{1F4D4}",
  "\u{1F4D5}",
  "\u{1F4D7}",
  "\u{1F4D8}",
  "\u{1F4D9}",
  "\u{1F4DA}",
];

/**
 * Extract internal links from markdown content.
 * Matches [[link]] and [text](link) patterns.
 */
function extractCrossReferences(content: string): string[] {
  const refs: string[] = [];

  // Match [[wiki-style links]]
  const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
  let match: RegExpExecArray | null;
  while ((match = wikiLinkRegex.exec(content)) !== null) {
    refs.push(match[1].trim());
  }

  // Match [text](#anchor) internal links
  const internalLinkRegex = /\[([^\]]+)\]\(#([^)]+)\)/g;
  while ((match = internalLinkRegex.exec(content)) !== null) {
    refs.push(match[1].trim());
  }

  return [...new Set(refs)];
}

/**
 * Extract tags from content. Looks for #tag patterns
 * and special markers like ? for questions and ! for flags.
 */
function extractTags(content: string): string[] {
  const tags: string[] = [];

  // Detect question markers
  if (/\?\s|^\?/m.test(content)) {
    tags.push("?open-question");
  }

  // Detect flag markers
  if (/!\s|^!/m.test(content) && !/^#!/m.test(content)) {
    tags.push("!flag");
  }

  // Extract #hashtags (but not headings)
  const hashtagRegex = /(?:^|\s)#([a-zA-Z][\w-]*)/g;
  let match: RegExpExecArray | null;
  while ((match = hashtagRegex.exec(content)) !== null) {
    tags.push(match[1]);
  }

  return [...new Set(tags)];
}

/**
 * Detect heading structure to determine how to split.
 * If there are H1s, use H1 = notebook, H2 = note.
 * If only H2s, each H2 becomes a note in a single notebook.
 * If only H3s or no headings, treat whole file as a single note.
 */
function detectHeadingStructure(
  content: string
): "h1-h2" | "h2-only" | "flat" {
  const h1Count = (content.match(/^# [^\n]+/gm) || []).length;
  const h2Count = (content.match(/^## [^\n]+/gm) || []).length;

  if (h1Count > 0 && h2Count > 0) return "h1-h2";
  if (h2Count > 0) return "h2-only";
  return "flat";
}

/**
 * Split content by a heading level regex.
 */
function splitByHeading(
  content: string,
  headingRegex: RegExp
): { title: string; body: string }[] {
  const sections: { title: string; body: string }[] = [];
  const lines = content.split("\n");
  let currentTitle = "";
  let currentBody: string[] = [];

  for (const line of lines) {
    const match = line.match(headingRegex);
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

/**
 * Parse a single markdown file into notebooks and notes.
 */
export function parseMarkdownFile(
  filename: string,
  content: string
): MarkdownImportResult {
  const warnings: string[] = [];
  const structure = detectHeadingStructure(content);

  if (structure === "h1-h2") {
    return parseH1H2Structure(content, warnings);
  } else if (structure === "h2-only") {
    return parseH2OnlyStructure(filename, content, warnings);
  } else {
    return parseFlatStructure(filename, content, warnings);
  }
}

function parseH1H2Structure(
  content: string,
  warnings: string[]
): MarkdownImportResult {
  const notebooks: ImportedNotebook[] = [];
  const h1Sections = splitByHeading(content, /^# (.+)$/m);

  h1Sections.forEach((section, nbIdx) => {
    const noteSections = splitByHeading(section.body, /^## (.+)$/m);
    const notes: ImportedNote[] = [];

    // If there's content before any H2, make it a note
    if (noteSections.length === 0) {
      notes.push({
        title: section.title,
        content: section.body,
        order: 0,
        tags: extractTags(section.body),
        crossReferences: extractCrossReferences(section.body),
      });
    } else {
      noteSections.forEach((noteSection, nIdx) => {
        notes.push({
          title: noteSection.title,
          content: noteSection.body,
          order: nIdx,
          tags: extractTags(noteSection.body),
          crossReferences: extractCrossReferences(noteSection.body),
        });
      });
    }

    notebooks.push({
      title: section.title,
      icon: NOTEBOOK_ICONS[nbIdx % NOTEBOOK_ICONS.length],
      notes,
    });
  });

  if (notebooks.length === 0) {
    warnings.push("No headings found in markdown file");
  }

  return { notebooks, warnings };
}

function parseH2OnlyStructure(
  filename: string,
  content: string,
  warnings: string[]
): MarkdownImportResult {
  const noteSections = splitByHeading(content, /^## (.+)$/m);
  const notes: ImportedNote[] = noteSections.map((section, idx) => ({
    title: section.title,
    content: section.body,
    order: idx,
    tags: extractTags(section.body),
    crossReferences: extractCrossReferences(section.body),
  }));

  const notebookTitle = filename.replace(/\.md$/i, "").replace(/[-_]/g, " ");

  return {
    notebooks: [
      {
        title: notebookTitle,
        icon: NOTEBOOK_ICONS[0],
        notes,
      },
    ],
    warnings,
  };
}

function parseFlatStructure(
  filename: string,
  content: string,
  warnings: string[]
): MarkdownImportResult {
  const title = filename.replace(/\.md$/i, "").replace(/[-_]/g, " ");

  return {
    notebooks: [
      {
        title,
        icon: NOTEBOOK_ICONS[0],
        notes: [
          {
            title,
            content,
            order: 0,
            tags: extractTags(content),
            crossReferences: extractCrossReferences(content),
          },
        ],
      },
    ],
    warnings,
  };
}

/**
 * Parse multiple markdown files into a combined notebook structure.
 */
export function parseMarkdownFiles(
  files: { name: string; content: string }[]
): MarkdownImportResult {
  const allNotebooks: ImportedNotebook[] = [];
  const allWarnings: string[] = [];

  for (const file of files) {
    const result = parseMarkdownFile(file.name, file.content);
    allNotebooks.push(...result.notebooks);
    allWarnings.push(
      ...result.warnings.map((w) => `${file.name}: ${w}`)
    );
  }

  return { notebooks: allNotebooks, warnings: allWarnings };
}
