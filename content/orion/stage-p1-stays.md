Turns clean pings into presences for each device, in time order.

## Steps

- Group consecutive clean pings per device
- Break on a time gap above 20 min
- Break on a spatial step above 50 m
- Break on an anchor walk above 50 m
- Calculate the geographic medoid centroid
- Classify presence type and movement modality

## Classifications

- **Presence type:** `pass_by`, `short_presence`, `long_stay`, `very_long_stay`
- **Movement modality:** `stationary`, `pedestrian`, `non_pedestrian`
