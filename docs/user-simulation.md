# Plugin 11 — Full User Simulation (v2)

A complete walkthrough of the application from first launch through real project development. Every screen, interaction, AI behavior, and system response is narrated. Gaps and unresolved questions are flagged with `[GAP]` markers and compiled at the end.

---

## Cast

- **Maya** — the primary user. Product manager who's been vibe-coding side projects with ChatGPT and Cursor but can't read code beyond basic HTML. She has an existing React project (a recipe-sharing app called "Potluck") with ~40 files that a developer friend helped start.
- **Jordan** — Maya's designer friend, invited as collaborator later.
- **AI Engine** — the cloud-hosted AI engine, connected to Maya's workspace.

---

## Act 1: First Launch & Onboarding

### Scene 1.1: Landing Page

Maya visits `plugin11.dev`. The site uses a clean open-source SaaS template — this is not a priority page and reads as filler-level polish. She sees the essentials:

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                     [Plugin 11 Logo]                         │
│                                                              │
│          The IDE that thinks with you.                       │
│                                                              │
│    Write your ideas. We'll build the software.               │
│                                                              │
│    [Get Started — Free]    [Watch Demo]                      │
│                                                              │
│    ┌────────────────────────────────────────────┐            │
│    │  [Animated preview: user types in a note,  │            │
│    │   bot text appears inline, suggestion gets │            │
│    │   accepted, live preview updates on right] │            │
│    └────────────────────────────────────────────┘            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

The landing page design is assembled from open-source templates and AI/SaaS landing repos. Marketing copy and pricing tiers are filler — not specified here.

### Scene 1.2: Sign Up

Maya clicks "Get Started." She sees auth options:

```
┌─────────────────────────────┐
│  Create your account        │
│                             │
│  [Continue with Google]     │
│  [Continue with GitHub]     │
│  [Continue with Email]      │
│                             │
│  Already have an account?   │
│  Sign in                    │
└─────────────────────────────┘
```

She clicks "Continue with Google." NextAuth handles the OAuth flow. She's redirected back, now authenticated.

### Scene 1.3: Workspace Creation

First-time users see a workspace setup flow:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Welcome, Maya.                                      │
│                                                      │
│  Let's set up your workspace.                        │
│                                                      │
│  Workspace name: [Potluck App____________]           │
│                                                      │
│  How are you starting?                               │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │  🆕 From scratch  │  │  📂 Import existing repo  │  │
│  │                  │  │                          │  │
│  │  Start with a    │  │  Connect a GitHub repo   │  │
│  │  blank workspace │  │  and we'll map it into   │  │
│  │                  │  │  notebooks for you        │  │
│  └──────────────────┘  └──────────────────────────┘  │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │  📄 Import from files                           │ │
│  │                                                 │ │
│  │  Upload markdown files, PDFs, or Notion exports │ │
│  │  and we'll read them like a prompt — generating │ │
│  │  notebooks and notes from your content.         │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  [Continue]                                          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Maya selects "Import existing repo" and types "Potluck App."

### Scene 1.4: AI Engine — Cloud Connected

No CLI setup required. After selecting her import path, Maya sees:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Connecting to AI Engine                             │
│                                                      │
│  Plugin 11's AI engine is cloud-hosted — no          │
│  installation needed. It connects directly to        │
│  your workspace and your code.                       │
│                                                      │
│  Step 1: Connect your GitHub repo                    │
│  ┌──────────────────────────────────────────────┐    │
│  │  [Connect GitHub]                            │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Step 2: That's it.                                  │
│  The AI engine is cloud-hosted and ready to go.      │
│                                                      │
│  ✓ AI Engine connected                               │
│  ✓ Analyzing your codebase...                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

> **Dev mode note:** During development, the AI engine uses the 10.1 plugin directly (local connection, same protocol — only the connection target changes). In production, it hits cloud API endpoints. Both modes use the same interface.

Maya clicks "Connect GitHub," authorizes the app, and selects the Potluck repo. The web app updates:

```
  ✓ Repo connected: potluck (React, 40 files)
  AI Engine is analyzing your codebase.
  This may take a few minutes for the first scan.

  [Watch it work →]
```

### Scene 1.4b: Importing from Files (Alternative Path)

If Maya had chosen "Import from files" instead, she would see:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Import your content                                 │
│                                                      │
│  Drop files here or browse                           │
│  ┌──────────────────────────────────────────────┐    │
│  │                                              │    │
│  │    📄 Drag markdown files, PDFs, or          │    │
│  │       Notion exports here                   │    │
│  │                                              │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Supported: .md, .pdf, .txt, Notion .zip exports     │
│                                                      │
│  [Browse files]                                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Maya drops a folder of `.md` files documenting her project requirements. The AI reads them like a prompt — extracting structure, understanding intent, and generating notebooks and notes from the content exactly as it would from importing a repo. The result is the same: a populated workspace with AI-generated notebooks.

---

### Scene 1.5: Guided Onboarding Walkthrough

After the connection is established, Maya is not dropped into an empty workspace. Instead, a guided walkthrough begins on new project launch:

```
┌──────────────────────────────────────────────────────────────┐
│  Welcome to Plugin 11                          Step 1 of 5   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                              │
│  Your workspace is being set up.                             │
│                                                              │
│  While the AI analyzes your project, let's walk              │
│  through how Plugin 11 works.                                │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  📓 Notebooks = Areas of your project               │     │
│  │                                                     │     │
│  │  The AI organizes your project into notebooks.      │     │
│  │  Think of them like folders, but smarter —          │     │
│  │  each one represents a domain of your app.          │     │
│  │                                                     │     │
│  │  Example: Authentication, Recipes, Database         │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  [Next →]                                                    │
└──────────────────────────────────────────────────────────────┘
```

The walkthrough continues through 5 steps, each introducing a core concept while the analysis runs in the background:

- **Step 1:** Notebooks and notes overview
- **Step 2:** How to write in notes and what the AI does with your text
- **Step 3:** How to request implementation (and what happens)
- **Step 4:** The AI chat panel and task list
- **Step 5:** The live preview

