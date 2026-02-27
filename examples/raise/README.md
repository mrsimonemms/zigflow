# Raise

Raise an error

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
    raise__start([Start])
    raise__end([End])
    raise_wait["WAIT (wait)"]
    raise__start --> raise_wait
    raise_error["RAISE (error)"]
    raise_wait --> raise_error
    raise_error --> raise__end
```
<!-- ZIGFLOW_GRAPH_END -->
