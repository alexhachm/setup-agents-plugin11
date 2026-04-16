import { Node, mergeAttributes } from "@tiptap/core";

export interface StatusBadgeOptions {
  HTMLAttributes: Record<string, string>;
  statuses: readonly string[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    statusBadge: {
      insertStatusBadge: (status: string) => ReturnType;
      updateStatusBadge: (pos: number, status: string) => ReturnType;
    };
  }
}

const STATUS_EMOJI: Record<string, string> = {
  idea: "\u{1F4A1}",
  planned: "\u{1F4CB}",
  in_progress: "\u{1F528}",
  implemented: "\u2705",
  tested: "\u{1F9EA}",
  broken: "\u{1F534}",
};

/**
 * StatusBadgeExtension — inline status badges for notes.
 * Shows status like idea, planned, implemented, etc. as colored badges.
 */
export const StatusBadgeExtension = Node.create<StatusBadgeOptions>({
  name: "statusBadge",

  group: "inline",

  inline: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      statuses: [
        "idea",
        "planned",
        "in_progress",
        "implemented",
        "tested",
        "broken",
      ] as const,
    };
  },

  addAttributes() {
    return {
      status: {
        default: "idea",
        parseHTML: (element) => element.getAttribute("data-status"),
        renderHTML: (attributes) => ({
          "data-status": attributes.status,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="status-badge"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const status = node.attrs.status as string;
    const emoji = STATUS_EMOJI[status] || "";
    const label = status.replace(/_/g, " ");

    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "status-badge",
        class: `status-badge status-badge--${status}`,
      }),
      `${emoji} ${label}`,
    ];
  },

  addCommands() {
    return {
      insertStatusBadge:
        (status) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { status },
          });
        },

      updateStatusBadge:
        (pos, status) =>
        ({ tr, dispatch }) => {
          if (!dispatch) return true;
          tr.setNodeMarkup(pos, undefined, { status });
          return true;
        },
    };
  },
});
