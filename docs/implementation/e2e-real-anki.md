# Real Anki E2E

This project now includes a semi-automated E2E script for real Anki.

## Preconditions

- Anki is running
- AnkiConnect is enabled
- the optional `anki-connect-extension` add-on is installed if you want `guiPreviewNote`
- project is built with `npm run build`

## Start run

```bash
ANKI_E2E_PROFILE_ID="your-profile" npm run e2e:anki
```

What it does:
- upserts a minimal `e2e.v1.basic` note type
- upserts a matching custom card type definition
- creates a draft
- opens Anki preview
- saves the draft state to `.data/real-anki-e2e-state.json`

## Batch smoke run

```bash
ANKI_E2E_PROFILE_ID="your-profile" ANKI_E2E_MODE=batch npm run e2e:anki
```

What it does:
- upserts the same minimal `e2e.v1.basic` note type and card type definition
- creates two drafts with `create_drafts_batch`
- opens preview for the first draft
- saves batch state to `.data/real-anki-e2e-state.json`

## Finalize after visual review

Commit:

```bash
ANKI_E2E_PROFILE_ID="your-profile" ANKI_E2E_SCENARIO=finalize ANKI_E2E_FINALIZE=commit npm run e2e:anki
```

Discard:

```bash
ANKI_E2E_PROFILE_ID="your-profile" ANKI_E2E_SCENARIO=finalize ANKI_E2E_FINALIZE=discard npm run e2e:anki
```

Batch finalize:

```bash
ANKI_E2E_PROFILE_ID="your-profile" ANKI_E2E_MODE=batch ANKI_E2E_SCENARIO=finalize ANKI_E2E_FINALIZE=discard npm run e2e:anki
```

## Why this is semi-automated

- the script automates setup, draft, and finalization
- visual inspection of the Anki preview remains manual
- final approval is explicit through the second command

## Domain pack smoke matrix

The automated MCP test suite now covers these pack-level smoke flows with the in-memory gateway:

- English listening:
  - `apply_starter_pack(english-core)`
  - `import_media_asset`
  - `create_draft`
  - `open_draft_preview`
  - `discard_draft`
- Programming:
  - `apply_starter_pack(programming-core, languages=["typescript"])`
  - `create_draft`
  - `open_draft_preview`
  - `discard_draft`
- Fundamentals:
  - `apply_starter_pack(fundamentals-core)`
  - `create_draft`
  - `open_draft_preview`
  - `discard_draft`

Use the real-Anki script when you want to confirm the same workflow against a live Anki profile after visual review.
