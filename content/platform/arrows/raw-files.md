The pipeline reads the Project's raw datasets from the company bucket. This is the only arrow that carries raw data, and it stays inside Orion.

## Payload

**Transport:** Spark reading `gs://orion-raw-<company>/datasets/...`.

**RawFiles**

| Field | Type | Notes |
| --- | --- | --- |
| `dataset` | string | |
| `files` | list of string | From the dataset manifest |
| `format` | `parquet` \| `csv` \| `json` | |
| `schema` | list of ColumnType | Checked against the profile |
