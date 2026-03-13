# Note Type Operations

## 1. Create or update a note type

Use when the required field structure does not exist yet.

Example user request:

- "TypeScript debug 用に BuggyCode, Fix, RootCause を持つノートタイプを作ってください。"

Example dry-run payload:

```json
{
  "name": "upsert_note_type",
  "arguments": {
    "profileId": "your-profile",
    "modelName": "ts.v1.debug",
    "dryRun": true,
    "fields": [
      { "name": "BuggyCode" },
      { "name": "Fix" },
      { "name": "RootCause" }
    ],
    "templates": [
      {
        "name": "Card 1",
        "front": "<pre>{{BuggyCode}}</pre>",
        "back": "{{FrontSide}}<hr id=\"answer\"><div>{{Fix}}</div>{{#RootCause}}<div>{{RootCause}}</div>{{/RootCause}}"
      }
    ],
    "css": ".card { background: #10151d; color: #edf3fb; }"
  }
}
```

Apply the same payload with `dryRun=false` only after inspecting `operations`.

## 2. Verify that the note type is directly usable

After the note type is applied, use it immediately through the public note workflow.

Example sequence:

1. `ensure_deck`
2. `add_note`
3. `open_note_preview`

Example payload:

```json
{
  "name": "add_note",
  "arguments": {
    "profileId": "your-profile",
    "deckName": "Programming::TypeScript::Debug",
    "modelName": "ts.v1.debug",
    "fields": {
      "BuggyCode": "const value: any = 1;",
      "Fix": "const value: unknown = 1;",
      "RootCause": "`any` が型検査を無効化するためです。"
    }
  }
}
```

## 3. Safe update boundary

Allowed:

- add fields
- add templates
- update template HTML
- update CSS

Do not do in place:

- remove fields
- rename fields
- remove templates
- rename templates
- switch cloze and non-cloze mode

For those cases, create a new versioned model instead.
