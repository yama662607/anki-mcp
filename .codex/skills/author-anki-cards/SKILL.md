---
name: author-anki-cards
description: Safe operation guide for note-centric authoring with the `anki-mcps` MCP server. Use when adding, previewing, revising, deleting, batching, or releasing Anki notes that already have a usable note type.
---

# Author Anki Cards

## Quick rules

- Pass `profileId` on every write tool.
- Use official Anki concepts only: deck, note type, note, card, tag, media.
- Inspect unfamiliar structures with `list_note_types`, `get_note_type_schema`, `search_notes`, and `get_notes`.
- Run `ensure_deck` before the first write into a new deck.
- Never release cards with `set_note_cards_suspended(suspended=false)` before explicit user approval in natural language.
- Revise an existing review-pending note with `update_note`; do not invent a second draft object in the prompt.
- Use batch tools only when item-by-item outcomes are actually needed.

## Pick the workflow

- One new note:
  - `list_note_types -> get_note_type_schema -> ensure_deck -> add_note -> open_note_preview -> update_note|delete_note|set_note_cards_suspended`
- Many new notes:
  - `list_note_types -> get_note_type_schema -> ensure_deck -> add_notes_batch -> open_note_preview for a sample -> delete_notes_batch|set_note_cards_suspended`
- Revise after user feedback:
  - `get_notes -> update_note -> open_note_preview`
- Recover after interruption:
  - `search_notes -> get_notes -> open_note_preview`

## When to read references

- Read [references/operations.md](references/operations.md) when you need concrete example payloads.
- If field usage is unclear, inspect real example notes before writing new content.

## Failure handling

- `INVALID_ARGUMENT`: fix note fields or note type mismatches.
- `CONFLICT`: refresh note state and retry with the current `expectedModTimestamp` or a new `clientRequestId`.
- `PROFILE_SCOPE_MISMATCH`: retry against the correct profile.
- `NOT_FOUND`: create the deck first, refresh note IDs, or verify the note type exists.
