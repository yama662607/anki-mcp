# Anki Operating Model

`anki-mcp` now exposes only official Anki concepts in the public API.

## Public concepts

- `profile`: the target Anki profile
- `deck`: hierarchical Anki deck name such as `Programming::TypeScript::Concept`
- `note type`: Anki model definition
- `note`: one record with fields and tags
- `card`: generated from a note template
- `media`: imported audio or image assets

## Read flow

1. `list_decks`
2. `list_note_types`
3. `get_note_type_schema`
4. `search_notes`
5. `get_notes`

Use the read flow first when the agent needs to learn existing field conventions from real notes instead of inventing a new abstraction.

## Write flow

1. `ensure_deck`
2. `upsert_note_type` if the required note type does not exist yet
3. `add_note` or `add_notes_batch`
4. `open_note_preview`
5. After user feedback:
   - keep the note: `set_note_cards_suspended(suspended=false)`
   - revise the note: `update_note`
   - reject the note: `delete_note` or `delete_notes_batch`

## Safety rules

- Every write tool requires explicit `profileId`.
- New notes are review-pending by default because generated cards are suspended.
- `update_note` requires `expectedModTimestamp` and returns `CONFLICT` on stale data.
- Public APIs do not expose `draft`, `pack`, or `card type definition`.
- Internal idempotency bookkeeping may exist, but it is not part of the public workflow.

## Cleanup boundary

The public cleanup boundary is intentionally limited to notes.

- MCP cleanup support includes `delete_note` and `delete_notes_batch`.
- MCP does not currently expose deck deletion.
- MCP does not currently expose note type deletion.
- MCP does not currently expose media deletion.

This is intentional:

- note deletion is the common review-first authoring need
- deck and note type deletion are higher-risk and easier to misuse
- stock AnkiConnect does not provide a note type deletion action

For temporary test namespaces, remove leftover decks or note types manually inside the Anki app when needed.
