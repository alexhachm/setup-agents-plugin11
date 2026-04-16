import { Node, mergeAttributes } from "@tiptap/core";

export interface NoteReferenceOptions {
  HTMLAttributes: Record<string, string>;
  onNoteClick?: (noteId: string) => void;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    noteReference: {
      insertNoteReference: (attrs: {
        noteId: string;
        noteTitle: string;
      }) => ReturnType;
    };
  }
}

/**
 * NoteReferenceExtension — Notion-style inline links to other notes.
 * Rendered as colored, clickable chips. Triggered by [[ for fuzzy picker.
 *
 * Stored as: <span data-type="note-reference" data-note-id="uuid">Note Title</span>
 * Rendered as: a highlighted chip with the note's title
 * On hover: inline preview of the referenced note
 * On click: navigate to that note
 * On delete of target note: shows broken link indicator
 */
export const NoteReferenceExtension = Node.create<NoteReferenceOptions>({
  name: "noteReference",

  group: "inline",

  inline: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      onNoteClick: undefined,
    };
  },

  addAttributes() {
    return {
      noteId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-note-id"),
        renderHTML: (attributes) => ({
          "data-note-id": attributes.noteId,
        }),
      },
      noteTitle: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-note-title"),
        renderHTML: (attributes) => ({
          "data-note-title": attributes.noteTitle,
        }),
      },
      broken: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-broken") === "true",
        renderHTML: (attributes) => ({
          "data-broken": attributes.broken ? "true" : "false",
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="note-reference"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const isBroken = node.attrs.broken;
    const title = node.attrs.noteTitle || "Unknown Note";

    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "note-reference",
        class: `note-reference ${isBroken ? "note-reference--broken" : ""}`,
        title: isBroken ? `Broken link: ${title}` : title,
      }),
      isBroken ? `\u26A0\uFE0F ${title}` : title,
    ];
  },

  addCommands() {
    return {
      insertNoteReference:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              noteId: attrs.noteId,
              noteTitle: attrs.noteTitle,
              broken: false,
            },
          });
        },
    };
  },
});
