"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export type ChatMode = "build" | "plan" | "diagnose" | "explore";

interface SlashCommand {
  command: string;
  description: string;
  mode?: ChatMode;
}

const SLASH_COMMANDS: SlashCommand[] = [
  { command: "/plan", description: "Create an implementation plan", mode: "plan" },
  { command: "/build", description: "Start building from notes", mode: "build" },
  { command: "/diagnose", description: "Diagnose an issue", mode: "diagnose" },
  { command: "/explore", description: "Explore the codebase", mode: "explore" },
  { command: "/navigate", description: "Navigate to a note" },
];

interface NoteRef {
  id: string;
  title: string;
}

interface ChatInputProps {
  onSend: (message: string) => void;
  onModeChange?: (mode: ChatMode) => void;
  mode: ChatMode;
  disabled?: boolean;
  noteRefs?: NoteRef[];
}

export function ChatInput({
  onSend,
  onModeChange,
  mode,
  disabled = false,
  noteRefs = [],
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showNoteMenu, setShowNoteMenu] = useState(false);
  const [noteFilter, setNoteFilter] = useState("");
  const [selectedSlashIdx, setSelectedSlashIdx] = useState(0);
  const [selectedNoteIdx, setSelectedNoteIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredCommands = SLASH_COMMANDS.filter((cmd) =>
    cmd.command.startsWith(input.toLowerCase())
  );

  const filteredNotes = noteRefs.filter((n) =>
    n.title.toLowerCase().includes(noteFilter.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);

    // Slash command detection
    if (val.startsWith("/") && !val.includes(" ")) {
      setShowSlashMenu(true);
      setSelectedSlashIdx(0);
    } else {
      setShowSlashMenu(false);
    }

    // Note reference detection (@mention)
    const atIdx = val.lastIndexOf("@");
    if (atIdx !== -1 && atIdx === val.length - 1 - (val.length - 1 - atIdx)) {
      const afterAt = val.slice(atIdx + 1);
      if (!afterAt.includes(" ")) {
        setShowNoteMenu(true);
        setNoteFilter(afterAt);
        setSelectedNoteIdx(0);
      } else {
        setShowNoteMenu(false);
      }
    }
    if (!val.includes("@")) {
      setShowNoteMenu(false);
    }
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Shift+Enter for newline
      if (e.key === "Enter" && e.shiftKey) {
        return; // default textarea behavior
      }

      // Enter to send
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();

        if (showSlashMenu && filteredCommands.length > 0) {
          selectSlashCommand(filteredCommands[selectedSlashIdx]);
          return;
        }

        if (showNoteMenu && filteredNotes.length > 0) {
          selectNoteRef(filteredNotes[selectedNoteIdx]);
          return;
        }

        handleSend();
        return;
      }

      // Arrow keys for menus
      if (showSlashMenu) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedSlashIdx((i) => Math.min(i + 1, filteredCommands.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedSlashIdx((i) => Math.max(i - 1, 0));
        } else if (e.key === "Escape") {
          setShowSlashMenu(false);
        }
      }

      if (showNoteMenu) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedNoteIdx((i) => Math.min(i + 1, filteredNotes.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedNoteIdx((i) => Math.max(i - 1, 0));
        } else if (e.key === "Escape") {
          setShowNoteMenu(false);
        }
      }
    },
    [showSlashMenu, showNoteMenu, filteredCommands, filteredNotes, selectedSlashIdx, selectedNoteIdx]
  );

  const selectSlashCommand = (cmd: SlashCommand) => {
    if (cmd.mode && onModeChange) {
      onModeChange(cmd.mode);
    }
    setInput("");
    setShowSlashMenu(false);
    textareaRef.current?.focus();
  };

  const selectNoteRef = (ref: NoteRef) => {
    const atIdx = input.lastIndexOf("@");
    const before = input.slice(0, atIdx);
    setInput(`${before}[${ref.title}] `);
    setShowNoteMenu(false);
    textareaRef.current?.focus();
  };

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
    setShowSlashMenu(false);
    setShowNoteMenu(false);
  };

  return (
    <div className="relative border-t border-border p-3">
      {/* Mode selector */}
      <div className="mb-2 flex items-center gap-1">
        {(["build", "plan", "diagnose", "explore"] as ChatMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange?.(m)}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize transition-colors",
              mode === m
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Slash command menu */}
      {showSlashMenu && filteredCommands.length > 0 && (
        <div className="absolute bottom-full left-3 right-3 mb-1 rounded-lg border border-border bg-card p-1 shadow-lg">
          {filteredCommands.map((cmd, i) => (
            <button
              key={cmd.command}
              onClick={() => selectSlashCommand(cmd)}
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs",
                i === selectedSlashIdx
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              <span className="font-mono font-medium text-primary">
                {cmd.command}
              </span>
              <span>{cmd.description}</span>
            </button>
          ))}
        </div>
      )}

      {/* Note reference menu */}
      {showNoteMenu && filteredNotes.length > 0 && (
        <div className="absolute bottom-full left-3 right-3 mb-1 max-h-32 overflow-auto rounded-lg border border-border bg-card p-1 shadow-lg">
          {filteredNotes.map((ref, i) => (
            <button
              key={ref.id}
              onClick={() => selectNoteRef(ref)}
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs",
                i === selectedNoteIdx
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              <span className="note-reference">{ref.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask the AI, use / for commands, @ to mention a note..."
          rows={1}
          className="max-h-24 min-h-[36px] flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          style={{ height: "auto" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 96)}px`;
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
