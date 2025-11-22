---
sidebar_position: 5
---
# Fork

Allows workflows to execute multiple subtasks concurrently, enabling parallel
processing and improving the overall efficiency of the workflow. By defining a
set of subtasks to perform concurrently, the Fork task facilitates the execution
of complex operations in parallel, ensuring that multiple tasks can be executed
simultaneously.

## Properties

| Name | Type | Required | Description |
|:--|:---:|:---:|:---|
| fork.branches | [`map[string, task]`](./intro) | `no` | The tasks to perform concurrently. These will be run as [child workflows](https://docs.temporal.io/child-workflows). |
| fork.compete | `boolean` | `no` | Indicates whether or not the concurrent [`tasks`](./intro) are racing against each other, with a single possible winner, which sets the composite task's output.<br />*If set to `false`, the task returns an array that includes the outputs from each branch, preserving the order in which the branches are declared.*<br />*If to `true`, the task returns only the output of the winning branch.*<br />*Defaults to `false`.* |

## Example

### Non-competing Fork

:::info
This is the default behaviour.
:::

This will return all the workflow.

```yaml
document:
  dsl: 1.0.0
  namespace: zigflow
  name: example
  version: 0.0.1
do:
  - raiseAlarm:
      # A fork is a series of child workflows running in parallel
      export:
        as: raiseAlarm
      fork:
        # If not competing, all tasks will run to the finish - this is the default behaviour
        compete: false
        branches:
          # A single step is passed in by the Serverless Workflow task - this will be implicitly wrapped in a Do task
          - callNurse:
              call: http
              export:
                as: callNurse
              with:
                method: get
                endpoint: https://jsonplaceholder.typicode.com/users/2
          # Multiple steps can be passed in by the Serverless Workflow do task
          - multiStep:
              do:
                - wait1:
                    wait:
                      seconds: 3
                - wait2:
                    wait:
                      seconds: 2
          # Another single step child workflow - this will be implicitly wrapped in a Do task
          - callDoctor:
              call: http
              export:
                as: callDoctor
              with:
                method: get
                endpoint: https://jsonplaceholder.typicode.com/users/3
```

This will output an object similar to this, with the workflow data under the
`raiseAlarm` key:

```json
{
  "raiseAlarm": {
    "callDoctor": {
      // The workflow's data
    },
    "callNurse": {
      // The workflow's data
    }
  }
}
```

### Competing Fork

This will return the fastest returning workflow only. Simply change `compete: false`
to `compete: true`. The data will look similar to this:

```json
{
  "raiseAlarm": {
    // The workflow's data
  }
}
```

Unlike the non-competing version, the `raiseAlarm` object will *ONLY* contain
the data of the winning fork. All the other workflows will be cancelled and any
data generated will be discarded.
