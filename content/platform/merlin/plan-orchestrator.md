Runs the ReAct loop for a Plan. It starts when a user sends a problem statement through Agora.

## Steps

- **Profile the data:** asks Orion for the record count and the column-to-type mapping of each raw dataset.
- **Collect the rules:** reads the regulations the user added for the Project.
- **Delegate:** hands design work to the three architect agents.
- **Revise:** applies the user's edits and re-runs the affected steps.
- **Kick off:** on approval, sends the pipeline and training code to Orion.
