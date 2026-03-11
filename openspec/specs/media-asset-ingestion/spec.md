# media-asset-ingestion Specification

## Purpose
TBD - created by archiving change add-domain-learning-packs-phase4. Update Purpose after archive.
## Requirements
### Requirement: Local media import for authoring
The system SHALL provide a media import operation that stores a local file in Anki media and returns stable references the agent can place into draft fields.

#### Scenario: Import local audio file
- **WHEN** the client calls `import_media_asset` with a valid local audio file path
- **THEN** the system stores the file in Anki media
- **AND** returns the stored filename plus an Anki-ready audio token for field insertion

#### Scenario: Reject missing local file
- **WHEN** the client calls `import_media_asset` with a non-existent local path
- **THEN** the system returns `NOT_FOUND`
- **AND** no note, draft, or card type state is mutated

### Requirement: Media import is retry-safe
The system SHALL avoid duplicating identical imported assets during retries.

#### Scenario: Reimport same file content
- **WHEN** the client imports the same file content more than once for the same profile
- **THEN** the system returns the same stored filename or a deterministic duplicate-safe equivalent
- **AND** the response indicates that the asset already existed or was deduplicated

### Requirement: Media import errors are operationally clear
The system SHALL return structured failures that distinguish content problems from dependency problems.

#### Scenario: Anki media backend unavailable
- **WHEN** the media import operation cannot reach Anki or the media storage action fails
- **THEN** the system returns `DEPENDENCY_UNAVAILABLE`
- **AND** the response includes a hint that the user should verify Anki and AnkiConnect availability

