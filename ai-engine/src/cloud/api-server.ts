import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { Engine } from "../engine";
import { DomainAnalyzer } from "../domain-analyzer";
import { TimeEstimator } from "../time-estimator";
import type {
  ConnectRequest,
  ConnectResponse,
  SuggestRequest,
  SuggestResponse,
  CorrectRequest,
  CorrectResponse,
  PlanRequest,
  PlanResponse,
  ImplementRequest,
  ImplementResponse,
  AnalyzeDomainRequest,
  AnalyzeDomainResponse,
  EstimateRequest,
  EstimateResponse,
  StatusResponse,
  HealthResponse,
  ErrorResponse,
} from "./api-types";

const VERSION = "0.1.0";

/**
 * Cloud mode API server — exposes the AI engine as HTTP endpoints.
 * These endpoints call the same internal functions as dev mode.
 * The protocol is identical — only the transport differs.
 */
export class APIServer {
  private engine: Engine | null = null;
  private server: ReturnType<typeof createServer> | null = null;
  private startTime = Date.now();

  /**
   * Start the HTTP API server on the given port.
   */
  async start(port = 3100): Promise<void> {
    this.startTime = Date.now();

    this.server = createServer((req, res) => {
      this.handleRequest(req, res).catch((err) => {
        console.error("[api-server] Unhandled error:", err);
        sendJson(res, 500, {
          success: false,
          error: "Internal server error",
          code: "INTERNAL_ERROR",
        } satisfies ErrorResponse);
      });
    });

    return new Promise((resolve) => {
      this.server!.listen(port, () => {
        console.log(`[api-server] Cloud API server listening on port ${port}`);
        resolve();
      });
    });
  }

