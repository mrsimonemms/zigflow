# Schedules

How to set a schedule

<!-- toc -->

* [Getting started](#getting-started)
* [Diagram](#diagram)

<!-- Regenerate with "pre-commit run -a markdown-toc" -->

<!-- tocstop -->

## Getting started

No trigger is configured. See the Schedules section in the Temporal UI

## Diagram

<!-- ZIGFLOW_GRAPH_START -->
```mermaid
flowchart TD
    schedule__start([Start])
    schedule__end([End])
    schedule_wait["WAIT (wait)"]
    schedule__start --> schedule_wait
    schedule_wait --> schedule__end
```
<!-- ZIGFLOW_GRAPH_END -->
