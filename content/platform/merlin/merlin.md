FourthSpace's core platform on GCP. Merlin plans and creates each Project, stores everything the Project owns, and runs the agents that answer users' questions.

## Responsibilities

- Signs users in and manages companies, users and Projects.
- Plans a Project with ReAct agents.
- Sends approved code to Orion to run.
- Trains the models on CPU or GPU, on anonymised data.
- Stores the Golden Datasets and models, and generates the Ontology.
- Answers questions with research agents.

## Data flow

```mermaid
flowchart LR
  AG["Agora"] -->|"token"| AC["Accounts"]
  AC -->|"AuthContext"| PA["Plan agents"]
  AC -->|"AuthContext"| RA["Research agents"]
  PA <-->|"profile, jobs"| OR["Orion"]
  OR -->|"Gold, anonymised training data"| PS[("Project store")]
  PA -->|"training job"| TR["Model training"]
  PS --> TR --> PS
  PS --> FD["Foundry"]
  OR -->|"failures"| RC["Recovery agents"] --> OR
  RA <--> PS & FD
  RA -->|"report, layers"| AG
```

## Software components

- GCP project `merlin-prod`, inside a VPC Service Controls perimeter.
- **Vertex AI Agent Engine** (Plan, research and recovery agents), **Vertex AI Training**, **Model Registry**, **endpoints**.
- **Cloud SQL for PostgreSQL** (accounts and Plan store), **Cloud Storage**, **BigLake metastore**, **BigQuery**.
- **Cloud Run** (Accounts API, test runner, triggers), **Pub/Sub**, **Identity Platform**.
- **Terraform** and **Cloud Build** for deploys; **Cloud Monitoring** dashboards and alerts.

## Low-level design

```mermaid
classDiagram
  class fourthspace_auth {
    <<package>>
    AccountsClient
    AuthContext
  }
  class fourthspace_contracts {
    <<package>>
    Plan
    GoldSpec
    OntologySpec
    ModelSpec
    Report
  }
  class merlin_agents {
    <<package>>
    plan
    research
    recovery
  }
  class merlin_accounts {
    <<package>>
    api
    db
  }
  class merlin_training {
    <<package>>
    trainers
    templates
  }
  class merlin_foundry {
    <<package>>
    generator
  }
  merlin_agents ..> fourthspace_auth
  merlin_agents ..> fourthspace_contracts
  merlin_training ..> fourthspace_contracts
  merlin_foundry ..> fourthspace_contracts
  merlin_accounts ..> fourthspace_auth
```

- One monorepo. `fourthspace-contracts` holds every shared Pydantic model, so agents, training and Foundry agree on shapes.
