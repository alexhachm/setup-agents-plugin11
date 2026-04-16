"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ImportWizard } from "@/components/import/ImportWizard";
import type { GeneratedNotebook } from "@/components/import/GuidedWalkthrough";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default function ImportPage({ params }: Props) {
  const { workspaceId } = use(params);
  const router = useRouter();

  function handleComplete(_notebooks: GeneratedNotebook[]) {
    // Navigate back to workspace after successful import
    router.push(`/${workspaceId}`);
  }

  function handleCancel() {
    router.push(`/${workspaceId}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-12 items-center border-b border-border px-6">
        <button
          onClick={handleCancel}
          className="mr-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <span className="text-sm font-bold text-primary">Plugin 11</span>
        <span className="ml-2 text-sm text-muted-foreground">
          / Import
        </span>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-start justify-center px-6 py-12">
        <ImportWizard
          workspaceId={workspaceId}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </main>
    </div>
  );
}
