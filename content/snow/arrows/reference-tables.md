LSOA boundaries and population that P2 uses for home assignment and expansion factors.

## Payload

**Transport:** Parquet read from the reference bucket, broadcast to executors.

**LsoaBoundary**

| Field | Type | Notes |
| --- | --- | --- |
| `lsoa_code` | string | ONS LSOA 2021 code |
| `geometry` | WKB polygon | EPSG:4326 |

**LsoaPopulation**

| Field | Type | Notes |
| --- | --- | --- |
| `lsoa_code` | string | |
| `population` | integer | ONS mid-year estimate |
| `release` | string | For example `mid-2022` |
