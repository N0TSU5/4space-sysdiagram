The `run_period` workflow starts one Dataproc Serverless batch for the new date.

## Payload

**Transport:** Dataproc Batches API `batches.create`, called from Workflows.

**RunPeriodRequest**

| Field | Type | Notes |
| --- | --- | --- |
| `date` | date | Partition to process |
| `batch_id` | string | `snow-<date>-<attempt>` |
| `main_python_file` | string | `snow_pipeline/main.py` |
| `args` | list of string | `--date`, `--lookback-weeks 4` |
| `runtime_version` | string | `2.2` |
| `service_account` | string | Pipeline account |
| `force` | boolean | Re-run an already processed date |
