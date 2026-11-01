Prepares Gold data for use in the Ontology.

- Registers Virtual Tables over the Gold Parquet files, with no duplicate storage
- Casts GeoJSON string geometries into native `Geoshape` and `Geopoint` types
