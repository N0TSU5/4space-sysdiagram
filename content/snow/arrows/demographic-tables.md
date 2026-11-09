Per-LSOA demographic profiles that P3 joins to each visitor's home LSOA.

## Payload

**Transport:** Parquet read from the reference bucket, broadcast to executors.

**LsoaProfile**

| Field | Type | Notes |
| --- | --- | --- |
| `lsoa_code` | string | Join key to `home_lsoa` |
| `age_band_share` | map of string to float | Census 2021, sums to 1 |
| `ethnicity_share` | map of string to float | Census 2021, sums to 1 |
| `imd_rank` | integer | IoD 2025 |
| `imd_decile` | integer | 1 = most deprived |
| `mhip_risk` | float | Cardiovascular and diabetes risk score |
| `health_metrics` | map of string to float | Census 2021, for `area_need` |
| `pop_40_74` | integer | Screening target population |
| `releases` | map of string to string | Source version per field |
