The Report agent turns evidence with H3 cells into layers for the map.

## Payload

**Transport:** saved with the Report; Agora fetches the layers with the user's token. Never served from the CDN.

**MapLayer**

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | |
| `kind` | `hex_heatmap` \| `sites` \| `prediction` | |
| `title` | string | |
| `h3_res` | integer | |
| `values` | map of cell to number | Per time bucket for predictions |
| `color_scale` | object | Domain and palette |
| `legend` | string | Units |
| `evidence_ids` | list of string | Links back to the report |
