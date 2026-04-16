"use client";

import { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Placeholder from "@tiptap/extension-placeholder";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import {
  BotTextExtension,
  CorrectionExtension,
  StatusBadgeExtension,
  NoteReferenceExtension,
  AIAnnotationExtension,
  DecisionBlockExtension,
} from "@plugin11/editor-extensions";
import { noteRoomName, YJS_KEYS } from "@plugin11/shared";
import type { EditorView } from "@plugin11/shared";
import { ViewToggle } from "./ViewToggle";
import { CodeView } from "./CodeView";
import { PresenceAvatars } from "../collaboration/PresenceAvatars";
import { BotText } from "../ai/BotText";
import { ImplementationProgress } from "../ai/ImplementationProgress";
import { PreviewPanel } from "../preview/PreviewPanel";

interface NoteEditorProps {
  workspaceId: string;
  notebookId: string;
  noteId: string;
}

export function NoteEditor({ workspaceId, notebookId, noteId }: NoteEditorProps) {
  const [view, setView] = useState<EditorView>("notes");
  const [isAIWorking, setIsAIWorking] = useState(false);

  const ydoc = useMemo(() => new Y.Doc(), []);

  const provider = useMemo(() => {
    const collabUrl = typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_COLLAB_URL || "ws://localhost:1234")
      : "ws://localhost:1234";

    return new HocuspocusProvider({
      url: collabUrl,
      name: noteRoomName(workspaceId, noteId),
      document: ydoc,
      token: "dev-token", // In production, use real JWT
    });
  }, [workspaceId, noteId, ydoc]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Yjs handles undo/redo
      }),
      Collaboration.configure({
        document: ydoc,
        field: YJS_KEYS.CONTENT,
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: "You",
          color: "#3b82f6",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your thoughts... The AI will think with you.",
      }),
      BotTextExtension,
      CorrectionExtension,
      StatusBadgeExtension,
      NoteReferenceExtension,
      AIAnnotationExtension,
      DecisionBlockExtension,
    ],
    editorProps: {
      attributes: {
        class: "tiptap prose prose-invert max-w-none focus:outline-none",
      },
    },
  });

  useEffect(() => {
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [provider, ydoc]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Note</h2>
          <PresenceAvatars />
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {/* AI implementation progress */}
      {isAIWorking && <ImplementationProgress />}

      {/* Editor content */}
      <div className="flex flex-1 overflow-hidden">
        {view === "preview" ? (
          <PreviewPanel
            files={{}}
            onClose={() => setView("notes")}
          />
        ) : (
          <>
            {(view === "notes" || view === "split") && (
              <div className={`flex-1 overflow-auto ${view === "split" ? "border-r border-border" : ""}`}>
                <EditorContent editor={editor} className="h-full" />
              </div>
            )}
            {(view === "code" || view === "split") && (
              <div className="flex-1 overflow-auto">
                <CodeView noteId={noteId} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
