The user describes the business decision in the chat, such as "Where should we place 2 new bus routes?", and adds the regulations the Project must follow. Agora sends both to Merlin, which stores the regulations in the Project's library and starts the Plan.

## Payload

**Transport:** HTTPS to Agent Engine through Agora's server, with the user's ID token. Replies stream back as server-sent events.

**ProblemStatement**

| Field | Type | Notes |
| --- | --- | --- |
| `project_id` | uuid | |
| `text` | string | The decision, in the user's words |
| `datasets` | list of string | Raw datasets the Project may use |
| `regulation_files` | list of string | Storage paths of uploaded PDFs or Word files |
| `regulation_presets` | list of string | Such as `gdpr`, `uk-transport-act` |
| `locale` | string | Such as `en-GB` |
