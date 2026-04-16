"use client";

import { useState } from "react";
import Link from "next/link";
import { isVisibleAtLevel } from "@plugin11/shared";
import type { GranularityLevel, NotebookStatus } from "@plugin11/shared";

interface NotebookItem {
  id: string;
  title: string;
  icon: string;
  status: NotebookStatus;
  visibilityTier: GranularityLevel;
  notes: {
    id: string;
    title: string;
    status: string;
    visibilityTier: GranularityLevel;
  }[];
}

interface NotebookListProps {
  workspaceId: string;
  granularity: GranularityLevel;
}

// Demo data for the scaffold
const DEMO_NOTEBOOKS: NotebookItem[] = [
  {
    id: "nb-1",
    title: "Auth",
    icon: "\u{1F4D3}",
    status: "active",
    visibilityTier: "beginner",
    notes: [
      { id: "n-1", title: "Login Flow", status: "implemented", visibilityTier: "beginner" },
      { id: "n-2", title: "SSO Integration", status: "planned", visibilityTier: "intermediate" },
      { id: "n-3", title: "Role Permissions", status: "idea", visibilityTier: "beginner" },
    ],
  },
  {
    id: "nb-2",
    title: "Payment",
    icon: "\u{1F4D3}",
    status: "active",
    visibilityTier: "beginner",
    notes: [
      { id: "n-4", title: "Stripe Setup", status: "in_progress", visibilityTier: "intermediate" },
      { id: "n-5", title: "Pricing Tiers", status: "idea", visibilityTier: "beginner" },
    ],
  },
  {
    id: "nb-3",
    title: "Infrastructure",
    icon: "\u{1F4D3}",
    status: "active",
    visibilityTier: "advanced",
    notes: [
      { id: "n-6", title: "Docker Setup", status: "implemented", visibilityTier: "advanced" },
      { id: "n-7", title: "CI/CD Pipeline", status: "planned", visibilityTier: "advanced" },
    ],
  },
];

const STATUS_EMOJI: Record<string, string> = {
  idea: "\u{1F4A1}",
  planned: "\u{1F4CB}",
  in_progress: "\u{1F528}",
  implemented: "\u2705",
  tested: "\u{1F9EA}",
  broken: "\u{1F534}",
};

export function NotebookList({ workspaceId, granularity }: NotebookListProps) {
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(
    new Set(DEMO_NOTEBOOKS.map((nb) => nb.id))
  );

  const visibleNotebooks = DEMO_NOTEBOOKS.filter((nb) =>
    isVisibleAtLevel(nb.visibilityTier, granularity)
  );

  const toggleNotebook = (id: string) => {
    setExpandedNotebooks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-1">
      {visibleNotebooks.map((notebook) => {
        const isExpanded = expandedNotebooks.has(notebook.id);
        const visibleNotes = notebook.notes.filter((note) =>
          isVisibleAtLevel(note.visibilityTier, granularity)
        );

        return (
          <div key={notebook.id}>
            <button
              onClick={() => toggleNotebook(notebook.id)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <svg
                className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
              <span>{notebook.icon}</span>
              <span className="truncate font-medium">{notebook.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {visibleNotes.length}
              </span>
            </button>

            {isExpanded && (
              <div className="ml-4 space-y-0.5 pl-2">
                {visibleNotes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/${workspaceId}/${notebook.id}/${note.id}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <span className="text-xs">
                      {STATUS_EMOJI[note.status] || "\u{1F4DD}"}
                    </span>
                    <span className="truncate">{note.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
