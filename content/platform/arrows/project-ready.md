When the Golden Datasets, models and Ontology are all in place, Merlin tells the user in the chat that the Project is ready.

## Payload

**Transport:** server-sent event on the Project's chat stream, and an email.

**ProjectReady**

| Field | Type | Notes |
| --- | --- | --- |
| `project_id` | uuid | |
| `plan_version` | integer | |
| `gold_tables` | list of string | |
| `models` | list of string | Model IDs and versions |
| `ontology_rid` | string | |
| `suggested_questions` | list of string | |
