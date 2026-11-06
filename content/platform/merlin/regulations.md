The legal rules the Project's Golden Datasets, Ontology and models must comply with, such as GDPR, sector regulations and the company's own policies.

The user adds them in Agora when they start the Project. The Plan orchestrator designs within them, and the Verification agent checks the code against them.

## Data flow

```mermaid
flowchart LR
  BASE[("FourthSpace base corpus: GDPR, sector rules")] --> IX["Ingest"]
  UP["User uploads in Agora"] -->|"PDF, DOCX"| IX
  IX --> PA["Parse with Document AI"]
  PA --> CH["Chunk by article or clause"]
  CH --> EM["Embed"]
  EM --> C[("RAG corpus per Project")]
  C -->|"top passages with IDs"| O["Plan orchestrator"]
  C -->|"rules to check"| V["Verification agent"]
  CH --> RX["Extract machine rules"] --> RR[("Rule set: forbidden fields, k, retention")]
  RR --> V
```

## Software components

- **Vertex AI RAG Engine**, one corpus per Project, plus a shared base corpus.
- **Document AI** layout parser for PDFs and Word files.
- **Vertex AI text embeddings**.
- A Gemini 4 Argon extraction step that turns clauses into machine-checkable rules.

## Configuration and metadata

- Chunk = one article or clause, with its heading path.
- Chunk metadata: source, jurisdiction, article ID, effective date, uploaded by.
- Retrieval: hybrid search, top 8 passages, reranked.
- Machine rules are stored as JSON and shown to the user in the Plan for confirmation.
- Per-Project corpora are deleted with the Project.

## Low-level design

```mermaid
classDiagram
  class RegulationLibrary {
    +ingest(doc, project_id)
    +search(query, project_id) List~Passage~
    +rules(project_id) RuleSet
  }
  class Passage {
    +id
    +text
    +source
    +article
    +jurisdiction
  }
  class RuleSet {
    +forbidden_fields List~str~
    +min_k int
    +retention_days int
    +custom List~Rule~
  }
  class Rule {
    +id
    +passage_id
    +check
  }
  class RuleExtractor {
    +extract(passages) List~Rule~
  }
  RegulationLibrary --> Passage
  RegulationLibrary --> RuleSet
  RuleSet o-- Rule
  RegulationLibrary --> RuleExtractor
```

- Every `Rule` links back to the `Passage` it came from, so a failed check can cite the law.
