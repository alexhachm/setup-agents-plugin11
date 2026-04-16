#!/usr/bin/env node

import { Engine } from "./engine";
import { Config } from "./config";
import { APIServer } from "./cloud/api-server";

// ── Re-exports for library usage ──
export { AINotePeer } from "./yjs-peer";
export { CodeBridge } from "./code-bridge";
export { TranslatedConsole } from "./translated-console";
export { Engine } from "./engine";
export { Config } from "./config";
export { KnowledgeLayer } from "./knowledge-layer";
export { DomainAnalyzer } from "./domain-analyzer";
export { TimeEstimator } from "./time-estimator";
export { detectIntent, DebouncedIntentDetector } from "./intent-detector";
export { APIServer } from "./cloud/api-server";
export * from "./handlers";
export {
  parseMarkdownFile,
  parseMarkdownFiles,
  parsePDFBuffer,
  parseNotionExport,
  parseNotionMarkdownExport,
} from "./importers";

// ── Intent types ──
export type { IntentType, DetectedIntent } from "./intent-detector";
export type { EstimateInput, EstimateResult } from "./time-estimator";
export type { DomainMapping, AnalysisResult, SuggestedNotebook } from "./domain-analyzer";
export type { DriftReport, CodeChange, NoteUpdate } from "./code-bridge";
export type { ConsoleMessage, TranslationContext, BuildPhase } from "./translated-console";
export type { KnowledgeContext } from "./knowledge-layer";
export type { Plugin11Config } from "./config";
export type { EngineOptions } from "./engine";

// ── CLI ──

function printUsage(): void {
  console.log(`
plugin11 — AI Engine for Plugin 11 Vibe Coder IDE

Usage:
  plugin11 connect [--workspace <id>]   Connect to a workspace
  plugin11 config set provider <name>   Set AI provider
  plugin11 config set api-key <key>     Set API key
  plugin11 config get <key>             Get a config value
  plugin11 status                       Show connection status
  plugin11 serve [--port <port>]        Start Cloud Mode API server
  plugin11 scan [--dir <path>]          Scan codebase for domains
  plugin11 help                         Show this help message
`);
}

function parseArgs(argv: string[]): { command: string; args: string[]; flags: Record<string, string> } {
  const args: string[] = [];
  const flags: Record<string, string> = {};

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i += 2;
      } else {
        flags[key] = "true";
        i++;
      }
    } else {
      args.push(arg);
      i++;
    }
  }

  const command = args[0] || "help";
  return { command, args: args.slice(1), flags };
}

