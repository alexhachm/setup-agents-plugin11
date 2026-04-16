import * as fs from "fs";
import * as path from "path";

export interface DomainMapping {
  domain: string;
  files: string[];
  confidence: number;
}

export interface AnalysisResult {
  domains: DomainMapping[];
  suggestedNotebooks: SuggestedNotebook[];
  fileCount: number;
  directoryCount: number;
}

export interface SuggestedNotebook {
  title: string;
  domain: string;
  suggestedNotes: string[];
}

// Domain detection patterns: directory names, file patterns, keywords
const DOMAIN_PATTERNS: {
  domain: string;
  dirPatterns: RegExp[];
  filePatterns: RegExp[];
  importPatterns: RegExp[];
}[] = [
  {
    domain: "auth",
    dirPatterns: [/auth/i, /login/i, /session/i, /identity/i],
    filePatterns: [/auth/i, /login/i, /signup/i, /session/i, /token/i, /jwt/i, /oauth/i],
    importPatterns: [/next-auth/i, /passport/i, /jsonwebtoken/i, /bcrypt/i, /oauth/i],
  },
  {
    domain: "payment",
    dirPatterns: [/payment/i, /billing/i, /checkout/i, /subscription/i],
    filePatterns: [/payment/i, /billing/i, /checkout/i, /invoice/i, /stripe/i, /price/i],
    importPatterns: [/stripe/i, /paypal/i, /braintree/i],
  },
  {
    domain: "ui",
    dirPatterns: [/components?/i, /ui/i, /views?/i, /pages?/i, /layouts?/i],
    filePatterns: [/\.tsx$/i, /\.jsx$/i, /\.vue$/i, /\.svelte$/i, /component/i],
    importPatterns: [/react/i, /vue/i, /svelte/i, /@radix/i, /shadcn/i],
  },
  {
    domain: "data",
    dirPatterns: [/models?/i, /schema/i, /migrations?/i, /database/i, /db/i, /prisma/i],
    filePatterns: [/model/i, /schema/i, /migration/i, /seed/i, /\.prisma$/i, /\.sql$/i],
    importPatterns: [/prisma/i, /typeorm/i, /sequelize/i, /knex/i, /drizzle/i],
  },
  {
    domain: "api",
    dirPatterns: [/api/i, /routes?/i, /controllers?/i, /handlers?/i, /endpoints?/i],
    filePatterns: [/route/i, /controller/i, /handler/i, /middleware/i, /endpoint/i],
    importPatterns: [/express/i, /fastify/i, /hono/i, /koa/i, /trpc/i],
  },
  {
    domain: "testing",
    dirPatterns: [/tests?/i, /__tests__/i, /spec/i, /e2e/i, /cypress/i],
    filePatterns: [/\.test\./i, /\.spec\./i, /\.e2e\./i],
    importPatterns: [/jest/i, /vitest/i, /mocha/i, /cypress/i, /playwright/i],
  },
  {
    domain: "config",
    dirPatterns: [/config/i, /settings/i],
    filePatterns: [/config/i, /\.env/i, /settings/i, /tsconfig/i, /eslint/i, /prettier/i],
    importPatterns: [/dotenv/i],
  },
  {
    domain: "infra",
    dirPatterns: [/infra/i, /deploy/i, /ci/i, /docker/i, /k8s/i, /terraform/i],
    filePatterns: [/Dockerfile/i, /docker-compose/i, /\.ya?ml$/i, /\.tf$/i],
    importPatterns: [],
  },
];

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".turbo",
  ".cache",
  "coverage",
  ".plugin11",
]);

const IGNORE_FILES = new Set([
  ".DS_Store",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
]);

