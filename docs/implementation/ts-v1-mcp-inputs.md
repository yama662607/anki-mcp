# TypeScript v1: MCP Input Examples

Current note types:

- `ts.v1.concept`
- `ts.v1.output`
- `ts.v1.debug`

Recommended flow:

1. `upsert_note_type` when the schema is missing
2. `ensure_deck`
3. `add_note`
4. `open_note_preview`
5. based on feedback: `update_note`, `delete_note`, or `set_note_cards_suspended(suspended=false)`

## 1) Bootstrap `ts.v1.concept`

### `upsert_note_type`

```json
{
  "profileId": "local-main",
  "modelName": "ts.v1.concept",
  "dryRun": false,
  "fields": [
    { "name": "Prompt" },
    { "name": "Answer" },
    { "name": "DetailedExplanation" },
    { "name": "Contrast" },
    { "name": "Example" }
  ],
  "templates": [
    {
      "name": "Card 1",
      "front": "<div class=\"ts-card ts-concept\"><div class=\"badge\">概念</div><div class=\"prompt\">{{Prompt}}</div>{{#Contrast}}<div class=\"contrast\">比較: {{Contrast}}</div>{{/Contrast}}</div>",
      "back": "{{FrontSide}}<hr id=\"answer\" /><div class=\"answer-block\"><div class=\"section-label\">要点</div><div class=\"answer\">{{Answer}}</div></div>{{#DetailedExplanation}}<div class=\"explainer\"><div class=\"section-label\">解説</div><div>{{DetailedExplanation}}</div></div>{{/DetailedExplanation}}{{#Example}}<div class=\"example-block\"><div class=\"section-label\">例</div><pre class=\"code\"><code>{{Example}}</code></pre></div>{{/Example}}"
    }
  ],
  "css": "<see docs/implementation/ts-v1-card-pack.md for the applied dark-theme CSS>"
}
```

### `ensure_deck`

```json
{
  "profileId": "local-main",
  "deckName": "Programming::TypeScript::Concept"
}
```

## 2) Concept note

### `add_note`

```json
{
  "profileId": "local-main",
  "clientRequestId": "ts-ja-concept-001",
  "deckName": "Programming::TypeScript::Concept",
  "modelName": "ts.v1.concept",
  "tags": ["programming", "typescript", "ts-concept", "starter"],
  "fields": {
    "Prompt": "any と unknown の実用上の違いは何ですか？",
    "Answer": "any は型チェックを外し、unknown は narrowing を要求します。",
    "DetailedExplanation": "any を使うと、その値に対する型検査がほぼ無効になり、誤ったプロパティアクセスやメソッド呼び出しも通りやすくなります。unknown は「型がまだ分からない値」として受け取り、実際に使う前に typeof や if 文で型を絞り込む必要があります。そのため、外部入力や一時的に型不明な値を扱うときは unknown の方が安全です。",
    "Contrast": "any と unknown",
    "Example": "let a: any = \"x\";\na.toFixed(); // コンパイルエラーにならない\n\nlet u: unknown = \"x\";\n// u.toFixed(); // コンパイルエラー\nif (typeof u === \"string\") {\n  u.toUpperCase();\n}"
  }
}
```

## 3) Output note

```json
{
  "profileId": "local-main",
  "clientRequestId": "ts-ja-output-001",
  "deckName": "Programming::TypeScript::Output",
  "modelName": "ts.v1.output",
  "tags": ["programming", "typescript", "ts-output", "starter"],
  "fields": {
    "Code": "const x: string | number = Math.random() > 0.5 ? \"hi\" : 42;\nif (typeof x === \"string\") {\n  console.log(x.toUpperCase());\n} else {\n  console.log(x.toFixed(1));\n}",
    "Question": "このコードでは何が出力されますか？",
    "Expected": "\"HI\" または \"42.0\"",
    "Reason": "x の型は最初は string | number ですが、if (typeof x === \"string\") に入るとその中では x を string と確定して扱えます。これが narrowing です。else 側では number と確定するので toFixed(1) を安全に呼び出せます。"
  }
}
```

## 4) Debug note

```json
{
  "profileId": "local-main",
  "clientRequestId": "ts-ja-debug-001",
  "deckName": "Programming::TypeScript::Debug",
  "modelName": "ts.v1.debug",
  "tags": ["programming", "typescript", "ts-debug", "starter"],
  "fields": {
    "BuggyCode": "type User = { name: string };\nfunction greet(user: User | null) {\n  return \"Hi \" + user.name;\n}",
    "Symptom": "Object is possibly null.",
    "Fix": "type User = { name: string };\nfunction greet(user: User | null) {\n  if (!user) return \"Hi guest\";\n  return \"Hi \" + user.name;\n}",
    "RootCause": "union 型に null が含まれているのに、絞り込みなしで user.name にアクセスしているためです。",
    "Rule": "null を含む型では、プロパティアクセス前に必ず絞り込みます。"
  }
}
```

## Review after add

After `add_note`, call:

```json
{
  "profileId": "local-main",
  "noteId": 1234567890
}
```

Then either:

- fix it with `update_note`
- remove it with `delete_note`
- keep it with `set_note_cards_suspended` and `suspended: false`
