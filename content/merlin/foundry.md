Foundry turns flat Gold tables into the **Ontology**, which converts spatial metrics into real-world concepts such as `[Snow] Area`, `[Snow] Candidate Site` and `[Snow] Footfall`, linked by explicit relationships.

## Steps

- **1. Data Connection:** secure read-only connection to `gold@datalake4us`.
- **2. Pipeline Builder transforms:** register Virtual Tables and cast geometries to geo types.
- **3. Ontology object mapping:** define 9 Object Types and 10 Link Types.
- **4. Compute Module:** deploy the `querySites` engine as a container.
- **5. Workshop and AIP Logic:** expose planner actions and plain-text site rationales.
