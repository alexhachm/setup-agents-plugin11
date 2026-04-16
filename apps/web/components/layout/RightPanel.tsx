"use client";

import { useState, useCallback } from "react";
import { ChatPanel } from "../ai/ChatPanel";
import { NoteHistory } from "../history/NoteHistory";
import { CodeHistory, type CodeHistoryEntry } from "../history/CodeHistory";
import { CodeHistoryToggle } from "../history/CodeHistoryToggle";
import type { NoteHistoryItem } from "../history/NoteHistoryEntry";

type Tab = "chat" | "comments" | "history";
type HistoryView = "note" | "code";

interface RightPanelProps {
  noteId?: string;
}

// Demo snapshot data for development
const DEMO_SNAPSHOTS: NoteHistoryItem[] = [
  {
    id: "snap-1",
    noteId: "note-1",
    trigger: "manual",
    description: "Maya added dietary filter spec",
    createdBy: "user-1",
    createdByName: "Maya",
    createdAt: new Date(Date.now() - 30 * 60_000),
  },
  {
    id: "snap-2",
    noteId: "note-1",
    trigger: "ai_change",
    description: "AI Engine implemented 7 changes",
    createdBy: "ai-engine",
    createdByName: "AI Engine",
    createdAt: new Date(Date.now() - 2 * 3600_000),
  },
  {
    id: "snap-3",
    noteId: "note-1",
    trigger: "timer",
    description: "Auto-saved (periodic)",
    createdBy: "system",
    createdByName: "System",
    createdAt: new Date(Date.now() - 5 * 3600_000),
  },
];

const DEMO_CODE_ENTRIES: CodeHistoryEntry[] = [
  {
    id: "code-1",
    gitCommitHash: "a1b2c3d",
    triggeredBy: "ai-engine",
    triggeredByName: "AI Engine",
    description: "Implemented 2FA trigger for payment flow",
    createdAt: new Date(Date.now() - 2 * 3600_000),
    fileSnapshots: [
      { filePath: "src/auth/2fa.ts", changeType: "added" },
      { filePath: "src/payment/checkout.ts", changeType: "modified" },
    ],
    linkedNoteId: "note-1",
    linkedNoteTitle: "Payment Flow",
  },
];

export function RightPanel({ noteId }: RightPanelProps = {}) {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [historyView, setHistoryView] = useState<HistoryView>("note");

  const tabs: { id: Tab; label: string }[] = [
    { id: "chat", label: "Chat" },
    { id: "comments", label: "Comments" },
    { id: "history", label: "History" },
  ];

  const handleRestore = useCallback(async (_snapshotId: string) => {
    // In production, this would call the snapshot restore API
    console.log("Restoring snapshot:", _snapshotId);
  }, []);

  const getSnapshotContent = useCallback(
    async (_snapshotId: string): Promise<string> => {
      // In production, this would fetch the snapshot content
      return "Previous version content would appear here.";
    },
    []
  );

  return (
    <aside className="flex w-80 flex-col border-l border-border bg-card">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" && <ChatPanel />}
        {activeTab === "comments" && (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
            No comments yet. Select text in the editor and add a comment.
          </div>
        )}
        {activeTab === "history" && (
          <div className="flex h-full flex-col">
            {/* History view toggle */}
            <div className="flex items-center justify-center border-b border-border py-2">
              <CodeHistoryToggle
                active={historyView}
                onChange={setHistoryView}
              />
            </div>

            {/* History content */}
            <div className="flex-1 overflow-hidden">
              {historyView === "note" ? (
                <NoteHistory
                  noteId={noteId || ""}
                  snapshots={DEMO_SNAPSHOTS}
                  onRestore={handleRestore}
                  getSnapshotContent={getSnapshotContent}
                  currentContent="Current note content."
                />
              ) : (
                <CodeHistory
                  entries={DEMO_CODE_ENTRIES}
                  onViewDiff={(id) => console.log("View diff:", id)}
                  onRestore={(id) => console.log("Restore code:", id)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
