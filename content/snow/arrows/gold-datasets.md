Once verified by the privacy gate, Orion publishes non-linkable, GDPR-compliant Gold Parquet tables directly into the platform lakehouse store.

## Payload

**Transport:** Apache Iceberg commit from Spark, `partitionOverwriteMode = dynamic`.

**GoldCommit**

| Field | Type | Notes |
| --- | --- | --- |
| `table` | string | One of the seven below |
| `date` | date | Partition replaced |
| `snapshot_id` | integer | |
| `row_count` | integer | |
| `cells_suppressed` | integer | From the gate |

**FootfallRow** (example table)

| Field | Type | Notes |
| --- | --- | --- |
| `spacetime_key` | int64 | |
| `h3_res` | integer | |
| `date` | date | |
| `slot_id` | string | Hourly |
| `est_people` | integer | Rounded to 5 |
| `panel_devices` | integer | At least 5, rounded |

## Tables

- **`footfall`:** Estimated average daily population and raw panel device counts per H3 cell and hourly time slot.
- **`dwell`:** Cumulative dwell minutes, average stay duration, median (p50), 90th percentile (p90) and stay-share splits.
- **`composition`:** Visitor demographic distribution (age bands, ethnicity, IMD 2025 deprivation deciles, MHIP risk scores), weighted by home LSOAs.
- **`origin`:** Top 80% cumulative home LSOA catchment origins (`visitors_people`, `origin_share`).
- **`reach`:** Unique daily 15-minute walking catchment population across a 7-cell H3 resolution 9 disk (k = 1, about 324 m radius).
- **`area_need`:** Static Census 2021 health metrics, IoD 2025 deprivation ranks and deciles, and target screening age shares (aged 40–74).
- **`site_recommendation`:** Candidate site scores calculated with the deterministic formula below.

## Site score

`Score(c) = 0.6 × norm_reach(c) + 0.4 × norm_need(c)`
