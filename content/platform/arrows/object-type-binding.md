Each object type in the Ontology is bound to one virtual table.

## Payload

**Transport:** Foundry Platform SDK, applied from the OntologySpec.

**ObjectTypeBinding**

| Field | Type | Notes |
| --- | --- | --- |
| `api_name` | string | Such as `CandidateSite` |
| `table_rid` | string | |
| `primary_key` | string | |
| `title_property` | string | |
| `properties` | map | Column to property |
