import type { NoteStatus, GranularityLevel } from "./types";

export const NOTE_STATUS_LABELS: Record<NoteStatus, { emoji: string; label: string }> = {
  idea: { emoji: "\u{1F4A1}", label: "Idea" },
  planned: { emoji: "\u{1F4CB}", label: "Planned" },
  in_progress: { emoji: "\u{1F528}", label: "In Progress" },
  implemented: { emoji: "\u2705", label: "Implemented" },
  tested: { emoji: "\u{1F9EA}", label: "Tested" },
  broken: { emoji: "\u{1F534}", label: "Broken" },
};

export const GRANULARITY_LABELS: Record<GranularityLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const AI_ENGINE_USER = {
  name: "AI Engine",
  color: "#8B5CF6",
} as const;

export const SPECIAL_TAGS = {
  OPEN_QUESTION: "?open-question",
  FLAG: "!flag",
} as const;

export const COMPLEXITY_WEIGHTS: Record<string, number> = {
  simple: 1.0,
  medium: 2.5,
  complex: 6.0,
};

export const DEFAULT_COLLAB_PORT = 1234;
export const DEFAULT_WEB_PORT = 3000;
