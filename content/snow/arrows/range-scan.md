The Analyst reads Gold tables with `spacetime_key` range scans that BigQuery prunes by Parquet row-group metadata.

## Payload

**Transport:** BigQuery job on the read-only BigLake dataset, bytes-billed cap.

**RangeScan**

| Field | Type | Notes |
| --- | --- | --- |
| `table` | string | Such as `footfall` |
| `ranges` | list of `[k_lo, k_hi]` | Built by `SpacetimeCodec` |
| `columns` | list of string | |
| `aggregate` | string, optional | Such as `avg(est_people)` |

**Reply: ResultRef**

| Field | Type | Notes |
| --- | --- | --- |
| `rows` | integer | |
| `preview` | list of rows | First 20 |
| `data_ref` | string | Full result |
