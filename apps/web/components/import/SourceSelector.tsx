"use client";

import { cn } from "@/lib/utils";

export type ImportSourceType = "github" | "markdown" | "pdf" | "notion";

interface SourceOption {
  type: ImportSourceType;
  title: string;
  description: string;
  icon: string;
  accepts?: string;
}

const SOURCE_OPTIONS: SourceOption[] = [
  {
    type: "github",
    title: "GitHub Repository",
    description: "Import from a GitHub repo URL. The AI engine will analyze the codebase and generate notebooks.",
    icon: "\u{1F4E6}",
  },
  {
    type: "markdown",
    title: "Markdown Files",
    description: "Upload .md files. Headings become notebooks and notes automatically.",
    icon: "\u{1F4DD}",
    accepts: ".md,.markdown",
  },
  {
    type: "pdf",
    title: "PDF Documents",
    description: "Upload PDFs. Text will be extracted and organized into notes by section.",
    icon: "\u{1F4C4}",
    accepts: ".pdf",
  },
  {
    type: "notion",
    title: "Note App Export",
    description: "Import from Notion, Obsidian, or other note app exports (.json, .zip).",
    icon: "\u{1F4E5}",
    accepts: ".json,.zip",
  },
];

interface SourceSelectorProps {
  selected: ImportSourceType | null;
  onSelect: (source: ImportSourceType) => void;
}

export function SourceSelector({ selected, onSelect }: SourceSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {SOURCE_OPTIONS.map((option) => (
        <button
          key={option.type}
          onClick={() => onSelect(option.type)}
          className={cn(
            "flex flex-col items-start gap-3 rounded-xl border p-5 text-left transition-all hover:border-primary/50 hover:bg-accent/50",
            selected === option.type
              ? "border-primary bg-accent/50 ring-1 ring-primary/30"
              : "border-border"
          )}
        >
          <span className="text-3xl">{option.icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {option.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {option.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

export { SOURCE_OPTIONS };
