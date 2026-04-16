"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";
import { StatusBar } from "./StatusBar";
import type { GranularityLevel, EditorView } from "@plugin11/shared";

interface ShellProps {
  workspaceId: string;
  children: React.ReactNode;
}

export function Shell({ workspaceId, children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [granularity, setGranularity] = useState<GranularityLevel>("intermediate");
  const [view, setView] = useState<EditorView>("notes");

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Bar */}
      <header className="flex h-12 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded p-1 hover:bg-accent"
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-bold text-primary">Plugin 11</span>
          <span className="text-sm text-muted-foreground">Workspace</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <button className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
            <kbd className="rounded bg-background px-1.5 py-0.5 text-xs">&#8984;K</kbd>
          </button>

          {/* Share button */}
          <button className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent">
            Share
          </button>

          {/* Chat panel toggle */}
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="rounded p-1.5 hover:bg-accent"
            aria-label="Toggle chat panel"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          {/* User avatar */}
          <div className="h-7 w-7 rounded-full bg-primary/20 text-center text-xs font-medium leading-7 text-primary">
            U
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <Sidebar workspaceId={workspaceId} granularity={granularity} />
        )}

        {/* Editor area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>

        {/* Right panel (chat, comments, history) */}
        {rightPanelOpen && <RightPanel />}
      </div>

      {/* Status bar */}
      <StatusBar
        granularity={granularity}
        onGranularityChange={setGranularity}
        view={view}
        onViewChange={setView}
      />
    </div>
  );
}
