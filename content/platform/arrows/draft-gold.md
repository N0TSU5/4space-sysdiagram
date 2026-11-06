The Golden Dataset architect sends its design and generated code to the Verification agent.

## Payload

**Transport:** ADK sub-agent hand-off. Code is stored in the Plan store and passed by reference.

**GoldDraft**

| Field | Type | Notes |
| --- | --- | --- |
| `plan_version` | integer | |
| `spec` | GoldSpec | Tables, columns, H3 resolution, time bucket |
| `code` | CodeBundle | See below |
| `rationale` | string | Why this design, and any new code |
| `citations` | list of string | Regulation passage IDs |

**CodeBundle**

| Field | Type | Notes |
| --- | --- | --- |
| `uri` | string | Plan store path |
| `files` | list of string | |
| `entrypoint` | string | |
| `blocks_used` | list of string | Building blocks and versions |
| `sha256` | string | |
