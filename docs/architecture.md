# Plugin 11 — The Vibe Coder IDE
## Architecture Specification v2 (April 2026)

---

## Vision

The first IDE where the source of truth is human-readable notebooks — not code. The notes platform is a **collaborative cloud app** (Google Docs-like sharing, cursors, and real-time editing). The AI coding engine connects to your documents as another CRDT peer — locally in dev mode, or via cloud API in production.

The key insight: **a chatbot is a keyhole.** Current vibe-coding tools force you to describe your project through a chat window and hope the AI understood. That's looking at a 100-part project through a slit. Plugin 11 gives the full view back — a complete IDE with notebooks, notes, structure, status, connections — but keeps the simplicity of vibe coding because the IDE is reading along as you write and responding inline.

The intelligence lives inside the editor, not beside it. When you type in a note, the AI reads your words, detects intent from keywords and context, and surfaces suggestions, clarifications, and corrections right where you're writing. No prompt engineering. No context-switching to a chat. You write your thoughts, the IDE thinks with you.

---

## Two Layers, Clean Separation

```
┌────────────────────────────────────────────────────────────┐
│  LAYER 1: Collaborative Notes Platform (cloud-native)      │
│                                                            │
│  Web app (Next.js/React). TipTap + Yjs (CRDT).           │
│  Real-time collaboration, sharing, presence, cursors.      │
│  This is the product. It works standalone without AI.      │
│                                                            │
│  Think: Google Docs meets Notion, organized as notebooks.  │
└───────────────────────┬────────────────────────────────────┘
                        │ Yjs sync protocol (WebSocket)
                        │ AI connects as a CRDT peer
┌───────────────────────┴────────────────────────────────────┐
│  LAYER 2: AI Engine                                        │
│                                                            │
│  Dev Mode: local Node.js process (10.1 plugin directly)   │
│  Cloud Mode: API endpoints + managed workers (production)  │
│                                                            │
│  Both use the same Yjs peer protocol. Only the connection  │
│  target URL changes between modes.                         │
│                                                            │
│  Reads notes, generates code, writes changes back.         │
│  Appears as a collaborator with its own cursor.            │
└────────────────────────────────────────────────────────────┘
```

### Why this separation matters

1. **The notes app has value alone.** Collaborative notebooks for project planning, specs, design — useful even without AI.
2. **AI is opt-in.** Users who want AI plug it in. Users who don't have a great notes platform.
3. **Cloud transfer is trivial.** The AI plugin connects via WebSocket/Yjs sync. Moving it to a server just changes the URL. No architectural rewrite.
4. **Sharing works immediately.** Multiple humans collaborate on notes. When AI is active, it's just another cursor.

---

## Layer 1: Collaborative Notes Platform

### Tech Stack

```
Frontend:
  - Next.js (React 19, App Router)
  - TipTap editor (rich text, already proven in my-app)
  - Yjs (CRDT for real-time sync)
  - @tiptap/extension-collaboration + collaboration-cursor
  - Tailwind CSS (clean, modern UI)
  - Monaco Editor (code view toggle)

Backend:
  - Next.js API routes + WebSocket server
  - Hocuspocus (Yjs WebSocket server — TipTap's official collab backend)
    OR custom y-websocket server for more control
  - PostgreSQL (user accounts, notebook metadata, permissions)
  - S3-compatible storage (document snapshots, images, assets,
    local project saves)
  - Redis (presence, sessions, pub/sub)

Auth:
  - NextAuth.js / Auth.js (Google, GitHub, email login)
  - JWT tokens for API + WebSocket auth
  - Workspace/team-based permissions

Deployment (initial):
  - Vercel (frontend)
  - Fly.io or Railway (Hocuspocus WebSocket server)
  - Supabase or Neon (PostgreSQL)
  - Can self-host everything later

Landing Page:
  - Open source AI/SaaS template (all filler — not a priority)
  - Ship something functional; iterate later
```

### Data Model

```
Workspace
  ├── id: uuid
  ├── name: string
  ├── owner_id: uuid
  ├── plan: enum (free, pro, team)
  ├── credit_balance: integer          ← credits for AI agent usage
  ├── created_at: timestamp
  └── members: WorkspaceMember[]

WorkspaceMember
  ├── workspace_id: uuid
  ├── user_id: uuid
  ├── role: enum (owner, admin, editor, viewer, suggestion_only)
  │         ← suggestion_only: can see AI suggestions, cannot consume agent credits
  ├── credit_share: integer?           ← optional shared credits granted by owner
  └── invited_at: timestamp

Notebook
  ├── id: uuid
  ├── workspace_id: uuid
  ├── title: string
  ├── icon: string (emoji)
  ├── domain: string?                  ← maps to code domain when AI active
  ├── granularity_min_level: enum (beginner|intermediate|advanced)
  │         ← notebooks below user's level setting are hidden
  ├── order: number
  ├── status: enum (draft, active, archived)
  ├── sharing: SharingConfig           ← per-notebook sharing supported
  ├── created_by: uuid
  ├── created_at: timestamp
  └── updated_at: timestamp

Note
  ├── id: uuid
  ├── notebook_id: uuid
  ├── title: string
  ├── yjs_doc_id: string              ← Yjs document identifier for collab sync
  ├── status: enum (idea, planned, in_progress, implemented, tested, broken)
  ├── granularity_min_level: enum (beginner|intermediate|advanced)
  │         ← notes below user's level setting are hidden
  ├── code_mappings: CodeMapping[]?   ← populated when AI engine is connected
  ├── tags: string[]                  ← includes special tags: ?open-question, !flag
  ├── order: number
  ├── created_by: uuid
  ├── created_at: timestamp
  └── updated_at: timestamp

CodeMapping
  ├── note_id: uuid
  ├── file_path: string
  ├── start_line: integer?
  ├── end_line: integer?
  └── mapping_type: enum (primary, related, generated)

SharingConfig
  ├── scope: enum (workspace | per_notebook)
  ├── link_sharing: enum (disabled, view, comment, edit)
  ├── public: boolean
  ├── chat_visible: boolean             ← chat panel sharing toggle (default false)
  └── shared_with: SharedUser[]

SharedUser
  ├── user_id: uuid
  ├── permission: enum (view, comment, edit, suggestion_only)
  └── shared_at: timestamp

NoteSnapshot (note version history — separate from code history)
  ├── id: uuid
  ├── note_id: uuid
  ├── yjs_state: binary               ← Yjs document state vector
  ├── trigger: enum (manual, auto, ai_change, timer)
  ├── description: string
  ├── created_by: uuid (user or "ai-engine")
  ├── created_at: timestamp
  └── metadata: json

CodeSnapshot (code version history — separate viewer, hidden from vibecoders by default)
  ├── id: uuid
  ├── workspace_id: uuid
  ├── git_commit_hash: string?
  ├── file_snapshots: FileSnapshot[]
  ├── triggered_by: string            ← "ai-engine" | user_id | "external-sync"
  ├── created_at: timestamp
  └── description: string

TimeEstimate
  ├── id: uuid
  ├── task_description: string
  ├── affected_notes: uuid[]
  ├── complexity_breakdown: ComplexityLine[]
  ├── estimated_minutes: number       ← pure arithmetic, zero LLM tokens
  └── computed_at: timestamp

ComplexityLine
  ├── note_id: uuid
  ├── complexity: enum (simple | medium | complex)
  ├── weight: number                  ← from allocation-learnings.md
  └── avg_minutes: number             ← historical data from allocation-learnings.md
```

### Real-Time Collaboration Architecture

