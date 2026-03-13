## MODIFIED Requirements

### Requirement: Note Type Discovery Tools
The MCP server MUST provide read tools to discover note types and inspect schema details required for safe direct note authoring.

#### Scenario: Inspect a note type for direct note creation
- **WHEN** the client calls `get_note_type_schema` with an existing `modelName`
- **THEN** the response is sufficient to drive `add_note` without a secondary card-type registry step

### Requirement: Safe Upsert for Note Types
The MCP server MUST provide an upsert tool for note type authoring with safe defaults.

#### Scenario: Applied note type is immediately usable
- **WHEN** the client calls `upsert_note_type` with `dryRun=false` and the request succeeds
- **THEN** subsequent note-centric creation tools may use that `modelName` directly without any extra registration operation

## ADDED Requirements

### Requirement: No secondary registry required after note type authoring
The MCP server MUST NOT require pack or card-type registration before a new note type can be used to create notes.

#### Scenario: Create note after note type upsert
- **WHEN** a note type has been created or updated successfully
- **THEN** the client can call `add_note` with the same `modelName`
- **AND** no pack or card-type provisioning step is required
