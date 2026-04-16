"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  type: "note" | "notebook" | "action" | "recent";
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: CommandItem) => void;
  notes?: CommandItem[];
  notebooks?: CommandItem[];
  recentNotes?: CommandItem[];
}

const QUICK_ACTIONS: CommandItem[] = [
  { id: "create-note", type: "action", title: "Create new note", subtitle: "Add a note to the current notebook" },
  { id: "create-notebook", type: "action", title: "Create new notebook", subtitle: "Start a new notebook" },
  { id: "toggle-view", type: "action", title: "Toggle view", subtitle: "Switch between Notes/Code/Split" },
  { id: "open-settings", type: "action", title: "Open settings", subtitle: "Workspace settings" },
];

export function CommandPalette({
  open,
  onClose,
  onSelect,
  notes = [],
  notebooks = [],
  recentNotes = [],
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fuzzy match
  const fuzzyMatch = useCallback(
    (item: CommandItem): boolean => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.subtitle?.toLowerCase().includes(q) ?? false)
      );
    },
    [query]
  );

  // Build filtered results
  const results: { section: string; items: CommandItem[] }[] = [];

  if (!query && recentNotes.length > 0) {
    results.push({ section: "Recent", items: recentNotes.slice(0, 5) });
  }

  const filteredActions = QUICK_ACTIONS.filter(fuzzyMatch);
  if (filteredActions.length > 0) {
    results.push({ section: "Actions", items: filteredActions });
  }

  const filteredNotes = notes.filter(fuzzyMatch).slice(0, 10);
  if (filteredNotes.length > 0) {
    results.push({ section: "Notes", items: filteredNotes });
  }

  const filteredNotebooks = notebooks.filter(fuzzyMatch).slice(0, 5);
  if (filteredNotebooks.length > 0) {
    results.push({ section: "Notebooks", items: filteredNotebooks });
  }

  const flatItems = results.flatMap((r) => r.items);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && flatItems[selectedIndex]) {
        e.preventDefault();
        onSelect(flatItems[selectedIndex]);
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, flatItems, selectedIndex, onClose, onSelect]);

  if (!open) return null;

  let globalIdx = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Palette */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <svg className="h-4 w-4 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, notebooks, or actions..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-auto py-2">
          {results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results found
            </div>
          )}

          {results.map((section) => (
            <div key={section.section}>
              <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.section}
              </div>
              {section.items.map((item) => {
                globalIdx++;
                const idx = globalIdx;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors",
                      idx === selectedIndex
                        ? "bg-primary/10 text-foreground"
                        : "text-foreground hover:bg-accent"
                    )}
                  >
                    {/* Type icon */}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-secondary text-xs">
                      {item.type === "note" && (
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {item.type === "notebook" && (
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                      {item.type === "action" && (
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                      {item.type === "recent" && (
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </span>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{item.title}</div>
                      {item.subtitle && (
                        <div className="truncate text-xs text-muted-foreground">
                          {item.subtitle}
                        </div>
                      )}
                    </div>

                    {/* Hint */}
                    {idx === selectedIndex && (
                      <kbd className="shrink-0 rounded bg-secondary px-1 py-0.5 text-[10px] text-muted-foreground">
                        Enter
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
