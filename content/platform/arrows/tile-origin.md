On a cache miss, Cloud CDN fetches the requested byte range of the basemap file from the bucket.

## Payload

**Transport:** HTTPS range `GET` from the backend bucket.

**PmtilesObject**

| Field | Type | Notes |
| --- | --- | --- |
| `object` | string | `basemap-YYYYMM.pmtiles` |
| `range` | bytes start and end | One tile or directory block |
| `etag` | string | |
| `cache-control` | string | `public, max-age=2592000` |
