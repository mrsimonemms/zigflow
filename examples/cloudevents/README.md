# CloudEvents

An example of how to use [CloudEvents](https://cloudevents.io) for debugging workflows

<!-- toc -->

* [Getting started](#getting-started)
  * [Running the workflow](#running-the-workflow)
  * [Starting the workflow](#starting-the-workflow)
    * [http](#http)
    * [file](#file)
* [Diagram](#diagram)

<!-- Regenerate with "pre-commit run -a markdown-toc" -->

<!-- tocstop -->

## Getting started

### Running the workflow

```sh
docker compose up workflow
```

### Starting the workflow

```sh
docker compose up trigger
```

This will trigger the workflow with some input data and print everything to the
console.

There are two CloudEvents (`http` and `file`) configured in the `cloudevents.yaml`
file which will send events to the relevant listeners.

#### http

This can be observed by running:

```sh
docker compose logs -f http
```

#### file

This will save all the workflow events to a file inside `./tmp`. The file name
will be in the format `<workflowID>.yaml` and the data will be appended to each
file.

## Diagram

<!-- ZIGFLOW_GRAPH_START -->
```mermaid
flowchart TD
    cloudevents__start([Start])
    cloudevents__end([End])
    cloudevents_baseData["SET (baseData)"]
    cloudevents__start --> cloudevents_baseData
    cloudevents_wait["WAIT (wait)"]
    cloudevents_baseData --> cloudevents_wait
    cloudevents_getUser["CALL_HTTP (getUser)"]
    cloudevents_wait --> cloudevents_getUser
    cloudevents_raiseAlarm["FORK (raiseAlarm)"]
    cloudevents_raiseAlarm__join((" "))
    subgraph fork_cloudevents_callNurse["callNurse"]
        direction TB
        cloudevents_callNurse__start([ ])
        cloudevents_callNurse__end([ ])
        cloudevents_callNurse__start --> cloudevents_callNurse__end
    end
    cloudevents_raiseAlarm --> cloudevents_callNurse__start
    cloudevents_callNurse__end --> cloudevents_raiseAlarm__join
    subgraph fork_cloudevents_multiStep["multiStep"]
        direction TB
        cloudevents_multiStep__start([ ])
        cloudevents_multiStep__end([ ])
        cloudevents_multiStep_wait1["WAIT (wait1)"]
        cloudevents_multiStep__start --> cloudevents_multiStep_wait1
        cloudevents_multiStep_wait2["WAIT (wait2)"]
        cloudevents_multiStep_wait1 --> cloudevents_multiStep_wait2
        cloudevents_multiStep_wait2 --> cloudevents_multiStep__end
    end
    cloudevents_raiseAlarm --> cloudevents_multiStep__start
    cloudevents_multiStep__end --> cloudevents_raiseAlarm__join
    subgraph fork_cloudevents_callDoctor["callDoctor"]
        direction TB
        cloudevents_callDoctor__start([ ])
        cloudevents_callDoctor__end([ ])
        cloudevents_callDoctor__start --> cloudevents_callDoctor__end
    end
    cloudevents_raiseAlarm --> cloudevents_callDoctor__start
    cloudevents_callDoctor__end --> cloudevents_raiseAlarm__join
    cloudevents_getUser --> cloudevents_raiseAlarm
    cloudevents_raiseAlarm__join --> cloudevents__end
```
<!-- ZIGFLOW_GRAPH_END -->
