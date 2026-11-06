The verified Plan goes to Agora as an interactive document: Golden Dataset schemas, the raw-to-Gold flowchart, the Ontology graph and the AI models.

## Payload

**Transport:** saved to the Plan store, then a server-sent event tells open Plan documents to reload.

**PlanVersion**

| Field | Type | Notes |
| --- | --- | --- |
| `project_id` | uuid | |
| `version` | integer | |
| `gold` | GoldSpec | |
| `ontology` | OntologySpec | |
| `models` | ModelPlan | |
| `pipeline_flow` | list of FlowEdge | Raw dataset to stage to Gold table |
| `regulations` | list of Passage | The rules in force |
| `verification` | VerificationReport | Passed, plus each check's result |
| `changes` | string | What changed since the last version |
