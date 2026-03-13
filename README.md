# anki-mcps

[![npm version](https://img.shields.io/npm/v/anki-mcps)](https://www.npmjs.com/package/anki-mcps)
[![CI](https://github.com/yama662607/anki-mcps/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/yama662607/anki-mcps/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

TypeScript MCP server for review-first Anki authoring built on official Anki concepts: `profile`, `deck`, `note type`, `note`, `card`, `tag`, and `media`.

## Features

- deck and note discovery for example-driven authoring
- additive-safe note type authoring with `dryRun=true` by default
- lightweight note type linting with structured `errors` and `warnings` before apply
- direct note creation with `modelName`, `deckName`, `fields`, and `tags`
- review-first isolation by suspending new cards until the user keeps them
- optimistic conflict detection for `update_note`
- batch add/delete note operations with stable per-item outcomes
- local media import for audio and image fields
- frozen v1 contract resource at `anki://contracts/v1/tools`

## Requirements

- Node.js 22+
- Anki with AnkiConnect enabled
- optional: the AnkiConnect extension add-on for the best preview UX

## Installation

### From npm

```bash
npm install -g anki-mcps
```

### From source

```bash
npm install
npm run build
```

## Running

### As a local command

```bash
anki-mcps
```

### From source

```bash
npm run dev
```

## MCP client example

```json
{
  "mcpServers": {
    "anki-mcps": {
      "command": "anki-mcps",
      "env": {
        "ANKI_CONNECT_URL": "http://127.0.0.1:8765",
        "ANKI_ACTIVE_PROFILE": "default"
      }
    }
  }
}
```

## Environment

- `ANKI_CONNECT_URL` default: `http://127.0.0.1:8765`
- `ANKI_ACTIVE_PROFILE` optional fallback for read tools
- `ANKI_MCPS_DB_PATH` default: `.data/anki-mcps.sqlite`
- `ANKI_GATEWAY_MODE=memory` for deterministic local tests without Anki

`ANKI_MCPS_DB_PATH` is the internal SQLite path used for idempotency and operational metadata. `DRAFT_DB_PATH` is still accepted as a backward-compatible fallback.

## Core workflow

1. Discover existing structure with `list_decks`, `list_note_types`, `get_note_type_schema`, `search_notes`, and `get_notes`.
2. Create missing decks with `ensure_deck`.
3. Create or revise note types with `upsert_note_type(dryRun=true)` and inspect `result.validation`.
4. Add review-pending content with `add_note` or `add_notes_batch`.
5. Inspect the real Anki rendering with `open_note_preview`.
6. After user feedback, call `update_note`, `delete_note`, or `set_note_cards_suspended(suspended=false)`.

## Media workflow

1. `import_media_asset`
2. Insert returned `asset.fieldValue` into the target note field
3. `add_note` or `update_note`
4. `open_note_preview`

## Main docs

- [Operating model](docs/implementation/anki-operating-model.md)
- [Contracts and tool surface](docs/implementation/contracts-and-catalog.md)
- [Note type authoring](docs/implementation/note-type-authoring.md)
- [Real Anki E2E](docs/implementation/e2e-real-anki.md)
- [Migration from pack/card-type APIs](docs/implementation/migration-note-centric.md)
- [Public release checklist](docs/implementation/public-release-checklist.md)

## License

MIT