By the time the walkthrough finishes, the analysis is typically done. The mapping step is not a gate — it happens automatically. Maya can freely edit notes at any time after notebooks are generated.

---

## Act 2: Domain Analysis & Notebook Generation

### Scene 2.1: The Scan

Maya finishes the walkthrough and enters her workspace. The notebook panel on the left is beginning to populate and the AI chat panel on the right shows activity:

```
AI Chat Panel (right):
──────────────────────────────────────────
  AI Engine is analyzing your codebase...

  ✓ Found your project: React app using
    Next.js, Tailwind CSS, and Supabase

  ✓ Identified 6 areas of your project:
    • Authentication
    • Recipes
    • Social
    • User Profiles
    • Database
    • UI Components

  ◐ Building your notebooks...
──────────────────────────────────────────
```

The domain mapping review is not a gate Maya must pass through. The AI proceeds directly to notebook generation using its best understanding of the project structure. Editing notes after generation is always available.

**Granularity default:** The AI generates all content at full detail. What Maya sees depends on her experience level setting, which defaults to "Standard" — showing module-level notes (one per major concept), not file-level. Lower granularity hides more technical notes; higher granularity reveals them. The AI wrote one version of everything; visibility is a display setting, not a generation setting.

### Scene 2.2: Notebooks Populate

Over the next 30–60 seconds, Maya watches the notebook panel populate in real time. As each note is created, she can see the AI cursor writing the initial content.

The AI writes each note in **plain language**, translating code into human-readable descriptions:

```
📝 Login & Signup (Authentication notebook)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

How users get into the app:

• Email + password signup with Supabase Auth
• Email + password login
• "Remember me" checkbox that extends session to 30 days
• Redirects to /recipes after successful login
• Shows error messages for wrong password, email not found, etc.

Status: ✅ Implemented
Connects to: [Session Management] · [User Table] · [Supabase Config]
```

The "Connects to" references are Notion-style inline links — highlighted note names that link directly to the referenced note. Clicking `[Session Management]` opens that note. Hovering shows a preview.

**"Currently missing" items** are not written inline in notes. Instead, the AI adds them as suggestions in the task list within the AI chat panel:

```
AI Chat Panel — Task List:
──────────────────────────────────────────
  Suggestions for Login & Signup:

  ☐ Add social login (Google, GitHub)
  ☐ Add email verification step
  ☐ Add rate limiting on login attempts

  [View all suggestions]
──────────────────────────────────────────
```

Maya can click into any suggestion to discuss it with the AI, dismiss it, or move it to a note.

Maya clicks through several notes, reading the descriptions. The AI has translated her codebase into plain English. She can now understand her entire project without reading a single line of code.

---

## Act 3: Writing with Inline Intelligence

### Scene 3.1: First Edit — Maya Opens a Note

Maya clicks on "Recipe List & Search" in the Recipes notebook. She reads the AI-generated description:

```
📝 Recipe List & Search
━━━━━━━━━━━━━━━━━━━━━━

The main page users see when they open the app.

Shows all recipes in a grid of cards. Each card has:
• Recipe title
• Cover photo
• Author name
• Cook time
• Number of likes

Search: Users can type in the search bar to filter recipes by
title. The search happens live as you type (no submit button).

Filters: Category dropdown (Breakfast, Lunch, Dinner, Dessert,
Snack). Only one category can be selected at a time.

Sorting: None currently. Recipes appear in the order they were
created (newest first).

Status: ✅ Implemented
Connects to: [Recipe Detail Page] · [Recipe Cards] · [Recipe Categories]
```

She wants to add dietary filters. She clicks into the note and starts typing below the Filters section:

### Scene 3.2: Planning — The AI Detects Intent

Maya types:

```
I think we should also let users filter by dietary needs
like vegetarian, vegan, gluten-free
```

As she finishes the sentence, the AI detects **planning intent** ("I think", "should"). The glow ring subtly appears on the editor border. After a brief pause (~1.5 seconds after she stops typing), a response appears in the AI chat panel:

```
AI Chat Panel:
──────────────────────────────────────────
  That would work well. A few things to
  think about:

  1. Your [Recipe Table] doesn't have a
     dietary_tags field yet. Recipes
     would need to be tagged when created.

  2. Should dietary filters combine with
     the category filter? (e.g., "Vegetarian
     Dinners") Or replace it?

  3. Your [Create/Edit Recipe] form would
     need a new multi-select field for
     dietary tags.

  Want me to draft what these changes would
  look like across your notes?

  [Yes, draft it]  [Not yet, I'm still thinking]
──────────────────────────────────────────
```

The AI drew from:
- **Database notebook** → knows Recipe Table schema, no dietary_tags field
- **Recipes notebook** → knows the Create/Edit form, knows categories are single-select
- **Pattern recognition** → multi-value tags are a common pattern, suggests multi-select

Maya clicks "Yes, draft it."

### Scene 3.3: Multi-Note Draft — Bot Text Across Notes

The AI generates a draft that spans multiple notes. The activity is shown in the AI chat panel:

```
AI Chat Panel:
──────────────────────────────────────────
  Drafting changes across 4 notes...

  ◐ Recipe List & Search — dietary filter
  ◐ Recipe Table — dietary_tags field
  ◐ Create/Edit Recipe — tag selector
  ◐ Recipe Cards — dietary badges

  Done. Unconfirmed text added to each note.
  [Review all changes]  [Accept all]  [Dismiss all]
──────────────────────────────────────────
```

In the current note (Recipe List & Search), Maya sees the AI's unconfirmed text has appeared inline — rendered as "bot text" in a distinct visual style (slightly muted, with a subtle AI indicator):

