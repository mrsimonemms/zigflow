# For Loops

An example of how to use the for loop task

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
    try_catch__start([Start])
    try_catch__end([End])
    subgraph try_user["TRY (user)"]
        direction TB
        try_catch_user_try__start([ ])
        try_catch_user_try__end([ ])
        try_catch_user_try_getUser["CALL_HTTP (getUser)"]
        try_catch_user_try__start --> try_catch_user_try_getUser
        try_catch_user_try_getUser --> try_catch_user_try__end
    end
    subgraph catch_user["CATCH (user)"]
        direction TB
        try_catch_user_catch__start([ ])
        try_catch_user_catch__end([ ])
        try_catch_user_catch_setError["SET (setError)"]
        try_catch_user_catch__start --> try_catch_user_catch_setError
        try_catch_user_catch_setError --> try_catch_user_catch__end
    end
    try_catch_user_try__end -.->|"on error"| try_catch_user_catch__start
    try_catch__start --> try_catch_user_try__start
    try_catch_user_try__end --> try_catch__end
```
<!-- ZIGFLOW_GRAPH_END -->
