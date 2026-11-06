Once the anonymised training data is ready, the Plan orchestrator starts a Vertex AI custom training job for each model.

## Payload

**Transport:** Vertex AI `CustomJob` API.

**TrainingJobSpec**

| Field | Type | Notes |
| --- | --- | --- |
| `project_id` | uuid | |
| `plan_version` | integer | |
| `model` | ModelSpec | Target, features, template, hyperparameters |
| `data_uri` | string | Anonymised training data path |
| `container` | string | Prebuilt PyTorch or scikit-learn image |
| `machine` | MachineSpec | Type, GPU type and count, or none |
| `checkpoint_uri` | string | |
| `service_account` | string | The Project's training account |
