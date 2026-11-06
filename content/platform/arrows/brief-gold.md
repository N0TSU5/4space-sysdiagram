The Plan orchestrator hands design work to the Golden Dataset architect with a narrow brief.

## Payload

**Transport:** ADK sub-agent call inside the same Agent Engine deployment.

**ArchitectBrief**

| Field | Type | Notes |
| --- | --- | --- |
| `project_id` | uuid | |
| `goal` | string | What this architect must design |
| `problem_statement` | string | |
| `schema_slice` | list of DatasetProfile | Only the columns it needs |
| `rule_set` | RuleSet | |
| `constraints` | list of string | Such as "CPU or GPU only" |
| `upstream` | object, optional | Such as the GoldSpec, for the Ontology and Model architects |
