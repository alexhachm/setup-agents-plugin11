"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  WebContainerManager,
  type WebContainerStatus,
} from "@/lib/webcontainer";
import type { FileSystemTree } from "@webcontainer/api";

interface LivePreviewProps {
  files: FileSystemTree;
  onStatusChange?: (status: WebContainerStatus) => void;
  onConsoleOutput?: (data: string) => void;
}

const STATUS_MESSAGES: Record<WebContainerStatus, string> = {
  idle: "Preview idle",
  booting: "Booting WebContainer...",
  installing: "Installing dependencies...",
  starting: "Starting dev server...",
  running: "Preview running",
  error: "Preview error",
};

export function LivePreview({
  files,
  onStatusChange,
  onConsoleOutput,
}: LivePreviewProps) {
  const [status, setStatus] = useState<WebContainerStatus>("idle");
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const managerRef = useRef<WebContainerManager | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleStatusChange = useCallback(
    (newStatus: WebContainerStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange]
  );

  useEffect(() => {
    const manager = new WebContainerManager({
      onStatusChange: handleStatusChange,
      onServerReady: (url) => {
        setServerUrl(url);
        setError(null);
      },
      onError: (err) => {
        setError(err);
      },
      onConsoleOutput: (data) => {
        onConsoleOutput?.(data);
      },
    });

    managerRef.current = manager;

    async function startPreview() {
      try {
        await manager.boot(files);
        await manager.installDependencies();
        await manager.startDevServer();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to start preview"
        );
      }
    }

    startPreview();

    return () => {
      manager.teardown();
      managerRef.current = null;
    };
  }, []); // Only boot once on mount

  // Sync file changes for hot reload
  useEffect(() => {
    if (managerRef.current && status === "running") {
      managerRef.current.syncFiles(files);
    }
  }, [files, status]);

  function handleRefresh() {
    if (iframeRef.current && serverUrl) {
      iframeRef.current.src = serverUrl;
    }
  }

  // Loading state
  if (status !== "running" && status !== "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-background">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">{STATUS_MESSAGES[status]}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            WebContainers run entirely in your browser
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-background p-6">
        <span className="text-4xl">{"\u26A0\uFE0F"}</span>
        <div className="text-center">
          <p className="text-sm font-medium text-destructive">
            Preview Error
          </p>
          <p className="mt-2 max-w-md text-xs text-muted-foreground">
            {error}
          </p>
        </div>
        <button
          onClick={() => {
            setError(null);
            if (managerRef.current) {
              managerRef.current
                .teardown()
                .then(() => managerRef.current?.boot(files))
                .then(() => managerRef.current?.installDependencies())
                .then(() => managerRef.current?.startDevServer());
            }
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Running state — show iframe
  return (
    <div className="flex h-full flex-col bg-background">
      {serverUrl && (
        <iframe
          ref={iframeRef}
          src={serverUrl}
          className="flex-1 border-0"
          title="Live Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          allow="cross-origin-isolated"
        />
      )}
    </div>
  );
}
