AI agents on Vertex AI that step in when something fails while a Project is being created.

## Steps

- **Audit:** read the failure from Orion's job runner.
- **Fix:** correct the code or configuration.
- **Restart:** resume from the nearest checkpoint rather than from the start.
