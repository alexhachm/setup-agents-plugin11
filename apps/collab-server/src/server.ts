import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import { Logger } from "@hocuspocus/extension-logger";
import { verifyToken } from "./auth";
import { fetchDocument, storeDocument } from "./persistence";
import { onConnect, onChange, onDisconnect } from "./hooks";
import { parseRoomName } from "@plugin11/shared";
import { prisma } from "@plugin11/db";

const PORT = parseInt(process.env.COLLAB_PORT || "1234", 10);

const server = Server.configure({
  port: PORT,

  async onAuthenticate({ token, documentName, connection }) {
    if (!token) {
      throw new Error("No authentication token provided");
    }

    const user = verifyToken(token);
    const room = parseRoomName(documentName);

    // AI engine service account bypasses workspace membership check.
    // It authenticates with userId === 'ai-engine' via a long-lived
    // service account JWT — see BLOCKERS.md BLOCKER-003.
    if (user.userId === "ai-engine") {
      console.log(
        `[auth] AI Engine connected to ${room.type} in workspace ${room.workspaceId}`
      );
      return {
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: "ai-engine",
        },
      };
    }

    // Verify workspace membership for all real users
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: room.workspaceId,
          userId: user.userId,
        },
      },
    });

    if (!member) {
      throw new Error(
        `Access denied: user ${user.userId} is not a member of workspace ${room.workspaceId}`
      );
    }

    // Enforce read-only for viewer and suggestion_only roles
    if (member.role === "viewer" || member.role === "suggestion_only") {
      connection.readOnly = true;
    }

    console.log(
      `[auth] User ${user.userId} (${member.role}) authenticated for ${room.type} in workspace ${room.workspaceId}`
    );

    return {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: member.role,
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
        storeDocument(documentName, state);
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
  console.log(
    `[collab-server] Hocuspocus WebSocket server running on port ${PORT}`
  );
});
