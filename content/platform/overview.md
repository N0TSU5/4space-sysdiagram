## What FourthSpace is for

FourthSpace is most powerful when a business has to make a critical decision about a place: where to place a bus, where to plant wheat, where to increase police presence, or where to build a farmhouse.

The bottleneck in these decisions is getting from raw data to signals someone can interpret. FourthSpace is the intelligence layer that closes that gap.

Users don't want a single value, such as a list of possible bus stops. They want a knowledge base built around the decision, with predictive models, area insights and AI-written reports.

## Projects

Each decision a business brings to FourthSpace is a **Project**. A Project has three things of its own:

- **Golden Datasets:** small tables of derived metrics that strongly influence the decision. They are GDPR compliant, indexed with Spacetime-H3, and come with auxiliary datasets that add context.
- **Ontology Graph:** a semantic representation of the Golden Datasets, built in Palantir Foundry.
- **Predictive AI models:** from linear regressions to time-series transformers, they predict how a Spacetime-H3 hexagon changes over time, such as an area's health if 2 buses are placed on a street.

A company can have many Projects, and many users can work on one Project. Everything a Project owns is stored in Merlin, on GCP.

## The journey

1. **Onboard:** the user gives Agora raw data, a business problem statement and the regulations the Project must follow.
2. **Plan:** Merlin's Plan agents design the Golden Datasets, Ontology and models, verify the code, and show the Plan as an interactive document the user can edit.
3. **Create:** once approved, Orion runs the pipeline and training, Merlin stores the results and generates the Ontology.
4. **Interact:** the user asks questions, and research agents answer with a deep research document and a layered map.

The **Journey** tab walks through each step.

## Using this diagram

- Arrow colours show the journey stage. Click a stage in the legend to highlight its arrows.
- Arrow numbers match the steps in the Journey tab.
- Click a module or a box with a **+** to expand it, and click an arrow to read about it.
- Tick a box's checkbox to mark it done, and use the **Progress** tab for owners, statuses and notes.
- Drag to pan and scroll to zoom.