```
[... existing note content ...]

  ╔═ AI draft (unconfirmed) ═══════════════════════════╗
  ║                                                    ║
  ║  Dietary Filter (multi-select, combines with       ║
  ║  category):                                        ║
  ║  • Vegetarian                                      ║
  ║  • Vegan                                           ║
  ║  • Gluten-Free                                     ║
  ║  • Dairy-Free                                      ║
  ║  • Nut-Free                                        ║
  ║                                                    ║
  ║  Shows as a row of toggle chips below the category ║
  ║  dropdown. Multiple can be active at once.         ║
  ║  Filtering is AND logic: selecting "Vegetarian"    ║
  ║  + "Gluten-Free" shows only recipes tagged with    ║
  ║  both.                                             ║
  ║                                                    ║
  ║  [Accept]  [Edit]  [Dismiss]                       ║
  ╚════════════════════════════════════════════════════╝
```

The other three affected notes also have unconfirmed bot text added to them. Badge indicators (small dots) appear on those notes in the sidebar.

Maya clicks "Review all changes." The editor shows a synchronized scroll view:

```
┌──────────────────────────────────────────────────────────────┐
│  Review AI Changes (4 notes affected)                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                              │
│  [Change list — left panel]  |  [Note viewer — right panel]  │
│                                                              │
│  📝 Recipe List & Search ← ─ ─│─ ─ ─  Note scrolls to      │
│  ┌─ AI draft ──────────────┐  │        match position       │
│  │  Dietary Filter         │  │                             │
│  │  [Accept] [Edit] [Dis.] │  │  📝 Recipe List & Search    │
│  └─────────────────────────┘  │  ━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                               │  [full note content with    │
│  📝 Recipe Table              │   draft highlighted]        │
│  ┌─ AI draft ──────────────┐  │                             │
│  │  + dietary_tags: text[] │  │                             │
│  │  [Accept] [Edit] [Dis.] │  │                             │
│  └─────────────────────────┘  │                             │
│                               │                             │
│  📝 Create/Edit Recipe        │                             │
│  ┌─ AI draft ──────────────┐  │                             │
│  │  + Dietary Tags         │  │                             │
│  │    multi-select chips   │  │                             │
│  │  [Accept] [Edit] [Dis.] │  │                             │
│  └─────────────────────────┘  │                             │
│                               │                             │
│  📝 Recipe Cards              │                             │
│  ┌─ AI draft ──────────────┐  │                             │
│  │  + dietary badges       │  │                             │
│  │  [Accept] [Edit] [Dis.] │  │                             │
│  └─────────────────────────┘  │                             │
│                               │                             │
│  [Accept All]  [Dismiss All]                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

As Maya scrolls through the change list on the left, the note viewer on the right scrolls in sync to show that portion of the actual note. She can see her notes in full context while reviewing each draft.

Maya likes most of it but wants to edit the card badges. She clicks "Edit" on Recipe Cards and types her own version. Then clicks "Accept All" for the rest.

All four notes update. The bot text fades into normal text. The notes now reflect the dietary filter feature as a planned addition, with inline Notion-style links connecting related concepts across notebooks.

### Scene 3.4: Specifying — AI Validates

Maya continues writing in the Recipe List note, now adding more specific requirements. She types:

```
The dietary filter should query the user's preferences from
their profile and pre-select their dietary needs
```

The AI detects **specifying intent** and validates against existing notes. The response appears in the chat panel:

```
AI Chat Panel:
──────────────────────────────────────────
  ⚠️ Your [Settings] note doesn't include
  dietary preferences yet. Users have no
  place to set these.

  To make this work, you'd need:
  1. A "Dietary Preferences" section in [Settings]
  2. A dietary_preferences field in [User Table]

  Want me to add those?

  [Yes, add them]  [I'll handle it later]
──────────────────────────────────────────
```

This is the knowledge loop in action. Maya wrote a requirement that depends on something that doesn't exist yet. The AI caught it immediately because it knows the full state of every notebook.

### Scene 3.5: Requesting — Implementation

Maya's notes are now detailed enough that she wants to see results. She types at the bottom of the Recipe List note:

```
Ok let's implement the dietary filter feature
```

The AI detects **requesting intent** ("let's implement"). The chat panel responds:

```
AI Chat Panel:
──────────────────────────────────────────
  Here's what I'll implement:

  1. Add dietary_tags column to recipes table
     (Supabase migration)
  2. Add dietary_preferences to users table
  3. Add multi-select chips to Create/Edit Recipe form
  4. Add dietary filter bar to Recipe List page
  5. Pre-select from user preferences on page load
  6. Add dietary badges to Recipe Cards
  7. Update Settings page with dietary preferences

  Estimated: ~15 minutes
  (Based on 7 notes affected: 4 simple, 2 medium,
   1 complex × historical avg from past tasks)

  [Start implementing]  [Edit plan]  [Not yet]
──────────────────────────────────────────
```

**Time estimation** is pure arithmetic — no LLM tokens spent. The AI counts affected notes, weights each by complexity (simple/medium/complex), and multiplies by historical productivity rates from `allocation-learnings.md`. Formula: `estimated_minutes = Σ(note_count × complexity_weight × avg_minutes_per_note)`. The breakdown is shown briefly in parentheses.

Maya clicks "Start implementing."

### Scene 3.6: Implementation Progress

The AI begins working. The chat panel shows standard AI logging — the same pattern as existing AI IDEs:

```
AI Chat Panel:
──────────────────────────────────────────
  ● Ideating — planning code structure
  ● Implementing — dietary_tags migration
  ● Implementing — updating recipe form
  ● Testing — running migration check
  ● Implementing — filter bar on recipe list
  ...
──────────────────────────────────────────
```

Meanwhile, in the note where Maya made the request (Recipe List & Search), a loading indicator appears at the bottom with a custom status feed:

```
[... note content ...]

  ◐ AI implementing dietary filter feature...
     Currently: Updating recipe form components
```

Maya can opt in to follow the AI's live edits — she'll see the AI cursor moving through files in real time. Or she can continue doing other work. This is opt-in.

The note statuses update as steps complete:
- 📝 Recipe Table: 💡 idea → 🔨 in progress → ✅ implemented
- 📝 Create/Edit Recipe: 🔨 in progress...

### Scene 3.7: Implementation Complete

After ~10 minutes, all notes show ✅. The AI writes a summary in the chat panel:

```
AI Chat Panel:
──────────────────────────────────────────
  ✅ Dietary filter feature implemented.

  What changed:
  • Database: Added dietary_tags to recipes,
    dietary_preferences to users
  • Recipe form: New multi-select tag chips
  • Recipe list: Filter bar with AND logic
  • Recipe cards: Dietary badges (max 3 shown)
  • Settings: Dietary preferences section
  • Pre-selection: Works on page load

  Want to see a preview?

  [Open Preview]  [View Code Changes]  [Looks good]
──────────────────────────────────────────
```

Maya clicks "Open Preview." A panel opens showing her app running in a WebContainers environment — full Node.js in the browser via WASM (StackBlitz WebContainers API). The dev server boots in milliseconds in an iframe. No backend needed, no localhost — it runs entirely in the browser with offline capability via ServiceWorker. The dietary filter is visible on the recipe list page.

---

## Act 4: Planning a New Feature End-to-End

### Scene 4.1: Starting from Scratch — A New Note

Maya wants to add a "Meal Planning" feature. She goes to the notebook panel and creates a new notebook:

Right-click → "New Notebook" → types "Meal Planning" → presses Enter.

An empty notebook appears. She creates a new note inside it: "Weekly Meal Plan"

She starts writing with no particular structure — just thinking:

```
Users should be able to plan their meals for the week.
Like a calendar view where each day has slots for
breakfast lunch and dinner. They can drag recipes from
their saved recipes into the slots.

Should also generate a shopping list from the planned
meals. Add up all the ingredients and combine duplicates.
```

### Scene 4.2: AI Planning Loop Activates

As Maya writes, the AI detects **planning intent** throughout (tentative language, new notebook, feature-level scope). It begins offering suggestions in the chat panel after she pauses:

After "drag recipes from their saved recipes into the slots":

```
AI Chat Panel:
──────────────────────────────────────────
  For drag-and-drop to work, users need a
  "saved recipes" collection. Your [Likes & Saves]
  note says users can save recipes, but there's no
  dedicated "My Saved Recipes" view right now.

  Should meal planning pull from:
  a) Saved/liked recipes only
  b) Any recipe (with search)
  c) Both — saved recipes shown first, with search
     to find others

  [a]  [b]  [c — recommended]
