"use client";

interface BotTextProps {
  suggestionId: string;
  content: string;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
}

/**
 * BotText — AI suggestion component rendered inline in the editor.
 * Shows AI suggestions with a tinted purple background and accept/dismiss controls.
 * On accept, the suggestion "ferments" — the tint fades and text becomes normal note text.
 */
export function BotText({ suggestionId, content, onAccept, onDismiss }: BotTextProps) {
  return (
    <div className="group relative my-2 rounded-lg border-l-[3px] border-primary bg-bot-text-bg px-4 py-3">
      {/* AI indicator */}
      <div className="mb-1 flex items-center gap-1.5">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/20">
          <svg className="h-2.5 w-2.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1.07A7.003 7.003 0 0113 22h-2a7.003 7.003 0 01-6.93-6H3a1 1 0 110-2h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z" />
          </svg>
        </span>
        <span className="text-xs font-medium text-primary">AI Suggestion</span>
      </div>

      {/* Content */}
      <div className="text-sm text-foreground">{content}</div>

      {/* Accept/Dismiss controls */}
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => onAccept(suggestionId)}
          className="rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          Accept
        </button>
        <button
          onClick={() => onDismiss(suggestionId)}
          className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
