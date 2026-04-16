"use client";

import { cn } from "@/lib/utils";

interface OpenQuestionTagProps {
  id: string;
  question: string;
  resolved: boolean;
  noteId?: string;
  noteTitle?: string;
  onResolve?: (id: string) => void;
  onNavigate?: (noteId: string) => void;
}

export function OpenQuestionTag({
  id,
  question,
  resolved,
  noteId,
  noteTitle,
  onResolve,
  onNavigate,
}: OpenQuestionTagProps) {
  return (
    <div
      className={cn(
        "group flex items-start gap-2 rounded-lg px-3 py-2 text-xs transition-colors",
        resolved ? "bg-success/5 opacity-70" : "bg-warning/5 hover:bg-warning/10"
      )}
    >
      {/* Badge */}
      <span
        className={cn(
          "mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase",
          resolved
            ? "bg-success/15 text-success"
            : "bg-warning/15 text-warning"
        )}
      >
        {resolved ? "RESOLVED" : "OPEN QUESTION"}
      </span>

      {/* Content */}
      <div className="flex-1">
        <span className={cn("leading-relaxed", resolved && "line-through text-muted-foreground")}>
          {question}
        </span>
        {noteId && noteTitle && (
          <button
            onClick={() => onNavigate?.(noteId)}
            className="ml-1.5 note-reference text-[10px]"
          >
            {noteTitle}
          </button>
        )}
      </div>

      {/* Resolve button */}
      {!resolved && onResolve && (
        <button
          onClick={() => onResolve(id)}
          className="shrink-0 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
        >
          Resolve
        </button>
      )}
    </div>
  );
}
