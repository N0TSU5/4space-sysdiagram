The Analyst asks a model "what if" questions.

## Payload

**Transport:** Vertex AI endpoint `predict`, or batch prediction for large scenarios.

**Scenario**

| Field | Type | Notes |
| --- | --- | --- |
| `model_id` | string | Uses the `default` version |
| `cells` | list of string | H3 cells |
| `horizon` | duration | Such as 6 weeks |
| `changes` | map | The "what if", such as `buses_added: 2` |

**Reply: Prediction**

| Field | Type | Notes |
| --- | --- | --- |
| `model_version` | integer | |
| `by_cell` | map of cell to series | Predicted values over time |
| `interval` | map | 80% prediction interval |