async function main(): Promise<void> {
  // Skip node and script path
  const rawArgs = process.argv.slice(2);
  const { command, args, flags } = parseArgs(rawArgs);

  switch (command) {
    case "connect": {
      const workspaceId = flags.workspace || args[0];
      if (!workspaceId) {
        console.error("Error: workspace ID is required");
        console.error("Usage: plugin11 connect --workspace <id>");
        process.exit(1);
      }

      const engine = new Engine({ projectDir: process.cwd() });
      await engine.start(workspaceId);

      console.log(`[plugin11] Connected to workspace ${workspaceId}`);
      console.log("[plugin11] AI Engine is running. Press Ctrl+C to stop.");

      // Keep process alive
      const shutdown = async () => {
        console.log("\n[plugin11] Shutting down...");
        await engine.stop();
        process.exit(0);
      };
      process.on("SIGINT", shutdown);
      process.on("SIGTERM", shutdown);
      break;
    }

    case "config": {
      const config = new Config();
      const subcommand = args[0];

      if (subcommand === "set") {
        const key = args[1];
        const value = args[2];
        if (!key || !value) {
          console.error("Usage: plugin11 config set <key> <value>");
          console.error("Keys: provider, api-key, workspace-url, workspace-id, auth-token");
          process.exit(1);
        }

        const keyMap: Record<string, keyof import("./config").Plugin11Config> = {
          provider: "provider",
          "api-key": "api_key",
          "workspace-url": "workspace_url",
          "workspace-id": "workspace_id",
          "auth-token": "auth_token",
        };

        const configKey = keyMap[key];
        if (!configKey) {
          console.error(`Unknown config key: ${key}`);
          console.error("Valid keys: provider, api-key, workspace-url, workspace-id, auth-token");
          process.exit(1);
        }

        config.set(configKey, value);
        console.log(`[config] Set ${key} = ${key === "api-key" ? "***" : value}`);
      } else if (subcommand === "get") {
        const key = args[1];
        if (!key) {
          // Show all config
          const all = config.getAll();
          for (const [k, v] of Object.entries(all)) {
            const display = k === "api_key" && v ? "***" : (v || "(not set)");
            console.log(`  ${k}: ${display}`);
          }
        } else {
          const keyMap: Record<string, keyof import("./config").Plugin11Config> = {
            provider: "provider",
            "api-key": "api_key",
            "workspace-url": "workspace_url",
            "workspace-id": "workspace_id",
            "auth-token": "auth_token",
          };
          const configKey = keyMap[key];
          if (!configKey) {
            console.error(`Unknown config key: ${key}`);
            process.exit(1);
          }
          const value = config.get(configKey);
          console.log(value || "(not set)");
        }
      } else {
        console.error("Usage: plugin11 config <set|get> ...");
        process.exit(1);
      }
      break;
    }

    case "status": {
      const config = new Config();
      const all = config.getAll();

      console.log("Plugin 11 AI Engine Status");
      console.log("─".repeat(40));
      console.log(`  Provider:      ${all.provider || "(not set)"}`);
      console.log(`  API Key:       ${all.api_key ? "***" : "(not set)"}`);
      console.log(`  Workspace URL: ${all.workspace_url || "(default: ws://localhost:1234)"}`);
      console.log(`  Workspace ID:  ${all.workspace_id || "(not set)"}`);
      console.log(`  Auth Token:    ${all.auth_token ? "***" : "(not set)"}`);
      break;
    }

    case "serve": {
      const port = parseInt(flags.port || "3100", 10);
      const server = new APIServer();
      await server.start(port);

      console.log(`[plugin11] Cloud API server running on port ${port}`);
      console.log("[plugin11] Press Ctrl+C to stop.");

      const shutdown = async () => {
        console.log("\n[plugin11] Shutting down server...");
        await server.stop();
        process.exit(0);
      };
      process.on("SIGINT", shutdown);
      process.on("SIGTERM", shutdown);
      break;
    }

    case "scan": {
      const dir = flags.dir || process.cwd();
      const { DomainAnalyzer } = await import("./domain-analyzer");
      const analyzer = new DomainAnalyzer(dir);
      const result = analyzer.analyze();

      console.log("Codebase Domain Analysis");
      console.log("─".repeat(40));
      console.log(`  Files scanned: ${result.fileCount}`);
      console.log(`  Directories:   ${result.directoryCount}`);
      console.log(`  Domains found: ${result.domains.length}`);
      console.log("");

      for (const domain of result.domains) {
        console.log(`  ${domain.domain} (${Math.round(domain.confidence * 100)}% confidence)`);
        console.log(`    ${domain.files.length} files`);
      }

      if (result.suggestedNotebooks.length > 0) {
        console.log("\nSuggested Notebooks:");
        for (const nb of result.suggestedNotebooks) {
          console.log(`  📓 ${nb.title} (${nb.domain})`);
          for (const note of nb.suggestedNotes.slice(0, 5)) {
            console.log(`     - ${note}`);
          }
        }
      }
      break;
    }

    case "help":
    default:
      printUsage();
      break;
  }
}

// Only run main when executed directly
if (require.main === module) {
  main().catch((err) => {
    console.error("[plugin11] Fatal error:", err);
    process.exit(1);
  });
}
