"use client";

import { useState, useRef, useCallback } from "react";
import { LivePreview } from "./LivePreview";
import {
  PreviewToolbar,
  DEVICE_SIZES,
  type DeviceSize,
} from "./PreviewToolbar";
import type { WebContainerStatus } from "@/lib/webcontainer";
import type { FileSystemTree } from "@webcontainer/api";

interface PreviewPanelProps {
  files: FileSystemTree;
  onClose: () => void;
}

export function PreviewPanel({ files, onClose }: PreviewPanelProps) {
  const [deviceSize, setDeviceSize] = useState<DeviceSize>("desktop");
  const [showConsole, setShowConsole] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [status, setStatus] = useState<WebContainerStatus>("idle");
  const [previewKey, setPreviewKey] = useState(0);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const handleConsoleOutput = useCallback((data: string) => {
    setConsoleOutput((prev) => [...prev.slice(-200), data]);
    // Auto-scroll console
    requestAnimationFrame(() => {
      consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  const handleRefresh = () => {
    // Increment key to force remount of LivePreview
    setPreviewKey((k) => k + 1);
  };

  const selectedDevice = DEVICE_SIZES.find((d) => d.id === deviceSize)!;

  return (
    <div className="flex h-full flex-col border-t border-border bg-background">
      {/* Toolbar */}
      <PreviewToolbar
        deviceSize={deviceSize}
        onDeviceSizeChange={setDeviceSize}
        onRefresh={handleRefresh}
        showConsole={showConsole}
        onToggleConsole={() => setShowConsole(!showConsole)}
        onClose={onClose}
      />

      {/* URL bar */}
      <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-3 py-1">
        <div className="flex-1 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground font-mono">
          {status === "running"
            ? "localhost:3000"
            : STATUS_MESSAGES_SHORT[status]}
        </div>
        <button
          onClick={() => {
            // Open in new tab would work in production with the real URL
          }}
          title="Open in new tab"
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </button>
      </div>

      {/* Preview area */}
      <div className="flex flex-1 items-start justify-center overflow-auto bg-muted/30 p-4">
        <div
          className="h-full overflow-hidden rounded-lg border border-border bg-white shadow-lg transition-all duration-300"
          style={{
            width: selectedDevice.width,
            maxWidth: "100%",
          }}
        >
          <LivePreview
            key={previewKey}
            files={files}
            onStatusChange={setStatus}
            onConsoleOutput={handleConsoleOutput}
          />
        </div>
      </div>

      {/* Console panel */}
      {showConsole && (
        <div className="h-48 border-t border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3 py-1">
            <span className="text-xs font-medium text-muted-foreground">
              Console
            </span>
            <button
              onClick={() => setConsoleOutput([])}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          <div className="h-[calc(100%-28px)] overflow-auto p-2">
            <pre className="text-xs font-mono text-muted-foreground">
              {consoleOutput.length === 0 ? (
                <span className="text-muted-foreground/50">
                  Console output will appear here...
                </span>
              ) : (
                consoleOutput.map((line, idx) => (
                  <div key={idx} className="py-0.5">
                    {line}
                  </div>
                ))
              )}
              <div ref={consoleEndRef} />
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_MESSAGES_SHORT: Record<WebContainerStatus, string> = {
  idle: "...",
  booting: "Booting...",
  installing: "Installing deps...",
  starting: "Starting server...",
  running: "localhost:3000",
  error: "Error",
};
