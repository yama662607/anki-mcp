# Migration to the Note-Centric API

This change removes several public MCP concepts.

## Removed public concepts

- `pack`
- `starter pack`
- `pack manifest`
- `card type definition`
- `draft`

## Replacement mapping

- `list_card_types` -> `list_note_types` plus `get_note_type_schema`
- `get_card_type_schema` -> `get_note_type_schema`
- `create_draft` -> `add_note`
- `create_drafts_batch` -> `add_notes_batch`
- `get_draft` -> `get_notes`
- `open_draft_preview` -> `open_note_preview`
- `commit_draft` -> `set_note_cards_suspended(suspended=false)`
- `discard_draft` -> `delete_note`
- `commit_drafts_batch` -> repeated `set_note_cards_suspended` calls
- `discard_drafts_batch` -> `delete_notes_batch`
- `list_starter_packs` / `apply_starter_pack` -> repository files plus `upsert_note_type` and `ensure_deck`
- `upsert_card_type_definition` -> no replacement; use the note type directly

## Workflow change

Old flow:

1. discover card type
2. create draft
3. preview draft
4. commit or discard draft

New flow:

1. inspect decks, note types, and example notes
2. ensure the target deck exists
3. add a suspended note directly
4. preview the real note
5. update, delete, or unsuspend the note

## Why this changed

- agents can already infer field usage from live note types and example notes
- the extra taxonomy increased cognitive load without adding official Anki value
- direct note operations are easier to generalize across new domains and card designs
