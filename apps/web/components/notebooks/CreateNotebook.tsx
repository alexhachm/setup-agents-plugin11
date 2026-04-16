"use client";

import { useState } from "react";

interface CreateNotebookProps {
  workspaceId: string;
  onClose: () => void;
}

const EMOJI_OPTIONS = ["\u{1F4D3}", "\u{1F4D5}", "\u{1F4D7}", "\u{1F4D8}", "\u{1F4D9}", "\u{1F680}", "\u{1F3AF}", "\u26A1", "\u{1F512}", "\u{1F4B3}"];

export function CreateNotebook({ workspaceId, onClose }: CreateNotebookProps) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("\u{1F4D3}");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: create notebook via API
    console.log("Create notebook:", { workspaceId, title, icon });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold">New Notebook</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new notebook to organize your notes.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">
              Icon
              <div className="mt-1 flex gap-1">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`rounded p-1.5 text-lg ${
                      icon === emoji ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-accent"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Title
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Authentication"
                className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
