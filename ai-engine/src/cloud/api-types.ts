import type { AIEngineStatus, NoteComplexity, CodeMapping } from "@plugin11/shared";
import type { EstimateResult } from "../time-estimator";
import type { AnalysisResult } from "../domain-analyzer";
import type { HandlerResult } from "../handlers";

// ── Connect ──

export interface ConnectRequest {
  workspace_id: string;
  auth_token: string;
  project_dir?: string;
}

export interface ConnectResponse {
  success: boolean;
  websocket_url: string;
  workspace_id: string;
  message: string;
}

// ── Suggest ──

export interface SuggestRequest {
  workspace_id: string;
  note_id: string;
  note_content: string;
}

export interface SuggestResponse {
  success: boolean;
  result: HandlerResult;
}

// ── Correct ──

export interface CorrectRequest {
  workspace_id: string;
  note_id: string;
  note_content: string;
}

export interface CorrectResponse {
  success: boolean;
  result: HandlerResult;
}

// ── Plan ──

export interface PlanRequest {
  workspace_id: string;
  note_id: string;
  note_content: string;
}

export interface PlanResponse {
  success: boolean;
  result: HandlerResult;
}

// ── Implement ──

export interface ImplementRequest {
  workspace_id: string;
  note_id: string;
  note_content: string;
  plan_id?: string;
}

export interface ImplementResponse {
  success: boolean;
  result: HandlerResult;
}

// ── Analyze Domain ──

export interface AnalyzeDomainRequest {
  project_dir: string;
}

export interface AnalyzeDomainResponse {
  success: boolean;
  result: AnalysisResult;
}

// ── Estimate ──

export interface EstimateRequest {
  notes: { note_id: string; complexity: NoteComplexity }[];
}

export interface EstimateResponse {
  success: boolean;
  result: EstimateResult;
}

// ── Status ──

export interface StatusResponse {
  success: boolean;
  engine: AIEngineStatus;
  connections: number;
  rooms: string[];
}

// ── Health ──

export interface HealthResponse {
  status: "ok" | "degraded" | "down";
  version: string;
  uptime_seconds: number;
}

// ── Error ──

export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
}
