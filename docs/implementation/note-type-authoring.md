# Note Type Authoring

Use note type authoring when the target field structure or template design does not exist yet.

## Recommended sequence

1. `list_note_types`
2. `get_note_type_schema` for related models
3. `upsert_note_type(dryRun=true)`
4. Review the planned operations
5. `upsert_note_type(dryRun=false)`
6. `ensure_deck`
7. `add_note`

No secondary registration step is required after `upsert_note_type`.

## Safe update boundary

Allowed in place:

- add fields
- add templates
- update template HTML
- update CSS

Do not do in place:

- remove or rename fields
- remove or rename templates
- switch cloze and non-cloze mode

For destructive changes, create a new versioned `modelName`.

## Example

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
    "css": ".card { background: #11161d; color: #edf3fb; }"
  }
}
```
