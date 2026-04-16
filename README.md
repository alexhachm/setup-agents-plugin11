# Plugin 11 — Vibe Coder IDE

**The first IDE where the source of truth is collaborative notebooks, not code.**

You write your thoughts in notebooks, the AI reads along and thinks with you, and working software emerges from your notes. Google Docs-level collaboration means your team writes together, and the AI is just another collaborator in the room.

## Project Stats

| Metric | Value |
|--------|-------|
| TypeScript/TSX files | 120 |
| Lines of code (TS/TSX/Prisma) | 14,762 |
| Packages | 7 (monorepo) |
| Test suites | 5 |
| Tests | 60 |

## Architecture

Two cleanly separated layers:

```
┌─────────────────────────────────────────────────────────┐
│                    apps/web (Next.js 15)                 │
│  Notebooks · Editor · AI Chat · History · Live Preview  │
│  Real-time collab via Yjs CRDTs + TipTap                │
├─────────────────────────────────────────────────────────┤
│            apps/collab-server (Hocuspocus)               │
│  WebSocket hub · Auth · Persistence · Hooks              │
├──────────────────────┬──────────────────────────────────┤
│   packages/shared    │   packages/editor-extensions      │
│   Types · Perms      │   6 TipTap extensions             │
│   Yjs schema         │   AI annotation · Bot text        │
│   Constants          │   Correction · Decision block     │
├──────────────────────┼──────────────────────────────────┤
│   packages/db        │   ai-engine                       │
│   Prisma + Postgres  │   Intent detection · Planning     │
│   13 models          │   Code generation · Importers     │
│   8 enums            │   Domain analysis · Knowledge     │
└──────────────────────┴──────────────────────────────────┘
```

## Packages

| Package | Path | Description | LOC |
|---------|------|-------------|-----|
| `@plugin11/web` | `apps/web` | Next.js 15 web app — notebooks, editor, AI chat, collaboration, import, history, live preview | 7,903 |
| `@plugin11/ai-engine` | `ai-engine` | AI engine — intent detection, code generation, planning, domain analysis, importers | 5,280 |
| `@plugin11/editor-extensions` | `packages/editor-extensions` | 6 TipTap editor extensions for AI annotations, corrections, decisions | 838 |
| `@plugin11/shared` | `packages/shared` | Shared types, permissions, Yjs schema, constants | 348 |
| `@plugin11/db` | `packages/db` | Prisma ORM with PostgreSQL — 13 models, 8 enums | 241 |
| `@plugin11/collab-server` | `apps/collab-server` | Hocuspocus WebSocket server for real-time Yjs collaboration | 159 |

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your values:
#   DATABASE_URL        — PostgreSQL connection string
#   NEXTAUTH_SECRET     — Random secret for NextAuth.js
#   NEXTAUTH_URL        — http://localhost:3000
#   OPENAI_API_KEY      — For AI engine (cloud mode)

# 3. Generate Prisma client and push schema
pnpm db:generate
pnpm db:push

# 4. Start development
pnpm dev
```

This starts:
- **Web app** at `http://localhost:3000`
- **Collab server** at `ws://localhost:1234`
- **AI engine** in local dev mode

## Key Features

- **Collaborative Notebooks** — Real-time multi-user editing with Yjs CRDTs, cursors, and presence
- **AI Engine** — Dual-mode (cloud/local) AI that reads your notes and generates code inline
- **Intent Detection** — Automatically classifies user actions (planning, specifying, requesting, fixing, questioning)
- **Import Pipeline** — Import from Markdown, PDF, and Notion
- **Version History** — Snapshots with diff view and one-click restore
- **Live Preview** — WebContainer-powered code preview in the browser
- **Granularity Levels** — Beginner/intermediate/advanced visibility tiers
- **Keyboard Shortcuts** — Full shortcut system with overlay

## Documentation

- [Architecture Specification](docs/architecture.md) — Complete technical spec
- [User Simulation](docs/user-simulation.md) — Full walkthrough of every feature
- [Design Decisions](docs/design-decisions.md) — All architectural decisions and rationale
