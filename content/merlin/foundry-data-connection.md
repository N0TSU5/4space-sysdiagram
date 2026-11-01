A secure read-only Data Connection (`fourthspace_adls` / GCS) points directly to the Gold Parquet directory in Cloud Storage (`gs://gold@datalake4us`).

The connection is zero-copy: Foundry reads the files in place.
