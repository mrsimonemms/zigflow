# TypeScript

The [basic example](../basic/), but in TypeScript

<!-- toc -->

* [Getting started](#getting-started)
* [Diagram](#diagram)

<!-- Regenerate with "pre-commit run -a markdown-toc" -->

<!-- tocstop -->

## Getting started

```sh
npm run dev
```

This will trigger the workflow with some input data and print everything to the
console.

## Diagram

<!-- ZIGFLOW_GRAPH_START -->
```mermaid
flowchart TD
    basic_typescript__start([Start])
    basic_typescript__end([End])
    basic_typescript_baseData["SET (baseData)"]
    basic_typescript__start --> basic_typescript_baseData
    basic_typescript_wait["WAIT (wait)"]
    basic_typescript_baseData --> basic_typescript_wait
    basic_typescript_getUser["CALL_HTTP (getUser)"]
    basic_typescript_wait --> basic_typescript_getUser
    basic_typescript_raiseAlarm["FORK (raiseAlarm)"]
    basic_typescript_raiseAlarm__join((" "))
    subgraph fork_basic_typescript_callNurse["callNurse"]
        direction TB
        basic_typescript_callNurse__start([ ])
        basic_typescript_callNurse__end([ ])
        basic_typescript_callNurse__start --> basic_typescript_callNurse__end
    end
    basic_typescript_raiseAlarm --> basic_typescript_callNurse__start
    basic_typescript_callNurse__end --> basic_typescript_raiseAlarm__join
    subgraph fork_basic_typescript_multiStep["multiStep"]
        direction TB
        basic_typescript_multiStep__start([ ])
        basic_typescript_multiStep__end([ ])
        basic_typescript_multiStep_wait1["WAIT (wait1)"]
        basic_typescript_multiStep__start --> basic_typescript_multiStep_wait1
        basic_typescript_multiStep_wait2["WAIT (wait2)"]
        basic_typescript_multiStep_wait1 --> basic_typescript_multiStep_wait2
        basic_typescript_multiStep_wait2 --> basic_typescript_multiStep__end
    end
    basic_typescript_raiseAlarm --> basic_typescript_multiStep__start
    basic_typescript_multiStep__end --> basic_typescript_raiseAlarm__join
    subgraph fork_basic_typescript_callDoctor["callDoctor"]
        direction TB
        basic_typescript_callDoctor__start([ ])
        basic_typescript_callDoctor__end([ ])
        basic_typescript_callDoctor__start --> basic_typescript_callDoctor__end
    end
    basic_typescript_raiseAlarm --> basic_typescript_callDoctor__start
    basic_typescript_callDoctor__end --> basic_typescript_raiseAlarm__join
    basic_typescript_getUser --> basic_typescript_raiseAlarm
    basic_typescript_raiseAlarm__join --> basic_typescript__end
```
<!-- ZIGFLOW_GRAPH_END -->
