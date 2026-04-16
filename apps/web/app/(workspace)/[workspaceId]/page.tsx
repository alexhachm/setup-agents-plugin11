import { Shell } from "@/components/layout/Shell";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceHomePage({ params }: Props) {
  const { workspaceId } = await params;

  return (
    <Shell workspaceId={workspaceId}>
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome to your workspace</h2>
          <p className="mt-2 text-muted-foreground">
            Select a notebook from the sidebar to get started, or create a new one.
          </p>
        </div>
      </div>
    </Shell>
  );
}
