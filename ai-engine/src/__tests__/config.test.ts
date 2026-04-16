import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { Config } from "../config";

describe("Config", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "config-test-"));
    // Clear env vars
    delete process.env.PLUGIN11_PROVIDER;
    delete process.env.PLUGIN11_API_KEY;
    delete process.env.PLUGIN11_WORKSPACE_URL;
    delete process.env.PLUGIN11_WORKSPACE_ID;
    delete process.env.PLUGIN11_AUTH_TOKEN;
    delete process.env.HOCUSPOCUS_URL;
    delete process.env.AI_ENGINE_TOKEN;
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    // Clean up env
    delete process.env.PLUGIN11_PROVIDER;
    delete process.env.PLUGIN11_API_KEY;
    delete process.env.PLUGIN11_WORKSPACE_URL;
    delete process.env.PLUGIN11_WORKSPACE_ID;
    delete process.env.PLUGIN11_AUTH_TOKEN;
    delete process.env.HOCUSPOCUS_URL;
    delete process.env.AI_ENGINE_TOKEN;
  });

  test("returns defaults when no config file exists", () => {
    const config = new Config(tmpDir);
    expect(config.get("provider")).toBeNull();
    expect(config.get("api_key")).toBeNull();
    expect(config.get("workspace_url")).toBeNull();
    expect(config.get("workspace_id")).toBeNull();
    expect(config.get("auth_token")).toBeNull();
  });

  test("set creates config file and persists value", () => {
    const config = new Config(tmpDir);
    config.set("provider", "openai");

    // Verify file was created
    const configPath = path.join(tmpDir, ".plugin11", "config.json");
    expect(fs.existsSync(configPath)).toBe(true);

    // Verify value persists across instances
    const config2 = new Config(tmpDir);
    expect(config2.get("provider")).toBe("openai");
  });

  test("set and get multiple values", () => {
    const config = new Config(tmpDir);
    config.set("provider", "anthropic");
    config.set("api_key", "sk-test-key");
    config.set("workspace_url", "wss://api.example.com");

    expect(config.get("provider")).toBe("anthropic");
    expect(config.get("api_key")).toBe("sk-test-key");
    expect(config.get("workspace_url")).toBe("wss://api.example.com");
  });

  test("environment variables override config values", () => {
    const config = new Config(tmpDir);
    config.set("provider", "openai");

    process.env.PLUGIN11_PROVIDER = "anthropic";
    expect(config.get("provider")).toBe("anthropic");
  });

  test("getAll returns all config with env overrides", () => {
    const config = new Config(tmpDir);
    config.set("provider", "openai");
    process.env.PLUGIN11_API_KEY = "env-key";

    const all = config.getAll();
    expect(all.provider).toBe("openai");
    expect(all.api_key).toBe("env-key");
  });

  test("getHocuspocusUrl returns configured URL or default", () => {
    const config = new Config(tmpDir);
    expect(config.getHocuspocusUrl()).toBe("ws://localhost:1234");

    config.set("workspace_url", "wss://custom.example.com");
    expect(config.getHocuspocusUrl()).toBe("wss://custom.example.com");
  });

  test("getHocuspocusUrl respects HOCUSPOCUS_URL env", () => {
    process.env.HOCUSPOCUS_URL = "ws://env-server:5678";
    const config = new Config(tmpDir);
    expect(config.getHocuspocusUrl()).toBe("ws://env-server:5678");
  });

  test("getAuthToken returns configured token or default", () => {
    const config = new Config(tmpDir);
    expect(config.getAuthToken()).toBe("");

    config.set("auth_token", "my-token");
    expect(config.getAuthToken()).toBe("my-token");
  });

  test("reset clears all values", () => {
    const config = new Config(tmpDir);
    config.set("provider", "openai");
    config.set("api_key", "key");

    config.reset();
    expect(config.get("provider")).toBeNull();
    expect(config.get("api_key")).toBeNull();
  });

  test("handles corrupted config file gracefully", () => {
    // Write invalid JSON
    const configDir = path.join(tmpDir, ".plugin11");
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(path.join(configDir, "config.json"), "not json");

    const config = new Config(tmpDir);
    expect(config.get("provider")).toBeNull();
  });
});
