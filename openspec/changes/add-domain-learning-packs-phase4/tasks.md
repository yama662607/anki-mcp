## 1. Starter Pack Contracts

- [x] 1.1 Define request/response schemas and tool descriptions for `list_starter_packs`, `apply_starter_pack`, and any related pack resource payloads
- [x] 1.2 Define pack manifest versioning, idempotent reapply behavior, and `dryRun` semantics
- [x] 1.3 Define supported pack options, including programming-language selection and deck-root defaults

## 2. Media Asset Ingestion

- [x] 2.1 Define the `import_media_asset` contract for local-file ingestion and structured failure modes
- [x] 2.2 Define returned audio reference values so listening fields can be populated without guesswork
- [x] 2.3 Add gateway, service, and contract tests for media import and dedupe behavior

## 3. Domain Pack Definitions

- [x] 3.1 Define the English core pack with vocabulary recognition, vocabulary production, and listening-comprehension card kits
- [x] 3.2 Define the programming core pack with shared interaction note types and per-language card type definitions
- [x] 3.3 Define the fundamentals core pack with concept, compare, and cloze card kits
- [x] 3.4 Add pack-manifest validation tests that lock field sets, deck roots, and tag conventions

## 4. Authoring Readiness and Documentation

- [x] 4.1 Add example authoring payloads and workflow docs for English vocabulary, English listening, programming, and fundamentals
- [x] 4.2 Add minimal end-to-end smoke coverage proving `pack install -> create draft -> preview -> finalize` per domain
- [x] 4.3 Validate the change with `openspec validate add-domain-learning-packs-phase4 --strict`
