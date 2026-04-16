import type { HandlerContext, HandlerResult } from "./types";

/**
 * Fixing handler — diagnostic loop for broken features.
 * Traces through notes and code to identify the root cause.
 */
export async function handleFixing(ctx: HandlerContext): Promise<HandlerResult> {
  const { peer, doc, noteContent, codeBridge, knowledge, noteId, console: tc } = ctx;

  peer.setStatus("thinking");
  tc.setPhase("ideating");

  // Extract the bug/issue description
  const diagnosis = diagnose(noteContent);

  // Check knowledge base for known issues
  const mistakes = knowledge.getMistakes();
  const knownFix = findKnownFix(diagnosis.symptoms, mistakes);

  const suggestions: string[] = [];
  const errors: string[] = [];

  if (knownFix) {
    suggestions.push(`Known issue found: ${knownFix}`);
    peer.writeAnnotation(doc, {
      id: `fix-known-${Date.now()}`,
      type: "suggestion",
      message: `Previously seen: ${knownFix}`,
    });
  }

  // Check code mappings for affected files
  const mappings = codeBridge.getMappings(noteId);
  if (mappings.length > 0) {
    // Run drift detection on mapped files
    const drifts = codeBridge.detectDrift();
    const relevantDrifts = drifts.filter((d) => d.noteId === noteId);

    for (const drift of relevantDrifts) {
      errors.push(`Drift detected: ${drift.detail}`);
      peer.writeAnnotation(doc, {
        id: `fix-drift-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "drift",
        message: drift.detail,
      });
    }
  }

  // Generate diagnostic suggestions
  if (diagnosis.hasErrorMessage) {
    suggestions.push(
      "Error message detected — check the stack trace for the root file and line."
    );
  }
  if (diagnosis.hasReproSteps) {
    suggestions.push(
      "Reproduction steps found — this helps narrow down the issue."
    );
  } else {
    suggestions.push(
      "Consider adding reproduction steps to help diagnose the issue."
    );
  }

  // Write diagnostic report as bot text
  const report = formatDiagnosticReport(diagnosis, suggestions, errors);
  peer.writeBotText(doc, {
    id: `fix-${Date.now()}`,
    noteId,
    content: report,
    position: -1,
    status: "pending",
    createdAt: new Date(),
  });

  // Mark the note as broken if not already
  const metadata = peer.getMetadata(doc);
  const currentStatus = metadata.get("status") as string | undefined;
  if (currentStatus !== "broken") {
    peer.setNoteStatus(doc, "broken");
  }

  // Record the issue in knowledge base
  knowledge.addMistake(
    `Note ${noteId}: ${diagnosis.summary}`
  );

  peer.setStatus("idle");
  tc.setPhase("done");

  return {
    success: true,
    action: "fixing",
    message: `Diagnosed issue: ${diagnosis.summary}`,
    suggestions,
    errors,
  };
}

interface Diagnosis {
  summary: string;
  symptoms: string[];
  hasErrorMessage: boolean;
  hasReproSteps: boolean;
  errorMessages: string[];
  affectedAreas: string[];
}

function diagnose(content: string): Diagnosis {
  const lines = content.split("\n");
  const symptoms: string[] = [];
  const errorMessages: string[] = [];
  const affectedAreas: string[] = [];
  let hasReproSteps = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect error messages
    if (/error|exception|crash|fail|TypeError|ReferenceError/i.test(trimmed)) {
      errorMessages.push(trimmed);
    }

    // Detect symptoms
    if (/doesn't work|not working|broken|wrong|unexpected|missing/i.test(trimmed)) {
      symptoms.push(trimmed);
    }

    // Detect reproduction steps
    if (/steps? to reproduce|repro|how to reproduce|to trigger/i.test(trimmed)) {
      hasReproSteps = true;
    }

    // Detect affected areas
    if (/in (the )?(login|signup|checkout|dashboard|settings|api|database)/i.test(trimmed)) {
      const match = trimmed.match(/in (the )?(login|signup|checkout|dashboard|settings|api|database)/i);
      if (match) affectedAreas.push(match[2]);
    }
  }

  // Generate summary from first meaningful line
  const summary =
    symptoms[0] ||
    errorMessages[0] ||
    lines.find((l) => l.trim().length > 10)?.trim() ||
    "Unspecified issue";

  return {
    summary: summary.slice(0, 200),
    symptoms,
    hasErrorMessage: errorMessages.length > 0,
    hasReproSteps,
    errorMessages,
    affectedAreas,
  };
}

function findKnownFix(symptoms: string[], mistakes: string): string | null {
  if (!mistakes || symptoms.length === 0) return null;

  const symptomWords = new Set(
    symptoms
      .join(" ")
      .toLowerCase()
      .match(/\b\w{4,}\b/g) || []
  );

  for (const line of mistakes.split("\n")) {
    if (!line.trim()) continue;
    const lineWords = line.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const overlap = lineWords.filter((w) => symptomWords.has(w));
    if (overlap.length >= 2) {
      return line.trim().slice(0, 150);
    }
  }

  return null;
}

function formatDiagnosticReport(
  diagnosis: Diagnosis,
  suggestions: string[],
  errors: string[]
): string {
  const parts: string[] = [];

  parts.push("**Diagnostic Report**\n");
  parts.push(`Summary: ${diagnosis.summary}\n`);

  if (diagnosis.errorMessages.length > 0) {
    parts.push("**Errors found:**");
    for (const err of diagnosis.errorMessages.slice(0, 5)) {
      parts.push(`- ${err}`);
    }
    parts.push("");
  }

  if (diagnosis.affectedAreas.length > 0) {
    parts.push(`**Affected areas:** ${diagnosis.affectedAreas.join(", ")}\n`);
  }

  if (errors.length > 0) {
    parts.push("**Code drift:**");
    for (const e of errors) {
      parts.push(`- ${e}`);
    }
    parts.push("");
  }

  if (suggestions.length > 0) {
    parts.push("**Suggestions:**");
    for (const s of suggestions) {
      parts.push(`- ${s}`);
    }
  }

  return parts.join("\n");
}
