---
sidebar_position: 1
sidebar_label: Introduction
---
# What Are Tasks?

A task within a workflow represents a discrete unit of work that contributes to
achieving the overall objectives defined by the workflow.

It encapsulates a specific action or set of actions that need to be executed in
a predefined order to advance the workflow towards its completion.

Tasks are designed to be modular and focused, each serving a distinct purpose
within the broader context of the workflow.

By breaking down the workflow into manageable tasks, organizations can effectively
coordinate and track progress, enabling efficient collaboration and ensuring that
work is completed in a structured and organized manner.

In Temporal, a task may add logic to:
* **the workflow**: this is a deterministic piece of logic which helps progress
  the flow of data.
* **an [activity](https://docs.temporal.io/activities)**: this executes a single,
  well-defined action, such as making an HTTP call, and may be non-deterministic.

## Available Tasks

| Name | Description |
|:--|:---|
| [Call](./call) | Enables the execution of a specified function within a workflow, allowing seamless integration with custom business logic or external services. |
| [Do](./do) | Serves as a fundamental building block within workflows, enabling the sequential execution of multiple subtasks. By defining a series of subtasks to perform in sequence, the Do task facilitates the efficient execution of complex operations, ensuring that each subtask is completed before the next one begins. |
| [For](./for) | Allows workflows to iterate over a collection of items, executing a defined set of subtasks for each item in the collection. This task type is instrumental in handling scenarios such as batch processing, data transformation, and repetitive operations across datasets. |
| [Fork](./fork) | Allows workflows to execute multiple subtasks concurrently, enabling parallel processing and improving the overall efficiency of the workflow. By defining a set of subtasks to perform concurrently, the Fork task facilitates the execution of complex operations in parallel, ensuring that multiple tasks can be executed simultaneously. |
| [Listen](./listen) | Provides a mechanism for workflows to await and react to external events, enabling event-driven behavior within workflow systems. |
| [Raise](./raise) | Intentionally triggers and propagates errors. By employing the "Raise" task, workflows can deliberately generate error conditions, allowing for explicit error handling and fault management strategies to be implemented. |
| [Run](./run) | Provides the capability to execute external containers, shell commands, scripts, or workflows. |
| [Set](./set) | A task used to set data. |
| [Switch](./switch) | Enables conditional branching within workflows, allowing them to dynamically select different paths based on specified conditions or criteria |
| [Try](./try) | Serves as a mechanism within workflows to handle errors gracefully, potentially retrying failed tasks before proceeding with alternate ones. |
| [Wait](./wait) | Allows workflows to pause or delay their execution for a specified period of time. |

## Runtime Expressions

:::tip
Runtime expressions use the format for [jq](https://jqlang.org/), wrapped in `${}`
:::

Runtime expressions serve as dynamic elements that enable flexible and adaptable
workflow behaviors. These expressions provide a means to evaluate conditions,
transform data, and make decisions during the execution of workflows.

### Variables

Variables

| Name | Description | Example |
|:--|:---|:---|
| `data` | Data set to the workflow's state - see [data](#data) | `${ .data.someData }` |
| `env` | Any environment variable prefixed with `ZIGFLOW_`. The prefix is _NOT_ used in this object | `${ .env.EXAMPLE_ENVVAR }` |
| `input` | Any input received when the workflow was triggered | `${ .input.val1 }` |
| `output` | Any output exported from a task - see [output](#output) | `${ .output.output }` |

### Data

The `data` object also receives the workflow and activity info.

#### Workflow

This can be accessed from `${ .data.workflow }`.

* attempt
* binary_checksum
* continued_execution_run_id
* cron_schedule
* first_run_id
* namespace
* original_run_id
* parent_workflow_namespace
* priority_key
* task_queue_name
* workflow_execution_id
* workflow_execution_run_id
* workflow_execution_timeout
* workflow_start_time
* workflow_type_name

#### Activity

This can be accessed from `${ .data.activity }`. Ideally, this should be avoided
as Zigflow does not allow specific targeting of an activity.

* activity_id
* activity_type_name
* attempt
* deadline
* heartbeat_token
* is_local_activity
* priority_key
* schedule_to_close_timeout
* scheduled_time
* start_to_close_timeout
* started_time
* task_queue
* task_token
* workflow_namespace
* workflow_execution_id
* workflow_execution_run_id

### Output

The `${ .output }` object receives any data that is output. Output is only set
if you set the `export.as` property. For example:

```yaml
- setData:
    export:
      as: data
    set:
      hello: world
```

This will set `${ .output.data }` to `{ "hello": "world" }`.

## Flow Directive

Flow Directives are commands within a workflow that dictate its progression.

| Directive | Description |
| --------- | ----------- |
| `"continue"` | Instructs the workflow to proceed with the next task in line. This action may conclude the execution of a particular workflow or branch if there are not task defined after the continue one. |
| `"exit"` | Completes the current scope's execution, potentially terminating the entire workflow if the current task resides within the main `do` scope. |
| `"end"` | Provides a graceful conclusion to the workflow execution, signaling its completion explicitly. |
| `string` | Continues the workflow at the task with the specified name. |

:::warning
Flow directives may only redirect to tasks declared within their own scope. In
other words, they cannot target tasks at a different depth.
:::
