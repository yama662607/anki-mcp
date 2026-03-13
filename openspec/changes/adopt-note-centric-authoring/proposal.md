## Why

The current public MCP surface adds `pack` and `card type definition` concepts on top of Anki's own data model. Agents can already inspect note types, templates, decks, and existing notes directly, so the extra taxonomy increases cognitive load, makes the API harder to generalize, and locks future domains into MCP-specific abstractions.

## What Changes

- **BREAKING** remove public `pack` / `starter pack` / `pack manifest` workflows from the MCP contract.
- **BREAKING** remove public `card type definition` / `card type catalog` workflows from the MCP contract.
- Add deck and note discovery tools so agents can inspect existing Anki structures and concrete example notes directly.
- Add note-centric authoring tools that create, preview, update, suspend/unsuspend, and delete notes using `modelName`, `deckName`, `fields`, and `tags`.
- Keep note type authoring and media import, but align them to official Anki concepts and direct note creation.
- Treat review as a state of a normal note and its cards, not as a first-class public taxonomy object.
- Update docs, contracts, tests, and real-Anki smoke flows to the official-concept model.

## Capabilities

### New Capabilities
- `deck-and-note-discovery`: discover decks, search notes, and inspect concrete example notes for agent learning.
- `note-centric-authoring`: create, preview, update, suspend/unsuspend, and delete notes directly from note types without pack or card-type registries.

### Modified Capabilities
- `anki-information-architecture`: redefine the public operating model around official Anki concepts only.
- `note-type-authoring`: make note types directly usable for note creation without secondary registry steps.
- `authoring-batch-operations`: replace batch draft flows with batch note-centric operations.
- `authoring-quality-gates`: update regression and smoke expectations to the note-centric workflow.
- `draft-lifecycle`: remove the public draft lifecycle contract in favor of review-pending notes as an internal implementation detail.
- `draft-inspection`: remove public draft inspection requirements.
- `mcp-safety-and-contract`: replace pack/card-type contracts with deck/note discovery and note-centric authoring contracts.
- `media-asset-ingestion`: anchor media insertion to note fields rather than draft-specific payloads.
- `domain-authoring-quality-gates`: rewrite domain smoke flows around note types and notes instead of pack installs.
- `cardtype-catalog`: remove the public card type catalog capability.
- `custom-cardtype-registry`: remove the public custom card type registry capability.
- `cardtype-definition-lifecycle`: remove the public custom card type definition lifecycle capability.
- `starter-pack-provisioning`: remove the public starter pack provisioning capability.
- `pack-manifest-registry`: remove the public custom pack manifest registry capability.
- `pack-manifest-application`: remove the public custom pack application capability.
- `pack-manifest-quality-gates`: remove the public pack-manifest quality gate capability.
- `domain-card-kits`: remove the public domain card-kit capability.

## Impact

- Affected MCP tools and contracts in [src/mcp/register.ts](/Users/daisukeyamashiki/Code/Projects/anki-mcps/src/mcp/register.ts), [src/contracts/schemas.ts](/Users/daisukeyamashiki/Code/Projects/anki-mcps/src/contracts/schemas.ts), and [src/contracts/toolContracts.ts](/Users/daisukeyamashiki/Code/Projects/anki-mcps/src/contracts/toolContracts.ts)
- Affected services in [src/services/draftService.ts](/Users/daisukeyamashiki/Code/Projects/anki-mcps/src/services/draftService.ts), [src/services/catalogService.ts](/Users/daisukeyamashiki/Code/Projects/anki-mcps/src/services/catalogService.ts), and pack-related services
- Breaking API change for MCP clients that currently call pack or card-type-definition tools
- Real-Anki smoke scripts, docs, and skills will need to be updated to the note-centric flow
