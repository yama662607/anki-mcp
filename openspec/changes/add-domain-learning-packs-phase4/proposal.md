## Why

The core MCP stack is complete, but it still requires too much manual setup before an agent can add useful cards across English, programming, and engineering fundamentals. The next phase must turn the authoring core into a reusable learning-pack system so the agent can bootstrap the right note types, import listening media, and add cards with a small, stable set of workflows.

## What Changes

- Add a versioned starter-pack layer that can provision note types and custom card type definitions for supported learning domains.
- Add a media asset ingestion tool for audio-first workflows, so English listening cards can be authored without manual file placement.
- Define the canonical card kits for English vocabulary, English listening, programming study, and engineering fundamentals.
- Add minimal examples and quality gates that prove each domain can reach `pack install -> create draft -> preview -> commit` with the existing core tools.
- Keep the existing draft lifecycle and note-type authoring tools; do not add domain-specific create tools unless the current flow is insufficient.

## Capabilities

### New Capabilities
- `starter-pack-provisioning`: versioned pack discovery and safe pack application for note types and custom card type definitions.
- `media-asset-ingestion`: safe import of local media files into Anki with agent-usable return values for listening cards.
- `domain-card-kits`: canonical pack contents, field contracts, deck roots, and tag rules for English, programming, and fundamentals.
- `domain-authoring-quality-gates`: examples and test gates that define when a domain pack is ready for real authoring.

### Modified Capabilities
- None.

## Impact

- New MCP tools and/or resources for starter-pack discovery/application and media ingestion.
- New pack manifest data covering note types, custom card type definitions, deck roots, and authoring examples.
- Additional validation, integration, and real-Anki smoke tests for pack application and listening-media workflows.
- Documentation updates describing the canonical authoring flows for English vocabulary, English listening, programming, and fundamentals.
