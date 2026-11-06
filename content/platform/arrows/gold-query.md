The Analyst reads the Golden Datasets with typed, read-only queries.

## Payload

**Transport:** BigQuery job on the Project's read-only BigLake dataset, with a bytes-billed cap.

**GoldQuery**

| Field | Type | Notes |
| --- | --- | --- |
| `table` | string | |
| `cells` | list of string, optional | H3 cells |
| `area_id` | string, optional | Instead of cells |
| `time_range` | start and end | |
| `metrics` | list of string | |
| `aggregate` | `sum` \| `mean` \| `p50` \| `p90` \| `count` | |
| `group_by` | list of string | Such as `h3_cell` |
| `limit` | integer | |

**Reply: ResultRef**

| Field | Type | Notes |
| --- | --- | --- |
| `rows` | integer | |
| `preview` | list of rows | First 20 |
| `data_ref` | string | Full result |
