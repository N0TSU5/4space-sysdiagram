Foundry projects the Gold Parquet files into the `[Snow]` **Ontology**, without copying the data. Agents can then work with real-world objects and links instead of joining flat spatial tables.

## Steps

- **1. GCS Data Connection:** secure read-only path to `gs://gold@datalake4us`.
- **2. Virtual Tables:** schema definitions over the Parquet files, read in place.
- **3. `[Snow]` Ontology Graph:** object types and graph links in Ontology Manager.

New Gold data landing in the lake updates the Ontology. Agents read from it through Arrow 2.
