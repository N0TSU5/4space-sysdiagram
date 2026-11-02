Palantir Foundry holds each Project's Ontology Graph. Foundry reads the Golden Datasets in place, with no copy, and the Ontology is generated automatically once they're stored.

## Steps

- **GCS Data Connection:** points at the Project's Golden Datasets.
- **Virtual Tables:** expose them to Foundry without copying.
- **Ontology Graph:** object types and links from the Plan, backed by the virtual tables.