```
User A (browser)                    User B (browser)
    │                                   │
    │ TipTap + Yjs                     │ TipTap + Yjs
    │ Y.Doc ←→ WebSocket              │ Y.Doc ←→ WebSocket
    │                                   │
    └───────────┐           ┌───────────┘
                │           │
          ┌─────▼───────────▼─────┐
          │   Hocuspocus Server    │
          │                       │
          │  - Yjs sync protocol  │
          │  - Awareness (cursors)│
          │  - Auth (JWT verify)  │
          │  - Persistence (PG)   │
          │  - Webhooks (on save) │
          └───────────┬───────────┘
                      │
                      │ Same Yjs sync protocol
                      │
          ┌───────────▼───────────┐
          │   AI Engine           │
          │   (Dev: local peer)   │
          │   (Cloud: API worker) │
          │                       │
          │  Connects as peer     │
          │  Has its own cursor   │
          │  Reads/writes notes   │
          │  via Yjs operations   │
          └───────────────────────┘
```

Each note is a separate Y.Doc. When a user opens a note, their browser connects to Hocuspocus for that document. Multiple users see each other's cursors, selections, and edits in real time.

The AI engine connects to the same Hocuspocus server as a **server-side Yjs peer**. It appears as another collaborator — users see an "AI Engine" cursor moving through their notes, writing changes. All collaborators see the AI's cursor and bot text suggestions exactly as they would see another human collaborator.

### Sharing & Permissions

| Feature | How it works |
|---------|-------------|
| Share a notebook | Per-notebook link sharing, set permission (view/comment/edit) |
| Share a workspace | Workspace-level invite by email, assign role (admin/editor/viewer/suggestion_only) |
| Suggestion-only invites | Invitee sees AI suggestions but cannot consume host's agent credits |
| Credit sharing | Workspace owner can grant a credit allowance to specific collaborators |
| Real-time cursors | See who's editing, where their cursor is, colored by user |
| AI as collaborator | AI Engine cursor and suggestions visible to all collaborators in the session |
| Comments | Inline comments on note content (threaded, resolvable). AI participates equally. |
| Presence | See who's online in this workspace/notebook right now |
| Note history | Browse note snapshots, restore any previous version (always visible) |
| Code history | Separate viewer, hidden by default, opt-in for technical users |
| Public sharing | Make a notebook publicly viewable via link |
| Export | Export notebook as PDF, Markdown, or HTML |
| Chat visibility | Chat panel sharing is per-session toggle (default: private). Users control when chat is visible to collaborators. |

### UI Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│  Top Bar                                                             │
│  [Logo] [Workspace Name ▾] [Search ⌘K]              [Share] [👤 AH] │
├────────────┬───────────────────────────────────────┬─────────────────┤
│ Sidebar    │  Editor Area                          │  Chat Panel     │
│            │                                       │  (right panel)  │
│ NOTEBOOKS  │  Note Title                           │                 │
│            │  ━━━━━━━━━━━━                         │  AI activity    │
│ 📓 Auth    │                                       │  log / chat     │
│   📝 Login │  [Rich text content with              │                 │
│   📝 SSO   │   collaboration cursors,              │  Task list:     │
│   📝 Roles │   @mentions, note references,         │  • Missing items│
│            │   bot text (AI suggestions),          │  • Open ?s      │
│ 📓 Payment │   toggle blocks, tables,              │                 │
│   📝 Stripe│   images, code blocks,                │  In-progress:   │
│   📝 Plans │   embedded previews]                  │  ⟳ Implementing │
│            │                                       │    Login note…  │
│ 📓 UI/UX   │  ─── View Toggle ───                  │                 │
│   📝 Home  │  [Notes] [Code] [Split] [Preview]    │  [chat input]   │
│   📝 Dash  │                                       │                 │
│            │  ─── Status ───                       │                 │
│ + New      │  [⟳ AI: Implementing...] [3 collab]  │                 │
├────────────┴───────────────────────────────────────┴─────────────────┤
│  Status Bar: [AI: Connected ●] [Granularity: Intermediate] [Saved]   │
└──────────────────────────────────────────────────────────────────────┘
```

### Granularity level toggle (status bar)
The user's current visibility level is always shown in the status bar. Clicking it opens a simple selector: **Beginner | Intermediate | Advanced**. Notes and notebooks tagged below the user's level are hidden from the sidebar and all views. No content is removed — visibility is client-side filtering only.

### Standalone Features (no AI required)

These work as a pure collaborative notes product:

1. **Rich text editing** — headings, lists, tables, code blocks, images, toggle blocks, inline tags, dates, embeds (migrated from my-app TipTap extensions)
2. **Notebooks & notes** — hierarchical organization with drag-and-drop reordering
3. **Real-time collaboration** — multiple users editing simultaneously with live cursors
4. **Sharing** — per-notebook and workspace-level link sharing, workspace invites, public notebooks
5. **Comments** — inline, threaded, resolvable
6. **Search** — full-text search across all notebooks and notes (⌘K)
7. **Slash commands** — `/` menu for inserting blocks, tables, images, etc. (from my-app)
8. **Templates** — notebook and note templates for common patterns
9. **Note version history** — automatic snapshots, manual save points, diff view (note content only)
10. **Tags** — cross-reference system, tag-based filtering, special tags: `?open-question`, `!flag`
11. **Export** — PDF, Markdown, HTML
12. **Presence** — see who's online, who's viewing what
13. **Notifications** — mentions, comments, share invites
14. **Mobile responsive** — works on tablet/phone for reviewing (editing on desktop)
15. **Note references** — Notion-style inline links to other notes, rendered as highlighted clickable chips

---

## Layer 2: AI Engine

### Dev Mode vs. Cloud Mode

The AI engine has two operational modes. The protocol is identical — only the connection target changes.

#### Dev Mode (current)

```
Developer's machine
├── AI Engine runs as local Node.js process
├── Uses 10.1 coordinator + AgentOne directly (no API intermediary)
├── Connects to Hocuspocus via ws://localhost:PORT
├── Reads/writes local git repository
├── Build and preview run locally (+ WebContainers for browser preview)
└── API keys managed locally in config
```

Dev mode is for the Plugin 11 developer building and testing the system. It uses the 10.1 plugin directly, without going through cloud API endpoints. This is the current working implementation.

#### Cloud Mode (production — spec ready, future deployment)

```
Cloud infrastructure
├── AI Engine runs as managed container/worker
├── Exposes REST API endpoints (see API spec below)
├── Connects to Hocuspocus via wss://api.yourapp.com
├── Clones/syncs git repo into isolated cloud sandbox
├── WebContainers runs in user's browser (not cloud)
└── API keys managed via platform key vault
```

Cloud mode is the production target. The Yjs peer model is identical — same peer connection, same operations, same protocol. The coordinator that runs locally in dev mode is the same coordinator invoked through the cloud API in production.

#### Cloud API Endpoints (future)

```
POST   /api/v1/agent/start
       Body: { workspace_id, notebook_ids?, task_description }
       Returns: { session_id, status: "started" }

GET    /api/v1/agent/status/:session_id
       Returns: { status, current_task, progress, log_tail }

POST   /api/v1/agent/stop/:session_id
       Returns: { status: "stopped", summary }

POST   /api/v1/agent/message
       Body: { session_id, message }
       Returns: { response, affected_notes }

GET    /api/v1/agent/log/:session_id
       Returns: Server-Sent Events stream of AI activity log

POST   /api/v1/agent/spawn-second-master
       Body: { workspace_id, first_session_id }
       Returns: { session_id, credit_cost, worker_pool_shared: true }

POST   /api/v1/import
       Body: { workspace_id, source_type, content_or_path }
       Returns: { job_id }

GET    /api/v1/import/:job_id
       Returns: { status, notebooks_created, notes_created, errors }
