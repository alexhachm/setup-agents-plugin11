"use client";

import { cn } from "@/lib/utils";

export interface ChatMessageData {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  noteRefs?: { id: string; title: string }[];
  codeBlocks?: { language: string; code: string }[];
  plan?: { title: string; steps: string[]; expanded?: boolean };
}

interface ChatMessageProps {
  message: ChatMessageData;
  onNoteRefClick?: (noteId: string) => void;
  onTogglePlan?: (messageId: string) => void;
}

export function ChatMessage({ message, onNoteRefClick, onTogglePlan }: ChatMessageProps) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center px-4 py-2">
        <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
          {message.content}
        </span>
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2 px-3 py-1.5", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      {!isUser && (
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
          <svg className="h-3.5 w-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1.07A7.003 7.003 0 0113 22h-2a7.003 7.003 0 01-6.93-6H3a1 1 0 110-2h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zm-2 10a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z" />
          </svg>
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2 text-sm",
          isUser
            ? "bg-primary/15 text-foreground"
            : "bg-secondary text-foreground"
        )}
      >
        {!isUser && (
          <span className="mb-1 block text-[10px] font-semibold text-primary">
            AI Engine
          </span>
        )}

        {/* Content with inline note references */}
        <div className="whitespace-pre-wrap leading-relaxed">
          {renderContent(message.content, message.noteRefs, onNoteRefClick)}
        </div>

        {/* Code blocks */}
        {message.codeBlocks?.map((block, i) => (
          <pre
            key={i}
            className="mt-2 overflow-x-auto rounded bg-background p-2 font-mono text-xs"
          >
            <code>{block.code}</code>
          </pre>
        ))}

        {/* Plan preview */}
        {message.plan && (
          <div className="mt-2 rounded border border-border bg-background p-2">
            <button
              onClick={() => onTogglePlan?.(message.id)}
              className="flex w-full items-center gap-1.5 text-xs font-medium text-primary"
            >
              <svg
                className={cn("h-3 w-3 transition-transform", message.plan.expanded && "rotate-90")}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {message.plan.title}
            </button>
            {message.plan.expanded && (
              <ol className="mt-1.5 space-y-1 pl-4 text-xs text-muted-foreground">
                {message.plan.steps.map((step, i) => (
                  <li key={i} className="list-decimal">
                    {step}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* Timestamp */}
        <span className="mt-1 block text-[10px] text-muted-foreground">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

function renderContent(
  content: string,
  noteRefs?: { id: string; title: string }[],
  onNoteRefClick?: (noteId: string) => void
) {
  if (!noteRefs?.length) return content;

  const parts: React.ReactNode[] = [];
  let remaining = content;
  let key = 0;

  for (const ref of noteRefs) {
    const marker = `[${ref.title}]`;
    const idx = remaining.indexOf(marker);
    if (idx === -1) continue;

    if (idx > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
    }
    parts.push(
      <button
        key={key++}
        onClick={() => onNoteRefClick?.(ref.id)}
        className="note-reference"
      >
        {ref.title}
      </button>
    );
    remaining = remaining.slice(idx + marker.length);
  }

  if (remaining) {
    parts.push(<span key={key++}>{remaining}</span>);
  }

  return parts.length > 0 ? parts : content;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
