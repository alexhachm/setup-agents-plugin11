import type { HandlerContext, HandlerResult } from "./types";

/**
 * Planning handler — enters a planning loop when the user is
 * outlining structure, milestones, or architecture.
 *
 * Suggests structure, identifies dependencies between notes,
 * and asks clarifying questions via decision blocks.
 */
export async function handlePlanning(ctx: HandlerContext): Promise<HandlerResult> {
  const { peer, doc, noteContent, knowledge, noteId } = ctx;

  peer.setStatus("thinking");

  // Analyze the planning content
  const sections = extractPlanSections(noteContent);
  const suggestions: string[] = [];

  // Check for missing plan elements
  if (!sections.hasGoal) {
    suggestions.push("Consider adding a clear goal statement at the top of this plan.");
  }
  if (!sections.hasMilestones) {
    suggestions.push("Break this plan into milestones or phases for better tracking.");
  }
  if (!sections.hasDependencies) {
    suggestions.push("Identify dependencies between items — what must happen before what?");
  }

  // Check knowledge for relevant patterns
  const patterns = knowledge.getPatterns();
  if (patterns) {
    suggestions.push(
      "Previous patterns found in knowledge base — consider reviewing for relevant approaches."
    );
  }

  // Look for open questions
  const questions = extractQuestions(noteContent);
  if (questions.length > 0) {
    for (const q of questions) {
      peer.writeAnnotation(doc, {
        id: `plan-q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "gap",
        message: `Open question: ${q}`,
      });
    }
  }

  // Write suggestions as bot text
  if (suggestions.length > 0) {
    const suggestionText = suggestions.map((s) => `- ${s}`).join("\n");
    peer.writeBotText(doc, {
      id: `plan-${Date.now()}`,
      noteId,
      content: `**Planning suggestions:**\n${suggestionText}`,
      position: -1, // Append at end
      status: "pending",
      createdAt: new Date(),
    });
  }

  peer.setStatus("idle");

  return {
    success: true,
    action: "planning",
    message: `Analyzed plan with ${sections.itemCount} items, generated ${suggestions.length} suggestions`,
    suggestions,
  };
}

interface PlanSections {
  hasGoal: boolean;
  hasMilestones: boolean;
  hasDependencies: boolean;
  itemCount: number;
}

function extractPlanSections(content: string): PlanSections {
  const lower = content.toLowerCase();
  return {
    hasGoal: /goal|objective|purpose|aim/i.test(content),
    hasMilestones: /milestone|phase|sprint|week|stage|step \d/i.test(content),
    hasDependencies: /depends? on|before|after|requires|blocks|prerequisite/i.test(content),
    itemCount: (content.match(/^[-*]\s/gm) || []).length + (content.match(/^\d+\.\s/gm) || []).length,
  };
}

function extractQuestions(content: string): string[] {
  const lines = content.split("\n");
  return lines
    .filter((line) => line.trim().endsWith("?"))
    .map((line) => line.trim());
}
