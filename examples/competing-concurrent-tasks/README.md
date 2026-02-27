# Competing Concurrent Tasks

Have two tasks competing and the first to finish wins

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
    competing_tasks__start([Start])
    competing_tasks__end([End])
    competing_tasks_state["SET (state)"]
    competing_tasks__start --> competing_tasks_state
    competing_tasks_wait["WAIT (wait)"]
    competing_tasks_state --> competing_tasks_wait
    competing_tasks_race["FORK (race) 🏁"]
    competing_tasks_race__join((" "))
    subgraph fork_competing_tasks_task1["task1"]
        direction TB
        competing_tasks_task1__start([ ])
        competing_tasks_task1__end([ ])
        competing_tasks_task1_getUser["CALL_HTTP (getUser)"]
        competing_tasks_task1__start --> competing_tasks_task1_getUser
        competing_tasks_task1_wait["WAIT (wait)"]
        competing_tasks_task1_getUser --> competing_tasks_task1_wait
        competing_tasks_task1_set["SET (set)"]
        competing_tasks_task1_wait --> competing_tasks_task1_set
        competing_tasks_task1_set --> competing_tasks_task1__end
    end
    competing_tasks_race --> competing_tasks_task1__start
    competing_tasks_task1__end --> competing_tasks_race__join
    subgraph fork_competing_tasks_task2["task2"]
        direction TB
        competing_tasks_task2__start([ ])
        competing_tasks_task2__end([ ])
        competing_tasks_task2_getUser["CALL_HTTP (getUser)"]
        competing_tasks_task2__start --> competing_tasks_task2_getUser
        competing_tasks_task2_wait["WAIT (wait)"]
        competing_tasks_task2_getUser --> competing_tasks_task2_wait
        competing_tasks_task2_set["SET (set)"]
        competing_tasks_task2_wait --> competing_tasks_task2_set
        competing_tasks_task2_set --> competing_tasks_task2__end
    end
    competing_tasks_race --> competing_tasks_task2__start
    competing_tasks_task2__end --> competing_tasks_race__join
    competing_tasks_wait --> competing_tasks_race
    competing_tasks_wait_2["WAIT (wait)"]
    competing_tasks_race__join --> competing_tasks_wait_2
    competing_tasks_set["SET (set)"]
    competing_tasks_wait_2 --> competing_tasks_set
    competing_tasks_set --> competing_tasks__end
```
<!-- ZIGFLOW_GRAPH_END -->
