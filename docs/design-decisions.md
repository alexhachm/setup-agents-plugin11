# User Decisions — April 15, 2026

All decisions made by the user to be integrated into the Plugin 11 architecture spec and simulation.

## Import & Onboarding

1. **Import sources**: Allow importing through note apps, .md files, existing docs like PDFs. Have them be read and understood like a regular prompt — the AI reads the content and generates notebooks/notes from it, same as importing a repo.

2. **Onboarding**: No drag-and-drop mapping editor during onboarding. Instead, a guided walkthrough on new project launch. Editing of notes is allowed after notebook generation, but the mapping step itself isn't an onboarding gate.

3. **"Currently missing" items**: Should be written as suggestions in a task list within the chat panel. Not inline in notes.

## AI Engine Architecture

4. **Cloud-based AI**: The AI engine is hypothetically cloud-based in production. Build the cloud API endpoint version ready for when we move past the current Claude Code version. For now, have a dev-facing version that uses the 10.1 plugin directly.

5. **Two modes**: Dev mode (10.1 plugin, local, for the developer) and Cloud mode (API endpoints, for production). Both should use the same protocol — only the connection target changes.

## Granularity / Complexity Levels

6. **Three granularity levels**: User-settable experience levels that control how much detail is shown. BUT — the agent doesn't write three versions. It writes one version and notes/notebooks are hidden/shown depending on granularity. This is a visibility setting, not a content generation setting.

7. **Implementation**: Some notes/notebooks are hidden at lower granularity levels. The three gates control what the user sees, not what the AI produces.

## Multi-Note Drafts & Chat Panel

8. **Where notifications appear**: When the AI is editing things across notes, the activity should be shown in the AI chat panel on the right (like a normal AI-integrated IDE log).

9. **Inline unconfirmed text**: When the AI is helping ideate, it writes into each affected note as unconfirmed text (bot text).

10. **Review all changes flow**: When user clicks "review all changes," it shows a preview in the text box area. User scrolls through and the note viewer updates position to match. Synchronized scrolling between the review list and the note viewer.

11. **Note references**: Cross-note references should work like Notion — a highlighted link to the note representing that idea. Example: "it calls the [AI Tool] function here" where [AI Tool] links to the note for that concept.

## Time Estimation

12. **Keep it lightweight**: Research simple computation methods. Don't waste tokens on heavy estimation. Use something like simplified Function Point counting or historical-based heuristics from 10.1's allocation-learnings.md. No LLM calls for estimation.

## Implementation Progress UI

13. **AI logging in chatbox**: During implementation, show normal AI logging in the chatbox (like existing AI IDEs). Include a loading icon with custom status feed (ideating, implementing, testing...) in the note where the request was made.

14. **Live editing follow mode**: Once the AI starts writing to files/notes, the user can follow the AI's live edits. This is opt-in — the user can also continue doing other work instead of watching.

## Collaborative Editing & Multi-Agent

15. **Agent-in-use notification**: If two users want to use the agent at the same time, the second user gets a notification that the agent is in use. Options: wait, or spawn a second master complex (costs more credits).

16. **Second master**: The second master corresponds to the same worker pool. It stays open unless explicitly closed (tokens already expended).

## Open Questions / Flagging

17. **"Add as questions for later"**: Can be discussed in the chatbox. Leaves open questions with a special tag.

18. **Flagging system**: Flags should exist both in the chatbox AND as tags throughout notebooks/notes.

## Note Structure

19. **Note splitting**: Use regular note references like Notion — links between notes.

## Sharing & Permissions

20. **Granular sharing**: Per-notebook sharing as well as workspace-level sharing.

21. **AI visibility**: All collaborators see the AI engine's cursor and suggestions like another collaborator.

22. **Jordan scenario**: Jordan (invited collaborator without her own AI) can be invited as suggestion-only — no access to the host's agent credits. If she doesn't have her own account/credits.

