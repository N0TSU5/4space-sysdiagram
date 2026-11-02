Makes spatial and temporal lookups fast by combining them into one sortable integer.

## Steps

- Take spatial cell centroids at H3 resolution 8, 9 or 10
- Rank cells along the Gosper curve
- Combine the rank with the timestamp
- Encode both into a compact 64-bit integer `spacetime_key`
