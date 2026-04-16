import { Node, mergeAttributes } from "@tiptap/core";

export interface CorrectionOptions {
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    correction: {
      insertCorrection: (attrs: {
        correctionId: string;
        originalText: string;
        correctedText: string;
        explanation: string;
        sourceNoteTitle?: string;
      }) => ReturnType;
      keepCorrection: (correctionId: string) => ReturnType;
      revertCorrection: (correctionId: string) => ReturnType;
    };
  }
}

/**
 * CorrectionExtension — marks AI corrections with revert/clarify/keep options.
 * When the AI detects a contradiction with existing notes or codebase knowledge,
 * it inserts a correction block showing the corrected text with explanation.
 */
export const CorrectionExtension = Node.create<CorrectionOptions>({
  name: "correction",

  group: "block",

  content: "block+",

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      correctionId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-correction-id"),
        renderHTML: (attributes) => ({
          "data-correction-id": attributes.correctionId,
        }),
      },
      originalText: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-original-text"),
        renderHTML: (attributes) => ({
          "data-original-text": attributes.originalText,
        }),
      },
      explanation: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-explanation"),
        renderHTML: (attributes) => ({
          "data-explanation": attributes.explanation,
        }),
      },
      sourceNoteTitle: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-source-note"),
        renderHTML: (attributes) => ({
          "data-source-note": attributes.sourceNoteTitle,
        }),
      },
      status: {
        default: "pending",
        parseHTML: (element) => element.getAttribute("data-status"),
        renderHTML: (attributes) => ({
          "data-status": attributes.status,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="correction"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "correction",
        class: "ai-correction",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      insertCorrection:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              correctionId: attrs.correctionId,
              originalText: attrs.originalText,
              explanation: attrs.explanation,
              sourceNoteTitle: attrs.sourceNoteTitle || null,
              status: "pending",
            },
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: attrs.correctedText }],
              },
            ],
          });
        },

      keepCorrection:
        (correctionId) =>
        ({ tr, state, dispatch }) => {
          if (!dispatch) return true;

          let found = false;
          state.doc.descendants((node, pos) => {
            if (
              node.type.name === this.name &&
              node.attrs.correctionId === correctionId
            ) {
              // Replace correction wrapper with its content
              const content = node.content;
              tr.replaceWith(pos, pos + node.nodeSize, content);
              found = true;
              return false;
            }
            return true;
          });

          return found;
        },

      revertCorrection:
        (correctionId) =>
        ({ tr, state, dispatch }) => {
          if (!dispatch) return true;

          let found = false;
          state.doc.descendants((node, pos) => {
            if (
              node.type.name === this.name &&
              node.attrs.correctionId === correctionId
            ) {
              const originalText = node.attrs.originalText;
              tr.replaceWith(
                pos,
                pos + node.nodeSize,
                state.schema.nodes.paragraph.create(
                  null,
                  originalText
                    ? state.schema.text(originalText)
                    : undefined
                )
              );
              found = true;
              return false;
            }
            return true;
          });

          return found;
        },
    };
  },
});
