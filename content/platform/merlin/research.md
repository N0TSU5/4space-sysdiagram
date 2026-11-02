The agents that answer users' questions about a Project. They work in a ReAct loop on Vertex AI Agent Engine, and only ever read the Project's own data, Ontology and models.

## Steps

- **Plan:** break the question into steps.
- **Query:** read the Golden Datasets, the Ontology and the models.
- **Report:** check every claim is grounded, then write the deep research document and map layers.
