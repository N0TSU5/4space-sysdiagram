The chat sends the verified answer's brief, tables and audit trace to the studio panel.

## Payload

**Transport:** in the browser, through `AnswerStore`; exports call the export service.

**StudioContent**

| Field | Type | Notes |
| --- | --- | --- |
| `answer_id` | string | |
| `brief` | object | Sites, times, method, limitations |
| `tables` | list of table | Columns and rows |
| `audit` | AuditTrace | |
| `export_formats` | list of string | `docx`, `pdf` |