```

### AI Engine Internal Architecture

```
AI Engine
├── Yjs Client
│   ├── Connects to Hocuspocus server as authenticated peer
│   ├── Reads note content via Y.Doc
│   ├── Writes changes as Yjs operations (appears as collaborator)
│   ├── Sets awareness (cursor position, status: thinking/writing/idle)
│   └── Streams markdown → rich text conversion into notes
│
├── Coordinator (from mac10 10.1)
│   ├── Allocator — assigns implementation tasks to workers
│   ├── Watchdog — monitors worker health
│   ├── Merger — integrates code changes
│   ├── Domain analyzer — maps codebase to notebooks
│   └── Test runner — runs tests, reports results in plain language
│
├── Agent Framework (from AgentOne)
│   ├── Tool-using agent loop
│   ├── Provider abstraction (Claude, GPT, Gemini, etc.)
│   ├── Memory / context management
│   └── Plugin tools (file I/O, search, terminal, etc.)
│
├── CodeBridge
│   ├── Note → Code translator (generate/update code from note edits)
│   ├── Code → Note translator (present code changes as note updates)
│   ├── Bidirectional mapping maintenance
│   ├── On-save reverse mapping (code edits map back to notes on save)
│   └── Conflict resolution
│
├── ImportPipeline
│   ├── Source handlers (see Import Sources section)
│   ├── Content normalizer → markdown intermediate
│   ├── AI notebook/note generator
│   ├── Cross-reference builder
│   └── CodeMapping establisher
│
├── TranslatedConsole
│   ├── Intercepts build/test/error output
│   ├── Translates to plain language
│   ├── Links errors to specific notes
│   └── Pushes status updates to awareness and chat panel
│
├── KnowledgeLayer (from mac10 10.1)
│   ├── codebase-insights.md
│   ├── patterns.md
│   ├── mistakes.md             ← AI knowledge corrections stored here
│   ├── domain/{domain}.md
│   └── allocation-learnings.md ← historical task data for time estimation
│
└── Local Project
    ├── Git repository (the actual code)
    ├── Build system
    ├── Terminal (sandboxed)
    └── WebContainers / Sandpack (live preview)
```

### How the AI Connects

```typescript
// AI Engine connects to the notes platform as a Yjs peer
import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'

class AINotePeer {
  private doc: Y.Doc
  private provider: HocuspocusProvider

  connect(noteId: string, workspaceId: string) {
    this.doc = new Y.Doc()
    this.provider = new HocuspocusProvider({
      // Dev mode:   'ws://localhost:1234'
      // Cloud mode: 'wss://api.yourapp.com'
      url: process.env.HOCUSPOCUS_URL,
      name: `workspace:${workspaceId}:note:${noteId}`,
      document: this.doc,
      token: this.aiEngineToken,
    })

    // Set AI presence — visible to all collaborators
    this.provider.setAwarenessField('user', {
      name: 'AI Engine',
      color: '#8B5CF6',
      status: 'idle',
    })
  }

  getContent(): string {
    const fragment = this.doc.getXmlFragment('default')
    return yXmlFragmentToMarkdown(fragment)
  }

  async writeToNote(markdown: string) {
    this.setStatus('writing')
    const fragment = this.doc.getXmlFragment('default')
    await streamMarkdownToYjs(fragment, markdown)
    this.setStatus('idle')
  }

  setNoteStatus(status: string) {
    const meta = this.doc.getMap('metadata')
    meta.set('status', status)
  }

  private setStatus(status: string) {
    this.provider.setAwarenessField('user', {
      name: 'AI Engine',
      color: '#8B5CF6',
      status,
    })
  }
}
```

---

## Import Sources

All import paths feed the same pipeline: content is ingested, AI reads it, and notebooks/notes are generated from it. The domain analyzer from 10.1 handles existing repos; the other source types use a content normalizer before entering the same pipeline.

### Supported Import Sources

| Source | How it's ingested | Output |
|--------|-------------------|--------|
| **Existing repository** | Domain analyzer (10.1) scans codebase — identifies domains, maps files, finds coupling | One notebook per domain, notes generated from modules/endpoints/schemas/tests/README/docstrings |
| **Markdown files** | Read as-is; structure inferred from headings, lists, and code blocks | Notes generated preserving heading hierarchy as note titles |
| **PDFs** | Text extracted (pdf-parse or similar); layout structure inferred | Notes generated from sections/headings; figures referenced as attachments |
| **Note app exports** | Notion export (HTML/MD), Obsidian vault, Roam JSON, Bear notes — parsed to common markdown intermediate | Notes generated preserving original hierarchy |

### Import Pipeline (all sources)

```
Source content (repo path / file / PDF / export archive)
    ↓
1. Source Handler
   - Repo: domain analyzer → structured JSON domain map
   - Files/PDFs/exports: text extraction → markdown intermediate
    ↓
2. AI Notebook/Note Generator
   - AI reads normalized content as a prompt
   - Produces: notebook list with titles, icon suggestions, domain labels
   - Produces: note list per notebook (title, body draft, status: idea)
   - Granularity level tagged on each note (beginner/intermediate/advanced)
    ↓
3. Cross-Reference Builder
   - Links notes that reference shared concepts
   - Builds concept graph
   - Identifies gaps ("This API has no corresponding UI note")
   - Tags notes with ?open-question for identified gaps
    ↓
4. Writes to Notes Platform via Yjs
   - Creates notebooks/notes via Y.Doc operations
   - User sees them appear in real time (AI cursor writing)
   - User can reorganize, rename, delete, add context after generation
    ↓
5. CodeMapping Establishment (repo imports only)
   - Each note linked to its source files/regions
   - Bidirectional: note edits → code changes, code changes → note updates
```

### Post-Import Onboarding

After any import completes, the system launches a **guided walkthrough** on the new project. This is not a gate — users can edit notes immediately. The walkthrough covers: granularity settings, how bot text works, how to trigger implementation, and what the chat panel does. No drag-and-drop mapping editor is shown during onboarding.

---

## Granularity System

The granularity system controls **visibility**, not content generation. The AI writes one version of everything. Notes and notebooks are tagged with a minimum visibility level. Users set their level once and the UI filters accordingly.

### Three Levels

| Level | Who it's for | What's hidden |
|-------|-------------|---------------|
| **Beginner** | Non-technical users, product owners | Implementation detail notes, internal API notes, infrastructure notebooks, code-only change notes |
| **Intermediate** | Developers with general familiarity | Low-level infrastructure details, internal plumbing notes not relevant to feature work |
| **Advanced** | Senior engineers, architects | Nothing hidden — full view including all generated detail notes |

### How Tagging Works

When the AI generates notes (via import or inline creation), it assigns a `granularity_min_level` to each note and notebook based on:

- **Content type** — user-facing feature descriptions → Beginner; API/database design → Intermediate; internal plumbing/dependency wiring → Advanced
- **Source** — README content → Beginner; module-level analysis → Intermediate; file-level code mapping → Advanced
- **Context** — the AI can be instructed to re-tag notes if the user's mental model changes

The user never sees this tagging happen. They just see fewer or more notes based on their chosen level.

### Visibility Filtering

```typescript
// Client-side filter — no content is deleted, just hidden
function visibleNotes(notes: Note[], userLevel: GranularityLevel): Note[] {
  const levelOrder = { beginner: 0, intermediate: 1, advanced: 2 }
  return notes.filter(note =>
    levelOrder[note.granularity_min_level] <= levelOrder[userLevel]
  )
}
```

The granularity level can be changed at any time from the status bar. Changing from Beginner to Advanced instantly reveals all previously hidden notes. Notes are never deleted by this system.

---

## AI Features (when engine is connected)

### Core Principle: Intelligence Inside the Editor

The AI is not a chatbot you talk to. It's a thinking layer embedded in the editor that reads along as you write. The experience is:

1. You type in a note — your thoughts, plans, feature ideas, anything
2. The AI reads every keystroke, understanding intent from keywords, context, and its knowledge of the codebase
3. It responds **inline** — suggestions appear directly in the note as visually distinct "bot text" (different styling so you always know what's yours vs. the AI's)
4. You confirm a suggestion → it **ferments** into your normal text, becoming part of your note
5. You ignore or dismiss → it disappears

This is fundamentally different from a chatbot. You're not prompting. You're thinking out loud, and the IDE thinks with you.

### Bot Text: The Suggestion Layer

AI suggestions appear inline as **bot text** — visually distinct from user writing:

```
User writes:                          What appears in the editor:
─────────────────────────────────────────────────────────────────
"The payment flow should               The payment flow should
require 2FA before                     require 2FA before
processing any transaction              processing any transaction
over $100"                              over $100
                                        ┌─ AI suggestion ──────────┐
                                        │ Consider also requiring   │
                                        │ 2FA for first-time        │
                                        │ payment methods. Your     │
                                        │ [User Table] note doesn't │
                                        │ have a payment_verified   │
                                        │ flag yet — want me to     │
                                        │ add that?                 │
                                        │                           │
                                        │ [Accept] [Dismiss]        │
                                        └───────────────────────────┘
