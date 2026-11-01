The path from the Gold Parquet files in the lakehouse into the `[Snow]` Ontology Graph. Foundry reads the files in place, with no duplicate copies.

## Steps

- **GCS Data Connection:** `gs_gold_connection` gives secure, read-only access to `gs://gold@datalake4us`.
- **Virtual Tables:** schema definitions are registered over the Parquet files, which are read in place.
- **Ontology mapping:** Ontology Manager maps the tables to `[Snow]` object types and graph links.
- **Ontology updates:** as new Gold data comes into the lake, updates are written to the Ontology's objects and links.
