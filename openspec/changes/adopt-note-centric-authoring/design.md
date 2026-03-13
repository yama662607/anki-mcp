## Context

The current MCP server exposes three layers above Anki's official data model: `pack`, `card type definition`, and `draft`. The user wants the public design to align with official Anki concepts as closely as possible and is comfortable with agents learning field usage by inspecting existing note types, templates, and example notes. That makes `pack` and `card type definition` poor long-term fits for the public API.

Today, those abstractions provide convenience and validation, but they also fragment the mental model, require extra registries, and force future domain work through MCP-specific taxonomies. The redesign should keep the safety guarantees that matter, while moving the public API back to `profile`, `deck`, `note type`, `note`, `card`, `tag`, and `media`.

## Goals / Non-Goals

**Goals:**
- Make the public MCP surface note-centric and aligned to official Anki concepts.
- Remove public `pack` and `card type definition` workflows.
- Let agents inspect existing note types and example notes to learn how to author new notes.
- Preserve review-first safety by adding notes in a review-pending state using ordinary note/card operations.
- Keep note type authoring and media import as first-class capabilities.
- Preserve deterministic profile scoping, validation, and conflict detection.

**Non-Goals:**
- Support destructive note type migrations beyond the existing additive-safe policy.
- Recreate a new runtime registry under a different name.
- Auto-generate domain curricula or content packs inside MCP.
- Eliminate all internal metadata; the change only removes MCP-specific public taxonomy.

## Decisions

### 1. Public API becomes note-centric

The new public write path will use `modelName`, `deckName`, `fields`, and `tags` directly.

Rationale:
- These map directly to Anki concepts.
- Agents can learn the required field shape from `get_note_type_schema` and example notes.
- The API becomes domain-agnostic and more future-proof.

Alternatives considered:
- Keep `card type definition` as an advanced layer: rejected because it remains a second taxonomy the user does not want.
- Keep `pack` as an optional install-only layer: rejected because it still pushes MCP-specific domain grouping into the public contract.

### 2. Review is modeled as a normal note with suspended cards

New note creation will default to `suspendNewCards=true`, and the server may attach internal review markers for bookkeeping. Public tools will operate on `noteId` and `cardIds`, not `draftId`.

Rationale:
- This matches the user's actual mental model: a note is added, reviewed, then either kept, edited, or deleted.
- Suspension prevents premature study exposure without inventing a new public object.
- Preview can operate directly on the created note.

Alternatives considered:
- Fully unsuspended immediate writes: rejected because review mistakes would leak directly into study queues.
- Continue exposing `draftId`: rejected because it keeps the draft taxonomy public.

### 3. Validation moves into note-centric tools

Validation will be derived from note type schema, note snapshots, and generic safety rules.

Planned validation sources:
- note type field existence
- cloze-specific checks for cloze note types
- media token existence checks
- sanitized HTML handling based on generic safe defaults or explicit tool flags
- optimistic concurrency using `expectedModTimestamp` / note mod state

Rationale:
- This preserves safety without requiring a separate card type registry.

Alternatives considered:
- Infer everything from template HTML without any validation layer: rejected because it is too brittle.
- Keep the current card type validation engine: rejected because it depends on the abstraction we are removing.

### 4. Reuse shifts to files and examples, not runtime registries

Reusable note type definitions and example notes should live in repository files and existing Anki content, not in MCP-managed pack registries.

Rationale:
- Files are easier to version, review, and evolve.
- This keeps MCP focused on Anki operations rather than domain taxonomy management.
- Agents can still reuse patterns without the server owning a separate content registry.

Alternatives considered:
- Replace `pack` with a differently named runtime registry: rejected because it recreates the same design problem.

### 5. Removal is a breaking contract change

This redesign should be treated as a breaking MCP contract update.

Rationale:
- Tool names, request shapes, response shapes, and resource contents all change.
- Hiding breaking removals behind compatibility aliases would prolong two competing mental models.

Alternatives considered:
- Long-lived dual API: rejected because it doubles docs and testing cost.

## Risks / Trade-offs

- [Agents must infer semantics from examples more often] → Provide strong note discovery tools and example-oriented docs.
- [Existing MCP clients break] → Cut a clear major contract version and ship a migration guide.
- [Internal review metadata may still look like “drafts” in code] → Keep it internal-only and avoid exposing it in tool names or docs.
- [Generic validation is less domain-specific] → Prefer conservative defaults, optimistic locking, and preview-first workflow over hidden registries.
- [Removal touches many specs and modules] → Land the redesign as one explicit breaking change before more content depends on the old model.

## Migration Plan

1. Add the new deck/note discovery and note-centric authoring contracts.
2. Implement note-centric services and note-based preview/update/delete flows.
3. Update real-Anki smoke and automated tests to the new workflow.
4. Remove public registration and provisioning tools for packs and card type definitions.
5. Retire pack/card-type docs and replace them with official-concept examples.
6. Keep any internal persistence needed for idempotency and conflict detection, but stop exposing it as public draft taxonomy.

## Open Questions

- Should batch support include only `add_notes_batch` and `delete_notes_batch`, or also `update_notes_batch` in the first breaking release?
- Should `add_note` auto-create missing decks, or should deck creation remain explicit through `ensure_deck`?
