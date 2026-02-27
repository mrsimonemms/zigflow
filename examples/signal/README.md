# Signal

Configure signal listener

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
    signal__start([Start])
    signal__end([End])
    signal_approveListener["LISTEN (approveListener)"]
    signal__start --> signal_approveListener
    signal_outputSignal["SET (outputSignal)"]
    signal_approveListener --> signal_outputSignal
    signal_wait["WAIT (wait)"]
    signal_outputSignal --> signal_wait
    signal_wait --> signal__end
```
<!-- ZIGFLOW_GRAPH_END -->
