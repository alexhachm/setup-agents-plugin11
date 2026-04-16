import { Node, mergeAttributes } from "@tiptap/core";

export interface BotTextOptions {
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    botText: {
      insertBotText: (attrs: {
        suggestionId: string;
        content: string;
      }) => ReturnType;
      acceptBotText: (suggestionId: string) => ReturnType;
      dismissBotText: (suggestionId: string) => ReturnType;
    };
  }
}

/**
 * BotTextExtension — marks AI suggestions with tinted background,
 * accept/dismiss UI, fermentation on accept.
 *
 * Renders as a node with a distinct tinted background. On accept,
 * the wrapper is removed and content becomes normal text (fermentation).
 */
export const BotTextExtension = Node.create<BotTextOptions>({
  name: "botText",

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
      suggestionId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-suggestion-id"),
        renderHTML: (attributes) => ({
          "data-suggestion-id": attributes.suggestionId,
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
    return [{ tag: 'div[data-type="bot-text"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "bot-text",
        class: "bot-text-suggestion",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      insertBotText:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              suggestionId: attrs.suggestionId,
              status: "pending",
            },
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: attrs.content }],
              },
            ],
          });
        },

      acceptBotText:
        (suggestionId) =>
        ({ tr, state, dispatch }) => {
          if (!dispatch) return true;

          let found = false;
          state.doc.descendants((node, pos) => {
            if (
              node.type.name === this.name &&
              node.attrs.suggestionId === suggestionId
            ) {
              // Replace the bot-text wrapper with its content (fermentation)
              const content = node.content;
              tr.replaceWith(pos, pos + node.nodeSize, content);
              found = true;
              return false;
            }
            return true;
          });

          return found;
        },

      dismissBotText:
        (suggestionId) =>
        ({ tr, state, dispatch }) => {
          if (!dispatch) return true;

          let found = false;
          state.doc.descendants((node, pos) => {
            if (
              node.type.name === this.name &&
              node.attrs.suggestionId === suggestionId
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
