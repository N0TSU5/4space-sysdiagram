The browser's map loads basemap tiles from Cloud CDN. These are public and cached; Project layers never come this way.

## Payload

**Transport:** HTTPS range `GET /tiles/basemap-YYYYMM.pmtiles`, using the `pmtiles` protocol in MapLibre.

**BasemapTiles**

| Field | Type | Notes |
| --- | --- | --- |
| `z`, `x`, `y` | integers | Tile address, read by the pmtiles client |
| `range` | bytes start and end | Request header |
| body | Mapbox Vector Tile | Layers: roads, water, buildings, places |
| `cache-control` | string | 30 days |
