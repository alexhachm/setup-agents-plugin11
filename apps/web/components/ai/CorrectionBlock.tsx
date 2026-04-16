"use client";

interface CorrectionBlockProps {
  correctionId: string;
  correctedText: string;
  explanation: string;
  sourceNoteTitle?: string;
  onKeep: (id: string) => void;
  onRevert: (id: string) => void;
  onClarify: (id: string) => void;
}

/**
 * CorrectionBlock — AI correction component shown when the AI detects
 * a contradiction with existing notes or codebase knowledge.
 */
export function CorrectionBlock({
  correctionId,
  correctedText,
  explanation,
  sourceNoteTitle,
  onKeep,
  onRevert,
  onClarify,
}: CorrectionBlockProps) {
  return (
    <div className="my-2 rounded-lg border-l-[3px] border-warning bg-correction-bg px-4 py-3">
      {/* Indicator */}
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-xs text-warning">AI Correction</span>
      </div>

      {/* Corrected text */}
      <div className="text-sm text-foreground">{correctedText}</div>

      {/* Explanation */}
      <div className="mt-2 text-xs text-muted-foreground">
        {explanation}
        {sourceNoteTitle && (
          <span className="ml-1">
            Source:{" "}
            <span className="note-reference cursor-pointer">
              {sourceNoteTitle}
            </span>
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => onKeep(correctionId)}
          className="rounded-md bg-success/10 px-3 py-1 text-xs font-medium text-success transition-colors hover:bg-success/20"
        >
          Keep correction
        </button>
        <button
          onClick={() => onRevert(correctionId)}
          className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
        >
          Revert to my text
        </button>
        <button
          onClick={() => onClarify(correctionId)}
          className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
        >
          Clarify
        </button>
      </div>
    </div>
  );
}
