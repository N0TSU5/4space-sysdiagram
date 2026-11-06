The Ontology generator registers each Gold table as a Foundry Virtual Table on the Project's connection.

## Payload

**Transport:** Foundry Platform SDK.

**TableRegistration**

| Field | Type | Notes |
| --- | --- | --- |
| `connection_rid` | string | |
| `table_name` | string | Same as the GoldSpec |
| `iceberg_identifier` | string | |
| `primary_key` | list of string | |
