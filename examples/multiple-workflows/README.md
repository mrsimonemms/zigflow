# Multiple Workflows

Configure multiple workflows

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
    subgraph wf_workflow1["workflow1"]
        direction TB
        wf_workflow1__start([Start])
        wf_workflow1__end([End])
        workflow1_wait["WAIT (wait)"]
        wf_workflow1__start --> workflow1_wait
        workflow1_getUser["CALL_HTTP (getUser)"]
        workflow1_wait --> workflow1_getUser
        workflow1_getUser --> wf_workflow1__end
    end
    subgraph wf_workflow2["workflow2"]
        direction TB
        wf_workflow2__start([Start])
        wf_workflow2__end([End])
        workflow2_wait["WAIT (wait)"]
        wf_workflow2__start --> workflow2_wait
        workflow2_getUser["CALL_HTTP (getUser)"]
        workflow2_wait --> workflow2_getUser
        workflow2_getUser --> wf_workflow2__end
    end
```
<!-- ZIGFLOW_GRAPH_END -->
