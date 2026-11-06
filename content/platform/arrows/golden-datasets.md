The pipeline writes the Project's Golden Datasets into Merlin as Apache Iceberg tables. Only these derived, compliant tables leave Orion.

## Payload

**Transport:** Iceberg commits from Spark through the BigLake metastore catalog.

**IcebergCommit**

| Field | Type | Notes |
| --- | --- | --- |
| `table` | string | `<project>.gold.<table>` |
| `snapshot_id` | integer | |
| `added_files` | integer | |
| `row_count` | integer | |
| `properties` | map | Plan version, run ID, anonymisation level |

**GoldRow** (every table)

| Field | Type | Notes |
| --- | --- | --- |
| `h3_cell` | string | |
| `h3_res` | integer | |
| `time_bucket` | timestamp | |
| metric columns | number | As in the GoldSpec |
