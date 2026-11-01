Once verified by the privacy gate, Orion publishes non-linkable, GDPR-compliant Gold Parquet tables directly into the platform lakehouse store.

## Datasets

- **`footfall`:** Estimated average daily population and raw panel device counts per H3 cell and hourly time slot.
- **`dwell`:** Cumulative dwell minutes, average stay duration, median (p50), 90th percentile (p90) and stay-share splits.
- **`composition`:** Visitor demographic distribution (age bands, ethnicity, IMD 2025 deprivation deciles, MHIP risk scores), weighted by home LSOAs.
- **`origin`:** Top 80% cumulative home LSOA catchment origins (`visitors_people`, `origin_share`).
- **`reach`:** Unique daily 15-minute walking catchment population across a 7-cell H3 resolution 9 disk (k = 1, about 324 m radius).
- **`area_need`:** Static Census 2021 health metrics, IoD 2025 deprivation ranks and deciles, and target screening age shares (aged 40–74).
- **`site_recommendation`:** Candidate site scores calculated with the deterministic formula below.

## Site score

`Score(c) = 0.6 × norm_reach(c) + 0.4 × norm_need(c)`
