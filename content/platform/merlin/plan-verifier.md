Checks every piece of code in the Plan before anyone runs it.

## Steps

- **Formal verification:** proves the pipeline has no runaway bugs and no processing that breaks the Project's regulations.
- **Unit tests:** cover the pipeline, the Ontology creation and the model training. They run on Cloud Run.
- **Hand-off:** sends the verified Plan to Agora for the user to review.
