The user asks a question about the decision in the chat. The Planner agent receives it and streams progress and the answer back.

## Payload

**Transport:** HTTPS to Agent Engine through Agora's server, with the user's ID token. Replies stream as server-sent events.

**Question**

| Field | Type | Notes |
| --- | --- | --- |
| `project_id` | uuid | |
| `thread_id` | string | Agent Engine session |
| `text` | string | |
| `context` | object, optional | Such as a selected map cell |

**StreamEvent** (reply)

| Field | Type | Notes |
| --- | --- | --- |
| `type` | `step` \| `token` \| `clarify` \| `done` | |
| `step` | string, optional | Such as "Querying footfall" |
| `text` | string, optional | |
| `report_id` | string, optional | On `done` |
