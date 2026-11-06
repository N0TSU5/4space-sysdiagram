The profiler reads only file metadata from the raw bucket: Parquet footers, CSV headers and row counts.

## Payload

**Transport:** DuckDB reading from Cloud Storage, inside Orion.

**FileMetadata**

| Field | Type | Notes |
| --- | --- | --- |
| `object` | string | Storage path |
| `format` | `parquet` \| `csv` \| `json` | |
| `row_count` | integer | From the footer or a count |
| `columns` | list of ColumnType | Name, type, nullable |
