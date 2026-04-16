"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";
import { StatusBar } from "./StatusBar";
import { CommandPalette } from "./CommandPalette";
import { ShortcutOverlay } from "./ShortcutOverlay";
import { GranularitySelector } from "./GranularitySelector";
import { registerShortcuts } from "@/lib/keyboard-shortcuts";
import { loadGranularityPreference } from "@/lib/granularity";
import type { GranularityLevel, EditorView } from "@plugin11/shared";

interface ShellProps {
  workspaceId: string;
  children: React.ReactNode;
}

// Demo data for command palette
const DEMO_NOTES = [
  { id: "n1", type: "note" as const, title: "Login Flow", subtitle: "Auth notebook" },
  { id: "n2", type: "note" as const, title: "SSO Integration", subtitle: "Auth notebook" },
  { id: "n3", type: "note" as const, title: "Stripe Integration", subtitle: "Payment notebook" },
  { id: "n4", type: "note" as const, title: "User Table", subtitle: "Data notebook" },
  { id: "n5", type: "note" as const, title: "Dashboard Layout", subtitle: "UI/UX notebook" },
];

const DEMO_NOTEBOOKS = [
  { id: "nb1", type: "notebook" as const, title: "Auth", subtitle: "3 notes" },
  { id: "nb2", type: "notebook" as const, title: "Payment", subtitle: "2 notes" },
  { id: "nb3", type: "notebook" as const, title: "UI/UX", subtitle: "4 notes" },
];

const DEMO_RECENT = [
  { id: "n1", type: "recent" as const, title: "Login Flow", subtitle: "Edited 5 min ago" },
  { id: "n3", type: "recent" as const, title: "Stripe Integration", subtitle: "Edited 1 hour ago" },
];

export function Shell({ workspaceId, children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [granularity, setGranularity] = useState<GranularityLevel>("intermediate");
  const [view, setView] = useState<EditorView>("notes");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Load saved granularity preference
  useEffect(() => {
    setGranularity(loadGranularityPreference());
  }, []);

  // Cycle through views
  const cycleView = useCallback(() => {
    const views: EditorView[] = ["notes", "code", "split", "preview"];
    setView((current: EditorView) => {
      const idx = views.indexOf(current);
      return views[(idx + 1) % views.length];
    });
  }, []);

  // Register keyboard shortcuts
  useEffect(() => {
    return registerShortcuts((action) => {
      switch (action) {
        case "command-palette":
          setCommandPaletteOpen((prev) => !prev);
          break;
        case "toggle-chat":
          setRightPanelOpen((prev) => !prev);
          break;
        case "toggle-sidebar":
          setSidebarOpen((prev) => !prev);
          break;
        case "toggle-view":
          cycleView();
          break;
        case "show-shortcuts":
          setShortcutsOpen((prev) => !prev);
          break;
        case "manual-snapshot":
          // Trigger snapshot save
          break;
        case "undo":
          // Trigger note-level undo
          break;
        case "redo":
          // Trigger redo
          break;
      }
    });
  }, [cycleView]);

  const handleCommandSelect = (item: { id: string; type: string; title: string }) => {
    if (item.type === "action") {
      switch (item.id) {
        case "toggle-view":
          cycleView();
          break;
        case "open-settings":
          // Navigate to settings
          break;
      }
    }
    // For notes/notebooks, would navigate to the item
  };

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
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-[9px] font-black text-primary-foreground">
              11
            </div>
            <span className="text-sm font-bold">Plugin 11</span>
          </div>
          <span className="text-sm text-muted-foreground">Workspace</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search / Command palette trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
          >
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

      {/* Command palette overlay */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelect={handleCommandSelect}
        notes={DEMO_NOTES}
        notebooks={DEMO_NOTEBOOKS}
        recentNotes={DEMO_RECENT}
      />

      {/* Shortcuts overlay */}
      <ShortcutOverlay
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
