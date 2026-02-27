# Child Workflows

Execute a child workflow

<!-- toc -->

* [Getting started](#getting-started)
* [Diagram](#diagram)

<!-- Regenerate with "pre-commit run -a markdown-toc" -->

<!-- tocstop -->

## Getting started

```sh
go run .
```

This will trigger the workflow with some input data and print everything to the
console.

## Diagram

<!-- ZIGFLOW_GRAPH_START -->
```mermaid
flowchart TD
    subgraph wf_parentWorkflow["parentWorkflow"]
        direction TB
        wf_parentWorkflow__start([Start])
        wf_parentWorkflow__end([End])
        parentWorkflow_wait["WAIT (wait)"]
        wf_parentWorkflow__start --> parentWorkflow_wait
        parentWorkflow_callChildWorkflow1["RUN (callChildWorkflow1)"]
        parentWorkflow_wait --> parentWorkflow_callChildWorkflow1
        parentWorkflow_fanOut["FORK (fanOut)"]
        parentWorkflow_fanOut__join((" "))
        subgraph fork_parentWorkflow_callWorkflow1["callWorkflow1"]
            direction TB
            parentWorkflow_callWorkflow1__start([ ])
            parentWorkflow_callWorkflow1__end([ ])
            parentWorkflow_callWorkflow1__start --> parentWorkflow_callWorkflow1__end
        end
        parentWorkflow_fanOut --> parentWorkflow_callWorkflow1__start
        parentWorkflow_callWorkflow1__end --> parentWorkflow_fanOut__join
        subgraph fork_parentWorkflow_callWorkflow2["callWorkflow2"]
            direction TB
            parentWorkflow_callWorkflow2__start([ ])
            parentWorkflow_callWorkflow2__end([ ])
            parentWorkflow_callWorkflow2__start --> parentWorkflow_callWorkflow2__end
        end
        parentWorkflow_fanOut --> parentWorkflow_callWorkflow2__start
        parentWorkflow_callWorkflow2__end --> parentWorkflow_fanOut__join
        parentWorkflow_callChildWorkflow1 --> parentWorkflow_fanOut
        parentWorkflow_wait_2["WAIT (wait)"]
        parentWorkflow_fanOut__join --> parentWorkflow_wait_2
        parentWorkflow_wait_2 --> wf_parentWorkflow__end
    end
    subgraph wf_child_workflow1["child-workflow1"]
        direction TB
        wf_child_workflow1__start([Start])
        wf_child_workflow1__end([End])
        child_workflow1_wait["WAIT (wait)"]
        wf_child_workflow1__start --> child_workflow1_wait
        child_workflow1_wait --> wf_child_workflow1__end
    end
    subgraph wf_child_workflow2["child-workflow2"]
        direction TB
        wf_child_workflow2__start([Start])
        wf_child_workflow2__end([End])
        child_workflow2_wait["WAIT (wait)"]
        wf_child_workflow2__start --> child_workflow2_wait
        child_workflow2_wait --> wf_child_workflow2__end
    end
```
<!-- ZIGFLOW_GRAPH_END -->
