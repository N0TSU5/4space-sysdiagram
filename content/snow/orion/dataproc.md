Dynamic, auto-scaling compute runtime (PySpark 3.5, Runtime 2.2). It executes the 5 core pipeline stages in temporary worker memory.

## Steps

- **P1.1–P1.7 De-Id and ping cleaning:** hash identifiers in-line and remove inaccurate pings.
- **P1.8–P1.14 Presence and stay clustering:** group clean pings into classified presences.
- **P2 Home assignment and expansion:** assign night-time home cells and expansion factors.
- **P3 Spacetime-H3 indexing:** encode cells and timestamps into a 64-bit `spacetime_key`.
- **P3.15 Privacy gate:** strip `device_key`, enforce the Floor of 5 and round exported counts.
