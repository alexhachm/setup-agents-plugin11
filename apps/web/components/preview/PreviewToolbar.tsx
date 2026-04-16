"use client";

export type DeviceSize = "desktop" | "tablet" | "mobile";

interface PreviewToolbarProps {
  deviceSize: DeviceSize;
  onDeviceSizeChange: (size: DeviceSize) => void;
  onRefresh: () => void;
  showConsole: boolean;
  onToggleConsole: () => void;
  onClose: () => void;
}

const DEVICE_SIZES: { id: DeviceSize; label: string; icon: string; width: string }[] = [
  { id: "desktop", label: "Desktop", icon: "\u{1F5A5}", width: "100%" },
  { id: "tablet", label: "Tablet", icon: "\u{1F4F1}", width: "768px" },
  { id: "mobile", label: "Mobile", icon: "\u{1F4F1}", width: "375px" },
];

export function PreviewToolbar({
  deviceSize,
  onDeviceSizeChange,
  onRefresh,
  showConsole,
  onToggleConsole,
  onClose,
}: PreviewToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-3 py-1.5">
      <div className="flex items-center gap-2">
        {/* Device size selector */}
        <div className="flex rounded-md border border-border">
          {DEVICE_SIZES.map((size) => (
            <button
              key={size.id}
              onClick={() => onDeviceSizeChange(size.id)}
              title={size.label}
              className={`px-2 py-1 text-xs transition-colors ${
                deviceSize === size.id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {size.icon}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          title="Refresh preview"
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Console toggle */}
        <button
          onClick={onToggleConsole}
          title={showConsole ? "Hide console" : "Show console"}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            showConsole
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Console
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          title="Close preview"
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export { DEVICE_SIZES };
