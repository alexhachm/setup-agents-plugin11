# Local Agent Tasks

> Tasks that require local machine access, filesystem operations, or CLI commands.
> Work through these after pulling the `feat/production-wiring` branch.

---

## STATUS KEY
- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete

---

## SETUP GROUP (run once, in order)

- [ ] **LOCAL-001**: Copy env files
  ```bash
  cp .env.example apps/web/.env.local
  cp .env.example apps/collab-server/.env
  cp .env.example ai-engine/.env
  # Then fill in all values per BLOCKERS.md
  ```

- [ ] **LOCAL-002**: Install all dependencies
  ```bash
  pnpm install
  ```

- [ ] **LOCAL-003**: Run Prisma migration + generate client
  ```bash
  pnpm --filter @plugin11/db prisma migrate dev --name init
  pnpm --filter @plugin11/db prisma generate
  ```

- [ ] **LOCAL-004**: Verify TypeScript path alias in web app
  - Open `apps/web/tsconfig.json`
  - Confirm `"paths": { "@/*": ["./*"] }` exists under `compilerOptions`
  - Required for `/api/collab-token` to resolve `@/lib/auth/config`

- [ ] **LOCAL-005**: Verify collab-server has @plugin11/db dependency
  - Open `apps/collab-server/package.json`
  - Confirm `"@plugin11/db": "workspace:*"` is in `dependencies`
  - If missing, add it and run `pnpm install`

- [ ] **LOCAL-006**: Generate AI engine service account JWT
  - Follow BLOCKER-003 in BLOCKERS.md
  - Set output as `COLLAB_TOKEN` in `ai-engine/.env`

---

## BUILD GROUP

- [ ] **LOCAL-007**: Warm Turbo build cache
  ```bash
  turbo build
  ```
  Verify `turbo.json` outputs include `dist/**` for all packages.

- [ ] **LOCAL-008**: Check for TypeScript errors across all packages
  ```bash
  turbo type-check
  # or
  pnpm --filter '*' tsc --noEmit
  ```

---

## RUNTIME GROUP

- [ ] **LOCAL-009**: Start dev environment (all services)
  ```bash
  # Terminal 1 — PostgreSQL (if running locally)
  # ensure Postgres is running on port 5432

  # Terminal 2 — collab-server
  pnpm --filter collab-server dev

  # Terminal 3 — Next.js web app
  pnpm --filter web dev

  # Terminal 4 — AI engine (optional for basic testing)
  pnpm --filter ai-engine dev
  ```

- [ ] **LOCAL-010**: Verify /api/collab-token returns a JWT
  ```bash
  # While logged in, open browser devtools and run:
  fetch('/api/collab-token').then(r=>r.json()).then(console.log)
  # Should return { token: "eyJ..." }
  # If 401, check NextAuth session is active
  ```

- [ ] **LOCAL-011**: Verify collab-server rejects unauthenticated connections
  ```bash
  # Open browser console and run:
  const ws = new WebSocket('ws://localhost:1234');
  ws.onerror = console.error;
  # Should fail/close immediately without a valid token
  ```

- [ ] **LOCAL-012**: Test note creation end-to-end
  - Create a workspace via the UI
  - Create a notebook
  - Create a note
  - Open note editor — confirm it connects (no "Connecting..." spinner stuck)
  - Type text, refresh page — confirm text persists (Yjs + Postgres)

---

## NEXT.JS CONFIG GROUP

- [ ] **LOCAL-013**: Add CORS headers for WebContainer (PreviewPanel)
  - See BLOCKER-004 in BLOCKERS.md
  - Edit `apps/web/next.config.js`
  - Test OAuth flow after applying

---

## MAINTENANCE GROUP (ongoing)

- [ ] **LOCAL-014**: Set up Yjs document compaction cron
  - See BLOCKER-007 in BLOCKERS.md
  - Recommended: weekly job via Vercel Cron or pg_cron

- [ ] **LOCAL-015**: Configure email SMTP
  - See BLOCKER-005 in BLOCKERS.md
  - Until configured, disable EmailProvider in auth config

- [ ] **LOCAL-016**: Configure Redis for collab-server horizontal scaling
  - See BLOCKER-006 in BLOCKERS.md
  - Not required for single-instance launch

---

## AGENT-COMPLETABLE (can be done by automated agent with repo access)

These were completed automatically on `feat/production-wiring`:

- [x] `apps/web/app/api/collab-token/route.ts` — real JWT issuance
- [x] `apps/collab-server/src/server.ts` — workspace membership enforcement
- [x] `apps/collab-server/src/persistence.ts` — debounced writes + retry
- [x] `apps/web/app/api/workspaces/route.ts` — real Prisma CRUD
- [x] `apps/web/app/api/notebooks/route.ts` — real Prisma CRUD
- [x] `apps/web/app/api/notes/route.ts` — real Prisma CRUD
- [x] `apps/web/app/api/snapshots/route.ts` — Prisma-backed snapshots
- [x] `apps/web/components/editor/NoteEditor.tsx` — real token + AI state sync + preview wiring
- [x] `apps/web/app/api/snapshots/[id]/route.ts` — snapshot restore endpoint
- [x] `apps/web/lib/collab-token.ts` — client-side token cache helper
