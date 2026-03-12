# Domain Starter Packs

This phase adds a thin bootstrap layer on top of the existing draft workflow.

For agent-authored reusable packs that are not built into the MCP source, see [custom-pack-manifests.md](/Users/daisukeyamashiki/Code/Projects/anki-mcps/docs/implementation/custom-pack-manifests.md).

## Canonical bootstrap flow

1. `list_starter_packs`
2. `apply_starter_pack` with `dryRun=true`
3. `apply_starter_pack` with `dryRun=false`
4. `create_draft`
5. `open_draft_preview`
6. `commit_draft` or `discard_draft`

For English listening, insert one extra step before `create_draft`:

1. `import_media_asset`
2. use `asset.fieldValue` in the `Audio` field

## Starter packs

- `english-core`
  - `language.v1.english-vocab-recognition`
  - `language.v1.english-vocab-production`
  - `language.v1.english-listening-comprehension`
- `programming-core`
  - `programming.v1.<language>-concept`
  - `programming.v1.<language>-compare`
  - `programming.v1.<language>-output`
  - `programming.v1.<language>-debug`
  - `programming.v1.<language>-build`
- `fundamentals-core`
  - `fundamentals.v1.concept`
  - `fundamentals.v1.compare`
  - `fundamentals.v1.cloze`

## Tag conventions

- English vocabulary recognition:
  - `domain::english`
  - `skill::vocabulary`
  - `direction::recognition`
- English vocabulary production:
  - `domain::english`
  - `skill::vocabulary`
  - `direction::production`
- English listening:
  - `domain::english`
  - `skill::listening`
- Programming:
  - `domain::programming`
  - `language::<language>`
  - `skill::<interaction>`
- Fundamentals:
  - `domain::fundamentals`
  - `skill::<interaction>`

## Example payloads

### English vocabulary recognition

```json
{
  "profileId": "local-main",
  "clientRequestId": "en-vocab-rec-001",
  "cardTypeId": "language.v1.english-vocab-recognition",
  "fields": {
    "Expression": "robust",
    "Meaning": "頑丈な。設計や議論がしっかりしていることも表す。",
    "Example": "We need a robust backup strategy."
  },
  "tags": ["domain::english", "skill::vocabulary", "direction::recognition"]
}
```

### English listening

First import the audio:

```json
{
  "profileId": "local-main",
  "localPath": "/absolute/path/to/clip.mp3"
}
```

Then use the returned `asset.fieldValue`:

```json
{
  "profileId": "local-main",
  "clientRequestId": "en-listen-001",
  "cardTypeId": "language.v1.english-listening-comprehension",
  "fields": {
    "Audio": "[sound:mcp-audio-1234567890abcdef.mp3]",
    "Prompt": "何が聞こえますか？",
    "Answer": "I need to catch the next train.",
    "Transcript": "I need to catch the next train."
  },
  "tags": ["domain::english", "skill::listening"]
}
```

### Programming

```json
{
  "profileId": "local-main",
  "clientRequestId": "ts-output-001",
  "cardTypeId": "programming.v1.typescript-output",
  "fields": {
    "Code": "const answer = 40 + 2;\\nconsole.log(answer);",
    "Question": "このコードは何を出力しますか？",
    "Expected": "42",
    "Reason": "数値の加算結果がそのまま出力されます。"
  },
  "tags": ["domain::programming", "language::typescript", "skill::output"]
}
```

### Fundamentals

```json
{
  "profileId": "local-main",
  "clientRequestId": "fund-cloze-001",
  "cardTypeId": "fundamentals.v1.cloze",
  "fields": {
    "Text": "TCP uses {{c1::three-way handshake}} to establish a connection.",
    "Extra": "SYN -> SYN/ACK -> ACK"
  },
  "tags": ["domain::fundamentals", "skill::cloze"]
}
```
