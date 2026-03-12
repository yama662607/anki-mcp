# Custom Pack Manifests

Custom pack manifests let an agent invent a new reusable domain pack without editing MCP source code.

## Core flow

1. `upsert_pack_manifest`
2. `list_pack_manifests` or `get_pack_manifest`
3. `apply_starter_pack` with `dryRun=true`
4. `apply_starter_pack` with `dryRun=false`
5. `create_draft`
6. `open_draft_preview`
7. `commit_draft` or `discard_draft`

The pack manifest only provisions note types, card type definitions, deck roots, and ownership metadata. It does not create learning notes by itself.

## Minimal example

This example proves the flow is generic by using a non-built-in domain.

### 1. Register a reusable pack

```json
{
  "profileId": "local-main",
  "manifest": {
    "packId": "custom.lang.ja-core",
    "label": "Japanese Core",
    "version": "2026-03-12.v1",
    "domains": ["japanese"],
    "supportedOptions": [
      {
        "name": "deckRoot",
        "type": "string",
        "required": false,
        "description": "Top-level deck root for this domain",
        "defaultValue": "Languages::Japanese"
      }
    ],
    "deckRoots": ["Languages::Japanese"],
    "tagTemplates": {
      "language.v1.japanese-vocab": ["domain::japanese", "skill::vocabulary"]
    },
    "noteTypes": [
      {
        "modelName": "language.v1.japanese-vocab",
        "fields": [
          { "name": "Expression" },
          { "name": "Meaning" }
        ],
        "templates": [
          {
            "name": "Card 1",
            "front": "<div>{{Expression}}</div>",
            "back": "{{FrontSide}}<hr id=\"answer\"><div>{{Meaning}}</div>"
          }
        ],
        "css": ".card { color: white; background: black; }"
      }
    ],
    "cardTypes": [
      {
        "cardTypeId": "language.v1.japanese-vocab",
        "label": "Japanese Vocabulary",
        "modelName": "language.v1.japanese-vocab",
        "defaultDeck": "Languages::Japanese::Vocabulary",
        "source": "custom",
        "requiredFields": ["Expression", "Meaning"],
        "optionalFields": [],
        "renderIntent": "recognition",
        "allowedHtmlPolicy": "safe_inline_html",
        "fields": [
          { "name": "Expression", "required": true, "type": "text", "allowedHtmlPolicy": "safe_inline_html" },
          { "name": "Meaning", "required": true, "type": "markdown", "allowedHtmlPolicy": "safe_inline_html", "multiline": true }
        ]
      }
    ]
  }
}
```

### 2. Dry-run the pack

```json
{
  "profileId": "local-main",
  "packId": "custom.lang.ja-core",
  "dryRun": true
}
```

Expected result:
- note type operations are classified as `create`, `update`, or `unchanged`
- card type definition operations are classified as `create`, `update`, or `unchanged`
- no Anki notes are created

### 3. Apply the pack

```json
{
  "profileId": "local-main",
  "packId": "custom.lang.ja-core",
  "dryRun": false
}
```

### 4. Create a learning draft from the new card type

```json
{
  "profileId": "local-main",
  "clientRequestId": "ja-vocab-001",
  "cardTypeId": "language.v1.japanese-vocab",
  "fields": {
    "Expression": "丈夫",
    "Meaning": "strong; durable"
  },
  "tags": ["domain::japanese", "skill::vocabulary"]
}
```

### 5. Review in Anki

```json
{
  "profileId": "local-main",
  "draftId": "<draft-id>"
}
```

Use `open_draft_preview`, inspect the preview in Anki, then decide:
- keep it with `commit_draft`
- remove it with `discard_draft`

## Ownership rules

Custom packs are safe because the server records which resources each pack owns.

- ownership is stored per `(profileId, packId, resourceType, resourceId)`
- managed resources are:
  - note types
  - custom card type definitions
- a custom pack may:
  - create unmanaged resources
  - reapply updates to resources it already owns
  - leave owned resources unchanged
- a custom pack may not:
  - override a built-in `packId`
  - mutate an unmanaged resource when that mutation would be an `update`
  - mutate a resource owned by another custom pack

Conflict behavior:
- unmanaged incompatible update -> `CONFLICT`
- other-pack takeover -> `CONFLICT`
- invalid manifest or option shape -> `INVALID_ARGUMENT`

## Rollback playbook

### Wrong manifest before apply

1. Fix the manifest.
2. Run `upsert_pack_manifest` again with the same `packId`.
3. Re-run `apply_starter_pack` with `dryRun=true`.

### Wrong pack applied, but no learning cards kept

1. Register the corrected manifest under the same `packId` if the resource identities should stay the same.
2. Re-run `apply_starter_pack` with `dryRun=false`.
3. Discard any test drafts you created during review.

### Pack should be retired

1. Call `deprecate_pack_manifest`.
2. The pack disappears from active starter-pack discovery.
3. Existing note types, card type definitions, drafts, and committed notes are not deleted automatically.

### Ownership conflict during apply

1. Stop. Do not force the update.
2. Inspect the active owner with `list_pack_manifests` and `get_pack_manifest`.
3. Either:
   - reuse the existing owner pack and update it, or
   - choose new note type and card type identifiers for the new pack

## Recommended agent behavior

- invent new reusable domains as custom packs first
- keep resource identifiers stable once notes exist
- preview a real draft before committing any learning content
- prefer a new `packId` when semantics change substantially
