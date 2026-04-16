"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BotTextBlock {
  id: string;
  content: string;
  position: number;
}

interface NoteSection {
  id: string;
  type: "text" | "bot-text" | "heading";
  content: string;
}

interface SyncedNoteViewerProps {
  noteTitle: string;
  sections: NoteSection[];
  highlightedSectionId?: string;
  onSectionVisible?: (sectionId: string) => void;
}

export function SyncedNoteViewer({
  noteTitle,
  sections,
  highlightedSectionId,
  onSectionVisible,
}: SyncedNoteViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll to highlighted section when it changes
  useEffect(() => {
    if (!highlightedSectionId) return;
    const el = sectionRefs.current.get(highlightedSectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedSectionId]);

  // Report visible sections on scroll (for sync back to change list)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onSectionVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const sectionId = (entry.target as HTMLElement).dataset.sectionId;
            if (sectionId) {
              onSectionVisible(sectionId);
            }
          }
        }
      },
      { root: container, threshold: 0.5 }
    );

    sectionRefs.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sections, onSectionVisible]);

  return (
    <div ref={containerRef} className="h-full overflow-auto">
      {/* Note header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <h3 className="text-sm font-bold">{noteTitle}</h3>
      </div>

      {/* Note content */}
      <div className="space-y-0 p-4">
        {sections.map((section) => (
          <div
            key={section.id}
            ref={(el) => {
              if (el) sectionRefs.current.set(section.id, el);
            }}
            data-section-id={section.id}
            className={cn(
              "transition-all duration-300",
              highlightedSectionId === section.id && "ring-2 ring-primary/30 ring-offset-1 ring-offset-background"
            )}
          >
            {section.type === "heading" && (
              <h4 className="pb-1 pt-4 text-sm font-semibold text-foreground">
                {section.content}
              </h4>
            )}
            {section.type === "text" && (
              <p className="py-1 text-sm leading-relaxed text-foreground/80">
                {section.content}
              </p>
            )}
            {section.type === "bot-text" && (
              <div className="bot-text-suggestion my-1">
                <div className="mb-1 flex items-center gap-1.5">
                  <svg className="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1.07A7.003 7.003 0 0113 22h-2a7.003 7.003 0 01-6.93-6H3a1 1 0 110-2h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zm-2 10a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z" />
                  </svg>
                  <span className="text-[10px] font-semibold text-primary">AI Suggestion</span>
                </div>
                <p className="text-sm leading-relaxed">{section.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
