The chat puts the verified answer's layers on the map.

## Payload

**Transport:** in the browser, through `AnswerStore`.

**MapLayer**

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | |
| `kind` | `hex_heatmap` \| `sites` \| `walk_disk` | |
| `h3_res` | integer | 8, 9 or 10 |
| `values` | map of cell to number | Counts at least 5 |
| `sites` | list of site, optional | ID, lat, lon, score |
| `color_scale` | object | |
| `legend` | string | |
