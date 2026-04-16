import type { GranularityLevel } from "@plugin11/shared";

const LEVEL_ORDER: Record<GranularityLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

interface HasVisibilityTier {
  visibilityTier: GranularityLevel;
}

/**
 * Filter items by granularity level.
 * Items are visible if their visibility tier is <= the user's level.
 * No content is removed — only client-side filtering.
 */
export function filterByGranularity<T extends HasVisibilityTier>(
  items: T[],
  level: GranularityLevel
): T[] {
  return items.filter(
    (item) => LEVEL_ORDER[item.visibilityTier] <= LEVEL_ORDER[level]
  );
}

/**
 * Check if a single item is visible at the given level.
 */
export function isVisible(
  itemLevel: GranularityLevel,
  userLevel: GranularityLevel
): boolean {
  return LEVEL_ORDER[itemLevel] <= LEVEL_ORDER[userLevel];
}

/**
 * Get descriptions for each granularity level.
 */
export const GRANULARITY_DESCRIPTIONS: Record<GranularityLevel, string> = {
  beginner: "High-level notebooks only — Auth, UI, Data. Hides technical internals.",
  intermediate: "Most notebooks visible. Hides very technical implementation notes.",
  advanced: "Everything visible — full detail including all generated notes.",
};

/**
 * Storage key for persisting granularity preference.
 */
const STORAGE_KEY = "plugin11-granularity-level";

/**
 * Save granularity preference to localStorage.
 */
export function saveGranularityPreference(level: GranularityLevel): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, level);
  }
}

/**
 * Load granularity preference from localStorage.
 * Returns "intermediate" as default.
 */
export function loadGranularityPreference(): GranularityLevel {
  if (typeof window === "undefined") return "intermediate";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "beginner" || stored === "intermediate" || stored === "advanced") {
    return stored;
  }
  return "intermediate";
}
