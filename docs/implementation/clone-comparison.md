# Clone Comparison Summary

Compared reference implementations in `clones/` against the current note-centric target criteria:

| Project | Safety | Recovery | Testability | Observability | Total |
|---|---:|---:|---:|---:|---:|
| `anki-connect-mcp` | 2 | 1 | 2 | 1 | 6 |
| `anki-mcp` | 3 | 2 | 2 | 2 | 9 |
| `anki-mcp-server` | 3 | 2 | 3 | 2 | 10 |
| `ankimcp-anki-mcp-server` | 3 | 3 | 3 | 3 | 12 |
| **this project target (v1)** | **4** | **4** | **4** | **4** | **16** |

Rationale for target advantage:
- official-concept public API with direct note operations
- preview on the real Anki note instead of separate renderer state
- deterministic note update conflict checks
- write-time explicit profile requirement
- frozen v1 schema registry and contract resources
