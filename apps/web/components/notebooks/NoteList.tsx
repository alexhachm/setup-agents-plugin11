"use client";

import Link from "next/link";

interface NoteListProps {
  notebookId: string;
  workspaceId: string;
}

const DEMO_NOTES = [
  { id: "n-1", title: "Login Flow", status: "implemented", updatedAt: "2 hours ago" },
  { id: "n-2", title: "SSO Integration", status: "planned", updatedAt: "5 hours ago" },
  { id: "n-3", title: "Role Permissions", status: "idea", updatedAt: "1 day ago" },
];

const STATUS_EMOJI: Record<string, string> = {
  idea: "\u{1F4A1}",
  planned: "\u{1F4CB}",
  in_progress: "\u{1F528}",
  implemented: "\u2705",
  tested: "\u{1F9EA}",
  broken: "\u{1F534}",
};

export function NoteList({ notebookId, workspaceId }: NoteListProps) {
  return (
    <div className="divide-y divide-border">
      {DEMO_NOTES.map((note) => (
        <Link
          key={note.id}
          href={`/${workspaceId}/${notebookId}/${note.id}`}
          className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-accent"
        >
          <span className="text-lg">{STATUS_EMOJI[note.status] || "\u{1F4DD}"}</span>
          <div className="flex-1">
            <p className="font-medium">{note.title}</p>
            <p className="text-xs text-muted-foreground">
              {note.status.replace(/_/g, " ")} &middot; {note.updatedAt}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
