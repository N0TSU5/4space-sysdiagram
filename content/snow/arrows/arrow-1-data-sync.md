The path from the Gold Parquet files in the lakehouse into the `[Snow]` Ontology Graph. Foundry reads the files in place, with no duplicate copies, and updates as new Gold data arrives.

## Payload

**Transport:** Foundry `gs_gold_connection` reading Iceberg metadata and Parquet files.

**IcebergSnapshot**

| Field | Type | Notes |
| --- | --- | --- |
| `table` | string | |
| `metadata_location` | string | Current Iceberg metadata file |
| `snapshot_id` | integer | |
| `schema` | list of columns | Name and type |
