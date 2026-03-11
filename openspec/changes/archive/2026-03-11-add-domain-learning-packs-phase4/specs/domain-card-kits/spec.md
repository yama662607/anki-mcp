## ADDED Requirements

### Requirement: English core pack contents
The system SHALL define an English core starter pack that is sufficient for vocabulary and listening study.

#### Scenario: English pack provisions vocabulary and listening card kits
- **WHEN** the English core pack is applied
- **THEN** it provisions card kits for `vocab-recognition`, `vocab-production`, and `listening-comprehension`
- **AND** each kit defines its required fields, default deck root, and tag conventions

#### Scenario: English listening kit is audio-aware
- **WHEN** the client inspects the listening-comprehension card kit
- **THEN** the field schema includes an audio/reference field intended for imported media tokens
- **AND** the authoring example shows how imported audio is inserted into the note

### Requirement: Programming core pack contents
The system SHALL define a programming core starter pack that supports language-specific study using shared learning interactions.

#### Scenario: Programming pack provisions shared interaction types
- **WHEN** the programming core pack is applied
- **THEN** it provisions card kits for `concept`, `compare`, `output`, `debug`, and `build`
- **AND** the programming language is expressed through per-language card type definitions, deck roots, and tags rather than duplicated workflows

#### Scenario: Programming pack supports the initial language set
- **WHEN** the client applies the programming pack without overriding the language list
- **THEN** the supported default set includes `typescript`, `python`, `c`, `cpp`, `rust`, `go`, `java`, and `julia`

### Requirement: Fundamentals core pack contents
The system SHALL define an engineering-fundamentals starter pack that covers factual recall and conceptual comparison.

#### Scenario: Fundamentals pack provisions the minimal interaction set
- **WHEN** the fundamentals core pack is applied
- **THEN** it provisions card kits for `concept`, `compare`, and `cloze`
- **AND** the default deck roots are grouped under `Fundamentals::*`

### Requirement: Canonical field contracts remain small and stable
The system SHALL keep each card kit on a bounded, reviewable field set.

#### Scenario: Card kit field sets are explicit
- **WHEN** the client inspects any canonical card kit
- **THEN** the system returns the exact required and optional fields for that kit
- **AND** the field contract does not depend on hidden repository conventions
