A **one-way data projection path** that converts non-identifiable Gold Parquet tables into live graph objects.

The Merlin to Foundry pipeline exists to turn aggregated analytical tables into an interactive, graph-structured business domain: the **Ontology**. Without it, AI agents and planners would have to write complex SQL joins across flat spatial tables for every answer.

## Steps

- **Zero-copy Data Connection:** Foundry establishes a secure read-only Data Connection (`fourthspace_adls` / GCS) pointing directly to the Gold Parquet directory in Cloud Storage (`gs://gold@datalake4us`).
- **Virtual Tables:** Foundry registers Virtual Tables over the Gold Parquet files, so data is read in place without duplicate storage copies.
- **Object and link mapping:** Ontology Manager maps these tables into 9 core `[Snow]` Object Types and 10 Link Types.
- **Automated graph updates:** When Orion commits a new snapshot to Cloud Storage, the Virtual Tables refresh automatically and update properties and links across the Ontology graph.

## Example object mappings

- **`[Snow] Area`:** Maps from `gold/area_need` (Census demographics and IMD 2025 deprivation ranks).
- **`[Snow] Space-Time Cell`:** Maps H3 resolution 9 hexagons linked to specific time slots.
- **`[Snow] Footfall`:** Stores k-anonymized population and sample device counts (at least 5).
- **`[Snow] Candidate Site`:** Maps physical locations, parking availability and power hookups.
