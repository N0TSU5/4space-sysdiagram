The research agents follow links in the Ontology, such as from a candidate site to the areas it serves.

## Payload

**Transport:** the Project's generated Python OSDK, as the Project's read-only Foundry service user.

**OntologyQuery**

| Field | Type | Notes |
| --- | --- | --- |
| `object_type` | string | Such as `CandidateSite` |
| `filter` | object | Property filters |
| `traverse` | list of string | Link names to follow |
| `aggregate` | object, optional | |
| `limit` | integer | |

**Reply:** a list of objects with their properties and linked object IDs.
