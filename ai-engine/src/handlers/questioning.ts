import type { HandlerContext, HandlerResult } from "./types";

/**
 * Questioning handler — answers questions using the knowledge layer.
 * Cites specific notes and provides context from the codebase.
 */
export async function handleQuestioning(ctx: HandlerContext): Promise<HandlerResult> {
  const { peer, doc, noteContent, knowledge, noteId } = ctx;

  peer.setStatus("thinking");

  // Extract the question from the note content
  const questions = extractQuestions(noteContent);
  if (questions.length === 0) {
    peer.setStatus("idle");
    return {
      success: true,
      action: "questioning",
      message: "No clear questions found in note content",
      suggestions: ["Try phrasing your question more explicitly."],
    };
  }

  // Gather knowledge context
  const knowledgeContext = knowledge.getFullContext();
  const answers: string[] = [];

  for (const question of questions) {
    const answer = findAnswer(question, knowledgeContext);
    answers.push(answer);
  }

  // Write answers as bot text
  const responseContent = formatAnswers(questions, answers);
  peer.writeBotText(doc, {
    id: `answer-${Date.now()}`,
    noteId,
    content: responseContent,
    position: -1,
    status: "pending",
    createdAt: new Date(),
  });

  peer.setStatus("idle");

  return {
    success: true,
    action: "questioning",
    message: `Answered ${questions.length} question(s) from knowledge base`,
    suggestions: answers,
  };
}

function extractQuestions(content: string): string[] {
  const lines = content.split("\n");
  const questions: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.endsWith("?")) {
      questions.push(trimmed);
    }
    // Also detect implicit questions
    if (/^(how|what|why|when|where|which|who|does|can|should|would|is it)\s/i.test(trimmed) && !trimmed.endsWith("?")) {
      questions.push(trimmed + "?");
    }
  }

  return questions;
}

interface KnowledgeSearchResult {
  source: string;
  relevance: number;
  excerpt: string;
}

function findAnswer(
  question: string,
  context: {
    codebaseInsights: string;
    patterns: string;
    mistakes: string;
    domainDocs: Record<string, string>;
    allocationLearnings: string;
  }
): string {
  const questionWords = new Set(
    question.toLowerCase().match(/\b\w{3,}\b/g) || []
  );

  // Search all knowledge sources
  const results: KnowledgeSearchResult[] = [];

  // Search codebase insights
  if (context.codebaseInsights) {
    const relevance = scoreRelevance(questionWords, context.codebaseInsights);
    if (relevance > 0) {
      results.push({
        source: "Codebase Insights",
        relevance,
        excerpt: extractRelevantExcerpt(questionWords, context.codebaseInsights),
      });
    }
  }

  // Search patterns
  if (context.patterns) {
    const relevance = scoreRelevance(questionWords, context.patterns);
    if (relevance > 0) {
      results.push({
        source: "Patterns",
        relevance,
        excerpt: extractRelevantExcerpt(questionWords, context.patterns),
      });
    }
  }

  // Search domain docs
  for (const [domain, content] of Object.entries(context.domainDocs)) {
    const relevance = scoreRelevance(questionWords, content);
    if (relevance > 0) {
      results.push({
        source: `Domain: ${domain}`,
        relevance,
        excerpt: extractRelevantExcerpt(questionWords, content),
      });
    }
  }

  // Search mistakes for learning from past issues
  if (context.mistakes) {
    const relevance = scoreRelevance(questionWords, context.mistakes);
    if (relevance > 0) {
      results.push({
        source: "Previous Issues",
        relevance,
        excerpt: extractRelevantExcerpt(questionWords, context.mistakes),
      });
    }
  }

  // Sort by relevance
  results.sort((a, b) => b.relevance - a.relevance);

  if (results.length === 0) {
    return "No relevant information found in the knowledge base for this question.";
  }

  // Build answer from best results
  const parts: string[] = [];
  for (const result of results.slice(0, 3)) {
    parts.push(`From **${result.source}**: ${result.excerpt}`);
  }

  return parts.join("\n\n");
}

function scoreRelevance(questionWords: Set<string>, content: string): number {
  const contentLower = content.toLowerCase();
  let matches = 0;
  for (const word of questionWords) {
    if (contentLower.includes(word)) {
      matches++;
    }
  }
  return matches / Math.max(questionWords.size, 1);
}

function extractRelevantExcerpt(questionWords: Set<string>, content: string): string {
  const lines = content.split("\n");
  let bestLine = "";
  let bestScore = 0;

  for (const line of lines) {
    if (!line.trim()) continue;
    const lineLower = line.toLowerCase();
    let score = 0;
    for (const word of questionWords) {
      if (lineLower.includes(word)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestLine = line.trim();
    }
  }

  return bestLine || content.trim().split("\n")[0]?.trim() || "See knowledge base for details.";
}

function formatAnswers(questions: string[], answers: string[]): string {
  const parts: string[] = [];
  parts.push("**Answers from Knowledge Base**\n");

  for (let i = 0; i < questions.length; i++) {
    parts.push(`**Q:** ${questions[i]}`);
    parts.push(`**A:** ${answers[i]}`);
    if (i < questions.length - 1) parts.push("");
  }

  return parts.join("\n");
}
