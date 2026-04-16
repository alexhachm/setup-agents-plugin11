"use client";

import { useState } from "react";
import { ChatPanel } from "../ai/ChatPanel";

type Tab = "chat" | "comments" | "history";

export function RightPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  const tabs: { id: Tab; label: string }[] = [
    { id: "chat", label: "Chat" },
    { id: "comments", label: "Comments" },
    { id: "history", label: "History" },
  ];

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
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
            Note history will appear here when editing a note.
          </div>
        )}
      </div>
    </aside>
  );
}