23. **Credit sharing**: Users should be allowed to share their account credits with collaborators.

## AI Context & Targeting

24. **Full context**: AI has full context of the note, all collaborators' activity.

25. **AI as equal collaborator**: Suggestions are visible to all, same as a document collaborator.

## Comments & Chat

26. **AI in comment threads**: Yes, AI should be equal to a collaborator in comments.

27. **Chat sharing**: Sharing of an individual's chatbox should be allowed but easily disable/enable-able because it's sometimes private.

## Testing & Debugging

28. **AI testing**: Endgame the cloud server will be like Perplexity Computer. The 10.1 system already has this feature (coordinator can run tests).

## Drift Detection

29. **Drift detection**: Both (c) when AI is working in a related area AND (a) background periodic checks.

## Saves & Version Control

30. **Local saves**: Saves need to be local at the project as well. If/when users are also using GitHub, support that. But many users won't be GitHub competent — don't require it.

31. **Version history separation**: Note changes and code changes should be in DIFFERENT histories. Code history should be in an entirely different viewer. Most vibecoders never want to see code.

## Live Preview

32. **Approach**: Use WebContainers (StackBlitz) for in-browser Node.js preview. Falls back to Sandpack for simpler projects. This runs entirely in the browser with no backend needed. Dev server starts in-browser, live URL via ServiceWorker.

## Multi-Choice Suggestions

33. **Interaction model**: Multiple choice options OR write something of your own — like standard AI chat interfaces.

## Landing Page

34. **Approach**: Use open source templates and repos for AI/SaaS landing page design. All filler — not a priority.

## Language Support

35. **No multi-language for now**. English only.

## Contradiction Detection

36. **Timing**: Should fire when notes are edited, like a regular chatbox response. Not a background scanner — reactive.

## External Changes

37. **External repo updates**: If code is updated outside the workspace (e.g., another developer pushing to the repo), the system should detect it and load the new content — same process as new project import.

## Comments & Discussions

38. **Discussions in chat**: Cross-note discussions happen in the chatbox area.

## Pseudocode

39. **Treat as specification**: When someone writes pseudocode in a note, the AI treats it as a spec for implementation.

## Selective Undo

40. **Delete confirmation**: When a user tries to delete something that has been committed, prompt "are you sure" with editing allowed.

## Dependency Analysis

41. **Planning mode**: When the AI finds dependency issues, the user should be able to plan with the agent about how to handle them.

## Offline

42. **No local agent in production**: Offline editing is handled like external changes — once cloud is back online, sync. Dev mode uses local agent handled exactly like cloud.

## Note Length

43. **AI-prompted splitting**: AI suggests splitting at a reasonable threshold IF a separate domain mapping makes sense. Prompted at the addition of new text, not a standalone scanner.

## AI Knowledge Storage

44. **Corrections in mistakes.md**: AI stores corrections in mistakes.md from the 10.1 knowledge layer. Domain docs and notes are pretty interchangeable in this version.

## Code View Editing

45. **On-save reverse mapping**: Code changes map back to notes on save — same as note edits mapping to code but in reverse.

## Hidden Complexity

46. **Three-gate visibility**: A lot of small code changes will never be seen by the vibecoder. The three granularity levels control which notes/notebooks are visible. Some are always hidden at lower levels.

## Research Results

47. **Time estimation**: Use simplified Function Point counting: count affected notes/concepts, weight by complexity (simple/medium/complex), multiply by historical productivity rate from allocation-learnings.md. Pure arithmetic, zero LLM tokens. Formula: `estimated_minutes = Σ(note_count × complexity_weight × avg_minutes_per_note)` where weights and averages come from historical task data.

48. **Live preview**: WebContainers API (StackBlitz) is the clear winner. Runs full Node.js in the browser via WASM. Boots in milliseconds, npm 5x faster than local, works offline via ServiceWorker, full isolation. Embed as iframe. Falls back to Sandpack for simpler/non-Node projects. No backend needed.
