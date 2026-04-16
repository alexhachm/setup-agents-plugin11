import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { DomainAnalyzer } from "../domain-analyzer";

describe("DomainAnalyzer", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "domain-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  function createFile(relativePath: string, content = ""): void {
    const fullPath = path.join(tmpDir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
  }

  test("detects auth domain from directory names", () => {
    createFile("src/auth/login.ts", 'export function login() {}');
    createFile("src/auth/signup.ts", 'export function signup() {}');

    const analyzer = new DomainAnalyzer(tmpDir);
    const result = analyzer.analyze();

    const authDomain = result.domains.find((d) => d.domain === "auth");
    expect(authDomain).toBeDefined();
    expect(authDomain!.files.length).toBeGreaterThan(0);
    expect(authDomain!.confidence).toBeGreaterThan(0);
  });

  test("detects UI domain from file extensions", () => {
    createFile("src/components/Button.tsx", 'import React from "react";');
    createFile("src/components/Form.tsx", 'import React from "react";');
    createFile("src/pages/Home.tsx", 'export default function Home() {}');

    const analyzer = new DomainAnalyzer(tmpDir);
    const result = analyzer.analyze();

    const uiDomain = result.domains.find((d) => d.domain === "ui");
    expect(uiDomain).toBeDefined();
    expect(uiDomain!.files.length).toBeGreaterThan(0);
  });

  test("detects data domain from schema files", () => {
    createFile("prisma/schema.prisma", "model User { id Int @id }");
    createFile("src/models/user.ts", 'export interface User {}');

    const analyzer = new DomainAnalyzer(tmpDir);
    const result = analyzer.analyze();

    const dataDomain = result.domains.find((d) => d.domain === "data");
    expect(dataDomain).toBeDefined();
    expect(dataDomain!.files.length).toBeGreaterThan(0);
  });

  test("detects API domain from route files", () => {
    createFile("src/api/users/route.ts", 'export function GET() {}');
    createFile("src/api/posts/route.ts", 'export function POST() {}');
    createFile("src/middleware/auth.ts", 'export function middleware() {}');

    const analyzer = new DomainAnalyzer(tmpDir);
    const result = analyzer.analyze();

    const apiDomain = result.domains.find((d) => d.domain === "api");
    expect(apiDomain).toBeDefined();
    expect(apiDomain!.files.length).toBeGreaterThan(0);
  });

  test("detects testing domain from test files", () => {
    createFile("src/__tests__/app.test.ts", 'test("works", () => {});');
    createFile("src/utils.spec.ts", 'describe("utils", () => {});');

    const analyzer = new DomainAnalyzer(tmpDir);
    const result = analyzer.analyze();

    const testDomain = result.domains.find((d) => d.domain === "testing");
    expect(testDomain).toBeDefined();
    expect(testDomain!.files.length).toBeGreaterThan(0);
  });

  test("ignores node_modules and .git", () => {
    createFile("node_modules/express/index.js", "module.exports = {};");
    createFile("src/app.ts", "const app = 1;");

    const analyzer = new DomainAnalyzer(tmpDir);
    const result = analyzer.analyze();

    // node_modules file should not be in any domain
    for (const domain of result.domains) {
      for (const file of domain.files) {
        expect(file).not.toContain("node_modules");
      }
    }
  });

  test("returns file and directory counts", () => {
    createFile("src/index.ts", "");
    createFile("src/utils/helper.ts", "");
    createFile("src/components/Button.tsx", "");

    const analyzer = new DomainAnalyzer(tmpDir);
    const result = analyzer.analyze();

    expect(result.fileCount).toBe(3);
    expect(result.directoryCount).toBeGreaterThanOrEqual(2);
  });

  test("generates notebook suggestions", () => {
    createFile("src/auth/login.ts", "");
    createFile("src/auth/signup.ts", "");
    createFile("src/components/Button.tsx", "");
    createFile("src/components/Form.tsx", "");

    const analyzer = new DomainAnalyzer(tmpDir);
    const result = analyzer.analyze();

    expect(result.suggestedNotebooks.length).toBeGreaterThan(0);
    for (const nb of result.suggestedNotebooks) {
      expect(nb.title).toBeTruthy();
      expect(nb.domain).toBeTruthy();
      expect(nb.suggestedNotes.length).toBeGreaterThan(0);
    }
  });

  test("handles empty directory", () => {
    const analyzer = new DomainAnalyzer(tmpDir);
    const result = analyzer.analyze();

    expect(result.fileCount).toBe(0);
    expect(result.domains.length).toBe(0);
    expect(result.suggestedNotebooks.length).toBe(0);
  });

  test("detects domains from import patterns", () => {
    createFile("src/db.ts", 'import { PrismaClient } from "@prisma/client";');
    createFile("src/server.ts", 'import express from "express";');

    const analyzer = new DomainAnalyzer(tmpDir);
    const result = analyzer.analyze();

    // Should detect data domain from prisma import and api domain from express import
    const dataDomain = result.domains.find((d) => d.domain === "data");
    const apiDomain = result.domains.find((d) => d.domain === "api");
    expect(dataDomain).toBeDefined();
    expect(apiDomain).toBeDefined();
  });
});
