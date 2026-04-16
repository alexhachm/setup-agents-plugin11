import { Node, mergeAttributes } from "@tiptap/core";

export interface DecisionBlockOptions {
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    decisionBlock: {
      insertDecisionBlock: (attrs: {
        decisionId: string;
        question: string;
      }) => ReturnType;
      resolveDecision: (decisionId: string, resolution: string) => ReturnType;
      reopenDecision: (decisionId: string) => ReturnType;
    };
  }
}

/**
 * DecisionBlockExtension — open questions with resolved state.
 * Renders as a styled block with the question and, when resolved,
 * the resolution text.
 */
export const DecisionBlockExtension = Node.create<DecisionBlockOptions>({
  name: "decisionBlock",

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
      decisionId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-decision-id"),
        renderHTML: (attributes) => ({
          "data-decision-id": attributes.decisionId,
        }),
      },
      question: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-question"),
        renderHTML: (attributes) => ({
          "data-question": attributes.question,
        }),
      },
      resolved: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-resolved") === "true",
        renderHTML: (attributes) => ({
          "data-resolved": attributes.resolved ? "true" : "false",
        }),
      },
      resolution: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-resolution"),
        renderHTML: (attributes) => ({
          "data-resolution": attributes.resolution,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="decision-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "decision-block",
        class: "decision-block",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      insertDecisionBlock:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              decisionId: attrs.decisionId,
              question: attrs.question,
              resolved: false,
              resolution: null,
            },
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: attrs.question }],
              },
            ],
          });
        },

      resolveDecision:
        (decisionId, resolution) =>
        ({ tr, state, dispatch }) => {
          if (!dispatch) return true;

          let found = false;
          state.doc.descendants((node, pos) => {
            if (
              node.type.name === this.name &&
              node.attrs.decisionId === decisionId
            ) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                resolved: true,
                resolution,
              });
              found = true;
              return false;
            }
            return true;
          });

          return found;
        },

      reopenDecision:
        (decisionId) =>
        ({ tr, state, dispatch }) => {
          if (!dispatch) return true;

          let found = false;
          state.doc.descendants((node, pos) => {
            if (
              node.type.name === this.name &&
              node.attrs.decisionId === decisionId
            ) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                resolved: false,
                resolution: null,
              });
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