──────────────────────────────────────────
```

Maya clicks [c]. The AI ferments the choice into the note:

```
Users should be able to plan their meals for the week.
Like a calendar view where each day has slots for
breakfast lunch and dinner. They can drag recipes from
their saved recipes into the slots, or search for any
recipe. Saved recipes appear first for quick access.
```

After "combine duplicates" in the shopping list section:

```
AI Chat Panel:
──────────────────────────────────────────
  For the shopping list, some things to decide:

  • Unit conversion — if one recipe says "2 cups
    flour" and another says "250g flour," should
    they combine? (This is hard to get right.)

  • Categorization — group by aisle? (Produce, Dairy,
    Meat, Pantry, etc.)

  • Export — let users copy the list, share it, or
    send to a grocery delivery app?

  [Add these as questions for later]
  [Let me think about them now]
──────────────────────────────────────────
```

Maya clicks "Add these as questions for later." The chat panel adds them to the chatbox with a special `[OPEN QUESTION]` tag:

```
AI Chat Panel — Flagged Items:
──────────────────────────────────────────
  [OPEN QUESTION] Shopping list: unit conversion
  strategy — combine across recipes or leave separate?

  [OPEN QUESTION] Shopping list: group by aisle?

  [OPEN QUESTION] Shopping list: export/share options?

  These are also tagged in the Meal Planning notebook.
──────────────────────────────────────────
```

The open questions live in the chatbox with `[OPEN QUESTION]` tags and also appear as tags throughout the relevant notes/notebooks. They're visible in a flagged items view and can be revisited when Maya is ready to decide.

### Scene 4.3: AI Suggests Note Structure

After Maya has written a couple of paragraphs, the AI suggests splitting the note. This is triggered by the new text making the split reasonable — not a standalone scanner, but a reactive suggestion at the point of addition:

```
AI Chat Panel:
──────────────────────────────────────────
  This note now covers three distinct things:
  1. The calendar/planner UI
  2. The recipe-to-slot drag-and-drop
  3. The shopping list generator

  Want me to split it into 3 separate notes?
  You'll be able to track and implement each
  one independently.

  [Split into 3 notes]  [Keep as one note]