export class DomainAnalyzer {
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  analyze(): AnalysisResult {
    const files = this.collectFiles(this.rootDir);
    const domainScores: Record<string, { files: Set<string>; score: number }> = {};

    // Initialize domain scores
    for (const { domain } of DOMAIN_PATTERNS) {
      domainScores[domain] = { files: new Set(), score: 0 };
    }

    let directoryCount = 0;

    for (const filePath of files) {
      const relativePath = path.relative(this.rootDir, filePath);
      const dirName = path.dirname(relativePath);
      const fileName = path.basename(relativePath);

      for (const pattern of DOMAIN_PATTERNS) {
        let matched = false;

        // Check directory patterns
        for (const dirPattern of pattern.dirPatterns) {
          if (dirPattern.test(dirName)) {
            domainScores[pattern.domain].files.add(relativePath);
            domainScores[pattern.domain].score += 1;
            matched = true;
            break;
          }
        }

        // Check file name patterns
        if (!matched) {
          for (const filePattern of pattern.filePatterns) {
            if (filePattern.test(fileName)) {
              domainScores[pattern.domain].files.add(relativePath);
              domainScores[pattern.domain].score += 0.5;
              matched = true;
              break;
            }
          }
        }

        // Check import patterns (read file content for source files)
        if (!matched && this.isSourceFile(filePath)) {
          const content = this.readFileContent(filePath);
          if (content) {
            for (const importPattern of pattern.importPatterns) {
              if (importPattern.test(content)) {
                domainScores[pattern.domain].files.add(relativePath);
                domainScores[pattern.domain].score += 0.3;
                break;
              }
            }
          }
        }
      }
    }

    // Count directories
    const dirs = new Set<string>();
    for (const f of files) {
      dirs.add(path.dirname(path.relative(this.rootDir, f)));
    }
    directoryCount = dirs.size;

    // Build domain mappings with confidence scores
    const maxScore = Math.max(
      1,
      ...Object.values(domainScores).map((d) => d.score)
    );

    const domains: DomainMapping[] = Object.entries(domainScores)
      .filter(([, data]) => data.files.size > 0)
      .map(([domain, data]) => ({
        domain,
        files: Array.from(data.files),
        confidence: Math.round((data.score / maxScore) * 100) / 100,
      }))
      .sort((a, b) => b.confidence - a.confidence);

    const suggestedNotebooks = this.generateNotebookSuggestions(domains);

    return {
      domains,
      suggestedNotebooks,
      fileCount: files.length,
      directoryCount,
    };
  }

  private collectFiles(dir: string, depth = 0): string[] {
    if (depth > 8) return []; // Prevent deep recursion

    const files: string[] = [];
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return files;
    }

    for (const entry of entries) {
      if (IGNORE_DIRS.has(entry.name) || IGNORE_FILES.has(entry.name)) continue;
      if (entry.name.startsWith(".") && entry.name !== ".env") continue;

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...this.collectFiles(fullPath, depth + 1));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }

    return files;
  }

  private isSourceFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return [".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte", ".py", ".go", ".rs"].includes(ext);
  }

  private readFileContent(filePath: string): string | null {
    try {
      const stat = fs.statSync(filePath);
      // Skip files > 100KB to keep analysis fast
      if (stat.size > 100 * 1024) return null;
      return fs.readFileSync(filePath, "utf-8");
    } catch {
      return null;
    }
  }

  private generateNotebookSuggestions(domains: DomainMapping[]): SuggestedNotebook[] {
    const notebooks: SuggestedNotebook[] = [];

    for (const { domain, files } of domains) {
      if (files.length === 0) continue;

      const suggestedNotes = this.suggestNotesForDomain(domain, files);
      if (suggestedNotes.length === 0) continue;

      notebooks.push({
        title: this.domainToTitle(domain),
        domain,
        suggestedNotes,
      });
    }

    return notebooks;
  }

  private suggestNotesForDomain(domain: string, files: string[]): string[] {
    // Group files by their immediate parent directory
    const groups: Record<string, string[]> = {};
    for (const file of files) {
      const dir = path.dirname(file);
      if (!groups[dir]) groups[dir] = [];
      groups[dir].push(path.basename(file));
    }

    const notes: string[] = [];
    for (const [dir, groupFiles] of Object.entries(groups)) {
      if (groupFiles.length === 1) {
        notes.push(
          `${this.fileToNoteTitle(groupFiles[0])} (${dir})`
        );
      } else {
        notes.push(
          `${this.dirToNoteTitle(dir)} — ${groupFiles.length} files`
        );
      }
    }

    return notes.slice(0, 10); // Cap at 10 suggestions per notebook
  }

  private domainToTitle(domain: string): string {
    const titles: Record<string, string> = {
      auth: "Authentication & Identity",
      payment: "Payments & Billing",
      ui: "User Interface",
      data: "Data & Models",
      api: "API & Endpoints",
      testing: "Testing",
      config: "Configuration",
      infra: "Infrastructure & Deployment",
    };
    return titles[domain] || domain.charAt(0).toUpperCase() + domain.slice(1);
  }

  private fileToNoteTitle(fileName: string): string {
    return fileName
      .replace(/\.\w+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (c) => c.toUpperCase());
  }

  private dirToNoteTitle(dir: string): string {
    const last = path.basename(dir);
    return this.fileToNoteTitle(last);
  }
}