```

Note: "[User Table]" in the suggestion is a **Notion-style note reference** — a highlighted inline chip that links directly to the User Table note when clicked.

Bot text has distinct visual treatment:
- **Different background** — subtle tinted background (light purple/blue), immediately recognizable
- **AI avatar/icon** — small indicator showing this is AI-generated
- **Accept/Dismiss controls** — always present, always accessible
- **Multi-choice options** — when appropriate, suggestions include 2–4 options plus a free-text input field, like standard AI chat interfaces
- **Fermentation** — on accept, the tinted background fades and text becomes normal note text. It's now yours.

### Intent Detection & Knowledge Loops

The AI detects **what you're doing** and activates the right behavior:

| Detected Intent | Keywords/Signals | AI Behavior |
|----------------|-----------------|-------------|
| **Planning** | "should", "could", "I think", "what if", "maybe we", new note with question marks in title | Enters planning loop: suggests structure, asks clarifying questions, proposes alternatives, links to related notes |
| **Specifying** | "must", "requires", "needs to", "when the user", bullet points | Validates against existing notes — flags contradictions, identifies gaps, suggests edge cases |
| **Describing UI** | "button", "page", "screen", "layout", "shows", "displays" | Suggests component structure, links to existing UI notes, offers to generate preview |
| **Describing Data** | "stores", "table", "field", "database", "schema" | Cross-references Data notebook, suggests field types, flags missing relationships |
| **Questioning** | "?", "how does", "why", "what happens when" | Answers from codebase knowledge, cites specific notes (as note references), explains connections |
| **Fixing** | "broken", "wrong", "doesn't work", "bug", "issue" | Enters diagnostic loop: traces through related notes and code, explains the problem in plain language, suggests fix |
| **Requesting** | "add", "create", "build", "implement", "make" | Generates implementation plan inline, shows what notes/code will be affected, time estimate |
| **Pseudocode** | Code-style syntax in a note, indented spec blocks | Treats as specification for implementation — parses pseudocode as if it were a feature description and implements accordingly |

### Note References (Notion-style)

Cross-note references are **inline highlighted chips** — not plain text mentions. They render as a colored, clickable label showing the target note's title.

```
Plain text written:    "it calls the AI Tool function here"
Rendered as:           "it calls the [AI Tool] function here"
                                       ^^^^^^^^^^^
                                       Purple chip, links to the "AI Tool" note
                                       Hover: inline preview of that note
                                       Click: navigate to that note
