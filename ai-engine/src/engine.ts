import * as Y from "yjs";
import { AINotePeer } from "./yjs-peer";
import { CodeBridge } from "./code-bridge";
import { TranslatedConsole } from "./translated-console";
import { KnowledgeLayer } from "./knowledge-layer";
import { DomainAnalyzer } from "./domain-analyzer";
import { TimeEstimator } from "./time-estimator";
import { DebouncedIntentDetector, detectIntent } from "./intent-detector";
import type { IntentType, DetectedIntent } from "./intent-detector";
import { Config } from "./config";
import {
  handlePlanning,
  handleSpecifying,
  handleRequesting,
  handleFixing,
  handleQuestioning,
} from "./handlers";
import type { HandlerContext, HandlerResult } from "./handlers";
import type { AIEngineStatus } from "@plugin11/shared";

export interface EngineOptions {
  projectDir?: string;
  hocuspocusUrl?: string;
  authToken?: string;
}

/**
 * Main AI Engine orchestrator.
 *
 * Manages Yjs peer connections, runs the intent detection loop,
 * dispatches to handlers, and coordinates knowledge + code bridge.
 */
export class Engine {
  private peer: AINotePeer;
  private codeBridge: CodeBridge;
  private translatedConsole: TranslatedConsole;
  private knowledge: KnowledgeLayer;
  private domainAnalyzer: DomainAnalyzer;
  private timeEstimator: TimeEstimator;
  private config: Config;
  private projectDir: string;
  private workspaceId: string | null = null;

  // Per-note intent detectors
  private detectors: Map<string, DebouncedIntentDetector> = new Map();
  // Per-note content unsubscribers
  private watchers: Map<string, () => void> = new Map();

  private _running = false;

  constructor(options: EngineOptions = {}) {
    this.projectDir = options.projectDir || process.cwd();
    this.config = new Config(this.projectDir);

    const url = options.hocuspocusUrl || this.config.getHocuspocusUrl();
    const token = options.authToken || this.config.getAuthToken();

    this.peer = new AINotePeer(url, token);
    this.codeBridge = new CodeBridge(this.projectDir);
    this.translatedConsole = new TranslatedConsole();
    this.knowledge = new KnowledgeLayer(this.projectDir);
    this.domainAnalyzer = new DomainAnalyzer(this.projectDir);
    this.timeEstimator = new TimeEstimator();

    // Calibrate time estimator from historical data
    const historicalData = this.knowledge.parseAllocationLearnings();
    if (historicalData.length > 0) {
      this.timeEstimator.calibrate(historicalData);
    }
  }

  /** Start the engine and connect to a workspace */
  async start(workspaceId: string): Promise<void> {
    if (this._running) {
      console.log("[engine] Already running");
      return;
    }

    this.workspaceId = workspaceId;
    this._running = true;
    this.translatedConsole.start();

    console.log(`[engine] Starting AI Engine for workspace ${workspaceId}`);
    console.log(`[engine] Project directory: ${this.projectDir}`);

    // Scan the codebase for domains
    console.log("[engine] Scanning codebase...");
    const analysis = this.domainAnalyzer.analyze();
    console.log(
      `[engine] Found ${analysis.domains.length} domains across ${analysis.fileCount} files`
    );

    // Store domain analysis in knowledge layer
    for (const domain of analysis.domains) {
      this.knowledge.setDomainDoc(
        domain.domain,
        `# ${domain.domain}\n\nFiles: ${domain.files.length}\nConfidence: ${domain.confidence}\n\n${domain.files.slice(0, 20).join("\n")}`
      );
    }

    // Snapshot file hashes for drift detection
    this.codeBridge.snapshotFileHashes();

    console.log("[engine] AI Engine ready — watching for note changes");
  }

  /** Stop the engine and disconnect everything */
  async stop(): Promise<void> {
    console.log("[engine] Stopping AI Engine...");

    // Cancel all intent detectors
    for (const [, detector] of this.detectors) {
      detector.destroy();
    }
    this.detectors.clear();

    // Remove all watchers
    for (const [, unsub] of this.watchers) {
      unsub();
    }
    this.watchers.clear();

    // Disconnect from all notes
    this.peer.disconnectAll();
    this.translatedConsole.stop();

    this._running = false;
    this.workspaceId = null;

    console.log("[engine] AI Engine stopped");
  }

  /** Connect to a specific note and start watching for changes */
  async connectToNote(noteId: string): Promise<Y.Doc> {
    if (!this.workspaceId) {
      throw new Error("Engine not started — call start() first");
    }

    const doc = await this.peer.connectToNote(this.workspaceId, noteId);

    // Set AI engine state on the doc
    this.peer.setAIEngineState(doc, {
      connected: true,
      status: "idle",
      currentTask: null,
      currentNoteId: noteId,
    });

    // Set up content watcher with debounced intent detection
    const detector = new DebouncedIntentDetector((intent) => {
      this.handleIntent(noteId, doc, intent);
    });
    this.detectors.set(noteId, detector);

    const unsub = this.peer.onContentChange(doc, () => {
      const content = this.peer.readContent(doc);
      detector.onTextChange(content);
    });
    this.watchers.set(noteId, unsub);

    console.log(`[engine] Watching note ${noteId}`);

    return doc;
  }

