# Conditionally Execute

Allow tasks to only execute if they meet certain conditions

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
    conditional__start([Start])
    conditional__end([End])
    conditional_waitIfEven["WAIT (waitIfEven) [?]"]
    conditional__start --> conditional_waitIfEven
    conditional_waitIfOdd["WAIT (waitIfOdd) [?]"]
    conditional_waitIfEven --> conditional_waitIfOdd
    conditional_wait["WAIT (wait)"]
    conditional_waitIfOdd --> conditional_wait
    conditional_wait --> conditional__end
```
<!-- ZIGFLOW_GRAPH_END -->
