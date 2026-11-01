The platform's store for Gold data, `gold@datalake4us`.

## Capabilities

- Stores Snappy-compressed Gold Parquet files
- Uses Apache Iceberg snapshot commits to update table catalog pointers atomically (`partitionOverwriteMode = dynamic`)
- Exposed zero-copy to BigQuery BigLake external tables
- Runs fast 64-bit `spacetime_key` range pruning over Parquet row-group metadata
