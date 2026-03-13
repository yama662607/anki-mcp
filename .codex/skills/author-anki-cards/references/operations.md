# Card Operations

## 1. Add one review-pending note

Example user request:

- "TypeScript の `any` と `unknown` の違いについて 1 枚追加してください。"

Recommended sequence:

1. `get_note_type_schema`
2. `ensure_deck`
3. `add_note`
4. `open_note_preview`
5. Wait for explicit approval
6. `update_note`, `delete_note`, or `set_note_cards_suspended(suspended=false)`

Example payload:

```json
{
  "name": "add_note",
  "arguments": {
    "profileId": "your-profile",
    "clientRequestId": "ts-concept-any-vs-unknown-001",
    "deckName": "Programming::TypeScript::Concept",
    "modelName": "ts.v1.concept",
    "fields": {
      "Prompt": "`any` と `unknown` の違いは何ですか？",
      "Answer": "`unknown` は利用前に型の絞り込みが必要です。",
      "DetailedExplanation": "`any` は型検査を迂回しますが、`unknown` は安全側に倒れます。"
    },
    "tags": ["language::typescript", "card::concept"]
  }
}
```

## 2. Revise after user feedback

Use when the user says "ここを変更してください" after preview.

Pattern:

1. `get_notes`
2. build corrected fields or tags
3. call `update_note` with the current `expectedModTimestamp`
4. preview again if visual confirmation is needed
5. only after approval, `set_note_cards_suspended(suspended=false)`

Example correction payload:

```json
{
  "name": "update_note",
  "arguments": {
    "profileId": "your-profile",
    "noteId": 1234567890,
    "expectedModTimestamp": 1730000000,
    "fields": {
      "Answer": "`unknown` は安全で、使う前に絞り込みが必要です。"
    },
    "tags": ["language::typescript", "reviewed"]
  }
}
```

## 3. Add notes in batch

Example user request:

- "TypeScript output prediction cardsを3枚追加してください。"

Example batch payload:

```json
{
  "name": "add_notes_batch",
  "arguments": {
    "profileId": "your-profile",
    "items": [
      {
        "itemId": "ts-output-1",
        "clientRequestId": "ts-output-1-v1",
        "deckName": "Programming::TypeScript::Output",
        "modelName": "ts.v1.output",
        "fields": {
          "Code": "const x: string | number = 1;\nif (typeof x === 'number') console.log(x + 1);",
          "Expected": "2"
        }
      },
      {
        "itemId": "ts-output-2",
        "clientRequestId": "ts-output-2-v1",
        "deckName": "Programming::TypeScript::Output",
        "modelName": "ts.v1.output",
        "fields": {
          "Code": "console.log(typeof null);",
          "Expected": "object"
        }
      }
    ]
  }
}
```

Batch delete example:

```json
{
  "name": "delete_notes_batch",
  "arguments": {
    "profileId": "your-profile",
    "items": [
      { "itemId": "ts-output-1", "noteId": 1234567890 },
      { "itemId": "ts-output-2", "noteId": 1234567891 }
    ]
  }
}
```

## 4. Recover after interruption

Sequence:

1. `search_notes`
2. `get_notes`
3. `open_note_preview` if visual confirmation is still needed
4. `update_note`, `delete_note`, or `set_note_cards_suspended`
