GCP Secret Manager holds the keys the pipeline needs, such as the hashing secret used to de-identify records, and service credentials.

The pipeline reads keys at run time, so they never appear in the Plan's code.
