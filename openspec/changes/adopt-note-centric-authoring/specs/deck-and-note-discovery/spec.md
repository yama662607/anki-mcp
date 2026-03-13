## ADDED Requirements

### Requirement: Deck discovery for official Anki navigation
The MCP server MUST expose deck discovery tools so agents can select official Anki deck targets without relying on MCP-specific pack metadata.

#### Scenario: List available decks
- **WHEN** the client calls `list_decks`
- **THEN** the server returns deterministic deck summaries including deck names in hierarchical form
- **AND** the operation does not mutate Anki state

#### Scenario: Read deck discovery under profile scope
- **WHEN** the client omits `profileId` and a unique active profile can be resolved
- **THEN** the response includes the resolved profile context
- **AND** no write occurs

### Requirement: Note search for example-driven authoring
The MCP server MUST let agents search existing notes so they can learn field conventions from real Anki data.

#### Scenario: Search notes by official criteria
- **WHEN** the client calls `search_notes` with query text, note type filters, deck filters, or tag filters
- **THEN** the server returns matching note identifiers with enough summary metadata to choose examples for inspection

#### Scenario: Search failure is structured
- **WHEN** a note search query is invalid or Anki search fails
- **THEN** the server returns a structured error and performs no mutation

### Requirement: Concrete note inspection
The MCP server MUST let agents inspect existing notes directly by note identifier.

#### Scenario: Read note fields and metadata
- **WHEN** the client calls `get_notes` with one or more valid `noteId` values
- **THEN** the server returns `modelName`, `deckName`, `fields`, `tags`, `cardIds`, and note modification metadata for each note

#### Scenario: Missing notes are itemized
- **WHEN** the client requests notes and some note identifiers no longer exist
- **THEN** the response preserves stable per-item outcomes and identifies missing notes without corrupting successful reads
