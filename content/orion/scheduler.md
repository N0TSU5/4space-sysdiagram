Automatically invokes the headless execution runner (`run_period.sh`) whenever new date partitions arrive.

## Event path

1. GCS Bucket Notifications
2. GCP Pub/Sub events
3. GCP Workflows or Cloud Composer (Airflow)
4. `run_period.sh` starts the Dataproc Serverless run
