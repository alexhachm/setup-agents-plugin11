import * as fs from "fs";
import * as path from "path";

export interface KnowledgeContext {
  codebaseInsights: string;
  patterns: string;
  mistakes: string;
  domainDocs: Record<string, string>;
  allocationLearnings: string;
}

const KNOWLEDGE_DIR = ".plugin11/knowledge";

const KNOWLEDGE_FILES = {
  codebaseInsights: "codebase-insights.md",
  patterns: "patterns.md",
  mistakes: "mistakes.md",
  allocationLearnings: "allocation-learnings.md",
} as const;

const DOMAIN_DIR = "domain";

export class KnowledgeLayer {
  private baseDir: string;
  private knowledgeDir: string;

  constructor(projectDir?: string) {
    this.baseDir = projectDir || process.cwd();
    this.knowledgeDir = path.join(this.baseDir, KNOWLEDGE_DIR);
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private readFile(filePath: string): string {
    try {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf-8");
      }
    } catch {
      // Return empty if unreadable
    }
    return "";
  }

  private writeFile(filePath: string, content: string): void {
    this.ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content, "utf-8");
  }

  private appendToFile(filePath: string, content: string): void {
    this.ensureDir(path.dirname(filePath));
    fs.appendFileSync(filePath, "\n" + content, "utf-8");
  }

  // ── Codebase Insights ──

  getCodebaseInsights(): string {
    return this.readFile(
      path.join(this.knowledgeDir, KNOWLEDGE_FILES.codebaseInsights)
    );
  }

  setCodebaseInsights(content: string): void {
    this.writeFile(
      path.join(this.knowledgeDir, KNOWLEDGE_FILES.codebaseInsights),
      content
    );
  }

  // ── Patterns ──

  getPatterns(): string {
    return this.readFile(
      path.join(this.knowledgeDir, KNOWLEDGE_FILES.patterns)
    );
  }

  addPattern(pattern: string): void {
    this.appendToFile(
      path.join(this.knowledgeDir, KNOWLEDGE_FILES.patterns),
      `- ${pattern}`
    );
  }

  setPatterns(content: string): void {
    this.writeFile(
      path.join(this.knowledgeDir, KNOWLEDGE_FILES.patterns),
      content
    );
  }

  // ── Mistakes ──

  getMistakes(): string {
    return this.readFile(
      path.join(this.knowledgeDir, KNOWLEDGE_FILES.mistakes)
    );
  }

  addMistake(mistake: string): void {
    const timestamp = new Date().toISOString();
    this.appendToFile(
      path.join(this.knowledgeDir, KNOWLEDGE_FILES.mistakes),
      `- [${timestamp}] ${mistake}`
    );
  }

  // ── Domain Docs ──

  getDomainDoc(domain: string): string {
    return this.readFile(
      path.join(this.knowledgeDir, DOMAIN_DIR, `${domain}.md`)
    );
  }

  setDomainDoc(domain: string, content: string): void {
    this.writeFile(
      path.join(this.knowledgeDir, DOMAIN_DIR, `${domain}.md`),
      content
    );
  }

  listDomains(): string[] {
    const domainDir = path.join(this.knowledgeDir, DOMAIN_DIR);
    try {
      if (fs.existsSync(domainDir)) {
        return fs
          .readdirSync(domainDir)
          .filter((f) => f.endsWith(".md"))
          .map((f) => f.replace(/\.md$/, ""));
      }
    } catch {
      // Return empty if unreadable
    }
    return [];
  }

  // ── Allocation Learnings ──

  getAllocationLearnings(): string {
    return this.readFile(
      path.join(this.knowledgeDir, KNOWLEDGE_FILES.allocationLearnings)
    );
  }

  addAllocationLearning(entry: {
    task: string;
    estimatedMinutes: number;
    actualMinutes: number;
    noteCount: number;
  }): void {
    const line = `- Task: ${entry.task} | Est: ${entry.estimatedMinutes}m | Actual: ${entry.actualMinutes}m | Notes: ${entry.noteCount}`;
    this.appendToFile(
      path.join(this.knowledgeDir, KNOWLEDGE_FILES.allocationLearnings),
      line
    );
  }

  parseAllocationLearnings(): { minutes: number; noteCount: number }[] {
    const raw = this.getAllocationLearnings();
    if (!raw.trim()) return [];

    const entries: { minutes: number; noteCount: number }[] = [];
    for (const line of raw.split("\n")) {
      const actualMatch = line.match(/Actual:\s*(\d+(?:\.\d+)?)m/);
      const notesMatch = line.match(/Notes:\s*(\d+)/);
      if (actualMatch && notesMatch) {
        entries.push({
          minutes: parseFloat(actualMatch[1]),
          noteCount: parseInt(notesMatch[1], 10),
        });
      }
    }
    return entries;
  }

  // ── Full Context ──

  getFullContext(): KnowledgeContext {
    const domainDocs: Record<string, string> = {};
    for (const domain of this.listDomains()) {
      domainDocs[domain] = this.getDomainDoc(domain);
    }

    return {
      codebaseInsights: this.getCodebaseInsights(),
      patterns: this.getPatterns(),
      mistakes: this.getMistakes(),
      domainDocs,
      allocationLearnings: this.getAllocationLearnings(),
    };
  }

  /** Record a correction in the mistakes log */
  recordCorrection(
    noteId: string,
    original: string,
    corrected: string,
    explanation: string
  ): void {
    this.addMistake(
      `Note ${noteId}: "${original}" -> "${corrected}" (${explanation})`
    );
  }
}
