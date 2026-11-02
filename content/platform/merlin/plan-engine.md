The agents that write a Project's Plan. They work in a ReAct (Reason + Act) loop on Vertex AI Agent Engine.

## Steps

- **Gather:** ask Orion for the raw data's schema and size, and read the regulations the user added.
- **Design:** draft the Golden Dataset tables, the Ontology and the predictive models.
- **Code:** write the PySpark pipeline, the Ontology creation and the TorchTPU training code.
- **Verify:** check all the code with formal verification and unit tests.
- **Review:** show the Plan to the user, apply their edits, and wait for approval.
