# starter-pack-provisioning Specification

## Purpose
TBD - created by archiving change add-domain-learning-packs-phase4. Update Purpose after archive.
## Requirements
### Requirement: Starter pack discovery
The system SHALL expose a stable catalog of starter packs so an agent can discover supported domain bootstraps without reading repository docs.

#### Scenario: List available starter packs
- **WHEN** the client calls `list_starter_packs`
- **THEN** the server returns pack summaries including `packId`, `label`, `version`, `domains`, and supported options

#### Scenario: Starter pack catalog is also cacheable
- **WHEN** the client reads the starter-pack resource for the same server state
- **THEN** the pack list is semantically equivalent to the tool output for that version

### Requirement: Starter pack application
The system SHALL provide an idempotent starter-pack application flow that provisions note types and custom card type definitions without creating learning notes.

#### Scenario: Dry-run starter pack application
- **WHEN** the client applies a starter pack with `dryRun=true`
- **THEN** the system returns the note types, card type definitions, and deck roots that would be created or updated
- **AND** no Anki models, card type definitions, or notes are mutated

#### Scenario: Reapply same starter pack version
- **WHEN** the client reapplies the same `packId` and `version` against the same profile
- **THEN** the operation succeeds without duplicate definitions
- **AND** the response identifies unchanged versus updated items

### Requirement: Pack options are explicit and validated
The system SHALL validate pack-specific options before attempting application.

#### Scenario: Programming pack accepts requested languages only
- **WHEN** the client applies the programming pack with a language list
- **THEN** the system accepts only supported language identifiers
- **AND** returns `INVALID_ARGUMENT` for unknown values

#### Scenario: Pack defaults are deterministic
- **WHEN** the client omits optional pack configuration
- **THEN** the system uses documented default deck roots and pack defaults without profile-specific guessing

