# User journey

The slides in the Journey tab. Each `##` heading starts a slide. The lines straight after it
set up the slide:

- `Stage:` a stage ID from the Platform board's Stages table, which sets the slide's colour.
- `Visual:` the illustration to draw. The bullets under the slide's `### Visual` heading
  give its labels.
- `Show:` box IDs to highlight in the mini diagram.
- `Arrows:` arrow numbers to draw in the mini diagram, such as `2.1, 2.3`.

Everything else is the slide's text.

Board: platform

## From raw data to decisions
Visual: decisions

FourthSpace is most powerful when a business has to make a critical decision about a place.

The bottleneck isn't the decision itself. It's getting from raw data to signals someone can interpret. FourthSpace is the intelligence layer that closes that gap.

### Visual

- 🚌 Where to place a bus
- 🌾 Where to plant wheat
- 🚓 Where to increase police presence
- 🏡 Where to build a farmhouse

## More than a single answer
Visual: expectations

A list of possible bus stops isn't enough. Users expect a knowledge base curated around their decision, so they can understand it, test it and explain it.

### Visual

- A list of candidate locations
- Predictive modelling
- Area insights
- AI-written reports
- An interactive map

## Every decision is a Project
Visual: project
Show: project-store, foundry

Each decision a business brings to FourthSpace becomes a **Project**. A company can run many Projects, and many users can work on the same one.

Everything a Project owns is stored in Merlin, on GCP.

### Visual

- Golden Datasets: Small, GDPR-compliant tables of derived metrics, indexed with Spacetime-H3
- Ontology Graph: A semantic view of the Golden Datasets, in Palantir Foundry
- Predictive AI models: From linear regressions to time-series transformers

## Models predict how places change
Visual: hexes
Show: models

The Project's models predict how a Spacetime-H3 hexagon changes over time. Agents use them to answer "what if" questions, such as an area's health if 2 buses are placed on a street, or a crop's quality if it doesn't rain for 3 weeks.

### Visual

- Today
- In 2 weeks
- In 6 weeks

## Onboarding: data, a problem and its rules
Stage: onboard
Visual: onboard
Show: chat, raw, regs
Arrows: 1.1, 1.2

A Project needs three things from the user: raw data, a business problem statement, and the regulations the Project must follow. The raw data may already be in Orion from the company's onboarding.

When the user sends the problem statement, Merlin starts writing the Project's **Plan**.

### Visual

- raw_pings_2026.parquet
- weather_daily.csv
- GDPR and transport rules.pdf
- Where should we place 2 new bus routes to cut journey times in the east of the city?

## Merlin learns the data without seeing it
Stage: plan
Visual: schema
Show: plan-lead, orion-api, regs
Arrows: 2.1, 2.2

Merlin asks Orion about the raw datasets. Orion returns the number of records and each column's name and type, but none of the data.

Merlin also reads the regulations the user added, which its Golden Datasets, Ontology and models must comply with.

### Visual

- Records: 4.2 billion
- device_id: string
- timestamp: timestamp
- lat: double
- lon: double
- accuracy_m: float
- GDPR
- Transport Act
- Company policy

## Designing the Project in a ReAct loop
Stage: plan
Visual: react
Show: plan-engine

With the schema and rules in hand, Merlin's Plan agents design the Project in a ReAct (Reason + Act) loop. Each architect agent drafts its part and the code that builds it. The pipeline and training code are assembled from pre-written building blocks, so the agents don't start from scratch.

### Visual

- Reason
- Act
- Observe
- Golden Datasets: Tables, columns and the PySpark pipeline
- Ontology: Object types and links for Foundry
- Models: Architectures and TorchTPU training code

## Verified before anything runs
Stage: plan
Visual: verify
Show: plan-verifier

The Verification agent checks all the code with formal verification and comprehensive unit tests. Nothing runs until the checks pass.

### Visual

- No runaway bugs in the pipeline
- No processing that breaks the regulations
- Pipeline unit tests pass
- Ontology creation tests pass
- Model training tests pass

## The Plan, as a document you can edit
Stage: plan
Visual: plandoc
Show: plan-doc, chat
Arrows: 2.3, 2.4

The user sees the Plan as an interactive document. They can view and edit the Golden Dataset schemas, the raw-to-Gold flowchart, the Ontology graph and the AI models, directly or by talking to the chat.

It works like editing a Deep Research plan or a coding agent's implementation plan.

### Visual

- Schemas
- Flowchart
- Ontology
- Models
- Add weekend footfall to the area table
- Done. I've added `footfall_weekend` and updated the pipeline and tests.

## Approval starts creation
Stage: create
Visual: create
Show: orion-api, dataproc, tpu, gold, models, foundry
Arrows: 3.1, 3.2, 3.3, 3.4

When the user approves the Plan, Merlin sends the code to Orion. The PySpark pipeline runs on Dataproc Serverless, building the Golden Datasets and a version of the raw data processed for training. Model training runs on a TPU VM.

The Golden Datasets and models are stored in Merlin, and the Ontology Graph is generated from them.

### Visual

- Dataproc Serverless: PySpark pipeline and training data
- Golden Datasets
- TPU VM: TorchTPU training on the processed data
- Predictive models
- Ontology Graph generated

## Failures restart from a checkpoint
Stage: create
Visual: recovery
Show: recovery, orion-api
Arrows: 3.5, 3.6

If anything fails, recovery agents audit the problem, fix it and restart from the nearest checkpoint. When everything is in place, the user is told the Project is ready.

### Visual

- Checkpoint
- Checkpoint
- Failure
- Audit
- Fix
- Restart
- Project ready

## Asking questions
Stage: interact
Visual: interact
Show: chat, research, gold, ontology, models
Arrows: 4.1, 4.2, 4.3, 4.4

The user asks about the decision in the chat. Merlin's research agents run a ReAct loop that queries the Golden Datasets, the custom models and the Ontology Graph, so every answer is grounded in the Project's own data.

### Visual

- Which 2 routes would cut journey times the most?
- Golden Datasets
- Ontology Graph
- Predictive models

## Answers: a report and a map
Stage: interact
Visual: outputs
Show: reporter, studio, map
Arrows: 4.5, 4.6

Answers come back as a deep research document and an interactive layered map, so the user can see the evidence behind the decision and explore it place by place.

### Visual

- Deep research document
- Routes 12 and 31 cut median journey time by 9 minutes
- Layered map
