import { TimeEstimator } from "../time-estimator";

describe("TimeEstimator", () => {
  test("estimates simple notes correctly", () => {
    const estimator = new TimeEstimator();
    const result = estimator.estimate([
      { noteId: "note-1", complexity: "simple" },
    ]);

    // simple weight = 1.0, default avg = 3 minutes
    expect(result.total_minutes).toBe(3);
    expect(result.notes_affected).toBe(1);
    expect(result.complexity_breakdown).toHaveLength(1);
    expect(result.complexity_breakdown[0].weight).toBe(1.0);
  });

  test("estimates medium notes correctly", () => {
    const estimator = new TimeEstimator();
    const result = estimator.estimate([
      { noteId: "note-1", complexity: "medium" },
    ]);

    // medium weight = 2.5, default avg = 3 minutes => 7.5
    expect(result.total_minutes).toBe(7.5);
  });

  test("estimates complex notes correctly", () => {
    const estimator = new TimeEstimator();
    const result = estimator.estimate([
      { noteId: "note-1", complexity: "complex" },
    ]);

    // complex weight = 6.0, default avg = 3 minutes => 18
    expect(result.total_minutes).toBe(18);
  });

  test("estimates mixed complexity correctly", () => {
    const estimator = new TimeEstimator();
    const result = estimator.estimate([
      { noteId: "note-1", complexity: "simple" },
      { noteId: "note-2", complexity: "medium" },
      { noteId: "note-3", complexity: "complex" },
    ]);

    // (1.0 * 3) + (2.5 * 3) + (6.0 * 3) = 3 + 7.5 + 18 = 28.5
    expect(result.total_minutes).toBe(28.5);
    expect(result.notes_affected).toBe(3);
    expect(result.complexity_breakdown).toHaveLength(3);
  });

  test("handles empty input", () => {
    const estimator = new TimeEstimator();
    const result = estimator.estimate([]);

    expect(result.total_minutes).toBe(0);
    expect(result.notes_affected).toBe(0);
    expect(result.complexity_breakdown).toHaveLength(0);
  });

  test("respects custom avg minutes per note", () => {
    const estimator = new TimeEstimator(5);
    const result = estimator.estimate([
      { noteId: "note-1", complexity: "simple" },
    ]);

    // simple weight = 1.0, custom avg = 5 minutes => 5
    expect(result.total_minutes).toBe(5);
  });

  test("calibrate updates average from historical data", () => {
    const estimator = new TimeEstimator();
    expect(estimator.getAvgMinutesPerNote()).toBe(3);

    estimator.calibrate([
      { minutes: 10, noteCount: 2 },
      { minutes: 20, noteCount: 4 },
    ]);

    // (10 + 20) / (2 + 4) = 30 / 6 = 5
    expect(estimator.getAvgMinutesPerNote()).toBe(5);
  });

  test("calibrate with empty data does not change average", () => {
    const estimator = new TimeEstimator(7);
    estimator.calibrate([]);
    expect(estimator.getAvgMinutesPerNote()).toBe(7);
  });

  test("breakdown contains correct per-note data", () => {
    const estimator = new TimeEstimator(4);
    const result = estimator.estimate([
      { noteId: "n1", complexity: "simple" },
      { noteId: "n2", complexity: "complex" },
    ]);

    const [first, second] = result.complexity_breakdown;

    expect(first.noteId).toBe("n1");
    expect(first.complexity).toBe("simple");
    expect(first.weight).toBe(1.0);
    expect(first.avgMinutes).toBe(4);

    expect(second.noteId).toBe("n2");
    expect(second.complexity).toBe("complex");
    expect(second.weight).toBe(6.0);
    expect(second.avgMinutes).toBe(24);
  });
});
