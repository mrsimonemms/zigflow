# Query

Configure query listener

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
    query__start([Start])
    query__end([End])
    query_queryState["LISTEN (queryState)"]
    query__start --> query_queryState
    query_createState["SET (createState)"]
    query_queryState --> query_createState
    query_wait["WAIT (wait)"]
    query_createState --> query_wait
    query_updateState["SET (updateState)"]
    query_wait --> query_updateState
    query_wait_2["WAIT (wait)"]
    query_updateState --> query_wait_2
    query_updateState_2["SET (updateState)"]
    query_wait_2 --> query_updateState_2
    query_wait_3["WAIT (wait)"]
    query_updateState_2 --> query_wait_3
    query_stateComplete["SET (stateComplete)"]
    query_wait_3 --> query_stateComplete
    query_wait_4["WAIT (wait)"]
    query_stateComplete --> query_wait_4
    query_wait_4 --> query__end
```
<!-- ZIGFLOW_GRAPH_END -->
