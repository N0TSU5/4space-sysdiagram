The only data from Orion that model training sees. It's anonymised inside Orion before it's written to Merlin's training bucket: direct identifiers removed, IDs hashed, location and time coarsened, groups smaller than k suppressed.

## Payload

**Transport:** Parquet files written to `gs://merlin-projects/<project>/training/<plan_version>/`, plus a manifest.

**TrainingRow**

| Field | Type | Notes |
| --- | --- | --- |
| `entity_key` | string | HMAC hash, never a raw ID |
| `h3_cell` | string | Coarsened resolution |
| `time_bucket` | timestamp | Hour or day |
| `features` | columns | As listed in the ModelSpec |
| `target` | number | What the model predicts |
| `split` | `train` \| `holdout` | |

**TrainingManifest**

| Field | Type | Notes |
| --- | --- | --- |
| `files` | list of string | |
| `row_count` | integer | |
| `sha256` | string | Recorded with the model |
| `k_min_observed` | integer | At least the rule set's `min_k` |
| `anonymisation_report` | object | What was dropped, hashed and coarsened |
