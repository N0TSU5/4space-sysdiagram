Estimates where devices live and how many people each one represents.

## Steps

- Evaluate night-time presences, 22:00–06:00 local time
- Use multi-week lookbacks
- Assign primary night H3 resolution 10 cells
- Map cells to ONS LSOA 2021 boundaries by point-in-polygon
- Calculate user expansion factors

## Expansion factor

`e_i = min(LSOA Population / Sample Devices, 70.0)`
