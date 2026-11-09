Merlin is FourthSpace's central data engine, query executor and ontology layer.

It receives only Gold datasets from Orion, projects them into the Foundry Ontology, and gives the AI agents structured objects and fast range scans to reason over.

## Data flow

```mermaid
flowchart LR
  PG["Orion privacy gate"] -->|"Gold Parquet"| LH[("gold@datalake4us")]
  LH -->|"zero-copy"| F["Foundry Snow Ontology"]
  LH -->|"BigLake range scans"| AG["Agents"]
  F -->|"read queries"| AG
  AG <-->|"questions and answers"| AO["Agora"]
```

## Software components

- FourthSpace GCP project `merlin-snow`, inside a VPC Service Controls perimeter.
- **Cloud Storage** with **Apache Iceberg** and **BigLake metastore**, **BigQuery** BigLake tables.
- **Palantir Foundry** Ontology.
- **Vertex AI Agent Engine**, **Gemini 4 Argon**, **Model Armor**.

## Low-level design

```mermaid
classDiagram
  class snow_contracts {
    <<package>>
    GoldTables
    OntologyTypes
    Answer
  }
  class snow_agents {
    <<package>>
    planner
    analyst
    verifier
  }
  class snow_spacetime {
    <<package>>
    SpacetimeCodec
  }
  snow_agents ..> snow_contracts
  snow_agents ..> snow_spacetime
```

- The Analyst uses the same `SpacetimeCodec` as Orion's P3 stage, so keys always match.
