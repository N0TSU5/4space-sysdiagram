The Planner hands the Analyst a resolved query plan.

## Payload

**Transport:** ADK sub-agent hand-off.

**QueryPlan**

| Field | Type | Notes |
| --- | --- | --- |
| `question` | string | |
| `lsoa_codes` | list of string | Resolved places |
| `slots` | list of string | Such as `weekday-14`, `weekday-15` |
| `steps` | list of QueryStep | |

**QueryStep**

| Field | Type | Notes |
| --- | --- | --- |
| `kind` | `ontology` \| `range_scan` | |
| `intent` | string | |
| `depends_on` | list of string | |
