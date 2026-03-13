## ADDED Requirements

### Requirement: Direct note creation from official concepts
The MCP server MUST create review-pending notes directly from `modelName`, `deckName`, `fields`, and `tags` without requiring pack or card-type registries.

#### Scenario: Add note successfully
- **WHEN** the client calls `add_note` with an existing note type, target deck, and valid fields
- **THEN** the server creates a note and returns `noteId`, generated `cardIds`, and the resolved profile context

#### Scenario: Reject unknown note type or field
- **WHEN** the request references a missing `modelName` or fields not defined on that note type
- **THEN** the server returns `INVALID_ARGUMENT` or `NOT_FOUND`
- **AND** no note is created

### Requirement: Review-first note isolation
The MCP server MUST keep newly added notes out of normal study flow until the user explicitly keeps them.

#### Scenario: New note cards are suspended by default
- **WHEN** `add_note` succeeds without overriding the review behavior
- **THEN** the generated cards are suspended
- **AND** the response reports that the note is review-pending

#### Scenario: Preview by note identity
- **WHEN** the client calls `open_note_preview` with a valid `noteId`
- **THEN** the server opens the corresponding Anki editor/browser preview for that existing note

#### Scenario: Release note to study
- **WHEN** the client calls `set_note_cards_suspended` with `suspended=false`
- **THEN** the note's generated cards become eligible for normal study scheduling

### Requirement: Direct note mutation with conflict checks
The MCP server MUST support editing or deleting review-pending notes directly, with optimistic conflict detection.

#### Scenario: Update note with expected mod timestamp
- **WHEN** the client calls `update_note` with a matching expected modification timestamp
- **THEN** the server updates the note fields and tags and returns the new note metadata

#### Scenario: Reject stale update request
- **WHEN** the client calls `update_note` with a stale expected modification timestamp after manual edits in Anki
- **THEN** the server returns `CONFLICT` and does not overwrite the live note silently

#### Scenario: Delete rejected note
- **WHEN** the client calls `delete_note` for a review-pending note
- **THEN** the server deletes the note and its cards and returns a deterministic deletion result

### Requirement: Explicit deck preparation
The MCP server MUST provide an explicit, idempotent deck-creation helper for note-centric flows.

#### Scenario: Ensure deck exists
- **WHEN** the client calls `ensure_deck` with a new or existing deck name
- **THEN** the server creates the deck if missing and otherwise returns success without duplication
