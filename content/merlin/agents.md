The AI layer uses Vertex AI Agent Engine with the GCP multi-agent SDK and Gemini, following a multi-agent approach.

## Steps

- **Planner Agent:** classifies the question, routes it and inspects Ontology properties and links.
- **Analyst Agent:** queries `[Snow] Area` and Candidate Sites, and runs range scans.
- **Verifier Agent:** checks safety, privacy and feasibility.
