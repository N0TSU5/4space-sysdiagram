The Analyst passes its findings to the Report agent as a ledger of evidence, not raw query output.

## Payload

**Transport:** ADK sub-agent hand-off; full results stay in the project store.

**Evidence**

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Such as `E3` |
| `step_id` | string | |
| `source` | `gold` \| `ontology` \| `model` | |
| `query` | object | The GoldQuery, OSDK query or Scenario |
| `summary` | string | One sentence with key numbers |
| `data_ref` | string | Stored result |
| `h3_cells` | list of string, optional | For map layers |
