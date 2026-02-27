# Search Attributes

Add custom search attributes to your application

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
    searchAttributes__start([Start])
    searchAttributes__end([End])
    searchAttributes_wait["WAIT (wait)"]
    searchAttributes__start --> searchAttributes_wait
    searchAttributes_getUser["CALL_HTTP (getUser)"]
    searchAttributes_wait --> searchAttributes_getUser
    searchAttributes_wait_2["WAIT (wait)"]
    searchAttributes_getUser --> searchAttributes_wait_2
    searchAttributes_wait_2 --> searchAttributes__end
```
<!-- ZIGFLOW_GRAPH_END -->
