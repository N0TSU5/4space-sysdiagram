The Planner and Analyst agents run read queries directly against `[Snow]` Ontology objects and follow graph links to evaluate site suitability, without raw SQL table scans.

## Steps

- **Read queries:** the Planner and Analyst agents query `[Snow]` objects directly.
- **Property inspection:** agents check properties such as `[Snow] Candidate Site.has_power` and `[Snow] Area.imd_decile`.
- **Link traversal:** agents follow graph links, such as `[Snow] Candidate Site` to `[Snow] Area`.
