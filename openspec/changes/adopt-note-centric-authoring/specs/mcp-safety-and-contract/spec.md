## MODIFIED Requirements

### Requirement: Safety-Oriented Tool Segmentation
The MCP server MUST segment tools by risk using official Anki discovery and note-authoring operations.

#### Scenario: Read-only tools do not mutate state
- **WHEN** the client calls `list_decks`, `list_note_types`, `get_note_type_schema`, `search_notes`, or `get_notes`
- **THEN** the server performs no Anki write action and returns deterministic responses

#### Scenario: Write operations require explicit tool call
- **WHEN** a client needs to create or change decks, note types, notes, or suspension state
- **THEN** no persistent write occurs until a mutating tool such as `ensure_deck`, `upsert_note_type`, `add_note`, `update_note`, `delete_note`, or `set_note_cards_suspended` is invoked

#### Scenario: Write operations require explicit profile
- **WHEN** a mutating tool such as `ensure_deck`, `upsert_note_type`, `add_note`, `update_note`, `delete_note`, `set_note_cards_suspended`, or `import_media_asset` is called without `profileId`
- **THEN** the server returns `PROFILE_REQUIRED`
- **AND** performs no mutation

### Requirement: Frozen v1 Tool Schema Registry
The MCP server MUST publish frozen JSON Schemas for the note-centric public contract.

#### Scenario: Tool schemas are discoverable
- **WHEN** a client reads the contract resource URI
- **THEN** it receives request/response JSON Schemas for `list_decks`, `list_note_types`, `get_note_type_schema`, `search_notes`, `get_notes`, `ensure_deck`, `upsert_note_type`, `add_note`, `update_note`, `delete_note`, `open_note_preview`, `set_note_cards_suspended`, and note-centric batch operations

#### Scenario: Shared types are versioned with tool schemas
- **WHEN** a client reads the same contract resource
- **THEN** shared schemas include deck summaries, note summaries, note records, note type schema shapes, and media import result shapes under the same `contractVersion`

### Requirement: Observability and Auditability
The MCP server MUST emit structured logs for note review state transitions.

#### Scenario: Review-note lifecycle logging
- **WHEN** a review-pending note is created, updated, unsuspended, or deleted through the MCP workflow
- **THEN** the server logs event type, identifiers, timestamp, and outcome without exposing sensitive field content by default
