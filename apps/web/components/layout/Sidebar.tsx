"use client";

import { useState } from "react";
import { NotebookList } from "../notebooks/NotebookList";
import { CreateNotebook } from "../notebooks/CreateNotebook";
import type { GranularityLevel } from "@plugin11/shared";

interface SidebarProps {
  workspaceId: string;
  granularity: GranularityLevel;
}

export function Sidebar({ workspaceId, granularity }: SidebarProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Notebooks
        </h2>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="New notebook"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-auto px-2">
        <NotebookList workspaceId={workspaceId} granularity={granularity} />
      </div>

      {showCreateDialog && (
        <CreateNotebook
          workspaceId={workspaceId}
          onClose={() => setShowCreateDialog(false)}
        />
      )}
    </aside>
  );
}
