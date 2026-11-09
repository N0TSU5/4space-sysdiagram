The Analyst's answer, with evidence, goes to the Verifier before anyone sees it.

## Payload

**Transport:** ADK sub-agent hand-off.

**DraftAnswer**

| Field | Type | Notes |
| --- | --- | --- |
| `text` | string | Cites evidence IDs |
| `sites` | list of SiteScore | Ranked |
| `layers` | list of MapLayer | |
| `evidence` | list of Evidence | Query, summary, result reference |

**SiteScore**

| Field | Type | Notes |
| --- | --- | --- |
| `site_id` | string | |
| `window_id` | string | Time window |
| `norm_reach` | float | 0 to 1 |
| `norm_need` | float | 0 to 1 |
| `score` | float | 0.6 reach + 0.4 need |