  /** Stop the API server */
  async stop(): Promise<void> {
    if (this.engine) {
      await this.engine.stop();
      this.engine = null;
    }
    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => {
          console.log("[api-server] Server stopped");
          resolve();
        });
      });
    }
  }

  private async handleRequest(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const url = req.url || "";
    const method = req.method || "GET";

    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // Route matching
    if (method === "GET" && url === "/api/v1/health") {
      return this.handleHealth(res);
    }
    if (method === "GET" && url === "/api/v1/status") {
      return this.handleStatus(res);
    }
    if (method === "POST" && url === "/api/v1/connect") {
      return this.handleConnect(req, res);
    }
    if (method === "POST" && url === "/api/v1/suggest") {
      return this.handleSuggest(req, res);
    }
    if (method === "POST" && url === "/api/v1/correct") {
      return this.handleCorrect(req, res);
    }
    if (method === "POST" && url === "/api/v1/plan") {
      return this.handlePlan(req, res);
    }
    if (method === "POST" && url === "/api/v1/implement") {
      return this.handleImplement(req, res);
    }
    if (method === "POST" && url === "/api/v1/analyze-domain") {
      return this.handleAnalyzeDomain(req, res);
    }
    if (method === "POST" && url === "/api/v1/estimate") {
      return this.handleEstimate(req, res);
    }

    sendJson(res, 404, {
      success: false,
      error: "Not found",
      code: "NOT_FOUND",
    } satisfies ErrorResponse);
  }

  // ── Health Check ──

  private handleHealth(res: ServerResponse): void {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    sendJson(res, 200, {
      status: "ok",
      version: VERSION,
      uptime_seconds: uptimeSeconds,
    } satisfies HealthResponse);
  }

  // ── Status ──

  private handleStatus(res: ServerResponse): void {
    if (!this.engine) {
      sendJson(res, 200, {
        success: true,
        engine: { connected: false, status: "idle", currentTask: null, currentNoteId: null },
        connections: 0,
        rooms: [],
      } satisfies StatusResponse);
      return;
    }

    const status = this.engine.getStatus();
    const peer = this.engine.getPeer();

    sendJson(res, 200, {
      success: true,
      engine: status,
      connections: peer.connectionCount(),
      rooms: peer.connectedRooms(),
    } satisfies StatusResponse);
  }

  // ── Connect ──

  private async handleConnect(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const body = await readBody<ConnectRequest>(req);
    if (!body?.workspace_id || !body?.auth_token) {
      sendJson(res, 400, {
        success: false,
        error: "workspace_id and auth_token are required",
        code: "INVALID_REQUEST",
      } satisfies ErrorResponse);
      return;
    }

    // Stop existing engine if running
    if (this.engine) {
      await this.engine.stop();
    }

    this.engine = new Engine({
      projectDir: body.project_dir,
      authToken: body.auth_token,
    });

    await this.engine.start(body.workspace_id);

    const wsUrl = this.engine.getConfig().getHocuspocusUrl();

    sendJson(res, 200, {
      success: true,
      websocket_url: wsUrl,
      workspace_id: body.workspace_id,
      message: "Connected to workspace",
    } satisfies ConnectResponse);
  }

  // ── Suggest ──

  private async handleSuggest(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const body = await readBody<SuggestRequest>(req);
    if (!body?.note_id || !body?.note_content) {
      sendJson(res, 400, {
        success: false,
        error: "note_id and note_content are required",
        code: "INVALID_REQUEST",
      } satisfies ErrorResponse);
      return;
    }

    if (!this.engine?.isRunning()) {
      sendJson(res, 400, {
        success: false,
        error: "Engine not running — call /connect first",
        code: "NOT_CONNECTED",
      } satisfies ErrorResponse);
      return;
    }

    const result = await this.engine.generateSuggestion(
      body.note_id,
      body.note_content
    );

    sendJson(res, 200, { success: true, result } satisfies SuggestResponse);
  }

  // ── Correct ──

  private async handleCorrect(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const body = await readBody<CorrectRequest>(req);
    if (!body?.note_id || !body?.note_content) {
      sendJson(res, 400, {
        success: false,
        error: "note_id and note_content are required",
        code: "INVALID_REQUEST",
      } satisfies ErrorResponse);
      return;
    }

    if (!this.engine?.isRunning()) {
      sendJson(res, 400, {
        success: false,
        error: "Engine not running — call /connect first",
        code: "NOT_CONNECTED",
      } satisfies ErrorResponse);
      return;
    }

    const result = await this.engine.generateCorrection(
      body.note_id,
      body.note_content
    );

    sendJson(res, 200, { success: true, result } satisfies CorrectResponse);
  }

  // ── Plan ──

  private async handlePlan(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const body = await readBody<PlanRequest>(req);
    if (!body?.note_id || !body?.note_content) {
      sendJson(res, 400, {
        success: false,
        error: "note_id and note_content are required",
        code: "INVALID_REQUEST",
      } satisfies ErrorResponse);
      return;
    }

    if (!this.engine?.isRunning()) {
      sendJson(res, 400, {
        success: false,
        error: "Engine not running — call /connect first",
        code: "NOT_CONNECTED",
      } satisfies ErrorResponse);
      return;
    }

    const result = await this.engine.generateSuggestion(
      body.note_id,
      body.note_content
    );

    sendJson(res, 200, { success: true, result } satisfies PlanResponse);
  }

  // ── Implement ──

  private async handleImplement(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const body = await readBody<ImplementRequest>(req);
    if (!body?.note_id || !body?.note_content) {
      sendJson(res, 400, {
        success: false,
        error: "note_id and note_content are required",
        code: "INVALID_REQUEST",
      } satisfies ErrorResponse);
      return;
    }

    if (!this.engine?.isRunning()) {
      sendJson(res, 400, {
        success: false,
        error: "Engine not running — call /connect first",
        code: "NOT_CONNECTED",
      } satisfies ErrorResponse);
      return;
    }

    const result = await this.engine.generateSuggestion(
      body.note_id,
      body.note_content
    );

    sendJson(res, 200, { success: true, result } satisfies ImplementResponse);
  }

  // ── Analyze Domain ──

  private async handleAnalyzeDomain(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const body = await readBody<AnalyzeDomainRequest>(req);
    if (!body?.project_dir) {
      sendJson(res, 400, {
        success: false,
        error: "project_dir is required",
        code: "INVALID_REQUEST",
      } satisfies ErrorResponse);
      return;
    }

    const analyzer = new DomainAnalyzer(body.project_dir);
    const result = analyzer.analyze();

    sendJson(res, 200, { success: true, result } satisfies AnalyzeDomainResponse);
  }

  // ── Estimate ──

  private async handleEstimate(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const body = await readBody<EstimateRequest>(req);
    if (!body?.notes || !Array.isArray(body.notes)) {
      sendJson(res, 400, {
        success: false,
        error: "notes array is required",
        code: "INVALID_REQUEST",
      } satisfies ErrorResponse);
      return;
    }

    const estimator = this.engine?.getTimeEstimator() || new TimeEstimator();
    const result = estimator.estimate(
      body.notes.map((n) => ({
        noteId: n.note_id,
        complexity: n.complexity,
      }))
    );

    sendJson(res, 200, { success: true, result } satisfies EstimateResponse);
  }
}

// ── Helpers ──

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readBody<T>(req: IncomingMessage): Promise<T | null> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf-8");
        resolve(raw ? JSON.parse(raw) : null);
      } catch {
        resolve(null);
      }
    });
    req.on("error", () => resolve(null));
  });
}
