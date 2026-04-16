import type * as Y from "yjs";
import type { AINotePeer } from "../yjs-peer";
import type { CodeBridge } from "../code-bridge";
import type { KnowledgeLayer } from "../knowledge-layer";
import type { TranslatedConsole } from "../translated-console";

export interface HandlerContext {
  peer: AINotePeer;
  codeBridge: CodeBridge;
  knowledge: KnowledgeLayer;
  console: TranslatedConsole;
  workspaceId: string;
  noteId: string;
  doc: Y.Doc;
  noteContent: string;
}

export interface HandlerResult {
  success: boolean;
  action: string;
  message: string;
  suggestions?: string[];
  errors?: string[];
}
