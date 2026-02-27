# Listen

Configure listeners

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
    updates__start([Start])
    updates__end([End])
    updates_callDoctor["LISTEN (callDoctor)"]
    updates__start --> updates_callDoctor
    updates_wait["WAIT (wait)"]
    updates_callDoctor --> updates_wait
    updates_wait --> updates__end
```
<!-- ZIGFLOW_GRAPH_END -->
