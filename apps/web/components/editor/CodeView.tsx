"use client";

interface CodeViewProps {
  noteId: string;
}

/**
 * CodeView — Monaco editor wrapper for viewing generated code.
 * In the full implementation, this shows the code files mapped to the current note
 * via CodeMappings. For now, renders a placeholder that Monaco will replace.
 */
export function CodeView({ noteId }: CodeViewProps) {
  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-xs text-muted-foreground">Code View</span>
        <span className="text-xs text-muted-foreground">No mapped files</span>
      </div>
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        <div className="text-center">
          <p>No code files mapped to this note yet.</p>
          <p className="mt-1 text-xs">
            Code will appear here when the AI Engine generates files from your notes.
          </p>
        </div>
      </div>
    </div>
  );
}
