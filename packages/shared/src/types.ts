// ── Entity types matching the architecture spec ──

export type WorkspacePlan = "free" | "pro" | "team";

export type WorkspaceRole =
  | "owner"
  | "admin"
  | "editor"
  | "viewer"
  | "suggestion_only";

export type NotebookStatus = "draft" | "active" | "archived";

export type NoteStatus =
  | "idea"
  | "planned"
  | "in_progress"
  | "implemented"
  | "tested"
  | "broken";

export type GranularityLevel = "beginner" | "intermediate" | "advanced";

export type SharingScope = "workspace" | "per_notebook";

export type LinkSharingPermission = "disabled" | "view" | "comment" | "edit";

export type SharePermission = "view" | "comment" | "edit" | "suggestion_only";

export type SnapshotTrigger = "manual" | "auto" | "ai_change" | "timer";

export type CodeMappingType = "primary" | "related" | "generated";

export type NoteComplexity = "simple" | "medium" | "complex";

// ── Core entities ──

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  plan: WorkspacePlan;
  creditBalance: number;
  createdAt: Date;
}

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  creditShare: number | null;
  invitedAt: Date;
}

export interface Notebook {
  id: string;
  workspaceId: string;
  title: string;
  icon: string;
  domain: string | null;
  order: number;
  status: NotebookStatus;
  visibilityTier: GranularityLevel;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  notebookId: string;
  title: string;
  yjsDocId: string;
  status: NoteStatus;
  tags: string[];
  order: number;
  visibilityTier: GranularityLevel;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SharingLink {
  id: string;
  resourceType: "workspace" | "notebook" | "note";
  resourceId: string;
  permission: SharePermission;
  token: string;
  createdById: string;
  createdAt: Date;
}

export interface Snapshot {
  id: string;
  noteId: string;
  trigger: SnapshotTrigger;
  description: string;
  createdById: string;
  createdAt: Date;
  yjsState: Uint8Array;
}

export interface CodeMapping {
  noteId: string;
  filePath: string;
  startLine: number | null;
  endLine: number | null;
  mappingType: CodeMappingType;
}

// ── AI-related types ──

export interface BotTextSuggestion {
  id: string;
  noteId: string;
  content: string;
  position: number;
  status: "pending" | "accepted" | "dismissed";
  createdAt: Date;
}

export interface AICorrection {
  id: string;
  noteId: string;
  originalText: string;
  correctedText: string;
  explanation: string;
  sourceNoteId: string | null;
  status: "pending" | "kept" | "reverted" | "clarified";
}

export interface TimeEstimate {
  id: string;
  taskDescription: string;
  affectedNotes: string[];
  complexityBreakdown: ComplexityLine[];
  estimatedMinutes: number;
  computedAt: Date;
}

export interface ComplexityLine {
  noteId: string;
  complexity: NoteComplexity;
  weight: number;
  avgMinutes: number;
}

// ── View types ──

export type EditorView = "notes" | "code" | "split" | "preview";

export interface PresenceUser {
  id: string;
  name: string;
  color: string;
  cursor: { anchor: number; head: number } | null;
  status: "idle" | "thinking" | "writing" | "viewing";
}

export interface AIEngineStatus {
  connected: boolean;
  status: "idle" | "thinking" | "writing" | "implementing" | "testing";
  currentTask: string | null;
  currentNoteId: string | null;
}
