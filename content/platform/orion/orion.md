The customer's data and compute boundary on GCP. Raw data stays inside Orion: Merlin sends it code to run and receives only the outputs, such as schemas, Golden Datasets and trained models.

## Responsibilities

- Holds each company's raw data.
- Describes the raw data's schema and size when Merlin plans a Project.
- Runs the Plan's PySpark pipeline on Dataproc Serverless and its model training on TPUs.
