# domain-authoring-quality-gates Specification

## Purpose
TBD - created by archiving change add-domain-learning-packs-phase4. Update Purpose after archive.
## Requirements
### Requirement: Domain authoring examples
The system SHALL include canonical examples that show how to add at least one card per supported learning domain.

#### Scenario: Example exists for every target domain
- **WHEN** the client or developer inspects the implementation docs or example resources
- **THEN** there is at least one worked authoring example for English vocabulary, English listening, programming, and fundamentals

### Requirement: Domain readiness smoke coverage
The system SHALL define a minimal smoke matrix that proves each domain can complete the standard review workflow.

#### Scenario: English vocabulary smoke path
- **WHEN** the domain smoke matrix is executed for the English vocabulary pack
- **THEN** it proves `pack install -> create draft -> preview -> discard or commit` succeeds for at least one vocabulary card

#### Scenario: English listening smoke path
- **WHEN** the domain smoke matrix is executed for the English listening pack
- **THEN** it proves media import and `create draft -> preview -> discard or commit` succeed for at least one listening card

#### Scenario: Programming and fundamentals smoke paths
- **WHEN** the domain smoke matrix is executed for the programming and fundamentals packs
- **THEN** each pack proves at least one successful draft review path using its canonical card kits

### Requirement: No bypass of the existing draft workflow
The system SHALL keep starter-pack readiness aligned with the current review model.

#### Scenario: Domain packs reuse core draft lifecycle
- **WHEN** a canonical domain example adds a card
- **THEN** it uses the existing draft lifecycle tools for note creation and review
- **AND** does not require a domain-specific commit or preview tool

