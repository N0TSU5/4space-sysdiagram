Ontology Manager binds each `[Snow]` object type to one virtual table.

## Payload

**Transport:** Foundry Ontology Manager.

**ObjectTypeBinding**

| Field | Type | Notes |
| --- | --- | --- |
| `object_type` | string | Such as `[Snow] Footfall` |
| `table` | string | Such as `footfall` |
| `primary_key` | string | |
| `properties` | map | Column to property |
