"use client";

import { useState } from "react";
import type { GranularityLevel } from "@plugin11/shared";
import { GRANULARITY_LABELS } from "@plugin11/shared";
import { GRANULARITY_DESCRIPTIONS, saveGranularityPreference } from "@/lib/granularity";
import { cn } from "@/lib/utils";

interface GranularitySelectorProps {
  value: GranularityLevel;
  onChange: (level: GranularityLevel) => void;
}

const LEVELS: GranularityLevel[] = ["beginner", "intermediate", "advanced"];

export function GranularitySelector({ value, onChange }: GranularitySelectorProps) {
  const [showTooltip, setShowTooltip] = useState<GranularityLevel | null>(null);

  const handleChange = (level: GranularityLevel) => {
    onChange(level);
    saveGranularityPreference(level);
  };

  return (
    <div className="relative flex items-center gap-1">
      <span className="mr-1 text-muted-foreground">Granularity:</span>

      <div className="relative flex items-center rounded-md bg-secondary p-0.5">
        {/* Sliding indicator */}
        <div
          className="absolute h-[calc(100%-4px)] rounded transition-all duration-200 ease-out bg-primary/20"
          style={{
            width: `${100 / LEVELS.length}%`,
            left: `${(LEVELS.indexOf(value) * 100) / LEVELS.length}%`,
          }}
        />

        {LEVELS.map((level) => (
          <div key={level} className="relative">
            <button
              onClick={() => handleChange(level)}
              onMouseEnter={() => setShowTooltip(level)}
              onMouseLeave={() => setShowTooltip(null)}
              className={cn(
                "relative z-10 rounded px-2 py-0.5 text-xs transition-colors",
                value === level
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {GRANULARITY_LABELS[level]}
            </button>

            {/* Tooltip */}
            {showTooltip === level && (
              <div className="absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded-lg border border-border bg-card p-2 text-[10px] text-muted-foreground shadow-lg">
                <span className="mb-0.5 block font-semibold text-foreground">
                  {GRANULARITY_LABELS[level]}
                </span>
                {GRANULARITY_DESCRIPTIONS[level]}
                <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-border bg-card" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
