## 1. Contracts and Tool Surface

- [x] 1.1 Add request/response schemas and shared contract types for deck discovery, note search/inspection, and note-centric authoring tools
- [x] 1.2 Remove public pack/card-type-definition tools and resources from the MCP contract registry and handler surface
- [x] 1.3 Define the new public tool set around `list_decks`, `search_notes`, `get_notes`, `ensure_deck`, `add_note`, `update_note`, `delete_note`, `open_note_preview`, and `set_note_cards_suspended`

## 2. Discovery and Note-Centric Services

- [x] 2.1 Extend the Anki gateway with deck listing, note search, note read, note update/delete, and card suspension operations
- [x] 2.2 Implement note-centric service logic that validates against note type schema and live note state instead of card type definitions
- [x] 2.3 Implement note preview/update/delete flows keyed by `noteId` and optimistic note modification checks
- [x] 2.4 Keep any internal review metadata needed for idempotency or audit hidden behind the note-centric public API

## 3. Remove Registry-Centric Workflows

- [x] 3.1 Remove pack-manifest, starter-pack, card-type-catalog, and custom-card-type-registry services and handlers from the public workflow
- [x] 3.2 Replace draft batch flows with note-centric batch operations where still needed
- [x] 3.3 Update note type authoring so a new or updated note type is directly usable by note creation tools without extra registration

## 4. Tests and Operational Coverage

- [x] 4.1 Add service tests for deck discovery, note inspection, add/update/delete note flows, and conflict detection
- [x] 4.2 Add MCP tests for the new note-centric tools and removal of pack/card-type discovery surfaces
- [x] 4.3 Rewrite the real-Anki smoke flow to prove `add note -> preview -> update/delete or unsuspend` leaves Anki clean

## 5. Documentation and Validation

- [x] 5.1 Rewrite docs and skills around official Anki concepts and the note-centric workflow
- [x] 5.2 Add migration guidance explaining the breaking removal of `pack` and `card type definition`
- [x] 5.3 Validate with `openspec validate adopt-note-centric-authoring --strict`, `npm run typecheck`, `npm test`, and `npm run build` once implementation exists
