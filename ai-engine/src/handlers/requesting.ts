import type { HandlerContext, HandlerResult } from "./types";

/**
 * Requesting handler — generates an implementation plan and
 * coordinates execution when the user requests code to be built.
 */
export async function handleRequesting(ctx: HandlerContext): Promise<HandlerResult> {
  const { peer, doc, noteContent, codeBridge, knowledge, noteId, console: tc } = ctx;

  peer.setStatus("thinking");
  tc.setPhase("ideating");

  // Parse the request to identify what needs to be built
  const request = parseRequest(noteContent);

  // Check knowledge for relevant context
  const insights = knowledge.getCodebaseInsights();
  const patterns = knowledge.getPatterns();

  // Generate an implementation plan
  const plan = generatePlan(request, insights, patterns);

  // Write the plan as a bot text suggestion
  peer.writeBotText(doc, {
    id: `impl-plan-${Date.now()}`,
    noteId,
    content: formatPlan(plan),
    position: -1,
    status: "pending",
    createdAt: new Date(),
  });

  tc.setPhase("implementing");

  // Set up code mappings for the planned files
  for (const file of plan.files) {
    codeBridge.addMapping(noteId, file.path, "generated");
  }

  // Mark the note as in_progress
  peer.setNoteStatus(doc, "in_progress");

  peer.setStatus("idle");
  tc.setPhase("done");

  return {
    success: true,
    action: "requesting",
    message: `Generated implementation plan with ${plan.steps.length} steps affecting ${plan.files.length} files`,
    suggestions: plan.steps,
  };
}

interface ParsedRequest {
  action: string;
  target: string;
  details: string[];
  constraints: string[];
}

interface ImplementationPlan {
  steps: string[];
  files: { path: string; action: "create" | "modify" }[];
  estimatedComplexity: "simple" | "medium" | "complex";
}

function parseRequest(content: string): ParsedRequest {
  const lines = content.split("\n").filter((l) => l.trim());
  const firstLine = lines[0] || "";

  // Extract action verb
  const actionMatch = firstLine.match(
    /^(implement|create|build|add|make|generate|write|set up|configure|integrate|connect|refactor)\s+/i
  );
  const action = actionMatch ? actionMatch[1].toLowerCase() : "implement";

  // The rest of the first line is the target
  const target = firstLine.replace(/^(implement|create|build|add|make|generate|write|set up|configure|integrate|connect|refactor)\s+/i, "").trim();

  // Remaining lines are details and constraints
  const details: string[] = [];
  const constraints: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^(must|should|constraint|require|limit)/i.test(line)) {
      constraints.push(line);
    } else if (line.startsWith("-") || line.startsWith("*") || /^\d+\./.test(line)) {
      details.push(line.replace(/^[-*\d.]\s*/, ""));
    }
  }

  return { action, target, details, constraints };
}

function generatePlan(
  request: ParsedRequest,
  _insights: string,
  _patterns: string
): ImplementationPlan {
  const steps: string[] = [];
  const files: { path: string; action: "create" | "modify" }[] = [];

  // Generate steps based on the action type
  steps.push(`Analyze requirements: ${request.target}`);

  if (request.details.length > 0) {
    steps.push(`Implement ${request.details.length} specified features`);
  }

  if (request.constraints.length > 0) {
    steps.push(`Validate against ${request.constraints.length} constraints`);
  }

  steps.push("Write implementation code");
  steps.push("Update related notes with implementation status");

  // Estimate complexity
  const totalItems = request.details.length + request.constraints.length;
  let estimatedComplexity: "simple" | "medium" | "complex" = "simple";
  if (totalItems > 5) estimatedComplexity = "complex";
  else if (totalItems > 2) estimatedComplexity = "medium";

  return { steps, files, estimatedComplexity };
}

function formatPlan(plan: ImplementationPlan): string {
  const parts: string[] = [];

  parts.push("**Implementation Plan**\n");
  parts.push(`Complexity: ${plan.estimatedComplexity}\n`);

  parts.push("**Steps:**");
  for (let i = 0; i < plan.steps.length; i++) {
    parts.push(`${i + 1}. ${plan.steps[i]}`);
  }

  if (plan.files.length > 0) {
    parts.push("\n**Files:**");
    for (const file of plan.files) {
      parts.push(`- ${file.action}: ${file.path}`);
    }
  }

  return parts.join("\n");
}
