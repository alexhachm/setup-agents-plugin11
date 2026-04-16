/**
 * WebContainer Manager
 *
 * Singleton WebContainer instance for live preview.
 * Handles file system sync, process management, and hot reload.
 */

import { WebContainer, type FileSystemTree } from "@webcontainer/api";

export type WebContainerStatus =
  | "idle"
  | "booting"
  | "installing"
  | "starting"
  | "running"
  | "error";

export interface WebContainerManagerEvents {
  onStatusChange?: (status: WebContainerStatus) => void;
  onServerReady?: (url: string) => void;
  onError?: (error: string) => void;
  onConsoleOutput?: (data: string) => void;
}

let instance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

/**
 * Get or create the singleton WebContainer instance.
 * WebContainer API only allows one instance per page.
 */
async function getOrBootInstance(): Promise<WebContainer> {
  if (instance) return instance;
  if (bootPromise) return bootPromise;

  bootPromise = WebContainer.boot();
  instance = await bootPromise;
  bootPromise = null;
  return instance;
}

export class WebContainerManager {
  private container: WebContainer | null = null;
  private serverUrl: string | null = null;
  private status: WebContainerStatus = "idle";
  private events: WebContainerManagerEvents;
  private devProcess: Awaited<ReturnType<WebContainer["spawn"]>> | null = null;

  constructor(events: WebContainerManagerEvents = {}) {
    this.events = events;
  }

  getStatus(): WebContainerStatus {
    return this.status;
  }

  getServerUrl(): string | null {
    return this.serverUrl;
  }

  private setStatus(status: WebContainerStatus) {
    this.status = status;
    this.events.onStatusChange?.(status);
  }

  /**
   * Boot the WebContainer and mount project files.
   */
  async boot(files: FileSystemTree): Promise<void> {
    try {
      this.setStatus("booting");
      this.container = await getOrBootInstance();

      // Mount project files
      await this.container.mount(files);

      // Listen for server-ready events
      this.container.on("server-ready", (_port: number, url: string) => {
        this.serverUrl = url;
        this.setStatus("running");
        this.events.onServerReady?.(url);
      });

      this.container.on("error", (err: { message: string }) => {
        this.setStatus("error");
        this.events.onError?.(err.message);
      });
    } catch (err) {
      this.setStatus("error");
      this.events.onError?.(
        err instanceof Error ? err.message : "Failed to boot WebContainer"
      );
      throw err;
    }
  }

  /**
   * Install dependencies via npm install.
   */
  async installDependencies(): Promise<void> {
    if (!this.container) throw new Error("WebContainer not booted");

    this.setStatus("installing");

    const installProcess = await this.container.spawn("npm", ["install"]);

    installProcess.output.pipeTo(
      new WritableStream({
        write: (data) => {
          this.events.onConsoleOutput?.(data);
        },
      })
    );

    const exitCode = await installProcess.exit;
    if (exitCode !== 0) {
      this.setStatus("error");
      this.events.onError?.(`npm install failed with exit code ${exitCode}`);
      throw new Error(`npm install failed with exit code ${exitCode}`);
    }
  }

  /**
   * Start the dev server (npm run dev).
   */
  async startDevServer(): Promise<void> {
    if (!this.container) throw new Error("WebContainer not booted");

    this.setStatus("starting");

    this.devProcess = await this.container.spawn("npm", ["run", "dev"]);

    this.devProcess.output.pipeTo(
      new WritableStream({
        write: (data) => {
          this.events.onConsoleOutput?.(data);
        },
      })
    );

    // The server-ready event on the container fires when the dev server starts
  }

  /**
   * Write or update a file in the WebContainer filesystem.
   * Used for hot reload when the AI engine writes code changes.
   */
  async writeFile(path: string, content: string): Promise<void> {
    if (!this.container) throw new Error("WebContainer not booted");
    await this.container.fs.writeFile(path, content);
  }

  /**
   * Write multiple files at once (batch update).
   */
  async writeFiles(
    files: { path: string; content: string }[]
  ): Promise<void> {
    for (const file of files) {
      await this.writeFile(file.path, file.content);
    }
  }

  /**
   * Read a file from the WebContainer filesystem.
   */
  async readFile(path: string): Promise<string> {
    if (!this.container) throw new Error("WebContainer not booted");
    return this.container.fs.readFile(path, "utf-8");
  }

  /**
   * Sync project files from the AI engine's local project to the WebContainer.
   */
  async syncFiles(files: FileSystemTree): Promise<void> {
    if (!this.container) throw new Error("WebContainer not booted");
    await this.container.mount(files);
  }

  /**
   * Teardown: kill dev server and clean up.
   */
  async teardown(): Promise<void> {
    if (this.devProcess) {
      this.devProcess.kill();
      this.devProcess = null;
    }
    this.serverUrl = null;
    this.setStatus("idle");
    // Note: We don't destroy the container instance since it's a singleton
    // and can be reused for the next preview session.
  }
}
