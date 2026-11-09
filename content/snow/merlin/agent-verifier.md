Runs 7 deterministic heuristic verification checks and Model Armor policy guardrails to validate clinical safety, privacy compliance and site feasibility.

## Data flow

```mermaid
flowchart LR
  D["DraftAnswer"] --> C1["1. k floor: every count at least 5"]
  C1 --> C2["2. No device-level or individual claims"]
  C2 --> C3["3. Every number cited to evidence"]
  C3 --> C4["4. Scores recomputed and match"]
  C4 --> C5["5. Site feasible: parking and power"]
  C5 --> C6["6. Inside Thames Freeport boroughs"]
  C6 --> C7["7. Clinical safety wording"]
  C7 --> MA["Model Armor: response screen"]
  MA --> R{"All pass?"}
  R -->|"yes"| OUT["VerifiedAnswer + audit trace"]
  R -->|"no"| BACK["Back to Analyst with reasons"]
```

## Software components

- ADK `LlmAgent`, Gemini 4 Argon, only for check 7 and writing the reasons.
- Checks 1 to 6 are deterministic Python.
- **Model Armor** templates: prompt injection, sensitive data, harmful content.
- Audit traces written to BigQuery `snow_audit`.

> **To confirm:** the list of 7 checks. This list is assumed from the existing description.

## Prompting and context engineering

- **Code first:** the model can't override a failed deterministic check.
- **Check 7 prompt:** compares wording with a short DCB0129 hazard list, such as "no diagnostic claims" and "advise, don't direct".
- **Context:** the draft answer, evidence summaries, check results. Not the Analyst's reasoning.

## Prompt (excerpt)

```text
Check this answer for clinical safety wording only: {draft_text}
Hazards to avoid: {hazard_list}
Return PASS or FAIL with the sentence and hazard ID for each issue.
Checks 1-6 have already run: {check_results}. You cannot change them.
```

## Low-level design

```mermaid
classDiagram
  class VerifierAgent {
    +verify(draft) VerifiedAnswer
  }
  class Check {
    <<interface>>
    +id int
    +run(draft) CheckResult
  }
  class KFloorCheck
  class NoIndividualsCheck
  class CitationCheck
  class ScoreRecomputeCheck
  class FeasibilityCheck
  class BoundaryCheck
  class ClinicalWordingCheck
  class ModelArmorGuard {
    +screen(text) Verdict
  }
  class AuditTrace {
    +answer_id
    +checks List~CheckResult~
    +model_armor Verdict
    +at
  }
  VerifierAgent o-- Check
  Check <|.. KFloorCheck
  Check <|.. NoIndividualsCheck
  Check <|.. CitationCheck
  Check <|.. ScoreRecomputeCheck
  Check <|.. FeasibilityCheck
  Check <|.. BoundaryCheck
  Check <|.. ClinicalWordingCheck
  VerifierAgent --> ModelArmorGuard
  VerifierAgent --> AuditTrace
```
