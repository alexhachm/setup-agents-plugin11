import type { HandlerContext, HandlerResult } from "./types";

/**
 * Specifying handler — validates specifications against existing notes.
 * Flags contradictions, missing constraints, and incomplete specs.
 */
export async function handleSpecifying(ctx: HandlerContext): Promise<HandlerResult> {
  const { peer, doc, noteContent, knowledge, noteId } = ctx;

  peer.setStatus("thinking");

  const specs = extractSpecifications(noteContent);
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for vague specifications
  for (const spec of specs) {
    const vagueWords = findVagueTerms(spec);
    if (vagueWords.length > 0) {
      issues.push(
        `Vague term(s) found: "${vagueWords.join('", "')}". Consider making them more specific.`
      );
    }
  }

  // Check for missing acceptance criteria
  if (!hasAcceptanceCriteria(noteContent)) {
    suggestions.push(
      "Consider adding acceptance criteria (Given/When/Then or a checklist)."
    );
  }

  // Check for contradictions with known patterns
  const mistakes = knowledge.getMistakes();
  if (mistakes) {
    const contradictions = findContradictions(noteContent, mistakes);
    for (const contradiction of contradictions) {
      peer.writeAnnotation(doc, {
        id: `spec-contradict-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "contradicts",
        message: contradiction,
      });
    }
  }

  // Write any suggestions as bot text
  if (suggestions.length > 0 || issues.length > 0) {
    const parts: string[] = [];
    if (issues.length > 0) {
      parts.push(`**Issues:**\n${issues.map((i) => `- ${i}`).join("\n")}`);
    }
    if (suggestions.length > 0) {
      parts.push(`**Suggestions:**\n${suggestions.map((s) => `- ${s}`).join("\n")}`);
    }

    peer.writeBotText(doc, {
      id: `spec-${Date.now()}`,
      noteId,
      content: parts.join("\n\n"),
      position: -1,
      status: "pending",
      createdAt: new Date(),
    });
  }

  peer.setStatus("idle");

  return {
    success: true,
    action: "specifying",
    message: `Validated ${specs.length} specifications, found ${issues.length} issues`,
    suggestions,
    errors: issues,
  };
}

function extractSpecifications(content: string): string[] {
  const lines = content.split("\n");
  const specs: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Lines starting with "must", "should", "shall", bullet points with constraints
    if (/^(must|should|shall|the system|it must|it should)/i.test(trimmed)) {
      specs.push(trimmed);
    }
    if (/^[-*]\s/.test(trimmed) && /\b(must|should|shall|require|validate)\b/i.test(trimmed)) {
      specs.push(trimmed);
    }
  }

  return specs;
}

const VAGUE_TERMS = [
  "fast",
  "quick",
  "efficient",
  "scalable",
  "simple",
  "easy",
  "good",
  "nice",
  "proper",
  "appropriate",
  "reasonable",
  "adequate",
  "enough",
  "many",
  "few",
  "some",
  "various",
  "etc",
];

function findVagueTerms(text: string): string[] {
  const lower = text.toLowerCase();
  return VAGUE_TERMS.filter((term) => {
    const regex = new RegExp(`\\b${term}\\b`, "i");
    return regex.test(lower);
  });
}

function hasAcceptanceCriteria(content: string): boolean {
  return (
    /given\s.+when\s.+then/i.test(content) ||
    /acceptance criteria/i.test(content) ||
    /\[[ x]\]/i.test(content) // Checkboxes
  );
}

function findContradictions(content: string, mistakes: string): string[] {
  // Simple keyword overlap detection between current content and known mistakes
  const contentWords = new Set(
    content.toLowerCase().match(/\b\w{4,}\b/g) || []
  );
  const contradictions: string[] = [];

  for (const line of mistakes.split("\n")) {
    if (!line.trim()) continue;
    const mistakeWords = line.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const overlap = mistakeWords.filter((w) => contentWords.has(w));
    if (overlap.length >= 3) {
      contradictions.push(
        `Potential conflict with known issue: ${line.trim().slice(0, 100)}`
      );
    }
  }

  return contradictions.slice(0, 3); // Limit to 3 to avoid noise
}