──────────────────────────────────────────
```

Maya clicks "Split into 3 notes." The Meal Planning notebook now has:
- 📝 Weekly Calendar View
- 📝 Recipe Slot System
- 📝 Shopping List Generator

Each with the relevant content from her original note. The notes reference each other using Notion-style inline links — `[Weekly Calendar View]`, `[Recipe Slot System]`, `[Shopping List Generator]` — wherever one concept refers to another. The links are clickable, highlighted, and show a hover preview.

### Scene 4.4: Cross-Notebook Connections

As Maya writes more in the Shopping List Generator note, the AI notices connections to existing notebooks and raises them in the chat panel:

```
AI Chat Panel:
──────────────────────────────────────────
  Your shopping list will need ingredient data
  from recipes. Your [Recipe Table] currently
  stores ingredients as a plain text field, not
  structured data.

  For combining duplicates and unit conversion,
  ingredients need to be structured:
  name, quantity, unit.

  This would require updating:
  📝 [Recipe Table] — new ingredients schema
  📝 [Create/Edit Recipe] — new ingredient input

  This is a bigger change than it seems.
  Want to plan this out with me?

  [Yes, let's plan it]  [Flag it for later]
──────────────────────────────────────────
```

Maya clicks "Yes, let's plan it." This opens a planning conversation with the agent in the chat panel — the AI walks through the scope, estimates effort, identifies risks, and helps Maya decide whether to tackle this now or defer it. Cross-notebook dependency analysis leads directly to agent-assisted planning.

---

## Act 5: Collaboration — Inviting Jordan

### Scene 5.1: Sharing the Workspace

Maya wants her designer friend Jordan to help with the Meal Planning UI. She clicks "Share" in the top bar:

```
┌──────────────────────────────────────────────────────┐
│  Share workspace                                     │
│                                                      │
│  ── Share entire workspace ──                        │
│                                                      │
│  Invite people                                       │
│  ┌──────────────────────────────────────────────┐    │
│  │  jordan@email.com                            │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Permission: [Editor ▾]                              │
│                                                      │
│  AI Access:                                          │
│  ○ Suggestion-only (no agent credits used)           │
│  ○ Full agent (uses Jordan's own credits)            │
│  ○ Share my credits with Jordan                      │
│                                                      │
│  [Send Invite]                                       │
│                                                      │
│  ── Or share a specific notebook ──                  │
│                                                      │
│  Select notebook: [Meal Planning ▾]                  │
│  Share link: 🔗 https://plugin11.dev/w/abc123/nb/4   │
│                                                      │
│  ── Current members ──                               │
│                                                      │
│  👤 Maya (you) — Owner                               │
│  🤖 AI Engine — Cloud AI                             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Per-notebook sharing is available — Maya can share just the Meal Planning notebook without exposing the full workspace. She chooses to invite Jordan to the whole workspace.

For AI access, Maya selects "Suggestion-only" — Jordan can see and interact with the AI's suggestions but Maya's agent credits aren't spent on Jordan's requests. Jordan's options:
- **Suggestion-only:** No agent credits needed. She sees AI suggestions that Maya triggers.
- **Full agent (her credits):** Jordan can use the AI independently using her own Plugin 11 account credits.
- **Credit sharing:** Maya can share her credits with Jordan explicitly.

Jordan gets an email invite, clicks the link, creates an account, and joins the workspace.

### Scene 5.2: Simultaneous Editing

Jordan opens the "Weekly Calendar View" note. Maya already has it open. Jordan sees:

```
┌──────────────────────────────────────────────────────────────┐
│  📝 Weekly Calendar View                           👤M 👤J   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                              │
│  A week-view calendar where each day has three meal slots:   │
│  breakfast, lunch, and dinner.|← Maya's cursor (blue)        │
│                                                              │
│  Each slot shows:                                            │
│  • Recipe name and thumbnail                                 │
│  • Cook time                                                 │
│  • Serving size                                              │
│                                                              │
│  Users can drag recipes from their saved                     │
│  collection into|← Jordan's cursor (green) any slot.         │
│  Saved recipes appear first for quick access.                │
│                                                              │
│  [AI Engine cursor (purple) — idle]                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Maya and Jordan type simultaneously. Their cursors are visible to each other, colored and labeled. The AI Engine cursor is also visible — it appears as an equal collaborator, like any other user. When the AI is actively writing or suggesting, its purple cursor moves through the note just as a human collaborator's would.

All collaborators see the AI engine's cursor and suggestions. Bot text (unconfirmed AI drafts) is visible to everyone in the note. Either Maya or Jordan can accept a suggestion — it ferments for everyone. Dismissing hides it only for the dismissing user; the other user still sees it.

Jordan starts typing at the bottom:

```
Design notes:
The calendar should use a horizontal scroll for the week,
not a vertical table. Mobile users swipe left/right to
navigate days. Each day is a full-width card on mobile.
```

The AI picks up on Jordan's design language and a suggestion appears in the chat panel — visible to both Maya and Jordan since the AI is an equal collaborator:

```
AI Chat Panel (visible to all collaborators):
──────────────────────────────────────────
  Your [Layout & Navigation] note says the app
  uses Tailwind's responsive breakpoints.
  For this horizontal scroll:
  • Desktop: all 7 days visible in a row
  • Tablet: 3 days visible, scroll for rest
  • Mobile: 1 day at a time, swipe navigation

  [Accept]  [Dismiss]
──────────────────────────────────────────
```

The AI has full context: the full note content, all collaborators' recent activity, and the full notebook history.

### Scene 5.3: Agent-in-Use Notification

Maya triggers an implementation request. While the AI is working, Jordan also types a request in her chat panel:

```
Jordan's chat panel:
──────────────────────────────────────────
  [Notification]

  The AI engine is currently working on a
  task for Maya (dietary filter implementation,
  ~8 min remaining).

  Options:
  ○ Wait for current task to finish
  ○ Spawn a second AI instance
    (uses additional credits — stays open
     until you close it)

  [Wait]  [Spawn second instance]
──────────────────────────────────────────
```

If Jordan spawns a second instance, it corresponds to the same worker pool but runs as an independent master. It stays open — tokens already expended — unless explicitly closed.

### Scene 5.4: Comments

Maya wants to ask Jordan about a design choice. She selects "horizontal scroll" in Jordan's text and clicks the comment icon:

```
  ┌─ Comment ──────────────────────────────────────┐
  │  Maya: Wouldn't horizontal scroll feel weird   │
  │  on desktop? Most meal planners I've used are  │
  │  vertical calendars.                           │
  │                                                │
  │  [Post]                                        │
  └────────────────────────────────────────────────┘
```

Jordan sees the comment indicator (yellow highlight on "horizontal scroll") and replies. The AI participates in the comment thread as an equal collaborator:

```
  ┌─ Comment thread ───────────────────────────────┐
  │  Maya: Wouldn't horizontal scroll feel weird   │
  │  on desktop? Most meal planners I've used are  │
  │  vertical calendars.                           │
  │                                                │
  │  Jordan: On desktop it won't scroll — all 7    │
  │  days are visible in a row. The horizontal     │
  │  scroll is only for tablet where 3 days show.  │
  │                                                │
  │  AI Engine: That matches the breakpoint spec   │
  │  in [Layout & Navigation]. Desktop will show   │
  │  all 7 days at xl breakpoint (≥1280px).        │
  │  Feasible with your current Tailwind setup.    │
  │                                                │
  │  [Reply]  [Resolve]                            │
  └────────────────────────────────────────────────┘
```

Maya clicks "Resolve." The comment collapses.

### Scene 5.5: Chat Sharing

Maya's chat panel is private by default. Her AI conversations aren't visible to Jordan unless she enables sharing:

```
Chat panel header:
──────────────────────────────────────────
  AI Chat                    [🔒 Private ▾]
  ──────────────────────────
  Toggle to share with collaborators
──────────────────────────────────────────
```

Toggling to "Shared" makes her chat history visible to Jordan. This is per-user and reversible at any time. Most users keep their chat private; sharing is opt-in.

---

## Act 6: Debugging & Fixing

### Scene 6.1: Something Breaks

A week later. Maya is using her app and notices that the dietary filter isn't working — selecting "Vegetarian" shows all recipes, not just vegetarian ones. She opens Plugin 11 and navigates to "Recipe List & Search."

She types at the bottom of the note:

```
The dietary filter is broken. When I select Vegetarian
it still shows all recipes instead of filtering.
```

### Scene 6.2: Diagnostic Loop

The AI detects **fixing intent** ("broken", "doesn't work"). It enters diagnostic mode:

```
AI Chat Panel:
──────────────────────────────────────────
  Investigating...

  ◐ Checking dietary filter code and notes

  Found the issue: The filter query is checking
  dietary_tags = 'vegetarian' but the field stores
  an array. It should use CONTAINS, not EQUALS.

  Plain language: The filter is looking for recipes
  where dietary tags IS "vegetarian" instead of
  recipes where dietary tags INCLUDES "vegetarian."
  A recipe tagged ["vegetarian", "gluten-free"]
  doesn't exactly equal "vegetarian," so it
  doesn't match.

  [Fix it]  [Show me the code]  [I need more details]
──────────────────────────────────────────
```

The AI traced through:
1. The note describing the feature
2. The database schema (array field)
3. The actual code (wrong query operator)

And explained it in language Maya understands.

Maya clicks "Fix it." The AI implements the fix and runs tests using the 10.1 coordinator system — the same coordinator that, in the cloud endgame, works like Perplexity Computer (full browser automation for testing). The AI logs activity in the chat panel with a loading indicator in the originating note:

```
AI Chat Panel:
──────────────────────────────────────────
  ● Fixing — updating filter query operator
  ● Testing — running filter validation
  ✓ Test passed: "Vegetarian" filter returns
    only vegetarian-tagged recipes

  ✅ Fixed. The filter now correctly checks if
  the dietary_tags array contains the selected
  value.

  [Open Preview]  [Looks good]
──────────────────────────────────────────
```

In the Recipe List & Search note, the loading indicator resolves to a completion stamp.

### Scene 6.3: Drift Detection — Contradiction Surfaced

While fixing the filter, the AI is working in a related area — Recipe Cards. Drift detection fires because the AI encounters a related area during active work AND background periodic checks are running. It surfaces the discrepancy in the chat panel:

```
AI Chat Panel:
──────────────────────────────────────────
  ⚠️ Note-code mismatch detected while working
  in related area:

  Your [Recipe Cards] note says dietary badges
  should show "at most 3 with +2 more overflow"
  but the implementation currently shows all
  badges without a limit.

  Notes and code are out of sync.

  [Fix the code to match the note]
  [Update the note to match the code]
  [Ignore for now]
──────────────────────────────────────────
```

Drift detection fires on two triggers: (a) when the AI is working in a related area (as here), and (b) as a background periodic check. The user sees this as a normal chat panel notification, not a modal interrupt.

Additionally, when Maya edits a note, contradiction detection fires reactively — like a regular chatbox response — checking for inconsistencies with other notes in the same context. No background scanner for this; it's edit-triggered.

---

## Act 7: Edge Cases & Novel Scenarios

### Scene 7.1: Writing Ambiguously

Maya types in a note:

```
maybe we could do something with notifications
```

This is extremely vague. The AI chooses a light-touch response with multiple-choice options:

```
AI Chat Panel:
──────────────────────────────────────────
  What kind of notifications are you thinking about?

  ○ When someone comments on your recipe
  ○ When a recipe you saved gets updated
  ○ Meal plan reminders ("Time to start cooking!")
  ○ New recipes from people you follow
  ✏️ Write your own

  [Pick any that apply]
──────────────────────────────────────────
```

The interaction is multiple-choice or "write your own" — like standard AI chat interfaces. Maya can select one or more chips, which ferment into the note as concrete requirements, or type a custom response in the chat input. This is the standard model for all multi-choice suggestions.

### Scene 7.2: Conflicting Notes

Maya writes in one note: "The app should require login to view any recipes."
Jordan writes in another note: "Recipes should be publicly viewable without login."

Contradiction detection fires when Jordan edits her note — it's reactive to the edit, not a background scan:

```
AI Chat Panel (visible to both collaborators):
──────────────────────────────────────────
  ⚠️ Conflicting requirements detected:

  📝 [Login & Signup]: "require login to view
  any recipes"

  📝 [Recipe List & Search]: "recipes should be
  publicly viewable without login"

  These can't both be true. Which should win?

  [Require login for everything]
  [Public recipes, login for social features]
  [Discuss this in chat]
──────────────────────────────────────────
```

"Discuss this in chat" opens a cross-note discussion thread in the chatbox — not tied to either individual note. Both Maya and Jordan can participate, and the AI participates as an equal collaborator. Once resolved, the decision is tagged and linked from both notes.

### Scene 7.3: User Writes Pseudocode in a Note

Maya's developer friend visits and writes pseudocode in a note:

```
function calculateShoppingList(mealPlan) {
  // get all recipes in the plan
  // extract ingredients
  // group by ingredient name
  // sum quantities with unit conversion
}
```

The AI treats this as a specification — the AI understands that pseudocode in a note is a spec for what the code should do:

```
AI Chat Panel:
──────────────────────────────────────────
  I see you've written a pseudocode spec for
  the shopping list calculator.

  Want me to implement this function based on
  your pseudocode? I'll use the ingredient
  structure from [Recipe Table].

  [Implement it]  [Not yet — it's just a sketch]
──────────────────────────────────────────
```

### Scene 7.4: Undoing an AI Implementation

Maya realizes the dietary filter feature was premature — she wants to remove it and do it differently later. She types in the chat panel:

```
Undo the dietary filter feature. Remove all
the code changes but keep the notes so I can
rethink the approach.
```

```
AI Chat Panel:
──────────────────────────────────────────
  I'll revert the code for the dietary filter.
  Your notes will remain but I'll change their
  status from ✅ Implemented back to 📋 Planned.

  This will undo changes in:
  • Recipe list page (filter bar removed)
  • Recipe form (dietary tag selector removed)
  • Recipe cards (dietary badges removed)
  • Database migration (dietary_tags column dropped)
  • Settings page (dietary preferences removed)
  • User table (dietary_preferences column dropped)

  Are you sure? This cannot be undone automatically.

  [Revert code, keep notes]  [Revert everything]
  [Cancel]
──────────────────────────────────────────
```

Maya clicks "Revert code, keep notes." The AI performs the revert and updates note statuses accordingly. The "are you sure" confirmation is always shown for committed changes — with the full scope listed — so Maya understands exactly what will be removed before proceeding.

### Scene 7.5: Dependency Analysis Leads to Planning

After the undo, the AI surfaces a dependency issue:

```
AI Chat Panel:
──────────────────────────────────────────
  ⚠️ Dependency alert:

  The [Shopping List Generator] note references
  dietary tags — if you plan to re-implement
  dietary filters later, this will need
  coordinating.

  Want to plan this with me?

  [Plan with agent]  [Flag for later]
──────────────────────────────────────────
```

"Plan with agent" opens a full planning conversation in the chat. The AI walks through the dependency, the risks, and helps Maya decide on sequencing.

### Scene 7.6: Version History

Maya opens Version History (right panel toggle):

```
┌──────────────────────────────────────────────────────────────┐
│  Version History                         [Notes ▾] [Code ▾] │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                              │
│  Showing: Note History                                       │
│                                                              │
│  Today                                                       │
│  ● 4:15 PM — Reverted dietary filter notes to Planned       │
│    AI Engine • 6 notes updated                              │
│                                                              │
│  ● 3:45 PM — Jordan added design notes                      │
│    Jordan • Weekly Calendar View                            │
│                                                              │
│  ● 2:15 PM — Added dietary filter spec                      │
│    Maya • Recipe List & Search + 3 notes                    │
│                                                              │
│  ● 1:00 PM — Split Weekly Meal Plan into 3 notes            │
│    AI Engine (Maya requested) • Meal Planning               │
│                                                              │
│  Apr 8                                                       │
│  ● 11:30 AM — Initial notebook generation                   │
│    AI Engine • 6 notebooks, 22 notes                        │
│                                                              │
│  [Restore to any point]                                      │
└──────────────────────────────────────────────────────────────┘
```

Note history and code history are separated. The toggle at the top switches between:
- **Note History** — changes to notebooks and notes (shown above). This is what vibecoders see by default.
- **Code History** — a separate viewer showing code-level changes, diffs, and file modifications. Most vibecoders never need to open this.

Both histories are always maintained; they just live in different viewers.

### Scene 7.7: Offline Editing

Maya is on a plane with no internet. She opens the web app. Because Yjs supports offline editing, she can still:

- Read all her notes (cached locally via Service Worker + IndexedDB)
- Edit notes (changes stored in Yjs local state)
- See her own cursor but no one else's (awareness requires connection)

The AI engine is NOT available offline in production. There is no local agent in production — offline editing is handled the same way as external changes: once the cloud connection returns, edits sync automatically.

An "Offline" indicator is shown in the status bar. Notes edited offline are marked with a pending sync badge.

> **Dev mode note:** Dev mode uses the local 10.1 agent, which is handled exactly like the cloud agent — same protocol, same behavior. Offline dev mode behaves identically to offline production.

When Maya lands and reconnects, her offline edits sync automatically with Jordan's changes. Any conflicts are resolved by the CRDT algorithm.

### Scene 7.8: A Note Grows Too Long

After weeks of use, Maya's "Recipe List & Search" note has grown with accumulated suggestions, annotations, and feature additions. When she adds a new section on pagination, the AI detects that the split now makes sense — it fires at the point of the new addition, not from a background scanner:

```
AI Chat Panel:
──────────────────────────────────────────
  This note now covers several distinct areas
  (grid layout, search, category filters, dietary
  filters, sorting, pagination/infinite scroll,
  performance). The new pagination section makes
  this a good time to split.

  Want me to break it into focused notes?

  [Split it up]  [Keep it as one note]
──────────────────────────────────────────
```

The suggestion fires because the newly added text pushed the note into a range where a domain split makes sense. The AI doesn't run a standalone scanner for note length — it reacts when new content is added and the split would be reasonable.

### Scene 7.9: The AI Makes a Mistake

The AI suggests something wrong:

```
Maya writes: "The recipe search should support fuzzy matching"

AI Chat Panel:
──────────────────────────────────────────
  Your [Supabase Config] note says you're using
  Supabase, which uses PostgreSQL full-text search.
  Fuzzy matching would require switching to a
  dedicated search service like Algolia or
  Meilisearch.

  [Keep correction]  [Revert to my text]  [Clarify]
──────────────────────────────────────────
```

But this is wrong — PostgreSQL DOES support fuzzy matching via the `pg_trgm` extension. Maya clicks "Clarify":

```
Maya: PostgreSQL has fuzzy matching with pg_trgm.
We don't need a separate search service.
```

The AI acknowledges and updates its knowledge:

```
AI Chat Panel:
──────────────────────────────────────────
  You're right — PostgreSQL's pg_trgm extension
  supports fuzzy matching natively. I've stored
  this correction.

  Keeping your original text.
──────────────────────────────────────────
```

The AI stores the correction in `mistakes.md` from the 10.1 knowledge layer. Domain docs and notes are interchangeable in this version — the correction is written there so the same mistake is never made again. This is Master-2's curation cycle.

### Scene 7.10: Switching to Code View

Maya's developer friend visits and wants to see what the AI actually generated. He toggles to Code View:

```
┌──────────────────────────────────────────────────────────────┐
│  [Notes ○] [Code ●] [Split ○]                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Standard Monaco editor showing the project's file tree      │
│  on the left and the source code on the right.               │
│                                                              │
│  The file tree is annotated with which notebook/note each    │
│  file belongs to:                                            │
│                                                              │
│  📂 src                                                      │
│  ├── 📂 pages                                                │
│  │   ├── 📂 recipes                                          │
│  │   │   ├── index.js      📝 Recipe List & Search          │
│  │   │   ├── [id].js       📝 Recipe Detail Page            │
│  │   │   └── new.js        📝 Create/Edit Recipe            │
│  │   ├── 📂 auth                                             │
│  │   │   ├── login.js      📝 Login & Signup                │
│  │   │   └── reset.js      📝 Password Reset                │
│  │   └── settings.js       📝 Settings                      │
│  ├── 📂 components                                           │
│  │   ├── RecipeCard.jsx    📝 Recipe Cards                  │
│  │   └── ...                                                 │
│  └── 📂 lib                                                  │
│      ├── supabase.js       📝 Supabase Config               │
│      └── auth.js           📝 Session Management            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

The developer makes a direct code edit in Monaco. On save, the CodeBridge triggers a reverse mapping — the AI reads the diff, translates it to plain language, and updates the corresponding note. The same flow as note → code, but in reverse. This happens on save, not on every keystroke.

### Scene 7.11: Hidden Complexity and the Three-Gate Visibility System

Maya is on Standard granularity. Some notebooks are visible; others are hidden. She doesn't see:
- Internal middleware notes
- Build configuration notes
- Low-level database connection notes

These are hidden at Standard level. They exist — the AI wrote them — but the three-gate visibility system controls what Maya sees:

- **Simple** — only the most user-facing features and their direct descriptions
- **Standard** (default) — module-level notes, feature descriptions, one-step-removed dependencies
- **Full** — everything the AI wrote, including implementation details, config files, edge-case notes

A small toggle in the sidebar lets Maya change her level. Most vibecoders never touch Full. Developers working in Code View may prefer Full. The AI always writes everything; this is purely a display filter.

---

## Summary of Gaps

### Remaining Unresolved (truly open)

1. **Pricing tiers** — free tier limits vs. pro tier are not defined. This is a business decision, not an architecture question. All filler for now.

2. **Bot text conflict resolution in collaboration** — if Maya dismisses a suggestion, it hides for her but not Jordan. If Jordan accepts it, does it ferment for both? The exact resolution semantics when two users have different accept/dismiss states on the same bot text need to be specified in the TipTap extension design.

3. **Code-to-note translation quality** — when a developer edits code and the AI writes a plain-language description of the change, the quality of that translation is empirically unknown. "Added error handling for database connection failures" vs. "Added try-catch at line 42" — getting this right requires testing real cases. This is an open implementation risk, not a design gap.

### Resolved (previously flagged as [GAP])

All other gaps from v1 have been resolved:

- **Onboarding friction (CLI setup)** → Cloud-hosted AI engine, no CLI needed. Dev mode uses 10.1 plugin with same protocol.
- **API key management** → Not needed; cloud-hosted engine with Plugin 11 account credentials.
- **Import from Notion/markdown** → Scene 1.4b added; AI reads files like a prompt, generates notebooks.
- **Guided walkthrough vs. drag-and-drop gate** → Guided 5-step walkthrough on project launch; mapping is automatic.
- **"Currently missing" items** → Moved to task list in AI chat panel, not inline.
- **Note references / concept links** → Notion-style inline highlighted links throughout.
- **Granularity default** → Standard (module-level); three-gate visibility is display-only, not generation.
- **Multi-note draft activity** → Shown in AI chat panel; unconfirmed text in each affected note; "review all changes" = synchronized scroll view.
- **Multi-note review UI** → Synchronized scroll view (change list left, note viewer right).
- **Time estimation** → Pure arithmetic from historical data in allocation-learnings.md; formula shown briefly.
- **Progress feed during implementation** → AI logging in chatbox + loading indicator with status feed in originating note.
- **Live preview engine** → WebContainers (StackBlitz) — full Node.js in browser via WASM, iframe embed, offline-capable via ServiceWorker.
- **"Add as questions for later"** → Goes to chatbox with `[OPEN QUESTION]` tags; also tagged in notebooks.
- **Note splitting cross-references** → Notion-style note reference links between split notes.
- **Cross-notebook connections → planning** → AI raises in chat panel, "Plan with agent" opens planning conversation.
- **Per-notebook sharing** → Available in share dialog.
- **AI visibility for collaborators** → AI is equal collaborator; cursor and suggestions visible to all.
- **Jordan scenario (AI access)** → Suggestion-only (no host credits), own credits, or credit sharing.
- **Agent-in-use notification** → Notification when second user wants agent; can wait or spawn second master.
- **AI context for collaborators** → Full context of note and all collaborator activity.
- **AI in comment threads** → Participates as equal collaborator.
- **Chat sharing** → Toggle in chat panel header; private by default.
- **Testing/debugging AI** → 10.1 coordinator system; cloud endgame is Perplexity Computer-style.
- **Drift detection timing** → Both (a) background periodic checks and (c) when AI works in related area.
- **Note-code contradiction detection** → Fires on note edit, reactive not background scanner.
- **External changes** → Detected and re-ingested same as new project import.
- **Discussions in chat** → Cross-note discussions in chatbox.
- **Pseudocode treatment** → AI treats as spec for implementation.
- **Delete confirmation** → "Are you sure" with full scope listed; editing allowed before confirming.
- **Dependency analysis for undo** → Leads to planning with agent in chat.
- **Version history separation** → Note history and code history in separate viewers; vibecoders default to note history.
- **Offline behavior** → No local agent in production; edits sync when cloud returns; dev mode same as cloud.
- **Note length management** → AI suggests splitting reactively when new text makes split reasonable; not standalone scanner.
- **AI corrections storage** → Stored in mistakes.md from 10.1 knowledge layer.
- **Code view editing** → On-save reverse mapping via CodeBridge.
- **Hidden complexity** → Three-gate visibility system controls note/notebook visibility by granularity level.
- **Multi-choice suggestion interaction** → Multiple choice chips + "write your own" text input.
- **Multi-language support** → Removed; English only for now.
