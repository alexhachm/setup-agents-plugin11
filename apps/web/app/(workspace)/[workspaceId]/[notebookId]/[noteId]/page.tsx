"use client";

import { use } from "react";
import { Shell } from "@/components/layout/Shell";
import { NoteEditor } from "@/components/editor/NoteEditor";

interface Props {
  params: Promise<{ workspaceId: string; notebookId: string; noteId: string }>;
}

export default function NoteEditorPage({ params }: Props) {
  const { workspaceId, notebookId, noteId } = use(params);

  return (
    <Shell workspaceId={workspaceId}>
      <NoteEditor
        workspaceId={workspaceId}
        notebookId={notebookId}
        noteId={noteId}
      />
    </Shell>
  );
}
