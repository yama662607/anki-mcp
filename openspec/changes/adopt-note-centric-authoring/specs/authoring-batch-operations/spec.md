## REMOVED Requirements

### Requirement: Batch draft creation

### Requirement: Batch finalize operations

## ADDED Requirements

### Requirement: Batch note addition
The system SHALL provide a batch note addition operation that accepts multiple note-create requests under one `profileId` and returns itemized results.

#### Scenario: Batch add with mixed outcomes
- **WHEN** a batch contains both valid and invalid note-create requests
- **THEN** the system returns a `results[]` entry for every item
- **AND** valid items are created as notes
- **AND** invalid items return structured errors without cancelling successful items

### Requirement: Batch note deletion
The system SHALL provide batch note deletion that preserves single-item semantics per note.

#### Scenario: Batch delete is idempotent per item
- **WHEN** a batch delete request includes notes that are already missing
- **THEN** missing items return stable per-item error or already-gone outcomes
- **AND** deletable items continue to be deleted normally

### Requirement: Batch response stability
The system SHALL make batch note responses machine-actionable and retry-safe.

#### Scenario: Batch response identifies item outcomes
- **WHEN** a batch operation completes
- **THEN** the response includes a stable per-item identifier from the request
- **AND** each item reports either a success payload or a structured error payload
- **AND** the response includes aggregate counts for `succeeded` and `failed`
