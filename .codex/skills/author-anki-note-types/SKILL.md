---
name: author-anki-note-types
description: Safe operation guide for note type authoring with the `anki-mcps` MCP server. Use when creating or revising Anki note types for direct note creation.
---

# Author Anki Note Types

## Quick rules

- Pass `profileId` on every write tool.
- Run `upsert_note_type` with `dryRun=true` before applying.
- Treat note types as schema design work, not content authoring work.
- A successful `upsert_note_type(dryRun=false)` is immediately usable by `add_note`.
- If a change is destructive, create a new versioned model instead of mutating in place.

## Pick the workflow

- New note type:
  - `list_note_types -> get_note_type_schema -> upsert_note_type(dryRun=true) -> upsert_note_type(dryRun=false)`
- Additive-safe update to an existing note type:
  - `get_note_type_schema -> upsert_note_type(dryRun=true) -> upsert_note_type(dryRun=false)`
- Verify direct usability:
  - `ensure_deck -> add_note -> open_note_preview`

## When to read references

- Read [references/operations.md](references/operations.md) when you need concrete payload examples.
- If you are unsure whether a change is additive-safe, inspect the current schema before writing.

## Failure handling

- `FORBIDDEN_OPERATION`: the requested note type change is destructive for the current phase.
- `INVALID_ARGUMENT`: fix field names, template references, or duplicate metadata.
- `NOT_FOUND`: refresh the target note type or create a new model name.
