import { Shell } from "@/components/layout/Shell";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceSettingsPage({ params }: Props) {
  const { workspaceId } = await params;

  return (
    <Shell workspaceId={workspaceId}>
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-2xl font-bold">Workspace Settings</h1>

        <div className="mt-8 space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">General</h2>
            <div className="rounded-lg border border-border bg-card p-6">
              <label className="block text-sm font-medium">
                Workspace Name
                <input
                  type="text"
                  defaultValue="My Workspace"
                  className="mt-1 block w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Team Members</h2>
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">
                Invite collaborators by email to share this workspace.
              </p>
              <div className="mt-4 flex gap-2">
                <input
                  type="email"
                  placeholder="colleague@example.com"
                  className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Invite
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">AI Engine</h2>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Connection Status</p>
                  <p className="text-sm text-muted-foreground">
                    Dev mode: ws://localhost:1234
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Connected
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
            <div className="rounded-lg border border-destructive/20 bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Workspace</p>
                  <p className="text-sm text-muted-foreground">
                    This will permanently delete all notebooks and notes.
                  </p>
                </div>
                <button className="rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Shell>
  );
}
