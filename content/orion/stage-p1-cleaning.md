Removes direct identifiers in-line and filters out unreliable pings.

## Steps

- Hash `device_id` to `device_key` with HMAC-SHA256
- Convert raw IP addresses to daily keys
- Drop pings with accuracy above 30 m
- Drop pings with altitude above 1,500 m
- Drop teleportation speeds above 90 m/s
