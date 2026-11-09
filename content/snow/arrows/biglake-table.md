BigQuery reads the Gold Iceberg tables in place through BigLake. No data is copied into BigQuery storage.

## Payload

**Transport:** BigLake Iceberg tables, catalogued in BigLake metastore, read through a BigQuery Cloud resource connection.

**BigLakeTable**

| Field | Type | Notes |
| --- | --- | --- |
| `dataset` | string | `snow_gold` |
| `table` | string | Same name as the Gold table |
| `metadata_location` | string | Current Iceberg snapshot |
| `connection` | string | Cloud resource connection with read access to the Gold bucket |
| `schema` | list of columns | Name and type |
