import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import { Logger } from "@hocuspocus/extension-logger";
import { verifyToken } from "./auth";
import { fetchDocument, storeDocument } from "./persistence";
import { onConnect, onChange, onDisconnect } from "./hooks";
import { parseRoomName } from "@plugin11/shared";

const PORT = parseInt(process.env.COLLAB_PORT || "1234", 10);

const server = Server.configure({
  port: PORT,

  async onAuthenticate({ token, documentName }) {
    if (!token) {
      throw new Error("No authentication token provided");
    }

    const user = verifyToken(token);
    const room = parseRoomName(documentName);

    // In production, check workspace membership and permissions here
    // For now, any valid token grants access
    console.log(
      `[auth] User ${user.userId} authenticated for ${room.type} in workspace ${room.workspaceId}`
    );

    return {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
      },
    };
  },

  async onConnect({ documentName, context }) {
    onConnect({
      documentName,
      user: context as { userId: string; name: string | null },
    });
  },

  async onChange({ documentName, context }) {
    onChange({
      documentName,
      user: context as { userId: string; name: string | null },
    });
  },

  async onDisconnect({ documentName, context }) {
    onDisconnect({
      documentName,
      user: context as { userId: string; name: string | null },
    });
  },

  extensions: [
    new Database({
      fetch: async ({ documentName }) => {
        return fetchDocument(documentName);
      },
      store: async ({ documentName, state }) => {
        await storeDocument(documentName, state);
      },
    }),
    new Logger({
      log: (message) => {
        console.log(`[hocuspocus] ${message}`);
      },
    }),
  ],
});

server.listen().then(() => {
  console.log(`[collab-server] Hocuspocus WebSocket server running on port ${PORT}`);
});
