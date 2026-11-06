Once the Golden Datasets are stored, Foundry generates the Ontology Graph from the Plan's design. Foundry reads the tables in place, with no copy, and updates when new Golden Data arrives.

## Payload

**Transport:** Foundry's GCS Data Connection reading Iceberg metadata and Parquet files.

**IcebergSnapshot**

| Field | Type | Notes |
| --- | --- | --- |
| `table` | string | |
| `metadata_location` | string | Current Iceberg metadata file |
| `snapshot_id` | integer | Recorded on each sync |
| `schema` | list of ColumnType | |
