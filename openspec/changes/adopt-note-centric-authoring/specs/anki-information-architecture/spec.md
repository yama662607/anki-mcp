## MODIFIED Requirements

### Requirement: Classification Responsibility Model
The MCP server specification MUST define official Anki concepts (`profile`, `deck`, `note type`, `note`, `card`, `tag`, `media`) as the public operating model and MUST NOT require `pack` or `card type definition` to explain authoring flows.

#### Scenario: Responsibility definitions are official-concept-first
- **WHEN** an operator reads the operating model documentation
- **THEN** rendering is explained through `note type`, scheduling through `deck` and `card`, and content through `note`
- **AND** MCP-specific internal metadata is not presented as a peer taxonomy

### Requirement: Profile-Scoped Operations
All note discovery, note authoring, and note review operations MUST execute within an explicit or deterministically resolved Anki profile scope.

#### Scenario: Cross-profile note mutation is blocked
- **WHEN** a write request references a note that belongs to another profile context
- **THEN** the server returns `PROFILE_SCOPE_MISMATCH` and performs no mutation

### Requirement: Explicit Profile for Write Operations
The operating model MUST require explicit `profileId` for all mutating tools.

#### Scenario: Write request without profile is rejected
- **WHEN** `ensure_deck`, `upsert_note_type`, `add_note`, `update_note`, `delete_note`, or `set_note_cards_suspended` is called without `profileId`
- **THEN** the server returns `PROFILE_REQUIRED` and performs no mutation

### Requirement: Standard Operating Playbooks
The specification MUST define standard workflows using official note-centric operations.

#### Scenario: Add and confirm workflow
- **WHEN** a new card is created
- **THEN** the flow follows `discover note type/examples -> add note -> open preview -> update/delete/unsuspend`

#### Scenario: Manual edit during review
- **WHEN** a user edits the note directly in Anki before the agent updates it
- **THEN** the next write path enforces conflict detection using note modification state

### Requirement: Anti-Pattern Guardrails
The operating model MUST document discouraged MCP-specific taxonomies when official Anki concepts suffice.

#### Scenario: Registry-first taxonomy warning
- **WHEN** a workflow proposes introducing pack- or card-type-style registries for normal authoring
- **THEN** the guidance flags the approach as a poor default and redirects to official deck/note type/note operations
