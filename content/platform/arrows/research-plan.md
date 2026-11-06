The Planner hands the Analyst an ordered list of steps.

## Payload

**Transport:** ADK sub-agent hand-off.

**ResearchPlan**

| Field | Type | Notes |
| --- | --- | --- |
| `question` | string | |
| `steps` | list of Step | 2 to 8 |

**Step**

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | |
| `kind` | `gold_query` \| `ontology` \| `scenario` | |
| `intent` | string | What the step should find |
| `depends_on` | list of string | Step IDs |
