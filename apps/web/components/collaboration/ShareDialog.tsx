"use client";

import { useState } from "react";
import type { SharePermission } from "@plugin11/shared";

interface ShareDialogProps {
  resourceType: "workspace" | "notebook" | "note";
  resourceId: string;
  onClose: () => void;
}

export function ShareDialog({ resourceType, resourceId, onClose }: ShareDialogProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<SharePermission>("view");
  const [linkSharing, setLinkSharing] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Invite:", { email, permission, resourceType, resourceId });
    setEmail("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold">
          Share {resourceType}
        </h2>

        <form onSubmit={handleInvite} className="mt-4 space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as SharePermission)}
              className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
            >
              <option value="view">Can view</option>
              <option value="comment">Can comment</option>
              <option value="edit">Can edit</option>
              <option value="suggestion_only">Suggestion only</option>
            </select>
            <button
              type="submit"
              disabled={!email.trim()}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Invite
            </button>
          </div>
        </form>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Link sharing</p>
              <p className="text-xs text-muted-foreground">
                Anyone with the link can access
              </p>
            </div>
            <button
              onClick={() => setLinkSharing(!linkSharing)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                linkSharing ? "bg-primary" : "bg-secondary"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  linkSharing ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          {linkSharing && (
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`https://plugin11.dev/share/${resourceId}`}
                className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm text-muted-foreground"
              />
              <button className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent">
                Copy
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
