A Compute Engine TPU VM that trains the Project's predictive models.

It trains on a version of the raw data processed specifically for training, which the Plan's PySpark pipeline produces on Dataproc Serverless. Merlin's Model architect drafts the training code in TorchTPU so it runs efficiently on GCP TPUs, and the trained models are stored in Merlin.
