# setup-agents-plugin11

**The Vibe Coder IDE** — the first IDE where the source of truth is collaborative notebooks, not code.

## What is this?

A full IDE view of your project — not a keyhole chatbot — with the simplicity of vibe coding. You write your thoughts in notebooks, the AI reads along and thinks with you, and working software emerges from your notes. Google Docs-level collaboration means your team writes together, and the AI is just another collaborator in the room.

## Architecture

Two cleanly separated layers:

1. **Collaborative Notes Platform** (cloud-native) — Google Docs-style web app with real-time collaboration, sharing, presence, cursors. Built on Next.js + TipTap + Yjs CRDTs.

2. **AI Engine** (cloud-based, dev mode available locally) — Connects to the notes platform as a Yjs CRDT peer. Reads your notes, detects intent, offers inline suggestions, generates code. Built on the mac10 10.1 coordinator + AgentOne framework.

## Documentation

- [Architecture Specification](docs/architecture.md) — Complete technical spec
- [User Simulation](docs/user-simulation.md) — Full walkthrough of every feature from a user's perspective
- [Design Decisions](docs/design-decisions.md) — All architectural decisions and rationale

## Status

**Phase: Architecture & Design** — Pre-implementation. All specs are production-ready for engineering.
