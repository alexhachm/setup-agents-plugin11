"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { SourceSelector, type ImportSourceType } from "./SourceSelector";
import {
  GuidedWalkthrough,
  type GeneratedNotebook,
} from "./GuidedWalkthrough";

type WizardStep =
  | "choose-source"
  | "upload"
  | "processing"
  | "review"
  | "complete";

interface ImportWizardProps {
  workspaceId: string;
  onComplete: (notebooks: GeneratedNotebook[]) => void;
  onCancel: () => void;
}

export function ImportWizard({
  workspaceId,
  onComplete,
  onCancel,
}: ImportWizardProps) {
  const [step, setStep] = useState<WizardStep>("choose-source");
  const [sourceType, setSourceType] = useState<ImportSourceType | null>(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [notebooks, setNotebooks] = useState<GeneratedNotebook[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptConfig(sourceType),
    noClick: false,
  });

  function handleSourceSelect(source: ImportSourceType) {
    setSourceType(source);
    if (source === "github") {
      setStep("upload");
    } else {
      setStep("upload");
    }
  }

  async function handleProcess() {
    if (!sourceType) return;
    setStep("processing");
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("sourceType", sourceType);
      formData.append("workspaceId", workspaceId);

      if (sourceType === "github") {
        formData.append("repoUrl", repoUrl);
      } else {
        for (const file of files) {
          formData.append("files", file);
        }
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
        setProgressMessage(getProgressMessage(progress));
      }, 500);

      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Import failed with status ${response.status}`
        );
      }

      const result = await response.json();
      setProgress(100);
      setNotebooks(result.notebooks || []);
      setStep("review");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setStep("upload");
    }
  }

  function handleConfirm() {
    setStep("complete");
    onComplete(notebooks);
  }

  const stepLabels: Record<WizardStep, string> = {
    "choose-source": "Choose Source",
    upload: "Upload",
    processing: "Processing",
    review: "Review",
    complete: "Done",
  };

  const steps: WizardStep[] = [
    "choose-source",
    "upload",
    "processing",
    "review",
  ];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                steps.indexOf(step) >= idx
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {idx + 1}
            </div>
            <span
              className={`text-xs ${
                steps.indexOf(step) >= idx
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {stepLabels[s]}
            </span>
            {idx < steps.length - 1 && (
              <div
                className={`h-px w-8 ${
                  steps.indexOf(step) > idx ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === "choose-source" && (
        <div>
          <h2 className="mb-4 text-xl font-bold">
            What do you want to import?
          </h2>
          <SourceSelector
            selected={sourceType}
            onSelect={handleSourceSelect}
          />
        </div>
      )}

      {step === "upload" && sourceType && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">
            {sourceType === "github"
              ? "Enter repository URL"
              : "Upload your files"}
          </h2>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {sourceType === "github" ? (
            <div className="flex flex-col gap-3">
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
                className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                The AI engine will analyze the repository structure and
                generate notebooks from the codebase.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div
                {...getRootProps()}
                className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                <span className="mb-2 text-3xl">
                  {isDragActive ? "\u{1F4E5}" : "\u{1F4C1}"}
                </span>
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? "Drop files here..."
                    : "Drag & drop files here, or click to browse"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getAcceptLabel(sourceType)}
                </p>
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="rounded-lg border border-border bg-card">
                  <div className="border-b border-border px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {files.length} file{files.length !== 1 ? "s" : ""}{" "}
                      selected
                    </span>
                  </div>
                  <div className="max-h-40 overflow-auto">
                    {files.map((file, idx) => (
                      <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center justify-between border-b border-border/50 px-3 py-2 last:border-b-0"
                      >
                        <span className="text-sm">{file.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </span>
                          <button
                            onClick={() =>
                              setFiles((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setStep("choose-source");
                setFiles([]);
                setRepoUrl("");
                setError(null);
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleProcess}
              disabled={
                (sourceType === "github" && !repoUrl.trim()) ||
                (sourceType !== "github" && files.length === 0)
              }
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Process Import
            </button>
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="flex flex-col items-center gap-6 py-12">
          <div className="relative h-16 w-16">
            <svg className="h-16 w-16 animate-spin" viewBox="0 0 64 64">
              <circle
                className="stroke-secondary"
                cx="32"
                cy="32"
                r="28"
                fill="none"
                strokeWidth="4"
              />
              <circle
                className="stroke-primary"
                cx="32"
                cy="32"
                r="28"
                fill="none"
                strokeWidth="4"
                strokeDasharray={`${progress * 1.76} 176`}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
              {progress}%
            </span>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Processing import...</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {progressMessage || "Analyzing content..."}
            </p>
          </div>
        </div>
      )}

      {step === "review" && (
        <div>
          <h2 className="mb-4 text-xl font-bold">Review Generated Notebooks</h2>
          <GuidedWalkthrough
            notebooks={notebooks}
            onConfirm={handleConfirm}
            onCancel={onCancel}
          />
        </div>
      )}

      {step === "complete" && (
        <div className="flex flex-col items-center gap-4 py-12">
          <span className="text-5xl">{"\u2705"}</span>
          <h3 className="text-xl font-bold">Import Complete</h3>
          <p className="text-sm text-muted-foreground">
            Your notebooks have been created and are ready to edit.
          </p>
        </div>
      )}
    </div>
  );
}

function getAcceptConfig(
  sourceType: ImportSourceType | null
): Record<string, string[]> | undefined {
  switch (sourceType) {
    case "markdown":
      return { "text/markdown": [".md", ".markdown"] };
    case "pdf":
      return { "application/pdf": [".pdf"] };
    case "notion":
      return {
        "application/json": [".json"],
        "application/zip": [".zip"],
      };
    default:
      return undefined;
  }
}

function getAcceptLabel(sourceType: ImportSourceType | null): string {
  switch (sourceType) {
    case "markdown":
      return "Accepts .md and .markdown files";
    case "pdf":
      return "Accepts .pdf files";
    case "notion":
      return "Accepts .json and .zip exports (Notion, Obsidian, etc.)";
    default:
      return "";
  }
}

function getProgressMessage(progress: number): string {
  if (progress < 20) return "Reading files...";
  if (progress < 40) return "Analyzing content structure...";
  if (progress < 60) return "Detecting headings and sections...";
  if (progress < 80) return "Generating notebooks and notes...";
  return "Building cross-references...";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
