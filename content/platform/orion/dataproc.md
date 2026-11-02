Dataproc Serverless runs the PySpark pipeline drafted in the Plan. It fetches raw data from Cloud Storage, writes the Golden Datasets to Merlin, and prepares the training data for the TPU VM.

## Steps

- **Clean and de-identify:** removes or hashes personal identifiers.
- **Derive metrics:** computes the signals that drive the decision.
- **Spacetime-H3 indexing:** keys every record by H3 cell and time bucket.
- **Compliance gate:** checks the output against the Project's regulations before release.
- **Training data:** a separately processed version of the raw data for model training.

The exact steps differ for every Project, because the Plan agents write the pipeline for that decision.
