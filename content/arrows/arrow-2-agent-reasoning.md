An **interactive query and action loop** between the AI agents (Vertex AI Agent Engine and Gemini) and the Ontology graph.

## Steps

- **Semantic querying:** The Planner Agent queries the Ontology API / Spanner Graph when a planner asks a natural language question, such as *"Which high-deprivation areas in Barking have peak footfall before 3 PM?"*
- **Object inspection:** Instead of guessing SQL column names, the agent inspects structured object properties and links.
- **Ontology writeback:** When the agent selects the optimal location, it runs a defined Ontology Action, such as `snowRequestRanking` or `Approve Deployment`.

## Object inspection examples

- Check `[Snow] Area.imd_decile` to verify deprivation levels.
- Check `[Snow] Candidate Site.has_power` to ensure operational feasibility.
- Follow the link from `Candidate Site` to `Footfall` to check k-anonymized visitor volumes.

## Writeback results

- A new `[Snow] Recommendation` object holds the composite score, rank and plain-text reasoning.
- When an NHS planner accepts the recommendation in the map UI, an action converts it into an official `[Snow] Van Deployment` object.
