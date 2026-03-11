## Context

The current system is strong at safe draft authoring, note-type creation, and custom card type management, but it is still a toolkit rather than a ready authoring product. To reach the next milestone, an agent must be able to prepare the right note types and card type definitions for three concrete use cases:
- English vocabulary learning
- English listening learning
- Programming learning
- Engineering fundamentals learning

Two gaps remain:
- Replaying many `upsert_note_type` and `upsert_card_type_definition` calls by hand is too heavy for normal use.
- Listening cards require media ingestion, and that capability does not exist yet.

This phase should keep the existing core stable and add a thin, opinionated layer on top of it.

## Goals / Non-Goals

**Goals:**
- Make domain setup reproducible with starter packs instead of ad hoc note-type bootstrapping.
- Keep the day-to-day card creation flow centered on `create_draft`, `open_draft_preview`, `commit_draft`, and `discard_draft`.
- Support English listening by adding a minimal media import path that fits Anki's media model.
- Define a small, canonical set of interaction types and map domains onto them.
- Freeze enough examples and tests that future pack expansion can proceed without changing the core workflow.

**Non-Goals:**
- Bulk-generate real learning content in this phase.
- Add domain-specific write tools such as `create_vocab_card` or `create_programming_card`.
- Add TTS generation, remote scraping, or automatic media download pipelines.
- Replace the existing TypeScript example pack during this phase; legacy examples can remain until migration is deliberate.

## Decisions

### 1. Add starter-pack tools instead of more domain-specific creation tools
- Decision: introduce pack discovery/application for one-time bootstrap, but keep actual note creation on the existing draft tools.
- Rationale: the missing capability is environment preparation, not another way to create notes. Adding per-domain create tools would increase surface area without solving the real setup problem.
- Alternative considered: `create_vocab_card`, `create_listening_card`, `create_fundamentals_card`. Rejected because these would duplicate `create_draft` semantics and fragment the contract.

### 2. Treat learning interaction type as a primary axis, and domain as a mapping layer
- Decision: define a small canonical interaction set and map each domain onto it.
- Canonical interaction types for this phase:
  - generic study: `concept`, `compare`, `cloze`
  - programming-specific: `output`, `debug`, `build`
  - language-specific: `vocab-recognition`, `vocab-production`, `listening-comprehension`
- Rationale: this keeps the number of note types bounded while still allowing domain-specific deck roots, tags, and content rules.
- Alternative considered: make every domain own its own bespoke concept/compare templates. Rejected because it proliferates note types faster than the authoring value justifies.

### 3. Use shared note types where rendering needs are shared, and domain-specific note types where rendering needs diverge
- Decision:
  - shared note types: `study.v1.concept`, `study.v1.compare`, `study.v1.cloze`
  - programming note types: `programming.v1.output`, `programming.v1.debug`, `programming.v1.build`
  - language note types: `language.v1.vocab-recognition`, `language.v1.vocab-production`, `language.v1.listening-comprehension`
- Rationale: concept/compare/cloze can be reused by programming and fundamentals, while code-heavy and audio-heavy cards need different rendering.
- Alternative considered: make every card type a separate note type. Rejected because it would create unnecessary template duplication.

### 4. Support listening with one minimal media import tool
- Decision: add one `import_media_asset` tool that imports a local file into Anki media and returns a stable stored filename plus the Anki-ready token for field insertion.
- Rationale: local-file import is the minimal reliable feature needed to author listening cards. It matches Anki's storage model and keeps failure cases simple.
- Alternative considered: add URL download or TTS generation in the same phase. Rejected as avoidable scope growth.

### 5. Make starter packs versioned and idempotent
- Decision: pack manifests are versioned, listed by the server, and applied through `dryRun`/`apply` semantics. Reapplying the same pack version must be safe.
- Rationale: packs are infrastructure, not one-off scripts. Agents need to discover them, inspect them, and rerun them without guessing current state.
- Alternative considered: store setup as docs-only recipes. Rejected because it keeps the setup path manual and error-prone.

### 6. Parameterize the programming pack by language list
- Decision: the programming pack installs shared note types once, then emits per-language card type definitions and deck roots for the requested languages. Initial supported set: `typescript`, `python`, `c`, `cpp`, `rust`, `go`, `java`, `julia`.
- Rationale: this matches the user's target languages while preserving a single programming learning method.
- Alternative considered: bake all languages in unconditionally. Rejected because it creates unnecessary noise for smaller profiles.

### 7. Keep pack readiness measurable with a small domain smoke matrix
- Decision: every pack must prove one successful end-to-end draft flow in tests or documented smoke steps.
- Required minimums:
  - English vocabulary: one recognition card
  - English listening: one listening card with imported audio
  - Programming: one language-specific concept or output card
  - Fundamentals: one cloze or concept card
- Rationale: readiness should mean a real authoring path exists, not only that manifests parse.
- Alternative considered: rely on manifest validation only. Rejected because it misses integration failures.

## Risks / Trade-offs

- [Starter packs become too opinionated] -> Keep pack count small and versioned; allow later custom packs without weakening the canonical ones.
- [Listening media import creates file-management edge cases] -> Limit v1 to local-file import, hash-based dedupe, and explicit structured errors.
- [Shared note types constrain future visual variation] -> Keep card type definitions separate from note type provisioning so later versions can branch without breaking current packs.
- [Legacy TypeScript examples diverge from canonical packs] -> Treat them as legacy examples and document the canonical pack as the preferred future path.
- [Tool count creeps upward] -> Add only pack provisioning and media import; continue to reuse the existing draft lifecycle for actual authoring.

## Migration Plan

1. Add pack manifest definitions and starter-pack contracts.
2. Add `import_media_asset` and its gateway support.
3. Implement English, programming, and fundamentals starter packs.
4. Add examples and smoke tests per domain.
5. Keep existing TS-specific examples working, but document the starter-pack path as the default.

Rollback:
- Pack application must be additive-safe and reversible through the existing note-type and card-type-definition tools.
- Media import failures do not mutate note state; imported orphan files are tolerable and can be cleaned manually if needed.
- Existing core draft tools remain unchanged, so clients can continue using the current workflow during rollout.

## Open Questions

- None. The main trade-offs for this phase are settled: use starter packs instead of more create tools, and add only local media import for listening.
