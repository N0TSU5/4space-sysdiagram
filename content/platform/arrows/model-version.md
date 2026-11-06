Each finished training job registers its model, with metrics and lineage, in the Vertex AI Model Registry.

## Payload

**Transport:** Vertex AI Model Registry `upload`.

**ModelVersion**

| Field | Type | Notes |
| --- | --- | --- |
| `model_id` | string | One per ModelSpec |
| `version` | integer | |
| `artifact_uri` | string | Saved model |
| `serving_container` | string | |
| `aliases` | list of string | `candidate`, later `default` |
| `metrics` | map | Holdout scores |
| `lineage` | object | Plan version, data sha256, code commit, machine |
| `input_schema` | list of ColumnType | Features a scenario needs |
