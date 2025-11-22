---
sidebar_position: 8
---
# Run

Provides the capability to run execute external commands

## Properties

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| run.workflow | [`workflow`](#workflow) | `no` | The definition of the workflow to run.<br />*Required if `container`, `script` and `shell` have not been set.* |
| await | `boolean` | `no` | Determines whether or not the process to run should be awaited for.<br />*When set to `false`, the task cannot wait for the process to complete and thus cannot output the process’s result.*<br />*Defaults to `true`.* |

## Workflow

Enables the invocation and execution of [child workflows](https://docs.temporal.io/child-workflows)
from a parent workflow, facilitating modularization, reusability, and abstraction
of complex logic or business processes by encapsulating them into standalone
workflow units.

### Properties {#workflow-properties}

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| name | `string` | `yes` | The name of the workflow to run |
| namespace | `string` | `yes` | This is not used and only exists to maintain compatability with the Serverless Workflow schema |
| version | `string` | `yes` | This is not used and only exists to maintain compatability with the Serverless Workflow schema |
| input | `any` | `no` | The data, if any, to pass as input to the workflow to execute. The value should be validated against the target workflow's input schema, if specified |

### Example {#workflow-example}

```yaml
document:
  dsl: 1.0.0
  namespace: zigflow
  name: example
  version: 0.0.1
timeout:
  after:
    minutes: 1
do:
  - parentWorkflow:
      do:
        - wait:
            wait:
              seconds: 5
        - callChildWorkflow1:
            run:
              workflow:
                name: child-workflow1
                namespace: default
                version: 0.0.0
        - wait:
            wait:
              seconds: 5
        - callChildWorkflow2:
            run:
              workflow:
                name: child-workflow2
                namespace: default
                version: 0.0.0
  - child-workflow1:
      do:
        - wait:
            wait:
              seconds: 10
  - child-workflow2:
      do:
        - wait:
            wait:
              seconds: 3
```
