# anki-mcps

TypeScript MCP server for draft-first, review-first Anki card creation.

## Features

- card type catalog + schema introspection
- note type discovery and additive-safe authoring (`dryRun` default)
- custom card type registry merged with builtin catalog
- starter-pack provisioning for English, programming, and fundamentals
- local media import for listening-card audio fields
- strict field validation and HTML policy sanitization
- draft lifecycle (`create -> preview -> commit/discard`)
- deterministic conflict detection via fingerprints
- SQLite draft persistence with profile scoping
- frozen v1 contract resource (`anki://contracts/v1/tools`)

## Quick start

```bash
npm install
npm run typecheck
npm test
npm run dev
```

## Environment

- `ANKI_CONNECT_URL` (default `http://127.0.0.1:8765`)
- `ANKI_ACTIVE_PROFILE` (optional fallback for read tools)
- `DRAFT_DB_PATH` (default `.data/drafts.sqlite`)
- `DRAFT_MARKER_TAG` (default `__mcp_draft`)
- `ANKI_GATEWAY_MODE=memory` for local deterministic testing without Anki

## Notes

- write tools require explicit `profileId`
- note type authoring flow:
  - `list_note_types -> get_note_type_schema -> upsert_note_type(dryRun=true) -> upsert_note_type(dryRun=false) -> upsert_card_type_definition`
- draft cards are suspended until committed
- starter-pack bootstrap flow:
  - `list_starter_packs -> apply_starter_pack(dryRun=true) -> apply_starter_pack(dryRun=false)`
- listening workflow:
  - `import_media_asset -> create_draft -> open_draft_preview -> commit_draft|discard_draft`
- preview integration:
  - preferred: `guiPreviewNote` (from optional `anki-connect-extension` add-on)
  - fallback: `guiBrowse -> guiSelectCard -> guiEditNote`
