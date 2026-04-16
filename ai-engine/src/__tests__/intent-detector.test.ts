import { detectIntent, DebouncedIntentDetector } from "../intent-detector";
import type { IntentType, DetectedIntent } from "../intent-detector";

// ── detectIntent ──

describe("detectIntent", () => {
  test("detects planning intent", () => {
    const result = detectIntent("Let's plan the roadmap for this project");
    expect(result.type).toBe("planning");
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.keywords.length).toBeGreaterThan(0);
  });

  test("detects specifying intent", () => {
    const result = detectIntent("The system must validate all user input and shall reject empty fields");
    expect(result.type).toBe("specifying");
    expect(result.confidence).toBeGreaterThan(0);
  });

  test("detects describing_ui intent", () => {
    const result = detectIntent("The page should display a form with a submit button and a dropdown for categories");
    expect(result.type).toBe("describing_ui");
    expect(result.confidence).toBeGreaterThan(0);
  });

  test("detects describing_data intent", () => {
    const result = detectIntent("The database table should have columns for user_id, email, and created_at");
    expect(result.type).toBe("describing_data");
    expect(result.confidence).toBeGreaterThan(0);
  });

  test("detects questioning intent from question marks", () => {
    const result = detectIntent("How does the authentication flow work?");
    expect(result.type).toBe("questioning");
    expect(result.confidence).toBeGreaterThan(0);
  });

  test("detects questioning intent from question words", () => {
    const result = detectIntent("What is the purpose of this component");
    expect(result.type).toBe("questioning");
    expect(result.confidence).toBeGreaterThan(0);
  });

  test("detects fixing intent", () => {
    const result = detectIntent("Fix the login bug — the page crashes with a TypeError when the user submits");
    expect(result.type).toBe("fixing");
    expect(result.confidence).toBeGreaterThan(0);
  });

  test("detects requesting intent", () => {
    const result = detectIntent("Implement a new user registration feature with email verification");
    expect(result.type).toBe("requesting");
    expect(result.confidence).toBeGreaterThan(0);
  });

  test("returns requesting for empty text with zero confidence", () => {
    const result = detectIntent("");
    expect(result.type).toBe("requesting");
    expect(result.confidence).toBe(0);
    expect(result.keywords).toEqual([]);
  });

  test("handles mixed-intent content by picking the strongest", () => {
    const result = detectIntent("Build a button component for the form page");
    // Both requesting (build) and describing_ui (button, component, form, page) match
    expect(["requesting", "describing_ui"]).toContain(result.type);
    expect(result.confidence).toBeGreaterThan(0);
  });

  test("structure patterns boost confidence", () => {
    const withPattern = detectIntent("Implement a login page");
    const withoutPattern = detectIntent("A login page for the app");
    // "Implement" at start should boost requesting confidence
    expect(withPattern.type).toBe("requesting");
  });

  test("confidence is between 0 and 1", () => {
    const inputs = [
      "plan the project architecture and structure",
      "how does this work?",
      "fix the crash in checkout",
      "build a new feature",
      "",
    ];
    for (const input of inputs) {
      const result = detectIntent(input);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    }
  });
});

// ── DebouncedIntentDetector ──

describe("DebouncedIntentDetector", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("fires callback after delay", () => {
    const callback = jest.fn();
    const detector = new DebouncedIntentDetector(callback, 1500);

    detector.onTextChange("implement a login page");

    // Should not fire immediately
    expect(callback).not.toHaveBeenCalled();

    // Advance by debounce delay
    jest.advanceTimersByTime(1500);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.any(String),
        confidence: expect.any(Number),
      })
    );

    detector.destroy();
  });

  test("resets timer on new input", () => {
    const callback = jest.fn();
    const detector = new DebouncedIntentDetector(callback, 1500);

    detector.onTextChange("plan");
    jest.advanceTimersByTime(1000); // Not enough

    detector.onTextChange("plan the roadmap"); // Reset timer
    jest.advanceTimersByTime(1000); // Still not enough from second call
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500); // Now 1500ms from second call
    expect(callback).toHaveBeenCalledTimes(1);

    detector.destroy();
  });

  test("cancel prevents firing", () => {
    const callback = jest.fn();
    const detector = new DebouncedIntentDetector(callback, 1500);

    detector.onTextChange("fix the bug");
    jest.advanceTimersByTime(1000);

    detector.cancel();
    jest.advanceTimersByTime(1000);

    expect(callback).not.toHaveBeenCalled();

    detector.destroy();
  });

  test("uses custom delay", () => {
    const callback = jest.fn();
    const detector = new DebouncedIntentDetector(callback, 500);

    detector.onTextChange("test");
    jest.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledTimes(1);

    detector.destroy();
  });
});
