The single entry point Merlin uses to work with Orion.

## Steps

- **Schema profiling:** returns the number of records and a mapping of each column name to its type, so the Plan agents can design without seeing the raw data.
- **Job runner:** receives the approved PySpark pipeline and training code, starts them on Dataproc Serverless and the TPU VM, and records checkpoints.
- **Status:** reports progress and failures, which recovery agents use to restart work.
