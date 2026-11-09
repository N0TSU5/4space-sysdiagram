The Planner and Analyst agents run read queries directly against `[Snow]` Ontology objects and follow graph links to evaluate site suitability, without raw SQL table scans.

## Payload

**Transport:** Python OSDK, read-only Foundry service user.

**OntologyQuery**

| Field | Type | Notes |
| --- | --- | --- |
| `object_type` | string | Such as `[Snow] Candidate Site` |
| `filter` | object | Such as `has_power = true` |
| `traverse` | list of string | Such as `serves` to `[Snow] Area` |
| `properties` | list of string | Such as `imd_decile` |
| `limit` | integer | |

**Reply:** a list of objects with the requested properties and linked object IDs.
