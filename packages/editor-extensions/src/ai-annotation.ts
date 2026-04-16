import { Node, mergeAttributes } from "@tiptap/core";

export interface AIAnnotationOptions {
  HTMLAttributes: Record<string, string>;
}

export type AnnotationType =
  | "implemented"
  | "contradicts"
  | "gap"
  | "drift"
  | "suggestion";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiAnnotation: {
      insertAIAnnotation: (attrs: {
        annotationId: string;
        annotationType: AnnotationType;
        message: string;
        relatedNoteId?: string;
      }) => ReturnType;
      removeAIAnnotation: (annotationId: string) => ReturnType;
    };
  }
}

const ANNOTATION_ICONS: Record<AnnotationType, string> = {
  implemented: "\u2705",
  contradicts: "\u26A0\uFE0F",
  gap: "\u2753",
  drift: "\u{1F504}",
  suggestion: "\u{1F4A1}",
};

/**
 * AIAnnotationExtension — AI annotations inline in notes.
 * Shows markers like "Implemented", "Contradicts [Note]", etc.
 */
export const AIAnnotationExtension = Node.create<AIAnnotationOptions>({
  name: "aiAnnotation",

  group: "block",

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      annotationId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-annotation-id"),
        renderHTML: (attributes) => ({
          "data-annotation-id": attributes.annotationId,
        }),
      },
      annotationType: {
        default: "suggestion",
        parseHTML: (element) =>
          element.getAttribute("data-annotation-type"),
        renderHTML: (attributes) => ({
          "data-annotation-type": attributes.annotationType,
        }),
      },
      message: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-message"),
        renderHTML: (attributes) => ({
          "data-message": attributes.message,
        }),
      },
      relatedNoteId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-related-note"),
        renderHTML: (attributes) => ({
          "data-related-note": attributes.relatedNoteId,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="ai-annotation"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const type = node.attrs.annotationType as AnnotationType;
    const icon = ANNOTATION_ICONS[type] || "";
    const message = node.attrs.message || "";

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "ai-annotation",
        class: `ai-annotation ai-annotation--${type}`,
      }),
      `${icon} ${message}`,
    ];
  },

  addCommands() {
    return {
      insertAIAnnotation:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              annotationId: attrs.annotationId,
              annotationType: attrs.annotationType,
              message: attrs.message,
              relatedNoteId: attrs.relatedNoteId || null,
            },
          });
        },

      removeAIAnnotation:
        (annotationId) =>
        ({ tr, state, dispatch }) => {
          if (!dispatch) return true;

          let found = false;
          state.doc.descendants((node, pos) => {
            if (
              node.type.name === this.name &&
              node.attrs.annotationId === annotationId
            ) {
              tr.delete(pos, pos + node.nodeSize);
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
