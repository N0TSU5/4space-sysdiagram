Classifies natural language prompts into spatial and ontological queries, then routes actions to Ontology tools or BigQuery.

Inspects `[Snow]` object properties and follows graph links through read queries.

## Data flow

```mermaid
flowchart LR
  Q["Question"] --> MA["Model Armor: prompt screen"]
  MA --> P{"Planner"}
  OS["Ontology summary"] --> P
  P -->|"unclear area or time"| CL["Clarifying question"]
  P -->|"classify: ontology, range scan or both"| QP["QueryPlan"]
  QP --> A["Analyst"]
  P -->|"progress"| CH["Chat stream"]
```

## Software components

- ADK `LlmAgent`, Gemini 4 Argon.
- Tools: `ontology_summary`, `resolve_area` (place names to LSOA codes), `resolve_time` (phrases to slots), `ask_user`, `emit_progress`.

## Prompting and context engineering

- **Context:** the question, the 4 object types and 3 links with key properties, the LSOA list for the 3 boroughs, the slot calendar.
- **Resolve, don't guess:** places become LSOA codes and times become slot IDs through tools.
- **Output:** strict JSON `QueryPlan`.

## Prompt (excerpt)

```text
You plan queries for Project Snow: mobile health van placement in
Barking & Dagenham, Havering and Thurrock.
Ontology: {ontology_summary}
Turn the planner's question into a QueryPlan. Resolve places with
resolve_area and times with resolve_time. If the area or time is
missing, call ask_user once. Never plan queries about individuals.
```

## Low-level design

```mermaid
classDiagram
  class PlannerAgent {
    +plan(question) QueryPlan
  }
  class QueryPlan {
    +lsoa_codes List~str~
    +slots List~str~
    +steps List~QueryStep~
  }
  class QueryStep {
    +kind ONTOLOGY or RANGE_SCAN
    +intent
  }
  class AreaResolver {
    +resolve(text) List~str~
  }
  class SlotResolver {
    +resolve(text) List~str~
  }
  PlannerAgent --> QueryPlan
  QueryPlan o-- QueryStep
  PlannerAgent --> AreaResolver
  PlannerAgent --> SlotResolver
```
