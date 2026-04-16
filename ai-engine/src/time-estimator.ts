import type { NoteComplexity, ComplexityLine } from "@plugin11/shared";
import { COMPLEXITY_WEIGHTS } from "@plugin11/shared";

export interface EstimateInput {
  noteId: string;
  complexity: NoteComplexity;
}

export interface EstimateResult {
  total_minutes: number;
  notes_affected: number;
  complexity_breakdown: ComplexityLine[];
}

const DEFAULT_AVG_MINUTES_PER_NOTE = 3;

export class TimeEstimator {
  private avgMinutesPerNote: number;

  constructor(avgMinutesPerNote?: number) {
    this.avgMinutesPerNote = avgMinutesPerNote ?? DEFAULT_AVG_MINUTES_PER_NOTE;
  }

  /**
   * Update average minutes per note from allocation-learnings.md data.
   * Called periodically as more tasks complete.
   */
  calibrate(historicalEntries: { minutes: number; noteCount: number }[]): void {
    if (historicalEntries.length === 0) return;

    let totalMinutes = 0;
    let totalNotes = 0;
    for (const entry of historicalEntries) {
      totalMinutes += entry.minutes;
      totalNotes += entry.noteCount;
    }

    if (totalNotes > 0) {
      this.avgMinutesPerNote = totalMinutes / totalNotes;
    }
  }

  /**
   * Estimate time for a set of notes.
   *
   * Formula: estimated_minutes = sum(note_count * complexity_weight * avg_minutes_per_note)
   */
  estimate(notes: EstimateInput[]): EstimateResult {
    const breakdown: ComplexityLine[] = [];
    let totalMinutes = 0;

    for (const note of notes) {
      const weight = COMPLEXITY_WEIGHTS[note.complexity] ?? 1;
      const minutes = weight * this.avgMinutesPerNote;
      totalMinutes += minutes;

      breakdown.push({
        noteId: note.noteId,
        complexity: note.complexity,
        weight,
        avgMinutes: minutes,
      });
    }

    return {
      total_minutes: Math.round(totalMinutes * 10) / 10,
      notes_affected: notes.length,
      complexity_breakdown: breakdown,
    };
  }

  getAvgMinutesPerNote(): number {
    return this.avgMinutesPerNote;
  }
}
