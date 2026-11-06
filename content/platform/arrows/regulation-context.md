The regulations library gives the Plan orchestrator the passages that matter for the current step, and the machine-checkable rules.

## Payload

**Transport:** Vertex AI RAG Engine retrieval, as a tool call.

**RegulationContext**

| Field | Type | Notes |
| --- | --- | --- |
| `passages` | list of Passage | Top 8, reranked |
| `rule_set` | RuleSet | See below |

**Passage**

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Cited in the Plan |
| `text` | string | One article or clause |
| `source` | string | Such as `GDPR` |
| `article` | string | Such as `Art. 5(1)(c)` |

**RuleSet**

| Field | Type | Notes |
| --- | --- | --- |
| `forbidden_fields` | list of string | Never in Gold or training data |
| `min_k` | integer | Smallest group size, default 10 |
| `retention_days` | integer | |
| `rules` | list of Rule | Each links to a passage ID |
