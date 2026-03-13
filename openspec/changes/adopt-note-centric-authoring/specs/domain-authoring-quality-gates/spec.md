## MODIFIED Requirements

### Requirement: Domain authoring examples
The system SHALL include canonical examples that show how to add at least one note per supported learning domain using official concepts.

#### Scenario: Example exists for every target domain
- **WHEN** the client or developer inspects the implementation docs or example resources
- **THEN** there is at least one worked authoring example for English vocabulary, English listening, programming, and fundamentals using `note type -> add note -> preview -> update/delete/unsuspend`

### Requirement: Domain readiness smoke coverage
The system SHALL define a minimal smoke matrix that proves each domain can complete the note-centric review workflow.

#### Scenario: Domain smoke paths use note-centric flow
- **WHEN** the domain smoke matrix is executed
- **THEN** each target domain proves `ensure deck/note type -> add note -> preview -> delete or unsuspend` succeeds for at least one canonical example

### Requirement: No bypass of the review workflow
The system SHALL keep domain examples aligned with the standard note-centric review model.

#### Scenario: Domain examples reuse core note review operations
- **WHEN** a canonical domain example adds a note
- **THEN** it uses the same note-centric preview and keep/delete flow as the rest of the system
- **AND** does not require domain-specific commit or pack-install tools
