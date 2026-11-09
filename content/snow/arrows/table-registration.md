Each Gold table is registered as a Foundry Virtual Table on `gs_gold_connection`.

## Payload

**Transport:** Foundry Data Connection, set up in the Foundry UI.

**TableRegistration**

| Field | Type | Notes |
| --- | --- | --- |
| `connection` | string | `gs_gold_connection` |
| `table_name` | string | Same as Gold |
| `iceberg_identifier` | string | |
| `primary_key` | list of string | |
