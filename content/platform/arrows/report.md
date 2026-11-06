The Report agent saves the grounded answer as a Report, which the deep research document renders.

## Payload

**Transport:** saved to the project store; Agora fetches it with the user's token.

**Report**

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | |
| `question` | string | |
| `summary` | string | Short answer |
| `sections` | list of Section | Title and blocks |
| `blocks` | text, table or chart | Charts as Vega-Lite specs |
| `sources` | list of Evidence | Every cited item |
| `plan_version` | integer | |
| `model_versions` | list of string | |
| `created_at` | timestamp | |
