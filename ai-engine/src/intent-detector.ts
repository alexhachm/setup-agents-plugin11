export type IntentType =
  | "planning"
  | "specifying"
  | "describing_ui"
  | "describing_data"
  | "questioning"
  | "fixing"
  | "requesting";

export interface DetectedIntent {
  type: IntentType;
  confidence: number; // 0.0 – 1.0
  keywords: string[];
}

const KEYWORD_MAP: Record<IntentType, string[]> = {
  planning: [
    "plan",
    "outline",
    "roadmap",
    "milestone",
    "phase",
    "breakdown",
    "structure",
    "organize",
    "schedule",
    "epic",
    "steps",
    "strategy",
    "architecture",
    "design",
    "approach",
  ],
  specifying: [
    "spec",
    "specification",
    "requirement",
    "must",
    "should",
    "shall",
    "constraint",
    "acceptance criteria",
    "given",
    "when",
    "then",
    "validate",
    "rule",
    "invariant",
  ],
  describing_ui: [
    "button",
    "form",
    "page",
    "layout",
    "modal",
    "dialog",
    "screen",
    "component",
    "input",
    "dropdown",
    "navigation",
    "sidebar",
    "header",
    "footer",
    "ui",
    "interface",
    "display",
    "render",
    "style",
    "color",
    "font",
    "responsive",
  ],
  describing_data: [
    "database",
    "table",
    "column",
    "field",
    "schema",
    "model",
    "entity",
    "relation",
    "foreign key",
    "index",
    "query",
    "migration",
    "data",
    "record",
    "store",
    "persist",
    "api",
    "endpoint",
    "payload",
  ],
  questioning: [
    "?",
    "how",
    "what",
    "why",
    "when",
    "where",
    "which",
    "who",
    "does",
    "can",
    "should",
    "would",
    "is it",
    "are there",
    "explain",
    "clarify",
    "understand",
  ],
  fixing: [
    "bug",
    "fix",
    "broken",
    "error",
    "crash",
    "fail",
    "wrong",
    "issue",
    "doesn't work",
    "not working",
    "regression",
    "debug",
    "trace",
    "stack trace",
    "exception",
    "undefined",
    "null",
    "timeout",
  ],
  requesting: [
    "implement",
    "create",
    "build",
    "add",
    "make",
    "generate",
    "write",
    "code",
    "develop",
    "ship",
    "deploy",
    "set up",
    "install",
    "configure",
    "integrate",
    "connect",
    "refactor",
  ],
};

// Sentence structure patterns that boost confidence
const STRUCTURE_PATTERNS: { pattern: RegExp; intent: IntentType; boost: number }[] = [
  { pattern: /^(let's|we should|we need to) plan/i, intent: "planning", boost: 0.2 },
  { pattern: /^(the|this) .+ (should|must|shall)/i, intent: "specifying", boost: 0.15 },
  { pattern: /\?$/m, intent: "questioning", boost: 0.25 },
  { pattern: /^(how|what|why|when|where|which|who) /im, intent: "questioning", boost: 0.2 },
  { pattern: /^(fix|debug|investigate|trace)/i, intent: "fixing", boost: 0.2 },
  { pattern: /^(implement|create|build|add|make|generate)/i, intent: "requesting", boost: 0.25 },
  { pattern: /^(the user sees|display|show|render|the page)/i, intent: "describing_ui", boost: 0.15 },
  { pattern: /(stores?|persists?|saves?) .+ (in|to) (the )?database/i, intent: "describing_data", boost: 0.15 },
];

function countKeywordMatches(text: string, keywords: string[]): { count: number; matched: string[] } {
  const lower = text.toLowerCase();
  const matched: string[] = [];
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) {
      matched.push(kw);
    }
  }
  return { count: matched.length, matched };
}

export function detectIntent(text: string): DetectedIntent {
  if (!text.trim()) {
    return { type: "requesting", confidence: 0, keywords: [] };
  }

  const scores: { type: IntentType; score: number; keywords: string[] }[] = [];

  for (const [intentType, keywords] of Object.entries(KEYWORD_MAP)) {
    const { count, matched } = countKeywordMatches(text, keywords);
    // Base score from keyword density
    const baseScore = Math.min(count / 3, 1.0);
    scores.push({ type: intentType as IntentType, score: baseScore, keywords: matched });
  }

  // Apply structure pattern boosts
  for (const { pattern, intent, boost } of STRUCTURE_PATTERNS) {
    if (pattern.test(text)) {
      const entry = scores.find((s) => s.type === intent);
      if (entry) {
        entry.score = Math.min(entry.score + boost, 1.0);
      }
    }
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];

  return {
    type: best.type,
    confidence: Math.round(best.score * 100) / 100,
    keywords: best.keywords,
  };
}

// Debounced intent detection
export class DebouncedIntentDetector {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private delayMs: number;
  private callback: (intent: DetectedIntent) => void;

  constructor(callback: (intent: DetectedIntent) => void, delayMs = 1500) {
    this.callback = callback;
    this.delayMs = delayMs;
  }

  /** Call this each time the user types. The callback fires after the user stops for delayMs. */
  onTextChange(text: string): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.timer = null;
      const intent = detectIntent(text);
      this.callback(intent);
    }, this.delayMs);
  }

  cancel(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  destroy(): void {
    this.cancel();
  }
}
