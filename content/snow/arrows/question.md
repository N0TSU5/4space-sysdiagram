The planner's question goes in; progress and the answer stream back.

## Payload

**Transport:** HTTPS through Agora's server; replies as server-sent events.

**Question**

| Field | Type | Notes |
| --- | --- | --- |
| `thread_id` | string | Agent Engine session |
| `text` | string | Such as "weekday afternoons in Barking & Dagenham" |
| `user` | string | From IAP |

**StreamEvent** (reply)

| Field | Type | Notes |
| --- | --- | --- |
| `type` | `step` \| `token` \| `clarify` \| `done` | |
| `agent` | `planner` \| `analyst` \| `verifier` | |
| `text` | string, optional | |
| `answer_id` | string, optional | On `done` |
