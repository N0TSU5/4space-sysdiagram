The only data from Orion that model training sees. It is anonymised inside Orion before it's written to Merlin's training bucket.

## Steps

- Direct identifiers removed.
- IDs replaced with keyed hashes.
- Location and time coarsened.
- Groups smaller than k = 10 suppressed.
