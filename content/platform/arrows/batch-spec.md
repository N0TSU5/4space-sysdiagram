The job runner starts one Dataproc Serverless batch per pipeline run.

## Payload

**Transport:** Dataproc Batches API `batches.create`.

**BatchSpec**

| Field | Type | Notes |
| --- | --- | --- |
| `batch_id` | string | `<project>-<plan_version>-<attempt>` |
| `main_python_file` | string | Pipeline entrypoint |
| `python_files` | list of string | Pipeline and building-block wheels |
| `args` | list of string | Job spec path, resume checkpoint |
| `runtime_version` | string | `2.2` |
| `service_account` | string | The company's pipeline account |
| `properties` | map | Executor count and memory |
| `labels` | map | Project, Plan version |