  /** Disconnect from a specific note */
  disconnectFromNote(noteId: string): void {
    if (!this.workspaceId) return;

    // Clean up detector
    const detector = this.detectors.get(noteId);
    if (detector) {
      detector.destroy();
      this.detectors.delete(noteId);
    }

    // Clean up watcher
    const unsub = this.watchers.get(noteId);
    if (unsub) {
      unsub();
      this.watchers.delete(noteId);
    }

    this.peer.disconnectFromNote(this.workspaceId, noteId);
  }

  /** Handle a detected intent for a note */
  private async handleIntent(
    noteId: string,
    doc: Y.Doc,
    intent: DetectedIntent
  ): Promise<void> {
    if (intent.confidence < 0.1) return; // Ignore low-confidence detections

    console.log(
      `[engine] Intent detected on ${noteId}: ${intent.type} (${intent.confidence})`
    );

    const ctx: HandlerContext = {
      peer: this.peer,
      codeBridge: this.codeBridge,
      knowledge: this.knowledge,
      console: this.translatedConsole,
      workspaceId: this.workspaceId!,
      noteId,
      doc,
      noteContent: this.peer.readContent(doc),
    };

    try {
      const result = await this.dispatchHandler(intent.type, ctx);
      console.log(
        `[engine] Handler ${intent.type} completed: ${result.message}`
      );
    } catch (err) {
      console.error(
        `[engine] Handler ${intent.type} failed:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  /** Dispatch to the appropriate handler based on intent type */
  private async dispatchHandler(
    intentType: IntentType,
    ctx: HandlerContext
  ): Promise<HandlerResult> {
    switch (intentType) {
      case "planning":
        return handlePlanning(ctx);
      case "specifying":
        return handleSpecifying(ctx);
      case "requesting":
      case "describing_ui":
      case "describing_data":
        return handleRequesting(ctx);
      case "fixing":
        return handleFixing(ctx);
      case "questioning":
        return handleQuestioning(ctx);
      default:
        return {
          success: false,
          action: "unknown",
          message: `No handler for intent type: ${intentType}`,
        };
    }
  }

  /** Manually trigger suggestion generation for a note */
  async generateSuggestion(
    noteId: string,
    noteContent: string
  ): Promise<HandlerResult> {
    if (!this.workspaceId) {
      throw new Error("Engine not started");
    }

    const doc = await this.peer.connectToNote(this.workspaceId, noteId);
    const intent = detectIntent(noteContent);

    const ctx: HandlerContext = {
      peer: this.peer,
      codeBridge: this.codeBridge,
      knowledge: this.knowledge,
      console: this.translatedConsole,
      workspaceId: this.workspaceId,
      noteId,
      doc,
      noteContent,
    };

    return this.dispatchHandler(intent.type, ctx);
  }

  /** Manually trigger correction generation for a note */
  async generateCorrection(
    noteId: string,
    noteContent: string
  ): Promise<HandlerResult> {
    if (!this.workspaceId) {
      throw new Error("Engine not started");
    }

    const doc = await this.peer.connectToNote(this.workspaceId, noteId);

    // Use specifying handler for corrections
    const ctx: HandlerContext = {
      peer: this.peer,
      codeBridge: this.codeBridge,
      knowledge: this.knowledge,
      console: this.translatedConsole,
      workspaceId: this.workspaceId,
      noteId,
      doc,
      noteContent,
    };

    return handleSpecifying(ctx);
  }

  /** Get the current engine status */
  getStatus(): AIEngineStatus {
    return {
      connected: this.peer.isConnected(),
      status: this.peer.getStatus() === "idle"
        ? "idle"
        : this.peer.getStatus() === "thinking"
          ? "thinking"
          : "writing",
      currentTask: null,
      currentNoteId: null,
    };
  }

  /** Get component references for direct access */
  getPeer(): AINotePeer {
    return this.peer;
  }

  getCodeBridge(): CodeBridge {
    return this.codeBridge;
  }

  getTranslatedConsole(): TranslatedConsole {
    return this.translatedConsole;
  }

  getKnowledge(): KnowledgeLayer {
    return this.knowledge;
  }

  getDomainAnalyzer(): DomainAnalyzer {
    return this.domainAnalyzer;
  }

  getTimeEstimator(): TimeEstimator {
    return this.timeEstimator;
  }

  getConfig(): Config {
    return this.config;
  }

  isRunning(): boolean {
    return this._running;
  }
}
