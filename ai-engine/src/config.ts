import * as fs from "fs";
import * as path from "path";

export interface Plugin11Config {
  provider: string | null;
  api_key: string | null;
  workspace_url: string | null;
  workspace_id: string | null;
  auth_token: string | null;
}

const DEFAULT_CONFIG: Plugin11Config = {
  provider: null,
  api_key: null,
  workspace_url: null,
  workspace_id: null,
  auth_token: null,
};

const CONFIG_DIR = ".plugin11";
const CONFIG_FILE = "config.json";

export class Config {
  private config: Plugin11Config;
  private configPath: string;

  constructor(projectDir?: string) {
    const base = projectDir || process.cwd();
    this.configPath = path.join(base, CONFIG_DIR, CONFIG_FILE);
    this.config = this.load();
  }

  private load(): Plugin11Config {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, "utf-8");
        return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
      }
    } catch {
      // Corrupted config — fall back to defaults
    }
    return { ...DEFAULT_CONFIG };
  }

  private save(): void {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  get<K extends keyof Plugin11Config>(key: K): Plugin11Config[K] {
    // Environment variable overrides
    const envMap: Record<string, string> = {
      provider: "PLUGIN11_PROVIDER",
      api_key: "PLUGIN11_API_KEY",
      workspace_url: "PLUGIN11_WORKSPACE_URL",
      workspace_id: "PLUGIN11_WORKSPACE_ID",
      auth_token: "PLUGIN11_AUTH_TOKEN",
    };

    const envKey = envMap[key as string];
    if (envKey && process.env[envKey]) {
      return process.env[envKey] as Plugin11Config[K];
    }

    return this.config[key];
  }

  set<K extends keyof Plugin11Config>(key: K, value: Plugin11Config[K]): void {
    this.config[key] = value;
    this.save();
  }

  getAll(): Readonly<Plugin11Config> {
    const result = { ...this.config };
    // Apply env overrides
    for (const key of Object.keys(result) as (keyof Plugin11Config)[]) {
      const envVal = this.get(key);
      if (envVal !== result[key]) {
        (result as Record<string, unknown>)[key] = envVal;
      }
    }
    return result;
  }

  getHocuspocusUrl(): string {
    return (
      this.get("workspace_url") ||
      process.env.HOCUSPOCUS_URL ||
      "ws://localhost:1234"
    );
  }

  getAuthToken(): string {
    return this.get("auth_token") || process.env.AI_ENGINE_TOKEN || "";
  }

  reset(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.save();
  }
}
