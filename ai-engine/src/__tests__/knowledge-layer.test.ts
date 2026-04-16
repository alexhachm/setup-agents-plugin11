import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { KnowledgeLayer } from "../knowledge-layer";

describe("KnowledgeLayer", () => {
  let tmpDir: string;
  let knowledge: KnowledgeLayer;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "knowledge-test-"));
    knowledge = new KnowledgeLayer(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // ── Codebase Insights ──

  test("reads empty codebase insights when file does not exist", () => {
    expect(knowledge.getCodebaseInsights()).toBe("");
  });

  test("writes and reads codebase insights", () => {
    knowledge.setCodebaseInsights("# Insights\n- The app uses React");
    expect(knowledge.getCodebaseInsights()).toBe("# Insights\n- The app uses React");
  });

  test("overwrites codebase insights", () => {
    knowledge.setCodebaseInsights("v1");
    knowledge.setCodebaseInsights("v2");
    expect(knowledge.getCodebaseInsights()).toBe("v2");
  });

  // ── Patterns ──

  test("adds and reads patterns", () => {
    knowledge.addPattern("Always use PascalCase for components");
    knowledge.addPattern("Prefer named exports");

    const patterns = knowledge.getPatterns();
    expect(patterns).toContain("Always use PascalCase for components");
    expect(patterns).toContain("Prefer named exports");
  });

  test("overwrites patterns with setPatterns", () => {
    knowledge.addPattern("Old pattern");
    knowledge.setPatterns("# Patterns\n- New pattern only");

    const patterns = knowledge.getPatterns();
    expect(patterns).not.toContain("Old pattern");
    expect(patterns).toContain("New pattern only");
  });

  // ── Mistakes ──

  test("adds mistakes with timestamps", () => {
    knowledge.addMistake("Forgot to handle null case");
    const mistakes = knowledge.getMistakes();
    expect(mistakes).toContain("Forgot to handle null case");
    // Should contain ISO timestamp
    expect(mistakes).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  test("records corrections", () => {
    knowledge.recordCorrection(
      "note-1",
      "UserName",
      "username",
      "Should use camelCase"
    );

    const mistakes = knowledge.getMistakes();
    expect(mistakes).toContain("Note note-1");
    expect(mistakes).toContain("UserName");
    expect(mistakes).toContain("username");
    expect(mistakes).toContain("camelCase");
  });

  // ── Domain Docs ──

  test("writes and reads domain docs", () => {
    knowledge.setDomainDoc("auth", "# Auth Domain\n- Uses JWT tokens");
    knowledge.setDomainDoc("payment", "# Payment Domain\n- Uses Stripe");

    expect(knowledge.getDomainDoc("auth")).toContain("JWT tokens");
    expect(knowledge.getDomainDoc("payment")).toContain("Stripe");
    expect(knowledge.getDomainDoc("nonexistent")).toBe("");
  });

  test("lists domains", () => {
    knowledge.setDomainDoc("auth", "auth content");
    knowledge.setDomainDoc("ui", "ui content");
    knowledge.setDomainDoc("data", "data content");

    const domains = knowledge.listDomains();
    expect(domains).toContain("auth");
    expect(domains).toContain("ui");
    expect(domains).toContain("data");
    expect(domains).toHaveLength(3);
  });

  test("lists domains returns empty for no docs", () => {
    expect(knowledge.listDomains()).toEqual([]);
  });

  // ── Allocation Learnings ──

  test("adds allocation learnings", () => {
    knowledge.addAllocationLearning({
      task: "Build login page",
      estimatedMinutes: 30,
      actualMinutes: 45,
      noteCount: 3,
    });

    const learnings = knowledge.getAllocationLearnings();
    expect(learnings).toContain("Build login page");
    expect(learnings).toContain("Est: 30m");
    expect(learnings).toContain("Actual: 45m");
    expect(learnings).toContain("Notes: 3");
  });

  test("parses allocation learnings", () => {
    knowledge.addAllocationLearning({
      task: "Task A",
      estimatedMinutes: 10,
      actualMinutes: 15,
      noteCount: 2,
    });
    knowledge.addAllocationLearning({
      task: "Task B",
      estimatedMinutes: 20,
      actualMinutes: 25,
      noteCount: 5,
    });

    const parsed = knowledge.parseAllocationLearnings();
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual({ minutes: 15, noteCount: 2 });
    expect(parsed[1]).toEqual({ minutes: 25, noteCount: 5 });
  });

  test("parses empty allocation learnings", () => {
    expect(knowledge.parseAllocationLearnings()).toEqual([]);
  });

  // ── Full Context ──

  test("getFullContext returns all knowledge", () => {
    knowledge.setCodebaseInsights("insights");
    knowledge.setPatterns("patterns");
    knowledge.addMistake("mistake");
    knowledge.setDomainDoc("auth", "auth doc");
    knowledge.addAllocationLearning({
      task: "task",
      estimatedMinutes: 10,
      actualMinutes: 12,
      noteCount: 1,
    });

    const ctx = knowledge.getFullContext();
    expect(ctx.codebaseInsights).toBe("insights");
    expect(ctx.patterns).toBe("patterns");
    expect(ctx.mistakes).toContain("mistake");
    expect(ctx.domainDocs.auth).toBe("auth doc");
    expect(ctx.allocationLearnings).toContain("task");
  });

  // ── File System ──

  test("creates knowledge directory structure on first write", () => {
    const knowledgeDir = path.join(tmpDir, ".plugin11", "knowledge");
    expect(fs.existsSync(knowledgeDir)).toBe(false);

    knowledge.setCodebaseInsights("test");
    expect(fs.existsSync(knowledgeDir)).toBe(true);
  });
});
