import { AINotePeer } from "./yjs-peer";
import { CodeBridge } from "./code-bridge";
import { TranslatedConsole } from "./translated-console";

export { AINotePeer } from "./yjs-peer";
export { CodeBridge } from "./code-bridge";
export { TranslatedConsole } from "./translated-console";

/**
 * AI Engine entry point.
 *
 * In dev mode, this runs as a local Node.js process connecting
 * to the Hocuspocus server at ws://localhost:1234.
 *
 * In cloud mode, the same classes are instantiated by API workers
 * connecting to wss://api.yourapp.com.
 */
async function main() {
  const hocuspocusUrl =
    process.env.HOCUSPOCUS_URL || "ws://localhost:1234";
  const aiToken = process.env.AI_ENGINE_TOKEN || "";

  console.log("[ai-engine] Starting AI Engine in dev mode");
  console.log(`[ai-engine] Connecting to Hocuspocus at ${hocuspocusUrl}`);

  const peer = new AINotePeer(hocuspocusUrl, aiToken);
  const codeBridge = new CodeBridge();
  const console_ = new TranslatedConsole();

  // Log initialization
  console.log("[ai-engine] AI Engine initialized");
  console.log("[ai-engine] Components:");
  console.log(`  - Yjs Peer: ${peer.isConnected() ? "connected" : "ready"}`);
  console.log(`  - CodeBridge: initialized`);
  console.log(`  - TranslatedConsole: ${console_.isActive() ? "active" : "ready"}`);
  console.log("[ai-engine] Waiting for connections...");
}

// Only run main when executed directly
if (require.main === module) {
  main().catch(console.error);
}
