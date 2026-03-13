## MODIFIED Requirements

### Requirement: Local media import for authoring
The system SHALL provide a media import operation that stores a local file in Anki media and returns stable references the agent can place into note fields.

#### Scenario: Reject missing local file
- **WHEN** the client calls `import_media_asset` with a non-existent local path
- **THEN** the system returns `NOT_FOUND`
- **AND** no note, deck, or note-type state is mutated
