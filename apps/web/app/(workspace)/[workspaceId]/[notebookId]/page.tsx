import { Shell } from "@/components/layout/Shell";
import { NoteList } from "@/components/notebooks/NoteList";

interface Props {
  params: Promise<{ workspaceId: string; notebookId: string }>;
}

export default async function NotebookPage({ params }: Props) {
  const { workspaceId, notebookId } = await params;

  return (
    <Shell workspaceId={workspaceId}>
      <div className="flex flex-1 flex-col">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-xl font-bold">Notebook</h2>
          <p className="text-sm text-muted-foreground">
            Select a note to start editing
          </p>
        </div>
        <NoteList notebookId={notebookId} workspaceId={workspaceId} />
      </div>
    </Shell>
  );
}
