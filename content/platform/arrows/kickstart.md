On approval, Merlin sends the verified code to Orion's job runner.

## What it carries

- **PySpark pipeline:** runs on Dataproc Serverless. It builds the Golden Datasets and the training data.
- **TorchTPU training:** runs on a Compute Engine TPU VM, on the processed training data.