```

References are created:
- By the AI when it generates bot text or suggestions (automatically links relevant notes)
- By users typing `[[` (fuzzy search picker opens)
- By the AI when generating notebooks from import (links notes that share concepts)

### Knowledge Persistence (10.1 Integration)

```
Knowledge Layer (from mac10 10.1)
├── codebase-insights.md    → AI knows how the code is structured
├── patterns.md             → AI knows what patterns work in this project
├── mistakes.md             → AI stores corrections here (user-confirmed errors,
│                             domain misunderstandings, wrong assumptions)
│                             Domain docs and notes are interchangeable —
│                             AI treats notes and domain docs with equal authority
├── domain/{domain}.md      → AI knows each domain deeply:
│   ├── key files & interactions
│   ├── public API surface
│   ├── coupling & dependencies
│   ├── risk map ("if you change X, Y breaks")
│   └── human-confirmed context
└── allocation-learnings.md → historical task complexity + time data
```

When you write "The payment flow should require 2FA," the AI:
1. Looks up the Payment domain knowledge doc
2. Knows which files implement payment processing
3. Knows the User Table schema from the Data domain doc
4. Knows the Auth domain already has a 2FA implementation
5. Cross-references all of this to offer a suggestion that's actually informed

**AI knowledge corrections**: When a user corrects the AI (via the "Clarify" option on a correction, or via the chat panel), the correction is stored in `mistakes.md`. This prevents the same error from recurring. Notes have equal standing to domain docs as knowledge sources — anything the user writes authoritatively in a note updates the AI's understanding of the project.

### AI Corrections

When you write something that contradicts the codebase or existing notes:

```
User writes: "The API returns user data as XML"

AI shows:
  ┌─ AI correction ─────────────────────────────────────┐
  │ The API returns user data as JSON                    │
  │                                                      │
  │ ℹ Your API note in the Backend notebook specifies    │
  │ JSON responses. Changed XML → JSON.                  │
  │                                                      │
  │ [Keep correction] [Revert to my text] [Clarify]      │
  └──────────────────────────────────────────────────────┘
```

Corrections are:
- **Visually flagged** — distinct indicator, different from suggestions
- **Always revertible** — one click returns your original text
- **Explained** — the AI cites the source note/knowledge doc
- **Not aggressive** — only fires when AI has high confidence. Ambiguous cases get a clarification question instead.
- **Stored on clarify** — "Clarify" opens a chat response and updates `mistakes.md`

**Contradiction detection** fires **reactively** — when notes are edited, triggered like a regular chatbox response. It is not a background scanner. It runs after the user stops typing (debounced), checking the edited note against related notes.

### Pseudocode Handling

When a user writes pseudocode or code-style specification in a note, the AI treats it as a formal implementation spec:

```
User writes in a note:

  function processPayment(userId, amount):
    if amount > 100:
      require2FA(userId)
    charge = stripe.createCharge(amount)
    return charge.id

AI reads this as: "Implement a processPayment function with this exact
signature and logic. 2FA required above $100. Use Stripe."
```

The AI does not correct pseudocode syntax. It implements the described behavior. This applies to any code-style block in a note, regardless of language or completeness.

---

## Chat Panel

The chat panel is the **secondary command interface** — not the primary interaction. Writing in notes is primary. The chat panel handles operations that span multiple notes, require explicit commands, or need a conversational back-and-forth.

### What the Chat Panel Does

**Commands and operations:**
- **Multi-note ops** — "Implement everything in the Auth notebook" (affects many notes at once)
- **Navigation** — "Take me to the note about user registration"
- **Spawning notebooks** — "Create a new notebook for payment with notes for Stripe, pricing tiers, and checkout"
- **Bulk edits** — "Add error handling requirements to every API note"
- **Exploration** — "How does the auth flow work?" (AI explains using your notes, with note references)
- **Diagnostics** — "Why is the checkout broken?" (AI traces through notes and code)
- **Cross-note discussions** — conversations that span multiple notes happen here, not in inline comments

**Passive displays (always visible in panel):**
- **AI activity log** — live log of what the AI engine is doing during implementation (like existing AI IDEs: "reading Auth notes... writing LoginForm component... running tests...")
- **Task list: currently missing** — items the AI has identified as gaps in the specification, shown as actionable suggestions (not written inline into notes)
- **Open questions** — items tagged `?open-question` surface here for easy review and resolution
- **Implementation progress** — loading state with status feed: Ideating → Implementing → Testing → Done
- **Flagged items** — items tagged `!flag` in any note appear here for triage

**Interaction model:**
- Standard chat input at the bottom
- AI responses include note references (inline chips linking to relevant notes)
- Multi-choice suggestion options when appropriate (2–4 choices + free text input)
- Discussions in the chat can generate `?open-question` tags in notes

### Chat Panel Sharing

Chat panel visibility to other collaborators is a **per-session toggle**, defaulting to private. The toggle is visible in the sharing controls. When shared, all collaborators see the same chat panel. When private, only the owner sees it.

### Agent-in-Use Notification

When a second collaborator tries to invoke the AI agent while it's already running:

```
┌─ Agent in use ────────────────────────────────────┐
│ AI Engine is currently working on:                │
│ "Implementing the Auth notebook" (Jordan H.)      │
│                                                   │
│ Options:                                          │
│ [Wait for current task to finish]                 │
│ [Spawn second master (+X credits)]                │
└───────────────────────────────────────────────────┘
```

If the second user spawns a second master:
- The second master complex connects to the **same worker pool** as the first
- Both masters can delegate tasks to any available worker
- The second master session **stays open unless explicitly closed** — tokens have already been expended
- Credit cost for the second master is shown before confirmation

---

## Multi-Note Drafts and Review Flow

When the AI is implementing something that touches multiple notes simultaneously:

### During Implementation

1. AI writes **unconfirmed bot text** into each affected note as it works
2. The chat panel shows a live activity log: "Writing to Auth/LoginForm note... Writing to Auth/Session note..."
3. Each note in the sidebar shows a pulsing "pending AI change" indicator
4. Users can continue working in other notes while this happens

### Follow Mode (opt-in)

At the start of a multi-note implementation, the chat panel offers:

```
"Implementing 7 notes in Auth notebook.
 [Follow AI's live edits] [Continue working on my own]"
```

If the user selects Follow Mode:
- The editor automatically navigates to whichever note the AI is currently editing
- The AI cursor is prominently visible
- The user can exit follow mode at any time

### Review All Changes

After a multi-note implementation completes, the chat panel shows:

```
AI finished implementing Auth notebook (7 notes changed)
[Review all changes] [Accept all] [Reject all]
```

Clicking "Review all changes" opens a **synchronized review view**:

```
┌── Review: Auth notebook changes ─────────────────────────────┐
│                                                              │
│  Left panel: Change list          Right panel: Note viewer  │
│  ─────────────────────            ────────────────────────  │
│  ● LoginForm note                 [Note content displays     │
│    + Added 2FA field               here, scrolled to match  │
│    + Updated submit handler        the selected item in     │
│  ● Session note                    the change list]         │
│    + Added session TTL                                       │
│  ● Roles note                                               │
│    ~ Updated permission check                               │
│                                                              │
│  ↕ Scrolling the change list updates the note viewer        │
│    position. Scrolling the note viewer updates the          │
│    highlighted item in the change list.                     │
│                                                              │
│  [Accept selected] [Reject selected] [Accept all]           │
└──────────────────────────────────────────────────────────────┘
```

Synchronized scrolling: selecting an item in the change list scrolls the note viewer to the corresponding location. Scrolling the note viewer updates which change list item is highlighted.

---

## Time Estimation

Time estimation is **pure arithmetic** — zero LLM tokens. It uses historical data from `allocation-learnings.md` and simplified Function Point counting.

### Formula

```
estimated_minutes = Σ(note_count × complexity_weight × avg_minutes_per_note)
```

Where:
- `note_count` is the number of distinct notes affected by the task
- `complexity_weight` is per-note: 1.0 (simple) | 2.5 (medium) | 6.0 (complex)
- `avg_minutes_per_note` is the historical average for that complexity tier, read from `allocation-learnings.md`

### Complexity Classification

The AI classifies each affected note into simple/medium/complex based on:

| Tier | Criteria | Example |
|------|----------|---------|
| **Simple** | One or two code changes, no cross-domain dependencies | Add a validation rule, change a UI label |
| **Medium** | Multiple files, some cross-domain coordination | New API endpoint with frontend component |
| **Complex** | New domain, cross-notebook changes, database schema change | New authentication provider, payment system overhaul |

Classification is rule-based from the note's code mappings and dependency graph — no LLM call required.

### Display

Time estimates appear:
- In the chat panel when a task is proposed
- As a subtitle in the plan approval dialog before a large implementation
- Never inline in notes (they clutter the editing experience)

```
"Implement Auth notebook: ~45 min
 (7 notes: 3 simple, 3 medium, 1 complex)"
```

---

## Implementation Progress

### In the Note

When an implementation request originates from a note (user types "implement this" or accepts a suggestion to implement), the originating note shows:

```
┌─ Implementation in progress ─────────────────────┐
│ ⟳ Implementing: LoginForm component              │
│                                                  │
│ Ideating ✓ → Implementing → Testing → Done       │
│                                                  │
│ [Follow mode] [Continue editing]                 │
└──────────────────────────────────────────────────┘
```

This loading block replaces the normal bot text area in the originating note while the task runs. It disappears when done and is replaced with a completion annotation.

### In the Chat Panel

The chat panel shows full AI activity logging during implementation:
- Each file being written
- Each test being run
- Errors encountered and how they're being resolved
- Final summary with note status updates

This mirrors the style of existing AI IDEs (Cursor, Windsurf) for users who want to observe, but it's in the chat panel — not inline in notes — so it doesn't disturb the writing experience.

---

## Version History

Note history and code history are **entirely separate viewers** with separate data stores. Vibecoders interact only with note history. Code history exists for technical users who opt in.

### Note History (primary, always visible)

Located in the right panel → "History" tab. Shows:

```
Note: LoginForm
─────────────────────────────────
Apr 15 14:32  You edited         ← [Restore] [Compare]
Apr 15 14:01  AI Engine changed  ← [Restore] [Compare]
Apr 15 11:20  Auto-save          ← [Restore] [Compare]
Apr 14 18:45  You edited         ← [Restore] [Compare]
```

- Automatic snapshot before every AI-initiated change
- Manual save points ("Save checkpoint")
- Named snapshots from chat commands ("Snapshot before auth refactor")
- Visual diff: shows note content changes in plain text, not code
- Restore: one click to return note to any previous state

### Code History (separate viewer, hidden by default)

Accessed via: Code view → top bar → "Code history". Not visible in the default Notes view. Not mentioned to users unless they navigate to the Code view.

```
Code history: workspace / auth domain
─────────────────────────────────────
Apr 15 14:01  AI Engine: implemented 2FA trigger  ← [Restore] [Diff]
Apr 15 11:18  AI Engine: scaffolded LoginForm      ← [Restore] [Diff]
Apr 14 09:30  External sync: git push from dev2    ← [Restore] [Diff]
```

- Standard code diff view (Monaco diff editor)
- Git commit hashes preserved where available
- Restoration triggers a new CodeSnapshot, not a destructive overwrite

---

## Live Preview

Live preview runs **entirely in the browser** using the WebContainers API (StackBlitz). No backend preview server is needed.

### Technology

| Layer | Technology |
|-------|-----------|
| **Primary runtime** | WebContainers API (StackBlitz) — full Node.js in browser via WASM |
| **Fallback** | Sandpack (CodeSandbox) — for simpler projects that don't need full Node.js |
| **Embed** | `<iframe>` pointing to the WebContainers dev server URL |
| **Offline** | ServiceWorker caches the WebContainers runtime; preview works offline once loaded |

### Characteristics

- **Boot time**: milliseconds (WASM-based)
- **npm install**: ~5x faster than local npm (StackBlitz claim)
- **Isolation**: full browser sandbox, no access to local filesystem
- **Dev server**: starts in-browser, live URL served via ServiceWorker
- **Hot reload**: file writes from AI Engine → WebContainers file system → dev server hot reloads → iframe updates

### View Integration

The "Preview" tab in the view toggle opens the WebContainers iframe:

```
[Notes] [Code] [Split] [Preview]
                        ^^^^^^^^
                        WebContainers iframe
                        Updates as AI writes files
```

In Split view, the preview can be the right pane with the notes editor on the left.

---

## Drift Detection

Drift = when the codebase state no longer matches what the notes say should be true.

### Detection Triggers

| Mode | When it fires |
|------|--------------|
| **Reactive (primary)** | When the AI engine works in a code area, it checks the notes for that domain against the current code state. Fires as part of the implementation loop, not separately. |
| **Background periodic** | Scheduled check (configurable interval, default: every 15 minutes when engine is active). Compares all domain docs against codebase state. |

### Response

When drift is detected:
1. The affected note gets a `⚠️ Drift detected` annotation with the discrepancy described in plain language
2. The chat panel shows a notification with options: [Update note to match code] [Update code to match note] [Dismiss]
3. Notes are never automatically updated — drift resolution always requires user confirmation

---

## External Change Detection

When code is modified outside the Plugin 11 workspace (e.g., another developer pushes a git commit, or the user edits files in a local editor), the system detects and re-ingests the changes.

### Detection Mechanism

```
Git watcher (dev mode: file system watch on .git/refs)
Git poller  (cloud mode: poll remote HEAD on interval)
    ↓
Detect: commit hash changed or file modification time changed
    ↓
Diff: compute changed files since last known sync point
    ↓
Re-ingest pipeline (same as ImportPipeline, scoped to changed files)
    ↓
Update affected notes + CodeMappings
    ↓
Notify user in chat panel: "External changes detected — X files updated"
```

### Re-ingestion

External changes run through the **same pipeline as new project import**, scoped to the changed files/domains only:

1. Domain analyzer re-scans changed files
2. AI reads changed content and updates relevant notes (as bot text — not auto-accepted)
3. Code history gets a new entry: "External sync: git push from dev2"
4. User reviews and accepts the note updates

### Offline Behavior

There is no local AI agent in production. Offline editing in production is handled identically to external changes:

- Yjs handles offline note editing natively (CRDT merges when reconnected)
- Code changes made offline are detected as "external changes" when the cloud connection returns
- They run through the same re-ingestion pipeline

Dev mode uses the local agent and is treated identically to cloud mode in the protocol — the same sync and re-ingestion logic applies.

---

## Saves and Version Control

### Local Project Saves

All project files (code generated by the AI engine) are saved locally to the project directory. This does not require Git.

```
~/.plugin11/projects/{workspace_id}/
├── code/           ← all generated source files
├── snapshots/      ← code snapshots (local, not Git)
└── config.json     ← workspace config, API keys (dev mode)
```

Saves happen:
- Automatically after every AI write operation
- On demand via "Save checkpoint" command in chat or ⌘S

### Optional GitHub Sync

GitHub integration is opt-in and not required. Users who don't know Git never need to encounter it.

```
Settings → Integrations → GitHub (optional)
  - Connect GitHub account
  - Link a repository
  - Choose sync direction: push-only | pull-only | bidirectional
  - Auto-push on checkpoint: yes/no
```

When GitHub sync is enabled, code snapshots are backed by real Git commits. When not enabled, snapshots are local only.

---

## Sharing and Credits

### Sharing Model

| Scope | How to set it |
|-------|--------------|
| **Workspace sharing** | Invite by email → assign role (admin/editor/viewer/suggestion_only) |
| **Per-notebook sharing** | Notebook → Share → generate link or invite specific users with per-notebook permissions |
| **Public notebook** | Per-notebook → make publicly viewable via link |
| **Chat panel** | Per-session toggle, default private |

### Credit Model

| User type | Agent credit access |
|-----------|-------------------|
| Workspace owner | Full access to workspace credit balance |
| Admin/Editor | Uses workspace credits by default |
| Suggestion-only invite | Cannot consume agent credits — sees AI suggestions from others only |
| Credit-share recipient | Owner grants a specific credit allowance; recipient can spend up to that amount |

Credit sharing settings: `Settings → Team → {member} → Grant credits → [amount]`

### AI Visibility to Collaborators

All session collaborators see:
- The AI Engine cursor (purple, labeled "AI Engine")
- Bot text suggestions in notes (as they appear)
- AI activity in the chat panel (if chat panel is shared)
- AI participation in comment threads (AI is an equal commenter)

---

## Delete and Undo Confirmation

### Deleting Notes or Notebooks with Committed Code

When a user deletes a note or notebook that has associated implemented code (non-empty CodeMappings), the system prompts:

```
┌─ Confirm deletion ────────────────────────────────────────┐
│ "LoginForm note" has implemented code attached.           │
│                                                           │
│ Deleting this note will mark the corresponding code       │
│ for removal.                                              │
│                                                           │
│ [Cancel] [Delete note only] [Plan with agent]             │
│                             ↑ opens chat to discuss       │
│                               dependencies and options    │
└───────────────────────────────────────────────────────────┘
```

The user can:
- **Cancel** — nothing changes
- **Delete note only** — removes the note; code is marked orphaned (not deleted immediately)
- **Plan with agent** — opens the chat panel where the AI performs dependency analysis: "If you remove LoginForm, these 3 notes reference it: [Auth Flow], [Session], [API Route]. Here's what I'd need to update."

The user can then decide how to proceed with the agent's help. No committed code is automatically deleted.

### Selective Undo

The note history viewer supports restoring any individual note to a previous snapshot without affecting other notes. The code history viewer supports restoring individual code snapshots. These are independent operations.

---

## Note Structure

### Note References

Notes reference each other using **Notion-style inline links** — highlighted chips rendered inline in the note body.

```
TipTap extension: NoteReferenceNode
  - Triggered by: [[ (fuzzy picker)
  - Stored as: <note-ref id="uuid" title="Note Title" />
  - Rendered as: a colored chip with the note's title
  - On hover: inline preview popover of the referenced note
  - On click: navigate to that note
  - On delete of target note: shows broken link indicator
```

AI-generated text uses note references automatically when linking to concepts defined in other notes.

### Note Splitting

The AI suggests splitting a note when:
1. A note grows beyond a reasonable length (configurable threshold)
2. AND a distinct sub-domain mapping makes sense

The suggestion fires **reactively** — prompted at the addition of new content that pushes the note past the threshold, not from a background scanner.

```
┌─ Note getting long ────────────────────────────────────┐
│ "Auth" note now covers login, SSO, and session mgmt.  │
│ Consider splitting into 3 notes:                      │
│ [Login Flow] [SSO Integration] [Session Management]   │
│                                                       │
│ [Split as suggested] [Keep as one note] [Customize]   │
└────────────────────────────────────────────────────────┘
```

---

## Multi-Agent Collaboration

### Single-Agent Default

By default, one AI master complex is active per workspace at a time. The master coordinates the worker pool from 10.1. Only one user can direct the agent simultaneously.

### Agent Conflict Resolution

If a second user invokes the agent while it's running:

```
┌─ Agent in use ───────────────────────────────────────────┐
│ AI Engine is currently working for Jordan H.             │
│ Task: "Implement the Payment notebook"                   │
│ Estimated time remaining: ~12 min                        │
│                                                          │
│ [Wait] [Spawn second master complex (+X credits)]        │
└──────────────────────────────────────────────────────────┘
```

### Second Master Behavior

When spawned:
- A second coordinator instance starts, connecting to the same Hocuspocus server as another peer
- It shares the same worker pool as the first master (workers can receive tasks from either master)
- The second master session **persists until explicitly closed** — tokens have already been spent on spawning it, so it remains available
- Credits are charged from the spawning user's allocation

```
POST /api/v1/agent/spawn-second-master
Body: { workspace_id, first_session_id }
Returns: { session_id, credit_cost, worker_pool: shared }
```

---

## Technical Architecture: Implementation Notes

### Yjs Document Structure

Each note is a separate Y.Doc with a predictable room name:

```
Room: "workspace:{workspace_id}:note:{note_id}"

Y.Doc structure:
  ├── xmlFragment("default")     — TipTap rich text content
  ├── map("metadata")            — status, tags, granularity_min_level
  ├── map("codeMappings")        — file/line mappings (populated by AI)
  ├── array("botText")           — pending AI suggestions (not yet accepted)
  ├── array("snapshots")         — snapshot references
  └── map("aiState")             — AI engine state for this note
```

Notebook-level metadata lives in a shared Y.Doc per workspace:

```
Room: "workspace:{workspace_id}:meta"

Y.Doc structure:
  ├── array("notebooks")         — notebook list with ordering
  ├── map("notebook:{id}")       — per-notebook metadata + granularity_min_level
  ├── map("settings")            — workspace settings including user granularity level
  └── map("presence")            — who's online
```

### Hocuspocus Server Configuration

```typescript
import { Server } from '@hocuspocus/server'
import { Database } from '@hocuspocus/extension-database'
import { Logger } from '@hocuspocus/extension-logger'

const server = Server.configure({
  port: 1234,

  async onAuthenticate({ token, documentName }) {
    const user = verifyJWT(token)
    const [type, wsId, _, noteId] = documentName.split(':')
    const hasAccess = await checkPermission(user.id, wsId, noteId)
    if (!hasAccess) throw new Error('Unauthorized')
    return { user }
  },

  extensions: [
    new Database({
      fetch: async ({ documentName }) => {
        return await db.getYjsState(documentName)
      },
      store: async ({ documentName, state }) => {
        await db.storeYjsState(documentName, state)
      },
    }),
    new Logger(),
  ],
})

server.listen()
```

### Project Structure

```
setup-agents-plugin11/
├── apps/
│   ├── web/                          # Next.js collaborative notes app
│   │   ├── app/                      # App Router pages
│   │   │   ├── (auth)/               # Login, signup, invite accept
│   │   │   ├── (workspace)/          # Workspace pages
│   │   │   │   ├── [workspaceId]/
│   │   │   │   │   ├── [notebookId]/
│   │   │   │   │   │   └── [noteId]/  # Note editor page
│   │   │   │   │   ├── settings/
│   │   │   │   │   └── page.tsx       # Workspace home
│   │   │   │   └── layout.tsx
│   │   │   ├── api/                   # API routes
│   │   │   │   ├── auth/              # NextAuth
│   │   │   │   ├── workspaces/
│   │   │   │   ├── notebooks/
│   │   │   │   ├── notes/
│   │   │   │   ├── agent/             # Cloud mode AI agent endpoints
│   │   │   │   └── import/            # Import pipeline endpoints
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── editor/               # TipTap editor + extensions
│   │   │   ├── notebooks/            # Notebook panel
│   │   │   ├── collaboration/        # Cursors, presence, comments
│   │   │   ├── sharing/              # Share dialogs, permissions
│   │   │   ├── ai/                   # Chat panel, bot text, status
│   │   │   │   ├── ChatPanel.tsx     # Chat + activity log + task list
│   │   │   │   ├── BotText.tsx       # Inline suggestion component
│   │   │   │   ├── ReviewAllChanges.tsx # Synchronized review view
│   │   │   │   └── ProgressBlock.tsx # In-note loading block
│   │   │   ├── preview/              # WebContainers iframe integration
│   │   │   ├── history/
│   │   │   │   ├── NoteHistory.tsx   # Primary — always accessible
│   │   │   │   └── CodeHistory.tsx   # Secondary — opt-in, Code view only
│   │   │   └── layout/               # Shell, sidebar, panels
│   │   ├── lib/
│   │   │   ├── yjs/                  # Yjs providers, helpers
│   │   │   ├── db/                   # Prisma client
│   │   │   ├── auth/                 # Auth utilities
│   │   │   └── time-estimation.ts    # Arithmetic estimator (zero LLM)
│   │   └── package.json
│   │
│   └── collab-server/                # Hocuspocus WebSocket server
│       ├── src/
│       │   ├── server.ts             # Hocuspocus config
│       │   ├── auth.ts               # JWT verification
│       │   ├── persistence.ts        # PostgreSQL Yjs storage
│       │   └── hooks.ts              # onConnect, onChange, onDisconnect
│       └── package.json
│
├── packages/
│   ├── shared/                       # Shared types, constants
│   │   ├── types.ts                  # Notebook, Note, User, Granularity types
│   │   ├── yjs-schema.ts            # Y.Doc structure definitions
│   │   └── permissions.ts           # Permission + credit logic
│   │
│   └── editor-extensions/           # TipTap extensions
│       ├── toggle-block/
│       ├── tag-node/
│       ├── date-node/
│       ├── slash-command/
│       ├── status-badge/             # Implementation status badges
│       ├── ai-annotation/            # Inline AI annotations
│       ├── note-reference/           # Notion-style note links (NEW)
│       ├── bot-text/                 # AI suggestion inline blocks (NEW)
│       └── code-preview/             # Inline code snippet preview
│
├── ai-engine/                        # AI plugin (dev mode entry point)
│   ├── src/
│   │   ├── index.ts                  # Entry point, CLI
│   │   ├── yjs-peer.ts              # Yjs CRDT peer connection
│   │   ├── code-bridge.ts           # Note ↔ code translation + on-save reverse
│   │   ├── domain-analyzer.ts       # Repo → notebook generation (10.1)
│   │   ├── import-pipeline.ts       # All import source handlers
│   │   ├── translated-console.ts    # Build output → plain language
│   │   ├── external-change-watcher.ts # Git watcher + re-ingestion trigger
│   │   ├── drift-detector.ts        # Reactive + periodic drift checks
│   │   ├── contradiction-detector.ts # Reactive contradiction check on note edit
│   │   ├── time-estimator.ts        # Arithmetic estimator (reads allocation-learnings.md)
│   │   ├── coordinator/             # Adapted from mac10 10.1
│   │   │   ├── allocator.ts
│   │   │   ├── watchdog.ts
│   │   │   └── ...
│   │   ├── agents/                  # Adapted from AgentOne
│   │   │   ├── agent.ts
│   │   │   ├── tools/
│   │   │   └── providers/
│   │   └── config.ts                # API keys, provider config (dev mode)
│   ├── package.json
│   └── README.md                    # Setup instructions
│
├── prisma/
│   └── schema.prisma                # Database schema
│
├── turbo.json                       # Turborepo config
├── package.json                     # Root workspace
├── pnpm-workspace.yaml
└── docs/
    ├── architecture.md              # This document
    ├── domain-mapping.md            # Domain analysis pipeline
    ├── ai-engine-protocol.md        # How AI connects via Yjs
    ├── import-sources.md            # Import pipeline details
    └── feature-map.md               # IDE → notebook feature translation
```

---

## Feature Translation: Modern IDE → Notebook IDE

### File System → Notebook System

| IDE Feature | Plugin 11 Equivalent |
|-------------|---------------------|
| File explorer | Notebook panel (notebooks → notes) |
| Create file | Create note (AI generates code files) |
| Delete file | Delete note (AI cleans up code, with confirmation + dependency analysis) |
| Rename file | Edit note title (AI refactors code) |
| Move file | Move note between notebooks (AI refactors) |
| File search (⌘P) | Note search (⌘K) |
| File tabs | Note tabs |
| Minimap | Note overview |

### Code Editing → Note Editing

| IDE Feature | Plugin 11 Equivalent |
|-------------|---------------------|
| Write code | Write/edit notes in plain language |
| Autocomplete | Smart suggestions (bot text, multi-choice) |
| Multi-cursor | Batch note editing ("Add dark mode to all UI notes") |
| Find/replace | Concept search and replace |
| Code folding | Toggle blocks, section collapsing |
| Syntax highlighting | Semantic highlighting (requirements, decisions, status, AI annotations) |
| Go to definition | Go to note (click note reference chip) |
| Peek definition | Inline preview popover of referenced note |
| Refactor/rename | Edit note; AI propagates across code |
| Edit in code view | Monaco editor changes map back to notes on save |

### Version Control

| IDE Feature | Plugin 11 Equivalent |
|-------------|---------------------|
| Git commits | Note snapshots (always visible) + Code snapshots (hidden by default) |
| Git diff | Note diff (plain text comparison) / Code diff (Monaco, opt-in) |
| Git blame | Note history ("Added April 10 after you said 'we need SSO'") |
| External git push | Detected, re-ingested as external change, surfaced in chat panel |

### Debugging → Concept Debugging

| IDE Feature | Plugin 11 Equivalent |
|-------------|---------------------|
| Stack trace | Flow trace ("User clicked Buy → Payment note → failed: no price defined") |
| Console.log | Explain mode ("Walk me through signup flow") |
| Hot reload | WebContainers live reload as AI writes files |
| Error diagnostics | Plain-language errors in chat panel, linked to specific notes |

### Collaboration (Google Docs parity)

| Google Docs Feature | Plugin 11 Implementation |
|--------------------|--------------------------
| Real-time cursors | Yjs awareness — colored cursors per user + AI |
| Suggesting mode | AI uses bot text; user accepts/rejects |
| Comments + threads | Inline comments, threaded replies, resolve; AI participates equally |
| Share with permissions | Workspace roles + per-notebook sharing |
| Note version history | Yjs snapshots + named save points (primary, always visible) |
| Code version history | Separate viewer, Code view only, hidden from vibecoders by default |
| Link sharing | Public/private links with permission levels (per-notebook and workspace) |
| @mentions | Mention users; note references for concepts |
| Offline editing | Yjs handles offline notes → sync on reconnect; code re-ingested as external change |

---

## UI Design Direction

### Visual Language

Google Antigravity-inspired: clean, dark-mode default, modern IDE chrome. Where Antigravity shows code panels, Plugin 11 shows note panels.

### Distinctive UI Elements

1. **Bot Text** — the signature visual: AI suggestions appear inline with a tinted background, AI icon, and accept/dismiss controls. Multi-choice options when applicable. On accept, tint fades and text becomes yours.
2. **Note Reference Chips** — Notion-style inline highlighted links to other notes. Hover shows popover preview. Click navigates.
3. **AI Cursor** — purple cursor labeled "AI Engine" moving through notes in real time, visible to all collaborators
4. **Correction Highlights** — factual corrections flagged with distinct indicator; revert/clarify always available
5. **Collaborator Avatars** — top-right shows who's in this notebook (Google Docs style)
6. **Implementation Meter** — per-notebook progress ring (% of notes implemented)
7. **The Glow Ring** — soft animated border on the editor when AI is actively thinking about the current note
8. **Concept Threads** — thin lines in the sidebar connecting related notes across notebooks
9. **Change Pulse** — notes briefly pulse when updated by AI or another collaborator
10. **Status Badges** — per note: 💡 idea · 📋 planned · 🔨 in progress · ✅ implemented · 🧪 tested · 🔴 broken
11. **Intent Indicator** — status bar label: "Planning..." "Specifying..." "Describing UI..." — shows AI is tracking intent
12. **Granularity Toggle** — status bar control: Beginner | Intermediate | Advanced
13. **Progress Block** — loading block in the originating note during implementation, with step-by-step status feed

---

## Phase 1 Deliverables

### P1a: Collaborative Notes Platform (standalone)
1. Next.js app with auth (Google + email login)
2. Workspace, notebook, note CRUD
3. TipTap editor with rich text (migrated my-app extensions)
4. Yjs + Hocuspocus real-time collaboration
5. Live cursors and presence
6. Note reference extension (Notion-style inline chips)
7. Per-notebook and workspace-level sharing (link + invite with permissions)
8. Note version history (snapshots — separate from code history)
9. ⌘K search
10. Tag system including `?open-question` and `!flag` special tags
11. Granularity level filter (client-side, status bar toggle)
12. Deploy to Vercel + Fly.io
13. Open source landing page (all filler)

### P1b: AI Engine Plugin (dev mode local, cloud mode endpoints)
1. Yjs peer that connects to the notes server (dev: local, cloud: wss API)
2. **Bot text suggestions** — inline AI suggestions with accept/dismiss/fermentation and multi-choice options
3. **Intent detection** — keyword and context analysis for planning/specifying/fixing/pseudocode loops
4. **Knowledge persistence** — domain docs, codebase insights, patterns, mistakes.md (from 10.1)
5. **AI corrections** — inline factual corrections with revert/clarify; corrections stored in mistakes.md
6. **Chat panel** — activity log, task list (missing items), open questions, implementation progress, multi-note commands
7. **Multi-note drafts and review** — bot text across notes, synchronized review view with linked scrolling
8. **Note → code generation** (CodeBridge, including pseudocode handling)
9. **On-save reverse mapping** — code edits in Code view map back to notes on save
10. **Import pipeline** — existing repos, markdown files, PDFs, note app exports → notebooks
11. **Post-import onboarding** — guided walkthrough (no drag-and-drop gate)
12. **Granularity tagging** — AI tags notes with granularity_min_level during generation
13. **Time estimation** — arithmetic estimator from allocation-learnings.md, zero LLM tokens
14. **Implementation progress block** — loading state in originating note + AI log in chat panel
15. **Follow mode** — opt-in live edit following during implementation
16. **WebContainers live preview** — iframe integration (Sandpack fallback)
17. **Note history viewer** (primary, always visible)
18. **Code history viewer** (separate, Code view only, hidden by default)
19. **External change detection** — git watcher + re-ingestion pipeline
20. **Drift detection** — reactive (on AI work in related area) + periodic background check
21. **Contradiction detection** — reactive on note edit (debounced)
22. **Local saves** + optional GitHub sync
23. **Delete confirmation** — dependency analysis + plan-with-agent flow
24. **Multi-agent** — agent-in-use notification + second master spawn
25. **Cloud mode API endpoints** — spec implemented and tested even if deployed later
26. **Provider integration** — Claude via mac10 plugin system

---

## What Makes This Different

| Existing Product | Why Plugin 11 is different |
|-----------------|---------------------------|
| **Cursor / Antigravity** | For developers who read code. Plugin 11 is for people who don't. |
| **Notion AI** | AI assists with writing. Plugin 11's AI builds running software from notes. |
| **Google Docs** | Collaboration without software building. Plugin 11 has Docs-level collab + code generation. |
| **Replit / Bolt / v0** | Generate code from prompts; source of truth is code. Plugin 11's source of truth is always notes. |
| **Jupyter** | Code-first notebooks for data science. Plugin 11 is concept-first notebooks for any software. |
| **No-code (Bubble)** | Visual builders with limited flexibility. Plugin 11's AI generates real code, but the user only sees notes. |

The fundamental innovation: **a full IDE view of your project — not a keyhole chatbot — with the simplicity of vibe coding.** You write your thoughts in notebooks, the AI reads along and thinks with you, and working software emerges from your notes. Google Docs-level collaboration means your team writes together, the AI is just another collaborator in the room, and none of it requires understanding a single line of code.
