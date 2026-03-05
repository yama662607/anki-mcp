## 1. Catalog Contract

- [ ] 1.1 Define `cardTypeId` naming and versioning rules
- [ ] 1.2 Finalize `list_card_types` response schema and examples
- [ ] 1.3 Finalize `get_card_type_schema` field metadata schema
- [ ] 1.4 Finalize `validate_card_fields` error/warning schema
- [ ] 1.5 Define strict request schema behavior (`additionalProperties=false`) for catalog tools
- [ ] 1.6 Define minimum card-type metadata (`renderIntent`, `allowedHtmlPolicy`) and enum constraints
- [ ] 1.7 Freeze per-tool request/response schema set for all v1 tools
- [ ] 1.8 Define strict sanitizer allowlist for `safe_inline_html` and escaping rules for `plain_text_only`

## 2. Staged Lifecycle Contract

- [ ] 2.1 Define draft state model (`staged/committed/discarded`) and transitions
- [ ] 2.2 Define `create_staged_card` input/output and idempotency behavior
- [ ] 2.3 Define `commit_staged_card` behavior for success/conflict/retry
- [ ] 2.4 Define `discard_staged_card` behavior and recovery guarantees
- [ ] 2.5 Define `list_staged_cards` and `cleanup_staged_cards` semantics
- [ ] 2.6 Define `supersedesDraftId` behavior for iterative rebuild workflow
- [ ] 2.7 Define default cleanup threshold as 72h and override policy
- [ ] 2.8 Add normative transition matrix and invalid transition error behavior
- [ ] 2.9 Define fingerprint algorithm inputs and canonicalization rules
- [ ] 2.10 Define supersede chain invariants (latest-only commit, lineage retention)
- [ ] 2.11 Define staged-card study isolation rules (tagging/suspension/release on commit)
- [ ] 2.12 Define `create_staged_card` idempotency key contract (`clientRequestId`) and conflict behavior

## 3. GUI Preview Contract

- [ ] 3.1 Define `open_staged_card_preview` behavior and required preconditions
- [ ] 3.2 Define failure contract when GUI is unavailable
- [ ] 3.3 Define preview confirmation checklist (question/answer visibility and state)
- [ ] 3.4 Define commit precondition payload for review completion (identity/question/answer checks)

## 4. Safety and Observability

- [ ] 4.1 Define read/write tool boundary and permission policy
- [ ] 4.2 Define global structured error format (`code/message/hint/context`)
- [ ] 4.3 Define lifecycle audit log event schema and redaction policy
- [ ] 4.4 Define operational metrics (draft count, commit rate, discard rate, cleanup count)
- [ ] 4.5 Add profile-scoped identifiers (`profileId`) to lifecycle state and logs
- [ ] 4.6 Define commit-time revision/hash conflict detection contract
- [ ] 4.7 Enforce no-force-commit policy in v1 (`forceCommit` disabled)
- [ ] 4.8 Freeze canonical error code registry and retryability map
- [ ] 4.9 Define response contract versioning policy for backward compatibility
- [ ] 4.10 Define SQLite schema contract (tables/indexes/unique constraints) and retention policy
- [ ] 4.11 Define contract resource URI and migration window policy for major schema changes
- [ ] 4.12 Define write-tool profile requirement policy (`PROFILE_REQUIRED` on missing `profileId`)

## 5. Test Strategy

- [ ] 5.1 Create contract test matrix for all v1 tools
- [ ] 5.2 Create integration test plan for AnkiConnect dependency failures
- [ ] 5.3 Create GUI E2E test plan for preview and commit/discard paths
- [ ] 5.4 Define regression tests for duplicate commit and orphan draft prevention
- [ ] 5.5 Define regression tests for manual-edit conflict and superseded-draft commit rejection

## 6. Benchmark and Quality Gate

- [ ] 6.1 Compare planned v1 against cloned projects on safety/recovery/testability axes
- [ ] 6.2 Define “better than clones” acceptance criteria and scoring rubric
- [ ] 6.3 Review and close Open Questions in design.md before implementation start
- [ ] 6.4 Define quantitative KPI thresholds (`auto-commit=0`, `duplicate-on-retry=0`, recovery success=100%)
- [ ] 6.5 Define benchmark evidence format and pass/fail rule (all axes >= 4/5 and total > best clone)

## 7. Anki Operating Model

- [ ] 7.1 Define responsibilities for `profile/deck/note type/note/card/tag`
- [ ] 7.2 Define standard naming and segregation rules for language/programming/fundamentals use cases
- [ ] 7.3 Define tool-to-classification mapping (which tool mutates which Anki object)
- [ ] 7.4 Define operational playbooks for staging, review confirmation, and correction/rebuild flows
- [ ] 7.5 Define anti-patterns and guardrails (e.g., deck-based design assumptions)
- [ ] 7.6 Define deterministic profile resolution precedence and fail-closed behavior
- [ ] 7.7 Define profile-scope mismatch handling (`PROFILE_SCOPE_MISMATCH`) for cross-profile draft mutation attempts
